"use client";

import React from "react";
import Link from "next/link";
import { Star, ShieldCheck } from "lucide-react";

const VERIFIED_MENTORS = [
  {
    name: "Engr. Chidi Okafor",
    role: "Lead Full-Stack Architect",
    initials: "CO",
    bg: "bg-[#7928CA]"
  },
  {
    name: "Adaeze Nwosu",
    role: "AI & Automation Specialist",
    initials: "AN",
    bg: "bg-[#6F42C1]"
  },
  {
    name: "Emeka Udoh",
    role: "Principal Product Designer",
    initials: "EU",
    bg: "bg-[#7928CA]"
  }
];

export function EduportStudentFeedback() {
  return (
    <section className="relative overflow-hidden bg-[#F5F7F9] py-16 md:py-24">
      {/* Decorative Left Pink Polka-Dot Matrix */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute top-10 left-10 w-36 h-36 opacity-45"
        style={{
          backgroundImage: "radial-gradient(#E65A7C 2.5px, transparent 2.5px)",
          backgroundSize: "14px 14px"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left 7 Columns: Eduport Asymmetric Review & Mentor Cards Collage */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left Stack (7 cols): Top Review Card + Bottom Review Card */}
              <div className="sm:col-span-7 space-y-6">
                {/* Review Card 1 */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,20,61,0.06)] text-center relative">
                  <div className="w-16 h-16 rounded-full bg-[#F0EDF9] border-4 border-white shadow-md mx-auto mb-4 flex items-center justify-center text-lg font-extrabold text-[#7928CA]">
                    CO
                  </div>
                  <p className="text-xs sm:text-sm text-[#747579] leading-relaxed mb-4">
                    <span className="text-lg font-serif text-[#24292D] mr-1">“</span>
                    At BEMS Innovation Hub in Umuahia, I went from zero coding experience to building and deploying a full Next.js + Paystack web platform in 12 weeks.
                    <span className="text-lg font-serif text-[#24292D] ml-1">”</span>
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F7C32E] text-[#F7C32E]" />
                    ))}
                  </div>
                  <h4 className="text-sm font-bold text-[#24292D]">Chinedu Okorie</h4>
                  <span className="text-[11px] text-[#747579]">Full-Stack Web Dev Graduate</span>
                </div>

                {/* Review Card 2 (Slightly narrower & offset right on desktop like Eduport) */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(24,20,61,0.06)] text-center sm:ml-8 relative">
                  {/* Decorative Yellow Dot Circle Behind Bottom-Left */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none hidden sm:block absolute -bottom-6 -left-10 w-24 h-24 rounded-full opacity-60 -z-10"
                    style={{
                      backgroundImage: "radial-gradient(#F7C32E 2.5px, transparent 2.5px)",
                      backgroundSize: "10px 10px"
                    }}
                  />
                  <div className="w-14 h-14 rounded-full bg-[#EFEBF9] border-4 border-white shadow-md mx-auto mb-3 flex items-center justify-center text-base font-extrabold text-[#6F42C1]">
                    NE
                  </div>
                  <p className="text-xs text-[#747579] leading-relaxed mb-3">
                    <span className="text-base font-serif text-[#24292D] mr-1">“</span>
                    The 3-part installment plan and hybrid Zoom + Umuahia lab format let me finish my Figma design capstone and earn a QR-verified certificate.
                    <span className="text-base font-serif text-[#24292D] ml-1">”</span>
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F7C32E] text-[#F7C32E]" />
                    ))}
                  </div>
                  <h4 className="text-sm font-bold text-[#24292D]">Ngozi Eze</h4>
                  <span className="text-[11px] text-[#747579]">UI/UX Product Design Track</span>
                </div>
              </div>

              {/* Right Stack (5 cols): Blue Rating Pill + Verified Mentors Card */}
              <div className="sm:col-span-5 space-y-6">
                {/* Blue Rating Summary Card */}
                <div className="bg-[#7928CA] text-white rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10"
                  />
                  <span className="text-2xl font-extrabold block mb-1">4.9/5.0</span>
                  <div className="flex items-center justify-center gap-1 mb-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F7C32E] text-[#F7C32E]" />
                    ))}
                  </div>
                  <span className="text-xs text-white/90">Based on 320+ student ratings</span>
                </div>

                {/* Verified Mentors Card */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(24,20,61,0.06)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-extrabold text-[#24292D]">
                      20+ Verified Mentors
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-[#7928CA]" />
                  </div>
                  <div className="space-y-3.5">
                    {VERIFIED_MENTORS.map((m) => (
                      <div key={m.name} className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg ${m.bg} text-white text-xs font-extrabold flex items-center justify-center shrink-0`}
                        >
                          {m.initials}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-[#24292D] truncate">{m.name}</h5>
                          <p className="text-[11px] text-[#747579] truncate">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Heading, Description & CTA */}
          <div className="lg:col-span-5 lg:pl-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#24292D] tracking-tight leading-tight mb-4">
              Some valuable feedback from our students
            </h2>
            <p className="text-sm sm:text-base text-[#747579] leading-relaxed mb-7">
              We train students until they are work-ready, guide every learner through an employer-audited capstone project, and open direct hiring introductions with BEMS Group and partner companies.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center rounded-lg bg-[#7928CA] hover:bg-[#671FB0] text-white font-bold text-sm px-6 py-3 transition-colors shadow-xs"
              >
                View Reviews &amp; Leaderboard
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 text-[#24292D] border border-slate-200 font-bold text-sm px-5 py-3 transition-colors"
              >
                Visit Student Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
