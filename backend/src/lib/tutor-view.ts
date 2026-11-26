// Tutor view: each tutor sees the students of the courses they teach (set by
// an admin in CourseInstructor; admins see every course), with progress,
// streak and the signs that a student is stuck, so they can step in early.
//
// Privacy: the student's goal, level and weekly hours appear only if the
// student shares them (LearningProfile.shareWithTutor). "Why I joined",
// notes, bookmarks and payment details never appear here. Contact details
// (email, phone) are only in the single-student view, for reaching out.

import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/api-auth";
import { safeLink } from "@/lib/portfolio";
import { ACTIVE_EVENTS, dayStreak, lagosDateKey, lagosWeekStart, lessonMinutesBetween } from "@/lib/my-space";

const DAY_MS = 24 * 60 * 60 * 1000;
export const INACTIVE_DAYS = 7;
export const NOT_STARTED_DAYS = 5;
export const LOW_QUIZ_SCORE = 50;
export const WEAK_MASTERY = 0.5;

export class TutorViewError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const GOAL_LABELS: Record<string, string> = {
  JOB: "Get a tech job",
  FREELANCE: "Freelance",
  OWN_PRODUCT: "Build their own product",
  UPSKILL: "Grow in their current job",
  OTHER: "Learn at their own pace"
};

export type FlagKind = "INACTIVE" | "NOT_STARTED" | "BEHIND_GOAL" | "LOW_QUIZ" | "RESUBMIT" | "WEAK_TOPICS";

/** Course ids this staff member may see: every course for an admin, their assigned ones for a tutor. */
export async function tutorCourseIds(session: { id: string; role: string }): Promise<string[]> {
  if (session.role === "ADMIN") return (await prisma.course.findMany({ select: { id: true } })).map((c) => c.id);
  if (session.role !== "INSTRUCTOR" && !(session as { roles?: string[] }).roles?.includes("INSTRUCTOR")) return [];
  return (await prisma.courseInstructor.findMany({ where: { userId: session.id }, select: { courseId: true } })).map((c) => c.courseId);
}

async function courseData(courseId: string) {
  return prisma.course.findUniqueOrThrow({
    where: { id: courseId },
    select: {
      id: true, title: true, slug: true, color: true,
      modules: { orderBy: { order: "asc" }, select: { title: true, lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, duration: true } } } },
      quizzes: { select: { id: true } },
      assignments: { select: { id: true } },
      concepts: { select: { id: true, name: true } }
    }
  });
}

type CourseData = Awaited<ReturnType<typeof courseData>>;

/** One row per confirmed student of the course: progress, activity and "stuck" signs. */
async function studentRows(course: CourseData, now: Date, onlyUserId?: string) {
  const enrollments = (
    await prisma.enrollment.findMany({
      where: { courseId: course.id, user: { role: "STUDENT", deactivatedAt: null }, ...(onlyUserId ? { userId: onlyUserId } : {}) },
      select: {
        id: true, status: true, paymentStatus: true, deliveryMode: true, createdAt: true, updatedAt: true,
        cohort: { select: { name: true } },
        user: {
          select: {
            id: true, name: true, avatarUrl: true,
            learningProfile: { select: { shareWithTutor: true, goalType: true, learningGoal: true, experienceLevel: true, weeklyHours: true } }
          }
        }
      }
    })
  ).filter(hasCourseAccess);
  if (enrollments.length === 0) return [];

  const userIds = enrollments.map((e) => e.user.id);
  const lessons = course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
  const since = new Date(now.getTime() - 120 * DAY_MS);
  const [completions, events, attempts, submissions, masteries] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId: { in: userIds }, isCompleted: true, lessonId: { in: lessons.map((l) => l.id) } },
      select: { userId: true, lessonId: true, completedAt: true, lesson: { select: { duration: true } } }
    }),
    prisma.learningEvent.findMany({
      where: { userId: { in: userIds }, createdAt: { gte: since }, eventType: { in: [...ACTIVE_EVENTS] } },
      select: { userId: true, createdAt: true }
    }),
    prisma.quizAttempt.findMany({
      where: { userId: { in: userIds }, quizId: { in: course.quizzes.map((q) => q.id) } },
      orderBy: { createdAt: "desc" },
      select: { userId: true, score: true, createdAt: true }
    }),
    prisma.submission.findMany({
      where: { userId: { in: userIds }, assignmentId: { in: course.assignments.map((a) => a.id) } },
      orderBy: { updatedAt: "desc" },
      select: { userId: true, status: true, score: true }
    }),
    course.concepts.length
      ? prisma.conceptMastery.findMany({
          where: { userId: { in: userIds }, conceptId: { in: course.concepts.map((c) => c.id) }, attempts: { gte: 2 }, masteryScore: { lt: WEAK_MASTERY } },
          orderBy: { masteryScore: "asc" },
          select: { userId: true, concept: { select: { name: true } } }
        })
      : Promise.resolve([])
  ]);

  const weekStart = lagosWeekStart(now);
  const lastWeekStart = new Date(weekStart.getTime() - 7 * DAY_MS);

  return enrollments.map((e) => {
    const uid = e.user.id;
    const p = e.user.learningProfile;
    const shared = Boolean(p?.shareWithTutor);
    const done = completions.filter((c) => c.userId === uid);
    const doneIds = new Set(done.map((c) => c.lessonId));
    const next = lessons.find((l) => !doneIds.has(l.id)) ?? null;
    const activity = [...events.filter((x) => x.userId === uid).map((x) => x.createdAt), ...done.map((c) => c.completedAt)];
    const lastActiveAt = activity.length ? new Date(Math.max(...activity.map((d) => d.getTime()))) : null;
    const activeDays = new Set(activity.map(lagosDateKey));
    const myAttempts = attempts.filter((a) => a.userId === uid);
    const mySubs = submissions.filter((s) => s.userId === uid);
    const weak = masteries.filter((m) => m.userId === uid).map((m) => m.concept.name).slice(0, 3);
    const goalMinutes = shared && p?.weeklyHours ? p.weeklyHours * 60 : null;
    const lastWeekMinutes = lessonMinutesBetween(done, lastWeekStart, weekStart);
    const latestQuiz = myAttempts[0] ?? null;
    const latestGraded = mySubs.find((s) => s.status === "GRADED") ?? null;
    // Days since the student could start (registration confirmed ~ last change to it).
    const confirmedDays = (now.getTime() - e.updatedAt.getTime()) / DAY_MS;

    const flags: { kind: FlagKind; label: string }[] = [];
    if (done.length === 0 && !lastActiveAt) {
      if (confirmedDays >= NOT_STARTED_DAYS) flags.push({ kind: "NOT_STARTED", label: "Hasn't started any lessons yet" });
    } else if (lastActiveAt && now.getTime() - lastActiveAt.getTime() >= INACTIVE_DAYS * DAY_MS) {
      const days = Math.floor((now.getTime() - lastActiveAt.getTime()) / DAY_MS);
      flags.push({ kind: "INACTIVE", label: `No activity for ${days} days` });
    }
    if (goalMinutes && next && lastWeekMinutes < goalMinutes / 2) {
      flags.push({ kind: "BEHIND_GOAL", label: `Studied ${lastWeekMinutes} of ${goalMinutes} min last week` });
    }
    if (latestQuiz && latestQuiz.score < LOW_QUIZ_SCORE) flags.push({ kind: "LOW_QUIZ", label: `Latest quiz score ${latestQuiz.score}%` });
    if (mySubs.some((s) => s.status === "RESUBMISSION_REQUESTED")) flags.push({ kind: "RESUBMIT", label: "Asked to resubmit a project" });
    if (weak.length) flags.push({ kind: "WEAK_TOPICS", label: `Finding hard: ${weak.join(", ")}` });

    return {
      userId: uid,
      enrollmentId: e.id,
      name: e.user.name,
      avatarUrl: e.user.avatarUrl,
      courseId: course.id,
      courseTitle: course.title,
      cohortName: e.cohort?.name ?? null,
      deliveryMode: e.deliveryMode,
      status: e.status,
      // Only if the student chose to share it with their tutor.
      goal: shared && p
        ? { goalType: p.goalType, goalLabel: p.goalType ? GOAL_LABELS[p.goalType] ?? p.goalType : null, goal: p.learningGoal, experienceLevel: p.experienceLevel, weeklyHours: p.weeklyHours }
        : null,
      progress: { completed: done.length, total: lessons.length, percent: lessons.length ? Math.round((done.length / lessons.length) * 100) : 0 },
      currentLesson: next ? { title: next.title, moduleTitle: next.moduleTitle } : null,
      lastActiveAt,
      streakDays: dayStreak(activeDays, now),
      week: { minutesStudied: lessonMinutesBetween(done, weekStart, new Date(weekStart.getTime() + 7 * DAY_MS)), goalMinutes },
      projects: {
        submitted: mySubs.length,
        awaitingGrade: mySubs.filter((s) => s.status === "SUBMITTED").length,
        latestScore: latestGraded?.score ?? null
      },
      quiz: { attempts: myAttempts.length, latestScore: latestQuiz?.score ?? null },
      flags,
      needsAttention: flags.length > 0
    };
  });
}

/** Students across the tutor's courses (or one of them), those needing attention first. */
export async function listTutorStudents(session: { id: string; role: string }, courseId?: string, now: Date = new Date()) {
  const allowed = await tutorCourseIds(session);
  if (courseId && !allowed.includes(courseId)) throw new TutorViewError("You don't teach this course.", 403);
  const ids = courseId ? [courseId] : allowed;
  const courses = await Promise.all(ids.map(courseData));
  const students = (await Promise.all(courses.map((c) => studentRows(c, now)))).flat();
  students.sort((a, b) =>
    Number(b.needsAttention) - Number(a.needsAttention) ||
    b.flags.length - a.flags.length ||
    (a.lastActiveAt?.getTime() ?? 0) - (b.lastActiveAt?.getTime() ?? 0)
  );
  const courseList = await prisma.course.findMany({ where: { id: { in: allowed } }, orderBy: { title: "asc" }, select: { id: true, title: true, slug: true, color: true } });
  return {
    courses: courseList,
    students,
    summary: { total: students.length, needsAttention: students.filter((s) => s.needsAttention).length }
  };
}

const EVENT_LABELS: Record<string, string> = {
  LESSON_COMPLETED: "Finished a lesson",
  QUIZ_COMPLETED: "Completed a quiz",
  QUESTION_ANSWERED: "Answered a practice question",
  ASSIGNMENT_SUBMITTED: "Submitted a project",
  ASSIGNMENT_GRADED: "Project graded",
  AI_TUTOR_USED: "Asked the AI tutor"
};

/** One student in one course: the row above plus their journey, recent activity, quizzes, projects and contact details. */
export async function getTutorStudent(session: { id: string; role: string }, courseId: string, userId: string, now: Date = new Date()) {
  const allowed = await tutorCourseIds(session);
  if (!allowed.includes(courseId)) throw new TutorViewError("You don't teach this course.", 403);
  const course = await courseData(courseId);
  const [row] = await studentRows(course, now, userId);
  if (!row) throw new TutorViewError("Student not found in this course.", 404);

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const [contact, done, events, attempts, submissions] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true, phone: true } }),
    prisma.userProgress.findMany({ where: { userId, isCompleted: true, lessonId: { in: lessonIds } }, select: { lessonId: true } }),
    prisma.learningEvent.findMany({
      where: { userId, OR: [{ courseId }, { courseId: course.slug }, { lessonId: { in: lessonIds } }] },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { eventType: true, lessonId: true, createdAt: true }
    }),
    prisma.quizAttempt.findMany({
      where: { userId, quiz: { courseId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { score: true, passed: true, createdAt: true, quiz: { select: { title: true } } }
    }),
    prisma.submission.findMany({
      where: { userId, assignment: { courseId } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, status: true, score: true, githubUrl: true, liveDemoUrl: true, createdAt: true, gradedAt: true, assignment: { select: { title: true, type: true } } }
    })
  ]);
  const doneIds = new Set(done.map((d) => d.lessonId));
  const lessonTitles = new Map(course.modules.flatMap((m) => m.lessons.map((l) => [l.id, l.title] as const)));
  const firstOpen = course.modules.findIndex((m) => m.lessons.some((l) => !doneIds.has(l.id)));

  return {
    ...row,
    contact,
    modules: course.modules.map((m, i) => {
      const completed = m.lessons.filter((l) => doneIds.has(l.id)).length;
      const status = m.lessons.length > 0 && completed === m.lessons.length ? "DONE" : i === firstOpen ? "CURRENT" : "UPCOMING";
      return { title: m.title, completed, total: m.lessons.length, status };
    }),
    recentActivity: events.map((ev) => ({
      type: ev.eventType,
      label: EVENT_LABELS[ev.eventType] ?? ev.eventType,
      lessonTitle: ev.lessonId ? lessonTitles.get(ev.lessonId) ?? null : null,
      at: ev.createdAt
    })),
    quizAttempts: attempts.map((a) => ({ quizTitle: a.quiz.title, score: a.score, passed: a.passed, at: a.createdAt })),
    submissions: submissions.map((s) => ({
      id: s.id, title: s.assignment.title, type: s.assignment.type, status: s.status, score: s.score,
      githubUrl: safeLink(s.githubUrl), liveDemoUrl: safeLink(s.liveDemoUrl), submittedAt: s.createdAt, gradedAt: s.gradedAt
    }))
  };
}

// ---- Admin: who teaches what ------------------------------------------------

export async function listCourseTutors() {
  const [courses, staff] = await Promise.all([
    prisma.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, tutor: true, instructors: { select: { user: { select: { id: true, name: true, email: true } } } } }
    }),
    prisma.user.findMany({
      where: { role: { in: ["INSTRUCTOR", "ADMIN"] }, deactivatedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true }
    })
  ]);
  return {
    courses: courses.map((c) => ({ id: c.id, title: c.title, catalogueTutor: c.tutor, tutors: c.instructors.map((i) => i.user) })),
    staff
  };
}

export async function setCourseTutors(courseId: string, userIds: unknown) {
  if (!Array.isArray(userIds) || userIds.some((id) => typeof id !== "string") || userIds.length > 20) {
    throw new TutorViewError("Send the list of tutor ids for this course.");
  }
  const ids = [...new Set(userIds as string[])];
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) throw new TutorViewError("Course not found.", 404);
  const valid = await prisma.user.count({ where: { id: { in: ids }, role: { in: ["INSTRUCTOR", "ADMIN"] }, deactivatedAt: null } });
  if (valid !== ids.length) throw new TutorViewError("Only active staff accounts can be tutors.");
  await prisma.$transaction([
    prisma.courseInstructor.deleteMany({ where: { courseId, userId: { notIn: ids } } }),
    ...ids.map((userId) =>
      prisma.courseInstructor.upsert({ where: { userId_courseId: { userId, courseId } }, update: {}, create: { userId, courseId } })
    )
  ]);
  return listCourseTutors();
}
