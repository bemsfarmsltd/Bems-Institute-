"use client";

import type { Step } from "react-joyride";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const STEPS: Step[] = [
  {
    target: '[data-tour="track-selector"]',
    title: "Pick your track",
    content: "Choose which course you're enrolling in — the plans below update to match its price.",
    placement: "bottom",
    skipBeacon: true
  },
  {
    target: '[data-tour="payment-plans"]',
    title: "Pay in full or in parts",
    content: "Save 12% paying in full, or split the cost into 3 parts. Both unlock the same classroom access.",
    placement: "top"
  }
];

export function SubscriptionsTour() {
  const { run, handleCallback } = useOnboardingTour("subscriptions");
  return <OnboardingTour run={run} steps={STEPS} onCallback={handleCallback} />;
}
