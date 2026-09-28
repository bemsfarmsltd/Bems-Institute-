"use client";

import React, { useState } from "react";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";

type Mode = "signin" | "register";

/**
 * Gates /admin behind a real per-person account. New admins REGISTER once
 * with a staff access code (checked server-side by /api/admin-auth, never
 * shipped to the browser) plus their own email + password; returning admins
 * just sign in with those credentials via /api/auth/login, same endpoint
 * everyone else uses. Either way the server has already set a signed,
 * httpOnly session cookie before this component sees a verified user — it
 * only mirrors that into display state via setVerifiedUser/login, it never
 * grants the ADMIN role itself.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, isHydrated, isAdminDataLoaded, login, setVerifiedUser } = useLMS();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
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
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok || !result.user) {
      setError(result.error || "Sign in failed.");
      return;
    }
    if (result.user.role !== "ADMIN") {
      setError("That account doesn't have admin access.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        setError(data.error || "Incorrect staff access code.");
        return;
      }
      setVerifiedUser(data.user);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6E1F5] p-8 sm:p-10 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#7928CA]/10 text-[#7928CA] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="purple">STAFF ONLY</Badge>
            </div>
            <h1 className="text-2xl font-black text-[#18143D]">
              Master Admin Console
            </h1>
            <p className="text-xs sm:text-sm text-[#645F80] mt-1">
              This area is restricted to BEMS staff.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-2xl bg-[#FAF8FF] border border-[#E6E1F5]">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                mode === "signin" ? "bg-white shadow-sm text-[#7928CA]" : "text-[#645F80]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                mode === "register" ? "bg-white shadow-sm text-[#7928CA]" : "text-[#645F80]"
              }`}
            >
              Register (New Staff)
            </button>
          </div>

          <form onSubmit={mode === "signin" ? handleSignIn : handleRegister} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                  Staff Access Code
                </label>
                <input
                  type="password"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
                />
                <p className="text-[11px] text-[#8580A3] mt-1">
                  One-time invite code from your director — only needed to register, not for future sign-ins.
                </p>
              </div>
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
              {submitting ? "Verifying…" : mode === "signin" ? "Enter Admin Console" : "Register & Enter"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
