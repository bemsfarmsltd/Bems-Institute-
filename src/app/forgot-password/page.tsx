"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useLMS();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await requestPasswordReset(email);
    setSubmitting(false);
    setResult(res);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6E1F5] p-8 sm:p-10 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#7928CA]/10 text-[#7928CA] flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="purple">ACCOUNT RECOVERY</Badge>
            </div>
            <h1 className="text-2xl font-black text-[#18143D]">Reset your password</h1>
            <p className="text-xs sm:text-sm text-[#645F80] mt-1">
              Enter your account email and we&apos;ll send a link to reset your password.
            </p>
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-900 font-medium">{result.message}</p>
              </div>
              <p className="text-[11px] text-[#8580A3] text-center">
                No email service is set up in this environment yet — check the server console for the
                reset link instead.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#18143D] mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chinedu.okeke@mouau.edu.ng"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
                />
              </div>

              <Button
                type="submit"
                variant="purple"
                size="lg"
                disabled={submitting}
                className="w-full shadow-md mt-2 font-bold"
              >
                {submitting ? "Sending…" : "Send Reset Link"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#F0EDF9] text-center">
            <Link href="/login" className="text-xs text-[#645F80] hover:text-[#18143D] font-semibold">
              &larr; Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
