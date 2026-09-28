import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, deliverPasswordResetLink } from "@/lib/password-reset";
import { checkRateLimit, recordAttempt, rateLimitMessage } from "@/lib/rate-limit";

const GENERIC_MESSAGE = "If an account exists for that email, a reset link has been sent.";

// Deliberately returns the same response whether or not the email exists —
// otherwise this endpoint becomes a free "does this email have an account"
// oracle for an attacker.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Throttle so this can't be used to spam someone's inbox (or, here, the
  // server console) with reset links — reuses the same lockout machinery as
  // login, keyed separately so it doesn't interact with login's counter.
  const rateLimitKey = `reset-request:${email}`;
  const limit = await checkRateLimit(rateLimitKey);
  if (limit.blocked) {
    return NextResponse.json({ error: rateLimitMessage(limit.retryAfterSeconds!) }, { status: 429 });
  }
  await recordAttempt(rateLimitKey, false);

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const rawToken = await createPasswordResetToken(user.id);
    const resetUrl = `${req.nextUrl.origin}/reset-password?token=${rawToken}`;
    deliverPasswordResetLink(user.email, resetUrl);
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
