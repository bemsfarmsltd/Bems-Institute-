"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Sparkles,
  CreditCard,
  Building2,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  BookOpen,
  PlayCircle
} from "lucide-react";
import { mockSubscriptionTiers } from "@/data/advanced-data";
import { SubscriptionTier } from "@/types/advanced";

function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const courseQuery = searchParams.get("course");
  const sourceQuery = searchParams.get("source");
  const { courses, enrollInCourse, isEnrolled } = useLMS();

  const [tiers] = useState<SubscriptionTier[]>(mockSubscriptionTiers);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseQuery || "web-dev");
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PAYSTACK" | "BANK">("PAYSTACK");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedEnrollment, setConfirmedEnrollment] = useState<{
    tierName: string;
    amount: number;
    courseTitle: string;
    courseSlug: string;
    firstLessonId: string;
  } | null>(null);

  useEffect(() => {
    if (courseQuery && courses.some((c) => c.id === courseQuery || c.slug === courseQuery)) {
      const matched = courses.find((c) => c.id === courseQuery || c.slug === courseQuery);
      if (matched) setSelectedCourseId(matched.id);
    }
  }, [courseQuery, courses]);

  // Logs the banner/QR landing regardless of whether it converts, so the
  // admin analytics dashboard can compute real scan-to-registration yield
  // per source (see bannerChannelYield in /api/admin/analytics). Only fires
  // for tagged landings — plain in-site navigation to this page has no
  // `source` param and isn't a banner scan.
  const scanTracked = useRef(false);
  useEffect(() => {
    if (!sourceQuery || scanTracked.current) return;
    scanTracked.current = true;
    fetch("/api/lms/track-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: sourceQuery, courseId: courseQuery || null })
    }).catch(() => {
      // best-effort — a lost scan log shouldn't block the visitor
    });
  }, [sourceQuery, courseQuery]);

  const selectedCourse =
    courses.find((c) => c.id === selectedCourseId || c.slug === selectedCourseId) || courses[0];

  const handleSelectPlan = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedTier) return;
    setIsProcessing(true);
    try {
      if (selectedCourse) {
        await enrollInCourse(selectedCourse.id, {
          source: sourceQuery || undefined,
          paymentMethod: paymentMethod === "PAYSTACK" ? "paystack" : "bank"
        });
      }
      const firstLessonId = selectedCourse?.modules[0]?.lessons[0]?.id || "les-1";
      setConfirmedEnrollment({
        tierName: selectedTier.name,
        amount: selectedTier.priceNaira,
        courseTitle: selectedCourse?.title || "Full-Stack Web Development",
        courseSlug: selectedCourse?.slug || "web-development",
        firstLessonId
      });
      setShowPaymentModal(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#18143D] text-white py-14 border-b border-white/10 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge variant="purple">OCTOBER 2026 COHORT</Badge>
            <Badge variant="gold">FLEXIBLE TUITION</Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Invest in High-Income Tech Skills
          </h1>
          <p className="text-sm sm:text-base text-[#A5A0C8] max-w-2xl mx-auto leading-relaxed">
            Choose your primary accelerator track and select the full 3-month cohort plan, the monthly All-Access Pass across all 4 tracks, or ongoing Alumni Mastermind support.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-10">
        {/* Inline Confirmation Banner */}
        {confirmedEnrollment && (
          <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-50/90 p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Enrollment Confirmed · ₦{confirmedEnrollment.amount.toLocaleString()} ({confirmedEnrollment.tierName})</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#18143D]">
                You&apos;re enrolled in {confirmedEnrollment.courseTitle}!
              </h2>
              <p className="text-xs sm:text-sm text-[#4A4568]">
                Your classroom modules, interactive assessments, and AI Tutor context are now unlocked.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href={`/learn/${confirmedEnrollment.courseSlug}/${confirmedEnrollment.firstLessonId}`}>
                <Button variant="purple" className="gap-2 text-xs font-bold">
                  <PlayCircle className="w-4 h-4" />
                  <span>Start First Lesson</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="text-xs font-bold">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Course Track Selector */}
        {courses.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E6E1F5] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7928CA] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Step 1: Choose Your Primary Accelerator Track
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#18143D] mt-0.5">
                  {selectedCourse ? selectedCourse.title : "Select a Course Track"}
                </h2>
              </div>
              {selectedCourse && isEnrolled(selectedCourse.id) && (
                <Link
                  href={`/learn/${selectedCourse.slug}/${selectedCourse.modules[0]?.lessons[0]?.id || "les-1"}`}
                >
                  <Badge variant="purple" className="cursor-pointer py-1.5 px-3">
                    Already Enrolled · Continue Classroom →
                  </Badge>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {courses.map((course) => {
                const active = selectedCourse?.id === course.id;
                const enrolled = isEnrolled(course.id);
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      active
                        ? "border-2 border-[#7928CA] bg-[#FAF8FF] shadow-sm"
                        : "border-[#E6E1F5] bg-white hover:border-[#7928CA]/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7928CA]">
                          {course.duration}
                        </span>
                        {enrolled && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Enrolled
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-extrabold text-[#18143D] line-clamp-2">
                        {course.title}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#645F80]">
                      Lead: <strong className="text-[#18143D]">{course.tutor}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                tier.isPopular
                  ? "bg-white border-2 border-[#7928CA] shadow-2xl ring-4 ring-[#7928CA]/10 -translate-y-2"
                  : "bg-white border border-[#E6E1F5] shadow-xs hover:border-[#7928CA]/40"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-[#7928CA] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-black text-[#18143D]">{tier.name}</h3>
                  <p className="text-xs text-[#645F80] mt-1">{tier.description}</p>
                </div>

                <div className="py-4 border-y border-[#F0EDF9] mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#18143D]">
                      ₦{tier.priceNaira.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#8580A3] font-bold">
                      / {tier.billingPeriod}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645F80] block">
                    What&apos;s Included:
                  </span>
                  {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#4A4568]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  onClick={() => handleSelectPlan(tier)}
                  variant={tier.isPopular ? "purple" : "outline"}
                  className="w-full py-3 text-xs font-bold shadow-xs"
                >
                  {tier.ctaText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="bg-white rounded-3xl border border-[#E6E1F5] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-[#18143D] text-base">
                100% Practical &amp; Verified Certification Guarantee
              </h4>
              <p className="text-xs text-[#645F80]">
                Every student deploys real working projects, guided by senior engineers in Umuahia physical labs and online.
              </p>
            </div>
          </div>

          <a
            href="https://chat.whatsapp.com/BEMS-FutureSkills-2026"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" className="text-xs border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
              <MessageCircle className="w-4 h-4 mr-1.5" /> Speak with Admission Team
            </Button>
          </a>
        </div>
      </div>

      {/* Checkout Modal */}
      {showPaymentModal && selectedTier && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E6E1F5] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EDF9]">
              <h3 className="text-lg font-black text-[#18143D]">
                Confirm Subscription / Enrollment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-[#8580A3] hover:text-[#18143D] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E6E1F5] mb-4 text-xs space-y-1.5">
              {selectedCourse && (
                <div className="flex justify-between">
                  <span className="text-[#645F80]">Selected Track:</span>
                  <strong className="text-[#7928CA]">{selectedCourse.title}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#645F80]">Selected Plan:</span>
                <strong className="text-[#18143D]">{selectedTier.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#645F80]">Tuition Amount:</span>
                <strong className="text-emerald-700 text-sm">
                  ₦{selectedTier.priceNaira.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-[#645F80] block">
                Select Payment Method:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PAYSTACK")}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === "PAYSTACK"
                      ? "border-[#7928CA] bg-purple-50 text-[#7928CA]"
                      : "border-[#E6E1F5] text-[#645F80]"
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Paystack Inline
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK")}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === "BANK"
                      ? "border-[#7928CA] bg-purple-50 text-[#7928CA]"
                      : "border-[#E6E1F5] text-[#645F80]"
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Bank Transfer
                </button>
              </div>
            </div>

            {paymentMethod === "BANK" ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 mb-6 space-y-1">
                <strong className="block font-bold">Zenith Bank Plc</strong>
                <div>Account Name: BEMS Institute of Technology Ltd</div>
                <div>Account Number: <code className="font-mono font-bold text-sm">1012345678</code></div>
                <div className="text-[10px] text-amber-800 pt-1">
                  Once transfer is made, click below to activate your student portal immediately.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 mb-6">
                Pay instantly via Debit Card, USSD, or Bank Transfer using Paystack secure gateway.
              </div>
            )}

            <Button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              variant="purple"
              className="w-full py-3 shadow-md text-xs font-bold"
            >
              {isProcessing
                ? "Activating Enrollment..."
                : `Confirm & Enroll (₦${selectedTier.priceNaira.toLocaleString()})`}
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
          Loading subscription plans…
        </div>
      }
    >
      <SubscriptionsContent />
    </Suspense>
  );
}


