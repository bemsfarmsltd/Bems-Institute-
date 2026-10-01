"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Flame,
  Zap,
  Award,
  Crown,
  Medal,
  ArrowRight,
  Star,
  BookOpen
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { LeaderboardStudent } from "@/types/advanced";

const BADGE_DEFINITIONS: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  certified: { title: "Certified", description: "Earned a BEMS course certificate", icon: <Award className="w-6 h-6" /> },
  streak5: { title: "Consistent", description: "5+ day learning streak", icon: <Flame className="w-6 h-6" /> },
  streak14: { title: "Dedicated", description: "14+ day learning streak", icon: <Flame className="w-6 h-6" /> },
  completedTen: { title: "On a Roll", description: "Completed 10+ lessons", icon: <BookOpen className="w-6 h-6" /> },
  perfectQuiz: { title: "Perfectionist", description: "Scored 100% on a quiz", icon: <Star className="w-6 h-6" /> }
};

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardStudent[] | null>(null);

  useEffect(() => {
    apiFetch("/api/lms/leaderboard")
      .then((res) => (res.ok ? res.json() : { leaderboard: [] }))
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => setLeaderboard([]));
  }, []);

  if (leaderboard === null) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-sm text-[#645F80]">Loading leaderboard…</div>
        <Footer />
      </div>
    );
  }

  const me = leaderboard.find((s) => s.isMe);
  const currentLevelFloor = me ? (me.level - 1) * 250 : 0;
  const nextLevelXp = me ? me.level * 250 : 250;
  const progressPct = me ? Math.min(100, ((me.xpPoints - currentLevelFloor) / 250) * 100) : 0;
  const xpToNextLevel = me ? Math.max(0, nextLevelXp - me.xpPoints) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-[#303654] text-white py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="gold">GAMIFICATION ENGINE</Badge>
                <Badge variant="purple">OCTOBER 2026 COHORT</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Cohort Leaderboard &amp; Badges
              </h1>
              <p className="text-xs sm:text-sm text-[#C6BDD3] mt-1">
                Earn XP points for completed lessons, quiz scores, and certificates — real rankings, computed from your actual progress.
              </p>
            </div>

            {me && (
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
                <div className="text-center px-3 border-r border-white/20">
                  <span className="text-[10px] text-[#C6BDD3] font-bold block uppercase">Total XP</span>
                  <span className="text-2xl font-black text-amber-300">{me.xpPoints}</span>
                </div>
                <div className="text-center px-3">
                  <span className="text-[10px] text-[#C6BDD3] font-bold block uppercase">Study Streak</span>
                  <span className="text-2xl font-black text-orange-400 flex items-center gap-1">
                    <Flame className="w-5 h-5" /> {me.streakDays}d
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* Top Gamer Profile Widget */}
        {me && (
          <div className="bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <span className="text-xs uppercase font-bold text-[#AE54C6] tracking-wider block mb-1">
                  Your Current Status &amp; Standing
                </span>
                <h2 className="text-2xl font-black text-[#303654]">
                  Level {me.level}: {me.levelTitle}
                </h2>
                <p className="text-xs text-[#645F80] mt-1">
                  {xpToNextLevel > 0 ? `${xpToNextLevel} XP needed to reach Level ${me.level + 1}` : "Max level reached"}
                </p>
              </div>

              <div className="w-full md:w-72">
                <div className="flex items-center justify-between text-xs font-bold text-[#303654] mb-1.5">
                  <span>XP Progress</span>
                  <span>{me.xpPoints} / {nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-[#F1E2F5] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#AE54C6] to-[#C591E9] h-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Badges Drawer */}
            <div>
              <h3 className="text-sm font-black text-[#303654] mb-3">
                Unlocked Achievements &amp; Badges ({me.badges.length} / {Object.keys(BADGE_DEFINITIONS).length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(BADGE_DEFINITIONS).map(([key, def]) => {
                  const isUnlocked = me.badges.includes(key);
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isUnlocked ? "bg-[#FAF8FF] border-[#E5C8ED] shadow-xs" : "bg-gray-50 border-gray-200 opacity-50"
                      }`}
                    >
                      <div className="flex justify-center mb-2 text-[#AE54C6]">{def.icon}</div>
                      <h4 className="font-bold text-xs text-[#303654] mb-1">{def.title}</h4>
                      <p className="text-[10px] text-[#645F80] leading-snug">{def.description}</p>
                      {isUnlocked ? (
                        <span className="inline-block mt-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Unlocked
                        </span>
                      ) : (
                        <span className="inline-block mt-2 text-[9px] font-bold text-gray-500">Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cohort Leaderboard Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#F1E2F5] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F7EDF9] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[#303654]">Cohort Top Learners</h3>
                <p className="text-xs text-[#645F80]">
                  Rankings update as students complete lessons, pass quizzes, and earn certificates.
                </p>
              </div>
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>

            <div className="divide-y divide-[#F7EDF9]">
              {leaderboard.length === 0 ? (
                <p className="p-6 text-xs text-[#8580A3]">No students yet.</p>
              ) : (
                leaderboard.map((student) => {
                  let rankIcon = null;
                  if (student.rank === 1) rankIcon = <Crown className="w-5 h-5 text-amber-500" />;
                  else if (student.rank === 2) rankIcon = <Medal className="w-5 h-5 text-gray-400" />;
                  else if (student.rank === 3) rankIcon = <Medal className="w-5 h-5 text-amber-700" />;

                  return (
                    <div
                      key={student.userId}
                      className={`p-4 px-6 flex items-center justify-between gap-4 transition-colors ${
                        student.isMe ? "bg-purple-50/50" : "hover:bg-[#FAF8FF]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 text-center font-black text-sm text-[#303654] flex items-center justify-center">
                          {rankIcon || `#${student.rank}`}
                        </div>

                        <div className="w-9 h-9 rounded-2xl bg-[#303654] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {initials(student.name)}
                        </div>

                        <div>
                          <div className="font-bold text-sm text-[#303654] flex items-center gap-1.5">
                            {student.name}
                            {student.isMe && (
                              <span className="text-[10px] bg-[#AE54C6] text-white px-2 py-0.2 rounded-full font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8580A3]">{student.track}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div className="hidden sm:block">
                          <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5" /> {student.streakDays}d streak
                          </span>
                        </div>

                        <div>
                          <span className="text-sm font-black text-[#303654] block">
                            {student.xpPoints.toLocaleString()} XP
                          </span>
                          <span className="text-[10px] text-[#8580A3]">{student.badgesCount} badges</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* XP Rules & How to Level Up */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#F1E2F5] p-6 shadow-xs space-y-4">
              <h3 className="font-black text-base text-[#303654] flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> How to Earn XP Points
              </h3>

              <div className="space-y-2.5 text-xs text-[#4A4568]">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8FF] border border-[#F1E2F5]">
                  <span>Complete a Video Lesson:</span>
                  <strong className="text-[#AE54C6] font-black">+15 XP</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8FF] border border-[#F1E2F5]">
                  <span>Quiz Score (your best attempt):</span>
                  <strong className="text-[#AE54C6] font-black">up to +100 XP</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8FF] border border-[#F1E2F5]">
                  <span>Earn a Course Certificate:</span>
                  <strong className="text-emerald-700 font-black">+100 XP</strong>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#303654] to-[#5B2479] text-white rounded-3xl p-6 shadow-xl space-y-3">
              <Badge variant="gold">EMPLOYER SHOWCASE</Badge>
              <h4 className="text-lg font-black">Top 10 Leaderboard Recognition</h4>
              <p className="text-xs text-[#E5DDEF] leading-relaxed">
                The top 10 ranked students in each cohort are featured directly in our institutional employer matchmaking portfolio distributed to hiring tech firms in Lagos, Abuja, and abroad.
              </p>
              <Link href="/learn/web-dev/assignment/assign-web-dev" className="block pt-1">
                <Button variant="purple" size="sm" className="w-full text-xs gap-1.5">
                  <span>Submit Capstone Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
