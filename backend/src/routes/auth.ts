import { Router } from "express";
import multer from "multer";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, isPasswordStrongEnough } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { getSessionUser } from "@/lib/api-auth";
import { checkRateLimit, recordAttempt, rateLimitMessage, clearAttempts, checkUsageQuota } from "@/lib/rate-limit";
import { createPasswordResetToken, deliverPasswordResetLink, lookupResetToken, consumeResetToken } from "@/lib/password-reset";
import { recordReferralSignup } from "@/lib/referrals";
import { isValidEmail } from "@/lib/validation";
import { uploadAvatar } from "@/lib/cloudinary";

const MAX_NAME_LENGTH = 100;

const router = Router();

const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_AVATAR_TYPES.has(file.mimetype)) {
      cb(new Error("Only JPG, PNG, WEBP, or GIF images are allowed."));
      return;
    }
    cb(null, true);
  }
});

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
  if (user.deactivatedAt) {
    return res.status(403).json({ error: "This account has been deactivated. Contact admissions to restore it." });
  }

  const token = await createSessionToken({ id: user.id, name: user.name, email: user.email, role: user.role, tokenVersion: user.tokenVersion });
  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } });
});

router.post("/logout", async (_req, res) => {
  res.cookie(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  return res.json({ ok: true });
});

// The signed session cookie only carries id/name/email/role (see
// SessionPayload) — avatarUrl isn't in it, so /me always reads the current
// value from the database rather than something baked into the token.
router.get("/me", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) return res.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true }
  });
  if (!user) return res.json({ user: null });
  return res.json({ user });
});

// Authenticated users upload/replace their own avatar — never someone
// else's, since the target is always the caller's own session id, not a
// client-supplied userId.
router.post("/avatar", (req, res, next) => {
  avatarUpload.single("avatar")(req, res, (err: unknown) => {
    if (!err) return next();
    // Surface multer's file-size/type rejections as a real 400 instead of
    // letting them fall through to the generic 500 handler.
    const message = err instanceof Error ? err.message : "Could not read the uploaded file.";
    const isTooLarge = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE";
    res.status(400).json({ error: isTooLarge ? "Image must be 5MB or smaller." : message });
  });
}, async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  if (!req.file) {
    return res.status(400).json({ error: "No image file was uploaded." });
  }

  try {
    const avatarUrl = await uploadAvatar(req.file.buffer, session.id);
    const user = await prisma.user.update({
      where: { id: session.id },
      data: { avatarUrl },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true }
    });
    return res.json({ user });
  } catch {
    return res.status(502).json({ error: "Could not upload the image. Please try again." });
  }
});

// The caller's own full editable profile — separate from the lean
// id/name/email/role/avatarUrl shape /me returns (which flows into the
// frontend's global user context everywhere), since phone and notification
// preferences are only ever needed on the Edit Profile page itself.
router.get("/profile", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true, phone: true, avatarUrl: true, notifyCategories: true }
  });
  if (!user) return res.status(404).json({ error: "Account not found." });
  return res.json({ profile: user });
});

// Email is intentionally not editable here — it's also the login
// identifier, and changing it safely would need its own re-verification
// flow, which is out of scope for a basic profile edit.
router.patch("/profile", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const body = req.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;

  if (name !== undefined) {
    if (!name) return res.status(400).json({ error: "Name is required." });
    if (name.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` });
    }
  }
  if (phone !== undefined && phone.length > 30) {
    return res.status(400).json({ error: "Phone number must be 30 characters or fewer." });
  }

  const user = await prisma.user.update({
    where: { id: session.id },
    data: { name, phone: phone || null },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true }
  });
  return res.json({ user });
});

// Which categories of staff-broadcast notifications the caller wants —
// open to any signed-in user for their own row (unlike the admin console's
// equivalent at PATCH /admin/settings/notifications, which exists for the
// Settings screen specifically and happens to touch the same column).
router.patch("/notifications", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const ALL_CATEGORIES = ["CLASS", "GRADING", "PAYMENT", "GAMIFICATION", "ATTENDANCE"] as const;
  const categories = Array.isArray(req.body?.categories)
    ? req.body.categories.filter((c: unknown): c is typeof ALL_CATEGORIES[number] =>
        ALL_CATEGORIES.includes(c as typeof ALL_CATEGORIES[number])
      )
    : [];

  const user = await prisma.user.update({
    where: { id: session.id },
    data: { notifyCategories: categories },
    select: { notifyCategories: true }
  });
  return res.json({ notifyCategories: user.notifyCategories });
});

// A real in-app password change — until now the only way to change a
// password was the forgot-password email-reset flow. Requires the current
// password so a hijacked session cookie alone can't take over the account.
router.post("/change-password", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const rateLimitKey = `change-password:${session.id}`;
  const limit = await checkRateLimit(rateLimitKey);
  if (limit.blocked) {
    return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });
  }

  const body = req.body ?? {};
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return res.status(404).json({ error: "Account not found." });

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  await recordAttempt(rateLimitKey, valid);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }
  if (!isPasswordStrongEnough(newPassword)) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  const passwordHash = await hashPassword(newPassword);
  // Bumping tokenVersion revokes every other session (same as the
  // forgot-password reset flow) — a stolen cookie elsewhere stops working
  // the moment the real owner changes their password.
  const updated = await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash, tokenVersion: { increment: 1 } }
  });

  const token = await createSessionToken({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    tokenVersion: updated.tokenVersion
  });
  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res.json({ ok: true });
});

// A soft delete — sets deactivatedAt rather than removing the row, so
// staff could still restore an account on request. Requires re-entering
// the password: this is the single most destructive thing a user can do
// to their own account, so a hijacked session alone shouldn't be enough.
router.post("/deactivate", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const rateLimitKey = `deactivate:${session.id}`;
  const limit = await checkRateLimit(rateLimitKey);
  if (limit.blocked) {
    return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return res.status(404).json({ error: "Account not found." });

  const valid = await verifyPassword(password, user.passwordHash);
  await recordAttempt(rateLimitKey, valid);
  if (!valid) {
    return res.status(401).json({ error: "Password is incorrect." });
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { deactivatedAt: new Date(), tokenVersion: { increment: 1 } }
  });
  res.cookie(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  return res.json({ ok: true });
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
  if (name.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (!isPasswordStrongEnough(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  // Per-IP, not per-email — unlike login, every syntactically-valid signup
  // "succeeds" (creates an account), so there's no failure signal to count
  // against. Without this, unlimited signups let someone mass-create
  // accounts or brute-force referral codes (each guess just needs one more
  // signup with a fresh email).
  const signupQuotaKey = `signup:${req.ip || "unknown"}`;
  const signupQuota = await checkUsageQuota(signupQuotaKey, 8, 60 * 60 * 1000);
  if (signupQuota.blocked) {
    return res.status(429).json({ error: rateLimitMessage(signupQuota.retryAfterSeconds!) });
  }
  await recordAttempt(signupQuotaKey, true);

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (settings?.allowRegistration === "disable") {
    return res.status(403).json({ error: "New registrations are currently closed." });
  }
  if (settings?.allowRegistration === "request") {
    return res.status(403).json({
      error: "Registration is currently by request only — contact admissions@bemsinstitute.ng to request access."
    });
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

  const token = await createSessionToken({ id: user.id, name: user.name, email: user.email, role: user.role, tokenVersion: user.tokenVersion });
  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } });
});

const GENERIC_RESET_MESSAGE = "If an account exists for that email, a reset link has been sent.";

// Deliberately asymmetric with /signup's 409 "account already exists":
// signup has to tell you that, or you'd have no way to know to sign in
// instead. Password reset has no such need, so it stays silent about
// whether the address is registered at all — otherwise this endpoint would
// become a free tool for checking who has a BEMS account.
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
  // Bumping tokenVersion here is what actually revokes every other session
  // — a stolen/lingering cookie from before this reset now fails
  // getSessionUser's version check on its next use, for the rest of its
  // 7-day lifetime, instead of staying valid regardless of the password
  // change.
  const user = await prisma.user.update({
    where: { id: lookup.userId },
    data: { passwordHash, tokenVersion: { increment: 1 } }
  });
  await consumeResetToken(lookup.tokenId);
  await clearAttempts(`login:${user.email}`);

  const sessionToken = await createSessionToken({ id: user.id, name: user.name, email: user.email, role: user.role, tokenVersion: user.tokenVersion });
  res.cookie(SESSION_COOKIE, sessionToken, SESSION_COOKIE_OPTIONS);
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } });
});

export default router;
