import { prisma } from "@/lib/prisma";

export function getSiteSettings() {
  return prisma.siteSettings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } });
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
