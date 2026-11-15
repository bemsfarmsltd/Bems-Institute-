import type { Request } from "express";
import { prisma } from "@/lib/prisma";
import { decryptSecret, hashRecoveryCode, verifyTotp } from "@/lib/totp";

type TwoFactorUser = {
  id: string;
  totpSecret: string | null;
  totpEnabledAt: Date | null;
  totpLastUsedStep: number | null;
  totpRecoveryCodes: string[];
};

/**
 * Checks a 6-digit authenticator code, or a one-time recovery code, for a
 * user with 2-step verification on, and records its use (so neither can be
 * reused). Atomic: the update only applies if nobody used the same code in
 * between.
 */
export async function consumeSecondFactor(user: TwoFactorUser, code: string): Promise<"totp" | "recovery" | null> {
  if (!user.totpEnabledAt || !user.totpSecret || typeof code !== "string") return null;
  const secret = decryptSecret(user.totpSecret);

  if (secret) {
    const step = verifyTotp(secret, code, user.totpLastUsedStep);
    if (step !== null) {
      const claimed = await prisma.user.updateMany({
        where: {
          id: user.id,
          OR: [{ totpLastUsedStep: null }, { totpLastUsedStep: { lt: step } }]
        },
        data: { totpLastUsedStep: step }
      });
      return claimed.count === 1 ? "totp" : null;
    }
  }

  const hashed = hashRecoveryCode(code);
  if (user.totpRecoveryCodes.includes(hashed)) {
    const claimed = await prisma.user.updateMany({
      where: { id: user.id, totpRecoveryCodes: { has: hashed } },
      data: { totpRecoveryCodes: user.totpRecoveryCodes.filter((c) => c !== hashed) }
    });
    return claimed.count === 1 ? "recovery" : null;
  }
  return null;
}

export const twoFactorSelect = {
  totpSecret: true,
  totpEnabledAt: true,
  totpLastUsedStep: true,
  totpRecoveryCodes: true
} as const;

export async function recordLogin(req: Request, userId: string, method: string): Promise<void> {
  const ua = String(req.headers["user-agent"] || "").slice(0, 300);
  await prisma.loginEvent.create({ data: { userId, method, ip: (req.ip || "").slice(0, 64), userAgent: ua } }).catch(() => {});
  // Keep the last 50 per person.
  const old = await prisma.loginEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: 50,
    select: { id: true }
  });
  if (old.length) await prisma.loginEvent.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
}
