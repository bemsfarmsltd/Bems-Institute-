import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaff } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { listTutorStudents, getTutorStudent, listCourseTutors, setCourseTutors, TutorViewError } from "@/lib/tutor-view";

const router = Router();

const REVIEW_THRESHOLD = 0.5;

export interface ConceptStruggleRow {
  conceptId: string;
  conceptName: string;
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  strugglingStudents: number;
  strugglePercent: number;
  avgMasteryPercent: number;
  smallSample: boolean;
}

router.get("/concept-analytics", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;

  const masteries = await prisma.conceptMastery.findMany({
    where: {
      attempts: { gt: 0 },
      ...(courseId ? { concept: { courseId } } : {})
    },
    include: { concept: { include: { course: true } } }
  });

  const byConcept = new Map<string, typeof masteries>();
  for (const m of masteries) {
    if (!byConcept.has(m.conceptId)) byConcept.set(m.conceptId, []);
    byConcept.get(m.conceptId)!.push(m);
  }

  const rows: ConceptStruggleRow[] = [...byConcept.entries()].map(([conceptId, rows]) => {
    const totalStudents = rows.length;
    const strugglingStudents = rows.filter((r) => r.masteryScore < REVIEW_THRESHOLD).length;
    const avgMastery = rows.reduce((sum, r) => sum + r.masteryScore, 0) / totalStudents;
    const concept = rows[0].concept;

    return {
      conceptId,
      conceptName: concept.name,
      courseId: concept.courseId,
      courseTitle: concept.course.title,
      totalStudents,
      strugglingStudents,
      strugglePercent: Math.round((strugglingStudents / totalStudents) * 100),
      avgMasteryPercent: Math.round(avgMastery * 100),
      smallSample: totalStudents < 3
    };
  });

  rows.sort((a, b) => b.strugglePercent - a.strugglePercent || b.totalStudents - a.totalStudents);

  return res.json({ rows });
});

// ---- Tutor view (Phase 4) ----
// A tutor sees the students of the courses an admin assigned them; admins see all.
router.get("/students", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session || !isStaff(session)) return res.status(403).json({ error: "Staff access required." });
  const courseId = typeof req.query.courseId === "string" && req.query.courseId ? req.query.courseId : undefined;
  try {
    return res.json(await listTutorStudents(session, courseId));
  } catch (err) {
    if (err instanceof TutorViewError) return res.status(err.status).json({ error: err.message });
    throw err;
  }
});

router.get("/students/:userId", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session || !isStaff(session)) return res.status(403).json({ error: "Staff access required." });
  const courseId = typeof req.query.courseId === "string" ? req.query.courseId : "";
  if (!courseId) return res.status(400).json({ error: "Choose a course." });
  try {
    return res.json({ student: await getTutorStudent(session, courseId, req.params.userId) });
  } catch (err) {
    if (err instanceof TutorViewError) return res.status(err.status).json({ error: err.message });
    throw err;
  }
});

// Admin: who teaches which course.
router.get("/course-tutors", async (req, res) => {
  const session = await getSessionUser(req);
  if (!can(session, "settings.manage")) return res.status(403).json({ error: "You don't have access to this." });
  return res.json(await listCourseTutors());
});

router.put("/course-tutors/:courseId", async (req, res) => {
  const session = await getSessionUser(req);
  if (!can(session, "settings.manage")) return res.status(403).json({ error: "You don't have access to this." });
  try {
    return res.json(await setCourseTutors(req.params.courseId, req.body?.userIds));
  } catch (err) {
    if (err instanceof TutorViewError) return res.status(err.status).json({ error: err.message });
    throw err;
  }
});

export default router;
