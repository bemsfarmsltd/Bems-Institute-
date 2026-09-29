"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Play,
  Mail,
  Monitor,
  UserCheck,
  GraduationCap,
  BadgeCheck,
  QrCode
} from "lucide-react";

const STATS = [
  {
    value: "4 Tracks",
    label: "Hands-On Tech Courses",
    bg: "bg-[#FEF6E0]",
    iconColor: "text-[#F7C32E]",
    Icon: Monitor
  },
  {
    value: "20+",
    label: "Expert Tutors & Mentors",
    bg: "bg-[#E8EEF2]",
    iconColor: "text-[#1D3B53]",
    Icon: UserCheck
  },
  {
    value: "80 Seats",
    label: "October 2026 Cohort",
    bg: "bg-[#EFEBF9]",
    iconColor: "text-[#6F42C1]",
    Icon: GraduationCap
  },
  {
    value: "100%",
    label: "QR-Verified Certificates",
    bg: "bg-[#E5F5F7]",
    iconColor: "text-[#17A2B8]",
    Icon: BadgeCheck
  }
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 md:pt-14 md:pb-20">
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
          <div className="lg:col-span-6 relative">
            {/* Green Starburst Accent */}
            <svg
              aria-hidden="true"
              className="hidden sm:block absolute -top-8 left-[58%] w-6 h-6 text-[#0CBC87]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0L14.2 8.2L21.5 4.5L16.5 11L24 13.5L15.8 15L19.5 22.5L12.8 17.2L9.5 24L9.2 15.8L1.5 18.5L7.2 12.2L0 8.5L8.2 8.2L6.5 0.5L12 6.8L12 0Z" />
            </svg>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#24292D] tracking-tight leading-[1.18] mb-6">
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
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/subscriptions"
                className="inline-flex items-center justify-center rounded-lg bg-[#FBE9EB] hover:bg-[#D6293E] text-[#D6293E] hover:text-white font-bold text-sm px-7 py-3.5 transition-all duration-200 shadow-2xs"
              >
                Get Started
              </Link>

              <Link
                href="#courses"
                className="inline-flex items-center gap-3.5 group text-sm font-bold text-[#24292D] hover:text-[#066AC9] transition-colors"
              >
                <span className="w-12 h-12 rounded-full bg-[#066AC9] text-white flex items-center justify-center ring-8 ring-[#066AC9]/15 group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </span>
                <span>Explore Courses</span>
              </Link>

              <Link
                href="/qr-studio"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#747579] hover:text-[#066AC9] transition-colors ml-auto sm:ml-2"
              >
                <QrCode className="w-4 h-4 text-[#066AC9]" />
                <span>Banner QR Studio</span>
              </Link>
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
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[490px]">
              {/* Organic Eduport Navy Shape Container */}
              <div className="relative mx-auto w-[320px] h-[360px] sm:w-[410px] sm:h-[440px] rounded-[46%_54%_48%_52%/54%_46%_54%_46%] bg-[#162A45] overflow-hidden shadow-xl">
                <Image
                  src="/images/eduport-hero-student.jpg"
                  alt="BEMS Institute Tech Student"
                  fill
                  priority
                  className="object-cover object-top scale-105"
                />

                {/* Hand-Drawn Yellow Lightbulb Doodle (Top-Left inside circle) */}
                <svg
                  aria-hidden="true"
                  className="absolute top-16 left-12 w-12 h-12 text-[#F7C32E] opacity-90 pointer-events-none"
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
              <div className="absolute top-1/3 -left-2 sm:-left-6 bg-white rounded-xl p-3 shadow-lg border border-slate-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#2B2848]" viewBox="0 0 24 24" fill="none">
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

              {/* Floating Tech Icon 2: Code / Shield (Top-Right) */}
              <div className="absolute -top-2 right-4 sm:right-6 bg-white rounded-xl p-2.5 shadow-lg border border-slate-100 flex items-center justify-center">
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

              {/* Floating Tech Icon 3: Figma (Bottom-Right) */}
              <div className="absolute bottom-20 -right-1 sm:-right-4 bg-white rounded-xl p-2.5 shadow-lg border border-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
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

              {/* Eduport Green Floating Card: "Our daily new students" */}
              <div className="absolute top-24 -right-2 sm:-right-8 bg-[#0CBC87] text-white rounded-2xl p-4 shadow-xl w-52 overflow-hidden">
                {/* Subtle topographic wave pattern */}
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                  viewBox="0 0 200 100"
                  fill="none"
                >
                  <path
                    d="M-20 80 C40 20, 120 100, 220 30 M-20 60 C50 0, 130 80, 220 10 M-20 100 C60 40, 140 120, 220 50"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </svg>
                <p className="text-xs font-bold text-white mb-2.5 relative z-10">
                  October 2026 Cohort
                </p>
                <div className="flex items-center -space-x-2 relative z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#F7C32E] text-[#24292D] text-[10px] font-extrabold flex items-center justify-center">
                    CO
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#D6293E] text-white text-[10px] font-extrabold flex items-center justify-center">
                    AN
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#6F42C1] text-white text-[10px] font-extrabold flex items-center justify-center">
                    EK
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#1D3B53] text-white text-[10px] font-extrabold flex items-center justify-center">
                    UI
                  </div>
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-[#066AC9] text-white text-[10px] font-extrabold flex items-center justify-center">
                    80+
                  </div>
                </div>
              </div>

              {/* Eduport Frosted Floating Card: "Congratulations · Your admission completed" */}
              <div className="absolute bottom-3 left-0 sm:-left-6 bg-white/90 backdrop-blur-md border border-white rounded-2xl p-3.5 pr-5 shadow-xl flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#F7C32E] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#24292D]">
                      Congratulations
                    </h4>
                    <span className="w-4 h-4 rounded-full bg-[#0CBC87] text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  </div>
                  <p className="text-xs text-[#747579] mt-0.5">Your admission completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eduport 4 Pastel Stat Counter Cards Row (Image 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ value, label, bg, iconColor, Icon }) => (
            <div
              key={label}
              className={`${bg} rounded-xl p-6 flex items-center justify-center sm:justify-start gap-5 transition-transform duration-200 hover:-translate-y-1`}
            >
              <Icon className={`w-12 h-12 ${iconColor} shrink-0 stroke-[1.75]`} />
              <div>
                <span className="text-2xl font-extrabold text-[#24292D] block leading-tight">
                  {value}
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
