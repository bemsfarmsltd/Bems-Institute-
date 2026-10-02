"use client";

import React, { useEffect } from "react";
import {
  Joyride,
  type Step,
  type EventData,
  type TooltipRenderProps,
  type BeaconRenderProps
} from "react-joyride";
import { Sparkles, Rocket, ArrowRight, ArrowLeft, X, Award, CheckCircle2 } from "lucide-react";
import { fireCelebrationConfetti } from "@/lib/confetti";

/**
 * Ultra-trendy, kid- & student-friendly custom tooltip component.
 * Features:
 * - Playful Quest header & Mascot badge
 * - Real-time animated progress bar with smooth transitions
 * - Glassmorphic card elevation with purple-to-blue glow
 * - Celebratory final step with confetti particles
 * - High-contrast accessible buttons with micro-interactions
 */
function CustomTourTooltip({
  index,
  size,
  isLastStep,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps
}: TooltipRenderProps) {
  const progressPercent = Math.round(((index + 1) / size) * 100);

  // Trigger celebration confetti when the user reaches the final step!
  useEffect(() => {
    if (isLastStep) {
      fireCelebrationConfetti();
    }
  }, [isLastStep]);

  return (
    <div
      {...tooltipProps}
      className="relative max-w-[420px] w-[90vw] sm:w-[390px] bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-purple-200/90 shadow-[0_24px_65px_-12px_rgba(121,40,202,0.32)] overflow-hidden text-[#1E2235] font-sans transition-all duration-200"
    >
      {/* Top Animated Multicolor Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#066AC9] via-[#AE54C6] to-[#F59E0B]" />

      {/* Dynamic Quest Progress Bar */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-[#7928CA] to-[#0CBC87] transition-all duration-400 ease-out rounded-r-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Header Row: Quest Badge + Mission Counter + Close Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-[#7928CA] text-[11px] font-black uppercase tracking-wider shadow-2xs">
              <Rocket className="w-3.5 h-3.5 text-[#AE54C6] animate-bounce" />
              <span>BEMS Quest</span>
            </span>

            <span className="text-[11px] font-extrabold text-[#645F80] bg-slate-100 px-2.5 py-0.5 rounded-full">
              Mission {index + 1}/{size}
            </span>
          </div>

          <button
            {...closeProps}
            type="button"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer hover:rotate-90"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Title & Mascot Icon */}
        <div className="space-y-1.5">
          <h3 className="font-display text-[17px] sm:text-[18px] font-black text-[#1D2026] flex items-center gap-2 tracking-tight leading-snug">
            {isLastStep ? (
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#AE54C6] shrink-0" />
            )}
            <span>{step.title}</span>
          </h3>

          {/* Step Content */}
          <div className="text-[13.5px] text-[#4A5568] leading-relaxed">
            {step.content}
          </div>
        </div>

        {/* Celebratory Note on the Last Step */}
        {isLastStep && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900 text-xs font-bold">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mission Completed! You&apos;re now ready to build &amp; learn!</span>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {/* Skip Button */}
          {!isLastStep ? (
            <button
              {...skipProps}
              type="button"
              className="text-xs font-bold text-[#8580A3] hover:text-[#1D2026] transition-colors cursor-pointer py-1.5 px-1"
            >
              Skip Tour
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0CBC87]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Quests Complete!</span>
            </div>
          )}

          {/* Action Buttons (Back + Next/Done) */}
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                {...backProps}
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#645F80] hover:text-[#1D2026] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              {...primaryProps}
              type="button"
              onClick={(e) => {
                if (isLastStep) {
                  fireCelebrationConfetti();
                }
                primaryProps.onClick(e);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer ${
                isLastStep
                  ? "bg-gradient-to-r from-[#0CBC87] via-[#066AC9] to-[#7928CA] hover:brightness-110 animate-pulse"
                  : "bg-gradient-to-r from-[#066AC9] to-[#7928CA] hover:from-[#0556A5] hover:to-[#6B21A8]"
              }`}
            >
              <span>{isLastStep ? "Start Adventure! 🚀" : "Next Quest"}</span>
              {!isLastStep && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fun pulsating beacon component that invites children and students
 * to tap and discover highlighted features like an interactive video game quest!
 */
function CustomTourBeacon(_props: BeaconRenderProps) {
  return (
    <span className="relative flex items-center justify-center w-8 h-8 pointer-events-auto">
      {/* Outer Glow Halo */}
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AE54C6] opacity-60" />
      {/* Middle Pulsing Ring */}
      <span className="absolute inline-flex rounded-full h-6 w-6 bg-gradient-to-tr from-[#7928CA] to-[#066AC9] opacity-80 animate-pulse" />
      {/* Center Sparkling Star Core */}
      <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-white text-[#7928CA] shadow-md border-2 border-[#AE54C6] text-[10px] font-black">
        ✨
      </span>
    </span>
  );
}

/**
 * Upgraded, Trendy, Kid & Student-Friendly BEMS Onboarding Tour
 * Features custom glassmorphism, quest progress bars, gamified rewards, and celebration confetti!
 */
export function OnboardingTour({
  run,
  steps,
  onCallback,
  onReplay,
  showReplayButton = true
}: {
  run: boolean;
  steps: Step[];
  onCallback: (data: EventData) => void;
  onReplay?: () => void;
  showReplayButton?: boolean;
}) {
  const handleTriggerReplay = () => {
    if (onReplay) {
      onReplay();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bems:start-tour"));
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        scrollToFirstStep
        onEvent={onCallback}
        tooltipComponent={CustomTourTooltip}
        beaconComponent={CustomTourBeacon}
        floatingOptions={{
          shiftOptions: { padding: 18 }
        }}
        options={{
          zIndex: 10000,
          overlayColor: "rgba(24, 20, 61, 0.65)"
        }}
      />

      {/* Floating Replay Tour Pill for Kids and Students */}
      {!run && showReplayButton && (
        <button
          type="button"
          onClick={handleTriggerReplay}
          className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md border border-purple-200/90 shadow-[0_4px_20px_rgba(121,40,202,0.18)] hover:shadow-[0_8px_25px_rgba(121,40,202,0.28)] text-[#7928CA] hover:text-[#5B21B6] text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Replay Academy Quest Tour"
        >
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7928CA] to-[#066AC9] text-white flex items-center justify-center text-[10px] shadow-2xs group-hover:rotate-12 transition-transform">
            🚀
          </span>
          <span className="hidden sm:inline">Academy Tour</span>
        </button>
      )}
    </>
  );
}
