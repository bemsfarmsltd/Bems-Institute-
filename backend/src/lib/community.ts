import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/site-settings";

// The BEMS WhatsApp community, where confirmed students chat with their
// instructors and each other. The invite link is set in Admin Settings >
// General and only ever goes to students whose registration is confirmed
// (paid AND approved): never public, so outsiders can't join.

// WhatsApp group/community invite links look like
// https://chat.whatsapp.com/AbCdEf123... (22-ish character code).
export const COMMUNITY_URL_PATTERN = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,40}\/?$/;

export async function getCommunityUrl(): Promise<string | null> {
  const s = await getSiteSettings();
  return s.whatsappCommunityUrl || null;
}

/**
 * Sends the community link to this enrollment's student if their
 * registration is confirmed and they haven't had it yet. Safe to call after
 * any change that might unlock the course: it does nothing otherwise, and
 * the communityInviteSentAt claim means two admins clicking at once still
 * send one message.
 */
export async function sendCommunityInviteIfReady(enrollmentId: string): Promise<boolean> {
  const url = await getCommunityUrl();
  if (!url) return false;
  const e = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } }
  });
  if (!e || e.communityInviteSentAt || !hasCourseAccess(e)) return false;

  const claimed = await prisma.enrollment.updateMany({
    where: { id: e.id, communityInviteSentAt: null },
    data: { communityInviteSentAt: new Date() }
  });
  if (claimed.count !== 1) return false;

  await createNotification({
    userId: e.userId,
    title: "Join the BEMS WhatsApp community",
    message: `Chat with your ${e.course.title} instructor and classmates. Open your dashboard and tap "Join the WhatsApp community".`,
    category: "CLASS",
    linkUrl: "/dashboard"
  });
  await sendEmail({
    to: e.user.email,
    subject: "Join the BEMS WhatsApp community",
    text: [
      `Hello ${e.user.name},`,
      `Your registration for ${e.course.title} is confirmed. Join the BEMS WhatsApp community to chat with your instructor and other students:`,
      url,
      "Please don't share this link outside the class.",
      "BEMS Admissions"
    ].join("\n\n")
  });
  return true;
}
