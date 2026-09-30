import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { mapCourse, mapQuiz, mapAssignment, mapCertificate, mapSubmission } from "@/lib/lms-mappers";
import {
  recordLessonCompleted,
  recordQuestionAnswered,
  recordQuizCompleted,
  recordAssignmentSubmitted,
  touchLearningStreak
} from "@/lib/learning-engine";
import { createNotification, notifyStaff, formatRelativeTime } from "@/lib/notifications";
import { creditReferralIfEligible } from "@/lib/referrals";
import { computeLeaderboard } from "@/lib/leaderboard";
import type { QuizResult } from "@/types/lms";
import type { NotificationCategory } from "@prisma/client";

const router = Router();

// Public: course catalog (content, not enrollment-gated) plus the full
// certificate registry, which is intentionally public — /verify and
// /certificate let anyone look up a credential by ID without signing in.
router.get("/catalog", async (_req, res) => {
  const [courses, quizzes, assignments, certificates] = await Promise.all([
    prisma.course.findMany({ where: { isPublished: true }, include: { modules: { include: { lessons: true } } } }),
    prisma.quiz.findMany({ include: { questions: true } }),
    prisma.assignment.findMany(),
    prisma.certificate.findMany({ include: { user: { select: { name: true } }, course: { select: { title: true } } } })
  ]);

  return res.json({
    courses: courses.map(mapCourse),
    quizzes: quizzes.map(mapQuiz),
    assignments: assignments.map(mapAssignment),
    certificates: certificates.map(mapCertificate)
  });
});

// Auth required, any role: real XP/rank computed from every student's actual
// completed lessons, quiz scores, certificates, and streak — see
// computeLeaderboard for the (documented, intentionally simple) formula.
router.get("/leaderboard", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const leaderboard = await computeLeaderboard(session.id);
  return res.json({ leaderboard });
});

// Auth required: the current user's own enrollment/progress/quiz state, plus
// submissions — their own if STUDENT, everyone's if INSTRUCTOR/ADMIN (the
// grading queue needs to see all of them).
router.get("/me", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const isStaff = session.role === "INSTRUCTOR" || session.role === "ADMIN";

  const [enrollments, progress, quizAttempts, submissions] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId: session.id }, select: { courseId: true } }),
    prisma.userProgress.findMany({ where: { userId: session.id, isCompleted: true }, select: { lessonId: true } }),
    prisma.quizAttempt.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } }),
    prisma.submission.findMany({
      where: isStaff ? {} : { userId: session.id },
      include: { user: { select: { name: true, email: true } }, assignment: { select: { courseId: true } } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const quizResults: Record<string, QuizResult> = {};
  for (const attempt of quizAttempts) {
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

  return res.json({
    enrolledCourseIds: enrollments.map((e) => e.courseId),
    completedLessonIds: progress.map((p) => p.lessonId),
    quizResults,
    submissions: submissions.map(mapSubmission)
  });
});

router.post("/enroll", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const body = req.body ?? {};
  const courseId = typeof body.courseId === "string" ? body.courseId : "";
  const source = typeof body.source === "string" && body.source.trim() ? body.source.trim() : "website";
  const deliveryMode: "PHYSICAL_LAB" | "VIRTUAL_ZOOM" = body.deliveryMode === "VIRTUAL_ZOOM" ? "VIRTUAL_ZOOM" : "PHYSICAL_LAB";
  const paymentPlan = body.paymentPlan === "installment" ? "installment" : "full";
  const paymentMethod = body.paymentMethod === "paystack" || body.paymentMethod === "bank" ? body.paymentMethod : null;

  if (!courseId) {
    return res.status(400).json({ error: "courseId is required." });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        take: 1,
        include: { lessons: { orderBy: { order: "asc" }, take: 1, select: { id: true } } }
      }
    }
  });
  if (!course) {
    return res.status(404).json({ error: "Course not found." });
  }

  const totalDue = paymentPlan === "installment" ? course.priceParts : course.priceFull;
  let amountPaid: number | undefined;
  let paymentStatus: "PENDING" | "PARTIAL" | "PAID_FULL" | undefined;

  if (paymentMethod === "paystack") {
    amountPaid = paymentPlan === "installment" ? course.deposit : totalDue;
    paymentStatus = amountPaid >= totalDue ? "PAID_FULL" : "PARTIAL";
  } else if (paymentMethod === "bank") {
    amountPaid = 0;
    paymentStatus = "PENDING";
  }

  const activeCohort = await prisma.cohort.findFirst({ orderBy: { createdAt: "desc" } });

  const baseData = {
    source,
    deliveryMode,
    paymentPlan,
    totalDue,
    ...(amountPaid !== undefined ? { amountPaid } : {}),
    ...(paymentStatus !== undefined ? { paymentStatus } : {}),
    ...(activeCohort ? { cohortId: activeCohort.id } : {})
  };

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: session.id, courseId } },
    update: baseData,
    create: { userId: session.id, courseId, status: "ACTIVE", ...baseData }
  });

  if (amountPaid && amountPaid > 0) {
    await creditReferralIfEligible(session.id);
  }

  const firstLessonId = course.modules[0]?.lessons[0]?.id ?? "les-1";
  const paymentSummary =
    paymentMethod === "paystack" && amountPaid
      ? `Payment of ₦${amountPaid.toLocaleString()} confirmed via Paystack.`
      : paymentMethod === "bank"
      ? "Bank transfer logged (pending admin verification)."
      : "Your classroom access is now unlocked.";

  await createNotification({
    userId: session.id,
    title: `Enrolled in ${course.title}`,
    message: `${paymentSummary} Click to start Lesson 1.`,
    category: paymentMethod ? "PAYMENT" : "CLASS",
    linkUrl: `/learn/${course.slug}/${firstLessonId}`
  });

  const enrollments = await prisma.enrollment.findMany({ where: { userId: session.id }, select: { courseId: true } });
  return res.json({ enrolledCourseIds: enrollments.map((e) => e.courseId) });
});

router.post("/progress", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const lessonId = typeof req.body?.lessonId === "string" ? req.body.lessonId : "";
  if (!lessonId) {
    return res.status(400).json({ error: "lessonId is required." });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: { select: { courseId: true } } } });
  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found." });
  }

  const existing = await prisma.userProgress.findUnique({ where: { userId_lessonId: { userId: session.id, lessonId } } });

  if (existing) {
    await prisma.userProgress.delete({ where: { id: existing.id } });
  } else {
    await prisma.userProgress.create({ data: { userId: session.id, lessonId, isCompleted: true } });
    await recordLessonCompleted({ userId: session.id, courseId: lesson.module.courseId, lessonId });
    await touchLearningStreak(session.id);
  }

  const progress = await prisma.userProgress.findMany({ where: { userId: session.id, isCompleted: true }, select: { lessonId: true } });
  return res.json({ completedLessonIds: progress.map((p) => p.lessonId) });
});

// Score is computed here from the DB's answer key, never trusted from the
// client — a student can't just POST { score: 100 }.
router.post("/quiz-attempts", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const body = req.body ?? {};
  const quizId = typeof body.quizId === "string" ? body.quizId : "";
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
  if (!quizId) {
    return res.status(400).json({ error: "quizId is required." });
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { questions: true, course: { select: { slug: true } } } });
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found." });
  }

  let correctCount = 0;
  for (const q of quiz.questions) {
    if (answers[q.id] === q.correctOption) correctCount++;
  }
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  const attempt = await prisma.quizAttempt.create({ data: { userId: session.id, quizId, score, passed, answers } });

  for (const q of quiz.questions) {
    await recordQuestionAnswered({
      userId: session.id,
      courseId: quiz.courseId,
      questionId: q.id,
      correct: answers[q.id] === q.correctOption
    });
  }
  await recordQuizCompleted({ userId: session.id, courseId: quiz.courseId, quizId, score, passed });
  await touchLearningStreak(session.id);

  await createNotification({
    userId: session.id,
    title: passed ? `Quiz Passed (${score}%): ${quiz.title}` : `Quiz Completed (${score}%): ${quiz.title}`,
    message: passed
      ? "Your LearnIQ Concept Mastery scores and study recommendations have been updated."
      : `Passing score is ${quiz.passingScore}%. Check your LearnIQ Insights for targeted review lessons.`,
    category: "GAMIFICATION",
    linkUrl: "/dashboard"
  });

  const result: QuizResult = {
    quizId,
    userId: session.id,
    score,
    passed,
    selectedAnswers: answers,
    attemptedAt: attempt.createdAt.toISOString()
  };

  return res.json({ result });
});

router.post("/submissions", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const body = req.body ?? {};
  const assignmentId = typeof body.assignmentId === "string" ? body.assignmentId : "";
  const githubUrl = typeof body.githubUrl === "string" ? body.githubUrl.trim() : "";
  const liveDemoUrl = typeof body.liveDemoUrl === "string" ? body.liveDemoUrl.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!assignmentId || !githubUrl) {
    return res.status(400).json({ error: "assignmentId and githubUrl are required." });
  }

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, include: { course: { select: { slug: true, title: true } } } });
  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found." });
  }

  const submission = await prisma.submission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: session.id } },
    update: {
      githubUrl,
      liveDemoUrl: liveDemoUrl || null,
      notes: notes || null,
      status: "SUBMITTED",
      score: null,
      feedback: null,
      gradedBy: null,
      gradedAt: null
    },
    create: { assignmentId, userId: session.id, githubUrl, liveDemoUrl: liveDemoUrl || null, notes: notes || null, status: "SUBMITTED" },
    include: { user: { select: { name: true, email: true } }, assignment: { select: { courseId: true } } }
  });

  await recordAssignmentSubmitted({ userId: session.id, courseId: assignment.courseId, assignmentId });
  await touchLearningStreak(session.id);

  await createNotification({
    userId: session.id,
    title: `Capstone Submitted: ${assignment.title}`,
    message: "Your repository has been placed in the instructor grading queue.",
    category: "GRADING",
    linkUrl: `/learn/${assignment.course.slug}/assignment/${assignmentId}`
  });

  await notifyStaff({
    title: `New Capstone Submission — ${session.name}`,
    message: `${session.name} submitted "${assignment.title}" (${assignment.course.title}) for review.`,
    category: "GRADING",
    linkUrl: "/instructor/grading"
  });

  return res.json({ submission: mapSubmission(submission) });
});

const CERT_PREFIX_BY_COURSE: Record<string, string> = {
  "web-dev": "WD",
  "ai-automation": "AI",
  "product-design": "UX",
  cybersecurity: "SEC"
};

function gradeTitleFor(score: number): string {
  if (score >= 90) return "Distinction (90%+)";
  if (score >= 75) return "Credit (75%+)";
  return "Pass";
}

router.post("/submissions/:id/grade", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
    return res.status(403).json({ error: "Instructor access required." });
  }

  const { id } = req.params;
  const score = Number(req.body?.score);
  const feedback = typeof req.body?.feedback === "string" ? req.body.feedback.trim() : "";

  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return res.status(400).json({ error: "score must be a number between 0 and 100." });
  }

  const existing = await prisma.submission.findUnique({
    where: { id },
    include: { assignment: { select: { id: true, title: true, courseId: true, course: { select: { slug: true, title: true } } } } }
  });
  if (!existing) {
    return res.status(404).json({ error: "Submission not found." });
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: { score, feedback: feedback || null, status: "GRADED", gradedBy: session.name, gradedAt: new Date() },
    include: { user: { select: { name: true, email: true } }, assignment: { select: { courseId: true } } }
  });

  await createNotification({
    userId: existing.userId,
    title: `Capstone Graded: ${score}/100`,
    message: feedback ? `${session.name}: "${feedback}"` : `${session.name} graded "${existing.assignment.title}" (${score}/100).`,
    category: "GRADING",
    linkUrl: `/learn/${existing.assignment.course.slug}/assignment/${existing.assignment.id}`
  });

  let certificate = null;
  if (score >= 70) {
    const courseId = existing.assignment.courseId;
    const prefix = CERT_PREFIX_BY_COURSE[courseId] || "TECH";
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const certNumber = `BEMS-CERT-2026-${prefix}-${randomCode}`;

    const cert = await prisma.certificate.upsert({
      where: { userId_courseId: { userId: existing.userId, courseId } },
      update: {},
      create: {
        certNumber,
        userId: existing.userId,
        courseId,
        gradeTitle: gradeTitleFor(score),
        finalScore: score,
        qrVerifyUrl: `/verify/${certNumber}`
      },
      include: { user: { select: { name: true } }, course: { select: { title: true } } }
    });
    certificate = mapCertificate(cert);

    await createNotification({
      userId: existing.userId,
      title: `Certificate Issued: ${cert.course.title}`,
      message: `Congratulations! Credential ${cert.certNumber} (${cert.gradeTitle}) is ready to view and download.`,
      category: "GRADING",
      linkUrl: `/certificate/${cert.id}`
    });
  }

  return res.json({ submission: mapSubmission(updated), certificate });
});

// Public, fire-and-forget: logs a banner/QR landing-page visit so the admin
// analytics dashboard can compute real scan-to-registration conversion.
router.post("/track-scan", async (req, res) => {
  const body = req.body ?? {};
  const source = typeof body.source === "string" ? body.source.trim() : "";
  const courseId = typeof body.courseId === "string" ? body.courseId : null;

  if (!source) {
    return res.status(400).json({ error: "source is required." });
  }

  await prisma.qrScan.create({ data: { source, courseId } });
  return res.json({ ok: true });
});

async function listFormattedNotifications(userId: string) {
  const records = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 });
  return records.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    category: n.category,
    timestamp: formatRelativeTime(n.createdAt),
    read: n.read,
    linkUrl: n.linkUrl ?? undefined
  }));
}

router.get("/notifications", async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.json({ notifications: [] });
    }

    const existingCount = await prisma.notification.count({ where: { userId: session.id } });

    if (existingCount === 0) {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          enrollments: {
            include: { course: { select: { title: true, slug: true } }, cohort: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 3
          },
          certificates: { include: { course: { select: { title: true } } }, orderBy: { issuedAt: "desc" }, take: 2 },
          submissions: {
            include: { assignment: { select: { id: true, title: true, course: { select: { slug: true } } } } },
            orderBy: { createdAt: "desc" },
            take: 2
          }
        }
      });

      if (user) {
        const seedItems: Array<{
          userId: string;
          title: string;
          message: string;
          category: NotificationCategory;
          read: boolean;
          linkUrl?: string;
        }> = [];

        for (const cert of user.certificates) {
          seedItems.push({
            userId: user.id,
            title: `Certificate Issued: ${cert.course.title}`,
            message: `Your verified credential (${cert.certNumber}) is ready to view and share.`,
            category: "GRADING",
            read: false,
            linkUrl: `/certificate/${cert.id}`
          });
        }

        for (const sub of user.submissions) {
          if (sub.status === "GRADED" || sub.status === "RESUBMISSION_REQUESTED") {
            seedItems.push({
              userId: user.id,
              title: sub.status === "GRADED" ? `Capstone Graded${sub.score !== null ? `: ${sub.score}/100` : ""}` : "Capstone Revision Requested",
              message: `${sub.assignment.title} has been reviewed by an instructor.`,
              category: "GRADING",
              read: false,
              linkUrl: `/learn/${sub.assignment.course.slug}/assignment/${sub.assignment.id}`
            });
          }
        }

        for (const enr of user.enrollments) {
          const cohortName = enr.cohort?.name ?? "Active Cohort";
          if (enr.paymentStatus === "PENDING") {
            seedItems.push({
              userId: user.id,
              title: "Pending Tuition Verification",
              message: `Your enrollment in ${enr.course.title} (${cohortName}) is awaiting payment confirmation.`,
              category: "PAYMENT",
              read: false,
              linkUrl: "/dashboard"
            });
          } else {
            seedItems.push({
              userId: user.id,
              title: `Enrolled: ${enr.course.title}`,
              message: `Welcome to the ${cohortName} cohort! Access your interactive curriculum and labs anytime.`,
              category: "CLASS",
              read: true,
              linkUrl: `/learn/${enr.course.slug}`
            });
          }
        }

        if (user.role === "INSTRUCTOR" || user.role === "ADMIN") {
          const pendingCount = await prisma.submission.count({ where: { status: "SUBMITTED" } });
          if (pendingCount > 0) {
            seedItems.push({
              userId: user.id,
              title: "Pending Capstone Reviews",
              message: `There ${pendingCount === 1 ? "is 1 student submission" : `are ${pendingCount} student submissions`} awaiting instructor grading.`,
              category: "GRADING",
              read: false,
              linkUrl: "/instructor/grading"
            });
          }
        }

        if (seedItems.length === 0) {
          seedItems.push({
            userId: user.id,
            title: "Welcome to BICTDA Academy",
            message: `Hello ${user.name}! Explore industry-aligned tracks, interactive labs, and AI tutoring.`,
            category: "GAMIFICATION",
            read: false,
            linkUrl: "/courses"
          });
        }

        await prisma.notification.createMany({ data: seedItems });
      }
    }

    const notifications = await listFormattedNotifications(session.id);
    return res.json({ notifications });
  } catch (error) {
    console.error("GET /lms/notifications error:", error);
    return res.status(500).json({ error: "Failed to load notifications" });
  }
});

router.patch("/notifications", async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const body = req.body ?? {};
    const { id, markAll, markAllRead } = body as { id?: string; markAll?: boolean; markAllRead?: boolean };

    if (markAll || markAllRead) {
      await prisma.notification.updateMany({ where: { userId: session.id, read: false }, data: { read: true } });
    } else if (id) {
      await prisma.notification.updateMany({ where: { id, userId: session.id }, data: { read: true } });
    } else {
      return res.status(400).json({ error: "Provide notification id or markAllRead: true" });
    }

    const notifications = await listFormattedNotifications(session.id);
    return res.json({ notifications });
  } catch (error) {
    console.error("PATCH /lms/notifications error:", error);
    return res.status(500).json({ error: "Failed to update notification status" });
  }
});

export default router;
