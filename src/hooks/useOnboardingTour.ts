"use client";

import { useEffect, useState, useCallback } from "react";
import type { EventData } from "react-joyride";
import { fireCelebrationConfetti } from "@/lib/confetti";

/**
 * Enhanced hook for managing interactive product & quest onboarding tours.
 * Supports:
 * - Automatic first-visit trigger after DOM mount
 * - Manual replay via `startTour()` or custom window event `bems:start-tour`
 * - Celebration confetti upon successful tour completion
 * - Per-tour localStorage persistence
 */
export function useOnboardingTour(tourKey: string) {
  const storageKey = `bems_tour_seen_${tourKey}`;
  const [run, setRun] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(storageKey)) {
        // Delay ensures page assets, hydration, and elements have mounted
        const timer = setTimeout(() => setRun(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing)
    }
  }, [storageKey]);

  // Listen for global manual replay events (e.g., student clicks "Take Tour 🚀")
  useEffect(() => {
    const handleReplayEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ key?: string }>;
      if (!customEvent.detail?.key || customEvent.detail.key === tourKey || customEvent.detail.key === "all") {
        setRun(false);
        setTimeout(() => setRun(true), 150);
      }
    };

    window.addEventListener("bems:start-tour", handleReplayEvent);
    return () => window.removeEventListener("bems:start-tour", handleReplayEvent);
  }, [tourKey]);

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // Best-effort storage
    }
    setRun(false);
  }, [storageKey]);

  const startTour = useCallback(() => {
    setRun(false);
    setTimeout(() => setRun(true), 150);
  }, []);

  const resetTour = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {}
    setRun(false);
  }, [storageKey]);

  const handleCallback = useCallback(
    (data: EventData) => {
      if (data.status === "finished") {
        fireCelebrationConfetti();
        markSeen();
      } else if (data.status === "skipped") {
        markSeen();
      }
    },
    [markSeen]
  );

  return {
    run,
    startTour,
    resetTour,
    handleCallback
  };
}

/**
 * Global helper to trigger or restart an onboarding tour from anywhere in the app!
 * Example: `triggerOnboardingTour("home")`
 */
export function triggerOnboardingTour(tourKey: string = "all") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("bems:start-tour", {
        detail: { key: tourKey }
      })
    );
  }
}
