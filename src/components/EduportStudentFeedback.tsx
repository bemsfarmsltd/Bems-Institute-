"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useLMS } from "@/context/LMSContext";
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
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function EduportStudentFeedback() {
  const { courses, certificates } = useLMS();
  const [outcomes, setOutcomes] = useState<GraduateOutcome[]>([]);

  useEffect(() => {
    apiFetch("/api/graduates")
      .then((res) => (res.ok ? res.json() : { outcomes: [] }))
      .then((data) => setOutcomes(data.outcomes || []))
      .catch(() => setOutcomes([]));
  }, []);

  const mentors = React.useMemo(() => {
    const seen = new Map<string, { name: string; role: string }>();
    for (const c of courses) {
      if (!seen.has(c.tutor)) seen.set(c.tutor, { name: c.tutor, role: c.tutorRole });
    }
    return Array.from(seen.values());
  }, [courses]);

  const featuredOutcomes = outcomes.slice(0, 2);

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
          {/* Left 7 Columns: Review & Mentor Cards Collage */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left Stack: Real graduate outcome(s), or an honest placeholder */}
              <div className="sm:col-span-7 space-y-6">
                {featuredOutcomes.length > 0 ? (
                  featuredOutcomes.map((o, i) => (
                    <div
                      key={o.id}
                      className={`bg-white rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,20,61,0.06)] text-center relative ${
                        i === 1 ? "sm:ml-8" : ""
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full bg-[#F7EDF9] border-4 border-white shadow-md mx-auto mb-4 flex items-center justify-center text-lg font-extrabold text-[#AE54C6]">
                        {initials(o.name)}
                      </div>
                      {o.quote && (
                        <p className="text-xs sm:text-sm text-[#747579] leading-relaxed mb-4">
                          <span className="text-lg font-serif text-[#24292D] mr-1">&ldquo;</span>
                          {o.quote}
                          <span className="text-lg font-serif text-[#24292D] ml-1">&rdquo;</span>
                        </p>
                      )}
                      <h4 className="text-sm font-bold text-[#24292D]">{o.name}</h4>
                      <span className="text-[11px] text-[#747579]">
                        {o.headline} · {o.courseTitle}
                        {o.company ? ` @ ${o.company}` : ""}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(24,20,61,0.06)] text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F7EDF9] border-4 border-white shadow-md mx-auto mb-4 flex items-center justify-center text-[#AE54C6]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#747579] leading-relaxed mb-2">
                      Graduate outcomes are published here as BEMS students complete their capstones and get hired.
                    </p>
                    <h4 className="text-sm font-bold text-[#24292D]">Be our first success story</h4>
                  </div>
                )}
              </div>

              {/* Right Stack: Certificates Issued + Real Instructors */}
              <div className="sm:col-span-5 space-y-6">
                <div className="bg-[#AE54C6] text-white rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10"
                  />
                  <span className="text-2xl font-extrabold block mb-1">{certificates.length}</span>
                  <span className="text-xs text-white/90">
                    {certificates.length === 1 ? "Certificate issued so far" : "Certificates issued so far"}
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(24,20,61,0.06)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-extrabold text-[#24292D]">
                      {mentors.length} Expert Instructor{mentors.length === 1 ? "" : "s"}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-[#AE54C6]" />
                  </div>
                  <div className="space-y-3.5">
                    {mentors.map((m) => (
                      <div key={m.name} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#AE54C6] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                          {initials(m.name)}
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
                href="/graduates"
                className="inline-flex items-center justify-center rounded-lg bg-[#AE54C6] hover:bg-[#A03BBC] text-white font-bold text-sm px-6 py-3 transition-colors shadow-xs"
              >
                View Graduate Outcomes
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
