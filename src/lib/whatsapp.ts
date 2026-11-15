// BEMS admissions WhatsApp number, digits only (e.g. 2348012345678), from
// the NEXT_PUBLIC_WHATSAPP_NUMBER environment variable. Empty until the
// owner provides the real line: every "chat with admissions" button hides
// while it's empty (the old placeholder could have reached a stranger).
export const BEMS_WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/[^0-9]/g, "");

// No WhatsApp Business API is wired up (no account/credentials exist for
// one), so "instant WhatsApp reply" is built the honest way that needs no
// new credentials: a wa.me deep link with the message pre-filled, one tap
// from opening a real conversation on either side (visitor -> BEMS, or
// staff -> a specific student using their own phone number).
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
