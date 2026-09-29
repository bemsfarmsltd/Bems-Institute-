import { randomUUID } from "crypto";
import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { generateConceptPracticeQuestion } from "@/lib/gemini";
import { signPayload, verifyPayload } from "@/lib/signed-token";
import { getLearningProfile, recordPracticeAnswer } from "@/lib/learning-engine";

const router = Router();

const TOKEN_MAX_AGE_SECONDS = 60 * 10; // 10 minutes to answer

interface PracticeTokenPayload {
  jti: string;
  userId: string;
  conceptId: string;
  courseId: string;
  correctOption: number;
  explanation: string;
}

router.get("/profile", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const profile = await getLearningProfile(session.id);
  return res.json(profile);
});

// Generates one fresh practice question for a concept the student is weak
// in. The correct answer never reaches the client in plaintext — it's
// embedded in a signed token that /practice-question/answer verifies, so
// there's nothing to look up client-side devtools to cheat.
router.post("/practice-question", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const { conceptId } = req.body ?? {};
  if (!conceptId) {
    return res.status(400).json({ error: "conceptId is required." });
  }

  const concept = await prisma.concept.findUnique({
    where: { id: conceptId },
    include: { course: true, questions: { include: { question: true } } }
  });
  if (!concept) {
    return res.status(404).json({ error: "Concept not found." });
  }

  const referenceQuestions = concept.questions.map((qc) => ({
    prompt: qc.question.prompt,
    options: qc.question.options,
    correctOption: qc.question.correctOption,
    explanation: qc.question.explanation
  }));

  if (referenceQuestions.length === 0) {
    return res.status(404).json({ error: "No authored questions exist yet for this concept." });
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

  return res.json({
    token,
    prompt: question.prompt,
    options: question.options,
    source: question.source,
    conceptName: concept.name
  });
});

router.post("/practice-question/answer", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const { token, selectedOption } = req.body ?? {};
  const payload = await verifyPayload<PracticeTokenPayload>(token);
  if (!payload) {
    return res.status(400).json({ error: "This question has expired — generate a new one." });
  }
  if (payload.userId !== session.id) {
    return res.status(403).json({ error: "Not authenticated." });
  }

  try {
    await prisma.practiceAttempt.create({ data: { jti: payload.jti } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(400).json({ error: "This question was already answered — generate a new one." });
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

  return res.json({ correct, correctOption: payload.correctOption, explanation: payload.explanation });
});

export default router;
