"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, Clock, Table2, ShoppingCart } from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { useLocalStorageRecord } from "@/hooks/useLocalStorageRecord";

const HEADER_GRADIENTS = [
  "from-[#FFF0F3] via-[#FFD6E0] to-[#FFACC2]",
  "from-[#E6F2FF] via-[#BFE0FF] to-[#8BC5FF]",
  "from-[#FFF6E5] via-[#FFE2B3] to-[#FFC978]",
  "from-[#E8F9F1] via-[#BEEED6] to-[#8FDFB8]",
  "from-[#F5EDFF] via-[#E2CCFF] to-[#C7A3FF]"
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function EduportTrendingCourses() {
  const { courses } = useLMS();
  const [bookmarked, toggleBookmark] = useLocalStorageRecord("bems_course_bookmarks");

  if (courses.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#24292D] tracking-tight mb-2.5">
            Our Career Tracks
          </h2>
          <p className="text-[#747579] text-sm sm:text-base">
            Hands-on, employer-audited certification tracks taught by BEMS specialist engineers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {courses.map((course, idx) => {
            const isSaved = !!bookmarked[course.id];
            const lectureCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
            const headerGradient = HEADER_GRADIENTS[idx % HEADER_GRADIENTS.length];

            return (
              <div
                key={course.id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(24,20,61,0.05)] hover:shadow-[0_12px_32px_rgba(24,20,61,0.10)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Visual Header */}
                  <div
                    className={`relative h-52 w-full bg-gradient-to-br ${headerGradient} p-5 flex flex-col justify-between overflow-hidden`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="bg-[#24292D] text-white text-[11px] font-bold px-3 py-1 rounded-md shadow-xs">
                        {course.badge}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(course.id)}
                        aria-label="Bookmark course"
                        className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-[#24292D] hover:text-[#7928CA] transition-colors cursor-pointer"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isSaved ? "fill-[#7928CA] text-[#7928CA]" : "text-[#24292D]"
                          }`}
                        />
                      </button>
                    </div>

                    <Link
                      href={`/courses/${course.slug}`}
                      className="relative z-10 bg-white/90 backdrop-blur-md rounded-xl p-3.5 shadow-md border border-white/80 group-hover:-translate-y-1 transition-transform duration-300 block"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#D6293E]" />
                        <span className="w-2 h-2 rounded-full bg-[#F7C32E]" />
                        <span className="w-2 h-2 rounded-full bg-[#7928CA]" />
                        <span className="text-[10px] font-bold text-[#747579] ml-1.5">
                          BEMS Interactive Lab · ₦{course.deposit.toLocaleString()} deposit
                        </span>
                      </div>
                      <div className="h-2 w-3/4 rounded-full bg-slate-200 mb-1.5" />
                      <div className="h-2 w-1/2 rounded-full bg-slate-200" />
                    </Link>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#F0EDF9] text-[#7928CA]">
                        {course.delivery || "Hybrid"}
                      </span>
                    </div>

                    <Link href={`/courses/${course.slug}`}>
                      <h3 className="text-lg font-bold text-[#24292D] group-hover:text-[#7928CA] transition-colors leading-snug mb-4 line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#747579] leading-relaxed line-clamp-2 mb-4">
                      {course.tagline}
                    </p>

                    <div className="flex items-center gap-5 text-xs text-[#747579]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#7928CA]" />
                        {course.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Table2 className="w-3.5 h-3.5 text-[#FD7E14]" />
                        {lectureCount > 0 ? `${lectureCount} lessons` : "Curriculum in progress"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Tutor + Price / Enroll */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#7928CA] text-white text-xs font-extrabold flex items-center justify-center">
                      {initials(course.tutor)}
                    </div>
                    <span className="text-xs font-bold text-[#24292D]">{course.tutor}</span>
                  </div>

                  <div>
                    <span className="text-lg font-extrabold text-[#7928CA] group-hover:hidden">
                      ₦{course.priceFull.toLocaleString()}
                    </span>
                    <Link
                      href={`/subscriptions?course=${course.slug}`}
                      className="hidden group-hover:inline-flex items-center gap-1.5 bg-[#F0EDF9] hover:bg-[#7928CA] text-[#7928CA] hover:text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Enroll Course</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
