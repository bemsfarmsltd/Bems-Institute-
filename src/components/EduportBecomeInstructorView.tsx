"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { apiFetch } from "@/lib/api-client";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  GraduationCap,
  HeartHandshake,
  MessageSquare,
  Shield,
  Sparkles,
  Video
} from "lucide-react";

const COURSES_SUMMARY = [
  {
    id: "ai-automation",
    title: "AI & Automation",
    duration: "3 months",
    cadence: "2 classes a week",
    finalProject: "A working AI or automation mini-tool"
  },
  {
    id: "web-dev",
    title: "Web Development",
    duration: "3 months",
    cadence: "3 classes a week",
    finalProject: "A live website anyone can visit"
  },
  {
    id: "product-design",
    title: "Product Design (UI/UX)",
    duration: "3 months",
    cadence: "3 classes a week",
    finalProject: "A full design case study"
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    duration: "3 months",
    cadence: "Schedule set with the tutor",
    finalProject: "A security check-up report"
  }
];

const TUTOR_DUTIES = [
  {
    title: "Teach live classes",
    body: "2–3 classes a week, in person at our Umuahia lab and online.",
    Icon: Video
  },
  {
    title: "Mark small projects",
    body: "Students build something every 2–3 weeks; you give feedback they can act on.",
    Icon: ClipboardCheck
  },
  {
    title: "Guide a final project",
    body: "Every course ends with real work a student can show an employer.",
    Icon: Award
  },
  {
    title: "Step in early",
    body: "Your tutor dashboard shows who's falling behind, so you can help before they drop out.",
    Icon: HeartHandshake
  }
];

const REQUIREMENTS = [
  "Real working experience in the subject (a portfolio, past projects or a current role)",
  "Able to explain things clearly to beginners",
  "Available for a full 3-month cohort",
  "For in-person classes, able to be at our Umuahia lab on class days"
];

const APPLY_STEPS = [
  {
    step: "1",
    title: "Fill in the form below",
    body: "Tell us which course you'd like to teach and what you've built or taught."
  },
  {
    step: "2",
    title: "We'll call you",
    body: "We'll talk through your experience, the curriculum, and how BEMS cohorts run."
  },
  {
    step: "3",
    title: "Agree pay and schedule",
    body: "If it's a fit, we agree pay and class schedule, and you start with the next cohort."
  }
];

export function EduportBecomeInstructorView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [track, setTrack] = useState<string>("cybersecurity");
  const [teachingMode, setTeachingMode] = useState<"IN_PERSON" | "ONLINE" | "EITHER">("EITHER");
  const [experience, setExperience] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedFirstName, setSubmittedFirstName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/tutor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          track,
          teachingMode,
          experience: experience.trim(),
          portfolioUrl: portfolioUrl.trim() || undefined,
          website
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status !== 201 && !res.ok) {
        setError(data?.error || "Could not send your application. Please check your details.");
        return;
      }
      const firstName = name.trim().split(/\s+/)[0] || "there";
      setSubmittedFirstName(firstName);
      setName("");
      setEmail("");
      setPhone("");
      setExperience("");
      setPortfolioUrl("");
      setWebsite("");
    } catch {
      setError("Network error while sending your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#24292D]">
      <Navbar />

      {/* 1. Hero */}
      <section className="relative bg-[#FAF8FF] border-b border-[#F1E2F5] overflow-hidden py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7EDF9] text-[#AE54C6] text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> BEMS Faculty
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-black text-[#1D2026] tracking-tight leading-tight">
                Teach tech at BEMS
              </h1>
              <p className="text-sm sm:text-base text-[#4A4568] leading-relaxed max-w-2xl">
                BEMS FutureSkills Accelerator trains people in Umuahia and online until they&apos;re
                ready for work. We&apos;re looking for practitioners who can teach a small class,
                mark real projects and help students get hired.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <a
                  href="#apply-instructor-form"
                  className="m-press inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#AE54C6] hover:bg-[#9B42B3] text-white text-sm font-bold transition-colors shadow-xs"
                >
                  Apply to teach <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/courses"
                  className="m-press inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#E5C8ED] text-[#303654] text-sm font-bold hover:bg-[#F7EDF9]/50 transition-colors"
                >
                  See our courses
                </Link>
              </div>
            </div>

            {/* Now Recruiting Highlight Card */}
            <div className="lg:col-span-5">
              <div className="m-lift rounded-3xl bg-[#303654] text-white p-6 sm:p-7 shadow-lg space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AE54C6] text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" /> Now Recruiting
                </div>
                <p className="text-base sm:text-lg font-extrabold leading-snug">
                  Cybersecurity tutor: lead our 3-month Cybersecurity course, ending in a security
                  check-up report each student can show employers.
                </p>
                <p className="text-xs sm:text-sm text-[#C6BDD3] leading-relaxed border-t border-white/10 pt-3">
                  Teach AI &amp; Automation, Web Development or Product Design? We welcome
                  applications for future cohorts and teaching support too.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. What a BEMS tutor does */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#1D2026]">
              What a BEMS tutor does
            </h2>
            <p className="text-sm text-[#645F80] mt-1.5">
              You teach BEMS&apos;s structured 3-month cohorts — no course marketplace uploads or
              solo marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TUTOR_DUTIES.map(({ title, body, Icon }) => (
              <div
                key={title}
                className="m-lift rounded-2xl border border-[#F1E2F5] bg-[#FAF8FF] p-5 space-y-3"
              >
                <div className="m-icon w-11 h-11 rounded-xl bg-white border border-[#F1E2F5] text-[#AE54C6] flex items-center justify-center shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#303654]">{title}</h3>
                <p className="text-xs sm:text-sm text-[#645F80] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The four courses */}
      <section className="py-12 sm:py-16 bg-[#FAF8FF] border-y border-[#F1E2F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#1D2026]">
              The four courses
            </h2>
            <p className="text-sm text-[#645F80] mt-1.5">
              Every BEMS track runs for 3 months and ends with a real project students can show
              employers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {COURSES_SUMMARY.map((c) => (
              <div
                key={c.id}
                className="m-lift rounded-2xl bg-white border border-[#F1E2F5] p-5 sm:p-6 shadow-xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-[#303654]">{c.title}</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F7EDF9] text-[#AE54C6] text-[11px] font-bold">
                    <Clock className="w-3 h-3" /> {c.duration}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#645F80]">{c.cadence}</p>
                <p className="text-xs sm:text-sm text-[#4A4568] pt-1">
                  <strong className="text-[#303654]">Final project:</strong> {c.finalProject}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Who we're looking for + How to apply + Pay + Graduates */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Who we're looking for */}
            <div className="lg:col-span-6 m-lift rounded-2xl border border-[#F1E2F5] bg-[#FAF8FF] p-6 sm:p-7 space-y-4">
              <h2 className="font-display text-xl sm:text-2xl font-black text-[#1D2026]">
                Who we&apos;re looking for
              </h2>
              <ul className="space-y-3">
                {REQUIREMENTS.map((req) => (
                  <li key={req} className="flex items-start gap-2.5 text-sm text-[#4A4568]">
                    <CheckCircle2 className="w-4 h-4 text-[#AE54C6] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t border-[#E5C8ED] text-xs sm:text-sm text-[#303654] font-semibold">
                <strong className="text-[#AE54C6]">Pay:</strong> This is a paid role. We&apos;ll
                talk through pay and schedule on the call.
              </div>
            </div>

            {/* How to apply */}
            <div className="lg:col-span-6 space-y-4">
              <h2 className="font-display text-xl sm:text-2xl font-black text-[#1D2026]">
                How to apply
              </h2>
              <div className="space-y-3">
                {APPLY_STEPS.map((s) => (
                  <div
                    key={s.step}
                    className="m-lift rounded-2xl border border-[#F1E2F5] bg-white p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#303654] text-white text-xs font-black flex items-center justify-center shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#303654]">{s.title}</h3>
                      <p className="text-xs sm:text-sm text-[#645F80] mt-0.5">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BEMS graduates callout */}
          <div className="m-lift rounded-2xl border border-[#E5C8ED] bg-[#F7EDF9]/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-6 h-6 text-[#AE54C6] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-extrabold text-[#303654]">BEMS graduates</h3>
                <p className="text-xs sm:text-sm text-[#4A4568] mt-0.5">
                  Finished a BEMS course? Our best graduates can come back as paid teaching
                  assistants.
                </p>
              </div>
            </div>
            <Link
              href="/courses"
              className="m-press self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#E5C8ED] text-xs font-bold text-[#303654] hover:border-[#AE54C6] shrink-0"
            >
              See our courses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Application Form */}
      <section
        id="apply-instructor-form"
        className="py-12 sm:py-16 bg-[#FAF8FF] border-t border-[#F1E2F5] scroll-mt-20"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#AE54C6]">
                <MessageSquare className="w-3.5 h-3.5" /> Tutor Application
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-[#1D2026] mt-1">
                Apply to teach
              </h2>
              <p className="text-xs sm:text-sm text-[#645F80] mt-1">
                Fill in your details below and we&apos;ll reach out if your experience fits an
                upcoming cohort.
              </p>
            </div>

            {submittedFirstName ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-emerald-950">
                      Application received
                    </h3>
                    <p className="text-sm text-emerald-900 leading-relaxed">
                      Thanks, {submittedFirstName}. Your application has arrived, and we&apos;ve
                      emailed you a copy. We&apos;ll be in touch if your experience matches what we
                      need.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmittedFirstName(null)}
                  className="m-press text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden"
                >
                  <label htmlFor="tutor-website">Website</label>
                  <input
                    id="tutor-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#303654] mb-1.5">
                      Full name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5C8ED] bg-white text-sm text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/25 focus:border-[#AE54C6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#303654] mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5C8ED] bg-white text-sm text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/25 focus:border-[#AE54C6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#303654] mb-1.5">
                      Phone (WhatsApp if possible) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5C8ED] bg-white text-sm text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/25 focus:border-[#AE54C6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#303654] mb-1.5">
                      Course you&apos;d like to teach *
                    </label>
                    <select
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5C8ED] bg-white text-sm text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/25 focus:border-[#AE54C6]"
                    >
                      <option value="cybersecurity">Cybersecurity</option>
                      <option value="ai-automation">AI &amp; Automation</option>
                      <option value="web-dev">Web Development</option>
                      <option value="product-design">Product Design (UI/UX)</option>
                      <option value="other">Something else</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    How you&apos;d like to teach *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(
                      [
                        { id: "IN_PERSON", label: "In person in Umuahia" },
                        { id: "ONLINE", label: "Online" },
                        { id: "EITHER", label: "Either" }
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTeachingMode(opt.id)}
                        className={`m-press px-3.5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                          teachingMode === opt.id
                            ? "border-[#AE54C6] bg-[#F7EDF9] text-[#AE54C6]"
                            : "border-[#E5C8ED] bg-white text-[#4A4568] hover:border-[#AE54C6]/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Your experience *
                  </label>
                  <textarea
                    required
                    rows={5}
                    minLength={30}
                    maxLength={3000}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="What have you built or taught? Where do you work now?"
                    className="w-full px-3.5 py-3 rounded-xl border border-[#E5C8ED] bg-white text-sm text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/25 focus:border-[#AE54C6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Portfolio or LinkedIn link (optional)
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5C8ED] bg-white text-sm text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/25 focus:border-[#AE54C6]"
                  />
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="m-press w-full sm:w-auto px-6 py-3 rounded-xl bg-[#AE54C6] hover:bg-[#9B42B3] text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
