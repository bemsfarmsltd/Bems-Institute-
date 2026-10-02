"use client";

import type { Step } from "react-joyride";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to your Dashboard",
    content: "This is home base — track your courses, your progress, and your account from here.",
    skipBeacon: true
  },
  {
    target: "#my-courses-list",
    title: "Your courses",
    content: "Jump back into any enrolled course's classroom from here, right where you left off.",
    placement: "top"
  },
  {
    target: '[aria-label="More links"]',
    title: "AI Tutor, Sandbox, Community & more",
    content: "Hover the \"•••\" menu any time for your AI Tutor, Coding Sandbox, Community, and Leaderboard.",
    placement: "bottom"
  },
  {
    target: "#edit-profile",
    title: "Keep your account up to date",
    content: "Update your name, avatar, and password here whenever you need to.",
    placement: "top"
  }
];

export function DashboardTour() {
  const { run, handleCallback } = useOnboardingTour("dashboard");
  return <OnboardingTour run={run} steps={STEPS} onCallback={handleCallback} />;
}
