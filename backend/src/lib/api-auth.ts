import type { Request } from "express";
import { verifySessionToken, SessionPayload, SESSION_COOKIE } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function getSessionUser(req: Request): Promise<SessionPayload | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  return verifySessionToken(token);
}

export function isStaff(session: SessionPayload | null): boolean {
  return session?.role === "INSTRUCTOR" || session?.role === "ADMIN";
}

export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === "ADMIN";
}

// Gates lesson-progress/quiz/capstone actions to students who actually
// enrolled — without this, any logged-in user could complete a course's
// quiz/lessons and even get a capstone graded into a real certificate
// without ever paying for or enrolling in it.
export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true }
  });
  return !!enrollment;
}
