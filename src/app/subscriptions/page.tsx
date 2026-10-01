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
  CreditCard,
  Building2,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  BookOpen,
  PlayCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";

type PaymentPlan = "full" | "installment";
import { readAttributionParam, persistAttribution, getStoredAttribution } from "@/lib/attribution";

function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const courseQuery = searchParams.get("course");
  // Reads either ?source= (old flyer links) or ?utm_source= (current QR
  // Studio convention). Outdoor banners land on the homepage first, not
  // here — AttributionCapture logs and persists those — so when there's no
  // param on THIS page load, fall back to what was persisted there instead
  // of losing the attribution.
  const sourceParam = readAttributionParam(searchParams);
  const { courses, enrollInCourse, isEnrolled } = useLMS();
  const [effectiveSource, setEffectiveSource] = useState<string | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseQuery || "web-dev");
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PAYSTACK" | "BANK">("PAYSTACK");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedEnrollment, setConfirmedEnrollment] = useState<{
    planLabel: string;
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

  useEffect(() => {
    if (sourceParam) {
      persistAttribution(sourceParam);
      setEffectiveSource(sourceParam);
    } else {
      setEffectiveSource(getStoredAttribution());
    }
  }, [sourceParam]);

  // Logs the banner/QR landing regardless of whether it converts, so the
  // admin analytics dashboard can compute real scan-to-registration yield
  // per source (see bannerChannelYield in /api/admin/analytics). Only fires
  // for a FRESH param on this exact page load — a scan carried forward from
  // the homepage (via AttributionCapture) was already logged there.
  const scanTracked = useRef(false);
  useEffect(() => {
    if (!sourceParam || scanTracked.current) return;
    scanTracked.current = true;
    apiFetch("/api/lms/track-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: sourceParam, courseId: courseQuery || null })
    }).catch(() => {
      // best-effort — a lost scan log shouldn't block the visitor
    });
  }, [sourceParam, courseQuery]);

  const selectedCourse =
    courses.find((c) => c.id === selectedCourseId || c.slug === selectedCourseId) || courses[0];

  const planAmount = (plan: PaymentPlan) =>
    selectedCourse ? (plan === "full" ? selectedCourse.priceFull : selectedCourse.priceParts) : 0;
  const planLabel = (plan: PaymentPlan) => (plan === "full" ? "Pay in Full" : "Pay in 3 Parts");

  const handleSelectPlan = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    try {
      if (selectedCourse) {
        await enrollInCourse(selectedCourse.id, {
          source: effectiveSource || undefined,
          paymentMethod: paymentMethod === "PAYSTACK" ? "paystack" : "bank",
          paymentPlan: selectedPlan
        });
      }
      const firstLessonId = selectedCourse?.modules[0]?.lessons[0]?.id || "les-1";
      setConfirmedEnrollment({
        planLabel: planLabel(selectedPlan),
        amount: planAmount(selectedPlan),
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
      <div className="bg-[#303654] text-white py-14 border-b border-white/10 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge variant="purple">OCTOBER 2026 COHORT</Badge>
            <Badge variant="gold">FLEXIBLE TUITION</Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Invest in High-Income Tech Skills
          </h1>
          <p className="text-sm sm:text-base text-[#C6BDD3] max-w-2xl mx-auto leading-relaxed">
            Choose your track, then pay in full for 12% off or spread it across 3 parts — no one has to find it all at once.
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
                <span>Enrollment Confirmed · ₦{confirmedEnrollment.amount.toLocaleString()} ({confirmedEnrollment.planLabel})</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#303654]">
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
          <div className="bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#AE54C6] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Step 1: Choose Your Primary Accelerator Track
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#303654] mt-0.5">
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
                        ? "border-2 border-[#AE54C6] bg-[#FAF8FF] shadow-sm"
                        : "border-[#F1E2F5] bg-white hover:border-[#AE54C6]/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#AE54C6]">
                          {course.duration}
                        </span>
                        {enrolled && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Enrolled
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-extrabold text-[#303654] line-clamp-2">
                        {course.title}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#645F80]">
                      Lead: <strong className="text-[#303654]">{course.tutor}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Plan Cards — two ways to pay, per course (PRD §3.1) */}
        {selectedCourse && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative bg-white border-2 border-[#AE54C6] shadow-2xl ring-4 ring-[#AE54C6]/10 -translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full bg-[#AE54C6] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                  Save 12%
                </span>
              </div>

              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-black text-[#303654]">Pay in Full</h3>
                  <p className="text-xs text-[#645F80] mt-1">
                    One-time payment for {selectedCourse.title}. Cash upfront, rewards paying early.
                  </p>
                </div>

                <div className="py-4 border-y border-[#F7EDF9] mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#303654]">
                      ₦{selectedCourse.priceFull.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#8580A3] font-bold">one-time</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645F80] block">
                    What&apos;s Included:
                  </span>
                  {[
                    `Full access to ${selectedCourse.title} — all lessons, quizzes & the final capstone`,
                    "Cheapest way to pay — save vs. the 3-part plan",
                    "BEMS Verified Certificate with QR verification on completion"
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-xs text-[#4A4568]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  onClick={() => handleSelectPlan("full")}
                  variant="purple"
                  className="w-full py-3 text-xs font-bold shadow-xs"
                >
                  Pay ₦{selectedCourse.priceFull.toLocaleString()} in Full
                </Button>
              </div>
            </div>

            <div className="rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative bg-white border border-[#F1E2F5] shadow-xs hover:border-[#AE54C6]/40">
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-black text-[#303654]">Pay in 3 Parts</h3>
                  <p className="text-xs text-[#645F80] mt-1">
                    No one has to find it all at once — start today, spread the rest across the cohort.
                  </p>
                </div>

                <div className="py-4 border-y border-[#F7EDF9] mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#303654]">
                      ₦{selectedCourse.priceParts.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#8580A3] font-bold">total, in 3 parts</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645F80] block">
                    What&apos;s Included:
                  </span>
                  {[
                    `Start today with just ₦${selectedCourse.deposit.toLocaleString()} deposit`,
                    "Same full course access and same certificate as paying in full",
                    "2 more installments across the 3-month cohort"
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-xs text-[#4A4568]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  onClick={() => handleSelectPlan("installment")}
                  variant="outline"
                  className="w-full py-3 text-xs font-bold shadow-xs"
                >
                  Start with ₦{selectedCourse.deposit.toLocaleString()} Deposit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Guarantee Banner */}
        <div className="bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-[#303654] text-base">
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
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#F1E2F5] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F7EDF9]">
              <h3 className="text-lg font-black text-[#303654]">
                Confirm Enrollment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-[#8580A3] hover:text-[#303654] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] mb-4 text-xs space-y-1.5">
              {selectedCourse && (
                <div className="flex justify-between">
                  <span className="text-[#645F80]">Selected Track:</span>
                  <strong className="text-[#AE54C6]">{selectedCourse.title}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#645F80]">Selected Plan:</span>
                <strong className="text-[#303654]">{planLabel(selectedPlan)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#645F80]">
                  {selectedPlan === "full" ? "Tuition Amount:" : "Due Today (Deposit):"}
                </span>
                <strong className="text-emerald-700 text-sm">
                  ₦{(selectedPlan === "full" ? planAmount(selectedPlan) : selectedCourse?.deposit ?? 0).toLocaleString()}
                </strong>
              </div>
              {selectedPlan === "installment" && (
                <div className="flex justify-between">
                  <span className="text-[#645F80]">Total Across 3 Parts:</span>
                  <strong className="text-[#303654]">₦{planAmount(selectedPlan).toLocaleString()}</strong>
                </div>
              )}
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
                      ? "border-[#AE54C6] bg-purple-50 text-[#AE54C6]"
                      : "border-[#F1E2F5] text-[#645F80]"
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Paystack Inline
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK")}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === "BANK"
                      ? "border-[#AE54C6] bg-purple-50 text-[#AE54C6]"
                      : "border-[#F1E2F5] text-[#645F80]"
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
                : `Confirm & Enroll (₦${(selectedPlan === "full" ? planAmount(selectedPlan) : selectedCourse?.deposit ?? 0).toLocaleString()})`}
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


