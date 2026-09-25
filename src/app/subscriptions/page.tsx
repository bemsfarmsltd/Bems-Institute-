"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  X
} from "lucide-react";
import Button from "@/components/ui/button";
import { mockSubscriptionTiers } from "@/data/advanced-data";
import { SubscriptionTier } from "@/types/advanced";

export default function SubscriptionsPage() {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [paymentMode, setPaymentMode] = useState<"paystack" | "bank">("paystack");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  const handleOpenCheckout = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setPaymentSuccess(false);
  };

  const handlePaystackPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("1018892341");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-light/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>October 2026 Cohort Admissions</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-brand-dark tracking-tight">
            Transparent Tuition & Learning Plans
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Invest in practical, in-demand technical capabilities. All plans include hands-on lab workstations in Umuahia, industry mentorship, verified credentials, and WhatsApp VIP network access.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockSubscriptionTiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 bg-white border transition-all flex flex-col justify-between relative shadow-sm hover:shadow-xl ${
                tier.isPopular
                  ? "border-2 border-brand-purple ring-4 ring-brand-purple/10 scale-102"
                  : "border-gray-200"
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-purple text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                  Most Popular Choice
                </div>
              )}

              <div className="space-y-6">
                <div>
                  {tier.badge && (
                    <span className="text-[11px] font-bold uppercase text-brand-purple tracking-wider block mb-1">
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-brand-dark">{tier.name}</h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{tier.description}</p>
                </div>

                <div className="border-t border-b border-gray-100 py-4">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl md:text-4xl font-black text-brand-dark">
                      ₦{tier.priceNaira.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">/ {tier.billingPeriod}</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">
                    Includes Lab 1 workstation & backup power
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                    Everything Included:
                  </p>
                  <ul className="space-y-2.5">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  variant={tier.isPopular ? "purple" : "outline"}
                  onClick={() => handleOpenCheckout(tier)}
                  className="w-full py-3 text-sm font-bold shadow-md"
                >
                  {tier.ctaText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        {selectedTier && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-brand-purple/20 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedTier(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              {!paymentSuccess ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-brand-purple uppercase">Secure Tuition Portal</span>
                    <h3 className="text-xl font-bold text-brand-dark mt-1">
                      Checkout: {selectedTier.name}
                    </h3>
                    <p className="text-2xl font-black text-brand-navy mt-2">
                      ₦{selectedTier.priceNaira.toLocaleString()}
                    </p>
                  </div>

                  {/* Payment Mode Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMode("paystack")}
                      className={`p-3.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                        paymentMode === "paystack"
                          ? "border-brand-purple bg-brand-purple/10 text-brand-dark shadow-xs"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-brand-purple" />
                      <span>Paystack (Card/USSD)</span>
                    </button>
                    <button
                      onClick={() => setPaymentMode("bank")}
                      className={`p-3.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                        paymentMode === "bank"
                          ? "border-brand-purple bg-brand-purple/10 text-brand-dark shadow-xs"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-brand-purple" />
                      <span>Zenith Bank Transfer</span>
                    </button>
                  </div>

                  {/* Paystack View */}
                  {paymentMode === "paystack" && (
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Secured with 256-bit encryption via Paystack inline gateway</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Click below to launch the Paystack payment gateway. After successful payment, you will receive your receipt and be automatically redirected to the WhatsApp VIP Cohort.
                      </p>
                      <Button
                        variant="purple"
                        onClick={handlePaystackPay}
                        disabled={isProcessing}
                        className="w-full py-3"
                      >
                        {isProcessing ? "Processing Secure Payment..." : `Pay ₦${selectedTier.priceNaira.toLocaleString()} Now`}
                      </Button>
                    </div>
                  )}

                  {/* Zenith Bank View */}
                  {paymentMode === "bank" && (
                    <div className="p-5 rounded-2xl bg-brand-lavender/30 border border-brand-purple/20 space-y-4">
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-brand-dark">Official Institutional Bank Details:</p>
                        <p className="text-gray-600">Bank: <span className="font-semibold text-brand-dark">Zenith Bank PLC</span></p>
                        <p className="text-gray-600">Account Name: <span className="font-semibold text-brand-dark">BEMS Institute of Technology & Vocational Studies</span></p>
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-brand-purple/20 mt-2">
                          <div>
                            <span className="text-[10px] text-gray-400 block">Account Number</span>
                            <span className="font-mono font-bold text-brand-dark text-sm">1018892341</span>
                          </div>
                          <button
                            onClick={handleCopyAccount}
                            className="text-xs text-brand-purple font-semibold hover:text-brand-navy flex items-center space-x-1"
                          >
                            {copiedBank ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedBank ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>

                      <a
                        href="https://wa.me/2348000000000?text=Hello%20BEMS%20Admissions,%20I%20have%20transferred%20tuition%20to%20Zenith%20Bank"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                      >
                        <span>Send Transfer Proof on WhatsApp</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                /* Success View */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-brand-dark">Payment Confirmed!</h3>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto">
                    Your enrollment in <span className="font-bold text-brand-dark">{selectedTier.name}</span> has been confirmed. Your lab seat in Umuahia is reserved.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://chat.whatsapp.com/invite/bems-accelerator"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg"
                    >
                      <span>Join WhatsApp VIP Cohort Community</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Institutional Guarantee */}
        <div className="rounded-3xl bg-white p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-brand-dark text-base">Accreditation & Quality Guarantee</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                BEMS Institute of Technology ensures 100% practical lab exposure with high-speed internet, dedicated workstation hardware, and verifiable certificates.
              </p>
            </div>
          </div>

          <Link href="/qr-studio">
            <Button variant="outline" className="text-xs shrink-0">
              <span>View Physical Campus QR Codes</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
