"use client";

import React, { useState } from "react";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";

/**
 * Gates /admin behind a real per-person account. Staff accounts are invite-only
 * (created or promoted via /staff-invite/[token]). Returning admins sign in via
 * /api/auth/login (and /api/auth/login/2fa when 2-step verification is enabled).
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, isHydrated, isAdminDataLoaded, login, completeTwoFactorLogin } = useLMS();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        Checking your session…
      </div>
    );
  }

  // Right after a fresh sign-in the session cookie is already valid, but the
  // roster/courses/analytics fetches are still in flight — wait for them so
  // the dashboard doesn't flash zeroed-out stats (0 students, NaN% of goal).
  if (user?.role === "ADMIN" && !isAdminDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        Loading admin console…
      </div>
    );
  }

  if (user?.role === "ADMIN") {
    return <>{children}</>;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (twoFactorChallenge) {
      const result = await completeTwoFactorLogin(twoFactorChallenge, twoFactorCode.trim());
      setSubmitting(false);
      if (!result.ok || !result.user) {
        const msg = result.error || "Verification failed.";
        if (/timed out|expired/i.test(msg)) {
          setTwoFactorChallenge(null);
          setTwoFactorCode("");
        }
        setError(msg);
        return;
      }
      if (result.user.role !== "ADMIN") {
        setError("That account doesn't have admin access.");
      }
      return;
    }

    const result = await login(email, password);
    setSubmitting(false);
    if (result.twoFactorRequired && result.challenge) {
      setTwoFactorChallenge(result.challenge);
      setTwoFactorCode("");
      return;
    }
    if (!result.ok || !result.user) {
      setError(result.error || "Sign in failed.");
      return;
    }
    if (result.user.role !== "ADMIN") {
      setError("That account doesn't have admin access.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="m-lift max-w-md w-full bg-white rounded-3xl border border-[#F1E2F5] p-8 sm:p-10 shadow-lg">
          <div className="text-center mb-8">
            <div className="m-pop w-14 h-14 rounded-2xl bg-[#AE54C6]/10 text-[#AE54C6] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="purple">STAFF ONLY</Badge>
            </div>
            <h1 className="text-2xl font-black text-[#303654]">
              {twoFactorChallenge ? "2-Step Verification" : "Master Admin Console"}
            </h1>
            <p className="text-xs sm:text-sm text-[#645F80] mt-1">
              {twoFactorChallenge
                ? "Enter the 6-digit code from your authenticator app or a recovery code."
                : "This area is restricted to BEMS staff."}
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {twoFactorChallenge ? (
              <div>
                <label className="block text-xs font-bold text-[#303654] mb-1.5">
                  Authenticator or Recovery Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456 or k7m2-9xq4"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5C8ED] focus:border-[#AE54C6] focus:outline-hidden text-sm font-mono text-[#303654] bg-white"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5C8ED] focus:border-[#AE54C6] focus:outline-hidden text-sm text-[#303654] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5C8ED] focus:border-[#AE54C6] focus:outline-hidden text-sm text-[#303654] bg-white"
                  />
                </div>
              </>
            )}

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
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              {submitting ? "Verifying…" : twoFactorChallenge ? "Verify & Enter Console" : "Enter Admin Console"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            {twoFactorChallenge && (
              <button
                type="button"
                onClick={() => {
                  setTwoFactorChallenge(null);
                  setTwoFactorCode("");
                  setError(null);
                }}
                className="m-press w-full py-2.5 rounded-xl border border-[#E5C8ED] text-xs font-bold text-[#645F80] hover:text-[#303654] cursor-pointer"
              >
                &larr; Back to password
              </button>
            )}
          </form>

          <div className="mt-6 pt-5 border-t border-[#F1E2F5] text-center">
            <p className="text-xs text-[#645F80]">
              Staff accounts are invite-only. Ask an admin for an invite link.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
