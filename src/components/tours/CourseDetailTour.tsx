"use client";

import type { Step } from "react-joyride";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const STEPS: Step[] = [
  {
    target: '[data-tour="checkout-link"]',
    title: "Ready to enroll?",
    content: "This takes you to checkout — pick full payment or 3 installments, and pay by card, USSD, or bank transfer.",
    placement: "top",
    skipBeacon: true
  },
  {
    target: '[data-tour="register-interest"]',
    title: "Not ready yet?",
    content: "Just leave your name and phone — no payment, no commitment. We'll message you on WhatsApp and follow up.",
    placement: "top"
  },
  {
    target: '[data-tour="reviews"]',
    title: "Hear from real graduates",
    content: "Only students who actually earned this course's certificate can leave a review here.",
    placement: "top"
  }
];

export function CourseDetailTour() {
  const { run, handleCallback } = useOnboardingTour("course-detail");
  return <OnboardingTour run={run} steps={STEPS} onCallback={handleCallback} />;
}
