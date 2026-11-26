import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordStrongEnough, verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { checkRateLimit, rateLimitMessage } from "@/lib/rate-limit";
import { recordLogin } from "@/lib/account-security";
import { findUsableInvite } from "@/lib/staff-invites";

// Public side of staff invites: the invite link opens /staff-invite/<token>
// on the site, which uses these two endpoints.
const router = Router();
const GONE = "This invite link has expired or was already used. Ask an admin for a new one.";
const MAX_NAME_LENGTH = 100;

router.get("/:token", async (req, res) => {
  const invite = await findUsableInvite(req.params.token);
  if (!invite) return res.status(410).json({ error: GONE });
  const existing = await prisma.user.findUnique({ where: { email: invite.email }, select: { id: true } });
  return res.json({
    invite: { email: invite.email, role: invite.role, expiresAt: invite.expiresAt.toISOString(), accountExists: !!existing }
  });
});

// New person: { name, password } creates their account.
// Existing account (e.g. a graduate becoming a tutor): { password } of that
// account proves it's theirs, then the role is upgraded.
router.post("/:token/accept", async (req, res) => {
  const rateLimitKey = `staff-invite:${req.ip || "unknown"}`;
  const limit = await checkRateLimit(rateLimitKey);
  if (limit.blocked) return res.status(429).json({ error: rateLimitMessage(limit.retryAfterSeconds!) });

  const invite = await findUsableInvite(req.params.token);
  if (!invite) {
    await limit.settle(false);
    return res.status(410).json({ error: GONE });
  }

  const body = req.body ?? {};
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const existing = await prisma.user.findUnique({ where: { email: invite.email } });

  if (existing) {
    const ok = await verifyPassword(password, existing.passwordHash);
    await limit.settle(ok);
    if (!ok) return res.status(401).json({ error: "That's not the password for this account." });
    if (existing.deactivatedAt) return res.status(403).json({ error: "This account has been deactivated. Contact an admin." });
  } else {
    if (!name || name.length > MAX_NAME_LENGTH) return res.status(400).json({ error: "Enter your name (up to 100 characters)." });
    if (!isPasswordStrongEnough(password)) return res.status(400).json({ error: "Password must be at least 8 characters." });
    // A valid invite plus a well-formed new account is a successful attempt.
    await limit.settle(true);
  }

  // Claim the invite first, atomically, so one link can't be used twice.
  const claimed = await prisma.staffInvite.updateMany({
    where: { id: invite.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
    data: { acceptedAt: new Date() }
  });
  if (claimed.count !== 1) return res.status(410).json({ error: GONE });

  const select = { id: true, name: true, email: true, role: true, avatarUrl: true, tokenVersion: true, totpEnabledAt: true } as const;
  // A student becomes staff with the invited role; existing staff keep their
  // role and gain the invited one as an extra role (one person can be, say,
  // Management and Admissions). Admins already have every permission.
  const user = !existing
    ? await prisma.user.create({ data: { name, email: invite.email, passwordHash: await hashPassword(password), role: invite.role }, select })
    : existing.role === "STUDENT"
      ? // Bump tokenVersion: sessions issued with the old role stop working.
        await prisma.user.update({ where: { id: existing.id }, data: { role: invite.role, tokenVersion: { increment: 1 } }, select })
      : existing.role === "ADMIN" || existing.role === invite.role || existing.extraRoles.includes(invite.role)
        ? await prisma.user.findUniqueOrThrow({ where: { id: existing.id }, select })
        : invite.role === "ADMIN"
          ? // Admin is always the main role; the old main role is kept as an extra.
            await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN", extraRoles: [...new Set([existing.role, ...existing.extraRoles])].filter((r) => r !== "ADMIN"), tokenVersion: { increment: 1 } }, select })
          : await prisma.user.update({ where: { id: existing.id }, data: { extraRoles: { push: invite.role } }, select });

  if (user.totpEnabledAt) return res.json({ ok: true, signInRequired: true });

  const token = await createSessionToken({ id: user.id, name: user.name, email: user.email, role: user.role, tokenVersion: user.tokenVersion });
  res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  await recordLogin(req, user.id, "invite");
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } });
});

export default router;
