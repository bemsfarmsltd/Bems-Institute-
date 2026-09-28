"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SpatialBackground } from "./SpatialBackground";
import { Tilt3DCard } from "./Tilt3DCard";
import {
  Briefcase,
  ShieldCheck,
  Wallet,
  Users,
  Sparkles,
  QrCode,
  MessageCircle,
  BrainCircuit,
  Activity,
  Terminal
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAF8FF] to-[#F3EEFF] py-16 md:py-24 border-b border-[#E6E1F5]">
      {/* Interactive 4D Spatial Background (Rotating 4D Tesseract + 3D Neural Wave) */}
      <SpatialBackground variant="light" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-[#7928CA]/25 px-4 py-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7928CA] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7928CA]" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#7928CA] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ASPIRE · LEARN · SUCCEED · LEARNIQ™ 4D ENGINE
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#18143D] tracking-tight leading-[1.1] mb-6">
              Learn in Umuahia, <br />
              <span className="bg-gradient-to-r from-[#7928CA] via-[#5B21B6] to-[#2563EB] bg-clip-text text-transparent">
                Earn Anywhere.
              </span>
            </h1>

            <p className="text-lg text-[#565074] leading-relaxed mb-8 max-w-2xl">
              The <strong className="text-[#18143D]">BEMS FutureSkills Accelerator</strong> combines physical innovation labs with our adaptive <strong className="text-[#7928CA]">LearnIQ™</strong> mastery engine, 24/7 AI tutoring, and employer-verifiable capstone credentials.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link href="/subscriptions">
                <Button
                  size="lg"
                  className="gap-2 shadow-lg shadow-[#7928CA]/25 hover:shadow-xl hover:shadow-[#7928CA]/35 transition-all"
                >
                  <span>Apply for October Cohort</span>
                </Button>
              </Link>
              <Link href="#courses">
                <Button variant="outline" size="lg" className="bg-white/80 backdrop-blur-md">
                  Explore 4 Tracks
                </Button>
              </Link>
              <Link
                href="/sandbox"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-[#18143D] hover:text-[#7928CA] px-3.5 py-2.5 rounded-xl bg-white/70 border border-[#E6E1F5] backdrop-blur-md transition-colors"
              >
                <Terminal className="w-4 h-4 text-[#7928CA]" />
                <span>Try Interactive Code Lab →</span>
              </Link>
            </div>

            <div className="pt-6 border-t border-[#E6E1F5]/90 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-sm font-semibold text-[#18143D]">
              <div className="flex items-center gap-2.5 bg-white/75 backdrop-blur-md border border-[#E6E1F5] rounded-2xl px-3.5 py-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#7928CA]" />
                </div>
                <span>Verified QR Certificate</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/75 backdrop-blur-md border border-[#E6E1F5] rounded-2xl px-3.5 py-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5] flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-[#7928CA]" />
                </div>
                <span>Direct Job Pathways</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/75 backdrop-blur-md border border-[#E6E1F5] rounded-2xl px-3.5 py-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5] flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-[#7928CA]" />
                </div>
                <span>Pay in 3 Installments</span>
              </div>
            </div>
          </div>

          {/* Hero Right 4D Spatial Stack */}
          <div className="lg:col-span-5 perspective-1500 relative">
            {/* Orbital Floating 4D Chip Top-Right */}
            <div className="animate-float-4d hidden sm:flex items-center gap-2.5 absolute -top-5 -right-3 z-30 bg-[#18143D] text-white px-3.5 py-2 rounded-2xl shadow-xl border border-purple-400/30 pointer-events-none">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#7928CA] to-[#3B82F6] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-purple-200 font-bold block leading-none">
                  LearnIQ™ Telemetry
                </span>
                <span className="text-xs font-extrabold text-white">
                  Real-Time Concept Mastery
                </span>
              </div>
            </div>

            {/* Orbital Floating 4D Chip Bottom-Left */}
            <div className="animate-float-4d-reverse hidden sm:flex items-center gap-2.5 absolute -bottom-5 -left-4 z-30 bg-white/95 backdrop-blur-md text-[#18143D] px-3.5 py-2 rounded-2xl shadow-xl border border-[#7928CA]/25 pointer-events-none">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#645F80] font-bold block leading-none">
                  Live Hybrid Campus
                </span>
                <span className="text-xs font-extrabold text-[#18143D]">
                  Umuahia Hub + Cloud Sandbox
                </span>
              </div>
            </div>

            <Tilt3DCard
              maxTilt={10}
              glowColor="rgba(121, 40, 202, 0.18)"
              className="bg-white/90 backdrop-blur-xl border border-[#DED6F7] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#18143D]/10"
            >
              <div
                style={{ transform: "translateZ(22px)" }}
                className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6E1F5]"
              >
                <div>
                  <span className="text-xs font-semibold text-[#645F80] uppercase tracking-wide">
                    Cohort 1 Admissions
                  </span>
                  <h3 className="text-xl font-black text-[#18143D]">October 2026 Batch</h3>
                </div>
                <Badge variant="gold" className="flex items-center gap-1 shadow-xs">
                  <Users className="w-3.5 h-3.5" /> 80 Seats Only
                </Badge>
              </div>

              <div
                style={{ transform: "translateZ(28px)" }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <div className="bg-gradient-to-br from-[#FAF8FF] to-white border border-[#7928CA]/20 rounded-2xl p-4 text-center shadow-xs">
                  <span className="text-2xl font-black text-[#18143D] block">3 Months</span>
                  <span className="text-xs font-bold text-[#7928CA] uppercase">Hands-On Labs</span>
                </div>
                <div className="bg-gradient-to-br from-[#FAF8FF] to-white border border-[#7928CA]/20 rounded-2xl p-4 text-center shadow-xs">
                  <span className="text-2xl font-black text-[#18143D] block">70% Target</span>
                  <span className="text-xs font-bold text-[#7928CA] uppercase">
                    Finish & Get Hired
                  </span>
                </div>
              </div>

              {/* 3D Elevated Banner QR Callout */}
              <div
                style={{ transform: "translateZ(34px)" }}
                className="bg-gradient-to-r from-[#18143D] via-[#22184F] to-[#3B197A] text-white rounded-2xl p-4 flex items-center gap-4 mb-5 shadow-lg border border-white/10"
              >
                <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center shadow-md">
                  <QrCode className="w-12 h-12 text-[#18143D]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-snug">Roll-Up Banner & Handbill QR</h4>
                  <p className="text-xs text-[#C4BEE2] mt-0.5">
                    Scan at the BEMS Hub, MOUAU, or LGA to register on the spot.
                  </p>
                  <Link
                    href="/qr-studio"
                    className="text-xs font-bold text-[#E9D5FF] hover:text-white hover:underline mt-1 inline-block"
                  >
                    Open Banner QR Studio →
                  </Link>
                </div>
              </div>

              <div style={{ transform: "translateZ(20px)" }}>
                <Link href="/subscriptions" className="block w-full">
                  <Button variant="whatsapp" className="w-full gap-2 py-3 shadow-md">
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp Onboarding</span>
                  </Button>
                </Link>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </div>
    </section>
  );
}
