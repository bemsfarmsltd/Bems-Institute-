import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * The one settings row, created on first use. On a fresh database two
 * requests can both try to create it at once; the loser of that race reads
 * the row the winner made instead of failing.
 */
export async function getSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (existing) return existing;
  try {
    return await prisma.siteSettings.create({ data: { id: "singleton" } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return prisma.siteSettings.findUniqueOrThrow({ where: { id: "singleton" } });
    }
    throw err;
  }
}

export type BankTransferDetails = { bankName: string; accountName: string; accountNumber: string };

// Bank transfer is only offered once an admin has entered all three fields:
// showing students a placeholder account would send real tuition to a
// stranger.
export async function getBankTransferDetails(): Promise<BankTransferDetails | null> {
  const s = await getSiteSettings();
  if (!s.bankName || !s.bankAccountName || !s.bankAccountNumber) return null;
  return { bankName: s.bankName, accountName: s.bankAccountName, accountNumber: s.bankAccountNumber };
}

// Nigerian bank account numbers (NUBAN) are exactly 10 digits.
export const ACCOUNT_NUMBER_PATTERN = /^\d{10}$/;

// What's configured on the server, for the General settings screen. Never
// returns the keys themselves.
export function integrationStatus() {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const pub = process.env.PAYSTACK_PUBLIC_KEY || "";
  const from = process.env.EMAIL_FROM || "";
  const mode = secret.startsWith("sk_live_") ? "live" : secret.startsWith("sk_test_") ? "test" : null;
  return {
    paystack: { secretKeySet: !!secret, publicKeySet: !!pub, mode },
    email: {
      configured: !!process.env.RESEND_API_KEY && !!from,
      // Resend's shared test sender only delivers to the account owner.
      usingTestSender: /@resend\.dev>?$/i.test(from.trim())
    }
  };
}
