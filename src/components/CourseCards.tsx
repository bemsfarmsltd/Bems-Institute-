"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Table2, ArrowRight } from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { useLocalStorageRecord } from "@/hooks/useLocalStorageRecord";
import { getCourseVisual } from "@/lib/course-visuals";
import { getTrackPhoto } from "@/lib/track-photos";

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
        <div data-reveal className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#24292D] tracking-tight mb-2.5">
            Most Popular Courses
          </h2>
          <p className="text-[#747579] text-sm sm:text-base">
            Choose from career-ready tracks and hands-on lab modules taught by BEMS specialist engineers
          </p>
        </div>

        {/* Category Filter Bar */}
        {courses.length > 0 && (
          <div data-reveal className="bg-[#F7EDF9] rounded-xl py-2.5 px-3 sm:py-3 sm:px-4 mb-8 sm:mb-10 flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar sm:flex-wrap sm:justify-center">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`m-press px-3.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
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
          <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {filteredCourses.map((course) => {
              const isLiked = !!likedIds[course.id];
              const lectureCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
              const banner = getCourseVisual(course.slug);
              const photo = getTrackPhoto(course.slug);

              return (
                <div
                  key={course.id}
                  className="m-lift group bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(24,20,61,0.06)] overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Track Photo Banner */}
                    <Link
                      href={`/courses/${course.slug}`}
                      className={`relative h-48 w-full bg-gradient-to-br ${banner.gradient} flex items-center justify-center overflow-hidden block`}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[#1D2026]/55 via-[#1D2026]/15 to-transparent"
                      />
                      <div className="m-icon relative z-10 drop-shadow-md">
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
                          className="m-pop text-slate-400 hover:text-[#D6293E] transition-colors cursor-pointer"
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
                        className="m-press text-[#747579] hover:text-[#24292D] transition-colors"
                      >
                        View Syllabus
                      </Link>
                      <Link
                        href={`/subscriptions?course=${course.slug}`}
                        className="m-press inline-flex items-center gap-1 text-[#AE54C6] hover:text-[#A03BBC] transition-colors"
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
        <div data-reveal="zoom" className="relative overflow-hidden rounded-2xl bg-[#139EB2] px-6 py-10 sm:px-12 sm:py-12 text-white shadow-lg">
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
                Share your engineering, design, or AI expertise with BEMS cohorts in Umuahia and online—or enroll in our next cohort with flexible 3-part tuition.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/become-instructor"
                className="m-press inline-flex items-center gap-2 rounded-lg border-2 border-[#F7C32E] bg-transparent hover:bg-[#F7C32E] text-[#F7C32E] hover:text-[#24292D] font-bold text-sm px-6 py-3 transition-colors"
              >
                <span>Start Teaching Today</span>
              </Link>
              <Link
                href="/subscriptions"
                className="m-press inline-flex items-center gap-2 rounded-lg bg-white text-[#139EB2] hover:bg-white/90 font-bold text-sm px-5 py-3 transition-colors"
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
