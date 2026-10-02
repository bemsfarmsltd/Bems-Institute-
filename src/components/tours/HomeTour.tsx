"use client";

import type { Step } from "react-joyride";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to BEMS FutureSkills! 👋",
    content:
      "Quick tour — 4 steps, about 20 seconds. We'll show you how to find a track, enroll, and get help once you're learning.",
    skipBeacon: true
  },
  {
    target: "#courses",
    title: "Browse the tracks",
    content: "Web Development, AI & Automation, Product Design, and Cybersecurity — each ends with a real project.",
    placement: "top"
  },
  {
    target: '[data-tour="hero-cta"]',
    title: "Ready to enroll?",
    content: "Pay in full or in 3 parts — click here any time to start checkout for a track.",
    placement: "bottom"
  },
  {
    target: '[aria-label="More links"]',
    title: "Everything else lives here",
    content: "Hover the \"•••\" menu for your Dashboard, AI Tutor, Coding Sandbox, Community, and Leaderboard.",
    placement: "bottom"
  }
];

export function HomeTour() {
  const { run, handleCallback } = useOnboardingTour("home");
  return <OnboardingTour run={run} steps={STEPS} onCallback={handleCallback} />;
}
