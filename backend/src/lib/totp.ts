import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";

// 2-step verification with an authenticator app (Google Authenticator,
// Microsoft Authenticator, Authy...): RFC 6238 TOTP, 6 digits, 30-second
// steps, SHA-1 (what every authenticator app supports). No dependency.

const STEP_SECONDS = 30;
const DIGITS = 6;
const ISSUER = "BEMS Institute";
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = BASE32.indexOf(ch);
    if (idx === -1) throw new Error("Invalid base32 secret.");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function currentStep(nowMs = Date.now()): number {
  return Math.floor(nowMs / 1000 / STEP_SECONDS);
}

export function totpAt(secret: string, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return code.toString().padStart(DIGITS, "0");
}

/**
 * Checks a code against the current step and one step either side (clock
 * drift). Returns the matching step, or null. Callers store the step and
 * refuse any step <= the last one used, so a code can't be replayed.
 */
export function verifyTotp(secret: string, code: string, lastUsedStep: number | null, nowMs = Date.now()): number | null {
  const clean = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) return null;
  const now = currentStep(nowMs);
  for (const step of [now - 1, now, now + 1]) {
    if (lastUsedStep !== null && step <= lastUsedStep) continue;
    const expected = Buffer.from(totpAt(secret, step));
    if (timingSafeEqual(expected, Buffer.from(clean))) return step;
  }
  return null;
}

export function otpauthUrl(secret: string, accountEmail: string): string {
  const label = encodeURIComponent(`${ISSUER}:${accountEmail}`);
  const params = new URLSearchParams({ secret, issuer: ISSUER, algorithm: "SHA1", digits: String(DIGITS), period: String(STEP_SECONDS) });
  return `otpauth://totp/${label}?${params.toString()}`;
}

// ---- Secrets at rest: AES-256-GCM, key derived from SESSION_SECRET ---------
// Rotating SESSION_SECRET makes stored secrets unreadable; affected staff
// then need an admin to reset their 2-step verification.

function key(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set.");
  return createHash("sha256").update(`${secret}:totp-secret-v1`).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), body.toString("base64url")].join(".");
}

export function decryptSecret(stored: string): string | null {
  const [v, iv, tag, body] = stored.split(".");
  if (v !== "v1" || !iv || !tag || !body) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

// ---- Recovery codes: 8 one-time codes like "k7m2-9xq4" ----------------------
const RECOVERY_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(code.toLowerCase().replace(/[\s-]/g, "")).digest("hex");
}

export function generateRecoveryCodes(count = 8): { plain: string[]; hashed: string[] } {
  const plain = Array.from({ length: count }, () => {
    const s = Array.from({ length: 8 }, () => RECOVERY_ALPHABET[randomInt(RECOVERY_ALPHABET.length)]).join("");
    return `${s.slice(0, 4)}-${s.slice(4)}`;
  });
  return { plain, hashed: plain.map(hashRecoveryCode) };
}
