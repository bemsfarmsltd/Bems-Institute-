import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaff } from "@/lib/api-auth";

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

export default router;
