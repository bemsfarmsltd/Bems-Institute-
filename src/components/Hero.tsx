"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLMS } from "@/context/LMSContext";
import { CountUp } from "@/components/CountUp";
import {
  CheckCircle2,
  Play,
  Monitor,
  UserCheck,
  GraduationCap,
  BadgeCheck,
  QrCode,
  ArrowRight,
  Calendar,
  ExternalLink,
  Flame,
  MapPin,
  Video
} from "lucide-react";

// Derived from live catalog data so counts reflect the real curriculum.

export function Hero() {
  const { courses, user, mySpace } = useLMS();

  if (user?.role === "STUDENT" && mySpace) {
    const primaryCourse = mySpace.courses[0] ?? null;
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8FF] to-white pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="m-lift bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#F7EDF9] text-[#AE54C6] text-xs font-extrabold">
                    {mySpace.greeting}
                  </span>
                  {mySpace.streak > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold">
                      <Flame className="w-3.5 h-3.5" /> {mySpace.streak} day streak
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-black text-[#1D2026] leading-tight">
                  Welcome back, {mySpace.firstName}
                </h1>
                {mySpace.profile?.goal && (
                  <p className="text-sm sm:text-base text-[#475569] font-medium">
                    You&apos;re here to:{" "}
                    <strong className="text-[#AE54C6]">{mySpace.profile.goal}</strong>
                  </p>
                )}
                {primaryCourse && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#645F80] font-semibold pt-1">
                    <span className="text-[#1D2026] font-bold">{primaryCourse.title}</span>
                    <span>Your tutor: {primaryCourse.tutor}</span>
                    <span className="inline-flex items-center gap-1 text-[#AE54C6]">
                      {primaryCourse.deliveryMode === "VIRTUAL_ZOOM" ? (
                        <>
                          <Video className="w-3.5 h-3.5" /> Virtual, live online
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5" /> Physical, BEMS lab, Umuahia
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  href="/dashboard"
                  className="m-press inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#AE54C6] hover:bg-[#9B42B3] text-white text-sm font-bold shadow-sm transition-colors"
                >
                  Open My Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                {!mySpace.onboarded && (
                  <Link
                    href="/welcome"
                    className="m-press inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#E5C8ED] bg-white hover:bg-[#FAF8FF] text-[#303654] text-sm font-bold transition-colors"
                  >
                    Personalize my space
                  </Link>
                )}
              </div>
            </div>

            {primaryCourse && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#F7EDF9]">
                <div className="m-lift rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] p-4 sm:p-5 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#AE54C6]">
                      Continue Lesson
                    </span>
                    {!primaryCourse.hasAccess ? (
                      <p className="text-sm text-[#645F80] mt-1 font-medium">
                        Your space opens when admissions confirms your registration.
                      </p>
                    ) : primaryCourse.nextLesson ? (
                      <>
                        <h2 className="text-base font-extrabold text-[#1D2026] mt-1">
                          {primaryCourse.nextLesson.moduleTitle} · {primaryCourse.nextLesson.title}
                        </h2>
                        <p className="text-xs text-[#645F80] mt-1">
                          {primaryCourse.progress.percent}% complete ({primaryCourse.progress.completed}/
                          {primaryCourse.progress.total} lessons)
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[#303654] font-semibold mt-1">
                        You&apos;ve completed all lessons in {primaryCourse.title}!
                      </p>
                    )}
                  </div>
                  {primaryCourse.hasAccess && primaryCourse.nextLesson && (
                    <Link
                      href={primaryCourse.nextLesson.href}
                      className="m-press self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#303654] text-white text-xs font-bold hover:opacity-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Resume Lesson
                    </Link>
                  )}
                </div>

                <div className="m-lift rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] p-4 sm:p-5 flex flex-col justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                      <Calendar className="w-3.5 h-3.5" /> Next Live Class
                    </span>
                    {primaryCourse.nextLiveSession ? (
                      <>
                        <h2 className="text-base font-extrabold text-[#1D2026] mt-1">
                          {primaryCourse.nextLiveSession.title}
                        </h2>
                        <p className="text-xs text-[#645F80] mt-1">
                          {new Date(primaryCourse.nextLiveSession.scheduledAt).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[#645F80] mt-1">
                        No upcoming live class scheduled yet.
                      </p>
                    )}
                  </div>
                  {primaryCourse.nextLiveSession?.meetingUrl && (
                    <a
                      href={primaryCourse.nextLiveSession.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="m-press self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                    >
                      Join Class <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  const STATS = [
    {
      count: courses.length || 5,
      format: (n: number) => `${n} Tracks`,
      label: "Hands-On Tech Courses",
      bg: "bg-[#FEF6E0]",
      iconColor: "text-[#F7C32E]",
      Icon: Monitor
    },
    {
      count: 4,
      format: (n: number) => `${n}`,
      label: "Expert Tutors & Mentors",
      bg: "bg-[#E8EEF2]",
      iconColor: "text-[#1D3B53]",
      Icon: UserCheck
    },
    {
      count: 80,
      format: (n: number) => `${n} Seats`,
      label: "Per Cohort",
      bg: "bg-[#F6ECF9]",
      iconColor: "text-[#A16EBD]",
      Icon: GraduationCap
    },
    {
      count: 2,
      format: () => "Lab & Live",
      label: "Physical or Virtual Class",
      bg: "bg-[#E5F5F7]",
      iconColor: "text-[#17A2B8]",
      Icon: BadgeCheck
    }
  ];

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 md:pt-14 md:pb-20">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes bemsHeroFadeUp {
            0% { opacity: 0; transform: translate3d(0, 18px, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          @keyframes bemsHeroPopIn {
            0% { opacity: 0; transform: scale(0.84) translate3d(0, 12px, 0); }
            100% { opacity: 1; transform: scale(1) translate3d(0, 0, 0); }
          }
          .bems-hero-copy {
            animation: bemsHeroFadeUp 580ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
          }
          .bems-hero-portrait {
            animation: bemsHeroPopIn 620ms 80ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          }
          .bems-hero-badge-1 {
            animation: bemsHeroPopIn 540ms 180ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          }
          .bems-hero-badge-2 {
            animation: bemsHeroPopIn 540ms 260ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          }
          .bems-hero-badge-3 {
            animation: bemsHeroPopIn 540ms 340ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          }
        }
      `}</style>
      {/* Decorative Eduport Top-Left Peach Circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden md:block absolute top-6 left-8 w-8 h-8 rounded-full bg-[#F7C39C]/70"
      />

      {/* Decorative Eduport Left Polka-Dot Matrix */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute top-1/3 -left-6 w-28 h-48 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#F3A4B5 2.5px, transparent 2.5px)",
          backgroundSize: "14px 14px",
          transform: "rotate(-12deg)"
        }}
      />

      {/* Decorative Right Concentric Rings */}
      <svg
        aria-hidden="true"
        className="pointer-events-none hidden xl:block absolute bottom-28 -right-10 w-36 h-36 text-[#F7C32E]/35"
        viewBox="0 0 120 120"
        fill="none"
      >
        <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="46" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="30" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Hero 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pb-16 md:pb-20">
          {/* Left Column: Eduport Typography, Yellow Brush Highlight, Checkmarks & CTAs */}
          <div className="lg:col-span-6 relative bems-hero-copy">
            {/* Green Starburst Accent */}
            <svg
              aria-hidden="true"
              className="hidden sm:block absolute -top-8 left-[58%] w-6 h-6 text-[#AE54C6]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0L14.2 8.2L21.5 4.5L16.5 11L24 13.5L15.8 15L19.5 22.5L12.8 17.2L9.5 24L9.2 15.8L1.5 18.5L7.2 12.2L0 8.5L8.2 8.2L6.5 0.5L12 6.8L12 0Z" />
            </svg>

            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold text-[#24292D] tracking-tight leading-[1.18] mb-6">
              Learn in Umuahia, <br />
              <span className="relative inline-block px-2 mt-1">
                {/* Eduport Hand-Painted Yellow Brushstroke Highlight */}
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full -z-10 scale-x-105 scale-y-95"
                  viewBox="0 0 360 70"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M8.5 22.5C82 10.5 245 8.5 348 16.5C357 17.5 359 27 345 29.5C290 33.5 355 41 351 49.5C346 58 210 64 14 58.5C2 58 1 45 12 42.5C4 38 1 24 8.5 22.5Z"
                    fill="#F7C32E"
                  />
                  <path
                    d="M16 62C115 66 260 63 338 56"
                    stroke="#F5B100"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="relative z-10 text-[#24292D]">Earn Anywhere.</span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#747579] leading-relaxed mb-7 max-w-xl">
              The <strong className="text-[#24292D] font-semibold">BEMS FutureSkills Accelerator</strong> trains you in hands-on physical labs and live sessions with specialist engineers—building an employer-verified portfolio in 3 months.
            </p>

            {/* 3 Checkmark Trust Items (Eduport Style) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-9 text-sm font-medium text-[#24292D]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 fill-[#24292D] text-white shrink-0" />
                <span>Learn with experts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 fill-[#24292D] text-white shrink-0" />
                <span>Get QR certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 fill-[#24292D] text-white shrink-0" />
                <span>Pay in 3 installments</span>
              </div>
            </div>

            {/* Eduport Dual Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              <Link
                href="/subscriptions"
                data-tour="hero-cta"
                className="m-press inline-flex items-center justify-center rounded-lg bg-[#AE54C6] hover:bg-[#A03BBC] text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-3 sm:py-3.5 transition-colors duration-200 shadow-2xs"
              >
                Get Started
              </Link>

              <Link
                href="#courses"
                className="m-press inline-flex items-center gap-2.5 sm:gap-3.5 group text-xs sm:text-sm font-bold text-[#24292D] hover:text-[#AE54C6] transition-colors"
              >
                <span className="m-pop w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#AE54C6] text-white flex items-center justify-center ring-4 sm:ring-8 ring-[#AE54C6]/15">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white ml-0.5" />
                </span>
                <span>Explore Courses</span>
              </Link>

              {user?.role === "ADMIN" && (
              <Link
                href="/qr-studio"
                className="m-press inline-flex items-center gap-1.5 text-xs font-semibold text-[#747579] hover:text-[#AE54C6] transition-colors"
              >
                <QrCode className="w-4 h-4 text-[#AE54C6]" />
                <span>Banner QR Studio</span>
              </Link>
              )}
            </div>

            {/* Yellow 4-Point Star Accent */}
            <svg
              aria-hidden="true"
              className="hidden sm:block absolute bottom-2 right-6 w-9 h-9 text-[#F7C32E]"
              viewBox="0 0 36 36"
              fill="currentColor"
            >
              <path d="M18 0L22.5 13.5L36 18L22.5 22.5L18 36L13.5 22.5L0 18L13.5 13.5L18 0Z" />
            </svg>
          </div>

          {/* Right Column: Eduport Organic Navy Shape + Student Portrait + Floating Badges */}
          <div className="lg:col-span-6 relative flex justify-center w-full px-2 sm:px-0">
            <div className="relative w-full max-w-[490px] flex justify-center bems-hero-portrait">
              {/* Organic Eduport Navy Shape Container */}
              <div className="relative mx-auto w-[270px] h-[310px] sm:w-[410px] sm:h-[440px] rounded-[46%_54%_48%_52%/54%_46%_54%_46%] bg-[#334E5B] overflow-hidden shadow-xl">
                <Image
                  src="/images/eduport-hero-student.jpg"
                  alt="BEMS Institute Tech Student"
                  fill
                  priority
                  sizes="(min-width: 640px) 410px, 270px"
                  className="object-cover object-top scale-105"
                />

                {/* Hand-Drawn Yellow Lightbulb Doodle (Top-Left inside circle) */}
                <svg
                  aria-hidden="true"
                  className="absolute top-10 left-8 sm:top-16 sm:left-12 w-8 h-8 sm:w-12 sm:h-12 text-[#F7C32E] opacity-90 pointer-events-none"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M32 16C24.3 16 18 22.3 18 30C18 35.2 20.8 39.7 25 42.1V48C25 49.7 26.3 51 28 51H36C37.7 51 39 49.7 39 48V42.1C43.2 39.7 46 35.2 46 30C46 22.3 39.7 16 32 16Z" />
                  <path d="M27 56H37" />
                  <path d="M32 6V10" />
                  <path d="M14 14L17 17" />
                  <path d="M50 14L47 17" />
                  <path d="M8 30H12" />
                  <path d="M52 30H56" />
                </svg>
              </div>

              {/* Floating Tech Icon 1: React / Atom (Left) */}
              <div aria-hidden="true" className="bems-hero-badge-1 absolute top-1/3 left-0 sm:-left-6">
                <div
                  className="m-pop m-float bg-white rounded-xl p-2 sm:p-3 shadow-lg border border-slate-100 flex items-center justify-center"
                  style={{ "--float-delay": "800ms" } as React.CSSProperties}
                >
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-[#2B2848]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
                    <ellipse
                      cx="12"
                      cy="12"
                      rx="10"
                      ry="4.2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <ellipse
                      cx="12"
                      cy="12"
                      rx="10"
                      ry="4.2"
                      transform="rotate(60 12 12)"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <ellipse
                      cx="12"
                      cy="12"
                      rx="10"
                      ry="4.2"
                      transform="rotate(120 12 12)"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </div>
              </div>

              {/* Floating Tech Icon 2: Code / Shield (Top-Right) */}
              <div aria-hidden="true" className="bems-hero-badge-2 absolute -top-2 right-2 sm:right-6">
                <div
                  className="m-pop m-float bg-white rounded-xl p-2 sm:p-2.5 shadow-lg border border-slate-100 flex items-center justify-center"
                  style={{ "--float-delay": "1100ms" } as React.CSSProperties}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L3 5.2L4.4 17.2L12 21.5L19.6 17.2L21 5.2L12 2Z"
                      fill="#DD0031"
                    />
                    <path
                      d="M12 4.3L6.4 16.8H8.5L9.7 13.8H14.3L15.5 16.8H17.6L12 4.3ZM10.5 11.9L12 8.2L13.5 11.9H10.5Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>

              {/* Floating Tech Icon 3: Figma (Bottom-Right) */}
              <div aria-hidden="true" className="bems-hero-badge-3 absolute bottom-16 sm:bottom-20 right-1 sm:-right-4">
                <div
                  className="m-pop m-float bg-white rounded-xl p-2 sm:p-2.5 shadow-lg border border-slate-100 flex items-center justify-center"
                  style={{ "--float-delay": "1400ms" } as React.CSSProperties}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8.5 2C6.8 2 5.5 3.3 5.5 5C5.5 6.7 6.8 8 8.5 8H11.5V2H8.5Z"
                      fill="#F24E1E"
                    />
                    <path
                      d="M11.5 2H14.5C16.2 2 17.5 3.3 17.5 5C17.5 6.7 16.2 8 14.5 8H11.5V2Z"
                      fill="#FF7262"
                    />
                    <path
                      d="M8.5 8C6.8 8 5.5 9.3 5.5 11C5.5 12.7 6.8 14 8.5 14H11.5V8H8.5Z"
                      fill="#A259FF"
                    />
                    <path
                      d="M8.5 14C6.8 14 5.5 15.3 5.5 17C5.5 18.7 6.8 20 8.5 20C10.2 20 11.5 18.7 11.5 17V14H8.5Z"
                      fill="#0ACF83"
                    />
                    <circle cx="14.5" cy="11" r="3" fill="#1ABCFE" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Eduport 4 Pastel Stat Counter Cards Row (Image 3) */}
        <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ count, format, label, bg, iconColor, Icon }) => (
            <div
              key={label}
              className={`m-lift ${bg} rounded-xl p-6 flex items-center justify-center sm:justify-start gap-5`}
            >
              <Icon className={`m-icon w-12 h-12 ${iconColor} shrink-0 stroke-[1.75]`} />
              <div>
                <span className="text-2xl font-extrabold text-[#24292D] block leading-tight">
                  <CountUp value={count} format={format} />
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#24292D]/80">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
