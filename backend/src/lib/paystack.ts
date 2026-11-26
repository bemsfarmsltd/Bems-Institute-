import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set.");
  return key;
}

export interface PaystackVerifyData {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number; // kobo
  channel: string | null;
  paid_at: string | null;
  gateway_response: string | null;
  customer?: { email?: string };
}

// Always re-fetches the transaction's real status from Paystack by
// reference — never trust the amount/status a client reports about its own
// payment, since that's exactly the hole that let the old fake "paystack"
// flow mark enrollments paid for free.
export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyData> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` }
  });
  const json = await res.json();
  if (!res.ok || !json?.status) {
    throw new Error(json?.message || "Paystack verification request failed.");
  }
  return json.data as PaystackVerifyData;
}

// Paystack signs every webhook body with HMAC-SHA512 over the raw request
// bytes using the secret key — this is how we know a POST to /payments/webhook
// actually came from Paystack and not from anyone who found the URL.
export function verifyWebhookSignature(rawBody: Buffer, signature: string | undefined | null): boolean {
  if (!signature) return false;
  const expected = Buffer.from(crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex"));
  const received = Buffer.from(signature);
  // Constant-time compare so response timing can't leak how much of a forged
  // signature was correct. timingSafeEqual throws on unequal lengths.
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export interface PaystackListedTransaction {
  reference: string;
  amount: number; // kobo
  status: string; // "success" | "failed" | "abandoned" | ...
  paid_at: string | null;
  created_at?: string;
  channel: string | null;
  customer?: { email?: string };
}

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

// Every transaction Paystack has between two instants (inclusive), for the
// Finance daily check. Paged at 100; stops after 20 pages (2,000 a day is far
// above what BEMS takes).
export async function listPaystackTransactions(from: Date, to: Date): Promise<PaystackListedTransaction[]> {
  const out: PaystackListedTransaction[] = [];
  for (let page = 1; page <= 20; page++) {
    const qs = new URLSearchParams({ perPage: "100", page: String(page), from: from.toISOString(), to: to.toISOString() });
    const res = await fetch(`${PAYSTACK_BASE_URL}/transaction?${qs}`, { headers: { Authorization: `Bearer ${secretKey()}` } });
    const json = await res.json();
    if (!res.ok || !json?.status) throw new Error(json?.message || "Paystack transaction list request failed.");
    out.push(...(json.data as PaystackListedTransaction[]));
    const pageCount = Number(json.meta?.pageCount ?? 1);
    if (page >= pageCount || (json.data as unknown[]).length === 0) break;
  }
  return out;
}
