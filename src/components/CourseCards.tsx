"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Clock, Table2, ArrowRight } from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { useLocalStorageRecord } from "@/hooks/useLocalStorageRecord";
import { getCourseVisual } from "@/lib/course-visuals";

type CategoryKey = "all" | string;

export function CourseCards() {
  const { courses } = useLMS();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [likedIds, toggleLike] = useLocalStorageRecord("bems_course_wishlist");

  const categories = [{ key: "all", label: "All Courses" }, ...courses.map((c) => ({ key: c.slug, label: c.title }))];

  const filteredCourses =
    activeCategory === "all" ? courses : courses.filter((c) => c.slug === activeCategory);

  return (
    <section id="courses" className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#24292D] tracking-tight mb-2.5">
            Most Popular Courses
          </h2>
          <p className="text-[#747579] text-sm sm:text-base">
            Choose from career-ready tracks and hands-on lab modules taught by BEMS specialist engineers
          </p>
        </div>

        {/* Category Filter Bar */}
        {courses.length > 0 && (
          <div className="bg-[#F7EDF9] rounded-xl py-3 px-4 mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#AE54C6] text-white shadow-xs"
                      : "text-[#AE54C6] hover:bg-[#AE54C6]/10"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Course Cards Grid */}
        {courses.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {filteredCourses.map((course) => {
              const isLiked = !!likedIds[course.id];
              const lectureCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
              const banner = getCourseVisual(course.slug);

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(24,20,61,0.06)] hover:shadow-[0_12px_32px_rgba(24,20,61,0.12)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Top Illustrated Gradient Banner */}
                    <Link
                      href={`/courses/${course.slug}`}
                      className={`relative h-48 w-full bg-gradient-to-br ${banner.gradient} flex items-center justify-center overflow-hidden block`}
                    >
                      <svg
                        aria-hidden="true"
                        className="absolute -top-3 -left-3 w-36 h-24 opacity-35 pointer-events-none"
                        viewBox="0 0 160 100"
                        fill="none"
                      >
                        <path
                          d="M0 10 Q40 45 90 15 T160 0 M0 25 Q45 55 95 25 T160 10 M0 40 Q50 65 100 35 T160 20 M0 55 Q55 75 105 45 T160 30 M15 0 L0 65 M40 0 L20 65 M65 0 L45 60 M90 0 L70 50 M115 0 L95 40"
                          stroke={banner.waveStroke}
                          strokeWidth="0.9"
                        />
                      </svg>
                      <svg
                        aria-hidden="true"
                        className="absolute -bottom-2 -right-2 w-44 h-28 opacity-45 pointer-events-none"
                        viewBox="0 0 180 110"
                        fill="none"
                      >
                        <path
                          d="M10 110 L55 55 L95 85 L140 35 L180 75 M25 110 L65 65 L105 90 L150 45 L180 85 M40 110 L75 75 L115 95 L160 55 L180 95 M55 55 L45 110 M95 85 L90 110 M140 35 L125 110 M150 45 L155 110"
                          stroke={banner.waveStroke}
                          strokeWidth="0.95"
                        />
                      </svg>
                      <div className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                        {banner.icon}
                      </div>
                    </Link>

                    {/* Card Body */}
                    <div className="p-5 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#F7EDF9] text-[#AE54C6]">
                          {course.badge}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleLike(course.id)}
                          aria-label="Save course to wishlist"
                          className="text-slate-400 hover:text-[#D6293E] transition-colors cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isLiked ? "fill-[#D6293E] text-[#D6293E]" : "text-slate-500"
                            }`}
                          />
                        </button>
                      </div>

                      <Link href={`/courses/${course.slug}`}>
                        <h3 className="text-[17px] font-bold text-[#24292D] group-hover:text-[#AE54C6] transition-colors leading-snug mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-[#747579] leading-relaxed line-clamp-2 mb-3.5">
                        {course.tagline}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#24292D]">{course.tutor}</span>
                        <span className="text-[11px] font-bold text-[#AE54C6]">
                          ₦{course.priceFull.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-[#24292D] mb-2.5">
                      <span className="inline-flex items-center gap-1.5 text-[#747579]">
                        <Clock className="w-3.5 h-3.5 text-[#AE54C6]" />
                        {course.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#747579]">
                        <Table2 className="w-3.5 h-3.5 text-[#FD7E14]" />
                        {lectureCount > 0 ? `${lectureCount} lessons` : "Curriculum in progress"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs font-bold">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-[#747579] hover:text-[#24292D] transition-colors"
                      >
                        View Syllabus
                      </Link>
                      <Link
                        href={`/subscriptions?course=${course.slug}`}
                        className="inline-flex items-center gap-1 text-[#AE54C6] hover:text-[#A03BBC] transition-colors"
                      >
                        <span>Enroll Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Callout Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#139EB2] px-6 py-10 sm:px-12 sm:py-12 text-white shadow-lg">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 left-10 w-56 h-56 rounded-full bg-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-6 left-[42%] w-5 h-5 rounded-full bg-white/35"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Become an Instructor!
              </h3>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Share your engineering, design, or AI expertise with cohorts at the BEMS Innovation Hub in Umuahia—or enroll in our October 2026 batch with flexible 3-part tuition.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/become-instructor"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-[#F7C32E] bg-transparent hover:bg-[#F7C32E] text-[#F7C32E] hover:text-[#24292D] font-bold text-sm px-6 py-3 transition-colors"
              >
                <span>Start Teaching Today</span>
              </Link>
              <Link
                href="/subscriptions"
                className="inline-flex items-center gap-2 rounded-lg bg-white text-[#139EB2] hover:bg-white/90 font-bold text-sm px-5 py-3 transition-colors"
              >
                <span>Apply as Student</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
