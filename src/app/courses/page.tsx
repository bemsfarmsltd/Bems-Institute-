"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCards } from "@/components/CourseCards";
import { COURSES } from "@/data/courses";
import { Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CoursesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Plain window.location read rather than useSearchParams() — this page
  // doesn't have a Suspense boundary, and a bare browser API avoids needing
  // one just to pick up the navbar search box's ?q= handoff.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setSearchQuery(q);
      document.getElementById("tracks-section")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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
    const el = document.getElementById("tracks-section");
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
                  <rect x="30" y="26" width="10" height="28" rx="1.5" fill="#AE54C6" />
                  <rect x="41" y="26" width="10" height="28" rx="1.5" fill="#D6293E" />
                  <rect x="52" y="26" width="10" height="28" rx="1.5" fill="#AE54C6" />
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
                    fill="#AE54C6"
                  />
                  <path d="M65 175L56 242M112 175L120 242M60 212H116" stroke="#AE54C6" strokeWidth="4.5" />
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
                  className="w-6 h-6 text-[#A16EBD] mx-auto mb-5"
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
                  <circle cx="46" cy="100" r="22" fill="white" stroke="#AE54C6" strokeWidth="4.5" />
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
                    fill="#AE54C6"
                  />
                  <rect x="122" y="116" width="32" height="55" fill="#E8EEF5" />
                  {/* Student Head, Glasses & Green Headphones */}
                  <circle cx="138" cy="86" r="17" fill="#F4A27E" />
                  <circle cx="144" cy="64" r="9" fill="#24292D" />
                  <path d="M120 86C120 72 130 64 138 64C146 64 156 72 156 86" stroke="#AE54C6" strokeWidth="4" />
                  <ellipse cx="155" cy="88" rx="4.5" ry="7" fill="#AE54C6" />
                  {/* Green Crossed Legs & Yellow Shoes */}
                  <path
                    d="M84 176C78 190 98 214 138 214C178 214 198 190 192 176C174 170 102 170 84 176Z"
                    fill="#AE54C6"
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
                  <path d="M64 206C46 196 34 184 32 172C48 176 58 190 64 206Z" fill="#AE54C6" />
                  <path d="M64 206C68 186 78 172 90 166C88 182 76 196 64 206Z" fill="#099268" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 2. BEMS Specialized Career Tracks & Popular Courses */}
        <section id="tracks-section" className="py-12 bg-[#FAFBFD] border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#AE54C6] block mb-1">
                  BEMS UMUAHIA &amp; ONLINE COHORT
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#24292D]">
                  Career-Ready Certification Tracks ({matchingCoreTracks.length})
                </h2>
              </div>
              <Link
                href="/subscriptions"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#AE54C6] hover:underline"
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
                      <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#F7EDF9] text-[#AE54C6]">
                        {track.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#747579]">
                        <Clock className="w-3.5 h-3.5 text-[#AE54C6]" /> {track.duration} ·{" "}
                        {track.schedule}
                      </span>
                    </div>

                    <Link href={`/courses/${track.id}`}>
                      <h3 className="text-xl font-extrabold text-[#24292D] hover:text-[#AE54C6] transition-colors mb-1.5">
                        {track.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-[#747579] mb-4">{track.tagline}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                      {track.modules.slice(0, 4).map((m, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-[#24292D]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#AE54C6] shrink-0 mt-0.5" />
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
                        className="text-xs font-bold text-[#24292D] hover:text-[#AE54C6] px-3 py-2 rounded-lg border border-slate-200"
                      >
                        Syllabus
                      </Link>
                      <Link
                        href={`/subscriptions?course=${track.id}`}
                        className="text-xs font-bold bg-[#AE54C6] hover:bg-[#A03BBC] text-white px-4 py-2 rounded-lg transition-colors"
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
