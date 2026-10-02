import { Router } from "express";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaff, isAdmin } from "@/lib/api-auth";
import { computeAdminRoster } from "@/lib/admin-roster";
import { DELIVERY_MODE_LABEL, mapAdminCourse } from "@/lib/lms-mappers";
import { createNotification } from "@/lib/notifications";
import { creditReferralIfEligible } from "@/lib/referrals";
import { sendWhatsAppMessage } from "@/lib/twilio";
import type { AnalyticsSummary } from "@/types/lms";

const router = Router();

router.get("/analytics", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const [roster, courses, cohort, certificatesIssued, scans, homePageViews, signupPageViews] = await Promise.all([
    computeAdminRoster(),
    prisma.course.findMany({ include: { enrollments: true } }),
    prisma.cohort.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.certificate.count(),
    prisma.qrScan.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.pageView.count({ where: { page: "home" } }),
    prisma.pageView.count({ where: { page: "subscriptions" } })
  ]);

  const totalStudents = roster.length;
  const totalRevenue = roster.reduce((sum, s) => sum + s.amountPaid, 0);
  const completionRate =
    totalStudents === 0
      ? 0
      : Math.round((roster.filter((s) => s.progressPercent === 100).length / totalStudents) * 100);

  const trackDistribution = courses
    .filter((c) => c.enrollments.length > 0)
    .map((c) => ({
      track: c.title,
      count: c.enrollments.length,
      revenue: c.enrollments.reduce((sum, e) => sum + e.amountPaid, 0),
      color: c.color
    }));

  const deliveryCounts = new Map<string, number>();
  for (const s of roster) {
    deliveryCounts.set(s.deliveryMode, (deliveryCounts.get(s.deliveryMode) || 0) + 1);
  }
  const deliveryDistribution = Object.values(DELIVERY_MODE_LABEL)
    .filter((mode, idx, arr) => arr.indexOf(mode) === idx)
    .map((mode) => {
      const count = deliveryCounts.get(mode) || 0;
      return { mode, count, percentage: totalStudents === 0 ? 0 : Math.round((count / totalStudents) * 100) };
    })
    .filter((d) => d.count > 0);

  const registrationsBySource = new Map<string, { count: number; revenue: number }>();
  for (const s of roster) {
    const entry = registrationsBySource.get(s.qrSource) || { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += s.amountPaid;
    registrationsBySource.set(s.qrSource, entry);
  }
  const scansBySource = new Map(scans.map((s) => [s.source, s._count._all]));
  const allSources = new Set([...registrationsBySource.keys(), ...scansBySource.keys()]);
  const bannerChannelYield = [...allSources].map((source) => {
    const reg = registrationsBySource.get(source) || { count: 0, revenue: 0 };
    const scanCount = scansBySource.get(source) || 0;
    return {
      source,
      location: source,
      scans: scanCount,
      registrations: reg.count,
      revenue: reg.revenue,
      conversionRate: scanCount === 0 ? 0 : Math.round((reg.count / scanCount) * 1000) / 10
    };
  });

  const summary: AnalyticsSummary = {
    totalStudents,
    targetStudents: cohort?.targetStudents ?? 0,
    totalRevenue,
    targetRevenue: cohort?.targetRevenue ?? 0,
    completionRate,
    certificatesIssued,
    trackDistribution,
    deliveryDistribution,
    bannerChannelYield,
    estimatedAdViews: cohort?.estimatedAdViews ?? 0,
    homePageViews,
    signupPageViews
  };

  return res.json(summary);
});

// Admin-only — these are marketing-funnel targets/estimates (PRD §4.1),
// not something a non-admin instructor should be adjusting.
router.patch("/cohort", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const cohort = await prisma.cohort.findFirst({ orderBy: { createdAt: "desc" } });
  if (!cohort) {
    return res.status(404).json({ error: "No cohort exists yet." });
  }

  const body = req.body ?? {};
  const fields: Record<string, number> = {};
  for (const key of ["targetStudents", "targetRevenue", "estimatedAdViews"] as const) {
    if (body[key] !== undefined) {
      const value = Number(body[key]);
      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({ error: `${key} must be a non-negative number.` });
      }
      fields[key] = value;
    }
  }

  const updated = await prisma.cohort.update({ where: { id: cohort.id }, data: fields });
  return res.json({ cohort: updated });
});

router.get("/roster", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }
  const roster = await computeAdminRoster();
  return res.json({ roster });
});

// The real "who has paid" record — every PaymentTransaction row, Paystack
// or bank, regardless of what an Enrollment's current running total says.
// This is the ledger the Earnings tab reads from instead of placeholder data.
router.get("/payment-ledger", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const transactions = await prisma.paymentTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } }
    }
  });

  return res.json({
    transactions: transactions.map((t) => ({
      id: t.id,
      reference: t.reference,
      studentName: t.user.name,
      studentEmail: t.user.email,
      courseTitle: t.course.title,
      paymentPlan: t.paymentPlan,
      amount: t.amount,
      status: t.status,
      channel: t.channel,
      gatewayResponse: t.gatewayResponse,
      paidAt: t.paidAt ? t.paidAt.toISOString() : null,
      createdAt: t.createdAt.toISOString()
    }))
  });
});

// The PRD's "job-help list" (§6.2) and second revenue stream (§3.4) — a
// row exists here automatically for every student who's earned a
// Certificate (see ensurePlacementSeeking in POST /submissions/:id/grade).
router.get("/placements", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const placements = await prisma.jobPlacement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } }
    }
  });

  return res.json({
    placements: placements.map((p) => ({
      id: p.id,
      studentName: p.user.name,
      studentEmail: p.user.email,
      courseTitle: p.course.title,
      status: p.status,
      placementType: p.placementType,
      employerName: p.employerName,
      hiredAt: p.hiredAt ? p.hiredAt.toISOString() : null,
      feeAmount: p.feeAmount,
      feeStatus: p.feeStatus,
      notes: p.notes,
      createdAt: p.createdAt.toISOString()
    }))
  });
});

// Admin-only (not just staff) — matches the existing bar for financial
// actions like POST /enrollments/:id/payment, since this records revenue
// (a partner's placement fee) in addition to pipeline status.
router.patch("/placements/:id", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  const body = req.body ?? {};

  const status = ["SEEKING", "INTRODUCED", "HIRED"].includes(body.status) ? body.status : undefined;
  const placementType =
    body.placementType === "BEMS_INTERNAL" || body.placementType === "PARTNER"
      ? body.placementType
      : body.placementType === null
      ? null
      : undefined;
  const employerName = typeof body.employerName === "string" ? body.employerName.trim() : undefined;
  const hiredAt = typeof body.hiredAt === "string" && body.hiredAt ? new Date(body.hiredAt) : body.hiredAt === null ? null : undefined;
  const feeAmount =
    body.feeAmount === null ? null : Number.isFinite(Number(body.feeAmount)) && body.feeAmount !== undefined ? Number(body.feeAmount) : undefined;
  const feeStatus = ["NONE", "INVOICED", "PAID"].includes(body.feeStatus) ? body.feeStatus : undefined;
  const notes = typeof body.notes === "string" ? body.notes : undefined;

  if (feeAmount !== undefined && feeAmount !== null && feeAmount < 0) {
    return res.status(400).json({ error: "feeAmount must be a non-negative number." });
  }

  const existing = await prisma.jobPlacement.findUnique({
    where: { id },
    include: { course: { select: { title: true } } }
  });
  if (!existing) {
    return res.status(404).json({ error: "Placement not found." });
  }

  const placement = await prisma.jobPlacement.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(placementType !== undefined ? { placementType } : {}),
      ...(employerName !== undefined ? { employerName } : {}),
      ...(hiredAt !== undefined ? { hiredAt } : {}),
      ...(feeAmount !== undefined ? { feeAmount } : {}),
      ...(feeStatus !== undefined ? { feeStatus } : {}),
      ...(notes !== undefined ? { notes } : {})
    }
  });

  if (status === "HIRED" && existing.status !== "HIRED") {
    await createNotification({
      userId: existing.userId,
      title: "You've been marked as hired!",
      message: `Congratulations on your placement${employerName ? ` with ${employerName}` : ""} for ${existing.course.title}. BEMS Admissions will follow up with next steps.`,
      category: "GRADING",
      linkUrl: "/dashboard"
    });
  }

  return res.json({ placement });
});

// PRD §4.1 step 3 — staff work the lead queue the "register interest" form
// feeds (POST /lms/register-interest). Not financial, so staff (not just
// admin) can read and update, matching the attendance/notification bar.
router.get("/leads", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { course: { select: { title: true } } }
  });

  return res.json({
    leads: leads.map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      courseTitle: l.course?.title ?? null,
      source: l.source,
      status: l.status,
      notes: l.notes,
      createdAt: l.createdAt.toISOString()
    }))
  });
});

router.patch("/leads/:id", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const { id } = req.params;
  const body = req.body ?? {};
  const status = ["NEW", "CONTACTED", "CONVERTED", "DROPPED"].includes(body.status) ? body.status : undefined;
  const notes = typeof body.notes === "string" ? body.notes : undefined;

  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Lead not found." });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(notes !== undefined ? { notes } : {})
    }
  });

  return res.json({ lead });
});

// PRD §4.1 step 5 / §6.2 — every enrollment needs a welcome call booked
// before class starts; a no-show gets a personal WhatsApp follow-up (the
// admin UI builds a wa.me link from the student's phone for that, since
// there's no WhatsApp Business API wired up to send it automatically).
router.get("/welcome-calls", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { welcomeCallStatus: { not: "COMPLETED" } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, phone: true } }, course: { select: { title: true } } }
  });

  return res.json({
    enrollments: enrollments.map((e) => ({
      id: e.id,
      studentName: e.user.name,
      studentEmail: e.user.email,
      studentPhone: e.user.phone,
      courseTitle: e.course.title,
      welcomeCallStatus: e.welcomeCallStatus,
      welcomeCallAt: e.welcomeCallAt ? e.welcomeCallAt.toISOString() : null,
      enrolledAt: e.createdAt.toISOString()
    }))
  });
});

router.patch("/enrollments/:id/welcome-call", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const { id } = req.params;
  const body = req.body ?? {};
  const status = ["NOT_SCHEDULED", "SCHEDULED", "COMPLETED", "NO_SHOW"].includes(body.welcomeCallStatus)
    ? body.welcomeCallStatus
    : undefined;
  const welcomeCallAt =
    typeof body.welcomeCallAt === "string" && body.welcomeCallAt ? new Date(body.welcomeCallAt) : body.welcomeCallAt === null ? null : undefined;

  if (!status && welcomeCallAt === undefined) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { id },
    include: { user: { select: { name: true, phone: true } }, course: { select: { title: true } } }
  });
  if (!existing) {
    return res.status(404).json({ error: "Enrollment not found." });
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: {
      ...(status !== undefined ? { welcomeCallStatus: status } : {}),
      ...(welcomeCallAt !== undefined ? { welcomeCallAt } : {})
    }
  });

  // PRD §6.2: "Anyone who doesn't show gets a personal WhatsApp message" —
  // sent the moment staff marks it, not a separate manual step. Best-effort;
  // whatsappSent tells the admin UI whether to fall back to a manual
  // click-to-WhatsApp link.
  let whatsappSent: boolean | undefined;
  if (status === "NO_SHOW" && existing.welcomeCallStatus !== "NO_SHOW" && existing.user.phone) {
    const result = await sendWhatsAppMessage(
      existing.user.phone,
      `Hi ${existing.user.name.split(" ")[0]}, we noticed you missed your welcome call for ${existing.course.title}. ` +
        `We're here to help you catch up — when's a good time to reschedule?`
    );
    whatsappSent = result.ok;
  }

  return res.json({ enrollment, whatsappSent });
});

router.get("/courses", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const courses = await prisma.course.findMany({
    include: {
      modules: { include: { lessons: { select: { id: true } } } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json({ courses: courses.map(mapAdminCourse) });
});

// Admin only: create a new course/workshop listing. Modules/lessons/quiz/
// assignment content is added separately — this just registers the course.
router.post("/courses", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const body = req.body ?? {};
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const tutor = typeof body.tutor === "string" ? body.tutor.trim() : "";
  const tutorRole = typeof body.tutorRole === "string" ? body.tutorRole.trim() : "";
  const badge = typeof body.badge === "string" ? body.badge.trim() : "New Track";
  const schedule = typeof body.schedule === "string" ? body.schedule.trim() : "";
  const delivery = typeof body.delivery === "string" ? body.delivery.trim() : "";
  const priceFull = Number(body.priceFull) || 0;
  const priceParts = Number(body.priceParts) || priceFull;
  const deposit = Number(body.deposit) || 0;

  if (!title || !slug || !tutor) {
    return res.status(400).json({ error: "title, slug, and tutor are required." });
  }
  if (priceFull < 0 || priceParts < 0 || deposit < 0) {
    return res.status(400).json({ error: "priceFull, priceParts, and deposit must not be negative." });
  }

  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) {
    return res.status(409).json({ error: "A course with that slug already exists." });
  }

  const course = await prisma.course.create({
    data: {
      slug,
      title,
      tutor,
      tutorRole,
      badge,
      schedule,
      delivery,
      duration: "3 Months",
      tagline: title,
      priceFull,
      priceParts,
      deposit,
      finalProject: "Capstone project (details to be added)",
      status: "UPCOMING"
    },
    include: {
      modules: { include: { lessons: { select: { id: true } } } },
      _count: { select: { enrollments: true } }
    }
  });

  return res.json({ course: mapAdminCourse(course) });
});

router.post("/courses/:id/status", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  const status = req.body?.status;
  if (status !== "ACTIVE" && status !== "UPCOMING" && status !== "ARCHIVED") {
    return res.status(400).json({ error: "status must be ACTIVE, UPCOMING, or ARCHIVED." });
  }

  const course = await prisma.course.update({
    where: { id },
    data: { status },
    include: {
      modules: { include: { lessons: { select: { id: true } } } },
      _count: { select: { enrollments: true } }
    }
  });

  return res.json({ course: mapAdminCourse(course) });
});

router.post("/enrollments/:id/payment", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  const status = req.body?.status;
  const amountPaid = Number(req.body?.amountPaid);

  if (status !== "PAID_FULL" && status !== "PARTIAL") {
    return res.status(400).json({ error: "status must be PAID_FULL or PARTIAL." });
  }
  if (!Number.isFinite(amountPaid) || amountPaid < 0) {
    return res.status(400).json({ error: "amountPaid must be a non-negative number." });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { id },
    select: { totalDue: true, amountPaid: true, userId: true, courseId: true, paymentPlan: true, paymentReference: true }
  });
  if (!existing) {
    return res.status(404).json({ error: "Enrollment not found." });
  }
  // A status has to actually match the amount — without this, a call could
  // set PAID_FULL with amountPaid: 0 and downstream logic (the "you're paid
  // up" notification below, referral crediting) would treat it as real money
  // that never moved.
  if (status === "PAID_FULL" && amountPaid < existing.totalDue) {
    return res.status(400).json({
      error: `amountPaid (₦${amountPaid.toLocaleString()}) is less than the total due (₦${existing.totalDue.toLocaleString()}) for PAID_FULL.`
    });
  }
  if (status === "PARTIAL" && amountPaid <= 0) {
    return res.status(400).json({ error: "amountPaid must be greater than 0 for a PARTIAL payment." });
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { paymentStatus: status, amountPaid },
    include: { course: { select: { title: true, slug: true } } }
  });

  // Mirrors a staff-confirmed bank transfer into the same ledger Paystack
  // charges write to, so the ledger is the complete payment history
  // regardless of channel — not just a Paystack-only audit trail.
  const delta = amountPaid - existing.amountPaid;
  if (delta > 0) {
    await prisma.paymentTransaction.create({
      data: {
        reference: `bank_${crypto.randomUUID().replace(/-/g, "")}`,
        userId: existing.userId,
        courseId: existing.courseId,
        paymentPlan: existing.paymentPlan,
        amount: delta,
        status: "SUCCESS",
        channel: "bank",
        gatewayResponse: existing.paymentReference
          ? `Confirmed manually by staff. Student-provided reference: "${existing.paymentReference}".`
          : `Confirmed manually by staff (no reference was recorded at checkout).`,
        paidAt: new Date()
      }
    });
  }

  await createNotification({
    userId: enrollment.userId,
    title: `Payment Confirmed: ${enrollment.course.title}`,
    message: `BEMS Admissions verified ₦${amountPaid.toLocaleString()} (${status === "PAID_FULL" ? "Paid in Full" : "Installment Deposit"}).`,
    category: "PAYMENT",
    linkUrl: "/dashboard"
  });

  if (amountPaid > 0) {
    await creditReferralIfEligible(enrollment.userId);
  }

  return res.json({ enrollment });
});

const NOTIFICATION_CATEGORIES = ["CLASS", "GRADING", "PAYMENT", "GAMIFICATION", "ATTENDANCE"] as const;

// The one real, persisted slice of the admin Settings screen (site info,
// registration mode, and the caller's own staff-notification preferences).
// Everything else the UI shows for Social/Email/General config doesn't tie
// to any real integration in this app, so it isn't backed by an endpoint.
router.get("/settings", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session || !isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const [settings, me] = await Promise.all([
    prisma.siteSettings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
    prisma.user.findUnique({ where: { id: session.id }, select: { notifyCategories: true } })
  ]);

  return res.json({ settings, notifyCategories: me?.notifyCategories ?? NOTIFICATION_CATEGORIES });
});

router.patch("/settings", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const body = req.body ?? {};
  const allowRegistration = ["enable", "disable", "request"].includes(body.allowRegistration)
    ? body.allowRegistration
    : undefined;

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      siteName: typeof body.siteName === "string" ? body.siteName.trim() : undefined,
      copyrightText: typeof body.copyrightText === "string" ? body.copyrightText.trim() : undefined,
      siteEmail: typeof body.siteEmail === "string" ? body.siteEmail.trim() : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      contactPhone: typeof body.contactPhone === "string" ? body.contactPhone.trim() : undefined,
      supportEmail: typeof body.supportEmail === "string" ? body.supportEmail.trim() : undefined,
      contactAddress: typeof body.contactAddress === "string" ? body.contactAddress : undefined,
      allowRegistration
    },
    create: { id: "singleton" }
  });

  return res.json({ settings });
});

router.patch("/settings/notifications", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session || !isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const categories = Array.isArray(req.body?.categories)
    ? req.body.categories.filter((c: unknown): c is typeof NOTIFICATION_CATEGORIES[number] =>
        NOTIFICATION_CATEGORIES.includes(c as typeof NOTIFICATION_CATEGORIES[number])
      )
    : [];

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: { notifyCategories: categories },
    select: { notifyCategories: true }
  });

  return res.json({ notifyCategories: updated.notifyCategories });
});

export default router;
