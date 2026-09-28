import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { checkRateLimit, recordAttempt, rateLimitMessage } from "@/lib/rate-limit";

// Real credential check against the database — role comes from the stored
// user record, never from the request body, so a client can no longer just
// ask to be logged in as INSTRUCTOR.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const rateLimitKey = `login:${email}`;
  const limit = await checkRateLimit(rateLimitKey);
  if (limit.blocked) {
    return NextResponse.json({ error: rateLimitMessage(limit.retryAfterSeconds!) }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  await recordAttempt(rateLimitKey, valid);

  if (!user || !valid) {
    // Deliberately generic — don't reveal whether the email exists.
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSessionToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
  res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res;
}
