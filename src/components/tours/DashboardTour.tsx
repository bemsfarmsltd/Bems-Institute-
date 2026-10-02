"use client";

import type { Step } from "react-joyride";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to Mission Control! 🛸",
    content:
      "This is your learning command center! Track daily study streaks, project submissions, and watch your skills grow as you earn verified certificates.",
    skipBeacon: true
  },
  {
    target: "#my-courses-list",
    title: "Your Active Learning Quests 📚",
    content:
      "All your enrolled classrooms live here! Jump straight back into lessons, coding exercises, and quizzes right where you left off.",
    placement: "top"
  },
  {
    target: '[aria-label="More links"]',
    title: "Supercharged Learning Tools ⚡",
    content:
      "Got stuck? Chat with your AI Tutor anytime, experiment in the Code Sandbox, or see where you rank on the Student Leaderboard!",
    placement: "bottom"
  },
  {
    target: "#edit-profile",
    title: "Your Explorer Identity 🆔",
    content:
      "Customize your avatar, keep your name shining on your certificates, and protect your account with two-step security!",
    placement: "top"
  }
];

export function DashboardTour() {
  const { run, startTour, handleCallback } = useOnboardingTour("dashboard");
  return <OnboardingTour run={run} steps={STEPS} onCallback={handleCallback} onReplay={startTour} />;
}
