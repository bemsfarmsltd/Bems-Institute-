import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, isPasswordStrongEnough } from "@/lib/password";
import { createSessionToken, verifySessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { checkRateLimit, recordAttempt, rateLimitMessage, clearAttempts } from "@/lib/rate-limit";
import { createPasswordResetToken, deliverPasswordResetLink, lookupResetToken, consumeResetToken } from "@/lib/password-reset";
import { recordReferralSignup } from "@/lib/referrals";

const router = Router();

// Real credential check against the database — role comes from the stored
// user record, never from the request body, so a client can no longer just
// ask to be logged in as INSTRUCTOR.
router.post("/login", async (req, res) => {
  const body = req.body ?? {};
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const rateLimitKey = `login:${email}`;
  const limit = await checkRateLimit(rateLimitKey);
  if (limit.blocked) {
    return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  await recordAttempt(rateLimitKey, valid);

  if (!user || !valid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = await createSessionToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post("/logout", async (_req, res) => {
  res.cookie(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  return res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  const session = await verifySessionToken(token);
  if (!session) return res.json({ user: null });
  const { id, name, email, role } = session;
  return res.json({ user: { id, name, email, role } });
});

// Public account creation: STUDENT or INSTRUCTOR only. ADMIN accounts can
// only be created via /admin-auth, which also requires the staff code.
router.post("/signup", async (req, res) => {
  const body = req.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role === "INSTRUCTOR" ? "INSTRUCTOR" : "STUDENT";
  const referralCode = typeof body.referralCode === "string" ? body.referralCode : "";

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (!isPasswordStrongEnough(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists. Try signing in instead." });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash, role } });

  if (referralCode) {
    await recordReferralSignup(user.id, user.name, referralCode);
  }

  const token = await createSessionToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

const GENERIC_RESET_MESSAGE = "If an account exists for that email, a reset link has been sent.";

router.post("/request-reset", async (req, res) => {
  const body = req.body ?? {};
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const rateLimitKey = `reset-request:${email}`;
  const limit = await checkRateLimit(rateLimitKey);
  if (limit.blocked) {
    return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });
  }
  await recordAttempt(rateLimitKey, false);

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const rawToken = await createPasswordResetToken(user.id);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
    deliverPasswordResetLink(user.email, resetUrl);
  }

  return res.json({ ok: true, message: GENERIC_RESET_MESSAGE });
});

router.post("/reset-password", async (req, res) => {
  const body = req.body ?? {};
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!token) {
    return res.status(400).json({ error: "Missing reset token." });
  }
  if (!isPasswordStrongEnough(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const lookup = await lookupResetToken(token);
  if (!lookup.valid || !lookup.userId || !lookup.tokenId) {
    return res.status(400).json({ error: "This reset link is invalid or has expired. Request a new one." });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.update({ where: { id: lookup.userId }, data: { passwordHash } });
  await consumeResetToken(lookup.tokenId);
  await clearAttempts(`login:${user.email}`);

  const sessionToken = await createSessionToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.cookie(SESSION_COOKIE, sessionToken, SESSION_COOKIE_OPTIONS);
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export default router;
