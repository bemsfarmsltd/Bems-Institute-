import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

// Durable account-lockout for password/code-guessing endpoints (login,
// admin registration). Backed by Postgres rather than an in-memory counter
// so it survives a dev-server restart and works the same if this ever runs
// behind more than one process — consistent with how practice-question
// tokens are made single-use elsewhere in this app (PracticeAttempt).

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

export interface RateLimitResult {
  blocked: boolean;
  retryAfterSeconds?: number;
}

export interface AttemptSlot extends RateLimitResult {
  /** After checking the password/code: settle(true) marks the attempt a success. */
  settle: (success: boolean) => Promise<void>;
}

const noop = async () => {};

/**
 * Call before checking a password/code. Atomically reserves this attempt,
 * counted as a FAILURE until settle(true): under a per-key advisory lock it
 * counts recent failures and only inserts the attempt if under the limit.
 * Checking and recording separately let a burst of parallel requests all
 * pass the check before any was recorded (found by Codex: 50 parallel 2FA
 * guesses, no 429).
 *
 * Timestamps go in as UTC wall-clock text cast to timestamp, matching how
 * Prisma stores DateTime in a "timestamp without time zone" column.
 */
export async function checkRateLimit(key: string): Promise<AttemptSlot> {
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_MS);
  const id = randomUUID();
  const [, inserted] = await prisma.$transaction([
    prisma.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"rate:" + key}))`,
    prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO "AuthAttempt" ("id", "key", "success", "createdAt")
      SELECT ${id}, ${key}, false, ${now.toISOString()}::timestamp
      WHERE (
        SELECT COUNT(*) FROM "AuthAttempt"
        WHERE "key" = ${key} AND "success" = false AND "createdAt" > ${since.toISOString()}::timestamp
      ) < ${MAX_FAILURES}
      RETURNING "id"`
  ]);

  if (inserted.length === 1) {
    return {
      blocked: false,
      settle: async (success) => {
        if (success) await prisma.authAttempt.update({ where: { id }, data: { success: true } }).catch(() => {});
      }
    };
  }

  // Conservative on purpose: unblocks when the OLDEST of the recent
  // failures ages out of the window.
  const oldest = await prisma.authAttempt.findFirst({
    where: { key, success: false, createdAt: { gt: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true }
  });
  const retryAfterMs = oldest ? WINDOW_MS - (Date.now() - oldest.createdAt.getTime()) : WINDOW_MS;
  return { blocked: true, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)), settle: noop };
}

/** Records a usage-quota call (see checkUsageQuota). Not for password/code checks: use checkRateLimit's settle. */
export async function recordAttempt(key: string, success: boolean): Promise<void> {
  await prisma.authAttempt.create({ data: { key, success } });
}

/**
 * Wipes a key's failure history — called after a successful password reset
 * so a legitimately-locked-out student isn't still stuck waiting out the
 * window right after proving their identity via the reset link.
 */
export async function clearAttempts(key: string): Promise<void> {
  await prisma.authAttempt.deleteMany({ where: { key } });
}

export function rateLimitMessage(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

/**
 * A plain usage quota, separate from the failure-based lockout above — counts
 * every call in the window regardless of success, for throttling something
 * that costs money per call (Gemini API requests) rather than guarding a
 * password/code field. Reuses the same AuthAttempt log table (key/createdAt
 * is all this needs); callers should record every call with recordAttempt(key, true).
 */
export async function checkUsageQuota(key: string, maxCalls: number, windowMs: number): Promise<RateLimitResult> {
  const since = new Date(Date.now() - windowMs);
  const recent = await prisma.authAttempt.findMany({
    where: { key, createdAt: { gt: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true }
  });

  if (recent.length < maxCalls) return { blocked: false };

  const oldest = recent[0].createdAt;
  const retryAfterMs = windowMs - (Date.now() - oldest.getTime());
  return { blocked: true, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
}
