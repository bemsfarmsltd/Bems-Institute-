// Shared by any page that can be a QR/banner landing point. Two different
// param conventions exist in the wild right now — the older `source` (still
// used by the checkout page's direct deep-links) and the newer `utm_source`
// (used by the outdoor banner QR codes) — so this reads either, preferring
// utm_source since that's the current convention going forward.

const STORAGE_KEY = "bems_attribution_source";

export function readAttributionParam(searchParams: URLSearchParams): string | null {
  return searchParams.get("utm_source") || searchParams.get("source");
}

/**
 * Outdoor banners land on the homepage, not checkout — so the source has to
 * be remembered here and carried forward, or it's lost by the time the
 * visitor actually enrolls on /subscriptions.
 */
export function persistAttribution(source: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, source);
  } catch {
    // localStorage unavailable (private browsing, etc.) — attribution just won't survive navigation
  }
}

export function getStoredAttribution(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
