import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordStrongEnough } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { checkRateLimit, recordAttempt, rateLimitMessage } from "@/lib/rate-limit";

const router = Router();

// One shared key, not per-email: the secret being guessed here is the single
// ADMIN_ACCESS_CODE, not a per-account password, so failed attempts against
// any email still count toward the same lockout.
const RATE_LIMIT_KEY = "admin-register-code";

// The ONLY path that can ever create an ADMIN account. The staff code is
// checked server-side against ADMIN_ACCESS_CODE (never sent to the browser)
// and only lets you REGISTER a new admin with a personal password — it acts
// as a one-time invite code, not a standing session bypass. Returning admins
// sign in afterwards through the normal /auth/login with their own email +
// password, same as everyone else.
router.post("/", async (req, res) => {
  const body = req.body ?? {};
  const code = typeof body.code === "string" ? body.code : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const expected = process.env.ADMIN_ACCESS_CODE;
  if (!expected) {
    return res.status(500).json({ error: "Admin access is not configured on this server." });
  }

  const limit = await checkRateLimit(RATE_LIMIT_KEY);
  if (limit.blocked) {
    return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });
  }

  const codeValid = !!code && code === expected;
  await recordAttempt(RATE_LIMIT_KEY, codeValid);
  if (!codeValid) {
    return res.status(401).json({ error: "Incorrect staff access code." });
  }

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (!isPasswordStrongEnough(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists. Use Sign In instead." });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash, role: "ADMIN" } });

  const token = await createSessionToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export default router;
