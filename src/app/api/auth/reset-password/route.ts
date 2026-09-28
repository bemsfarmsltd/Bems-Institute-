import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordStrongEnough } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { lookupResetToken, consumeResetToken } from "@/lib/password-reset";
import { clearAttempts } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token) {
    return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  }
  if (!isPasswordStrongEnough(password)) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const lookup = await lookupResetToken(token);
  if (!lookup.valid || !lookup.userId || !lookup.tokenId) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.update({
    where: { id: lookup.userId },
    data: { passwordHash }
  });
  await consumeResetToken(lookup.tokenId);

  // A successful reset is proof of identity — don't leave the account
  // sitting in a login lockout it may have accumulated before this.
  await clearAttempts(`login:${user.email}`);

  const sessionToken = await createSessionToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
  res.cookies.set(SESSION_COOKIE, sessionToken, SESSION_COOKIE_OPTIONS);
  return res;
}
