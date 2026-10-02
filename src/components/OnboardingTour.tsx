"use client";

import { Joyride, type Step, type EventData } from "react-joyride";

/**
 * A thin, BEMS-styled wrapper around react-joyride — the coach-marks /
 * spotlight product tour pattern (arrow + tooltip pointing at a specific
 * element), same idea as the first-run walkthroughs in Gmail, Notion,
 * Slack, etc. Each page that uses this owns its own `steps` + its own
 * useOnboardingTour(key) instance — see that hook for why this is
 * per-page rather than one tour spanning multiple page loads.
 */
export function OnboardingTour({
  run,
  steps,
  onCallback
}: {
  run: boolean;
  steps: Step[];
  onCallback: (data: EventData) => void;
}) {
  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={onCallback}
      options={{
        primaryColor: "#AE54C6",
        textColor: "#303654",
        zIndex: 10000,
        buttons: ["back", "close", "skip", "primary"],
        showProgress: true
      }}
      styles={{
        tooltip: {
          borderRadius: 16,
          fontSize: 13
        },
        tooltipTitle: {
          fontWeight: 800,
          fontSize: 15
        },
        buttonPrimary: {
          backgroundColor: "#AE54C6",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700
        },
        buttonBack: {
          color: "#645F80",
          fontSize: 12
        },
        buttonSkip: {
          color: "#8580A3",
          fontSize: 12
        }
      }}
    />
  );
}
