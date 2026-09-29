"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Clock, Table2, Star, ArrowRight, QrCode } from "lucide-react";

type CategoryKey = "all" | "web-dev" | "ai-automation" | "product-design" | "cybersecurity";

interface EduportCourseCard {
  id: string;
  courseSlug: string;
  category: Exclude<CategoryKey, "all">;
  level: "All level" | "Beginner";
  title: string;
  description: string;
  rating: number;
  duration: string;
  lectures: string;
  priceLabel: string;
  bannerGradient: string;
  waveStroke: string;
  emblemType: "sketch" | "ps" | "figma" | "react" | "html" | "css" | "invision" | "js";
  defaultLiked?: boolean;
}

const EDUPORT_COURSES: EduportCourseCard[] = [
  {
    id: "track-ai",
    courseSlug: "ai-automation",
    category: "ai-automation",
    level: "All level",
    title: "AI & Business Automation Accelerator",
    description:
      "Master prompt engineering, workflow automation, and custom AI agents for real businesses.",
    rating: 4.9,
    duration: "12h 56m · 3 Mo",
    lectures: "16 lectures",
    priceLabel: "₦220,000",
    bannerGradient: "from-[#F8B179] via-[#F69D56] to-[#F48842]",
    waveStroke: "#D96B27",
    emblemType: "sketch",
    defaultLiked: false
  },
  {
    id: "track-web",
    courseSlug: "web-dev",
    category: "web-dev",
    level: "Beginner",
    title: "Full-Stack Web Development Masterclass",
    description:
      "Build and deploy production React, Next.js, Node.js, and Paystack-integrated web apps.",
    rating: 4.8,
    duration: "36h 30m · 3 Mo",
    lectures: "65 lectures",
    priceLabel: "₦220,000",
    bannerGradient: "from-[#2D5571] via-[#1D3B53] to-[#0F2338]",
    waveStroke: "#3898EC",
    emblemType: "ps",
    defaultLiked: true
  },
  {
    id: "track-design",
    courseSlug: "product-design",
    category: "product-design",
    level: "Beginner",
    title: "Create a Design System in Figma (UI/UX)",
    description:
      "Design user-centered mobile & web interfaces, interactive prototypes, and design tokens.",
    rating: 4.9,
    duration: "24h 15m · 3 Mo",
    lectures: "32 lectures",
    priceLabel: "₦150,000",
    bannerGradient: "from-[#FAD0D4] via-[#F7B2B9] to-[#F497A0]",
    waveStroke: "#E45C6E",
    emblemType: "figma",
    defaultLiked: false
  },
  {
    id: "track-cyber",
    courseSlug: "cybersecurity",
    category: "cybersecurity",
    level: "Beginner",
    title: "Cybersecurity & Network Defense Lab",
    description:
      "Harden Linux servers, run OWASP penetration audits, and defend enterprise cloud networks.",
    rating: 4.7,
    duration: "28h 40m · 3 Mo",
    lectures: "48 lectures",
    priceLabel: "₦220,000",
    bannerGradient: "from-[#DFFBFF] via-[#B4F1FF] to-[#7CE0FA]",
    waveStroke: "#1AA3C8",
    emblemType: "react",
    defaultLiked: true
  },
  {
    id: "mod-html",
    courseSlug: "web-dev",
    category: "web-dev",
    level: "All level",
    title: "Build Responsive Websites with HTML5",
    description:
      "Semantic architecture, accessibility standards, and modern multi-device page structures.",
    rating: 4.8,
    duration: "15h 30m",
    lectures: "68 lectures",
    priceLabel: "Included in Web Track",
    bannerGradient: "from-[#F9975D] via-[#F68148] to-[#F26A38]",
    waveStroke: "#B93812",
    emblemType: "html",
    defaultLiked: true
  },
  {
    id: "mod-css",
    courseSlug: "web-dev",
    category: "web-dev",
    level: "Beginner",
    title: "Build Modern Interfaces with CSS & Tailwind",
    description:
      "Responsive CSS Grid, Flexbox, fluid typography, and production component styling.",
    rating: 4.7,
    duration: "36h 30m",
    lectures: "72 lectures",
    priceLabel: "Included in Web Track",
    bannerGradient: "from-[#C5EBF8] via-[#74C2E8] to-[#1D71B8]",
    waveStroke: "#0B3C6D",
    emblemType: "css",
    defaultLiked: false
  },
  {
    id: "mod-proto",
    courseSlug: "product-design",
    category: "product-design",
    level: "All level",
    title: "Interactive Product Prototyping & UX Audit",
    description:
      "User research, wireframing, usability testing, and high-fidelity interactive flows.",
    rating: 4.6,
    duration: "16h 56m",
    lectures: "82 lectures",
    priceLabel: "Included in Design Track",
    bannerGradient: "from-[#DF8CA9] via-[#CA5983] to-[#B4255E]",
    waveStroke: "#FAD2E1",
    emblemType: "invision",
    defaultLiked: true
  },
  {
    id: "mod-js",
    courseSlug: "ai-automation",
    category: "ai-automation",
    level: "All level",
    title: "JavaScript & AI APIs: Full Understanding",
    description:
      "Asynchronous JavaScript, REST webhooks, Gemini LLM integration, and automation scripts.",
    rating: 5.0,
    duration: "35h 20m",
    lectures: "89 lectures",
    priceLabel: "Included in AI & Web",
    bannerGradient: "from-[#F5EDA8] via-[#EFE074] to-[#E6CE3D]",
    waveStroke: "#A38A10",
    emblemType: "js",
    defaultLiked: false
  }
];

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "All Courses" },
  { key: "web-dev", label: "Web Development" },
  { key: "ai-automation", label: "AI & Automation" },
  { key: "product-design", label: "Product Design" },
  { key: "cybersecurity", label: "Cybersecurity" }
];

function BannerEmblem({ type }: { type: EduportCourseCard["emblemType"] }) {
  switch (type) {
    case "sketch":
      return (
        <svg className="w-20 h-20 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <polygon points="32,6 56,22 32,58 8,22" fill="#FDB300" />
          <polygon points="32,6 46,22 32,58 18,22" fill="#EA6C00" />
          <polygon points="8,22 56,22 32,58" fill="#FDAD00" fillOpacity="0.85" />
          <polygon points="18,22 46,22 32,6" fill="#FDD231" />
          <polygon points="8,22 18,22 32,6" fill="#FEEEB7" />
          <polygon points="56,22 46,22 32,6" fill="#FDD231" />
        </svg>
      );
    case "ps":
      return (
        <div className="w-20 h-20 rounded-md bg-[#001E36] border-[3px] border-[#31A8FF] flex items-center justify-center shadow-lg">
          <span className="text-3xl font-extrabold tracking-tight text-[#31A8FF] font-sans">
            TS
          </span>
        </div>
      );
    case "figma":
      return (
        <svg className="w-20 h-20 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <path d="M22 10C17.6 10 14 13.6 14 18C14 22.4 17.6 26 22 26H30V10H22Z" fill="#F24E1E" />
          <path d="M30 10H38C42.4 10 46 13.6 46 18C46 22.4 42.4 26 38 26H30V10Z" fill="#FF7262" />
          <path d="M22 26C17.6 26 14 29.6 14 34C14 38.4 17.6 42 22 42H30V26H22Z" fill="#A259FF" />
          <path
            d="M22 42C17.6 42 14 45.6 14 50C14 54.4 17.6 58 22 58C26.4 58 30 54.4 30 50V42H22Z"
            fill="#0ACF83"
          />
          <circle cx="38" cy="34" r="8" fill="#1ABCFE" />
        </svg>
      );
    case "react":
      return (
        <svg className="w-20 h-20 text-[#33C5F3]" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="5.5" fill="currentColor" />
          <ellipse cx="32" cy="32" rx="25" ry="10.5" stroke="currentColor" strokeWidth="3.2" />
          <ellipse
            cx="32"
            cy="32"
            rx="25"
            ry="10.5"
            transform="rotate(60 32 32)"
            stroke="currentColor"
            strokeWidth="3.2"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="25"
            ry="10.5"
            transform="rotate(120 32 32)"
            stroke="currentColor"
            strokeWidth="3.2"
          />
        </svg>
      );
    case "html":
      return (
        <svg className="w-20 h-20 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <path d="M12 8H52L48.2 50L32 56L15.8 50L12 8Z" fill="#E44D26" />
          <path d="M32 12V51.8L44.8 47.2L47.8 12H32Z" fill="#F16529" />
          <path
            d="M20 20H44L43.2 26H26.5L27 32H42.6L41.2 44.5L32 47.2L22.8 44.5L22.2 37.5H28.2L28.5 40.5L32 41.5L35.5 40.5L36 36.5H21.5L20 20Z"
            fill="white"
          />
        </svg>
      );
    case "css":
      return (
        <svg className="w-20 h-20 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <path d="M12 8H52L48.2 50L32 56L15.8 50L12 8Z" fill="#1572B6" />
          <path d="M32 12V51.8L44.8 47.2L47.8 12H32Z" fill="#33A9DC" />
          <path
            d="M20 20H44L43 26H32L21 31.5H42.4L41 44.5L32 47.2L23 44.5L22.4 37.5H28.4L28.7 40.5L32 41.5L35.5 40.5L36 36.5H21.2L20 20Z"
            fill="white"
          />
        </svg>
      );
    case "invision":
      return (
        <div className="w-20 h-20 rounded-xl bg-[#DC2E63] flex items-center justify-center shadow-lg">
          <span className="text-3xl font-black italic text-white font-serif">in</span>
        </div>
      );
    case "js":
      return (
        <svg className="w-20 h-20 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <path d="M12 8H52L48.2 50L32 56L15.8 50L12 8Z" fill="#E5A228" />
          <path d="M32 12V51.8L44.8 47.2L47.8 12H32Z" fill="#F1BF26" />
          <path
            d="M29 20H23V41L19 40V45.5L29 48V20ZM35 20H45L44.3 25.5H40.5V31.5H44.3L43.2 44.5L35 47.5V42L38.8 40.8L39.2 36.5H35V20Z"
            fill="white"
          />
        </svg>
      );
  }
}

export function CourseCards() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const c of EDUPORT_COURSES) {
      if (c.defaultLiked) initial[c.id] = true;
    }
    return initial;
  });

  const filteredCourses =
    activeCategory === "all"
      ? EDUPORT_COURSES
      : EDUPORT_COURSES.filter((c) => c.category === activeCategory);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="courses" className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eduport Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#24292D] tracking-tight mb-2.5">
            Most Popular Courses
          </h2>
          <p className="text-[#747579] text-sm sm:text-base">
            Choose from career-ready tracks and hands-on lab modules taught by BEMS specialist engineers
          </p>
        </div>

        {/* Eduport Soft Light-Blue Category Filter Bar */}
        <div className="bg-[#E8F1FA] rounded-xl py-3 px-4 mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#066AC9] text-white shadow-xs"
                    : "text-[#066AC9] hover:bg-[#066AC9]/10"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Eduport 4-Column Illustrated Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {filteredCourses.map((course) => {
            const isLiked = !!likedIds[course.id];
            const fullStars = Math.floor(course.rating);

            return (
              <div
                key={course.id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(24,20,61,0.06)] hover:shadow-[0_12px_32px_rgba(24,20,61,0.12)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Illustrated Gradient Banner with Wireframe Terrain Waves */}
                  <Link
                    href={`/courses/${course.courseSlug}`}
                    className={`relative h-48 w-full bg-gradient-to-br ${course.bannerGradient} flex items-center justify-center overflow-hidden block`}
                  >
                    {/* Top-Left Wireframe Terrain Mesh SVG */}
                    <svg
                      aria-hidden="true"
                      className="absolute -top-3 -left-3 w-36 h-24 opacity-35 pointer-events-none"
                      viewBox="0 0 160 100"
                      fill="none"
                    >
                      <path
                        d="M0 10 Q40 45 90 15 T160 0 M0 25 Q45 55 95 25 T160 10 M0 40 Q50 65 100 35 T160 20 M0 55 Q55 75 105 45 T160 30 M15 0 L0 65 M40 0 L20 65 M65 0 L45 60 M90 0 L70 50 M115 0 L95 40"
                        stroke={course.waveStroke}
                        strokeWidth="0.9"
                      />
                    </svg>

                    {/* Bottom-Right Wireframe Terrain Mountain SVG */}
                    <svg
                      aria-hidden="true"
                      className="absolute -bottom-2 -right-2 w-44 h-28 opacity-45 pointer-events-none"
                      viewBox="0 0 180 110"
                      fill="none"
                    >
                      <path
                        d="M10 110 L55 55 L95 85 L140 35 L180 75 M25 110 L65 65 L105 90 L150 45 L180 85 M40 110 L75 75 L115 95 L160 55 L180 95 M55 55 L45 110 M95 85 L90 110 M140 35 L125 110 M150 45 L155 110"
                        stroke={course.waveStroke}
                        strokeWidth="0.95"
                      />
                    </svg>

                    {/* Centered Emblem */}
                    <div className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                      <BannerEmblem type={course.emblemType} />
                    </div>
                  </Link>

                  {/* Card Body */}
                  <div className="p-5 pb-4">
                    {/* Level Badge + Wishlist Heart */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                          course.level === "Beginner"
                            ? "bg-[#E6F8F3] text-[#0CBC87]"
                            : "bg-[#F0ECF9] text-[#6F42C1]"
                        }`}
                      >
                        {course.level}
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

                    {/* Course Title */}
                    <Link href={`/courses/${course.courseSlug}`}>
                      <h3 className="text-[17px] font-bold text-[#24292D] group-hover:text-[#066AC9] transition-colors leading-snug mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="text-xs text-[#747579] leading-relaxed line-clamp-2 mb-3.5">
                      {course.description}
                    </p>

                    {/* 5-Star Rating + Tuition Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4].map((idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < fullStars
                                ? "fill-[#F7C32E] text-[#F7C32E]"
                                : "text-[#F7C32E]"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-semibold text-[#24292D] ml-1">
                          {course.rating.toFixed(1)}/5.0
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#066AC9]">
                        {course.priceLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Duration, Lectures & Quick Enroll */}
                <div className="px-5 py-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-[#24292D] mb-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[#747579]">
                      <Clock className="w-3.5 h-3.5 text-[#D6293E]" />
                      {course.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#747579]">
                      <Table2 className="w-3.5 h-3.5 text-[#FD7E14]" />
                      {course.lectures}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs font-bold">
                    <Link
                      href={`/courses/${course.courseSlug}`}
                      className="text-[#747579] hover:text-[#24292D] transition-colors"
                    >
                      View Syllabus
                    </Link>
                    <Link
                      href={`/subscriptions?course=${course.courseSlug}`}
                      className="inline-flex items-center gap-1 text-[#066AC9] hover:text-[#044F96] transition-colors"
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

        {/* Eduport Teal Bottom Callout Banner (Image 4) */}
        <div className="relative overflow-hidden rounded-2xl bg-[#139EB2] px-6 py-10 sm:px-12 sm:py-12 text-white shadow-lg">
          {/* Decorative Translucent Circles */}
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
                href="/instructor"
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
