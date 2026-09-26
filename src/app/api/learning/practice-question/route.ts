import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { generateConceptPracticeQuestion } from "@/lib/gemini";
import { signPayload } from "@/lib/signed-token";

const TOKEN_MAX_AGE_SECONDS = 60 * 10; // 10 minutes to answer

// Generates one fresh practice question for a concept the student is weak
// in. The correct answer never reaches the client in plaintext — it's
// embedded in a signed token that /api/learning/practice-question/answer
// verifies, so there's nothing to look up client-side devtools to cheat.
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { conceptId } = await req.json();
  if (!conceptId) {
    return NextResponse.json({ error: "conceptId is required." }, { status: 400 });
  }

  const concept = await prisma.concept.findUnique({
    where: { id: conceptId },
    include: {
      course: true,
      questions: { include: { question: true } }
    }
  });
  if (!concept) {
    return NextResponse.json({ error: "Concept not found." }, { status: 404 });
  }

  const referenceQuestions = concept.questions.map((qc) => ({
    prompt: qc.question.prompt,
    options: qc.question.options,
    correctOption: qc.question.correctOption,
    explanation: qc.question.explanation
  }));

  if (referenceQuestions.length === 0) {
    return NextResponse.json({ error: "No authored questions exist yet for this concept." }, { status: 404 });
  }

  const question = await generateConceptPracticeQuestion({
    conceptName: concept.name,
    courseTitle: concept.course.title,
    referenceQuestions
  });

  const token = await signPayload(
    {
      jti: randomUUID(),
      userId: session.id,
      conceptId,
      courseId: concept.courseId,
      correctOption: question.correctOption,
      explanation: question.explanation
    },
    TOKEN_MAX_AGE_SECONDS
  );

  return NextResponse.json({
    token,
    prompt: question.prompt,
    options: question.options,
    source: question.source,
    conceptName: concept.name
  });
}
