"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import type { MySpaceExperienceLevel, MySpaceGoalType } from "@/types/lms";
import {
  Briefcase,
  Laptop,
  Rocket,
  TrendingUp,
  Compass,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";

const GOAL_OPTIONS: Array<{
  id: MySpaceGoalType;
  label: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "JOB", label: "Get a tech job", hint: "Land a full-time or remote role", Icon: Briefcase },
  { id: "FREELANCE", label: "Freelance / earn on my own", hint: "Take on client projects", Icon: Laptop },
  { id: "OWN_PRODUCT", label: "Build my own product or business", hint: "Launch a tool or startup", Icon: Rocket },
  { id: "UPSKILL", label: "Grow in my current job", hint: "Add practical tech skills", Icon: TrendingUp },
  { id: "OTHER", label: "Something else", hint: "Explore or learn at your pace", Icon: Compass }
];

const EXPERIENCE_OPTIONS: Array<{
  id: MySpaceExperienceLevel;
  label: string;
  hint: string;
}> = [
  { id: "BEGINNER", label: "Beginner", hint: "I'm brand new or just starting out" },
  { id: "INTERMEDIATE", label: "Intermediate", hint: "I've built a few small projects before" },
  { id: "ADVANCED", label: "Advanced", hint: "I have solid experience and want mastery" }
];

const HOUR_PRESETS = [3, 5, 10, 15, 20];

export default function WelcomeSetupPage() {
  const router = useRouter();
  const { user, isHydrated, mySpace, updateMySpaceProfile } = useLMS();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [goalType, setGoalType] = useState<MySpaceGoalType | null>(null);
  const [goalText, setGoalText] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<MySpaceExperienceLevel | null>(null);
  const [weeklyHours, setWeeklyHours] = useState<number>(6);
  const [motivation, setMotivation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login?redirect=/welcome");
      return;
    }
    if (user.role === "ADMIN") {
      router.replace("/admin");
      return;
    }
    if (user.role === "INSTRUCTOR") {
      router.replace("/instructor");
      return;
    }
    if (mySpace?.onboarded && step !== 5) {
      router.replace("/dashboard");
    }
  }, [isHydrated, user, mySpace?.onboarded, step, router]);

  const firstName = mySpace?.firstName || user?.name?.trim().split(/\s+/)[0] || "there";

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bems_skip_welcome", "1");
    }
    router.push("/dashboard");
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalType || !experienceLevel) return;
    setError(null);
    setSaving(true);
    const result = await updateMySpaceProfile({
      goalType,
      goal: goalText.trim() || undefined,
      experienceLevel,
      weeklyHours,
      motivation: motivation.trim() || undefined
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error || "Could not save your setup.");
      return;
    }
    setStep(5);
  };

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-sm text-[#645F80]">
          Loading your space…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-xl">
          {step < 5 && (
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <span
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s === step
                        ? "w-8 bg-[#AE54C6]"
                        : s < step
                        ? "w-4 bg-emerald-500"
                        : "w-4 bg-[#E5C8ED]"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-[#645F80] ml-1">Step {step} of 4</span>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="m-press text-xs font-bold text-[#645F80] hover:text-[#303654] px-3 py-1.5 rounded-lg hover:bg-white cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          )}

          <div className="m-lift bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-sm">
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#AE54C6]">
                    <Sparkles className="w-3.5 h-3.5" /> Welcome, {firstName}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-[#303654] mt-1">
                    What&apos;s your main goal at BEMS?
                  </h1>
                  <p className="text-xs sm:text-sm text-[#645F80] mt-1">
                    Only you (and your AI tutor) see this — it helps us tailor your space.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {GOAL_OPTIONS.map(({ id, label, hint, Icon }) => {
                    const selected = goalType === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setGoalType(id)}
                        className={`m-press w-full p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                          selected
                            ? "border-[#AE54C6] bg-[#F7EDF9] text-[#303654]"
                            : "border-[#F1E2F5] bg-white hover:border-[#AE54C6]/40 text-[#303654]"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            selected ? "bg-[#AE54C6] text-white" : "bg-[#FAF8FF] text-[#AE54C6]"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold">{label}</div>
                          <div className="text-xs text-[#645F80]">{hint}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Put it in your own words (optional)
                  </label>
                  <input
                    type="text"
                    maxLength={160}
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    placeholder="e.g. Build websites for shops in Umuahia"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5C8ED] text-sm text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/25 focus:border-[#AE54C6]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="purple"
                    disabled={!goalType}
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#303654]">
                    Where are you starting from?
                  </h1>
                  <p className="text-xs sm:text-sm text-[#645F80] mt-1">
                    There&apos;s no wrong answer — most BEMS students start from scratch.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {EXPERIENCE_OPTIONS.map((opt) => {
                    const selected = experienceLevel === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setExperienceLevel(opt.id)}
                        className={`m-press w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          selected
                            ? "border-[#AE54C6] bg-[#F7EDF9]"
                            : "border-[#F1E2F5] bg-white hover:border-[#AE54C6]/40"
                        }`}
                      >
                        <div className="text-sm font-extrabold text-[#303654]">{opt.label}</div>
                        <div className="text-xs text-[#645F80] mt-0.5">{opt.hint}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    variant="purple"
                    disabled={!experienceLevel}
                    onClick={() => setStep(3)}
                    className="gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#AE54C6]">
                    <Clock className="w-3.5 h-3.5" /> Weekly Pace
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-[#303654] mt-1">
                    How many hours a week can you study?
                  </h1>
                  <p className="text-xs sm:text-sm text-[#645F80] mt-1">
                    We&apos;ll track your weekly progress ring against this target.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {HOUR_PRESETS.map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setWeeklyHours(hrs)}
                      className={`m-press px-4 py-2.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                        weeklyHours === hrs
                          ? "border-[#AE54C6] bg-[#AE54C6] text-white"
                          : "border-[#F1E2F5] bg-[#FAF8FF] text-[#303654] hover:border-[#AE54C6]/50"
                      }`}
                    >
                      {hrs} hrs / week
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Or enter an exact number (1–60 hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={weeklyHours}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val)) setWeeklyHours(val);
                    }}
                    className="w-36 px-3.5 py-2.5 rounded-xl border border-[#E5C8ED] text-sm font-bold text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/25 focus:border-[#AE54C6]"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    variant="purple"
                    disabled={weeklyHours < 1 || weeklyHours > 60}
                    onClick={() => setStep(4)}
                    className="gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <form onSubmit={handleFinish} className="space-y-5">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#303654]">
                    Why did you join BEMS?
                  </h1>
                  <p className="text-xs sm:text-sm text-[#645F80] mt-1">
                    A quick reminder for yourself when things get challenging (optional).
                  </p>
                </div>

                <textarea
                  rows={4}
                  maxLength={280}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="e.g. I want to build real software skills and support my family."
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E5C8ED] text-sm text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/25 focus:border-[#AE54C6]"
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button type="submit" variant="purple" disabled={saving} className="gap-2">
                    {saving ? "Saving…" : "Finish setup"} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {step === 5 && (
              <div className="text-center py-6 space-y-4">
                <div className="m-pop w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#303654]">
                  Your space is ready, {firstName}
                </h1>
                <p className="text-sm text-[#645F80] max-w-md mx-auto">
                  We&apos;ve set up your personal dashboard with your weekly goal and learning track.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="purple"
                    onClick={() => router.push("/dashboard")}
                    className="gap-2 px-6"
                  >
                    Go to my dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
