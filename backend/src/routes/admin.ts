import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaff, isAdmin } from "@/lib/api-auth";
import { computeAdminRoster } from "@/lib/admin-roster";
import { DELIVERY_MODE_LABEL, mapAdminCourse } from "@/lib/lms-mappers";
import { createNotification } from "@/lib/notifications";
import { creditReferralIfEligible } from "@/lib/referrals";
import type { AnalyticsSummary } from "@/types/lms";

const router = Router();

router.get("/analytics", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const [roster, courses, cohort, certificatesIssued, scans] = await Promise.all([
    computeAdminRoster(),
    prisma.course.findMany({ include: { enrollments: true } }),
    prisma.cohort.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.certificate.count(),
    prisma.qrScan.groupBy({ by: ["source"], _count: { _all: true } })
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
    bannerChannelYield
  };

  return res.json(summary);
});

router.get("/roster", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }
  const roster = await computeAdminRoster();
  return res.json({ roster });
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

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { paymentStatus: status, amountPaid },
    include: { course: { select: { title: true, slug: true } } }
  });

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

export default router;
