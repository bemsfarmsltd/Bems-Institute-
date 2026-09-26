import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import type { QuizResult } from "@/types/lms";

// Score is computed here from the DB's answer key, never trusted from the
// client — a student can't just POST { score: 100 }.
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const quizId = typeof body?.quizId === "string" ? body.quizId : "";
  const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};
  if (!quizId) {
    return NextResponse.json({ error: "quizId is required." }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true }
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  let correctCount = 0;
  for (const q of quiz.questions) {
    if (answers[q.id] === q.correctOption) correctCount++;
  }
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  const attempt = await prisma.quizAttempt.create({
    data: { userId: session.id, quizId, score, passed, answers }
  });

  const result: QuizResult = {
    quizId,
    userId: session.id,
    score,
    passed,
    selectedAnswers: answers,
    attemptedAt: attempt.createdAt.toISOString()
  };

  return NextResponse.json({ result });
}
