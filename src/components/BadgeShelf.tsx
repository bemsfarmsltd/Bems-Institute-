"use client";

import React, { useEffect, useRef, useState } from "react";
import type { MySpaceBadge } from "@/types/lms";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Footprints,
  GraduationCap,
  Lock,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

interface BadgeShelfProps {
  badges: MySpaceBadge[];
  accentHex: string;
  onMarkSeen: () => Promise<void> | void;
}

function getBadgeIcon(
  iconName: string,
): React.ComponentType<{ className?: string }> {
  const normalized = iconName.toLowerCase();
  if (normalized.includes("footprint") || normalized.includes("step"))
    return Footprints;
  if (normalized.includes("book")) return BookOpen;
  if (normalized.includes("flame") || normalized.includes("streak"))
    return Flame;
  if (normalized.includes("trophy")) return Trophy;
  if (normalized.includes("target") || normalized.includes("goal"))
    return Target;
  if (normalized.includes("rocket") || normalized.includes("ship"))
    return Rocket;
  if (normalized.includes("star")) return Star;
  if (normalized.includes("zap") || normalized.includes("warrior")) return Zap;
  if (normalized.includes("grad") || normalized.includes("cert"))
    return GraduationCap;
  if (normalized.includes("check")) return CheckCircle2;
  if (normalized.includes("sparkle")) return Sparkles;
  return Award;
}

// Shown near the top of the dashboard: badges are marked seen as soon as this
// appears, so it has to be where the student actually looks.
export function BadgeCelebration({
  badges,
  accentHex,
  onMarkSeen,
}: BadgeShelfProps) {
  const [celebratingBadges, setCelebratingBadges] = useState<MySpaceBadge[]>(
    [],
  );
  const seenCalledRef = useRef(false);

  useEffect(() => {
    const newlyEarned = badges.filter((b) => b.earned && b.isNew);
    if (newlyEarned.length > 0 && !seenCalledRef.current) {
      seenCalledRef.current = true;
      setCelebratingBadges(newlyEarned);
      void onMarkSeen();
    }
  }, [badges, onMarkSeen]);

  if (celebratingBadges.length === 0) return null;

  return (
    <div
      role="status"
      className="m-pop transition-opacity duration-300 rounded-2xl border-2 p-4 sm:p-5 bg-white shadow-md flex items-start justify-between gap-4"
      style={{ borderColor: accentHex }}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className="w-11 h-11 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
          style={{ backgroundColor: accentHex }}
        >
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div
            className="text-[11px] font-extrabold uppercase tracking-wider"
            style={{ color: accentHex }}
          >
            New {celebratingBadges.length === 1 ? "Badge" : "Badges"} Earned
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#303654] mt-0.5">
            {celebratingBadges.map((b) => b.title).join(" · ")}
          </h3>
          <p className="text-xs text-[#645F80] mt-0.5">
            {celebratingBadges.length === 1
              ? celebratingBadges[0].description
              : `${celebratingBadges.length} new badges. See them in your Milestone Badges below.`}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss badge celebration"
        onClick={() => setCelebratingBadges([])}
        className="m-press p-1.5 rounded-lg text-[#645F80] hover:text-[#303654] hover:bg-slate-100 cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function BadgeShelf({
  badges,
  accentHex,
}: Omit<BadgeShelfProps, "onMarkSeen">) {
  if (!badges || badges.length === 0) return null;

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div
      data-reveal
      className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 sm:p-6 shadow-xs space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#303654]">
            Milestone Badges
          </h2>
          <p className="text-xs text-[#645F80] font-semibold mt-0.5">
            Earned from your real lessons, streaks, quizzes, and projects
          </p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-extrabold text-white"
          style={{ backgroundColor: accentHex }}
        >
          {earnedCount} of {badges.length} badges
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {badges.map((badge) => {
          const Icon = getBadgeIcon(badge.icon || "");
          if (badge.earned) {
            return (
              <div
                key={badge.id}
                className="m-lift rounded-2xl border p-4 bg-white flex items-start gap-3 transition-colors"
                style={{ borderColor: accentHex }}
              >
                <div
                  className="m-icon w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: accentHex }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-[#303654] truncate">
                      {badge.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#645F80] mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                  {badge.earnedAt && (
                    <p
                      className="text-[11px] font-bold mt-1.5"
                      style={{ color: accentHex }}
                    >
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={badge.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 flex items-start gap-3 opacity-80"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-600 truncate">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
