import { prisma } from "@/lib/prisma";
import { DELIVERY_MODE_LABEL } from "@/lib/lms-mappers";
import type { AdminStudent } from "@/types/lms";

// Shared by /api/admin/roster and /api/admin/analytics so both compute
// progress/quiz/capstone/certificate status from the same logic.
export async function computeAdminRoster(): Promise<AdminStudent[]> {
  const [enrollments, courses, progress, quizAttempts, submissions, certificates] =
    await Promise.all([
      prisma.enrollment.findMany({
        include: { user: true, course: true, cohort: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.course.findMany({
        include: {
          modules: { include: { lessons: { select: { id: true } } } },
          quizzes: { select: { id: true } },
          assignments: { select: { id: true } }
        }
      }),
      prisma.userProgress.findMany({ where: { isCompleted: true }, select: { userId: true, lessonId: true } }),
      prisma.quizAttempt.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.submission.findMany(),
      prisma.certificate.findMany()
    ]);

  const lessonCountByCourse = new Map(
    courses.map((c) => [c.id, c.modules.reduce((sum, m) => sum + m.lessons.length, 0)])
  );
  const lessonIdsByCourse = new Map(
    courses.map((c) => [c.id, new Set(c.modules.flatMap((m) => m.lessons.map((l) => l.id)))])
  );
  const quizIdByCourse = new Map(courses.map((c) => [c.id, c.quizzes[0]?.id]));
  const assignmentIdByCourse = new Map(courses.map((c) => [c.id, c.assignments[0]?.id]));

  const completedLessonsByUser = new Map<string, Set<string>>();
  for (const p of progress) {
    if (!completedLessonsByUser.has(p.userId)) completedLessonsByUser.set(p.userId, new Set());
    completedLessonsByUser.get(p.userId)!.add(p.lessonId);
  }

  // quizAttempts is ordered newest-first — first match per (userId, quizId) wins.
  const latestQuizScore = new Map<string, number>();
  for (const a of quizAttempts) {
    const key = `${a.userId}:${a.quizId}`;
    if (!latestQuizScore.has(key)) latestQuizScore.set(key, a.score);
  }

  const submissionByUserAndAssignment = new Map(
    submissions.map((s) => [`${s.userId}:${s.assignmentId}`, s])
  );

  const certifiedPairs = new Set(certificates.map((c) => `${c.userId}:${c.courseId}`));

  return enrollments.map((e) => {
    const totalLessons = lessonCountByCourse.get(e.courseId) || 0;
    const courseLessonIds = lessonIdsByCourse.get(e.courseId) || new Set();
    const userCompleted = completedLessonsByUser.get(e.userId) || new Set();
    const completedInCourse = [...courseLessonIds].filter((id) => userCompleted.has(id)).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0;

    const quizId = quizIdByCourse.get(e.courseId);
    const quizScore = quizId ? latestQuizScore.get(`${e.userId}:${quizId}`) : undefined;

    const assignmentId = assignmentIdByCourse.get(e.courseId);
    const submission = assignmentId
      ? submissionByUserAndAssignment.get(`${e.userId}:${assignmentId}`)
      : undefined;
    const capstoneStatus = !submission
      ? "NOT_STARTED"
      : submission.status === "GRADED"
      ? "GRADED"
      : "SUBMITTED";

    return {
      id: e.id,
      name: e.user.name,
      email: e.user.email,
      phone: e.user.phone || "",
      courseId: e.courseId,
      courseTitle: e.course.title,
      cohort: e.cohort?.name || "Unassigned",
      deliveryMode: DELIVERY_MODE_LABEL[e.deliveryMode],
      paymentPlan: e.paymentPlan.toUpperCase() === "INSTALLMENT" ? "INSTALLMENT" : "FULL",
      amountPaid: e.amountPaid,
      totalDue: e.totalDue,
      paymentStatus: e.paymentStatus,
      paymentReference: e.paymentReference,
      progressPercent,
      quizScore,
      capstoneStatus,
      certificateIssued: certifiedPairs.has(`${e.userId}:${e.courseId}`),
      qrSource: e.source || "website",
      enrolledAt: e.createdAt.toISOString()
    } as AdminStudent;
  });
}
