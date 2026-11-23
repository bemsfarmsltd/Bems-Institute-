// BEMS admissions WhatsApp number, digits only in international form.
// 0803 744 7068 confirmed by the owner (2026-11-16) as the admissions line;
// NEXT_PUBLIC_WHATSAPP_NUMBER overrides it if the line ever changes.
export const BEMS_WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348037447068").replace(/[^0-9]/g, "");

// No WhatsApp Business API is wired up (no account/credentials exist for
// one), so "instant WhatsApp reply" is built the honest way that needs no
// new credentials: a wa.me deep link with the message pre-filled, one tap
// from opening a real conversation on either side (visitor -> BEMS, or
// staff -> a specific student using their own phone number).
export function buildWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${toWhatsAppDigits(phone)}?text=${encodeURIComponent(message)}`;
}

// wa.me needs the international form without "+" or a leading 0: students
// type "0803 000 0000" far more often than "+234 803 000 0000". Same rule as
// the backend's normalizePhoneToE164.
export function toWhatsAppDigits(phone: string, countryCode = "234"): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits || phone.trim().startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return countryCode + digits.slice(1);
  if (digits.startsWith(countryCode)) return digits;
  return countryCode + digits;
}
