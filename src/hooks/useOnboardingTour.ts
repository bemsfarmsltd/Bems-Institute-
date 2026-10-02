"use client";

import { useEffect, useState } from "react";
import type { EventData } from "react-joyride";

// Per-viewer, browser-local only — "have they seen this specific page's
// tour before" is exactly the kind of convenience localStorage is for
// (never syncs across devices, never read back by Claude/the backend).
// Each page's tour is independent and self-contained rather than one
// giant cross-page state machine, so leaving mid-tour or visiting pages
// in a different order never leaves the tour in a broken state.
export function useOnboardingTour(tourKey: string) {
  const storageKey = `bems_tour_seen_${tourKey}`;
  const [run, setRun] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(storageKey)) {
        // A tick of delay so the page's real content (and the elements the
        // tour targets) has mounted before Joyride tries to measure them.
        const timer = setTimeout(() => setRun(true), 400);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable (private browsing, etc.) — tour just won't show, not worth failing over
    }
  }, [storageKey]);

  const markSeen = () => {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // best-effort — if it can't persist, the tour may just show again next visit
    }
    setRun(false);
  };

  const handleCallback = (data: EventData) => {
    if (data.status === "finished" || data.status === "skipped") {
      markSeen();
    }
  };

  return { run, handleCallback };
}
