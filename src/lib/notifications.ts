import { prisma } from "@/lib/prisma";
import type { NotificationCategory, UserRole } from "@prisma/client";

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  linkUrl?: string;
}

/**
 * Formats a Date into a human-friendly relative timestamp string.
 */
export function formatRelativeTime(date: Date | string): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - target.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return target.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric"
  });
}

/**
 * Creates a persistent notification for a specific user.
 * Fails gracefully so primary API actions are never blocked by notification errors.
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    return await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        category: input.category,
        linkUrl: input.linkUrl
      }
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Sends a notification to all staff users (INSTRUCTOR and ADMIN).
 */
export async function notifyStaff(
  payload: Omit<CreateNotificationInput, "userId">,
  excludeUserId?: string
) {
  const roles: UserRole[] = ["INSTRUCTOR", "ADMIN"];
  try {
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: roles },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {})
      },
      select: { id: true }
    });

    if (staffUsers.length === 0) return;

    await prisma.notification.createMany({
      data: staffUsers.map((u) => ({
        userId: u.id,
        title: payload.title,
        message: payload.message,
        category: payload.category,
        linkUrl: payload.linkUrl
      }))
    });
  } catch (error) {
    console.error("Failed to notify staff:", error);
  }
}
