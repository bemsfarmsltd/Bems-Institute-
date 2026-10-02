"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { readAttributionParam, getStoredAttribution } from "@/lib/attribution";
import { getOrCreateVisitorId } from "@/lib/visitor";

/**
 * Invisible. Real page-view count for one of the two funnel-entry pages
 * (PRD §4.1 step 2, "Visit the sign-up page") — fires once per mount,
 * deduped server-side per visitor per day.
 */
export function PageViewTracker({ page }: { page: "home" | "subscriptions" }) {
  const searchParams = useSearchParams();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    const source = readAttributionParam(searchParams) || getStoredAttribution() || undefined;

    apiFetch("/api/lms/track-pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, visitorId, source })
    }).catch(() => {});
  }, [page, searchParams]);

  return null;
}
