"use client";

import type { Step } from "react-joyride";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const STEPS: Step[] = [
  {
    target: '[data-tour="checkout-link"]',
    title: "Start Your Tech Journey 🎒",
    content:
      "Ready to join the cohort? Tap here to reserve your lab seat! Choose full payment with a 12% discount or 3 easy student installments.",
    placement: "top",
    skipBeacon: true
  },
  {
    target: '[data-tour="register-interest"]',
    title: "Got Questions First? 💬",
    content:
      "Not quite sure yet? Leave your name and WhatsApp number—our student mentors will send you sample lessons and answer all your questions!",
    placement: "top"
  },
  {
    target: '[data-tour="reviews"]',
    title: "Graduate Hall of Fame 🏆",
    content:
      "Read genuine reviews and success stories from real students who completed their capstones and earned verified BEMS credentials!",
    placement: "top"
  }
];

export function CourseDetailTour() {
  const { run, startTour, handleCallback } = useOnboardingTour("course-detail");
  return <OnboardingTour run={run} steps={STEPS} onCallback={handleCallback} onReplay={startTour} />;
}
