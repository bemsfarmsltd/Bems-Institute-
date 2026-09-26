// Generic short-lived signed token — same HMAC-over-base64url approach as
// src/lib/session.ts, but for ephemeral server state (e.g. "here is the
// correct answer to the practice question I just generated") that would
// otherwise need a server-side store. Signing it and handing it to the
// client means the answer key never has to be persisted or exposed before
// the client answers, and can't be tampered with since SESSION_SECRET never
// reaches the browser.

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

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set — cannot sign tokens.");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signPayload<T extends object>(payload: T, maxAgeSeconds: number): Promise<string> {
  const full = { ...payload, exp: Date.now() + maxAgeSeconds * 1000 };
  const body = base64url(encoder.encode(JSON.stringify(full)));
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${base64url(new Uint8Array(signature))}`;
}

export async function verifyPayload<T>(token: string | undefined | null): Promise<(T & { exp: number }) | null> {
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

    const payload = JSON.parse(decoder.decode(base64urlDecode(body))) as T & { exp: number };
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
