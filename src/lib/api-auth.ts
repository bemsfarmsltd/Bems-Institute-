import { NextRequest } from "next/server";
import { verifySessionToken, SessionPayload, SESSION_COOKIE } from "@/lib/session";

export async function getSessionUser(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function isStaff(session: SessionPayload | null): boolean {
  return session?.role === "INSTRUCTOR" || session?.role === "ADMIN";
}

export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === "ADMIN";
}
