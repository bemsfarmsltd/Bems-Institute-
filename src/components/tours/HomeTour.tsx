"use client";

import type { Step } from "react-joyride";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to BEMS FutureSkills! 🚀✨",
    content:
      "Hey Explorer! Welcome to your digital academy. Ready to build cool websites, train smart AI, and level up your tech superpowers? Let's take a quick 20-second tour!",
    skipBeacon: true
  },
  {
    target: "#courses",
    title: "Choose Your Superpower Track 💡",
    content:
      "Explore Web Development, AI & Automation, Product Design, and Cybersecurity. Each track is packed with hands-on coding labs and real projects to show off!",
    placement: "top"
  },
  {
    target: '[data-tour="hero-cta"]',
    title: "Unlock Your Explorer Pass 🎟️",
    content:
      "Student & family-friendly tuition! Pay up front to save 12% or choose 3 easy installments. Both include physical lab workstations in Umuahia + live Zoom mentoring!",
    placement: "bottom"
  },
  {
    target: '[aria-label="More links"]',
    title: "Your Secret Tech Toolbelt 🧰",
    content:
      "Hover here anytime for your 24/7 AI Study Buddy, Interactive Code Playground, Student Community, and the Cohort Leaderboard!",
    placement: "bottom"
  }
];

export function HomeTour() {
  const { run, startTour, handleCallback } = useOnboardingTour("home");
  return <OnboardingTour run={run} steps={STEPS} onCallback={handleCallback} onReplay={startTour} />;
}
