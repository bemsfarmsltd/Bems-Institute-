import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendWhatsAppMessage } from "@/lib/twilio";

// PRD §6.2: "Miss two classes and the system sends an automatic check-in
// message." Sends a real WhatsApp message via Twilio (best-effort — the
// sandbox can only reach numbers that opted in) and always creates the
// in-app notification regardless, which is unconditionally delivered.

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000; // don't re-notify more than once/day per student+course

export async function checkAndNotifyMissedClasses(userId: string, courseId: string): Promise<void> {
  const recentRecords = await prisma.attendanceRecord.findMany({
    where: { userId, session: { courseId } },
    include: { session: { select: { scheduledAt: true, title: true } } },
    orderBy: { session: { scheduledAt: "desc" } },
    take: 2
  });

  if (recentRecords.length < 2) return; // not enough history yet to judge a pattern
  const missedBothOfLastTwo = recentRecords.every((r) => !r.present);
  if (!missedBothOfLastTwo) return;

  const recentNotification = await prisma.notification.findFirst({
    where: {
      userId,
      category: "ATTENDANCE",
      createdAt: { gt: new Date(Date.now() - DEDUPE_WINDOW_MS) }
    }
  });
  if (recentNotification) return;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, phone: true } });
  if (!user) return;

  if (user.phone) {
    const result = await sendWhatsAppMessage(
      user.phone,
      `Hi ${user.name.split(" ")[0]}, we noticed you've missed your last 2 classes. ` +
        `Everything okay? Reply here or reach your tutor on the class WhatsApp group — we'd love to see you back!`
    );
    if (!result.ok) {
      console.log(`[attendance check-in] WhatsApp not sent to ${user.name} (${user.phone}): ${result.error}`);
    }
  }

  await createNotification({
    userId,
    title: "We miss you in class!",
    message: "You've missed your last 2 sessions. Reply on the class WhatsApp group or reach out to your tutor — we're here to help you catch up.",
    category: "ATTENDANCE",
    linkUrl: "/dashboard"
  });
}

// PRD §4.2: "A welcome session before class starts... anyone who doesn't
// show gets a personal WhatsApp message." Unlike checkAndNotifyMissedClasses
// (which needs a 2-session pattern), a welcome session only happens once —
// a single miss is already the full no-show, so this fires on the first
// absence. Reuses the same 24h dedupe window so a re-marked attendance
// record doesn't double-send.
export async function notifyWelcomeSessionNoShow(userId: string, sessionTitle: string): Promise<void> {
  const recentNotification = await prisma.notification.findFirst({
    where: {
      userId,
      category: "ATTENDANCE",
      createdAt: { gt: new Date(Date.now() - DEDUPE_WINDOW_MS) }
    }
  });
  if (recentNotification) return;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, phone: true } });
  if (!user) return;

  if (user.phone) {
    const result = await sendWhatsAppMessage(
      user.phone,
      `Hi ${user.name.split(" ")[0]}, we missed you at "${sessionTitle}"! That's where we cover why most people who ` +
        `finish the program got there — don't worry, we'll catch you up. Reply here and we'll find a time.`
    );
    if (!result.ok) {
      console.log(`[welcome session no-show] WhatsApp not sent to ${user.name} (${user.phone}): ${result.error}`);
    }
  }

  await createNotification({
    userId,
    title: "We missed you at the welcome session!",
    message: `We covered why most people finish the program at "${sessionTitle}" — reach out to your tutor and we'll catch you up.`,
    category: "ATTENDANCE",
    linkUrl: "/dashboard"
  });
}
