// A deliberately simple format check (not RFC 5322) — just enough to reject
// obviously-malformed strings before they reach the database, not a
// guarantee the mailbox exists.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return email.length > 0 && email.length <= 254 && EMAIL_REGEX.test(email);
}
