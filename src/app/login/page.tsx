"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  ArrowRight,
  UserCheck
} from "lucide-react";

type Mode = "signin" | "signup";

const DEMO_STUDENT = { email: "chinedu.okeke@mouau.edu.ng", password: "demo1234" };
const DEMO_INSTRUCTOR = { email: "victor.lead@bemsinstitute.ng", password: "demo1234" };

function routeForRole(role: string, router: ReturnType<typeof useRouter>) {
  if (role === "ADMIN") router.push("/admin");
  else if (role === "INSTRUCTOR") router.push("/instructor/grading");
  else router.push("/dashboard");
}

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useLMS();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result =
      mode === "signin"
        ? await login(email, password)
        : await signup(name, email, password, role);
    setSubmitting(false);

    if (!result.ok || !result.user) {
      setError(result.error || "Something went wrong.");
      return;
    }
    routeForRole(result.user.role, router);
  };

  const handleDemo = async (creds: typeof DEMO_STUDENT) => {
    setError(null);
    setSubmitting(true);
    const result = await login(creds.email, creds.password);
    setSubmitting(false);
    if (!result.ok || !result.user) {
      setError(result.error || "Demo sign-in failed.");
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
            <div className="w-14 h-14 rounded-2xl bg-[#7928CA]/10 text-[#7928CA] flex items-center justify-center mx-auto mb-4 font-black text-xl">
              B
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="purple">CORE LMS AUTH</Badge>
            </div>
            <h1 className="text-2xl font-black text-[#18143D]">
              {mode === "signin" ? "Sign in to BEMS LMS" : "Create your BEMS account"}
            </h1>
            <p className="text-xs sm:text-sm text-[#645F80] mt-1">
              {mode === "signin"
                ? "Enter your email and password, or try a demo account below."
                : "Set a password so your progress is saved to your own account."}
            </p>
          </div>

          {/* Mode toggle */}
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
                setMode("signup");
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                mode === "signup" ? "bg-white shadow-sm text-[#7928CA]" : "text-[#645F80]"
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === "signin" && (
            <div className="space-y-2 mb-6 p-4 rounded-2xl bg-[#FAF8FF] border border-[#E6E1F5]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#645F80] block text-center mb-2">
                ⚡ Try a Demo Account
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemo(DEMO_STUDENT)}
                  disabled={submitting}
                  className="text-xs border-[#D1C9EB] hover:border-[#7928CA] hover:text-[#7928CA]"
                >
                  <GraduationCap className="w-3.5 h-3.5 mr-1 text-[#7928CA]" /> Student Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemo(DEMO_INSTRUCTOR)}
                  disabled={submitting}
                  className="text-xs border-[#D1C9EB] hover:border-[#7928CA] hover:text-[#7928CA]"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1 text-amber-600" /> Tutor Demo
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chinedu Okeke"
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
                placeholder="chinedu.okeke@mouau.edu.ng"
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
              {mode === "signup" && (
                <p className="text-[11px] text-[#8580A3] mt-1">At least 8 characters.</p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                  I am a…
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "STUDENT" | "INSTRUCTOR")}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white font-medium"
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor / Tutor</option>
                </select>
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
              {submitting
                ? "Please wait…"
                : mode === "signin"
                ? "Sign In to Learning Portal"
                : "Create Account"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#F0EDF9] text-center">
            <Link
              href="/"
              className="text-xs text-[#645F80] hover:text-[#18143D] font-semibold"
            >
              &larr; Back to BEMS Public Landing Page
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
