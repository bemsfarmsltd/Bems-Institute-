"use client";

import type { Step } from "react-joyride";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const STEPS: Step[] = [
  {
    target: '[data-tour="track-selector"]',
    title: "Choose Your Tech Specialty 🎯",
    content:
      "Pick the track you want to master—Web Dev, AI, Product Design, or Cybersecurity. The tuition plans below automatically adapt to your selection!",
    placement: "bottom",
    skipBeacon: true
  },
  {
    target: '[data-tour="payment-plans"]',
    title: "Student & Family Friendly Tuition 💳",
    content:
      "Pay in full to save 12%, or choose 3 easy installments. Both options unlock identical physical lab access in Umuahia, live Zoom workshops, and certifications!",
    placement: "top"
  }
];

export function SubscriptionsTour() {
  const { run, startTour, handleCallback } = useOnboardingTour("subscriptions");
  return <OnboardingTour run={run} steps={STEPS} onCallback={handleCallback} onReplay={startTour} />;
}
