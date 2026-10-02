// BEMS admissions WhatsApp number — same placeholder used in Footer.tsx
// ("+234 800 000 0000"). Replace with the real admissions line before launch.
export const BEMS_WHATSAPP_NUMBER = "2348000000000";

// No WhatsApp Business API is wired up (no account/credentials exist for
// one), so "instant WhatsApp reply" is built the honest way that needs no
// new credentials: a wa.me deep link with the message pre-filled, one tap
// from opening a real conversation on either side (visitor -> BEMS, or
// staff -> a specific student using their own phone number).
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
