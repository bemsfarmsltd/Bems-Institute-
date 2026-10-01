"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLMS } from "@/context/LMSContext";
import EduportAuthSplitLayout from "@/components/EduportAuthSplitLayout";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useLMS();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const res = await requestPasswordReset(email);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.message || "Unable to process password reset request.");
      return;
    }

    setMessage(
      res.message ||
        "If an account exists for that email address, a password reset link has been generated."
    );
  };

  return (
    <EduportAuthSplitLayout>
      <div>
        <span className="text-[36px] leading-none block mb-3 select-none" aria-hidden="true">
          🤔
        </span>
        <h1 className="font-display text-[30px] sm:text-[36px] font-extrabold text-[#1D2026] tracking-tight leading-[1.15] mb-2">
          Forgot Password?
        </h1>
        <p className="text-[#64748B] text-[15px] mb-7">
          To receive a new password, enter your email address below.
        </p>

        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-[#FBE9EB] border border-[#D6293E]/25 text-[#D6293E] text-[13px] font-semibold">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 p-4 rounded-lg bg-[#D1FAE5] border border-[#059669]/25 text-[#065F46] text-[13.5px] font-medium">
            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13.5px] font-medium text-[#475569] mb-2">
              Email address *
            </label>
            <div className="flex items-center gap-3 bg-[#F3F5F7] rounded-lg px-4 py-3 border border-transparent focus-within:border-[#AE54C6] focus-within:bg-white transition-colors">
              <svg className="w-4 h-4 text-[#94A3B8] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full bg-transparent text-[14px] text-[#1D2026] placeholder:text-[#94A3B8] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[#AE54C6] hover:bg-[#A03BBC] text-white font-semibold text-[15px] shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Sending Reset Link..." : "Reset password"}
          </button>
        </form>

        <p className="mt-7 text-center text-[14px] text-[#64748B]">
          Remembered your password?{" "}
          <Link href="/login" className="text-[#AE54C6] font-semibold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </EduportAuthSplitLayout>
  );
}
