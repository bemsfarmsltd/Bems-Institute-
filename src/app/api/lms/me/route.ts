import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { mapSubmission } from "@/lib/lms-mappers";
import type { QuizResult } from "@/types/lms";

// Auth required: the current user's own enrollment/progress/quiz state, plus
// submissions — their own if STUDENT, everyone's if INSTRUCTOR/ADMIN (the
// grading queue needs to see all of them).
export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const isStaff = session.role === "INSTRUCTOR" || session.role === "ADMIN";

  const [enrollments, progress, quizAttempts, submissions] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId: session.id }, select: { courseId: true } }),
    prisma.userProgress.findMany({
      where: { userId: session.id, isCompleted: true },
      select: { lessonId: true }
    }),
    prisma.quizAttempt.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" }
    }),
    prisma.submission.findMany({
      where: isStaff ? {} : { userId: session.id },
      include: {
        user: { select: { name: true, email: true } },
        assignment: { select: { courseId: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const quizResults: Record<string, QuizResult> = {};
  for (const attempt of quizAttempts) {
    // Attempts are ordered newest-first; keep only the most recent per quiz.
    if (quizResults[attempt.quizId]) continue;
    quizResults[attempt.quizId] = {
      quizId: attempt.quizId,
      userId: attempt.userId,
      score: attempt.score,
      passed: attempt.passed,
      selectedAnswers: attempt.answers as Record<string, number>,
      attemptedAt: attempt.createdAt.toISOString()
    };
  }

  return NextResponse.json({
    enrolledCourseIds: enrollments.map((e) => e.courseId),
    completedLessonIds: progress.map((p) => p.lessonId),
    quizResults,
    submissions: submissions.map(mapSubmission)
  });
}
