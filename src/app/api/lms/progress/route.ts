import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { recordLessonCompleted, touchLearningStreak } from "@/lib/learning-engine";

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } }
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const existing = await prisma.userProgress.findUnique({
    where: { userId_lessonId: { userId: session.id, lessonId } }
  });

  if (existing) {
    await prisma.userProgress.delete({ where: { id: existing.id } });
  } else {
    await prisma.userProgress.create({
      data: { userId: session.id, lessonId, isCompleted: true }
    });
    await recordLessonCompleted({ userId: session.id, courseId: lesson.module.courseId, lessonId });
    await touchLearningStreak(session.id);
  }

  const progress = await prisma.userProgress.findMany({
    where: { userId: session.id, isCompleted: true },
    select: { lessonId: true }
  });

  return NextResponse.json({ completedLessonIds: progress.map((p) => p.lessonId) });
}
