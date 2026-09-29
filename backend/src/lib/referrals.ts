import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// PRD §5.3: "Bring a friend — any student whose friend signs up and pays
// gets ₦5,000 in credit." A referral is only CREDITED once the referee's
// enrollment shows a real payment, not just a signup, so someone can't farm
// credit by inviting friends who never actually enroll.

function randomSuffix(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** Lazily generates and persists a referral code the first time a user needs one. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.referralCode) return user.referralCode;

  const base = user.name.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "BEMS";
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `${base}${randomSuffix(4)}`;
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      return code;
    } catch {
      // unique constraint collision — extremely unlikely, just retry with a new suffix
    }
  }
  throw new Error("Could not generate a unique referral code.");
}

/**
 * Called at signup when a `referralCode` was supplied. Silently no-ops on
 * an unknown/self-referral code rather than blocking account creation over
 * it — a wrong code shouldn't stop someone from signing up.
 */
export async function recordReferralSignup(refereeId: string, refereeName: string, code: string): Promise<void> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return;

  const referrer = await prisma.user.findUnique({ where: { referralCode: trimmed } });
  if (!referrer || referrer.id === refereeId) return;

  await prisma.user.update({ where: { id: refereeId }, data: { referredByCode: trimmed } });
  await prisma.referral.create({
    data: { referrerId: referrer.id, refereeId, refereeName }
  }).catch(() => {
    // refereeId already has a referral row (shouldn't happen for a fresh
    // signup, but fail soft either way) — never block on this.
  });
}

/**
 * Called after any event that proves a real payment happened. If this user
 * was referred and hasn't already triggered a credit, pays out the
 * referrer now.
 */
export async function creditReferralIfEligible(refereeId: string): Promise<void> {
  const referral = await prisma.referral.findUnique({ where: { refereeId } });
  if (!referral || referral.status === "CREDITED") return;

  await prisma.$transaction([
    prisma.referral.update({
      where: { refereeId },
      data: { status: "CREDITED", creditedAt: new Date() }
    }),
    prisma.user.update({
      where: { id: referral.referrerId },
      data: { creditBalanceNaira: { increment: referral.creditNaira } }
    })
  ]);

  await createNotification({
    userId: referral.referrerId,
    title: `You earned ₦${referral.creditNaira.toLocaleString()} referral credit!`,
    message: `${referral.refereeName} enrolled using your referral code. Your credit balance has been updated.`,
    category: "GAMIFICATION",
    linkUrl: "/dashboard"
  });
}
