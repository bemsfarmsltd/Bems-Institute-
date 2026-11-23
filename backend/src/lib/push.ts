// Web Push: notifications on the student's phone or computer, even when the
// site isn't open. The browser gives us a subscription (endpoint + keys)
// after the student agrees; we sign each push with our VAPID key.
//
// Needs VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY on the server (generate once
// with `npx web-push generate-vapid-keys`). Without them push is simply off.

import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { frontendUrl } from "@/lib/email";

export class PushError extends Error {}

export const MAX_SUBSCRIPTIONS_PER_USER = 10;

export function pushPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY ? process.env.VAPID_PUBLIC_KEY : null;
}

let configured = false;
function ensureConfigured(): boolean {
  if (!pushPublicKey()) return false;
  if (!configured) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || frontendUrl(), process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
    configured = true;
  }
  return true;
}

export interface SubscriptionInput {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown } | null;
}

// The browsers' own push services. The server sends a request to the
// subscription's endpoint, so any other address is refused: otherwise a
// signed-in user could make our server call a site of their choosing,
// including internal addresses (SSRF; Copilot Phase 4 review).
const PUSH_HOSTS = ["fcm.googleapis.com", "web.push.apple.com"]; // Chrome/Edge/Android, Safari/iPhone
const PUSH_HOST_SUFFIXES = [".push.services.mozilla.com", ".notify.windows.com", ".push.apple.com"]; // Firefox, older Edge, Apple

/** True only for https on the default port at a known browser push service. */
export function isPushServiceEndpoint(endpoint: string): boolean {
  let u: URL;
  try {
    u = new URL(endpoint);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" || u.port !== "" || u.username || u.password) return false;
  const host = u.hostname.toLowerCase();
  return PUSH_HOSTS.includes(host) || PUSH_HOST_SUFFIXES.some((s) => host.endsWith(s));
}

/** Saves this browser for push. A browser re-subscribing under another account moves to that account. */
export async function saveSubscription(userId: string, input: SubscriptionInput) {
  const endpoint = typeof input.endpoint === "string" ? input.endpoint.trim() : "";
  const p256dh = typeof input.keys?.p256dh === "string" ? input.keys.p256dh : "";
  const auth = typeof input.keys?.auth === "string" ? input.keys.auth : "";
  const ok = isPushServiceEndpoint(endpoint);
  if (!ok || endpoint.length > 1000 || !/^[A-Za-z0-9_-]{20,200}$/.test(p256dh) || !/^[A-Za-z0-9_-]{8,100}$/.test(auth)) {
    throw new PushError("This browser's notification details weren't valid. Please try again.");
  }
  const mine = await prisma.pushSubscription.count({ where: { userId, NOT: { endpoint } } });
  if (mine >= MAX_SUBSCRIPTIONS_PER_USER) {
    // Drop the oldest so a new phone still works.
    const oldest = await prisma.pushSubscription.findFirst({ where: { userId }, orderBy: { createdAt: "asc" }, select: { id: true } });
    if (oldest) await prisma.pushSubscription.delete({ where: { id: oldest.id } });
  }
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId, p256dh, auth },
    create: { userId, endpoint, p256dh, auth }
  });
}

export async function removeSubscription(userId: string, endpoint: unknown): Promise<void> {
  if (typeof endpoint !== "string") return;
  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
}

export interface PushMessage {
  title: string;
  body: string;
  url?: string; // a site path, e.g. "/dashboard"
  tag?: string; // same tag replaces an earlier notification on the device
}

/** Sends to every browser the student signed up. Returns how many accepted it. Never throws. */
export async function sendPush(userId: string, message: PushMessage): Promise<number> {
  if (!ensureConfigured()) return 0;
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let delivered = 0;
  const payload = JSON.stringify({ title: message.title, body: message.body, url: message.url ?? "/dashboard", tag: message.tag });
  for (const s of subs) {
    // Checked again at send time; web-push doesn't follow redirects.
    if (!isPushServiceEndpoint(s.endpoint)) {
      await prisma.pushSubscription.deleteMany({ where: { id: s.id } });
      continue;
    }
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 });
      delivered++;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      // 404/410: the browser unsubscribed or expired; forget it.
      if (status === 404 || status === 410) await prisma.pushSubscription.deleteMany({ where: { id: s.id } });
      else console.error("Push send failed:", status ?? err);
    }
  }
  return delivered;
}
