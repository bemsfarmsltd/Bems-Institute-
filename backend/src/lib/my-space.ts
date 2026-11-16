// "My Space": everything that makes the dashboard about one student — their
// own goal, tutor, class type, cohort countdown, where they stopped, this
// week's study time against their own weekly target, and their latest
// feedback. One call (GET /api/lms/my-space) so the UI doesn't stitch it
// together from five endpoints.
//
// Privacy: every query here is scoped to the caller's own userId. Meeting
// links are only returned for courses the student can actually open
// (paid AND confirmed, hasCourseAccess), same as the community link.

import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/api-auth";
import { getCommunityUrl } from "@/lib/community";

export const GOAL_TYPES = ["JOB", "FREELANCE", "OWN_PRODUCT", "UPSKILL", "OTHER"] as const;
export const EXPERIENCE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const LIMITS = { goal: 160, motivation: 280, minHours: 1, maxHours: 60 };

// BEMS is in Umuahia: weeks, days and greetings are Lagos time (UTC+1, no DST),
// not the server's UTC.
const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Monday 00:00 Lagos time of the week containing `now`, as a UTC Date. */
export function lagosWeekStart(now: Date = new Date()): Date {
  const local = new Date(now.getTime() + LAGOS_OFFSET_MS);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(midnight - daysSinceMonday * DAY_MS - LAGOS_OFFSET_MS);
}

export function lagosGreeting(now: Date = new Date()): string {
  const hour = new Date(now.getTime() + LAGOS_OFFSET_MS).getUTCHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Lesson.duration is "mm:ss" or "h:mm:ss"; returns whole minutes (0 if unparseable). */
export function durationMinutes(duration: string): number {
  const parts = duration.split(":").map((p) => Number(p));
  if (parts.length < 2 || parts.length > 3 || parts.some((n) => !Number.isFinite(n) || n < 0)) return 0;
  const [h, m, s] = parts.length === 3 ? parts : [0, parts[0], parts[1]];
  return Math.round(h * 60 + m + s / 60);
}

/** Strips control characters and collapses whitespace in student-typed text. */
function cleanText(value: unknown, max: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new ProfileError("Text fields must be text.");
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length > max) throw new ProfileError(`Please keep it under ${max} characters.`);
  return cleaned || null;
}

export class ProfileError extends Error {}

export interface ProfileInput {
  goalType?: unknown;
  goal?: unknown;
  experienceLevel?: unknown;
  weeklyHours?: unknown;
  motivation?: unknown;
}

/** Validates and saves the welcome answers. Any field may be omitted (partial update). */
export async function saveSpaceProfile(userId: string, input: ProfileInput) {
  const data: {
    goalType?: string;
    learningGoal?: string | null;
    experienceLevel?: string;
    weeklyHours?: number;
    motivation?: string | null;
  } = {};

  if (input.goalType !== undefined) {
    if (!GOAL_TYPES.includes(input.goalType as GoalType)) throw new ProfileError("Choose one of the goals listed.");
    data.goalType = input.goalType as GoalType;
  }
  if (input.experienceLevel !== undefined) {
    if (!EXPERIENCE_LEVELS.includes(input.experienceLevel as ExperienceLevel)) {
      throw new ProfileError("Choose Beginner, Intermediate or Advanced.");
    }
    data.experienceLevel = input.experienceLevel as ExperienceLevel;
  }
  if (input.weeklyHours !== undefined) {
    // Numbers only (or a numeric string from a form): Number(true) is 1.
    const raw = input.weeklyHours;
    const hours = typeof raw === "number" ? raw : typeof raw === "string" && /^\d+$/.test(raw.trim()) ? Number(raw) : NaN;
    if (!Number.isInteger(hours) || hours < LIMITS.minHours || hours > LIMITS.maxHours) {
      throw new ProfileError(`Weekly study time must be between ${LIMITS.minHours} and ${LIMITS.maxHours} hours.`);
    }
    data.weeklyHours = hours;
  }
  const goal = cleanText(input.goal, LIMITS.goal);
  if (goal !== undefined) data.learningGoal = goal;
  const motivation = cleanText(input.motivation, LIMITS.motivation);
  if (motivation !== undefined) data.motivation = motivation;

  const existing = await prisma.learningProfile.findUnique({ where: { userId } });
  const merged = { ...existing, ...data };
  // "Onboarded" once the three questions that drive the dashboard are answered.
  const complete = Boolean(merged.goalType && merged.weeklyHours && merged.experienceLevel);
  const onboardedAt = existing?.onboardedAt ?? (complete ? new Date() : null);

  const saved = await prisma.learningProfile.upsert({
    where: { userId },
    update: { ...data, onboardedAt },
    create: { userId, ...data, onboardedAt }
  });
  return mapProfile(saved);
}

function mapProfile(p: {
  goalType: string | null;
  learningGoal: string | null;
  experienceLevel: string | null;
  weeklyHours: number | null;
  motivation: string | null;
  onboardedAt: Date | null;
} | null) {
  if (!p) return null;
  return {
    goalType: p.goalType,
    goal: p.learningGoal,
    experienceLevel: p.experienceLevel,
    weeklyHours: p.weeklyHours,
    motivation: p.motivation,
    onboardedAt: p.onboardedAt
  };
}

function cohortPhase(cohort: { name: string; startDate: Date; endDate: Date } | null, now: Date) {
  if (!cohort) return null;
  const days = (d: Date) => Math.max(0, Math.ceil((d.getTime() - now.getTime()) / DAY_MS));
  const phase = now < cohort.startDate ? "BEFORE_START" : now <= cohort.endDate ? "IN_PROGRESS" : "FINISHED";
  return {
    name: cohort.name,
    startDate: cohort.startDate,
    endDate: cohort.endDate,
    phase,
    daysToStart: phase === "BEFORE_START" ? days(cohort.startDate) : 0,
    daysToEnd: phase === "FINISHED" ? 0 : days(cohort.endDate)
  };
}

export async function getMySpace(user: { id: string; role: string }, now: Date = new Date()) {
  const weekStart = lagosWeekStart(now);
  const isStaff = user.role === "INSTRUCTOR" || user.role === "ADMIN";

  // The name from the database, not the session cookie (stale after a rename).
  const [account, profile, enrollments, completed, latestGraded] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { name: true } }),
    prisma.learningProfile.findUnique({ where: { userId: user.id } }),
    prisma.enrollment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, courseId: true, status: true, paymentStatus: true, deliveryMode: true,
        cohort: { select: { name: true, startDate: true, endDate: true } },
        course: {
          select: {
            id: true, slug: true, title: true, tutor: true, tutorRole: true, color: true,
            modules: {
              orderBy: { order: "asc" },
              select: { title: true, lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, duration: true } } }
            }
          }
        }
      }
    }),
    prisma.userProgress.findMany({
      where: { userId: user.id, isCompleted: true },
      select: { lessonId: true, completedAt: true, lesson: { select: { duration: true } } }
    }),
    prisma.submission.findMany({
      where: { userId: user.id, status: "GRADED" },
      orderBy: { gradedAt: "desc" },
      select: { score: true, feedback: true, gradedBy: true, gradedAt: true, assignment: { select: { title: true, courseId: true } } }
    })
  ]);

  const doneIds = new Set(completed.map((c) => c.lessonId));
  const accessCourseIds = enrollments.filter(hasCourseAccess).map((e) => e.courseId);

  const sessions = accessCourseIds.length
    ? await prisma.liveSession.findMany({
        where: { courseId: { in: accessCourseIds }, scheduledAt: { gte: new Date(now.getTime() - 90 * 60 * 1000) } },
        orderBy: { scheduledAt: "asc" },
        select: { courseId: true, title: true, scheduledAt: true, meetingUrl: true, type: true }
      })
    : [];

  const courses = enrollments.map((e) => {
    const access = hasCourseAccess(e);
    const lessons = e.course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
    const done = lessons.filter((l) => doneIds.has(l.id)).length;
    const next = lessons.find((l) => !doneIds.has(l.id)) ?? null;
    const session = sessions.find((s) => s.courseId === e.courseId) ?? null;
    const feedback = latestGraded.find((s) => s.assignment.courseId === e.courseId) ?? null;
    return {
      enrollmentId: e.id,
      courseId: e.courseId,
      slug: e.course.slug,
      title: e.course.title,
      color: e.course.color,
      tutor: e.course.tutor,
      tutorRole: e.course.tutorRole,
      deliveryMode: e.deliveryMode,
      hasAccess: access,
      cohort: cohortPhase(e.cohort, now),
      progress: { completed: done, total: lessons.length, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0 },
      // Only a confirmed student gets lesson links; a pending one sees the
      // course but not where to click yet.
      nextLesson: access && next
        ? { id: next.id, title: next.title, moduleTitle: next.moduleTitle, href: `/learn/${e.course.slug}/${next.id}` }
        : null,
      nextLiveSession: session
        ? { title: session.title, type: session.type, scheduledAt: session.scheduledAt, meetingUrl: session.meetingUrl }
        : null,
      latestFeedback: feedback
        ? { assignmentTitle: feedback.assignment.title, score: feedback.score, feedback: feedback.feedback, gradedBy: feedback.gradedBy, gradedAt: feedback.gradedAt }
        : null
    };
  });

  const thisWeek = completed.filter((c) => c.completedAt >= weekStart);
  const minutesStudied = thisWeek.reduce((sum, c) => sum + durationMinutes(c.lesson.duration), 0);
  const goalMinutes = profile?.weeklyHours ? profile.weeklyHours * 60 : null;

  return {
    firstName: account.name.trim().split(/\s+/)[0] || account.name,
    greeting: lagosGreeting(now),
    // Show the welcome setup until this is true. Staff aren't asked.
    onboarded: isStaff || Boolean(profile?.onboardedAt),
    profile: mapProfile(profile),
    courses,
    week: {
      startsAt: weekStart,
      lessonsCompleted: thisWeek.length,
      minutesStudied,
      goalMinutes,
      percentOfGoal: goalMinutes ? Math.min(100, Math.round((minutesStudied / goalMinutes) * 100)) : null
    },
    streak: profile?.learningStreak ?? 0,
    communityUrl: isStaff || accessCourseIds.length ? await getCommunityUrl() : null
  };
}
