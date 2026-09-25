"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Star,
  Shield,
  TrendingUp,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Button from "@/components/ui/button";
import { mockGamificationProfile, mockLeaderboard } from "@/data/advanced-data";
import { LeaderboardStudent } from "@/types/advanced";

export default function LeaderboardPage() {
  const [profile] = useState(mockGamificationProfile);
  const [leaderboard] = useState<LeaderboardStudent[]>(mockLeaderboard);
  const [filterTrack, setFilterTrack] = useState<string>("ALL");

  const filteredLeaderboard =
    filterTrack === "ALL"
      ? leaderboard
      : leaderboard.filter((s) => s.track.toLowerCase().includes(filterTrack.toLowerCase()));

  return (
    <div className="min-h-screen bg-brand-light/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-brand-navy via-brand-dark to-purple-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>BEMS Gamification • XP & Badges</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Cohort Leaderboard & Achievements
            </h1>
            <p className="text-sm md:text-base text-purple-100/90 leading-relaxed">
              Earn XP by watching lessons, completing interactive quizzes, passing capstones, and maintaining daily coding streaks in Umuahia.
            </p>
          </div>

          <div className="relative z-10 flex items-center space-x-3 shrink-0">
            <Link href="/sandbox">
              <Button variant="purple" className="px-5">
                <Zap className="w-4 h-4 mr-2" />
                <span>Open Sandbox (+50 XP)</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* User Stats Card Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold block">Total Experience</span>
              <span className="text-2xl font-black text-brand-dark">{profile.xpPoints.toLocaleString()} XP</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold block">Active Code Streak</span>
              <span className="text-2xl font-black text-brand-dark">{profile.streakDays} Days 🔥</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold block">Mastery Tier</span>
              <span className="text-xl font-bold text-brand-dark">Level {profile.level}</span>
              <span className="text-[10px] text-gray-500 block truncate">{profile.levelTitle}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold block">Badges Unlocked</span>
              <span className="text-2xl font-black text-brand-dark">
                {profile.badges.filter((b) => b.isUnlocked).length} / {profile.badges.length}
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Badges Showcase & Leaderboard Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Badges Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-brand-dark text-base flex items-center space-x-2">
                  <Award className="w-4 h-4 text-brand-purple" />
                  <span>Your Achievement Badges</span>
                </h3>
                <span className="text-xs font-semibold text-brand-purple">
                  {profile.badges.filter((b) => b.isUnlocked).length} Earned
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {profile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-all ${
                      badge.isUnlocked
                        ? "bg-brand-lavender/20 border-brand-purple/20 text-brand-dark"
                        : "bg-gray-50 border-gray-200 text-gray-400 opacity-60"
                    }`}
                  >
                    <div className="text-2xl shrink-0">{badge.icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-bold truncate">{badge.title}</h4>
                        {badge.isUnlocked && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                            Earned
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{badge.description}</p>
                      {badge.unlockedAt && (
                        <span className="text-[10px] text-gray-400 block mt-1">Unlocked: {badge.unlockedAt}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Challenge Card */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-brand-navy to-purple-900 text-white space-y-3 shadow-md">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>Weekly XP Challenge</span>
              </div>
              <h4 className="text-sm font-bold">Deploy Full-Stack Capstone (+500 XP)</h4>
              <p className="text-xs text-purple-200 leading-relaxed">
                Submit your verified Vercel production URL and pass with a 70%+ score before Friday 6:00 PM to claim the 500 XP bonus.
              </p>
              <Link href="/learn/web-development/assignment/web-assign-1">
                <Button variant="purple" className="w-full text-xs py-2 bg-brand-purple text-white mt-2">
                  <span>Go to Capstone Submission</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Leaderboard Table Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-brand-dark flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-brand-purple" />
                  <span>Cohort Performance Rankings</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Updated hourly based on quiz grades, capstone submissions, and daily participation.
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => setFilterTrack("ALL")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterTrack === "ALL" ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Tracks
                </button>
                <button
                  onClick={() => setFilterTrack("Web")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterTrack === "Web" ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Web Dev
                </button>
                <button
                  onClick={() => setFilterTrack("AI")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterTrack === "AI" ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  AI Prompt
                </button>
              </div>
            </div>

            {/* Leaderboard Rows */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-2">Rank</th>
                    <th className="pb-3 px-3">Trainee</th>
                    <th className="pb-3 px-3">Track</th>
                    <th className="pb-3 px-3 text-center">Streak</th>
                    <th className="pb-3 px-3 text-center">Badges</th>
                    <th className="pb-3 px-3 text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeaderboard.map((student) => {
                    const isTop3 = student.rank <= 3;
                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-brand-lavender/30 transition-colors ${
                          student.name.includes("Chukwudi") ? "bg-brand-purple/5 font-bold" : ""
                        }`}
                      >
                        <td className="py-3 px-2">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                              student.rank === 1
                                ? "bg-amber-400 text-brand-dark"
                                : student.rank === 2
                                ? "bg-gray-300 text-brand-dark"
                                : student.rank === 3
                                ? "bg-amber-700 text-white"
                                : "text-gray-500"
                            }`}
                          >
                            {student.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-navy text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {student.avatarText}
                            </div>
                            <div>
                              <p className="font-bold text-brand-dark text-xs">{student.name}</p>
                              {student.name.includes("Chukwudi") && (
                                <span className="text-[10px] text-brand-purple font-semibold">You</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-600 truncate max-w-[150px]">{student.track}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-semibold text-orange-600 inline-flex items-center">
                            <Flame className="w-3.5 h-3.5 mr-0.5 inline" />
                            {student.streakDays}d
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-gray-700">
                          {student.badgesCount}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-brand-purple text-sm">
                          {student.xpPoints.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
