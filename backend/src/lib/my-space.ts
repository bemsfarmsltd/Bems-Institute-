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
import { isAccentColor, isBanner, resolveAppearance, ACCENT_COLORS, BANNERS } from "@/lib/appearance";
import { awardBadges, listBadges, type BadgeStats } from "@/lib/badges";

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
  weeklyRecapEmail?: unknown;
  accentColor?: unknown;
  banner?: unknown;
}

/** Validates and saves the welcome answers. Any field may be omitted (partial update). */
export async function saveSpaceProfile(userId: string, input: ProfileInput) {
  const data: {
    goalType?: string;
    learningGoal?: string | null;
    experienceLevel?: string;
    weeklyHours?: number;
    motivation?: string | null;
    weeklyRecapEmail?: boolean;
    accentColor?: string | null;
    banner?: string | null;
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
  if (input.weeklyRecapEmail !== undefined) {
    if (typeof input.weeklyRecapEmail !== "boolean") throw new ProfileError("Choose on or off for the weekly email.");
    data.weeklyRecapEmail = input.weeklyRecapEmail;
  }
  // null resets to the default look.
  if (input.accentColor !== undefined) {
    if (input.accentColor !== null && !isAccentColor(input.accentColor)) throw new ProfileError(`Choose one of: ${Object.keys(ACCENT_COLORS).join(", ")}.`);
    data.accentColor = input.accentColor as string | null;
  }
  if (input.banner !== undefined) {
    if (input.banner !== null && !isBanner(input.banner)) throw new ProfileError(`Choose one of: ${BANNERS.join(", ")}.`);
    data.banner = input.banner as string | null;
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
  weeklyRecapEmail: boolean;
  accentColor: string | null;
  banner: string | null;
} | null) {
  if (!p) return null;
  return {
    goalType: p.goalType,
    goal: p.learningGoal,
    experienceLevel: p.experienceLevel,
    weeklyHours: p.weeklyHours,
    motivation: p.motivation,
    onboardedAt: p.onboardedAt,
    weeklyRecapEmail: p.weeklyRecapEmail,
    accentColor: p.accentColor,
    banner: p.banner
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

// ---- Activity and streaks (Lagos days) ------------------------------------

/** "2026-11-16": the Lagos calendar day of an instant. */
export function lagosDateKey(d: Date): string {
  return new Date(d.getTime() + LAGOS_OFFSET_MS).toISOString().slice(0, 10);
}

// What counts as "studied that day".
const ACTIVE_EVENTS = ["LESSON_COMPLETED", "QUIZ_COMPLETED", "QUESTION_ANSWERED", "ASSIGNMENT_SUBMITTED", "AI_TUTOR_USED"] as const;

/** Consecutive active Lagos days ending today; today not active yet keeps yesterday's streak alive. */
export function dayStreak(activeDays: Set<string>, now: Date): number {
  let cursor = now.getTime();
  if (!activeDays.has(lagosDateKey(new Date(cursor)))) cursor -= DAY_MS;
  let n = 0;
  while (activeDays.has(lagosDateKey(new Date(cursor)))) {
    n++;
    cursor -= DAY_MS;
  }
  return n;
}

type Completion = { completedAt: Date; lesson: { duration: string } };

export function lessonMinutesBetween(completed: Completion[], start: Date, end: Date): number {
  return completed
    .filter((c) => c.completedAt >= start && c.completedAt < end)
    .reduce((sum, c) => sum + durationMinutes(c.lesson.duration), 0);
}

/** Weeks in a row (ending this week if already met, else last week) the student hit their own weekly target. */
export function weeksOnTarget(completed: Completion[], goalMinutes: number | null, now: Date): number {
  if (!goalMinutes) return 0;
  const thisWeek = lagosWeekStart(now).getTime();
  const met = (start: number) => lessonMinutesBetween(completed, new Date(start), new Date(start + 7 * DAY_MS)) >= goalMinutes;
  let n = met(thisWeek) ? 1 : 0;
  for (let w = 1; w <= 52 && met(thisWeek - w * 7 * DAY_MS); w++) n++;
  return n;
}

/** Checks for newly earned badges after an activity (lesson, quiz, project, grade). Never throws. */
export async function syncBadges(userId: string): Promise<void> {
  try {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (u?.role === "STUDENT") await getMySpace({ id: userId, role: "STUDENT" });
  } catch (err) {
    console.error("syncBadges failed:", err);
  }
}

/** Longest run of consecutive active Lagos days (keys "YYYY-MM-DD"). */
export function longestDayStreak(activeDays: Set<string>): number {
  const sorted = [...activeDays].sort();
  let best = 0, run = 0, prev = 0;
  for (const key of sorted) {
    const day = Date.parse(key + "T00:00:00Z") / DAY_MS;
    run = day === prev + 1 ? run + 1 : 1;
    prev = day;
    best = Math.max(best, run);
  }
  return best;
}

/** Weeks (Lagos) at or above the goal, ever, and the best run of consecutive ones. */
export function goalWeekHistory(completed: Completion[], goalMinutes: number | null): { weeksOnGoal: number; bestRun: number } {
  if (!goalMinutes) return { weeksOnGoal: 0, bestRun: 0 };
  const byWeek = new Map<number, number>();
  for (const c of completed) {
    const w = lagosWeekStart(c.completedAt).getTime();
    byWeek.set(w, (byWeek.get(w) ?? 0) + durationMinutes(c.lesson.duration));
  }
  const met = [...byWeek.entries()].filter(([, m]) => m >= goalMinutes).map(([w]) => w).sort((a, b) => a - b);
  let bestRun = 0, run = 0;
  met.forEach((w, i) => { run = i > 0 && w - met[i - 1] === 7 * DAY_MS ? run + 1 : 1; bestRun = Math.max(bestRun, run); });
  return { weeksOnGoal: met.length, bestRun };
}

export async function getMySpace(user: { id: string; role: string }, now: Date = new Date()) {
  const weekStart = lagosWeekStart(now);
  const isStaff = user.role === "INSTRUCTOR" || user.role === "ADMIN";
  const activitySince = new Date(now.getTime() - 400 * DAY_MS);

  // The name from the database, not the session cookie (stale after a rename).
  const [account, profile, enrollments, completed, submissions, certificates, events, quizBest] = await Promise.all([
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
            },
            assignments: { orderBy: { order: "asc" }, select: { id: true, title: true, type: true } }
          }
        }
      }
    }),
    prisma.userProgress.findMany({
      where: { userId: user.id, isCompleted: true },
      select: { lessonId: true, completedAt: true, lesson: { select: { duration: true } } }
    }),
    prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { gradedAt: "desc" },
      select: { assignmentId: true, status: true, score: true, feedback: true, gradedBy: true, gradedAt: true, assignment: { select: { title: true, courseId: true } } }
    }),
    prisma.certificate.findMany({ where: { userId: user.id }, select: { courseId: true, certNumber: true, gradeTitle: true, issuedAt: true } }),
    prisma.learningEvent.findMany({
      where: { userId: user.id, createdAt: { gte: activitySince }, eventType: { in: [...ACTIVE_EVENTS] } },
      select: { createdAt: true }
    }),
    prisma.quizAttempt.aggregate({ where: { userId: user.id }, _max: { score: true } })
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
    const feedback = submissions.find((s) => s.status === "GRADED" && s.assignment.courseId === e.courseId) ?? null;
    const cert = certificates.find((c) => c.courseId === e.courseId) ?? null;
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
        : null,
      // The journey: modules → projects → capstone → certificate.
      roadmap: {
        modules: e.course.modules.map((m) => {
          const total = m.lessons.length;
          const completedHere = m.lessons.filter((l) => doneIds.has(l.id)).length;
          const status = total > 0 && completedHere === total ? "DONE" : next && m.lessons.some((l) => l.id === next.id) ? "CURRENT" : "UPCOMING";
          return { title: m.title, completed: completedHere, total, status };
        }),
        projects: e.course.assignments.map((a) => {
          const sub = submissions.find((s) => s.assignmentId === a.id);
          return {
            id: a.id,
            title: a.title,
            type: a.type, // MILESTONE | CAPSTONE
            status: sub ? sub.status : "NOT_SUBMITTED", // NOT_SUBMITTED | SUBMITTED | GRADED | RESUBMISSION_REQUESTED
            score: sub?.status === "GRADED" ? sub.score : null,
            href: access ? `/learn/${e.course.slug}/assignment` : null
          };
        }),
        certificate: cert
          ? { certNumber: cert.certNumber, gradeTitle: cert.gradeTitle, issuedAt: cert.issuedAt, href: `/certificate/${cert.certNumber}` }
          : null
      }
    };
  });

  const thisWeek = completed.filter((c) => c.completedAt >= weekStart);
  const minutesStudied = lessonMinutesBetween(completed, weekStart, new Date(weekStart.getTime() + 7 * DAY_MS));
  const goalMinutes = profile?.weeklyHours ? profile.weeklyHours * 60 : null;

  const activeDays = new Set<string>([...events.map((e) => lagosDateKey(e.createdAt)), ...completed.map((c) => lagosDateKey(c.completedAt))]);
  const todayKey = lagosDateKey(now);
  const days = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(weekStart.getTime() + i * DAY_MS);
    const date = lagosDateKey(start);
    return {
      date,
      active: activeDays.has(date),
      minutes: lessonMinutesBetween(completed, start, new Date(start.getTime() + DAY_MS)),
      isToday: date === todayKey,
      isFuture: date > todayKey
    };
  });

  // Badges: students only, from real activity; new ones are recorded and announced once.
  let badges: Awaited<ReturnType<typeof listBadges>> = [];
  if (!isStaff) {
    const history = goalWeekHistory(completed, goalMinutes);
    const stats: BadgeStats = {
      lessonsCompleted: completed.length,
      modulesCompleted: courses.reduce((n, c) => n + c.roadmap.modules.filter((m) => m.status === "DONE").length, 0),
      bestCoursePercent: Math.max(0, ...courses.map((c) => c.progress.percent)),
      coursesCompleted: courses.filter((c) => c.progress.total > 0 && c.progress.completed === c.progress.total).length,
      longestDayStreak: longestDayStreak(activeDays),
      weeksOnGoal: history.weeksOnGoal,
      bestWeeklyRun: history.bestRun,
      projectsSubmitted: submissions.length,
      bestProjectScore: submissions.reduce<number | null>((best, s) => (s.status === "GRADED" && s.score !== null && (best === null || s.score > best) ? s.score : best), null),
      bestQuizScore: quizBest._max.score,
      certificates: certificates.length
    };
    await awardBadges(user.id, stats);
    badges = await listBadges(user.id);
  }

  return {
    firstName: account.name.trim().split(/\s+/)[0] || account.name,
    greeting: lagosGreeting(now),
    // Show the welcome setup until this is true. Staff aren't asked.
    onboarded: isStaff || Boolean(profile?.onboardedAt),
    profile: mapProfile(profile),
    // The resolved look (defaults filled in) for the UI to apply.
    appearance: resolveAppearance(profile),
    badges,
    courses,
    week: {
      startsAt: weekStart,
      lessonsCompleted: thisWeek.length,
      minutesStudied,
      goalMinutes,
      percentOfGoal: goalMinutes ? Math.min(100, Math.round((minutesStudied / goalMinutes) * 100)) : null,
      days // Monday → Sunday, Lagos time
    },
    // Consecutive days studied (Lagos time). Kept as a number for Phase 1 UI.
    streak: dayStreak(activeDays, now),
    streaks: {
      days: dayStreak(activeDays, now),
      studiedToday: activeDays.has(todayKey),
      weeksOnTarget: weeksOnTarget(completed, goalMinutes, now)
    },
    communityUrl: isStaff || accessCourseIds.length ? await getCommunityUrl() : null
  };
}

// ---- AI tutor context -------------------------------------------------------

const GOAL_LABELS: Record<string, string> = {
  JOB: "get a tech job",
  FREELANCE: "freelance / earn on their own",
  OWN_PRODUCT: "build their own product or business",
  UPSKILL: "grow in their current job",
  OTHER: "learn at their own pace"
};

/**
 * A few lines about the student for the AI tutor's prompt, so it can speak to
 * them personally. Deliberately leaves out "why I joined" (motivation),
 * email, phone and payment details: only what helps teaching goes to the
 * AI provider.
 */
export async function tutorContextFor(userId: string, courseTrack: string | undefined): Promise<string | null> {
  const [user, profile, enrollment] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } }),
    prisma.learningProfile.findUnique({ where: { userId } }),
    courseTrack
      ? prisma.enrollment.findFirst({
          where: { userId, course: { OR: [{ id: courseTrack }, { slug: courseTrack }] } },
          select: {
            status: true, paymentStatus: true,
            course: { select: { title: true, modules: { orderBy: { order: "asc" }, select: { title: true, lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } } } } }
          }
        })
      : null
  ]);
  if (!user || user.role !== "STUDENT") return null;

  const lines: string[] = [];
  lines.push(`Student's first name: ${user.name.trim().split(/\s+/)[0]}. Address them by name occasionally, not in every message.`);
  if (profile?.goalType) lines.push(`Their goal at BEMS: ${GOAL_LABELS[profile.goalType] ?? profile.goalType}${profile.learningGoal ? ` ("${profile.learningGoal}")` : ""}. Relate examples to this goal where natural.`);
  if (profile?.experienceLevel) lines.push(`Experience level: ${profile.experienceLevel.toLowerCase()}. Pitch explanations accordingly.`);
  if (profile?.weeklyHours) lines.push(`They study about ${profile.weeklyHours} hours a week.`);

  if (enrollment && hasCourseAccess(enrollment)) {
    const lessons = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
    const done = new Set(
      (await prisma.userProgress.findMany({ where: { userId, isCompleted: true, lessonId: { in: lessons.map((l) => l.id) } }, select: { lessonId: true } })).map((p) => p.lessonId)
    );
    const next = lessons.find((l) => !done.has(l.id));
    lines.push(`Course: ${enrollment.course.title}, ${done.size} of ${lessons.length} lessons done.`);
    if (next) lines.push(`They are currently on: ${next.moduleTitle} → "${next.title}". Don't jump far ahead of this.`);
  }
  return lines.join("\n");
}
