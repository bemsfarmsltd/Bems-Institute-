"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { apiFetch } from "@/lib/api-client";
import { readAttributionParam, persistAttribution, getStoredAttribution } from "@/lib/attribution";
import {
  AlertCircle,
  X,
  Trash2,
  Edit3,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  ArrowUp,
} from "lucide-react";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  thumbType: "sketch" | "video";
  courseId?: string;
}

const DEFAULT_ORDER_ITEMS: OrderItem[] = [
  {
    id: "item-sketch",
    title: "Sketch from A to Z: for an app designer",
    price: 150,
    thumbType: "sketch",
    courseId: "product-design",
  },
  {
    id: "item-video",
    title: "The Complete Video Production Bootcamp",
    price: 350,
    thumbType: "video",
    courseId: "web-dev",
  },
];

export function EduportCheckoutView() {
  const searchParams = useSearchParams();
  const courseQuery = searchParams.get("course");
  // The checkout page can be reached two ways: a direct deep-link flyer QR
  // (carries ?utm_source= or ?source= right here) or an outdoor banner that
  // landed the visitor on the homepage first (see AttributionCapture) — in
  // that second case there's no param on THIS page load, so fall back to
  // whatever was persisted there instead of losing the attribution.
  const sourceParam = readAttributionParam(searchParams);
  const { user, courses, enrollInCourse } = useLMS();

  const [showAccountBanner, setShowAccountBanner] = useState(true);
  const [selectedSavedCard, setSelectedSavedCard] = useState<
    "mastercard" | "visa" | "amex"
  >("visa");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "netbanking">(
    "card"
  );

  // Personal Details state
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState("");
  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");

  // Card Details state
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");

  // Order Summary state
  const [orderItems, setOrderItems] =
    useState<OrderItem[]>(DEFAULT_ORDER_ITEMS);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(20);
  const [notice, setNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedCourse, setConfirmedCourse] = useState<{
    title: string;
    slug: string;
    firstLessonId: string;
    totalPaid: number;
  } | null>(null);

  // The source actually used for enrollment attribution: a fresh param on
  // this page wins; otherwise fall back to what AttributionCapture stored
  // when the visitor first landed (e.g. via an outdoor banner -> homepage).
  const [effectiveSource, setEffectiveSource] = useState<string | null>(null);
  useEffect(() => {
    if (sourceParam) {
      persistAttribution(sourceParam);
      setEffectiveSource(sourceParam);
    } else {
      setEffectiveSource(getStoredAttribution());
    }
  }, [sourceParam]);

  // Preserve QR / Banner scan tracking for BEMS analytics — only fires for a
  // FRESH param on this exact page load; a scan carried forward from the
  // homepage was already logged there by AttributionCapture.
  const scanTracked = useRef(false);
  useEffect(() => {
    if (!sourceParam || scanTracked.current) return;
    scanTracked.current = true;
    apiFetch("/api/lms/track-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: sourceParam,
        courseId: courseQuery || null,
      }),
    }).catch(() => {});
  }, [sourceParam, courseQuery]);

  const originalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);
  const finalTotal = Math.max(0, originalPrice - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponDiscount(20);
    setNotice(`Coupon "${couponCode.toUpperCase()}" applied (-$20).`);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const matchedCourse =
        courses.find(
          (c) => c.id === courseQuery || c.slug === courseQuery
        ) || courses[0];

      if (matchedCourse) {
        await enrollInCourse(matchedCourse.id, {
          source: effectiveSource || undefined,
          paymentMethod: paymentMethod === "card" ? "paystack" : "bank",
        });
      }

      const firstLessonId =
        matchedCourse?.modules[0]?.lessons[0]?.id || "les-1";
      setConfirmedCourse({
        title: matchedCourse?.title || "Sketch from A to Z: for an app designer",
        slug: matchedCourse?.slug || "web-dev",
        firstLessonId,
        totalPaid: finalTotal,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#24292D]">
      <Navbar />

      {/* 1. Gray Rounded Checkout Header Banner (Image 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 w-full">
        <div className="bg-[#F5F7F9] rounded-xl py-10 sm:py-12 px-6 text-center">
          <h1 className="font-display text-3xl sm:text-[40px] font-extrabold text-[#24292D] tracking-tight mb-2.5">
            Checkout
          </h1>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-center flex-wrap gap-2.5 text-xs sm:text-[13.5px] text-[#747579]"
          >
            <Link href="/" className="hover:text-[#066AC9] transition-colors">
              Home
            </Link>
            <span className="text-[#9A9EA4]">&bull;</span>
            <Link
              href="/courses"
              className="hover:text-[#066AC9] transition-colors"
            >
              Courses
            </Link>
            <span className="text-[#9A9EA4]">&bull;</span>
            <Link
              href="/courses"
              className="hover:text-[#066AC9] transition-colors"
            >
              Cart
            </Link>
            <span className="text-[#9A9EA4]">&bull;</span>
            <span className="text-[#9A9EA4]">Checkout</span>
          </nav>
        </div>
      </section>

      {/* Optional Enrollment Confirmation Toast */}
      {confirmedCourse && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4 w-full">
          <div className="rounded-xl border border-[#0CBC87] bg-[#E6F8F3] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0CBC87]">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Order Confirmed &middot; ${confirmedCourse.totalPaid} Paid
                </span>
              </div>
              <h2 className="font-display text-lg font-extrabold text-[#24292D]">
                You are enrolled in {confirmedCourse.title}!
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={`/learn/${confirmedCourse.slug}/${confirmedCourse.firstLessonId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0CBC87] hover:bg-[#0aa374] text-white text-xs font-bold transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start First Lesson</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-[#24292D] text-xs font-bold hover:border-[#066AC9] transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Optional Notice Toast */}
      {notice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2 w-full">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#E8F1FA] text-[#066AC9] text-xs sm:text-sm font-semibold">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="hover:opacity-75 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main 2-Column Checkout Content (Images 1, 2, 3) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==================== LEFT COLUMN (8 Cols) ==================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Pink "Already have an account? Log In" Alert Box (Image 1) */}
            {showAccountBanner && (
              <div className="bg-[#F8D7DA]/85 border border-[#F1AEB5] text-[#842029] rounded-lg px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-[14px]">
                  <AlertCircle className="w-4 h-4 text-[#842029] shrink-0" />
                  <span>
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-extrabold text-[#842029] hover:underline"
                    >
                      Log In
                    </Link>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccountBanner(false)}
                  aria-label="Dismiss alert"
                  className="text-[#842029]/70 hover:text-[#842029] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Personal Details + Payment Method Card */}
            <div className="bg-white rounded-xl shadow-[0_0_40px_rgba(29,58,83,0.07)] border border-slate-100 p-6 sm:p-8 space-y-8">
              {/* Part A: Personal Details */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setNotice("Personal details saved.");
                }}
                className="space-y-5"
              >
                <h2 className="font-display text-xl sm:text-[22px] font-extrabold text-[#24292D]">
                  Personal Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Your name * */}
                  <div>
                    <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                      Your name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#F5F7F9] text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
                    />
                  </div>

                  {/* Email address * */}
                  <div>
                    <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                      Email address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-4 py-2.5 rounded-lg bg-[#F5F7F9] text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
                    />
                  </div>

                  {/* Mobile number * */}
                  <div>
                    <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                      Mobile number *
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Mobile number"
                      className="w-full px-4 py-2.5 rounded-lg bg-[#F5F7F9] text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
                    />
                  </div>

                  {/* Select country * */}
                  <div>
                    <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                      Select country *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[14px] text-[#747579] focus:outline-none focus:border-[#066AC9]"
                    >
                      <option value="">Select country</option>
                      <option value="NG">Nigeria</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>

                  {/* Select state * */}
                  <div>
                    <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                      Select state *
                    </label>
                    <select
                      value={stateRegion}
                      onChange={(e) => setStateRegion(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[14px] text-[#747579] focus:outline-none focus:border-[#066AC9]"
                    >
                      <option value="">Select state</option>
                      <option value="Abia">Abia State (Umuahia)</option>
                      <option value="Lagos">Lagos State</option>
                      <option value="Abuja">FCT Abuja</option>
                      <option value="Rivers">Rivers State</option>
                    </select>
                  </div>

                  {/* Postal code * */}
                  <div>
                    <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                      Postal code *
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="PIN code"
                      className="w-full px-4 py-2.5 rounded-lg bg-[#F5F7F9] text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
                    />
                  </div>

                  {/* Address * */}
                  <div>
                    <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address"
                      className="w-full px-4 py-2.5 rounded-lg bg-[#F5F7F9] text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
                    />
                  </div>
                </div>

                {/* Your saved cards * (Image 2) */}
                <div className="pt-1">
                  <label className="block text-[13.5px] font-medium text-[#747579] mb-2.5">
                    Your saved cards *
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* MasterCard */}
                    <button
                      type="button"
                      onClick={() => setSelectedSavedCard("mastercard")}
                      className={`w-16 h-11 rounded-md border flex items-center justify-center bg-white transition-all cursor-pointer ${
                        selectedSavedCard === "mastercard"
                          ? "border-[#066AC9] ring-1 ring-[#066AC9]"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      title="MasterCard"
                    >
                      <span className="relative inline-flex items-center">
                        <span className="w-5 h-5 rounded-full bg-[#EB001B] inline-block" />
                        <span className="w-5 h-5 rounded-full bg-[#F79E1B] -ml-2 inline-block opacity-90" />
                      </span>
                    </button>

                    {/* VISA */}
                    <button
                      type="button"
                      onClick={() => setSelectedSavedCard("visa")}
                      className={`w-16 h-11 rounded-md border flex items-center justify-center bg-white transition-all cursor-pointer ${
                        selectedSavedCard === "visa"
                          ? "border-[#066AC9] ring-1 ring-[#066AC9]"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      title="Visa"
                    >
                      <span className="font-display italic font-black text-[15px] tracking-tight text-[#1A1F71]">
                        VISA
                      </span>
                    </button>

                    {/* AMERICAN EXPRESS */}
                    <button
                      type="button"
                      onClick={() => setSelectedSavedCard("amex")}
                      className={`w-16 h-11 rounded-md border flex items-center justify-center bg-white transition-all cursor-pointer ${
                        selectedSavedCard === "amex"
                          ? "border-[#066AC9] ring-1 ring-[#066AC9]"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      title="American Express"
                    >
                      <span className="w-11 h-8 rounded-xs bg-[#016FD0] text-white font-extrabold text-[6.5px] leading-tight flex items-center justify-center text-center px-0.5 uppercase tracking-tighter">
                        AMERICAN EXPRESS
                      </span>
                    </button>
                  </div>
                </div>

                {/* Save changes button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#5698D8] hover:bg-[#066AC9] text-white text-[13.5px] font-bold transition-colors cursor-pointer"
                  >
                    Save changes
                  </button>
                </div>
              </form>

              <hr className="border-slate-200/80" />

              {/* Part B: Payment method (Images 2 & 3) */}
              <div className="space-y-4">
                <h2 className="font-display text-xl sm:text-[22px] font-extrabold text-[#24292D]">
                  Payment method
                </h2>

                {/* Option 1: Credit or Debit Card */}
                <div className="border border-slate-200/90 rounded-lg p-5 space-y-5">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-4 h-4 accent-[#066AC9]"
                    />
                    <span className="text-[14px] font-medium text-[#24292D]">
                      Credit or Debit Card
                    </span>
                  </label>

                  {paymentMethod === "card" && (
                    <div className="sm:pl-4 space-y-5">
                      {/* Card Number * */}
                      <div>
                        <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                          Card Number <span className="text-[#D6293E]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="xxxx xxxx xxxx xxxx"
                            className="w-full pl-4 pr-16 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:border-[#066AC9]"
                          />
                          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-display italic font-black text-[13px] tracking-tight text-[#1A1F71]">
                            VISA
                          </span>
                        </div>
                      </div>

                      {/* Expiration date * & CVV / CVC * */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-7">
                          <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                            Expiration date{" "}
                            <span className="text-[#D6293E]">*</span>
                          </label>
                          <div className="grid grid-cols-2">
                            <input
                              type="text"
                              value={expMonth}
                              onChange={(e) => setExpMonth(e.target.value)}
                              placeholder="Month"
                              className="w-full px-4 py-2.5 rounded-l-lg border border-slate-200 text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:border-[#066AC9]"
                            />
                            <input
                              type="text"
                              value={expYear}
                              onChange={(e) => setExpYear(e.target.value)}
                              placeholder="Year"
                              className="w-full px-4 py-2.5 rounded-r-lg border-y border-r border-slate-200 text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:border-[#066AC9]"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-5">
                          <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                            CVV / CVC <span className="text-[#D6293E]">*</span>
                          </label>
                          <input
                            type="text"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="xxx"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:border-[#066AC9]"
                          />
                        </div>
                      </div>

                      {/* Name on Card * */}
                      <div>
                        <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                          Name on Card <span className="text-[#D6293E]">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                          placeholder="Enter card holder name"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:border-[#066AC9]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Pay with Net Banking */}
                <div className="border border-slate-200/90 rounded-lg px-5 py-4">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "netbanking"}
                      onChange={() => setPaymentMethod("netbanking")}
                      className="w-4 h-4 accent-[#066AC9]"
                    />
                    <span className="text-[14px] font-medium text-[#24292D]">
                      Pay with Net Banking
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN (4 Cols) ==================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Order Summary (Images 1 & 2) */}
            <div className="bg-white rounded-xl shadow-[0_0_40px_rgba(29,58,83,0.07)] border border-slate-100 p-6">
              <h2 className="font-display text-2xl font-extrabold text-[#24292D] mb-5">
                Order Summary
              </h2>

              <div className="flex items-center justify-between text-[13.5px] mb-2.5">
                <span className="text-[#747579]">Transaction code</span>
                <span className="text-[#24292D] font-medium">AB12365E</span>
              </div>

              {/* Coupon Input Group */}
              <form onSubmit={handleApplyCoupon} className="flex items-stretch">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="COUPON CODE"
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-l-lg border border-r-0 border-slate-200 text-[13px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:border-[#066AC9]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-r-lg bg-[#066AC9] hover:bg-[#0556A5] text-white text-[13.5px] font-bold transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </form>

              <hr className="border-slate-200/70 my-5" />

              {/* Order Items */}
              <div className="space-y-5">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3.5">
                    {item.thumbType === "sketch" ? (
                      <div className="relative w-24 h-16 rounded-lg bg-gradient-to-br from-[#FCD690] via-[#F7B765] to-[#F39F49] flex items-center justify-center overflow-hidden shrink-0">
                        <svg
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full opacity-25"
                          viewBox="0 0 96 64"
                          fill="none"
                        >
                          <path
                            d="M0 50 L28 30 L56 44 L82 20 L96 38"
                            stroke="#B45309"
                            strokeWidth="1.2"
                          />
                        </svg>
                        <svg
                          className="w-7 h-7 relative z-10"
                          viewBox="0 0 64 64"
                          fill="none"
                        >
                          <polygon
                            points="32,8 54,22 32,56 10,22"
                            fill="#FDB300"
                          />
                          <polygon
                            points="18,22 46,22 32,8"
                            fill="#FDD231"
                          />
                          <polygon
                            points="10,22 32,56 20,22"
                            fill="#EA6C00"
                          />
                          <polygon
                            points="54,22 32,56 44,22"
                            fill="#EA6C00"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=240&q=80"
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-[#24292D] text-[14px] leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="text-[#0CBC87] font-bold text-[15px]">
                          ${item.price}
                        </span>
                        <div className="flex items-center gap-3 text-[12.5px] text-[#747579]">
                          <button
                            type="button"
                            onClick={() =>
                              setOrderItems((prev) =>
                                prev.filter((i) => i.id !== item.id)
                              )
                            }
                            className="inline-flex items-center gap-1 hover:text-[#D6293E] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                          <Link
                            href="/courses"
                            className="inline-flex items-center gap-1 hover:text-[#066AC9] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-slate-200/70 my-5" />

              {/* Totals Breakdown */}
              <div className="space-y-2.5 text-[14px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#24292D]">Original Price</span>
                  <span className="font-bold text-[#24292D]">
                    ${originalPrice}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#24292D]">Coupon Discount</span>
                  <span className="text-[#D6293E] font-medium">
                    -${couponDiscount}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 font-display text-[20px] font-extrabold text-[#24292D]">
                  <span>Total</span>
                  <span>${finalTotal}</span>
                </div>
              </div>

              {/* Solid Green Place Order Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePlaceOrder}
                className="w-full mt-5 py-3 rounded-lg bg-[#0CBC87] hover:bg-[#0aa374] disabled:opacity-60 text-white font-bold text-[15px] transition-colors cursor-pointer shadow-2xs"
              >
                {isProcessing ? "Processing Order..." : "Place Order"}
              </button>

              <p className="text-center text-[12px] text-[#747579] mt-3 leading-relaxed">
                By completing your purchase, you agree to these{" "}
                <Link
                  href="/courses"
                  className="text-[#066AC9] font-bold hover:underline"
                >
                  Terms of Service
                </Link>
              </p>
            </div>

            {/* Card 2: Dark Navy Premium Promo Card (Image 2) */}
            <div className="relative bg-[#1D3B53] rounded-xl p-6 text-white overflow-hidden">
              {/* Background Geometric Circles & Dots */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-3 right-16 w-20 h-20 opacity-15"
                style={{
                  backgroundImage:
                    "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
                  backgroundSize: "8px 8px",
                }}
              />
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-6 w-28 h-28 text-white/8"
                viewBox="0 0 100 100"
                fill="none"
              >
                <circle
                  cx="60"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="8"
                />
              </svg>

              {/* Paper Airplane & Dashed Trail (Bottom Right) */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute right-2 bottom-2 w-28 h-28"
                viewBox="0 0 120 120"
                fill="none"
              >
                <path
                  d="M42 40 L18 28 L34 46 L42 40 Z"
                  fill="#F7C32E"
                />
                <path
                  d="M18 28 L46 36 L42 40 Z"
                  fill="#E0A800"
                />
                <path
                  d="M42 44 C68 62, 92 88, 76 106 C64 118, 86 78, 115 95"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>

              <h3 className="font-display text-[20px] font-extrabold leading-snug mb-2.5 relative z-10">
                Access 25K Online courses from 120 institutions, Start today!
              </h3>
              <p className="text-[13.5px] text-white/75 leading-relaxed mb-5 relative z-10">
                Here is the description of premium features which will allow
                users to get benefits and save a lot of money
              </p>
              <Link
                href="/courses"
                className="inline-block px-4 py-2.5 rounded-lg bg-[#F7C32E] hover:bg-[#eab31c] text-[#24292D] font-bold text-[13px] transition-colors relative z-10"
              >
                Purchase Premium
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Full Eduport Footer (Image 3) */}
      <Footer />

      {/* Floating Scroll-To-Top Button */}
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
