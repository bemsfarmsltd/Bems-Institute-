"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2, ArrowUp, X } from "lucide-react";

export function EduportBecomeInstructorView() {
  const [activeGuideTab, setActiveGuideTab] = useState<
    "become" | "role" | "start"
  >("become");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitted(true);
    setName("");
    setEmail("");
    setPhone("");
    setSummary("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#24292D]">
      <Navbar />

      {/* ==================== 1. HERO SECTION (media_1790713338357.png) ==================== */}
      <section className="relative bg-[#F5F7F9] overflow-hidden py-14 sm:py-20">
        {/* Decorative Yellow Flowing Curve Line */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 bottom-0 w-[60%] max-w-[780px] h-auto"
          viewBox="0 0 760 320"
          fill="none"
        >
          <path
            d="M0 305 C110 215, 225 180, 355 235 C475 285, 575 180, 745 30"
            stroke="#F7C32E"
            strokeWidth="1.6"
          />
        </svg>

        {/* Right Pastel Blue Half-Circle & Blue Dot Matrix */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-10 w-72 h-72 rounded-full bg-[#DCE9F8]/80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-14 bottom-20 w-28 h-28 opacity-65 hidden md:block"
          style={{
            backgroundImage:
              "radial-gradient(#3B82F6 1.8px, transparent 1.8px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Title, Subtitle, CTA */}
            <div className="lg:col-span-6 space-y-5">
              <h1 className="font-display text-4xl sm:text-[48px] font-extrabold text-[#24292D] tracking-tight leading-tight">
                Apply as Instructor
              </h1>
              <p className="text-[14.5px] sm:text-[15px] text-[#747579] leading-relaxed max-w-xl">
                Satisfied conveying a dependent contented he gentleman agreeable
                do be. Delivered dejection necessary objection do Mr prevailed.
                Mr feeling does chiefly cordial in do.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <a
                  href="#apply-instructor-form"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#066AC9] hover:bg-[#0556A5] text-white text-[14px] font-bold transition-colors shadow-2xs"
                >
                  Start Teaching today
                </a>
                <Link
                  href="/instructor"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white border border-slate-200 hover:border-[#066AC9] text-[#24292D] text-[13.5px] font-bold transition-colors"
                >
                  Instructor Dashboard
                </Link>
              </div>
            </div>

            {/* Right Column: Custom Vector Illustration (Instructor + Student + Books + Globe) */}
            <div className="lg:col-span-6 flex justify-center">
              <svg
                viewBox="0 0 560 400"
                className="w-full max-w-[520px] h-auto select-none"
                fill="none"
              >
                {/* Main Browser Window Backdrop */}
                <rect
                  x="200"
                  y="78"
                  width="225"
                  height="168"
                  rx="4"
                  fill="#F1F3F9"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                />
                <rect
                  x="200"
                  y="78"
                  width="225"
                  height="16"
                  fill="#CBD5E1"
                />
                <circle cx="210" cy="86" r="3" fill="#EF4444" />
                <circle cx="220" cy="86" r="3" fill="#F59E0B" />
                <circle cx="230" cy="86" r="3" fill="#10B981" />

                {/* Top-Left Pie Chart Floating Window */}
                <rect
                  x="130"
                  y="24"
                  width="66"
                  height="52"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#94A3B8"
                  strokeWidth="1"
                />
                <rect
                  x="130"
                  y="24"
                  width="66"
                  height="10"
                  fill="#C7D2FE"
                />
                <circle cx="154" cy="54" r="13" fill="#F97316" />
                <path d="M154 54 L154 41 A13 13 0 0 1 167 54 Z" fill="#FDBA74" />
                <line
                  x1="172"
                  y1="48"
                  x2="188"
                  y2="48"
                  stroke="#64748B"
                  strokeWidth="1.5"
                />
                <line
                  x1="172"
                  y1="54"
                  x2="188"
                  y2="54"
                  stroke="#64748B"
                  strokeWidth="1.5"
                />

                {/* Right Mountain Image Floating Window */}
                <rect
                  x="408"
                  y="112"
                  width="74"
                  height="60"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#94A3B8"
                  strokeWidth="1"
                />
                <rect
                  x="408"
                  y="112"
                  width="74"
                  height="10"
                  fill="#C7D2FE"
                />
                <circle cx="436" cy="136" r="5" fill="#F59E0B" />
                <polygon
                  points="412,168 432,144 450,162 465,138 478,168"
                  fill="#F59E0B"
                />

                {/* Speech Bubble With 3 Dots */}
                <rect
                  x="365"
                  y="54"
                  width="42"
                  height="28"
                  rx="14"
                  fill="#FFFFFF"
                  stroke="#64748B"
                  strokeWidth="1.2"
                />
                <circle cx="378" cy="68" r="2.2" fill="#0F172A" />
                <circle cx="386" cy="68" r="2.2" fill="#0F172A" />
                <circle cx="394" cy="68" r="2.2" fill="#0F172A" />

                {/* Instructor Figure (Center-Right) */}
                <g>
                  {/* Blue Polo Shirt */}
                  <path
                    d="M270 142 C285 130, 340 130, 355 142 L372 192 L352 204 L345 182 L345 246 L285 246 L285 182 L275 200 L258 186 Z"
                    fill="#2563EB"
                  />
                  {/* Neck & Head */}
                  <rect
                    x="306"
                    y="112"
                    width="18"
                    height="24"
                    rx="6"
                    fill="#FBBF94"
                  />
                  <ellipse cx="315" cy="92" rx="21" ry="25" fill="#FBBF94" />
                  {/* Dark Hair */}
                  <path
                    d="M294 88 C290 66, 312 52, 332 62 C344 68, 342 86, 335 92 C330 78, 312 74, 294 88 Z"
                    fill="#0F172A"
                  />
                  {/* Left Arm Holding Open Book */}
                  <path
                    d="M268 188 L224 166 L218 178 L262 206 Z"
                    fill="#FBBF94"
                  />
                  {/* Right Arm Pointing */}
                  <path
                    d="M368 192 L344 214 L322 198 L314 208 L344 232 L378 204 Z"
                    fill="#FBBF94"
                  />
                </g>

                {/* Open Book Held by Instructor */}
                <g transform="rotate(-12 216 142)">
                  <rect
                    x="176"
                    y="114"
                    width="40"
                    height="52"
                    rx="2"
                    fill="#FFFFFF"
                    stroke="#475569"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="216"
                    y="114"
                    width="40"
                    height="52"
                    rx="2"
                    fill="#FFFFFF"
                    stroke="#475569"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="182"
                    y1="126"
                    x2="210"
                    y2="126"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="182"
                    y1="134"
                    x2="210"
                    y2="134"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="182"
                    y1="142"
                    x2="210"
                    y2="142"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="222"
                    y1="126"
                    x2="250"
                    y2="126"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="222"
                    y1="134"
                    x2="250"
                    y2="134"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="222"
                    y1="142"
                    x2="250"
                    y2="142"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                </g>

                {/* Stack of Books on Left */}
                <rect
                  x="104"
                  y="272"
                  width="116"
                  height="26"
                  rx="3"
                  fill="#CBD5E1"
                />
                <rect
                  x="110"
                  y="298"
                  width="116"
                  height="18"
                  rx="2"
                  fill="#EA580C"
                />
                <polygon
                  points="154,298 166,298 166,322 160,317 154,322"
                  fill="#B91C1C"
                />
                <rect
                  x="84"
                  y="316"
                  width="156"
                  height="22"
                  rx="3"
                  fill="#F59E0B"
                />
                <rect
                  x="98"
                  y="321"
                  width="128"
                  height="12"
                  fill="#FEF3C7"
                />
                <rect
                  x="96"
                  y="338"
                  width="148"
                  height="14"
                  rx="2"
                  fill="#16A34A"
                />

                {/* Student Sitting on Books With Headphones & Laptop */}
                <g>
                  {/* Yellow Shirt */}
                  <path
                    d="M100 198 C112 188, 148 188, 158 198 L168 242 L100 248 Z"
                    fill="#F59E0B"
                  />
                  {/* Head & Hair */}
                  <path
                    d="M108 164 C104 140, 148 140, 154 166 C158 182, 152 194, 144 194 L112 194 Z"
                    fill="#0F172A"
                  />
                  <circle cx="132" cy="168" r="14" fill="#DC2626" />
                  {/* Blue Headphones */}
                  <path
                    d="M118 166 A14 14 0 0 1 146 166"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  <ellipse cx="118" cy="168" rx="4" ry="7" fill="#3B82F6" />
                  {/* Blue Jeans */}
                  <path
                    d="M102 246 L208 232 L254 292 L236 306 L196 262 L152 274 L102 268 Z"
                    fill="#2563EB"
                  />
                  <path
                    d="M182 256 L228 256 L246 344 L224 344 L204 278 L162 276 Z"
                    fill="#1D4ED8"
                  />
                  {/* Dark Sneakers */}
                  <rect
                    x="248"
                    y="292"
                    width="42"
                    height="18"
                    rx="6"
                     transform="rotate(-18 248 292)"
                    fill="#0F172A"
                  />
                  <rect
                    x="224"
                    y="344"
                    width="44"
                    height="16"
                    rx="5"
                    fill="#0F172A"
                  />
                  {/* Laptop on Lap */}
                  <polygon
                    points="168,242 204,238 214,202 178,206"
                    fill="#0F172A"
                  />
                </g>

                {/* Globe & Books on Bottom Right */}
                <g>
                  <rect
                    x="362"
                    y="314"
                    width="126"
                    height="14"
                    rx="2"
                    fill="#CBD5E1"
                  />
                  <rect
                    x="384"
                    y="328"
                    width="94"
                    height="24"
                    rx="2"
                    fill="#EA580C"
                  />
                  <rect
                    x="368"
                    y="342"
                    width="118"
                    height="10"
                    rx="2"
                    fill="#F59E0B"
                  />
                  {/* Globe */}
                  <circle cx="436" cy="252" r="40" fill="#2563EB" />
                  <path
                    d="M412 224 C426 228, 434 242, 428 258 C422 272, 438 282, 456 276 C468 268, 472 246, 458 228 Z"
                    fill="#16A34A"
                  />
                  <path
                    d="M416 204 A48 48 0 0 1 456 298"
                    stroke="#1E293B"
                    strokeWidth="3"
                    fill="none"
                  />
                  <rect
                    x="418"
                    y="302"
                    width="36"
                    height="12"
                    rx="3"
                    fill="#1E293B"
                  />
                </g>

                {/* Baseline */}
                <line
                  x1="76"
                  y1="352"
                  x2="500"
                  y2="352"
                  stroke="#64748B"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. 3-STEP SECTION (media_1790713338398.png) ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-14">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="font-display text-3xl sm:text-[40px] font-extrabold text-[#24292D] leading-tight tracking-tight mb-4">
            You can be your guiding star with
            <br className="hidden sm:inline" /> our help
          </h2>
          <p className="text-[14.5px] text-[#747579] leading-relaxed">
            As it so contrasted oh estimating instrument. Size like body someone
            had. Are conduct viewing boy minutes warrant the expense? Tolerably
            behavior may admit daughters offending her ask own. Praise effect
            wishes change way and any wanted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {/* Step 1: Create Account */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-44 flex items-center justify-center">
              <svg viewBox="0 0 220 200" className="w-full h-full" fill="none">
                {/* Smartphone Frame */}
                <rect
                  x="88"
                  y="34"
                  width="68"
                  height="132"
                  rx="10"
                  fill="#334155"
                />
                <rect
                  x="93"
                  y="42"
                  width="58"
                  height="114"
                  rx="6"
                  fill="#FFFFFF"
                />
                {/* Form Lines Inside Phone */}
                <circle cx="122" cy="58" r="5" fill="#DC2626" />
                <rect
                  x="104"
                  y="74"
                  width="36"
                  height="6"
                  rx="2"
                  fill="#F1F5F9"
                />
                <rect
                  x="104"
                  y="88"
                  width="36"
                  height="6"
                  rx="2"
                  fill="#F1F5F9"
                />
                <rect
                  x="104"
                  y="102"
                  width="36"
                  height="6"
                  rx="2"
                  fill="#FEE2E2"
                />
                <rect
                  x="108"
                  y="126"
                  width="28"
                  height="10"
                  rx="3"
                  fill="#DC2626"
                />
                {/* Red Lock Badge */}
                <g transform="translate(142, 20) rotate(15)">
                  <rect
                    x="0"
                    y="10"
                    width="26"
                    height="22"
                    rx="4"
                    fill="#DC2626"
                  />
                  <path
                    d="M6 10 V6 A7 7 0 0 1 20 6 V10"
                    stroke="#DC2626"
                    strokeWidth="3"
                  />
                  <circle cx="13" cy="21" r="2.5" fill="#FFFFFF" />
                </g>
                {/* Person Standing Left of Phone */}
                <circle cx="76" cy="76" r="8" fill="#0F172A" />
                <path
                  d="M64 90 C68 84, 84 84, 88 90 L92 120 L62 120 Z"
                  fill="#EF4444"
                />
                <path
                  d="M66 120 L64 172 L72 172 L76 134 L82 172 L90 172 L86 120 Z"
                  fill="#1E293B"
                />
                <ellipse cx="110" cy="176" rx="56" ry="5" fill="#E2E8F0" />
              </svg>
            </div>
            <h3 className="font-display text-xl sm:text-[22px] font-extrabold text-[#24292D] mt-3 mb-2">
              Create Account
            </h3>
            <p className="text-[14px] text-[#747579] leading-relaxed max-w-xs">
              Satisfied conveying a dependent contented he gentleman agreeable
              do be. Delivered dejection necessary objection..
            </p>
          </div>

          {/* Step 2: Add your Course */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-44 flex items-center justify-center">
              <svg viewBox="0 0 220 200" className="w-full h-full" fill="none">
                {/* Soft Circle Backdrop */}
                <circle cx="114" cy="104" r="68" fill="#F1F5F9" />
                {/* Gears Top Left */}
                <circle
                  cx="62"
                  cy="54"
                  r="12"
                  stroke="#60A5FA"
                  strokeWidth="4"
                />
                <circle
                  cx="82"
                  cy="38"
                  r="6"
                  stroke="#60A5FA"
                  strokeWidth="3"
                />
                {/* Sticky Note Cards */}
                <rect
                  x="110"
                  y="56"
                  width="30"
                  height="32"
                  rx="2"
                  fill="#60A5FA"
                />
                <rect
                  x="146"
                  y="56"
                  width="30"
                  height="32"
                  rx="2"
                  fill="#E2E8F0"
                />
                <rect
                  x="96"
                  y="94"
                  width="30"
                  height="32"
                  rx="2"
                  fill="#60A5FA"
                />
                <rect
                  x="134"
                  y="94"
                  width="30"
                  height="32"
                  rx="2"
                  fill="#E2E8F0"
                />
                {/* Person With Blue Laptop */}
                <circle cx="82" cy="92" r="11" fill="#78350F" />
                <path
                  d="M60 114 C66 106, 98 106, 104 114 L108 164 L56 164 Z"
                  fill="#E2E8F0"
                />
                <polygon
                  points="92,138 134,138 128,166 86,166"
                  fill="#1D4ED8"
                />
                <line
                  x1="46"
                  y1="168"
                  x2="178"
                  y2="168"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl sm:text-[22px] font-extrabold text-[#24292D] mt-3 mb-2">
              Add your Course
            </h3>
            <p className="text-[14px] text-[#747579] leading-relaxed max-w-xs">
              Proceed how any engaged visitor. Explained propriety off out
              perpetual his you. Feel sold off felt nay rose met you...
            </p>
          </div>

          {/* Step 3: Start Earning Money */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-44 flex items-center justify-center">
              <svg viewBox="0 0 220 200" className="w-full h-full" fill="none">
                {/* Floating Green Banknotes */}
                <rect
                  x="52"
                  y="56"
                  width="20"
                  height="11"
                  rx="2"
                  transform="rotate(-15 52 56)"
                  fill="#86EFAC"
                />
                <rect
                  x="82"
                  y="32"
                  width="20"
                  height="11"
                  rx="2"
                  transform="rotate(20 82 32)"
                  fill="#86EFAC"
                />
                <rect
                  x="136"
                  y="44"
                  width="20"
                  height="11"
                  rx="2"
                  transform="rotate(-12 136 44)"
                  fill="#86EFAC"
                />
                <rect
                  x="156"
                  y="76"
                  width="20"
                  height="11"
                  rx="2"
                  transform="rotate(18 156 76)"
                  fill="#86EFAC"
                />
                <rect
                  x="64"
                  y="92"
                  width="20"
                  height="11"
                  rx="2"
                  transform="rotate(8 64 92)"
                  fill="#86EFAC"
                />
                {/* Instructor Celebrating */}
                <circle cx="114" cy="86" r="13" fill="#B45309" />
                <path
                  d="M102 78 C102 66, 124 66, 126 78 Z"
                  fill="#1E293B"
                />
                <path
                  d="M84 112 C94 102, 134 102, 144 112 L152 162 L76 162 Z"
                  fill="#86EFAC"
                />
                {/* Tie */}
                <polygon
                  points="112,106 116,106 118,144 114,150 110,144"
                  fill="#1E293B"
                />
                {/* Outstretched Arms */}
                <path
                  d="M84 128 L52 112 L48 120 L78 142 Z"
                  fill="#B45309"
                />
                <path
                  d="M144 128 L176 112 L180 120 L150 142 Z"
                  fill="#B45309"
                />
                {/* Stacks of Cash at Base */}
                <rect
                  x="64"
                  y="156"
                  width="28"
                  height="12"
                  fill="#1E293B"
                />
                <rect
                  x="132"
                  y="152"
                  width="32"
                  height="16"
                  fill="#4ADE80"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl sm:text-[22px] font-extrabold text-[#24292D] mt-3 mb-2">
              Start Earning Money
            </h3>
            <p className="text-[14px] text-[#747579] leading-relaxed max-w-xs">
              Insipidity the sufficient discretion imprudence resolution sir him
              decisively. Delivered dejection necessary objectio...
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 3. PEACH 4-STAT COUNTER BANNER (media_1790713338398.png) ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="relative bg-[#FFF0E5] rounded-xl py-10 px-6 sm:px-12 overflow-hidden">
          {/* Decorative Left Thin Orange Curve */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-full w-80"
            viewBox="0 0 320 160"
            fill="none"
          >
            <path
              d="M0 24 C120 40, 200 75, 285 160"
              stroke="#FD7E14"
              strokeWidth="1"
              strokeOpacity="0.55"
            />
          </svg>

          {/* Decorative Right Thick White Curve */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-full w-[460px]"
            viewBox="0 0 460 160"
            fill="none"
          >
            <path
              d="M35 0 C45 120, 250 115, 360 68 C415 45, 440 100, 455 160"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeOpacity="0.75"
            />
          </svg>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
            <div>
              <div className="font-display text-4xl sm:text-[50px] font-extrabold text-[#FD7E14] leading-none mb-2">
                89K
              </div>
              <div className="text-[14px] font-bold text-[#24292D]">
                Total Students
              </div>
            </div>

            <div>
              <div className="font-display text-4xl sm:text-[50px] font-extrabold text-[#FD7E14] leading-none mb-2">
                25K
              </div>
              <div className="text-[14px] font-bold text-[#24292D]">
                Total Instructors
              </div>
            </div>

            <div>
              <div className="font-display text-4xl sm:text-[50px] font-extrabold text-[#FD7E14] leading-none mb-2">
                180K
              </div>
              <div className="text-[14px] font-bold text-[#24292D]">
                Total Courses
              </div>
            </div>

            <div>
              <div className="font-display text-4xl sm:text-[50px] font-extrabold text-[#FD7E14] leading-none mb-2">
                20+
              </div>
              <div className="text-[14px] font-bold text-[#24292D]">
                Languages
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. FORM + HOW TO BECOME AN INSTRUCTOR (media_1790713361165.png) ==================== */}
      <section
        id="apply-instructor-form"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column (5 Cols): Form Card + Yellow Hand-Drawn Looped Arrow */}
          <div className="lg:col-span-5 relative">
            {/* Hand-Drawn Yellow Looped Arrow Pointing to Form Title */}
            <svg
              aria-hidden="true"
              className="pointer-events-none hidden sm:block absolute -top-5 right-6 w-36 h-24 z-20"
              viewBox="0 0 160 105"
              fill="none"
            >
              <path
                d="M152 12 C118 2, 76 18, 86 42 C94 58, 122 54, 114 36 C106 18, 56 32, 16 82"
                stroke="#F7C32E"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M14 66 L14 85 L32 78"
                stroke="#F7C32E"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(29,58,83,0.08)] border border-slate-100 p-6 sm:p-8">
              <h2 className="font-display text-2xl sm:text-[30px] font-extrabold text-[#24292D] mb-6">
                Please fill this form
              </h2>

              {submitted && (
                <div className="mb-5 rounded-lg bg-[#E6F8F3] border border-[#0CBC87]/30 px-4 py-3 flex items-center justify-between text-xs font-bold text-[#0CBC87]">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Application submitted! Our faculty team will contact you.
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#24292D] focus:outline-none focus:border-[#066AC9]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#24292D] focus:outline-none focus:border-[#066AC9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                    Phone number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#24292D] focus:outline-none focus:border-[#066AC9]"
                  />
                </div>

                <div>
                  <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                    Add Summary *
                  </label>
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Enter something..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#24292D] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#066AC9] hover:bg-[#0556A5] text-white text-[14px] font-bold transition-colors cursor-pointer"
                  >
                    Submit form
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column (7 Cols): How to become an Instructor? + 3 Tabs */}
          <div className="lg:col-span-7 space-y-6 pt-2">
            <h2 className="font-display text-2xl sm:text-[34px] font-extrabold text-[#24292D] tracking-tight">
              How to become an Instructor?
            </h2>

            {/* 3 Tab Pills */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                { id: "become", label: "Become an Instructor" },
                { id: "role", label: "Instructor Role" },
                { id: "start", label: "Start with Course" },
              ].map((tab) => {
                const isActive = activeGuideTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveGuideTab(tab.id as "become" | "role" | "start")
                    }
                    className={`px-5 py-2.5 rounded-lg text-[14px] transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#066AC9] text-white font-bold"
                        : "bg-[#E8F1FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white font-semibold"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content Body */}
            <div className="space-y-4 pt-1">
              <h3 className="font-display text-[17px] font-extrabold text-[#24292D]">
                {activeGuideTab === "become"
                  ? "Become an Instructor"
                  : activeGuideTab === "role"
                    ? "Instructor Role"
                    : "Start with Course"}
              </h3>

              <p className="text-[14.5px] text-[#747579] leading-relaxed">
                As it so contrasted oh estimating instrument. Size like body
                someone had. Are conduct viewing boy minutes warrant the
                expense? Tolerably behavior may admit daughters offending her
                ask own. Praise effect wishes change way and any wanted. Lively
                use looked latter regard had. Do he it part more last in. Merits
                ye if Mr narrow points. Melancholy particular Devonshire
                alteration it favorable appearance up.
              </p>

              <p className="text-[14.5px] text-[#747579] leading-relaxed">
                Size like body someone had. Are conduct viewing boy minutes
                warrant the expense? Tolerably behavior may admit daughters
                offending her ask own. Praise effect wishes change way and any
                wanted. Lively use looked latter regard had. Do he it part more
                last in. Merits ye if Mr narrow points. Melancholy particular
                Devonshire alteration it favorable appearance up.
              </p>

              <p className="text-[14.5px] text-[#747579] leading-relaxed">
                Are conduct viewing boy minutes warrant the expense? Tolerably
                behavior may admit daughters offending her ask own. Praise
                effect wishes change way and any wanted. Lively use looked
                latter regard had. Do he it part more last in. Merits ye if Mr
                narrow points. Melancholy particular Devonshire alteration it
                favorable appearance up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. DARK CHARCOAL CTA BANNER (media_1790713361176.png) ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="relative bg-[#24292D] rounded-xl px-8 py-12 sm:px-14 sm:py-14 text-white overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Decorative Translucent Gray Circles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-white/8"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[40%] top-5 w-4 h-4 rounded-full bg-white/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[51%] bottom-10 w-5 h-5 rounded-full bg-white/20"
          />

          <div className="max-w-2xl relative z-10">
            <h2 className="font-display text-2xl sm:text-[32px] font-extrabold text-white mb-2">
              Become an Instructor!
            </h2>
            <p className="text-[14px] text-white/85 leading-relaxed">
              Speedily say has suitable disposal add boy. On forth doubt miles
              of child. Exercise joy man children rejoiced. Yet uncommonly his
              ten who diminution astonished.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <a
              href="#apply-instructor-form"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-white hover:bg-slate-100 text-[#24292D] font-bold text-[14px] transition-colors shadow-sm"
            >
              Start Teaching today
            </a>
          </div>
        </div>
      </section>

      {/* 6. Full Eduport Footer */}
      <Footer />

      {/* Scroll-to-Top Floating Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-lg bg-[#DCE9F8] hover:bg-[#066AC9] text-[#066AC9] hover:text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  );
}
