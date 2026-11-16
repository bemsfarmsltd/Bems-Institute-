// Weekly recap: every Sunday evening each confirmed student gets a short,
// personal summary of their week (in-app notification, plus an email unless
// they turned it off): lessons done, minutes against their own weekly goal,
// streak, and what's next.
//
// Render's free plan sleeps, so there's no timer in the server: a GitHub
// Actions schedule calls POST /api/jobs/weekly-recap (CRON_SECRET), and
// admins can press "Send weekly recaps now". Either way each student gets
// each week's recap at most once (LearningProfile.lastRecapWeekStart claim).

import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";
import { sendEmail, frontendUrl } from "@/lib/email";
import { getMySpace, lagosWeekStart, lessonMinutesBetween } from "@/lib/my-space";

const DAY_MS = 24 * 60 * 60 * 1000;
const LAGOS_OFFSET_MS = 60 * 60 * 1000;

/** The week to recap: on a Lagos Sunday, the week ending today; any other day, last week. */
export function recapWeekStart(now: Date = new Date()): Date {
  const isSunday = new Date(now.getTime() + LAGOS_OFFSET_MS).getUTCDay() === 0;
  const thisWeek = lagosWeekStart(now);
  return isSunday ? thisWeek : new Date(thisWeek.getTime() - 7 * DAY_MS);
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Builds one student's recap text for the week starting `weekStart`. */
export async function buildRecap(userId: string, weekStart: Date, now: Date = new Date()) {
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS);
  const [space, completed] = await Promise.all([
    getMySpace({ id: userId, role: "STUDENT" }, now),
    prisma.userProgress.findMany({
      where: { userId, isCompleted: true, completedAt: { gte: weekStart, lt: weekEnd } },
      select: { completedAt: true, lesson: { select: { duration: true, title: true } } }
    })
  ]);
  const minutes = lessonMinutesBetween(completed, weekStart, weekEnd);
  const goal = space.week.goalMinutes;
  const course = space.courses.find((c) => c.hasAccess) ?? null;

  // The Sunday run recaps the week ending today; an admin's mid-week "send
  // now" recaps last week, so say which.
  const isThisWeek = weekStart.getTime() === lagosWeekStart(now).getTime();
  const which = isThisWeek ? "this week" : "last week";
  const lines: string[] = [`Hello ${space.firstName},`, "", `Here's your ${isThisWeek ? "week" : "last week"} at BEMS:`];
  lines.push(`• ${completed.length} lesson${completed.length === 1 ? "" : "s"} completed${minutes ? ` (${formatMinutes(minutes)})` : ""}`);
  if (goal) {
    lines.push(minutes >= goal
      ? `• You hit your weekly goal of ${formatMinutes(goal)}. Well done!`
      : `• ${formatMinutes(minutes)} of your ${formatMinutes(goal)} weekly goal`);
  }
  if (space.streaks.days > 1) lines.push(`• ${space.streaks.days}-day study streak`);
  if (space.streaks.weeksOnTarget > 1) lines.push(`• ${space.streaks.weeksOnTarget} weeks in a row on target`);
  if (course) lines.push(`• ${course.title}: ${course.progress.percent}% complete`);
  lines.push("");
  if (course?.nextLesson) lines.push(`Next up: ${course.nextLesson.title} (${course.nextLesson.moduleTitle})`, frontendUrl(course.nextLesson.href));
  if (course?.nextLiveSession) {
    const when = new Date(course.nextLiveSession.scheduledAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos", weekday: "long", hour: "numeric", minute: "2-digit" });
    lines.push(`Next class: ${course.nextLiveSession.title}, ${when}`);
  }
  if (space.profile?.goal) lines.push("", `Remember why you're here: "${space.profile.goal}"`);
  if (completed.length === 0) lines.push("", `${isThisWeek ? "A fresh week starts tomorrow." : "This week is a fresh start."} Even one lesson keeps you moving${course ? ` with ${course.tutor}` : ""}.`);
  lines.push("", "You can turn these emails off in your dashboard.");

  const summary = completed.length
    ? `${isThisWeek ? "This week" : "Last week"}: ${completed.length} lesson${completed.length === 1 ? "" : "s"}${goal ? `, ${Math.min(100, Math.round((minutes / goal) * 100))}% of your weekly goal` : ""}${course?.nextLesson ? `. Next: ${course.nextLesson.title}` : ""}`
    : `No lessons ${which}${course?.nextLesson ? `. Pick up with ${course.nextLesson.title}` : ""}.`;

  return { subject: `Your BEMS week, ${space.firstName}`, text: lines.join("\n"), summary, wantsEmail: space.profile?.weeklyRecapEmail ?? true };
}

/** Sends this week's recap to every confirmed student who hasn't had it yet. */
export async function sendWeeklyRecaps(now: Date = new Date()): Promise<{ weekStart: Date; sent: number; emailed: number }> {
  const weekStart = recapWeekStart(now);
  const students = await prisma.user.findMany({
    where: { role: "STUDENT", deactivatedAt: null, enrollments: { some: {} } },
    select: { id: true, email: true, enrollments: { select: { status: true, paymentStatus: true } } }
  });

  let sent = 0, emailed = 0;
  for (const s of students) {
    if (!s.enrollments.some(hasCourseAccess)) continue;
    await prisma.learningProfile.upsert({ where: { userId: s.id }, update: {}, create: { userId: s.id } });
    // Claim this week for this student; a second run (or a parallel one) gets 0 rows.
    const claim = await prisma.learningProfile.updateMany({
      where: { userId: s.id, OR: [{ lastRecapWeekStart: null }, { lastRecapWeekStart: { lt: weekStart } }] },
      data: { lastRecapWeekStart: weekStart }
    });
    if (claim.count === 0) continue;

    const recap = await buildRecap(s.id, weekStart, now);
    await createNotification({ userId: s.id, title: "Your week at BEMS", message: recap.summary, category: "GAMIFICATION", linkUrl: "/dashboard" });
    sent++;
    if (recap.wantsEmail) {
      const r = await sendEmail({ to: s.email, subject: recap.subject, text: recap.text });
      if (r.sent) emailed++;
    }
  }
  return { weekStart, sent, emailed };
}
