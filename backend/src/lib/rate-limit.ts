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

/** Call before checking a password/code. Does not itself record anything. */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const since = new Date(Date.now() - WINDOW_MS);
  const recentFailures = await prisma.authAttempt.findMany({
    where: { key, success: false, createdAt: { gt: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true }
  });

  if (recentFailures.length < MAX_FAILURES) return { blocked: false };

  // Conservative on purpose: unblocks when the OLDEST of the recent
  // failures ages out of the window, not the earliest moment the count
  // could theoretically drop below the threshold.
  const oldest = recentFailures[0].createdAt;
  const retryAfterMs = WINDOW_MS - (Date.now() - oldest.getTime());
  return { blocked: true, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
}

/** Call once per attempt, after the password/code has been checked. */
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
