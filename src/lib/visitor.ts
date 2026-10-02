const STORAGE_KEY = "bems_visitor_id";

// Anonymous, non-PII id for deduping page-view counts per visitor per day
// (see POST /lms/track-pageview) — not an account id, not sent anywhere
// except that one tracking call, and never tied to a user record.
export function getOrCreateVisitorId(): string | null {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return null;
  }
}
