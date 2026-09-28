"use client";

import React from "react";
import Link from "next/link";
import { SpatialBackground } from "./SpatialBackground";
import { Tilt3DCard } from "./Tilt3DCard";
import {
  BrainCircuit,
  Bot,
  Code2,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  QrCode
} from "lucide-react";

const SAMPLE_MASTERY = [
  { name: "Next.js App Router & Server Actions", score: 94, color: "from-emerald-400 to-teal-500" },
  { name: "RAG Vector Embeddings & Prompting", score: 88, color: "from-purple-400 to-indigo-500" },
  { name: "Zero-Trust Network Hardening", score: 79, color: "from-sky-400 to-blue-500" }
];

export function EcosystemBento4D() {
  return (
    <section className="relative overflow-hidden bg-[#0B081D] text-white py-20 md:py-28 border-b border-white/10">
      {/* 4D Cosmic Hypercube & Neural Wave Canvas */}
      <SpatialBackground variant="dark" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-purple-400/30 px-4 py-1.5 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-200">
              4D INTERACTIVE LEARNING ARCHITECTURE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Not Just Video Lectures.{" "}
            <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">
              A Living Tech Ecosystem.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#B6B0D4] leading-relaxed">
            Move your cursor across any module below. Every BEMS student gets an adaptive concept-mastery engine, a course-grounded AI tutor, an interactive code sandbox, and cryptographically verifiable credentials.
          </p>
        </div>

        {/* 4D Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: LearnIQ Adaptive Engine (7 columns) */}
          <div className="lg:col-span-7">
            <Tilt3DCard
              dark
              maxTilt={8}
              glowColor="rgba(168, 85, 247, 0.26)"
              className="h-full rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/12 p-7 sm:p-8 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div
                  style={{ transform: "translateZ(20px)" }}
                  className="flex items-center justify-between gap-4 mb-5"
                >
                  <div className="inline-flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                      <BrainCircuit className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
                        Personalization Loop
                      </span>
                      <h3 className="text-xl font-black text-white">
                        LearnIQ™ Concept Mastery Engine
                      </h3>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-200 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <span>Open Dashboard</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-sm text-[#B6B0D4] leading-relaxed mb-6">
                  Every quiz answer and lesson completion updates your per-concept mastery graph in real time—identifying blind spots and generating one-off targeted practice questions on the fly.
                </p>
              </div>

              {/* 3D Elevated Telemetry Preview */}
              <div
                style={{ transform: "translateZ(32px)" }}
                className="rounded-2xl bg-[#120E2E]/90 border border-purple-400/25 p-4 sm:p-5 space-y-3.5 shadow-xl"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Live Concept Telemetry
                  </span>
                  <span className="text-[11px] text-emerald-300 font-semibold">
                    Calibrated from real attempts
                  </span>
                </div>
                {SAMPLE_MASTERY.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/90 font-medium">{item.name}</span>
                      <span className="font-mono font-bold text-purple-200">{item.score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${item.score}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Tilt3DCard>
          </div>

          {/* Card 2: 24/7 Course-RAG AI Tutor (5 columns) */}
          <div className="lg:col-span-5">
            <Tilt3DCard
              dark
              maxTilt={9}
              glowColor="rgba(59, 130, 246, 0.28)"
              className="h-full rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/12 p-7 sm:p-8 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div
                  style={{ transform: "translateZ(20px)" }}
                  className="flex items-center justify-between gap-4 mb-5"
                >
                  <div className="inline-flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-sky-300" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block">
                        Gemini-Powered Assistant
                      </span>
                      <h3 className="text-xl font-black text-white">24/7 Course-RAG AI Tutor</h3>
                    </div>
                  </div>
                  <Link
                    href="/ai"
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-200 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <span>Ask AI</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-sm text-[#B6B0D4] leading-relaxed mb-6">
                  Grounded directly in BEMS syllabi, Nigerian fintech case studies, and your active track—so you never get stuck debugging at 2 AM.
                </p>
              </div>

              {/* 3D Elevated Chat Preview */}
              <div
                style={{ transform: "translateZ(30px)" }}
                className="rounded-2xl bg-[#120E2E]/90 border border-sky-400/25 p-4 space-y-3 shadow-xl text-xs"
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-[#D5D0EE]">
                  <span className="text-[10px] font-bold text-sky-300 uppercase block mb-0.5">
                    Student Prompt
                  </span>
                  “How do I verify a Paystack webhook signature in Next.js App Router?”
                </div>
                <div className="bg-gradient-to-r from-purple-950/80 to-sky-950/80 border border-purple-400/30 rounded-xl p-2.5 text-purple-100">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase block mb-0.5">
                    BEMS AI Tutor · Cited from Module 3
                  </span>
                  Compute an HMAC SHA-512 digest of the raw request body using{" "}
                  <code className="text-sky-300 font-mono">x-paystack-signature</code>...
                </div>
              </div>
            </Tilt3DCard>
          </div>

          {/* Card 3: Interactive Cloud Code Sandbox (5 columns) */}
          <div className="lg:col-span-5">
            <Tilt3DCard
              dark
              maxTilt={9}
              glowColor="rgba(16, 185, 129, 0.25)"
              className="h-full rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/12 p-7 sm:p-8 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div
                  style={{ transform: "translateZ(20px)" }}
                  className="flex items-center justify-between gap-4 mb-5"
                >
                  <div className="inline-flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                        Zero-Setup Execution
                      </span>
                      <h3 className="text-xl font-black text-white">Interactive Code Sandbox</h3>
                    </div>
                  </div>
                  <Link
                    href="/sandbox"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-200 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <span>Launch Lab</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-sm text-[#B6B0D4] leading-relaxed mb-6">
                  Write, preview, and test HTML/CSS/JS and algorithmic solutions directly inside your browser alongside live Umuahia physical lab sessions.
                </p>
              </div>

              <div
                style={{ transform: "translateZ(28px)" }}
                className="rounded-2xl bg-[#090714] border border-emerald-400/25 p-4 font-mono text-xs text-emerald-300 shadow-xl"
              >
                <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="text-[10px] text-white/50 ml-2">bems-sandbox — live-runner.ts</span>
                </div>
                <p className="text-purple-300">
                  const <span className="text-sky-300">cohort</span> = await BEMS.deployCapstone();
                </p>
                <p className="text-emerald-300 mt-1">
                  ✓ Build succeeded · Ready for Instructor Review
                </p>
              </div>
            </Tilt3DCard>
          </div>

          {/* Card 4: Employer-Verifiable QR Certificates & Attribution (7 columns) */}
          <div className="lg:col-span-7">
            <Tilt3DCard
              dark
              maxTilt={8}
              glowColor="rgba(245, 158, 11, 0.24)"
              className="h-full rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/12 p-7 sm:p-8 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div
                  style={{ transform: "translateZ(20px)" }}
                  className="flex items-center justify-between gap-4 mb-5"
                >
                  <div className="inline-flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                        Instant Employer Verification
                      </span>
                      <h3 className="text-xl font-black text-white">
                        QR-Verified Credentials & Campus Attribution
                      </h3>
                    </div>
                  </div>
                  <Link
                    href="/qr-studio"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-200 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <span>QR Studio</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-sm text-[#B6B0D4] leading-relaxed mb-6">
                  Once your instructor approves your final capstone project, BEMS issues a tamper-proof certificate with a scannable QR verification URL that employers anywhere in the world can audit in one click.
                </p>
              </div>

              <div
                style={{ transform: "translateZ(30px)" }}
                className="rounded-2xl bg-gradient-to-r from-[#171236] via-[#1E1646] to-[#291B5C] border border-amber-300/25 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                    <QrCode className="w-9 h-9 text-[#18143D]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 block">
                      CREDENTIAL ID · BEMS-CERT-2026-WD
                    </span>
                    <h4 className="text-sm font-extrabold text-white">
                      Distinction Grade · Capstone & Repo Verified
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-emerald-300">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Live GitHub Audit
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Instructor Signed
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/leaderboard"
                  className="text-xs font-bold text-amber-200 hover:text-white underline shrink-0"
                >
                  View Cohort Leaderboard →
                </Link>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </div>
    </section>
  );
}
