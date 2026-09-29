import type { Request } from "express";
import { verifySessionToken, SessionPayload, SESSION_COOKIE } from "@/lib/session";

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
