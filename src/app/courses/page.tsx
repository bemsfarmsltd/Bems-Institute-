"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCards } from "@/components/CourseCards";
import { COURSES } from "@/data/courses";
import { Clock, ArrowRight, CheckCircle2 } from "lucide-react";

interface EduportCategory {
  id: string;
  title: string;
  countLabel: string;
  bg: string;
  targetSlug: string;
  icon: React.ReactNode;
}

const CATEGORIES_GRID: EduportCategory[] = [
  {
    id: "data-science",
    title: "Data Science",
    countLabel: "15 Courses",
    bg: "bg-[#F0EDF9]",
    targetSlug: "ai-automation",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="24" rx="18" ry="8" stroke="#4DA3FF" strokeWidth="2.2" />
        <ellipse
          cx="24"
          cy="24"
          rx="18"
          ry="8"
          transform="rotate(60 24 24)"
          stroke="#6F42C1"
          strokeWidth="2.2"
        />
        <ellipse
          cx="24"
          cy="24"
          rx="18"
          ry="8"
          transform="rotate(120 24 24)"
          stroke="#38BDF8"
          strokeWidth="2.2"
        />
        <rect x="19" y="18" width="10" height="12" rx="3" fill="#CBD5E1" />
        <ellipse cx="24" cy="18" rx="5" ry="2.2" fill="#94A3B8" />
        <circle cx="36" cy="14" r="2.5" fill="#F7C32E" />
      </svg>
    )
  },
  {
    id: "it-software",
    title: "IT & Software",
    countLabel: "22 Courses",
    bg: "bg-[#FFF4E8]",
    targetSlug: "ai-automation",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="10" width="32" height="22" rx="3" fill="#3B82F6" />
        <rect x="11" y="13" width="26" height="16" rx="1.5" fill="#EFF6FF" />
        <rect x="14" y="16" width="10" height="8" rx="1" fill="#F7C32E" />
        <rect x="26" y="16" width="8" height="3" rx="1" fill="#38BDF8" />
        <rect x="26" y="21" width="8" height="5" rx="1" fill="#A855F7" />
        <path d="M18 32H30L32 37H16L18 32Z" fill="#94A3B8" />
      </svg>
    )
  },
  {
    id: "engineering",
    title: "Engineering",
    countLabel: "53 Courses",
    bg: "bg-[#FDECEF]",
    targetSlug: "cybersecurity",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="30" r="9" fill="#60A5FA" />
        <circle cx="24" cy="30" r="4" fill="white" />
        <path
          d="M12 24C12 16.8 17.4 11 24 11C30.6 11 36 16.8 36 24H12Z"
          fill="#F7C32E"
        />
        <rect x="21" y="9" width="6" height="9" rx="1.5" fill="#F59E0B" />
        <rect x="10" y="23" width="28" height="3.5" rx="1.75" fill="#F97316" />
      </svg>
    )
  },
  {
    id: "web-development",
    title: "Web Development",
    countLabel: "25 Courses",
    bg: "bg-[#F0ECF9]",
    targetSlug: "web-dev",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="10" width="32" height="23" rx="3" fill="#1D4ED8" />
        <rect x="11" y="13" width="26" height="15" rx="1.5" fill="#1E293B" />
        <path
          d="M19 18L15.5 20.5L19 23M29 18L32.5 20.5L29 23M25.5 17L22.5 24"
          stroke="#F7C32E"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="14" y="25" width="8" height="1.8" rx="0.9" fill="#F97316" />
        <rect x="24" y="25" width="10" height="1.8" rx="0.9" fill="#38BDF8" />
        <path d="M19 33H29L31 38H17L19 33Z" fill="#93C5FD" />
      </svg>
    )
  },
  {
    id: "finance",
    title: "Finance",
    countLabel: "20 Courses",
    bg: "bg-[#E5F6F8]",
    targetSlug: "ai-automation",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect x="9" y="11" width="30" height="22" rx="3" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2" />
        <path d="M15 26L21 20L26 23L33 16" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="17" r="3" fill="#F7C32E" />
        <path d="M24 33V39M18 39H30" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "medical-cyber",
    title: "Medical & Safety",
    countLabel: "10 Courses",
    bg: "bg-[#E8EEF2]",
    targetSlug: "cybersecurity",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect x="12" y="15" width="6" height="18" rx="1.5" fill="#60A5FA" />
        <rect x="13.5" y="10" width="3" height="5" fill="#94A3B8" />
        <path
          d="M23 14V23C23 27.4 26.6 31 31 31C35.4 31 39 27.4 39 23V18"
          stroke="#1D4ED8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="39" cy="16" r="3" fill="#F7C32E" stroke="#1D4ED8" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: "architecture",
    title: "Architecture",
    countLabel: "30 Courses",
    bg: "bg-[#FEF9E6]",
    targetSlug: "product-design",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <path d="M12 24L22 14L32 24V36H12V24Z" fill="#FDE68A" />
        <path d="M10 24L22 12L34 24" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="19" y="26" width="6" height="10" fill="#1E293B" />
        <path d="M37 14V36M34 14H40M34 36H40" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "art-design",
    title: "Art & Design",
    countLabel: "35 Courses",
    bg: "bg-[#EFEFEF]",
    targetSlug: "product-design",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <path
          d="M24 10C15.7 10 9 16.3 9 24C9 31.7 15.7 38 24 38C26.5 38 28 36.2 28 34C28 32.5 27 31.2 27 29.5C27 27.5 28.8 26 31 26H33C36.3 26 39 23.3 39 20C39 14.5 32.3 10 24 10Z"
          fill="#DBEAFE"
        />
        <circle cx="16" cy="21" r="2.2" fill="#3B82F6" />
        <circle cx="21" cy="16" r="2.2" fill="#F7C32E" />
        <circle cx="28" cy="17" r="2.2" fill="#EC4899" />
        <circle cx="17" cy="28" r="2.2" fill="#10B981" />
        <path d="M35 12L27 28" stroke="#F97316" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "photography",
    title: "Photography",
    countLabel: "20 Courses",
    bg: "bg-[#EFEBF9]",
    targetSlug: "product-design",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect x="12" y="17" width="24" height="16" rx="3" fill="#93C5FD" />
        <circle cx="24" cy="25" r="5" fill="#1D4ED8" stroke="white" strokeWidth="2" />
        <rect x="14" y="11" width="9" height="6" rx="1" fill="#3B82F6" />
        <path d="M24 33V39M19 39L24 34L29 39" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "musics",
    title: "Musics",
    countLabel: "10 Courses",
    bg: "bg-[#F9EAEB]",
    targetSlug: "ai-automation",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect x="10" y="12" width="24" height="20" rx="3" fill="#1E293B" />
        <path d="M14 22H18L20 17L23 27L25 20L27 22H30" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 29L32 25L42 29L32 33L22 29Z" fill="#64748B" />
        <path d="M26 31V36C26 37.5 29 39 32 39C35 39 38 37.5 38 36V31" fill="#94A3B8" />
      </svg>
    )
  },
  {
    id: "marketing",
    title: "Marketing",
    countLabel: "30 Courses",
    bg: "bg-[#F0EDF9]",
    targetSlug: "ai-automation",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="13" fill="#818CF8" />
        <path d="M16 25L27 18V30L16 25Z" fill="white" />
        <rect x="14" y="24" width="4" height="7" rx="1.5" fill="#F43F5E" />
        <circle cx="33" cy="15" r="3" fill="#F97316" />
        <circle cx="35" cy="25" r="2.5" fill="#38BDF8" />
      </svg>
    )
  },
  {
    id: "accounting",
    title: "Accounting",
    countLabel: "35 Courses",
    bg: "bg-[#F0EDF9]",
    targetSlug: "cybersecurity",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect x="12" y="25" width="4" height="11" rx="1" fill="#F7C32E" />
        <rect x="18" y="19" width="4" height="17" rx="1" fill="#34D399" />
        <rect x="24" y="22" width="4" height="14" rx="1" fill="#60A5FA" />
        <circle cx="30" cy="21" r="6" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2.2" />
        <path d="M34.5 25.5L39 30" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    )
  }
];

interface LanguageItem {
  id: string;
  name: string;
  flag: React.ReactNode;
}

const LANGUAGES: LanguageItem[] = [
  {
    id: "fr",
    name: "French",
    flag: (
      <svg className="w-11 h-8 rounded-xs shadow-2xs shrink-0" viewBox="0 0 36 24">
        <rect width="12" height="24" fill="#0055A4" />
        <rect x="12" width="12" height="24" fill="#FFFFFF" />
        <rect x="24" width="12" height="24" fill="#EF4135" />
      </svg>
    )
  },
  {
    id: "de",
    name: "German",
    flag: (
      <svg className="w-11 h-8 rounded-xs shadow-2xs shrink-0" viewBox="0 0 36 24">
        <rect width="36" height="8" fill="#000000" />
        <rect y="8" width="36" height="8" fill="#DD0000" />
        <rect y="16" width="36" height="8" fill="#FFCE00" />
      </svg>
    )
  },
  {
    id: "es",
    name: "Español",
    flag: (
      <svg className="w-11 h-8 rounded-xs shadow-2xs shrink-0" viewBox="0 0 36 24">
        <rect width="36" height="6" fill="#AA151B" />
        <rect y="6" width="36" height="12" fill="#F1BF00" />
        <rect y="18" width="36" height="6" fill="#AA151B" />
      </svg>
    )
  },
  {
    id: "en-uk",
    name: "English",
    flag: (
      <svg className="w-11 h-8 rounded-xs shadow-2xs shrink-0" viewBox="0 0 36 24">
        <rect width="36" height="24" fill="#012169" />
        <path d="M0 0L36 24M36 0L0 24" stroke="white" strokeWidth="4" />
        <path d="M0 0L36 24M36 0L0 24" stroke="#C8102E" strokeWidth="2" />
        <path d="M18 0V24M0 12H36" stroke="white" strokeWidth="6" />
        <path d="M18 0V24M0 12H36" stroke="#C8102E" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: "hi",
    name: "Hindi",
    flag: (
      <svg className="w-11 h-8 rounded-xs shadow-2xs shrink-0" viewBox="0 0 36 24">
        <rect width="36" height="8" fill="#FF9933" />
        <rect y="8" width="36" height="8" fill="#FFFFFF" />
        <rect y="16" width="36" height="8" fill="#138808" />
        <circle cx="18" cy="12" r="3" fill="none" stroke="#000080" strokeWidth="1.2" />
      </svg>
    )
  },
  {
    id: "it",
    name: "Italian",
    flag: (
      <svg className="w-11 h-8 rounded-xs shadow-2xs shrink-0" viewBox="0 0 36 24">
        <rect width="12" height="24" fill="#009246" />
        <rect x="12" width="12" height="24" fill="#FFFFFF" />
        <rect x="24" width="12" height="24" fill="#CE2B37" />
      </svg>
    )
  },
  {
    id: "ar",
    name: "Arabic",
    flag: (
      <svg className="w-11 h-8 rounded-xs shadow-2xs shrink-0" viewBox="0 0 36 24">
        <rect width="36" height="8" fill="#CE1126" />
        <rect y="8" width="36" height="8" fill="#FFFFFF" />
        <rect y="16" width="36" height="8" fill="#000000" />
        <rect x="12" y="10.5" width="12" height="3" rx="1" fill="#007A3D" />
      </svg>
    )
  },
  {
    id: "en-ng",
    name: "English (NG)",
    flag: (
      <svg className="w-11 h-8 rounded-xs shadow-2xs shrink-0" viewBox="0 0 36 24">
        <rect width="12" height="24" fill="#008751" />
        <rect x="12" width="12" height="24" fill="#FFFFFF" />
        <rect x="24" width="12" height="24" fill="#008751" />
      </svg>
    )
  }
];

export default function CoursesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("en-uk");

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CATEGORIES_GRID;
    return CATEGORIES_GRID.filter((c) => c.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const matchingCoreTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COURSES;
    return COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.modules.some((m) => m.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById("categories-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-[#24292D]">
      <Navbar />

      <main>
        {/* 1. Eduport Illustrated Hero Search Banner (Images 1, 2, 4) */}
        <section className="relative overflow-hidden bg-[#F5F7F9] py-14 md:py-20">
          {/* Decorative Golden Curved Path */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-full h-full opacity-55"
            viewBox="0 0 1440 420"
            fill="none"
          >
            <path
              d="M60 390 C220 260, 420 340, 580 280 C680 240, 740 160, 820 120"
              stroke="#F7C32E"
              strokeWidth="1.5"
            />
          </svg>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Student Vector Illustration (Male Student on Chair with Laptop & Bookshelf) */}
              <div className="hidden lg:flex lg:col-span-3 justify-center">
                <svg className="w-64 h-64" viewBox="0 0 260 260" fill="none">
                  {/* Bookshelf Top-Left */}
                  <rect x="24" y="54" width="66" height="5" rx="2" fill="#24292D" />
                  <rect x="30" y="26" width="10" height="28" rx="1.5" fill="#7928CA" />
                  <rect x="41" y="26" width="10" height="28" rx="1.5" fill="#D6293E" />
                  <rect x="52" y="26" width="10" height="28" rx="1.5" fill="#7928CA" />
                  <rect
                    x="65"
                    y="27"
                    width="10"
                    height="28"
                    rx="1.5"
                    transform="rotate(-10 65 27)"
                    fill="#F7C32E"
                  />
                  {/* Blue Chat Bubble */}
                  <rect x="175" y="92" width="40" height="24" rx="5" fill="#1D68C4" />
                  <polygon points="175,110 168,118 182,115" fill="#1D68C4" />
                  <circle cx="186" cy="104" r="2.2" fill="#24292D" />
                  <circle cx="195" cy="104" r="2.2" fill="#24292D" />
                  <circle cx="204" cy="104" r="2.2" fill="#24292D" />
                  {/* Blue Chair */}
                  <path
                    d="M68 118C60 118 55 135 58 175H122V150H78L72 118H68Z"
                    fill="#7928CA"
                  />
                  <path d="M65 175L56 242M112 175L120 242M60 212H116" stroke="#7928CA" strokeWidth="4.5" />
                  {/* Student Body & Coral Shirt */}
                  <path
                    d="M78 88C64 92 58 116 62 156H122L126 96C116 88 94 86 78 88Z"
                    fill="#FF6B5B"
                  />
                  {/* Student Head & Beard */}
                  <circle cx="104" cy="64" r="16" fill="#F4A27E" />
                  <path
                    d="M92 64C92 74 98 80 106 80C114 80 118 73 118 65H92Z"
                    fill="#24292D"
                  />
                  <path
                    d="M88 58C88 46 98 40 110 42C118 43 122 50 120 58C112 52 96 52 88 58Z"
                    fill="#24292D"
                  />
                  {/* Trousers & Yellow Sneakers */}
                  <path
                    d="M64 156H126L164 218L150 226L114 176H98L116 226H100L64 156Z"
                    fill="#2E3238"
                  />
                  <rect x="98" y="226" width="26" height="11" rx="4" fill="#F7A600" />
                  <rect x="152" y="216" width="26" height="11" rx="4" transform="rotate(-22 152 216)" fill="#F7A600" />
                  {/* White Laptop */}
                  <path d="M108 148H154L166 116H132L120 148" fill="#E8EEF5" />
                  <rect x="96" y="146" width="52" height="5" rx="2.5" fill="#CBD5E1" />
                  {/* Potted Plant Bottom-Left */}
                  <path d="M26 210H52L48 242H30L26 210Z" fill="#C48B45" />
                  <path d="M39 210C28 190 22 172 28 160C34 174 38 192 39 210Z" fill="#65A30D" />
                  <path d="M39 210C38 184 42 164 50 154C52 172 46 194 39 210Z" fill="#4D7C0F" />
                </svg>
              </div>

              {/* Center Search Column */}
              <div className="lg:col-span-6 text-center relative">
                {/* Purple Starburst Top-Center */}
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 text-[#6F42C1] mx-auto mb-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0L14.2 8.2L21.5 4.5L16.5 11L24 13.5L15.8 15L19.5 22.5L12.8 17.2L9.5 24L9.2 15.8L1.5 18.5L7.2 12.2L0 8.5L8.2 8.2L6.5 0.5L12 6.8L12 0Z" />
                </svg>

                {/* Orange Plus Left Accent */}
                <span
                  aria-hidden="true"
                  className="hidden sm:block absolute top-10 -left-4 text-3xl font-extrabold text-[#FD7E14]"
                >
                  +
                </span>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#24292D] tracking-tight mb-3">
                  What do you want to learn?
                </h1>
                <p className="text-sm sm:text-base text-[#747579] mb-8">
                  Grow your skill with the most reliable online courses and certifications
                </p>

                {/* Eduport Search Input Box */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white rounded-xl p-2 shadow-[0_6px_24px_rgba(24,20,61,0.06)] border border-slate-200/70 flex items-center max-w-xl mx-auto"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search course"
                    className="flex-1 bg-transparent px-4 py-2.5 text-sm text-[#24292D] placeholder:text-[#9A9EA4] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#24292D] hover:bg-black text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Right Student Vector Illustration (Female Student in Beanbag with Headphones & Laptop) */}
              <div className="hidden lg:flex lg:col-span-3 justify-center">
                <svg className="w-64 h-64" viewBox="0 0 260 260" fill="none">
                  {/* Green Wall Clock */}
                  <circle cx="46" cy="100" r="22" fill="white" stroke="#7928CA" strokeWidth="4.5" />
                  <path d="M46 100L38 92M46 100L56 94" stroke="#24292D" strokeWidth="2" strokeLinecap="round" />
                  {/* Coral Question Speech Bubble */}
                  <circle cx="212" cy="96" r="15" fill="#FF6B5B" />
                  <polygon points="202,108 195,114 208,111" fill="#FF6B5B" />
                  <text x="207" y="102" fill="white" fontSize="16" fontWeight="bold">
                    ?
                  </text>
                  {/* Dark Beanbag Chair */}
                  <ellipse cx="145" cy="195" rx="58" ry="48" fill="#2E3238" />
                  {/* Student Blue Hoodie & White Tee */}
                  <path
                    d="M102 118C92 128 88 156 92 178H186C190 156 184 128 174 118C156 110 120 110 102 118Z"
                    fill="#7928CA"
                  />
                  <rect x="122" y="116" width="32" height="55" fill="#E8EEF5" />
                  {/* Student Head, Glasses & Green Headphones */}
                  <circle cx="138" cy="86" r="17" fill="#F4A27E" />
                  <circle cx="144" cy="64" r="9" fill="#24292D" />
                  <path d="M120 86C120 72 130 64 138 64C146 64 156 72 156 86" stroke="#7928CA" strokeWidth="4" />
                  <ellipse cx="155" cy="88" rx="4.5" ry="7" fill="#7928CA" />
                  {/* Green Crossed Legs & Yellow Shoes */}
                  <path
                    d="M84 176C78 190 98 214 138 214C178 214 198 190 192 176C174 170 102 170 84 176Z"
                    fill="#7928CA"
                  />
                  <rect x="96" y="206" width="24" height="12" rx="4" transform="rotate(-25 96 206)" fill="#F7A600" />
                  <rect x="156" y="196" width="24" height="12" rx="4" transform="rotate(25 156 196)" fill="#F7A600" />
                  {/* Dark Laptop with # Sticker */}
                  <rect x="108" y="140" width="58" height="38" rx="4" fill="#24292D" />
                  <text x="148" y="170" fill="#F7A600" fontSize="14" fontWeight="bold">
                    #
                  </text>
                  {/* Pink Vase & Green Leaves Bottom-Left */}
                  <ellipse cx="64" cy="228" rx="22" ry="14" fill="#FF6B5B" />
                  <rect x="56" y="206" width="16" height="12" rx="2" fill="#E05344" />
                  <path d="M64 206C46 196 34 184 32 172C48 176 58 190 64 206Z" fill="#7928CA" />
                  <path d="M64 206C68 186 78 172 90 166C88 182 76 196 64 206Z" fill="#099268" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 2. "Choose a Categories" 12-Card Pastel Grid (Images 3 & 5) */}
        <section id="categories-section" className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#24292D] tracking-tight mb-2.5">
                Choose a Track
              </h2>
              <p className="text-sm sm:text-base text-[#747579]">
                Hands-on, hybrid learning across BEMS&apos;s core FutureSkills tracks
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/courses/${cat.targetSlug}`}
                  className={`${cat.bg} group rounded-2xl p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md block`}
                >
                  <div className="w-20 h-20 rounded-full bg-white shadow-2xs mx-auto mb-5 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="text-lg font-extrabold text-[#24292D] group-hover:text-[#7928CA] transition-colors mb-1">
                    {cat.title}
                  </h3>
                  <span className="text-xs sm:text-sm font-semibold text-[#24292D]/75">
                    {cat.countLabel}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 3. "Choose Languages" 8-Flag Grid Section (Image 5) */}
        <section className="py-10 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#24292D] tracking-tight">
                Choose Languages
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLang(lang.id)}
                    className={`rounded-xl px-6 py-4 flex items-center gap-4 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#F0EDF9] ring-2 ring-[#7928CA]/30"
                        : "bg-[#F5F7F9] hover:bg-[#F0EDF9]/60"
                    }`}
                  >
                    {lang.flag}
                    <span className="text-base font-extrabold text-[#24292D]">{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Interactive BEMS Specialized Career Tracks & Popular Courses */}
        <section className="py-12 bg-[#FAFBFD] border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#7928CA] block mb-1">
                  BEMS UMUAHIA &amp; ONLINE COHORT
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#24292D]">
                  Career-Ready Certification Tracks ({matchingCoreTracks.length})
                </h2>
              </div>
              <Link
                href="/subscriptions"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7928CA] hover:underline"
              >
                <span>Compare Tuition &amp; 3-Part Installment Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matchingCoreTracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#F0EDF9] text-[#7928CA]">
                        {track.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#747579]">
                        <Clock className="w-3.5 h-3.5 text-[#7928CA]" /> {track.duration} ·{" "}
                        {track.schedule}
                      </span>
                    </div>

                    <Link href={`/courses/${track.id}`}>
                      <h3 className="text-xl font-extrabold text-[#24292D] hover:text-[#7928CA] transition-colors mb-1.5">
                        {track.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-[#747579] mb-4">{track.tagline}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                      {track.modules.slice(0, 4).map((m, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-[#24292D]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#7928CA] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-[#24292D]">
                        ₦{track.priceFull.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#747579] ml-2">
                        (or ₦{track.deposit.toLocaleString()} deposit)
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/courses/${track.id}`}
                        className="text-xs font-bold text-[#24292D] hover:text-[#7928CA] px-3 py-2 rounded-lg border border-slate-200"
                      >
                        Syllabus
                      </Link>
                      <Link
                        href={`/subscriptions?course=${track.id}`}
                        className="text-xs font-bold bg-[#7928CA] hover:bg-[#671FB0] text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Enroll
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Include Most Popular Courses & Become an Instructor Banner */}
        <CourseCards />
      </main>

      <Footer />
    </div>
  );
}
