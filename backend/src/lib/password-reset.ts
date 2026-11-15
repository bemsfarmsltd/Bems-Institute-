import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const TOKEN_BYTES = 32;
const TOKEN_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Creates a password-reset token for a user and returns the RAW token —
 * this is the only moment it exists in plaintext. Only its hash is stored,
 * so it can't be recovered from a database leak.
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = randomBytes(TOKEN_BYTES).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_MAX_AGE_MS)
    }
  });
  return rawToken;
}

/**
 * Emails the reset link through Resend. sendEmail never throws, and only
 * logs instead of sending when Resend isn't configured (local development),
 * so production links no longer end up in the server log.
 */
export function deliverPasswordResetLink(email: string, resetUrl: string): void {
  void sendEmail({
    to: email,
    subject: "Reset your BEMS Institute password",
    text:
      `Someone asked to reset the password for your BEMS Institute account.\n\n` +
      `Reset it here (link valid for 30 minutes):\n${resetUrl}\n\n` +
      `If this wasn't you, ignore this email: your password stays the same.`
  });
}

export interface ResetTokenLookup {
  valid: boolean;
  userId?: string;
  tokenId?: string;
  email?: string;
}

/** Validates a raw token from a reset link without consuming it. */
export async function lookupResetToken(rawToken: string): Promise<ResetTokenLookup> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: { select: { email: true } } }
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { valid: false };
  }

  return { valid: true, userId: record.userId, tokenId: record.id, email: record.user.email };
}

export async function consumeResetToken(tokenId: string): Promise<void> {
  await prisma.passwordResetToken.update({ where: { id: tokenId }, data: { usedAt: new Date() } });
}
