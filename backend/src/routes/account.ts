import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { checkRateLimit, recordAttempt, rateLimitMessage } from "@/lib/rate-limit";
import { consumeSecondFactor, twoFactorSelect } from "@/lib/account-security";
import { decryptSecret, encryptSecret, generateRecoveryCodes, generateTotpSecret, otpauthUrl, verifyTotp } from "@/lib/totp";

// The signed-in person's own security settings: 2-step verification,
// sign-in history, sign out everywhere. Open to every role; the admin
// Security screen is the main user.
const router = Router();

async function me(req: import("express").Request) {
  const session = await getSessionUser(req);
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, passwordHash: true, tokenVersion: true, totpPendingSecret: true, ...twoFactorSelect }
  });
}

// Wrong passwords/codes on these sensitive actions share one per-user limit.
async function guard(userId: string) {
  return checkRateLimit(`account-security:${userId}`);
}

router.get("/security", async (req, res) => {
  const user = await me(req);
  if (!user) return res.status(401).json({ error: "Sign in first." });
  const [signIns, failed] = await Promise.all([
    prisma.loginEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { method: true, ip: true, userAgent: true, createdAt: true }
    }),
    prisma.authAttempt.count({
      where: { key: `login:${user.email}`, success: false, createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } }
    })
  ]);
  return res.json({
    twoFactor: {
      enabled: !!user.totpEnabledAt,
      enabledAt: user.totpEnabledAt?.toISOString() ?? null,
      recoveryCodesLeft: user.totpRecoveryCodes.length
    },
    recentSignIns: signIns.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })),
    failedSignInsLast7Days: failed
  });
});

// Step 1 of turning 2-step on: needs the password again. Returns the secret
// to scan (as a QR of otpauthUrl) or type in; nothing is enforced yet.
router.post("/2fa/setup", async (req, res) => {
  const user = await me(req);
  if (!user) return res.status(401).json({ error: "Sign in first." });
  if (user.totpEnabledAt) return res.status(400).json({ error: "2-step verification is already on." });
  const limit = await guard(user.id);
  if (limit.blocked) return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });

  const ok = await verifyPassword(String(req.body?.password ?? ""), user.passwordHash);
  await recordAttempt(`account-security:${user.id}`, ok);
  if (!ok) return res.status(401).json({ error: "Incorrect password." });

  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: user.id }, data: { totpPendingSecret: encryptSecret(secret) } });
  return res.json({ secret, otpauthUrl: otpauthUrl(secret, user.email) });
});

// Step 2: prove the app works with one code. Turns it on and returns the
// recovery codes, shown once.
router.post("/2fa/enable", async (req, res) => {
  const user = await me(req);
  if (!user) return res.status(401).json({ error: "Sign in first." });
  if (user.totpEnabledAt) return res.status(400).json({ error: "2-step verification is already on." });
  const secret = user.totpPendingSecret ? decryptSecret(user.totpPendingSecret) : null;
  if (!secret) return res.status(400).json({ error: "Start the setup again." });
  const limit = await guard(user.id);
  if (limit.blocked) return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });

  const step = verifyTotp(secret, String(req.body?.code ?? ""), null);
  await recordAttempt(`account-security:${user.id}`, step !== null);
  if (step === null) return res.status(400).json({ error: "That code didn't match. Check the time on your phone and try the newest code." });

  const recovery = generateRecoveryCodes();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      totpSecret: encryptSecret(secret),
      totpPendingSecret: null,
      totpEnabledAt: new Date(),
      totpLastUsedStep: step,
      totpRecoveryCodes: recovery.hashed
    }
  });
  return res.json({ ok: true, recoveryCodes: recovery.plain });
});

// Turning it off needs both the password and a current code (or a
// recovery code), so a stolen session alone can't remove it.
router.post("/2fa/disable", async (req, res) => {
  const user = await me(req);
  if (!user) return res.status(401).json({ error: "Sign in first." });
  if (!user.totpEnabledAt) return res.status(400).json({ error: "2-step verification is already off." });
  const limit = await guard(user.id);
  if (limit.blocked) return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });

  const passwordOk = await verifyPassword(String(req.body?.password ?? ""), user.passwordHash);
  const codeOk = passwordOk ? await consumeSecondFactor(user, String(req.body?.code ?? "")) : null;
  await recordAttempt(`account-security:${user.id}`, !!codeOk);
  if (!passwordOk || !codeOk) return res.status(401).json({ error: "Incorrect password or code." });

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: null, totpPendingSecret: null, totpEnabledAt: null, totpLastUsedStep: null, totpRecoveryCodes: [] }
  });
  return res.json({ ok: true });
});

// New set of recovery codes (the old ones stop working). Needs a code.
router.post("/2fa/recovery-codes", async (req, res) => {
  const user = await me(req);
  if (!user) return res.status(401).json({ error: "Sign in first." });
  if (!user.totpEnabledAt) return res.status(400).json({ error: "Turn on 2-step verification first." });
  const limit = await guard(user.id);
  if (limit.blocked) return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });

  const used = await consumeSecondFactor(user, String(req.body?.code ?? ""));
  await recordAttempt(`account-security:${user.id}`, !!used);
  if (!used) return res.status(401).json({ error: "That code didn't work." });

  const recovery = generateRecoveryCodes();
  await prisma.user.update({ where: { id: user.id }, data: { totpRecoveryCodes: recovery.hashed } });
  return res.json({ recoveryCodes: recovery.plain });
});

// Ends every session on every device, then signs this browser back in.
router.post("/sign-out-everywhere", async (req, res) => {
  const user = await me(req);
  if (!user) return res.status(401).json({ error: "Sign in first." });
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 } },
    select: { id: true, name: true, email: true, role: true, tokenVersion: true }
  });
  const token = await createSessionToken(updated);
  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res.json({ ok: true });
});

export default router;
