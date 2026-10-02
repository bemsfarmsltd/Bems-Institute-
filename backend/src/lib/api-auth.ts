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

// Gates lesson-progress/quiz/capstone actions to students who actually
// enrolled AND have a payment on record — without the payment check, any
// logged-in user could complete a course's quiz/lessons and even get a
// capstone graded into a real certificate while still PENDING (i.e. having
// paid nothing, whether via an unconfirmed bank transfer or an abandoned
// Paystack checkout).
export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { paymentStatus: true }
  });
  return !!enrollment && enrollment.paymentStatus !== "PENDING" && enrollment.paymentStatus !== "REFUNDED";
}
