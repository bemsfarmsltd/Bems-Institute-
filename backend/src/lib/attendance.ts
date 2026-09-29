import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// PRD §6.2: "Miss two classes and the system sends an automatic check-in
// message." No WhatsApp Business API is wired up in this environment, so
// this logs what would be sent (same "simulated" pattern already used for
// Paystack and password-reset emails) and always creates the real in-app
// notification, which is genuinely delivered.

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

  console.log(
    `\n[attendance check-in] Would WhatsApp ${user.name} (${user.phone || "no phone on file"}):\n` +
      `  "Hi ${user.name.split(" ")[0]}, we noticed you've missed your last 2 classes. ` +
      `Everything okay? Reply here or reach your tutor on the class WhatsApp group — we'd love to see you back!"\n` +
      `  (No WhatsApp Business API configured — this would normally be sent, not logged.)\n`
  );

  await createNotification({
    userId,
    title: "We miss you in class!",
    message: "You've missed your last 2 sessions. Reply on the class WhatsApp group or reach out to your tutor — we're here to help you catch up.",
    category: "ATTENDANCE",
    linkUrl: "/dashboard"
  });
}
