"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export interface ConceptStruggleRow {
  conceptId: string;
  conceptName: string;
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  strugglingStudents: number;
  strugglePercent: number;
  avgMasteryPercent: number;
  smallSample: boolean;
}

export function InstructorConceptInsights({ courseId }: { courseId?: string }) {
  const [rows, setRows] = useState<ConceptStruggleRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    const qs = courseId && courseId !== "all" ? `?courseId=${encodeURIComponent(courseId)}` : "";
    apiFetch(`/api/instructor/concept-analytics${qs}`)
      .then((res) => (res.ok ? res.json() : { rows: [] }))
      .then((data) => {
        if (!cancelled) setRows(data.rows || []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (rows === null) {
    return (
      <div className="bg-white rounded-2xl border border-[#E6E1F5] shadow-xs p-6">
        <p className="text-xs text-[#8580A3]">Loading concept analytics&hellip;</p>
      </div>
    );
  }

  const struggling = rows.filter((r) => r.strugglePercent > 0);

  return (
    <div className="bg-white rounded-2xl border border-[#E6E1F5] shadow-xs overflow-hidden">
      <div className="p-6 border-b border-[#F0EDF9]">
        <h2 className="text-xl font-black text-[#18143D] flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-500" /> Where Students Are Struggling
        </h2>
        <p className="text-xs text-[#645F80] mt-1">
          Computed from real quiz answers via the personalization engine's ConceptMastery data — not a
          survey or guess.
        </p>
      </div>

      {struggling.length === 0 ? (
        <div className="p-6">
          <p className="text-xs text-[#8580A3]">
            No concept-level struggle detected yet — either everyone is doing well, or not enough quiz
            attempts have been logged.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0EDF9]">
          {struggling.map((row) => (
            <div key={row.conceptId} className="p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#18143D] truncate">{row.conceptName}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7928CA] bg-[#F0EDF9] px-2 py-0.5 rounded-full shrink-0">
                    {row.courseTitle}
                  </span>
                  {row.smallSample && (
                    <span
                      title="Fewer than 3 students have attempted questions on this concept — treat this figure as low-confidence."
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0"
                    >
                      <AlertTriangle className="w-3 h-3" /> Small sample
                    </span>
                  )}
                </div>
                <div className="mt-2 w-full bg-[#F0EDF9] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-400 h-full transition-all duration-500"
                    style={{ width: `${row.strugglePercent}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-red-500">{row.strugglePercent}%</div>
                <div className="text-[11px] text-[#8580A3]">
                  {row.strugglingStudents}/{row.totalStudents} students &middot; avg {row.avgMasteryPercent}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
