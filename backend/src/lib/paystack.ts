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
  const hash = crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  return hash === signature;
}
