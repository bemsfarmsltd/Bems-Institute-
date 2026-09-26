import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { verifyPayload } from "@/lib/signed-token";
import { recordPracticeAnswer } from "@/lib/learning-engine";

interface PracticeTokenPayload {
  jti: string;
  userId: string;
  conceptId: string;
  courseId: string;
  correctOption: number;
  explanation: string;
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { token, selectedOption } = await req.json();
  const payload = await verifyPayload<PracticeTokenPayload>(token);
  if (!payload) {
    return NextResponse.json({ error: "This question has expired — generate a new one." }, { status: 400 });
  }
  if (payload.userId !== session.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 403 });
  }

  // Redeem the token exactly once — a unique-constraint violation here means
  // this exact question was already answered, so reject the replay instead
  // of letting a student pad their correct-attempt count by resubmitting it.
  try {
    await prisma.practiceAttempt.create({ data: { jti: payload.jti } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "This question was already answered — generate a new one." },
        { status: 400 }
      );
    }
    throw err;
  }

  const correct = selectedOption === payload.correctOption;

  await recordPracticeAnswer({
    userId: session.id,
    courseId: payload.courseId,
    conceptId: payload.conceptId,
    correct
  });

  return NextResponse.json({ correct, correctOption: payload.correctOption, explanation: payload.explanation });
}
