"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight } from "lucide-react";

function routeForRole(role: string, router: ReturnType<typeof useRouter>) {
  if (role === "ADMIN") router.push("/admin");
  else if (role === "INSTRUCTOR") router.push("/instructor");
  else router.push("/dashboard");
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { resetPassword } = useLMS();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(token, password);
    setSubmitting(false);

    if (!result.ok || !result.user) {
      setError(result.error || "Could not reset password.");
      return;
    }
    routeForRole(result.user.role, router);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6E1F5] p-8 sm:p-10 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#7928CA]/10 text-[#7928CA] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="purple">ACCOUNT RECOVERY</Badge>
            </div>
            <h1 className="text-2xl font-black text-[#18143D]">Set a new password</h1>
            <p className="text-xs sm:text-sm text-[#645F80] mt-1">
              Choose a new password for your account. You&apos;ll be signed in immediately after.
            </p>
          </div>

          {!token ? (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">
              This link is missing its reset token. Request a new one from the forgot-password page.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#18143D] mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
                />
                <p className="text-[11px] text-[#8580A3] mt-1">At least 8 characters.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18143D] mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
                />
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="purple"
                size="lg"
                disabled={submitting}
                className="w-full shadow-md mt-2 font-bold"
              >
                {submitting ? "Resetting…" : "Reset Password & Sign In"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
          Loading…
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
