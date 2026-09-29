"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Building2, Quote } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { apiFetch } from "@/lib/api-client";

interface GraduateOutcome {
  id: string;
  name: string;
  courseTitle: string;
  headline: string;
  company: string | null;
  quote: string | null;
  photoUrl: string | null;
  featured: boolean;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function GraduatesPage() {
  const [outcomes, setOutcomes] = useState<GraduateOutcome[] | null>(null);

  useEffect(() => {
    apiFetch("/api/graduates")
      .then((res) => (res.ok ? res.json() : { outcomes: [] }))
      .then((data) => setOutcomes(data.outcomes || []))
      .catch(() => setOutcomes([]));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#24292D]">
      <Navbar />

      <section className="bg-[#F5F7F9] py-14 sm:py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EDF9] text-[#7928CA] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Real Outcomes
          </div>
          <h1 className="font-display text-3xl sm:text-[44px] font-extrabold tracking-tight mb-3">
            Where They Are Now
          </h1>
          <p className="text-sm sm:text-base text-[#747579] leading-relaxed">
            Real BEMS FutureSkills graduates, hired and building careers in tech. Learn in Umuahia, earn anywhere.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        {outcomes === null ? (
          <p className="text-center text-sm text-[#747579]">Loading graduate stories…</p>
        ) : outcomes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#747579] max-w-md mx-auto">
              Our first cohort graduates in early 2027 — check back soon to see where they land.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {outcomes.map((o) => (
              <div
                key={o.id}
                className={`rounded-xl border p-6 flex flex-col gap-4 ${
                  o.featured
                    ? "border-[#7928CA] bg-[#F0EDF9]/40 shadow-[0_0_30px_rgba(12,188,135,0.08)]"
                    : "border-slate-200/90 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  {o.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.photoUrl}
                      alt={o.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F7C32E] via-[#FF6B5B] to-[#D6293E] flex items-center justify-center text-white font-black text-lg">
                      {initials(o.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#24292D] text-[15px] truncate">{o.name}</h3>
                    <p className="text-xs text-[#747579] truncate">{o.courseTitle}</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-[#7928CA] text-sm mb-1">{o.headline}</p>
                  {o.company && (
                    <p className="text-xs text-[#747579] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> {o.company}
                    </p>
                  )}
                </div>

                {o.quote && (
                  <blockquote className="text-xs sm:text-[13px] text-[#24292D]/80 leading-relaxed italic border-l-2 border-[#7928CA]/40 pl-3 flex gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-[#7928CA]/60 shrink-0 mt-0.5" />
                    <span>{o.quote}</span>
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
