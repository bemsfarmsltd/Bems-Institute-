import type { UserRole } from "@/types/lms";

// Signed, httpOnly session cookie — implemented with Web Crypto (global in
// Node 19+, no extra dependency) so the exact same signing code that used to
// run inside Next.js runs here unchanged. A visitor can still edit
// localStorage in devtools, but they cannot forge a valid signature without
// SESSION_SECRET, which never reaches the browser.

export const SESSION_COOKIE = "bems_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  iat: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64url(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set — cannot sign/verify session cookies.");
  }
  return secret;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(payload: Omit<SessionPayload, "iat">): Promise<string> {
  const full: SessionPayload = { ...payload, iat: Date.now() };
  const body = base64url(encoder.encode(JSON.stringify(full)));
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${base64url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecode(signature) as BufferSource,
      encoder.encode(body)
    );
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(base64urlDecode(body))) as SessionPayload;
    if (Date.now() - payload.iat > SESSION_MAX_AGE_SECONDS * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

// The frontend and backend now live on different origins (Vercel vs.
// Render), so the cookie has to be SameSite=None to be sent on cross-site
// fetches — which the spec requires pairing with Secure. Locally, both
// sides usually run over plain http on localhost, where Secure cookies
// can't be set at all, so dev falls back to Lax (works fine since
// localhost:3000 -> localhost:4000 fetches still count as same-site enough
// for Lax in practice) and Secure only turns on in production.
const isProd = process.env.NODE_ENV === "production";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS * 1000 // express cookie() wants milliseconds
};
