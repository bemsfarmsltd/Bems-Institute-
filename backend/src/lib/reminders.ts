// Reminders that bring students back at the right moment:
//   CLASS   "Class starts at 4:00 pm"            (live session within the hour)
//   GOAL    "You're 1 lesson from your weekly goal" (Thu–Sun, 5–9 pm Lagos)
//   STREAK  "Keep your 4-day streak going"        (7–10 pm Lagos, not studied today)
//
// Channels: an in-app notification always; a push notification on every
// browser the student allowed; WhatsApp only if the student opted in, has a
// phone number, and an approved template is configured (CLASS and GOAL only,
// never the daily streak nudge, to keep WhatsApp cost and noise down).
//
// Like the weekly recap, there's no timer in the server (Render's free plan
// sleeps): GitHub Actions calls POST /api/jobs/reminders every 15 minutes in
// the daytime. Each reminder is claimed in ReminderLog before it's sent, so
// overlapping or repeated runs never send it twice.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";
import { sendPush, pushPublicKey } from "@/lib/push";
import { sendWhatsAppTemplate } from "@/lib/twilio";
import { getMySpace, lagosDateKey, lagosWeekStart, durationMinutes } from "@/lib/my-space";

const LAGOS_OFFSET_MS = 60 * 60 * 1000;
export const CLASS_LEAD_MS = 75 * 60 * 1000; // a run every 15 min still reminds ~1 hour before

export type ReminderKind = "CLASS" | "GOAL" | "STREAK";

export class ReminderPrefsError extends Error {}

function lagosParts(now: Date) {
  const d = new Date(now.getTime() + LAGOS_OFFSET_MS);
  return { hour: d.getUTCHours(), weekday: d.getUTCDay() }; // weekday 0 = Sunday
}

export function inGoalWindow(now: Date): boolean {
  const { hour, weekday } = lagosParts(now);
  return [4, 5, 6, 0].includes(weekday) && hour >= 17 && hour < 21;
}

export function inStreakWindow(now: Date): boolean {
  const { hour } = lagosParts(now);
  return hour >= 19 && hour < 22;
}

/** "4:00 pm" in Lagos time. */
export function lagosTime(d: Date): string {
  return d.toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
}

function whatsappTemplate(kind: ReminderKind): string | null {
  if (kind === "CLASS") return process.env.TWILIO_TEMPLATE_CLASS_REMINDER || null;
  if (kind === "GOAL") return process.env.TWILIO_TEMPLATE_GOAL_REMINDER || null;
  return null;
}

export function whatsappRemindersConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM &&
    (process.env.TWILIO_TEMPLATE_CLASS_REMINDER || process.env.TWILIO_TEMPLATE_GOAL_REMINDER)
  );
}

/** Claims (userId, kind, key). True if this call owns it and should send. */
async function claim(userId: string, kind: ReminderKind, key: string): Promise<boolean> {
  try {
    await prisma.reminderLog.create({ data: { userId, kind, key } });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return false;
    throw err;
  }
}

interface Recipient {
  userId: string;
  firstName: string;
  phone: string | null;
  whatsapp: boolean;
}

interface Delivery {
  title: string;
  body: string;
  url: string;
  whatsappVars?: string[];
}

export interface ReminderTotals {
  classes: number;
  goals: number;
  streaks: number;
  pushed: number;
  whatsapp: number;
}

async function deliver(r: Recipient, kind: ReminderKind, key: string, d: Delivery, totals: ReminderTotals) {
  if (!(await claim(r.userId, kind, key))) return false;
  await createNotification({ userId: r.userId, title: d.title, message: d.body, category: "CLASS", linkUrl: d.url });
  if ((await sendPush(r.userId, { title: d.title, body: d.body, url: d.url, tag: `${kind}-${key}` })) > 0) totals.pushed++;
  const template = whatsappTemplate(kind);
  if (template && r.whatsapp && r.phone && d.whatsappVars) {
    const sent = await sendWhatsAppTemplate(r.phone, template, d.whatsappVars);
    if (sent.ok) totals.whatsapp++;
  }
  return true;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

const recipientSelect = {
  id: true, name: true, phone: true,
  learningProfile: { select: { remindClasses: true, remindGoal: true, remindStreak: true, whatsappReminders: true, weeklyHours: true } }
} as const;

export async function runReminders(now: Date = new Date()): Promise<ReminderTotals> {
  const totals: ReminderTotals = { classes: 0, goals: 0, streaks: 0, pushed: 0, whatsapp: 0 };

  // ---- Classes starting within the hour ----
  const sessions = await prisma.liveSession.findMany({
    where: { scheduledAt: { gt: now, lte: new Date(now.getTime() + CLASS_LEAD_MS) } },
    select: { id: true, title: true, type: true, scheduledAt: true, courseId: true, course: { select: { title: true } } }
  });
  for (const s of sessions) {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: s.courseId, user: { role: "STUDENT", deactivatedAt: null } },
      select: { status: true, paymentStatus: true, user: { select: recipientSelect } }
    });
    for (const e of enrollments.filter(hasCourseAccess)) {
      const p = e.user.learningProfile;
      if (p && !p.remindClasses) continue;
      const time = lagosTime(s.scheduledAt);
      const what = s.type === "WELCOME" ? "Your welcome session" : "Class";
      const sent = await deliver(
        { userId: e.user.id, firstName: firstName(e.user.name), phone: e.user.phone, whatsapp: Boolean(p?.whatsappReminders) },
        "CLASS",
        s.id,
        {
          title: `${what} starts at ${time}`,
          body: `${s.title} (${s.course.title}) starts at ${time}. Join from your dashboard.`,
          url: "/dashboard",
          whatsappVars: [firstName(e.user.name), s.title, time]
        },
        totals
      );
      if (sent) totals.classes++;
    }
  }

  // ---- Weekly goal and streak nudges (evenings, Lagos) ----
  const goalTime = inGoalWindow(now);
  const streakTime = inStreakWindow(now);
  if (!goalTime && !streakTime) return totals;

  const weekKey = lagosDateKey(lagosWeekStart(now));
  const todayKey = lagosDateKey(now);
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      deactivatedAt: null,
      enrollments: { some: { status: { notIn: ["PENDING", "WITHDRAWN"] }, paymentStatus: { notIn: ["PENDING", "REFUNDED"] } } }
    },
    select: {
      ...recipientSelect,
      reminderLogs: { where: { OR: [{ kind: "GOAL", key: weekKey }, { kind: "STREAK", key: todayKey }] }, select: { kind: true } }
    }
  });

  for (const u of students) {
    const p = u.learningProfile;
    const wantsGoal = goalTime && Boolean(p?.weeklyHours) && p?.remindGoal !== false && !u.reminderLogs.some((l) => l.kind === "GOAL");
    const wantsStreak = streakTime && p?.remindStreak !== false && !u.reminderLogs.some((l) => l.kind === "STREAK");
    if (!wantsGoal && !wantsStreak) continue;

    const space = await getMySpace({ id: u.id, role: "STUDENT" }, now);
    const recipient = { userId: u.id, firstName: firstName(u.name), phone: u.phone, whatsapp: Boolean(p?.whatsappReminders) };

    if (wantsGoal && space.week.goalMinutes) {
      const left = space.week.goalMinutes - space.week.minutesStudied;
      const course = space.courses.find((c) => c.hasAccess && c.nextLesson);
      const next = course?.nextLesson;
      // getMySpace has the next lesson but not its length.
      const lesson = next ? await prisma.lesson.findUnique({ where: { id: next.id }, select: { duration: true } }) : null;
      const lessonMinutes = lesson ? durationMinutes(lesson.duration) : 0;
      if (next && left > 0 && left <= lessonMinutes) {
        const hours = Math.round(space.week.goalMinutes / 60);
        const sent = await deliver(recipient, "GOAL", weekKey, {
          title: "You're 1 lesson from your weekly goal",
          body: `Finish "${next.title}" to hit your ${hours}-hour goal this week.`,
          url: next.href,
          whatsappVars: [recipient.firstName, next.title]
        }, totals);
        if (sent) totals.goals++;
      }
    }

    if (wantsStreak && space.streaks.days >= 2 && !space.streaks.studiedToday) {
      const sent = await deliver(recipient, "STREAK", todayKey, {
        title: `Keep your ${space.streaks.days}-day streak going`,
        body: "A short lesson today keeps it alive.",
        url: space.courses.find((c) => c.nextLesson)?.nextLesson?.href ?? "/dashboard"
      }, totals);
      if (sent) totals.streaks++;
    }
  }
  return totals;
}

// ---- Student settings -------------------------------------------------------

export async function getReminderSettings(userId: string) {
  const [user, profile, subs] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { phone: true } }),
    prisma.learningProfile.findUnique({ where: { userId }, select: { remindClasses: true, remindGoal: true, remindStreak: true, whatsappReminders: true } }),
    prisma.pushSubscription.count({ where: { userId } })
  ]);
  return {
    classes: profile?.remindClasses ?? true,
    goal: profile?.remindGoal ?? true,
    streak: profile?.remindStreak ?? true,
    whatsapp: profile?.whatsappReminders ?? false,
    push: {
      // null = push isn't set up on the server yet; hide the "Allow notifications" button.
      publicKey: pushPublicKey(),
      // Browsers this student allowed (the UI checks whether *this* browser is one of them).
      devices: subs
    },
    whatsappAvailable: whatsappRemindersConfigured(),
    phoneOnFile: Boolean(user.phone?.trim())
  };
}

export interface ReminderPrefsInput {
  classes?: unknown;
  goal?: unknown;
  streak?: unknown;
  whatsapp?: unknown;
}

export async function saveReminderSettings(userId: string, input: ReminderPrefsInput) {
  const data: { remindClasses?: boolean; remindGoal?: boolean; remindStreak?: boolean; whatsappReminders?: boolean } = {};
  const map = { classes: "remindClasses", goal: "remindGoal", streak: "remindStreak", whatsapp: "whatsappReminders" } as const;
  for (const [field, column] of Object.entries(map) as [keyof typeof map, (typeof map)[keyof typeof map]][]) {
    const v = input[field];
    if (v === undefined) continue;
    if (typeof v !== "boolean") throw new ReminderPrefsError("Choose on or off for each reminder.");
    data[column] = v;
  }
  if (data.whatsappReminders) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { phone: true } });
    if (!user.phone?.trim()) throw new ReminderPrefsError("Add your phone number in your account settings first.");
  }
  await prisma.learningProfile.upsert({ where: { userId }, update: data, create: { userId, ...data } });
  return getReminderSettings(userId);
}
