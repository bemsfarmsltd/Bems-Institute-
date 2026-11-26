import { createHash, randomBytes } from "crypto";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { frontendUrl, sendEmail } from "@/lib/email";

export const INVITE_DAYS = 7;
export const STAFF_ROLES = ["INSTRUCTOR", "ADMIN", "FINANCE", "ADMISSIONS", "MANAGEMENT"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export function hashInviteToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function inviteUrl(rawToken: string): string {
  return frontendUrl(`/staff-invite/${rawToken}`);
}

/**
 * Creates an invite and returns the raw token (the only time it exists in
 * plaintext). Any earlier pending invite for the same email is revoked, so
 * only the newest link works.
 */
export async function createStaffInvite(email: string, role: StaffRole, invitedById: string) {
  const now = new Date();
  await prisma.staffInvite.updateMany({
    where: { email, acceptedAt: null, revokedAt: null, expiresAt: { gt: now } },
    data: { revokedAt: now }
  });
  const rawToken = randomBytes(32).toString("base64url");
  const invite = await prisma.staffInvite.create({
    data: {
      email,
      role,
      tokenHash: hashInviteToken(rawToken),
      invitedById,
      expiresAt: new Date(now.getTime() + INVITE_DAYS * 24 * 3600 * 1000)
    }
  });
  return { invite, rawToken };
}

export async function emailStaffInvite(email: string, role: UserRole, inviterName: string, rawToken: string) {
  const roleName = ({ ADMIN: "an admin", INSTRUCTOR: "a tutor", FINANCE: "finance staff", ADMISSIONS: "admissions staff", MANAGEMENT: "management" } as Record<string, string>)[role] ?? "staff";
  return sendEmail({
    to: email,
    subject: `You're invited to join BEMS Institute as ${roleName}`,
    text:
      `${inviterName} has invited you to join the BEMS Institute team as ${roleName}.\n\n` +
      `Accept the invite here (valid for ${INVITE_DAYS} days):\n${inviteUrl(rawToken)}\n\n` +
      `If you weren't expecting this, ignore this email.`
  });
}

/** A usable invite for this raw token, or null (unknown, used, revoked or expired). */
export async function findUsableInvite(rawToken: string) {
  if (!rawToken || rawToken.length > 100) return null;
  const invite = await prisma.staffInvite.findUnique({ where: { tokenHash: hashInviteToken(rawToken) } });
  if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt <= new Date()) return null;
  return invite;
}

export function inviteStatus(i: { acceptedAt: Date | null; revokedAt: Date | null; expiresAt: Date }) {
  if (i.acceptedAt) return "accepted";
  if (i.revokedAt) return "revoked";
  if (i.expiresAt <= new Date()) return "expired";
  return "pending";
}
