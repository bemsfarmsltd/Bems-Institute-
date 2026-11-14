import crypto from "crypto";

// Lowercase letters and digits without look-alikes (0/o, 1/l/i), so a code
// can be read off a flyer and typed. 31^8 ≈ 850 billion codes: random enough
// that one campaign's code says nothing about another's.
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
export const CODE_LENGTH = 8;
export const CODE_PATTERN = new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`);

export function generateCampaignCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return code;
}

/** The attribution tag a campaign's scans and registrations are recorded under. */
export function campaignSource(code: string): string {
  return `c-${code}`;
}

const MAX_TARGET_LENGTH = 500;

/**
 * Accepts a path on this site ("/subscriptions?course=web-dev") or a full
 * https URL. A full URL on this site's own domain is stored as a path, so
 * it's tracked like any internal link.
 */
export function normalizeTarget(
  input: unknown,
  siteUrl: string
): { ok: true; target: string } | { ok: false; error: string } {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) return { ok: false, error: "Enter a target path or URL." };
  if (raw.length > MAX_TARGET_LENGTH) return { ok: false, error: "That target is too long." };

  if (raw.startsWith("/")) {
    // "//evil.com" and "/\evil.com" are other sites to a browser.
    if (raw.startsWith("//") || raw.startsWith("/\\")) return { ok: false, error: "That isn't a valid path." };
    if (raw === "/q" || raw.startsWith("/q/")) return { ok: false, error: "A campaign can't point at another QR short link." };
    return { ok: true, target: raw };
  }

  // Literally "https://". URL() would quietly repair "https:/evil.example"
  // or "https:\\evil.example" into an off-site link, and an admin could
  // take that malformed text for a path on this site.
  if (!/^https:\/\/[^/\\]/i.test(raw)) {
    return { ok: false, error: 'Use a path starting with "/" or a full https:// address.' };
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: 'Use a path starting with "/" or a full https:// address.' };
  }
  if (url.protocol !== "https:") return { ok: false, error: "Outside websites must use https://." };
  if (url.username || url.password) return { ok: false, error: "That isn't a valid web address." };

  const site = new URL(siteUrl);
  if (url.host === site.host) {
    return normalizeTarget(`${url.pathname}${url.search}${url.hash}` || "/", siteUrl);
  }
  return { ok: true, target: url.toString() };
}

export function isExternalTarget(target: string): boolean {
  return !target.startsWith("/");
}

/**
 * Where a scan actually goes. A path on this site gets the campaign's
 * attribution tag, so a registration made after browsing around is still
 * credited to it; qr=1 tells the page the scan was already counted.
 */
export function landingUrl(target: string, code: string): string {
  if (isExternalTarget(target)) return target;
  const url = new URL(target, "https://placeholder.invalid");
  url.searchParams.set("utm_source", campaignSource(code));
  url.searchParams.set("qr", "1");
  return `${url.pathname}${url.search}${url.hash}`;
}
