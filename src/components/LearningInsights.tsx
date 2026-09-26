"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLMS } from "@/context/LMSContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Target,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Bot,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";

interface PracticeQuestionState {
  token: string;
  prompt: string;
  options: string[];
  conceptName: string;
}

interface PracticeResult {
  correct: boolean;
  correctOption: number;
  explanation: string;
}

function PracticeQuestionPanel({ conceptId }: { conceptId: string }) {
  const { refreshLearningProfile } = useLMS();
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "answered">("idle");
  const [question, setQuestion] = useState<PracticeQuestionState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setStatus("loading");
    setError(null);
    setResult(null);
    setSelected(null);
    try {
      const res = await fetch("/api/learning/practice-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate a practice question.");
      setQuestion(data);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("idle");
    }
  };

  const answer = async (optionIndex: number) => {
    if (!question || status === "answered") return;
    setSelected(optionIndex);
    try {
      const res = await fetch("/api/learning/practice-question/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: question.token, selectedOption: optionIndex })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not score that answer.");
      setResult(data);
      setStatus("answered");
      refreshLearningProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "idle") {
    return (
      <div className="mt-3 pt-3 border-t border-black/5">
        <button
          type="button"
          onClick={generate}
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#7928CA] hover:underline"
        >
          <Sparkles className="w-3.5 h-3.5" /> Generate a practice question
        </button>
        {error && <p className="text-[11px] text-red-600 mt-1.5">{error}</p>}
      </div>
    );
  }

  if (status === "loading" || !question) {
    return (
      <div className="mt-3 pt-3 border-t border-black/5 flex items-center gap-1.5 text-[11px] text-[#8580A3]">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing a fresh question&hellip;
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-black/5 space-y-2">
      <p className="text-xs font-semibold text-[#18143D]">{question.prompt}</p>
      <div className="space-y-1.5">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrectOption = status === "answered" && result && i === result.correctOption;
          const isWrongSelection = status === "answered" && isSelected && result && !result.correct;
          return (
            <button
              key={i}
              type="button"
              disabled={status === "answered"}
              onClick={() => answer(i)}
              className={`w-full text-left text-[11px] px-3 py-2 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                isCorrectOption
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : isWrongSelection
                  ? "border-red-300 bg-red-50 text-red-900"
                  : "border-[#E6E1F5] bg-white hover:border-[#7928CA]/40"
              }`}
            >
              <span>{opt}</span>
              {isCorrectOption && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />}
              {isWrongSelection && <XCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />}
            </button>
          );
        })}
      </div>
      {status === "answered" && result && (
        <div className={`text-[11px] rounded-lg p-2.5 ${result.correct ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
          <p className="font-bold mb-0.5">{result.correct ? "Correct!" : "Not quite."}</p>
          <p>{result.explanation}</p>
          <button type="button" onClick={generate} className="mt-1.5 font-bold text-[#7928CA] hover:underline">
            Try another
          </button>
        </div>
      )}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  PREREQUISITE: <TrendingDown className="w-4 h-4" />,
  REVIEW: <BookOpen className="w-4 h-4" />,
  ALTERNATIVE_EXPLANATION: <Bot className="w-4 h-4" />,
  READY_FOR_NEXT: <Sparkles className="w-4 h-4" />
};

const URGENCY_STYLE: Record<string, string> = {
  HIGH: "border-red-200 bg-red-50",
  MEDIUM: "border-amber-200 bg-amber-50",
  LOW: "border-emerald-200 bg-emerald-50"
};

function MasteryBar({ name, score, tone }: { name: string; score: number; tone: "strong" | "weak" }) {
  const pct = Math.round(score * 100);
  const barColor = tone === "strong" ? "bg-emerald-500" : "bg-red-400";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-semibold text-[#18143D] truncate pr-2">{name}</span>
        <span className="font-bold text-[#645F80] shrink-0">{pct}%</span>
      </div>
      <div className="w-full bg-[#F0EDF9] rounded-full h-2 overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function LearningInsights() {
  const { learningProfile } = useLMS();
  const { strengths, weaknesses, recommendations, learningStreak } = learningProfile;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Nothing to show yet — no quiz attempts logged. Don't show an empty shell.
  if (strengths.length === 0 && weaknesses.length === 0 && recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E6E1F5] p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F0EDF9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple">PERSONALIZATION ENGINE</Badge>
            {learningStreak > 0 && (
              <Badge variant="gold">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> {learningStreak} day streak
              </Badge>
            )}
          </div>
          <h2 className="text-2xl font-black text-[#18143D]">Your Learning Insights</h2>
        </div>
        <p className="text-xs text-[#645F80] max-w-sm">
          Computed from your real quiz answers — not a generic study plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Strongest
          </h3>
          <div className="space-y-3">
            {strengths.length === 0 ? (
              <p className="text-xs text-[#8580A3]">Take a quiz to see your strengths here.</p>
            ) : (
              strengths.map((s) => <MasteryBar key={s.conceptId} name={s.name} score={s.masteryScore} tone="strong" />)
            )}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4" /> Needs Attention
          </h3>
          <div className="space-y-3">
            {weaknesses.length === 0 ? (
              <p className="text-xs text-[#8580A3]">Nothing weak yet — keep going.</p>
            ) : (
              weaknesses.map((s) => <MasteryBar key={s.conceptId} name={s.name} score={s.masteryScore} tone="weak" />)
            )}
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#645F80] mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#7928CA]" /> Recommended For You
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const isOpen = expandedId === rec.id;
              return (
                <div
                  key={rec.id}
                  className={`rounded-2xl border p-4 ${URGENCY_STYLE[rec.urgency] || "border-[#E6E1F5] bg-[#FAF8FF]"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#E6E1F5] flex items-center justify-center text-[#7928CA] shrink-0">
                        {TYPE_ICON[rec.type] || <Target className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#18143D] text-sm">{rec.title}</h4>
                        {rec.estimatedMinutes > 0 && (
                          <span className="text-[11px] text-[#8580A3]">~{rec.estimatedMinutes} min</span>
                        )}
                      </div>
                    </div>
                    <Link href={rec.actionUrl}>
                      <Button variant="purple" size="sm" className="shrink-0 gap-1">
                        Go <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : rec.id)}
                    className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#7928CA] hover:underline"
                  >
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    Why am I seeing this?
                  </button>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-black/5 space-y-2">
                      <p className="text-xs text-[#4A4568] leading-relaxed">{rec.reason}</p>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8580A3] block mb-1">
                          Evidence
                        </span>
                        <ul className="space-y-1">
                          {rec.evidence.map((e, i) => (
                            <li key={i} className="text-[11px] text-[#645F80] flex items-start gap-1.5">
                              <ArrowUpRight className="w-3 h-3 mt-0.5 shrink-0 text-[#7928CA]" />
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {rec.conceptId && (rec.type === "PREREQUISITE" || rec.type === "REVIEW") && (
                        <PracticeQuestionPanel key={rec.conceptId} conceptId={rec.conceptId} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
