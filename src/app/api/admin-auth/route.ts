import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordStrongEnough } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { checkRateLimit, recordAttempt, rateLimitMessage } from "@/lib/rate-limit";

// One shared key, not per-email: the secret being guessed here is the single
// ADMIN_ACCESS_CODE, not a per-account password, so failed attempts against
// any email still count toward the same lockout.
const RATE_LIMIT_KEY = "admin-register-code";

// The ONLY path that can ever create an ADMIN account. The staff code is
// checked server-side against ADMIN_ACCESS_CODE (never sent to the browser)
// and only lets you REGISTER a new admin with a personal password — it acts
// as a one-time invite code, not a standing session bypass. Returning admins
// sign in afterwards through the normal /api/auth/login with their own
// email + password, same as everyone else.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const expected = process.env.ADMIN_ACCESS_CODE;
  if (!expected) {
    return NextResponse.json(
      { error: "Admin access is not configured on this server." },
      { status: 500 }
    );
  }
  const limit = await checkRateLimit(RATE_LIMIT_KEY);
  if (limit.blocked) {
    return NextResponse.json({ error: rateLimitMessage(limit.retryAfterSeconds!) }, { status: 429 });
  }

  const codeValid = !!code && code === expected;
  await recordAttempt(RATE_LIMIT_KEY, codeValid);
  if (!codeValid) {
    return NextResponse.json({ error: "Incorrect staff access code." }, { status: 401 });
  }
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  if (!isPasswordStrongEnough(password)) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists. Use Sign In instead." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "ADMIN" }
  });

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
