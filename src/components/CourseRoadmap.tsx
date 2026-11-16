"use client";

import React from "react";
import Link from "next/link";
import type { MySpaceRoadmap } from "@/types/lms";
import { Award, Check, FileCode2, Lock, Rocket, ArrowRight } from "lucide-react";

interface CourseRoadmapProps {
  roadmap: MySpaceRoadmap;
  courseTitle?: string;
  color?: string | null;
}

const PROJECT_STATUS_LABELS: Record<
  MySpaceRoadmap["projects"][number]["status"],
  { label: string; className: string }
> = {
  NOT_SUBMITTED: { label: "Not submitted", className: "bg-slate-100 text-[#645F80]" },
  SUBMITTED: { label: "Submitted", className: "bg-amber-50 text-amber-800" },
  GRADED: { label: "Graded", className: "bg-emerald-50 text-emerald-700" },
  RESUBMISSION_REQUESTED: {
    label: "Revision requested",
    className: "bg-rose-50 text-rose-700"
  }
};

export function CourseRoadmap({ roadmap, courseTitle, color }: CourseRoadmapProps) {
  const accent = color || "#AE54C6";
  const milestones = roadmap.projects.filter((p) => p.type === "MILESTONE");
  const capstones = roadmap.projects.filter((p) => p.type === "CAPSTONE");

  return (
    <div data-reveal className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#303654]">Your Learning Roadmap</h2>
          {courseTitle && (
            <p className="text-xs text-[#645F80] font-semibold mt-0.5">
              {courseTitle}: Modules &rarr; Projects &rarr; Capstone &rarr; Certificate
            </p>
          )}
        </div>
      </div>

      <div className="relative pl-7 space-y-4">
        <div
          aria-hidden="true"
          className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#F1E2F5]"
        />

        {/* Modules */}
        {roadmap.modules.map((mod, idx) => {
          const isDone = mod.status === "DONE";
          const isCurrent = mod.status === "CURRENT";
          return (
            <div key={`${mod.title}-${idx}`} className="relative flex items-start justify-between gap-3">
              <span
                className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isDone
                    ? "text-white border-transparent"
                    : isCurrent
                    ? "bg-white motion-safe:animate-pulse"
                    : "bg-white border-slate-200 text-slate-400"
                }`}
                style={
                  isDone
                    ? { backgroundColor: accent }
                    : isCurrent
                    ? { borderColor: accent, color: accent }
                    : undefined
                }
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isCurrent ? accent : "#CBD5E1" }}
                  />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      mod.status === "UPCOMING" ? "text-[#8580A3]" : "text-[#303654]"
                    }`}
                  >
                    {mod.title}
                  </span>
                  {isCurrent && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: accent }}
                    >
                      In progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#645F80] mt-0.5">
                  {mod.completed}/{mod.total} lessons completed
                </p>
              </div>
            </div>
          );
        })}

        {/* Milestone & Capstone Projects */}
        {[...milestones, ...capstones].map((proj) => {
          const isGraded = proj.status === "GRADED";
          const isSubmitted = proj.status === "SUBMITTED";
          const badge = PROJECT_STATUS_LABELS[proj.status];
          const Icon = proj.type === "CAPSTONE" ? Rocket : FileCode2;

          return (
            <div key={proj.id} className="relative flex items-start justify-between gap-3 pt-1">
              <span
                className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  isGraded
                    ? "text-white border-transparent"
                    : isSubmitted
                    ? "bg-white border-amber-400 text-amber-600"
                    : "bg-white border-slate-200 text-slate-400"
                }`}
                style={isGraded ? { backgroundColor: accent } : undefined}
              >
                {isGraded ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3 h-3" />}
              </span>

              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#303654]">{proj.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                      {badge.label}
                      {isGraded && proj.score !== null ? ` · ${proj.score}/100` : ""}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8580A3] font-semibold mt-0.5">
                    {proj.type === "CAPSTONE" ? "Final Capstone Project" : "Milestone Project"}
                  </p>
                </div>

                {proj.href && (
                  <Link
                    href={proj.href}
                    className="m-press self-start sm:self-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5C8ED] bg-[#FAF8FF] hover:bg-[#F7EDF9] text-xs font-bold text-[#AE54C6] shrink-0"
                  >
                    Open <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {/* Certificate Step */}
        <div className="relative flex items-start justify-between gap-3 pt-1">
          <span
            className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
              roadmap.certificate
                ? "text-white border-transparent"
                : "bg-white border-slate-200 text-slate-400"
            }`}
            style={roadmap.certificate ? { backgroundColor: "#10B981" } : undefined}
          >
            {roadmap.certificate ? <Award className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
          </span>

          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span
                className={`text-sm font-bold ${
                  roadmap.certificate ? "text-[#303654]" : "text-[#8580A3]"
                }`}
              >
                {roadmap.certificate ? `Certificate Earned (${roadmap.certificate.gradeTitle})` : "Your certificate"}
              </span>
              <p className="text-xs text-[#645F80] mt-0.5">
                {roadmap.certificate
                  ? `Certificate #${roadmap.certificate.certNumber}`
                  : "Unlocks once all lessons and your capstone are completed"}
              </p>
            </div>
            {roadmap.certificate && (
              <Link
                href={roadmap.certificate.href}
                className="m-press self-start sm:self-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shrink-0"
              >
                View Certificate <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
