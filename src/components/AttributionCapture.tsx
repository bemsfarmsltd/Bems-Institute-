"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { readAttributionParam, persistAttribution } from "@/lib/attribution";

/**
 * Invisible. Outdoor banner QR codes land here (the homepage), not on
 * checkout — this logs the scan the moment that happens and remembers the
 * source in localStorage, so a visitor who browses before enrolling on
 * /subscriptions still gets correctly attributed instead of the source
 * being silently lost.
 */
export function AttributionCapture() {
  const searchParams = useSearchParams();
  const tracked = useRef(false);

  useEffect(() => {
    const source = readAttributionParam(searchParams);
    if (!source || tracked.current) return;
    tracked.current = true;
    persistAttribution(source);
    apiFetch("/api/lms/track-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, courseId: searchParams.get("course") || null })
    }).catch(() => {});
  }, [searchParams]);

  return null;
}
