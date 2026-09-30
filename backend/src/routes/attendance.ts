import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaff } from "@/lib/api-auth";
import { checkAndNotifyMissedClasses } from "@/lib/attendance";

const router = Router();

router.get("/sessions", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;
  const sessions = await prisma.liveSession.findMany({
    where: courseId ? { courseId } : {},
    include: { _count: { select: { attendance: true } } },
    orderBy: { scheduledAt: "desc" }
  });

  return res.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      courseId: s.courseId,
      title: s.title,
      scheduledAt: s.scheduledAt,
      meetingUrl: s.meetingUrl,
      markedCount: s._count.attendance
    }))
  });
});

router.post("/sessions", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const body = req.body ?? {};
  const courseId = typeof body.courseId === "string" ? body.courseId : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const scheduledAt = typeof body.scheduledAt === "string" ? new Date(body.scheduledAt) : null;
  const meetingUrl = typeof body.meetingUrl === "string" && body.meetingUrl.trim() ? body.meetingUrl.trim() : null;

  if (!courseId || !title || !scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    return res.status(400).json({ error: "courseId, title, and a valid scheduledAt are required." });
  }

  const created = await prisma.liveSession.create({ data: { courseId, title, scheduledAt, meetingUrl } });
  return res.json({ session: created });
});

// Upcoming/live sessions this caller can see — students only see sessions
// for courses they're enrolled in; staff see everything, since courses
// aren't assigned to individual instructors in this app.
router.get("/live", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  let courseIds: string[] | undefined;
  if (!isStaff(session)) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.id },
      select: { courseId: true }
    });
    courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) {
      return res.json({ sessions: [] });
    }
  }

  const windowStart = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const sessions = await prisma.liveSession.findMany({
    where: {
      scheduledAt: { gte: windowStart },
      ...(courseIds ? { courseId: { in: courseIds } } : {})
    },
    include: { course: { select: { title: true, tutor: true, tutorRole: true } } },
    orderBy: { scheduledAt: "asc" }
  });

  const now = Date.now();
  const LIVE_WINDOW_MS = 90 * 60 * 1000;

  return res.json({
    sessions: sessions.map((s) => {
      const scheduledMs = s.scheduledAt.getTime();
      const isLiveNow = Math.abs(now - scheduledMs) <= LIVE_WINDOW_MS;
      return {
        id: s.id,
        courseId: s.courseId,
        courseTitle: s.course.title,
        instructor: s.course.tutor,
        instructorRole: s.course.tutorRole,
        title: s.title,
        scheduledAt: s.scheduledAt,
        meetingUrl: s.meetingUrl,
        status: isLiveNow ? "LIVE_NOW" : "UPCOMING"
      };
    })
  });
});

// The enrolled roster for this session's course, each with their existing
// attendance record for THIS session if one has already been marked.
router.get("/sessions/:id/roster", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const liveSession = await prisma.liveSession.findUnique({ where: { id: req.params.id } });
  if (!liveSession) {
    return res.status(404).json({ error: "Session not found." });
  }

  const [enrollments, records] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId: liveSession.courseId },
      include: { user: { select: { id: true, name: true, email: true } } }
    }),
    prisma.attendanceRecord.findMany({ where: { sessionId: liveSession.id } })
  ]);

  const recordByUser = new Map(records.map((r) => [r.userId, r.present]));

  return res.json({
    session: { id: liveSession.id, title: liveSession.title, scheduledAt: liveSession.scheduledAt },
    roster: enrollments.map((e) => ({
      userId: e.user.id,
      name: e.user.name,
      email: e.user.email,
      present: recordByUser.has(e.user.id) ? recordByUser.get(e.user.id) : null
    }))
  });
});

// Bulk-mark attendance for a session, then check each newly-absent student
// against the "missed 2 in a row" rule.
router.post("/sessions/:id/mark", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const liveSession = await prisma.liveSession.findUnique({ where: { id: req.params.id } });
  if (!liveSession) {
    return res.status(404).json({ error: "Session not found." });
  }

  const records = Array.isArray(req.body?.records) ? req.body.records : [];
  const typeValid = records.filter(
    (r: unknown): r is { userId: string; present: boolean } =>
      !!r && typeof r === "object" && typeof (r as { userId?: unknown }).userId === "string" && typeof (r as { present?: unknown }).present === "boolean"
  );

  if (typeValid.length === 0) {
    return res.status(400).json({ error: "records must be a non-empty array of { userId, present }." });
  }

  // Only mark students actually enrolled in this session's course — without
  // this, any valid user id in the system could get an attendance record
  // (present or absent) for a course they never enrolled in.
  const enrolledIds = new Set(
    (await prisma.enrollment.findMany({ where: { courseId: liveSession.courseId }, select: { userId: true } })).map(
      (e) => e.userId
    )
  );
  const valid = typeValid.filter((r: { userId: string; present: boolean }) => enrolledIds.has(r.userId));
  const skipped = typeValid.length - valid.length;

  for (const r of valid) {
    await prisma.attendanceRecord.upsert({
      where: { sessionId_userId: { sessionId: liveSession.id, userId: r.userId } },
      update: { present: r.present, markedAt: new Date() },
      create: { sessionId: liveSession.id, userId: r.userId, present: r.present }
    });
  }

  for (const r of valid.filter((v: { userId: string; present: boolean }) => !v.present)) {
    await checkAndNotifyMissedClasses(r.userId, liveSession.courseId).catch(() => null);
  }

  return res.json({ ok: true, marked: valid.length, skippedNotEnrolled: skipped });
});

// A student's own attendance history for a course, for their dashboard.
router.get("/mine", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;
  const records = await prisma.attendanceRecord.findMany({
    where: { userId: session.id, ...(courseId ? { session: { courseId } } : {}) },
    include: { session: { select: { title: true, scheduledAt: true, courseId: true } } },
    orderBy: { session: { scheduledAt: "desc" } }
  });

  return res.json({
    records: records.map((r) => ({
      sessionTitle: r.session.title,
      scheduledAt: r.session.scheduledAt,
      courseId: r.session.courseId,
      present: r.present
    }))
  });
});

export default router;
