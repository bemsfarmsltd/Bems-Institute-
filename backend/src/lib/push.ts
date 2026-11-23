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

/** Saves this browser for push. A browser re-subscribing under another account moves to that account. */
export async function saveSubscription(userId: string, input: SubscriptionInput) {
  const endpoint = typeof input.endpoint === "string" ? input.endpoint.trim() : "";
  const p256dh = typeof input.keys?.p256dh === "string" ? input.keys.p256dh : "";
  const auth = typeof input.keys?.auth === "string" ? input.keys.auth : "";
  let ok = false;
  try {
    ok = new URL(endpoint).protocol === "https:";
  } catch {
    ok = false;
  }
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
