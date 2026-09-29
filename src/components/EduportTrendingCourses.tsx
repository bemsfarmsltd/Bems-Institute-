"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bookmark, Clock, Table2, Star, ShoppingCart } from "lucide-react";

interface TrendingCourse {
  id: string;
  slug: string;
  categoryLabel: string;
  categoryColor: string;
  level: string;
  title: string;
  rating: string;
  reviews: number;
  students: number;
  duration: string;
  lectures: string;
  tutorName: string;
  tutorInitials: string;
  tutorAvatarBg: string;
  price: string;
  deposit: string;
  headerGradient: string;
  badgeText: string;
}

const TRENDING_COURSES: TrendingCourse[] = [
  {
    id: "trend-design",
    slug: "product-design",
    categoryLabel: "Design",
    categoryColor: "bg-[#E8F1FA] text-[#066AC9]",
    level: "Beginner",
    title: "Complete UI/UX Product Design & Figma Design Systems Bootcamp",
    rating: "4.9",
    reviews: 142,
    students: 280,
    duration: "12 Weeks",
    lectures: "32 lectures",
    tutorName: "Emeka Udoh",
    tutorInitials: "EU",
    tutorAvatarBg: "bg-[#D6293E]",
    price: "₦150,000",
    deposit: "₦60k Deposit",
    headerGradient: "from-[#FFF0F3] via-[#FFD6E0] to-[#FFACC2]",
    badgeText: "Portfolio Capstone"
  },
  {
    id: "trend-web",
    slug: "web-dev",
    categoryLabel: "Development",
    categoryColor: "bg-[#E6F8F3] text-[#0CBC87]",
    level: "All level",
    title: "Full-Stack Next.js, TypeScript, PostgreSQL & Paystack Engineering",
    rating: "4.9",
    reviews: 215,
    students: 410,
    duration: "12 Weeks",
    lectures: "65 lectures",
    tutorName: "Engr. Chidi Okafor",
    tutorInitials: "CO",
    tutorAvatarBg: "bg-[#066AC9]",
    price: "₦220,000",
    deposit: "₦100k Deposit",
    headerGradient: "from-[#E6F2FF] via-[#BFE0FF] to-[#8BC5FF]",
    badgeText: "Most Popular"
  },
  {
    id: "trend-ai",
    slug: "ai-automation",
    categoryLabel: "AI & Automation",
    categoryColor: "bg-[#F0ECF9] text-[#6F42C1]",
    level: "All level",
    title: "Applied AI Agents, Prompt Engineering & Business Workflow Automation",
    rating: "5.0",
    reviews: 189,
    students: 340,
    duration: "12 Weeks",
    lectures: "48 lectures",
    tutorName: "Adaeze Nwosu",
    tutorInitials: "AN",
    tutorAvatarBg: "bg-[#6F42C1]",
    price: "₦220,000",
    deposit: "₦100k Deposit",
    headerGradient: "from-[#FFF6E5] via-[#FFE2B3] to-[#FFC978]",
    badgeText: "High Demand"
  }
];

export function EduportTrendingCourses() {
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({
    "trend-web": true
  });

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#24292D] tracking-tight mb-2.5">
            Our Trending Courses
          </h2>
          <p className="text-[#747579] text-sm sm:text-base">
            Check out the most in-demand career accelerators in the market right now
          </p>
        </div>

        {/* 3-Column Eduport Trending Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {TRENDING_COURSES.map((item) => {
            const isSaved = !!bookmarked[item.id];
            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(24,20,61,0.05)] hover:shadow-[0_12px_32px_rgba(24,20,61,0.10)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Visual Header */}
                  <div
                    className={`relative h-52 w-full bg-gradient-to-br ${item.headerGradient} p-5 flex flex-col justify-between overflow-hidden`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="bg-[#24292D] text-white text-[11px] font-bold px-3 py-1 rounded-md shadow-xs">
                        {item.badgeText}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(item.id)}
                        aria-label="Bookmark course"
                        className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-[#24292D] hover:text-[#066AC9] transition-colors cursor-pointer"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isSaved ? "fill-[#066AC9] text-[#066AC9]" : "text-[#24292D]"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Decorative Mockup Window inside Banner */}
                    <Link
                      href={`/courses/${item.slug}`}
                      className="relative z-10 bg-white/90 backdrop-blur-md rounded-xl p-3.5 shadow-md border border-white/80 group-hover:-translate-y-1 transition-transform duration-300 block"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#D6293E]" />
                        <span className="w-2 h-2 rounded-full bg-[#F7C32E]" />
                        <span className="w-2 h-2 rounded-full bg-[#0CBC87]" />
                        <span className="text-[10px] font-bold text-[#747579] ml-1.5">
                          BEMS Interactive Lab · {item.deposit}
                        </span>
                      </div>
                      <div className="h-2 w-3/4 rounded-full bg-slate-200 mb-1.5" />
                      <div className="h-2 w-1/2 rounded-full bg-slate-200" />
                    </Link>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pb-4">
                    {/* Category & Level Tags */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${item.categoryColor}`}
                      >
                        {item.categoryLabel}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#24292D] text-white">
                        {item.level}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/courses/${item.slug}`}>
                      <h3 className="text-lg font-bold text-[#24292D] group-hover:text-[#066AC9] transition-colors leading-snug mb-4 line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Rating & Students Row */}
                    <div className="flex items-center justify-between text-xs text-[#747579] mb-4">
                      <span className="inline-flex items-center gap-1 font-bold text-[#F7C32E]">
                        {item.rating}
                        <Star className="w-3.5 h-3.5 fill-[#F7C32E] text-[#F7C32E]" />
                        <span className="font-normal text-[#747579]">({item.reviews})</span>
                      </span>
                      <span>
                        <strong className="text-[#24292D]">{item.students}</strong>{" "}
                        <span className="text-[#747579]">(Student)</span>
                      </span>
                    </div>

                    {/* Duration & Lectures Row */}
                    <div className="flex items-center gap-5 text-xs text-[#747579]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D6293E]" />
                        {item.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Table2 className="w-3.5 h-3.5 text-[#FD7E14]" />
                        {item.lectures}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Tutor Avatar + Price / Hover Enroll Button */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg ${item.tutorAvatarBg} text-white text-xs font-extrabold flex items-center justify-center`}
                    >
                      {item.tutorInitials}
                    </div>
                    <span className="text-xs font-bold text-[#24292D]">{item.tutorName}</span>
                  </div>

                  <div>
                    <span className="text-lg font-extrabold text-[#0CBC87] group-hover:hidden">
                      {item.price}
                    </span>
                    <Link
                      href={`/subscriptions?course=${item.slug}`}
                      className="hidden group-hover:inline-flex items-center gap-1.5 bg-[#E6F8F3] hover:bg-[#0CBC87] text-[#0CBC87] hover:text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
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
