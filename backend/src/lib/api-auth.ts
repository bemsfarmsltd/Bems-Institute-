import type { Request } from "express";
import { verifySessionToken, SessionPayload, SESSION_COOKIE } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Verifies the cookie's signature/expiry (verifySessionToken) AND that its
// embedded tokenVersion still matches the user's current one in the DB — a
// password reset bumps tokenVersion, so this is what actually makes every
// session issued before that point stop working on its next request,
// instead of remaining valid for the rest of the 7-day cookie lifetime.
export async function getSessionUser(req: Request): Promise<SessionPayload | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { tokenVersion: true, deactivatedAt: true }
  });
  if (!user || user.tokenVersion !== payload.tokenVersion || user.deactivatedAt) return null;

  return payload;
}

export function isStaff(session: SessionPayload | null): boolean {
  return session?.role === "INSTRUCTOR" || session?.role === "ADMIN";
}

export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === "ADMIN";
}

// The one rule for "may this student use the paid course content": they
// must have a payment on record AND an admin must have confirmed the
// registration. Without the payment check, any logged-in user could complete
// a course's quiz/lessons and even get a capstone graded into a real
// certificate while still PENDING (an unconfirmed bank transfer or an
// abandoned Paystack checkout). Without the status check, a Paystack payment
// would unlock the course before admissions confirmed the registration
// (status PENDING = paid, awaiting admin approval; see
// POST /admin/enrollments/:id/approve). WITHDRAWN = refunded.
export function hasCourseAccess(enrollment: { status: string; paymentStatus: string } | null | undefined): boolean {
  return (
    !!enrollment &&
    enrollment.paymentStatus !== "PENDING" &&
    enrollment.paymentStatus !== "REFUNDED" &&
    enrollment.status !== "PENDING" &&
    enrollment.status !== "WITHDRAWN"
  );
}

export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { paymentStatus: true, status: true }
  });
  return hasCourseAccess(enrollment);
}
