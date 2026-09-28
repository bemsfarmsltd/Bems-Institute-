import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { formatRelativeTime } from "@/lib/notifications";
import type { NotificationCategory } from "@prisma/client";

async function listFormattedNotifications(userId: string) {
  const records = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30
  });

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

/**
 * GET /api/lms/notifications
 * Returns the authenticated user's notifications.
 * Automatically seeds contextual notifications if the user has none yet.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ notifications: [] });
    }

    const existingCount = await prisma.notification.count({
      where: { userId: session.id }
    });

    if (existingCount === 0) {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          enrollments: {
            include: {
              course: { select: { title: true, slug: true } },
              cohort: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 3
          },
          certificates: {
            include: { course: { select: { title: true } } },
            orderBy: { issuedAt: "desc" },
            take: 2
          },
          submissions: {
            include: {
              assignment: {
                select: {
                  id: true,
                  title: true,
                  course: { select: { slug: true } }
                }
              }
            },
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
              title:
                sub.status === "GRADED"
                  ? `Capstone Graded${sub.score !== null ? `: ${sub.score}/100` : ""}`
                  : "Capstone Revision Requested",
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
          const pendingCount = await prisma.submission.count({
            where: { status: "SUBMITTED" }
          });
          if (pendingCount > 0) {
            seedItems.push({
              userId: user.id,
              title: "Pending Capstone Reviews",
              message: `There ${
                pendingCount === 1
                  ? "is 1 student submission"
                  : `are ${pendingCount} student submissions`
              } awaiting instructor grading.`,
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
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("GET /api/lms/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/lms/notifications
 * Marks a single notification (by `id`) or all notifications (`markAllRead: true` / `markAll: true`) as read.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, markAll, markAllRead } = body as {
      id?: string;
      markAll?: boolean;
      markAllRead?: boolean;
    };

    if (markAll || markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.id, read: false },
        data: { read: true }
      });
    } else if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.id },
        data: { read: true }
      });
    } else {
      return NextResponse.json(
        { error: "Provide notification id or markAllRead: true" },
        { status: 400 }
      );
    }

    const notifications = await listFormattedNotifications(session.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("PATCH /api/lms/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to update notification status" },
      { status: 500 }
    );
  }
}
