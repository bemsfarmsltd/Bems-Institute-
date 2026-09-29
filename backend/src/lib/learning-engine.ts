import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// THE CORE PERSONALIZATION LOOP
//
// Learning activity (lessons watched, quiz questions answered, assignments
// submitted) -> LearningEvent log -> ConceptMastery per (student, concept) ->
// rule-based recommendations, each one traceable back to the exact events
// that produced it.
//
// Deliberately rule-based, not ML: masteryScore is just
// correctAttempts / attempts, recomputed from the event log every time a
// relevant event happens — never incrementally patched, so it can't drift.
// This is what "explainable AI" concretely means for a project this size —
// see computeRecommendations()'s `evidence` field on every recommendation.
// ---------------------------------------------------------------------------

/** Recomputes ConceptMastery for one concept from its full attempt history. */
async function recomputeMastery(userId: string, conceptId: string) {
  const events = await prisma.learningEvent.findMany({
    where: { userId, conceptId, eventType: "QUESTION_ANSWERED" }
  });

  const attempts = events.length;
  const correctAttempts = events.filter(
    (e) => (e.metadata as { correct?: boolean } | null)?.correct === true
  ).length;
  const masteryScore = attempts === 0 ? 0 : correctAttempts / attempts;
  const confidence = Math.min(1, attempts / 5);
  const lastPracticedAt = events.reduce<Date | null>(
    (latest, e) => (!latest || e.createdAt > latest ? e.createdAt : latest),
    null
  );

  await prisma.conceptMastery.upsert({
    where: { userId_conceptId: { userId, conceptId } },
    update: { attempts, correctAttempts, masteryScore, confidence, lastPracticedAt },
    create: { userId, conceptId, attempts, correctAttempts, masteryScore, confidence, lastPracticedAt }
  });
}

/** Call once per question in a submitted quiz attempt. */
export async function recordQuestionAnswered(params: {
  userId: string;
  courseId: string;
  questionId: string;
  correct: boolean;
}) {
  const { userId, courseId, questionId, correct } = params;
  const links = await prisma.questionConcept.findMany({ where: { questionId } });

  for (const link of links) {
    await prisma.learningEvent.create({
      data: {
        userId,
        courseId,
        conceptId: link.conceptId,
        eventType: "QUESTION_ANSWERED",
        metadata: { questionId, correct }
      }
    });
    await recomputeMastery(userId, link.conceptId);
  }
}

export async function recordQuizCompleted(params: {
  userId: string;
  courseId: string;
  quizId: string;
  score: number;
  passed: boolean;
}) {
  const { userId, courseId, quizId, score, passed } = params;
  await prisma.learningEvent.create({
    data: { userId, courseId, eventType: "QUIZ_COMPLETED", metadata: { quizId, score, passed } }
  });
}

export async function recordLessonCompleted(params: {
  userId: string;
  courseId: string;
  lessonId: string;
}) {
  const { userId, courseId, lessonId } = params;
  // Exposure only — watching a lesson isn't proof of understanding, so this
  // logs the event (useful for streaks/activity) without touching
  // ConceptMastery numbers, which stay strictly quiz-performance-based.
  await prisma.learningEvent.create({
    data: { userId, courseId, lessonId, eventType: "LESSON_COMPLETED" }
  });
}

export async function recordAssignmentSubmitted(params: {
  userId: string;
  courseId: string;
  assignmentId: string;
}) {
  const { userId, courseId, assignmentId } = params;
  await prisma.learningEvent.create({
    data: { userId, courseId, eventType: "ASSIGNMENT_SUBMITTED", metadata: { assignmentId } }
  });
}

/** Records an answer to an AI-generated practice question (see /api/learning/practice-question). */
export async function recordPracticeAnswer(params: {
  userId: string;
  courseId: string;
  conceptId: string;
  correct: boolean;
}) {
  const { userId, courseId, conceptId, correct } = params;
  await prisma.learningEvent.create({
    data: { userId, courseId, conceptId, eventType: "QUESTION_ANSWERED", metadata: { practice: true, correct } }
  });
  await recomputeMastery(userId, conceptId);
}

export interface Recommendation {
  id: string;
  type: "PREREQUISITE" | "REVIEW" | "ALTERNATIVE_EXPLANATION" | "READY_FOR_NEXT";
  urgency: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  reason: string;
  evidence: string[];
  conceptId?: string;
  conceptName?: string;
  courseId?: string;
  actionUrl: string;
  estimatedMinutes: number;
}

export interface ConceptSummary {
  conceptId: string;
  name: string;
  courseId: string;
  courseTitle: string;
  masteryScore: number;
  confidence: number;
  attempts: number;
  correctAttempts: number;
}

export interface LearningProfileSummary {
  strengths: ConceptSummary[];
  weaknesses: ConceptSummary[];
  recommendations: Recommendation[];
  learningStreak: number;
}

// The actual rules — deliberately simple and readable so anyone can verify
// what the system will do, rather than a black-box score.
const PREREQUISITE_THRESHOLD = 0.3;
const REVIEW_THRESHOLD = 0.5;
const STRUGGLING_WRONG_ATTEMPTS = 3;
const READY_FOR_NEXT_THRESHOLD = 0.8;

export async function getLearningProfile(userId: string): Promise<LearningProfileSummary> {
  const masteries = await prisma.conceptMastery.findMany({
    where: { userId, attempts: { gt: 0 } },
    include: {
      concept: { include: { course: true, parentConcept: true, lessons: { include: { lesson: { include: { module: true } } } } } }
    },
    orderBy: { masteryScore: "asc" }
  });

  const summaries: ConceptSummary[] = masteries.map((m) => ({
    conceptId: m.conceptId,
    name: m.concept.name,
    courseId: m.concept.courseId,
    courseTitle: m.concept.course.title,
    masteryScore: m.masteryScore,
    confidence: m.confidence,
    attempts: m.attempts,
    correctAttempts: m.correctAttempts
  }));

  const weaknesses = [...summaries].slice(0, 3);
  const strengths = [...summaries].sort((a, b) => b.masteryScore - a.masteryScore).slice(0, 3);

  const recommendations: Recommendation[] = [];

  for (const m of masteries) {
    const evidence = [
      `${m.correctAttempts}/${m.attempts} correct on questions testing "${m.concept.name}"`,
      `Last practiced ${m.lastPracticedAt ? m.lastPracticedAt.toLocaleDateString() : "never"}`
    ];

    // Find a lesson that teaches this concept to link the recommendation to
    // something concrete — highest-importance link wins.
    const bestLesson = [...m.concept.lessons].sort((a, b) => b.importance - a.importance)[0];
    const actionUrl = bestLesson
      ? `/learn/${m.concept.courseId}/${bestLesson.lessonId}`
      : `/courses/${m.concept.courseId}`;

    const wrongAttempts = m.attempts - m.correctAttempts;

    if (m.masteryScore < PREREQUISITE_THRESHOLD) {
      const parent = m.concept.parentConcept;
      recommendations.push({
        id: `prereq-${m.conceptId}`,
        type: "PREREQUISITE",
        urgency: "HIGH",
        title: parent ? `Revisit ${parent.name} first` : `Study the fundamentals of ${m.concept.name}`,
        reason: parent
          ? `${m.concept.name} builds on ${parent.name}, and your results suggest that foundation isn't solid yet.`
          : `Your results show this is a foundational gap, not just a tricky question.`,
        evidence,
        conceptId: m.conceptId,
        conceptName: m.concept.name,
        courseId: m.concept.courseId,
        actionUrl,
        estimatedMinutes: 20
      });
    } else if (m.masteryScore < REVIEW_THRESHOLD) {
      recommendations.push({
        id: `review-${m.conceptId}`,
        type: "REVIEW",
        urgency: "MEDIUM",
        title: `Review ${m.concept.name}`,
        reason: `Your last ${m.attempts} attempt${m.attempts === 1 ? "" : "s"} on questions testing this concept show it hasn't clicked yet.`,
        evidence,
        conceptId: m.conceptId,
        conceptName: m.concept.name,
        courseId: m.concept.courseId,
        actionUrl,
        estimatedMinutes: 15
      });
    }

    if (wrongAttempts >= STRUGGLING_WRONG_ATTEMPTS) {
      recommendations.push({
        id: `alt-explanation-${m.conceptId}`,
        type: "ALTERNATIVE_EXPLANATION",
        urgency: "MEDIUM",
        title: `Try a different explanation of ${m.concept.name}`,
        reason: `You've gotten this wrong ${wrongAttempts} times — the current lesson may not be the explanation that clicks for you. Ask the AI Tutor for a different angle.`,
        evidence,
        conceptId: m.conceptId,
        conceptName: m.concept.name,
        courseId: m.concept.courseId,
        actionUrl: "/ai",
        estimatedMinutes: 10
      });
    }
  }

  // Positive reinforcement: courses where the student is doing well overall.
  const byCourse = new Map<string, ConceptSummary[]>();
  for (const s of summaries) {
    if (!byCourse.has(s.courseId)) byCourse.set(s.courseId, []);
    byCourse.get(s.courseId)!.push(s);
  }
  for (const [courseId, courseConcepts] of byCourse) {
    const avg = courseConcepts.reduce((sum, c) => sum + c.masteryScore, 0) / courseConcepts.length;
    if (avg >= READY_FOR_NEXT_THRESHOLD) {
      recommendations.push({
        id: `ready-${courseId}`,
        type: "READY_FOR_NEXT",
        urgency: "LOW",
        title: `You're ready for the capstone`,
        reason: `You're averaging ${Math.round(avg * 100)}% across every concept tested so far in ${courseConcepts[0].courseTitle}.`,
        evidence: courseConcepts.map(
          (c) => `${c.name}: ${Math.round(c.masteryScore * 100)}% (${c.correctAttempts}/${c.attempts})`
        ),
        courseId,
        actionUrl: `/courses/${courseId}`,
        estimatedMinutes: 0
      });
    }
  }

  const urgencyRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  recommendations.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);

  const profile = await prisma.learningProfile.findUnique({ where: { userId } });

  return {
    strengths,
    weaknesses,
    recommendations,
    learningStreak: profile?.learningStreak ?? 0
  };
}

/** Bumps the daily learning streak — call on any meaningful activity. */
export async function touchLearningStreak(userId: string) {
  const profile = await prisma.learningProfile.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });

  const now = new Date();
  const last = profile.lastActiveAt;
  const isSameDay = last && last.toDateString() === now.toDateString();
  if (isSameDay) return;

  const isConsecutiveDay =
    last && now.getTime() - last.getTime() < 1000 * 60 * 60 * 48 && now.getTime() - last.getTime() > 0;

  await prisma.learningProfile.update({
    where: { userId },
    data: {
      learningStreak: isConsecutiveDay ? profile.learningStreak + 1 : 1,
      lastActiveAt: now
    }
  });
}
