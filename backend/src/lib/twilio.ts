const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";

// Students/leads enter phone numbers in local Nigerian format ("0801...")
// far more often than E.164 ("+234801..."), but WhatsApp/Twilio requires
// E.164. Best-effort normalize rather than reject — a wrong-but-plausible
// number just means the send fails later (handled gracefully), not a
// blocked form submission.
export function normalizePhoneToE164(phone: string, defaultCountryCode = "234"): string | null {
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return null;
  if (phone.trim().startsWith("+")) return `+${digits}`;
  if (digits.startsWith("0")) return `+${defaultCountryCode}${digits.slice(1)}`;
  if (digits.startsWith(defaultCountryCode)) return `+${digits}`;
  return `+${defaultCountryCode}${digits}`;
}

export interface WhatsAppSendResult {
  ok: boolean;
  error?: string;
}

// Every call site treats this as a best-effort side effect, never as
// something that should fail the parent action — the Twilio Sandbox in
// particular can only message numbers that sent it the "join <code>"
// message first, so a failed send here is an expected, common outcome
// during development, not a bug.
export async function sendWhatsAppMessage(toPhone: string, message: string): Promise<WhatsAppSendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    return { ok: false, error: "Twilio is not configured." };
  }

  const to = normalizePhoneToE164(toPhone);
  if (!to) {
    return { ok: false, error: "Could not parse a phone number to send to." };
  }

  const body = new URLSearchParams({
    From: `whatsapp:${from}`,
    To: `whatsapp:${to}`,
    Body: message
  });

  const authHeader = `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;

  let messageSid: string;
  try {
    const res = await fetch(`${TWILIO_API_BASE}/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data?.message || "Twilio rejected the message." };
    }
    messageSid = data.sid;
  } catch {
    return { ok: false, error: "Could not reach Twilio." };
  }

  // Twilio's initial response always says "queued," even for a number that
  // will fail — the WhatsApp Sandbox in particular rejects any number that
  // hasn't sent it the "join <code>" message first, but that rejection only
  // shows up a moment later. A short wait-then-check is the only way to
  // report an honest ok/fail signal back to the caller (used to decide
  // whether to show a manual click-to-WhatsApp fallback).
  await new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    const statusRes = await fetch(`${TWILIO_API_BASE}/Accounts/${sid}/Messages/${messageSid}.json`, {
      headers: { Authorization: authHeader }
    });
    const statusData = await statusRes.json();
    if (statusData.status === "failed" || statusData.status === "undelivered") {
      return { ok: false, error: statusData.error_message || `Twilio delivery failed (code ${statusData.error_code}).` };
    }
    return { ok: true };
  } catch {
    // Couldn't confirm delivery, but the send itself was accepted — treat
    // as sent rather than punish the caller for a status-check hiccup.
    return { ok: true };
  }
}
