import { Router } from "express";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaff, isAdmin, hasCourseAccess } from "@/lib/api-auth";
import { computeAdminRoster } from "@/lib/admin-roster";
import { DELIVERY_MODE_LABEL, mapAdminCourse } from "@/lib/lms-mappers";
import { createNotification } from "@/lib/notifications";
import { creditReferralIfEligible } from "@/lib/referrals";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { sendEmail, frontendUrl, naira } from "@/lib/email";
import { toCsv } from "@/lib/csv";
import type { AnalyticsSummary } from "@/types/lms";

const router = Router();

// Ledger channel for a second-chance balance waiver: recorded so the
// enrollment's PAID_FULL has an explanation, but no money moved, so it must
// never count as revenue.
const WAIVER_CHANNEL = "second_chance_waiver";

router.get("/analytics", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const [roster, courses, cohort, certificatesIssued, scans, homePageViews, signupPageViews, ledger, lessonsCompleted] =
    await Promise.all([
      computeAdminRoster(),
      prisma.course.findMany({ select: { id: true, title: true, color: true } }),
      prisma.cohort.findFirst({ orderBy: { createdAt: "desc" } }),
      prisma.certificate.count(),
      prisma.qrScan.groupBy({ by: ["source"], _count: { _all: true } }),
      prisma.pageView.count({ where: { page: "home" } }),
      prisma.pageView.count({ where: { page: "subscriptions" } }),
      prisma.paymentTransaction.findMany({
        where: { status: { in: ["SUCCESS", "REFUNDED"] } },
        select: { userId: true, courseId: true, amount: true, status: true, channel: true, paidAt: true, createdAt: true }
      }),
      prisma.userProgress.count({ where: { isCompleted: true, user: { role: "STUDENT" } } })
    ]);

  // Money comes from the payment ledger, not Enrollment.amountPaid: a refund
  // never lowers amountPaid, and a second-chance waiver sets it to the full
  // price without any money moving, so summing amountPaid overstated revenue.
  let grossPaid = 0;
  let refundedTotal = 0;
  let waivedTotal = 0;
  const netByEnrollment = new Map<string, number>(); // `${userId}:${courseId}`
  const netByCourse = new Map<string, number>();
  const netByMonth = new Map<string, number>();
  const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  for (const t of ledger) {
    if (t.status === "SUCCESS" && t.channel === WAIVER_CHANNEL) {
      waivedTotal += t.amount;
      continue;
    }
    const signed = t.status === "REFUNDED" ? -t.amount : t.amount;
    if (t.status === "REFUNDED") refundedTotal += t.amount;
    else grossPaid += t.amount;
    const key = `${t.userId}:${t.courseId}`;
    netByEnrollment.set(key, (netByEnrollment.get(key) || 0) + signed);
    netByCourse.set(t.courseId, (netByCourse.get(t.courseId) || 0) + signed);
    const month = monthKey(t.paidAt ?? t.createdAt);
    netByMonth.set(month, (netByMonth.get(month) || 0) + signed);
  }
  const totalRevenue = grossPaid - refundedTotal;

  const revenueByMonth: { month: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const month = monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)));
    revenueByMonth.push({ month, amount: netByMonth.get(month) || 0 });
  }

  // "Students" means paid registrations. Someone who opened the Paystack
  // window and closed it is an abandoned checkout, not a student, and a
  // refunded student is no longer one.
  const paid = roster.filter((s) => s.paymentStatus === "PARTIAL" || s.paymentStatus === "PAID_FULL");
  const totalStudents = paid.length;
  // Unpaid with a reference = a bank transfer staff haven't matched yet;
  // unpaid without one = a Paystack window that was opened and closed.
  const pendingBankTransfers = roster.filter((s) => s.paymentStatus === "PENDING" && !!s.paymentReference).length;
  const abandonedCheckouts = roster.filter((s) => s.paymentStatus === "PENDING" && !s.paymentReference).length;
  const awaitingApproval = paid.filter((s) => s.enrollmentStatus === "PENDING").length;
  const completedEnrollments = paid.filter((s) => s.progressPercent === 100).length;
  const inProgressEnrollments = paid.filter((s) => s.progressPercent > 0 && s.progressPercent < 100).length;
  const outstandingBalance = paid
    .filter((s) => s.enrollmentStatus !== "WITHDRAWN")
    .reduce((sum, s) => sum + Math.max(s.totalDue - s.amountPaid, 0), 0);
  const completionRate = totalStudents === 0 ? 0 : Math.round((completedEnrollments / totalStudents) * 100);

  const paidCountByCourse = new Map<string, number>();
  for (const s of paid) paidCountByCourse.set(s.courseId, (paidCountByCourse.get(s.courseId) || 0) + 1);
  const trackDistribution = courses
    .filter((c) => (paidCountByCourse.get(c.id) || 0) > 0)
    .map((c) => ({
      track: c.title,
      count: paidCountByCourse.get(c.id) || 0,
      revenue: netByCourse.get(c.id) || 0,
      color: c.color
    }));

  // The roster is keyed by enrollment id; look up each paid enrollment's
  // student once so revenue by QR source can use the ledger too.
  const enrollmentOwners = await prisma.enrollment.findMany({
    where: { id: { in: paid.map((s) => s.id) } },
    select: { id: true, userId: true, courseId: true }
  });
  const netByEnrollmentId = new Map(
    enrollmentOwners.map((e) => [e.id, netByEnrollment.get(`${e.userId}:${e.courseId}`) || 0])
  );

  const deliveryCounts = new Map<string, number>();
  for (const s of paid) {
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
  for (const s of paid) {
    const entry = registrationsBySource.get(s.qrSource) || { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += netByEnrollmentId.get(s.id) || 0;
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
    signupPageViews,
    outstandingBalance,
    refundedTotal,
    waivedTotal,
    abandonedCheckouts,
    pendingBankTransfers,
    awaitingApproval,
    completedEnrollments,
    inProgressEnrollments,
    lessonsCompleted,
    revenueByMonth
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

// PRD §9 "Plan the next group" — previously only possible by hand in the
// database. Enrollments always attach to whichever cohort is newest (see
// POST /payments/init, /lms/enroll), so creating one here is what actually
// starts the next intake round.
router.get("/cohorts", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const cohorts = await prisma.cohort.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } }
  });

  return res.json({
    cohorts: cohorts.map((c) => ({
      id: c.id,
      name: c.name,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      targetStudents: c.targetStudents,
      targetRevenue: c.targetRevenue,
      estimatedAdViews: c.estimatedAdViews,
      enrolledCount: c._count.enrollments,
      createdAt: c.createdAt.toISOString()
    }))
  });
});

router.post("/cohorts", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const body = req.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const startDate = typeof body.startDate === "string" ? new Date(body.startDate) : null;
  const endDate = typeof body.endDate === "string" ? new Date(body.endDate) : null;
  const targetStudents = Number.isFinite(Number(body.targetStudents)) ? Number(body.targetStudents) : 80;
  const targetRevenue = Number.isFinite(Number(body.targetRevenue)) ? Number(body.targetRevenue) : 0;

  if (!name || !startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return res.status(400).json({ error: "name, startDate, and endDate are required." });
  }
  if (endDate <= startDate) {
    return res.status(400).json({ error: "endDate must be after startDate." });
  }

  const cohort = await prisma.cohort.create({
    data: { name, startDate, endDate, targetStudents, targetRevenue }
  });

  return res.json({ cohort });
});

router.get("/roster", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }
  const roster = await computeAdminRoster();
  if (isAdmin(session)) {
    return res.json({ roster });
  }

  // Instructors (owner decision, docs/admin-audit.md B9): only students who
  // can actually be in class, with no contact details and no money figures.
  return res.json({
    roster: roster
      .filter((s) => hasCourseAccess({ status: s.enrollmentStatus, paymentStatus: s.paymentStatus }))
      .map((s) => ({
        ...s,
        email: "",
        phone: "",
        amountPaid: 0,
        totalDue: 0,
        paymentReference: null
      }))
  });
});

// Same data as GET /roster, as a downloadable CSV for board reporting /
// accounting reconciliation — admin-only since it's a full export of
// every student's payment status and contact info in one file.
router.get("/roster/export", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }
  const roster = await computeAdminRoster();
  const csv = toCsv(roster as unknown as Record<string, unknown>[], [
    "name",
    "email",
    "phone",
    "courseTitle",
    "cohort",
    "deliveryMode",
    "paymentPlan",
    "amountPaid",
    "totalDue",
    "paymentStatus",
    "enrollmentStatus",
    "progressPercent",
    "capstoneStatus",
    "certificateIssued",
    "qrSource",
    "enrolledAt"
  ]);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="bems-roster-${new Date().toISOString().slice(0, 10)}.csv"`);
  return res.send(csv);
});

async function loadPaymentLedger() {
  const transactions = await prisma.paymentTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } }
    }
  });

  return transactions.map((t) => ({
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
  }));
}

// The real "who has paid" record — every PaymentTransaction row, Paystack
// or bank, regardless of what an Enrollment's current running total says.
// This is the ledger the Earnings tab reads from instead of placeholder data.
router.get("/payment-ledger", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  return res.json({ transactions: await loadPaymentLedger() });
});

router.get("/payment-ledger/export", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const transactions = await loadPaymentLedger();
  const csv = toCsv(transactions, [
    "reference",
    "studentName",
    "studentEmail",
    "courseTitle",
    "paymentPlan",
    "amount",
    "status",
    "channel",
    "gatewayResponse",
    "paidAt",
    "createdAt"
  ]);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="bems-payment-ledger-${new Date().toISOString().slice(0, 10)}.csv"`);
  return res.send(csv);
});

// The PRD's "job-help list" (§6.2) and second revenue stream (§3.4) — a
// row exists here automatically for every student who's earned a
// Certificate (see ensurePlacementSeeking in POST /submissions/:id/grade).
router.get("/placements", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
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
  const payRate =
    body.payRate === null ? null : Number.isFinite(Number(body.payRate)) && body.payRate !== undefined ? Number(body.payRate) : undefined;

  if (feeAmount !== undefined && feeAmount !== null && feeAmount < 0) {
    return res.status(400).json({ error: "feeAmount must be a non-negative number." });
  }
  if (payRate !== undefined && payRate !== null && payRate < 0) {
    return res.status(400).json({ error: "payRate must be a non-negative number." });
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
      ...(notes !== undefined ? { notes } : {}),
      ...(payRate !== undefined ? { payRate } : {})
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

// PRD §5.3: "Graduates come back to teach: the best graduates return as
// paid teaching assistants." Promotes their account to INSTRUCTOR — the
// same role every other tutor in this app uses, so no separate "TA" role
// needs to exist. Only sensible once BEMS has actually decided to hire
// them (status HIRED, placementType BEMS_INTERNAL), set via the placement
// edit modal before this button is used.
router.post("/placements/:id/promote-to-instructor", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  const placement = await prisma.jobPlacement.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, role: true } }, course: { select: { title: true } } }
  });
  if (!placement) {
    return res.status(404).json({ error: "Placement not found." });
  }
  if (placement.status !== "HIRED" || placement.placementType !== "BEMS_INTERNAL") {
    return res.status(400).json({
      error: "Mark this placement HIRED with employer type \"BEMS Group (internal hire)\" before promoting to instructor."
    });
  }
  if (placement.user.role === "INSTRUCTOR" || placement.user.role === "ADMIN") {
    return res.status(400).json({ error: `${placement.user.name} already has staff access.` });
  }

  await prisma.user.update({ where: { id: placement.user.id }, data: { role: "INSTRUCTOR" } });

  await createNotification({
    userId: placement.user.id,
    title: "Welcome to the BEMS teaching team!",
    message: `You've been promoted to Teaching Assistant for ${placement.course.title}. Your account now has instructor access — welcome back!`,
    category: "GRADING",
    linkUrl: "/dashboard"
  });

  return res.json({ ok: true });
});

// PRD §4.1 step 3 — staff work the lead queue the "register interest" form
// feeds (POST /lms/register-interest). Admin-only: it's a list of people's
// phone numbers (owner decision, docs/admin-audit.md B9).
router.get("/leads", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
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
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
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
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const enrollments = await prisma.enrollment.findMany({
    // Paying students only: an opened-and-abandoned checkout also creates an
    // enrollment row, and staff shouldn't be phoning those as new students.
    where: {
      welcomeCallStatus: { not: "COMPLETED" },
      paymentStatus: { in: ["PARTIAL", "PAID_FULL"] },
      status: { not: "WITHDRAWN" }
    },
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
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
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
    select: {
      totalDue: true,
      amountPaid: true,
      paymentStatus: true,
      userId: true,
      courseId: true,
      paymentPlan: true,
      paymentReference: true
    }
  });
  if (!existing) {
    return res.status(404).json({ error: "Enrollment not found." });
  }
  if (existing.paymentStatus === "REFUNDED") {
    return res.status(400).json({ error: "This registration was refunded. Ask the student to register again." });
  }
  // This route records money coming IN. Lowering the total would quietly
  // erase a payment from the books with nothing in the ledger to show for it.
  if (amountPaid < existing.amountPaid) {
    return res.status(400).json({
      error: `amountPaid (₦${amountPaid.toLocaleString()}) is less than what's already recorded (₦${existing.amountPaid.toLocaleString()}). Record money going back out as a refund instead.`
    });
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
  if (status === "PARTIAL" && amountPaid >= existing.totalDue) {
    return res.status(400).json({ error: "That covers the full amount due. Record it as PAID_FULL." });
  }

  const delta = amountPaid - existing.amountPaid;
  if (delta === 0 && status === existing.paymentStatus) {
    // A repeat click: nothing to record, and no second "payment confirmed".
    const unchanged = await prisma.enrollment.findUnique({ where: { id } });
    return res.json({ enrollment: unchanged, unchanged: true });
  }

  // The amount check in the filter makes this a compare-and-set: if two
  // admins record the same transfer at once, only the first one writes, so
  // the ledger can't get the same payment twice.
  const updated = await prisma.$transaction(async (tx) => {
    const { count } = await tx.enrollment.updateMany({
      where: { id, amountPaid: existing.amountPaid, paymentStatus: existing.paymentStatus },
      data: { paymentStatus: status, amountPaid }
    });
    if (count === 0) return false;
    // Mirrors a staff-confirmed bank transfer into the same ledger Paystack
    // charges write to, so the ledger is the complete payment history
    // regardless of channel — not just a Paystack-only audit trail.
    if (delta > 0) {
      await tx.paymentTransaction.create({
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
    return true;
  });
  if (!updated) {
    return res.status(409).json({ error: "Someone else just updated this payment. Refresh and check before trying again." });
  }

  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { id },
    include: { course: { select: { title: true, slug: true } } }
  });

  await createNotification({
    userId: enrollment.userId,
    title: `Payment Confirmed: ${enrollment.course.title}`,
    message: `BEMS Admissions verified ₦${amountPaid.toLocaleString()} (${status === "PAID_FULL" ? "Paid in Full" : "Installment Deposit"}).`,
    category: "PAYMENT",
    linkUrl: "/dashboard"
  });

  // Bank transfers: an admin recording the payment is also the admin
  // confirming the registration, so the student hears about both at once.
  const student = await prisma.user.findUnique({ where: { id: enrollment.userId }, select: { name: true, email: true } });
  if (student && delta > 0) {
    const unlocked = enrollment.status !== "PENDING";
    await sendEmail({
      to: student.email,
      subject: `Payment confirmed — ${enrollment.course.title}`,
      text: [
        `Hello ${student.name},`,
        `BEMS Admissions has confirmed your bank transfer of ${naira(delta)} for ${enrollment.course.title}. Total paid: ${naira(amountPaid)} of ${naira(existing.totalDue)}.`,
        unlocked
          ? `Your registration is confirmed and your classroom is unlocked:\n${frontendUrl(`/courses/${enrollment.course.slug}`)}`
          : "Admissions will confirm your registration shortly — you'll get another email when your classroom is unlocked.",
        "BEMS Admissions"
      ].join("\n\n")
    });
  }

  if (amountPaid > 0) {
    await creditReferralIfEligible(enrollment.userId);
  }

  return res.json({ enrollment });
});

// Registrations that have been paid for (Paystack or staff-confirmed) but
// not yet confirmed by an admin — the admissions "to do" list. Oldest first,
// so nobody who paid early gets stuck behind newer sign-ups.
router.get("/enrollments/pending-approval", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const pending = await prisma.enrollment.findMany({
    where: { status: "PENDING", paymentStatus: { in: ["PARTIAL", "PAID_FULL"] } },
    orderBy: { updatedAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      course: { select: { id: true, title: true, slug: true } },
      cohort: { select: { name: true } }
    }
  });

  const references = pending.map((e) => e.paymentReference).filter((r): r is string => !!r);
  const txns = references.length
    ? await prisma.paymentTransaction.findMany({
        where: { reference: { in: references } },
        select: { reference: true, paidAt: true, channel: true, amount: true }
      })
    : [];
  const txnByRef = new Map(txns.map((t) => [t.reference, t]));

  return res.json({
    enrollments: pending.map((e) => {
      const txn = e.paymentReference ? txnByRef.get(e.paymentReference) : undefined;
      return {
        id: e.id,
        student: e.user,
        course: e.course,
        cohortName: e.cohort?.name ?? null,
        deliveryMode: e.deliveryMode,
        source: e.source,
        paymentPlan: e.paymentPlan,
        paymentStatus: e.paymentStatus,
        amountPaid: e.amountPaid,
        totalDue: e.totalDue,
        paymentReference: e.paymentReference,
        paymentChannel: txn?.channel ?? null,
        paidAt: (txn?.paidAt ?? e.updatedAt).toISOString(),
        registeredAt: e.createdAt.toISOString()
      };
    })
  });
});

// Admin confirms a paid registration: unlocks the course (status ACTIVE)
// and tells the student in-app and by email. Payment must already be on
// record — approving an unpaid registration would hand out the course free.
router.post("/enrollments/:id/approve", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, slug: true } }
    }
  });
  if (!existing) {
    return res.status(404).json({ error: "Enrollment not found." });
  }
  if (existing.paymentStatus === "PENDING" || existing.paymentStatus === "REFUNDED") {
    return res.status(400).json({ error: "This registration has no confirmed payment, so it can't be approved yet." });
  }
  if (existing.status === "ACTIVE" || existing.status === "COMPLETED") {
    return res.json({ enrollment: existing, alreadyApproved: true });
  }
  if (existing.status !== "PENDING") {
    return res.status(400).json({ error: `This registration is ${existing.status.toLowerCase()} and can't be approved.` });
  }

  // updateMany with the status in the filter so two admins clicking at once
  // can't both "approve" and double-notify the student.
  const { count } = await prisma.enrollment.updateMany({
    where: { id: existing.id, status: "PENDING" },
    data: { status: "ACTIVE" }
  });
  if (count === 0) {
    return res.json({ enrollment: { ...existing, status: "ACTIVE" }, alreadyApproved: true });
  }

  const firstLesson = await prisma.lesson.findFirst({
    where: { module: { courseId: existing.courseId } },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    select: { id: true }
  });
  const classroomPath = firstLesson ? `/learn/${existing.course.slug}/${firstLesson.id}` : `/courses/${existing.course.slug}`;

  await createNotification({
    userId: existing.userId,
    title: `Registration confirmed: ${existing.course.title}`,
    message: "Admissions has confirmed your registration. Your classroom, lesson videos, quizzes and projects are now unlocked.",
    category: "CLASS",
    linkUrl: classroomPath
  });
  await sendEmail({
    to: existing.user.email,
    subject: `You're in! Registration confirmed — ${existing.course.title}`,
    text: [
      `Hello ${existing.user.name},`,
      `Good news: BEMS Admissions has confirmed your registration for ${existing.course.title}.`,
      `Your classroom, lesson videos, quizzes and projects are now unlocked. Start here:\n${frontendUrl(classroomPath)}`,
      existing.amountPaid < existing.totalDue
        ? `Outstanding balance: ${naira(existing.totalDue - existing.amountPaid)}. You can pay it from your dashboard.`
        : "",
      "Welcome to BEMS!\nBEMS Admissions"
    ]
      .filter(Boolean)
      .join("\n\n")
  });

  const enrollment = await prisma.enrollment.findUnique({ where: { id: existing.id } });
  return res.json({ enrollment, alreadyApproved: false });
});

// PRD §4.2: "A second chance: a student who falls behind can rejoin those
// weeks in the next group for free, once. That turns a drop-out into a
// finisher instead of a refund." One-time per student, enforced via
// User.secondChanceUsedAt — not per-course, since the PRD frames this as a
// lifetime perk, not a repeatable discount.
// A plain status toggle — marking a student DROPPED is the precondition
// for the second-chance route below, and staff need a way to undo a
// mis-click without it counting as a real drop.
router.patch("/enrollments/:id/status", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  const status = req.body?.status;
  if (status !== "DROPPED" && status !== "ACTIVE") {
    return res.status(400).json({ error: "status must be DROPPED or ACTIVE." });
  }

  const existing = await prisma.enrollment.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Enrollment not found." });
  }
  // Confirming a new registration goes through /approve, which checks
  // payment and notifies the student — this toggle is only for DROPPED.
  if (existing.status === "PENDING" && status === "ACTIVE") {
    return res.status(400).json({ error: "Use POST /admin/enrollments/:id/approve to confirm a new registration." });
  }

  const enrollment = await prisma.enrollment.update({ where: { id }, data: { status } });
  return res.json({ enrollment });
});

router.post("/enrollments/:id/second-chance", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  const targetCohortId = typeof req.body?.targetCohortId === "string" ? req.body.targetCohortId : "";
  if (!targetCohortId) {
    return res.status(400).json({ error: "targetCohortId is required." });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, secondChanceUsedAt: true } }, course: { select: { title: true } } }
  });
  if (!enrollment) {
    return res.status(404).json({ error: "Enrollment not found." });
  }
  if (enrollment.user.secondChanceUsedAt) {
    return res.status(400).json({ error: `${enrollment.user.name} has already used their one-time second chance.` });
  }
  // Second chance is for a paying student who fell behind (PRD §4.2). On an
  // unpaid or refunded registration it would hand over the whole course for
  // free, so it needs a payment on record and the student marked Dropped
  // first, which is also the only case the admin screen offers it for.
  if (enrollment.status !== "DROPPED") {
    return res.status(400).json({ error: "Mark the student as Dropped before giving a second chance." });
  }
  if (enrollment.paymentStatus !== "PARTIAL" && enrollment.paymentStatus !== "PAID_FULL") {
    return res.status(400).json({ error: "Second chance needs a payment on record for this registration." });
  }

  const targetCohort = await prisma.cohort.findUnique({ where: { id: targetCohortId } });
  if (!targetCohort) {
    return res.status(404).json({ error: "Target cohort not found." });
  }

  const waivedAmount = Math.max(enrollment.totalDue - enrollment.amountPaid, 0);

  const updated = await prisma.$transaction(async (tx) => {
    // Claim the one-time perk first, conditionally, so two clicks can't both
    // pass the check above and waive twice.
    const { count } = await tx.user.updateMany({
      where: { id: enrollment.user.id, secondChanceUsedAt: null },
      data: { secondChanceUsedAt: new Date() }
    });
    if (count === 0) return null;
    return tx.enrollment.update({
      where: { id },
      data: {
        cohortId: targetCohortId,
        status: "ACTIVE",
        paymentStatus: "PAID_FULL",
        amountPaid: enrollment.totalDue
      }
    });
  });
  if (!updated) {
    return res.status(400).json({ error: `${enrollment.user.name} has already used their one-time second chance.` });
  }

  // A real ledger entry for the waiver — so "why does this enrollment show
  // PAID_FULL with no matching Paystack/bank transaction" has an honest
  // answer in the Payment Ledger, not a silent discrepancy.
  if (waivedAmount > 0) {
    await prisma.paymentTransaction.create({
      data: {
        reference: `waiver_${crypto.randomUUID().replace(/-/g, "")}`,
        userId: enrollment.user.id,
        courseId: enrollment.courseId,
        paymentPlan: enrollment.paymentPlan,
        amount: waivedAmount,
        status: "SUCCESS",
        channel: WAIVER_CHANNEL,
        gatewayResponse: `One-time second-chance rejoin into cohort "${targetCohort.name}" — remaining balance waived by ${session?.name ?? "admin"}.`,
        paidAt: new Date()
      }
    });
  }

  await createNotification({
    userId: enrollment.user.id,
    title: "You're back in! Second chance activated",
    message: `Welcome back to ${enrollment.course.title} — you've rejoined the "${targetCohort.name}" cohort with your remaining balance waived. Your progress carries over, so pick up right where you left off.`,
    category: "CLASS",
    linkUrl: "/dashboard"
  });

  return res.json({ enrollment: updated, waivedAmount });
});

// Bookkeeping-only, same convention as a staff-confirmed bank transfer —
// the money was given back outside the app (whatever channel it came in
// through); this just records that it happened and revokes access. No
// Paystack refund API call is made here even for card payments, to avoid
// triggering a real reversal of production money from an admin click
// with no second confirmation step.
router.post("/enrollments/:id/refund", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  const amount = Number(req.body?.amount);
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number." });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } }, course: { select: { title: true } } }
  });
  if (!enrollment) {
    return res.status(404).json({ error: "Enrollment not found." });
  }
  if (enrollment.paymentStatus === "REFUNDED") {
    return res.status(400).json({ error: "This registration has already been refunded." });
  }
  // The cap is money that actually came in, from the ledger. amountPaid
  // can't be used: after a second chance it includes the waived balance,
  // which was never paid and can't be refunded.
  const ledger = await prisma.paymentTransaction.findMany({
    where: { userId: enrollment.userId, courseId: enrollment.courseId, status: { in: ["SUCCESS", "REFUNDED"] } },
    select: { amount: true, status: true, channel: true }
  });
  // Registrations paid before the ledger existed have no rows; fall back to
  // their recorded total rather than blocking every refund for them.
  const refundable =
    ledger.length === 0
      ? enrollment.amountPaid
      : ledger.reduce(
          (sum, t) =>
            t.status === "REFUNDED" ? sum - t.amount : t.channel === WAIVER_CHANNEL ? sum : sum + t.amount,
          0
        );
  if (amount > refundable) {
    return res.status(400).json({
      error: `amount (₦${amount.toLocaleString()}) cannot exceed what was actually paid (₦${Math.max(refundable, 0).toLocaleString()}).`
    });
  }

  // Conditional on not already being refunded, so a double click can't
  // write two refunds to the ledger.
  const { count } = await prisma.enrollment.updateMany({
    where: { id, paymentStatus: { not: "REFUNDED" } },
    data: { paymentStatus: "REFUNDED", status: "WITHDRAWN" }
  });
  if (count === 0) {
    return res.status(400).json({ error: "This registration has already been refunded." });
  }
  const updated = await prisma.enrollment.findUniqueOrThrow({ where: { id } });

  await prisma.paymentTransaction.create({
    data: {
      reference: `refund_${crypto.randomUUID().replace(/-/g, "")}`,
      userId: enrollment.user.id,
      courseId: enrollment.courseId,
      paymentPlan: enrollment.paymentPlan,
      amount,
      status: "REFUNDED",
      channel: "refund",
      gatewayResponse: reason
        ? `Refunded by ${session?.name ?? "admin"}: ${reason}`
        : `Refunded by ${session?.name ?? "admin"} (no reason given).`,
      paidAt: new Date()
    }
  });

  await createNotification({
    userId: enrollment.user.id,
    title: `Refund Processed: ${enrollment.course.title}`,
    message: `₦${amount.toLocaleString()} has been refunded. Your access to this course has been withdrawn.${
      reason ? ` Reason: ${reason}` : ""
    }`,
    category: "PAYMENT",
    linkUrl: "/dashboard"
  });

  return res.json({ enrollment: updated });
});

// Staff accounts. Admins join with the shared ADMIN_ACCESS_CODE, so without
// this there was no way to see who has admin access, or to remove someone
// who left: their account kept working for good.
router.get("/staff", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "INSTRUCTOR"] } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, deactivatedAt: true, createdAt: true }
  });

  return res.json({
    staff: staff.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      avatarUrl: s.avatarUrl,
      active: !s.deactivatedAt,
      createdAt: s.createdAt.toISOString()
    }))
  });
});

// Blocks sign-in and ends every open session at once (bumping tokenVersion
// invalidates the cookies they already have).
router.post("/staff/:id/deactivate", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session) || !session) {
    return res.status(403).json({ error: "Admin access required." });
  }
  if (req.params.id === session.id) {
    return res.status(400).json({ error: "You can't deactivate your own account." });
  }

  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target || (target.role !== "ADMIN" && target.role !== "INSTRUCTOR")) {
    return res.status(404).json({ error: "Staff member not found." });
  }
  if (target.deactivatedAt) {
    return res.json({ ok: true, alreadyInactive: true });
  }
  if (target.role === "ADMIN") {
    const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", deactivatedAt: null } });
    if (activeAdmins <= 1) {
      return res.status(400).json({ error: "That's the last active admin. Add another admin first." });
    }
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { deactivatedAt: new Date(), tokenVersion: { increment: 1 } }
  });
  return res.json({ ok: true });
});

router.post("/staff/:id/reactivate", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target || (target.role !== "ADMIN" && target.role !== "INSTRUCTOR")) {
    return res.status(404).json({ error: "Staff member not found." });
  }

  await prisma.user.update({ where: { id: target.id }, data: { deactivatedAt: null } });
  return res.json({ ok: true });
});

// Course reviews, for moderation. Students post them via POST /lms/reviews
// and they show publicly on course pages, so admins need to see them all
// in one place and be able to take down abusive or fake ones.
router.get("/reviews", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } }
    }
  });

  return res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      student: r.user,
      course: r.course
    }))
  });
});

router.delete("/reviews/:id", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { count } = await prisma.review.deleteMany({ where: { id: req.params.id } });
  if (count === 0) {
    return res.status(404).json({ error: "Review not found." });
  }
  return res.json({ ok: true });
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
