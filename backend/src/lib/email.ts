import { prisma } from "@/lib/prisma";

// Transactional email via Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
// Plain fetch, no SDK, so there's no new dependency to install.
//
// Needs RESEND_API_KEY and EMAIL_FROM (an address on a domain verified in
// Resend, e.g. "BEMS Institute <admissions@bemsinstitute.ng>"). Without them
// the email is logged instead of sent — same "simulated" fallback as the
// password-reset link — so local dev and CI never send real mail.
//
// Never throws: a failed email must not undo or block a payment or an
// approval that has already been committed to the database.

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(message: EmailMessage): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = Array.isArray(message.to) ? message.to : [message.to];
  if (to.length === 0) return { sent: false };

  if (!apiKey || !from) {
    console.log(
      `\n[email] (not sent — RESEND_API_KEY/EMAIL_FROM not configured)\n  To: ${to.join(", ")}\n  Subject: ${message.subject}\n  ${message.text.replace(/\n/g, "\n  ")}\n`
    );
    return { sent: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: message.subject,
        text: message.text,
        html: message.html ?? textToHtml(message.text)
      }),
      signal: AbortSignal.timeout(10_000)
    });
    if (!res.ok) {
      console.error(`[email] Resend rejected "${message.subject}" (${res.status}): ${await res.text().catch(() => "")}`);
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error(`[email] Failed to send "${message.subject}":`, err);
    return { sent: false };
  }
}

/** Every admin who should hear about new payments: ADMIN accounts, plus any extra addresses in ADMIN_NOTIFY_EMAILS. */
export async function adminEmailAddresses(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deactivatedAt: null },
    select: { email: true }
  });
  const extra = (process.env.ADMIN_NOTIFY_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...admins.map((a) => a.email), ...extra])];
}

export function frontendUrl(path = ""): string {
  const base = (process.env.FRONTEND_URL || "http://localhost:3000").split(",")[0].trim().replace(/\/$/, "");
  return `${base}${path}`;
}

export function naira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function textToHtml(text: string): string {
  const body = escapeHtml(text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#24292D;max-width:560px">${body}<p style="color:#645F80;font-size:13px">BEMS Institute of Technology &amp; Vocational Skills · Umuahia</p></div>`;
}
