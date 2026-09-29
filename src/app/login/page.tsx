"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import type { UserRole } from "@/types/lms";
import EduportAuthSplitLayout from "@/components/EduportAuthSplitLayout";

function EnvelopeIcon() {
  return (
    <svg className="w-4 h-4 text-[#94A3B8] shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-4 h-4 text-[#94A3B8] shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4 text-[#94A3B8] shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useLMS();

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signup") {
        setMode("signup");
      }
    }
  }, []);
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [institution, setInstitution] = useState<"MOUAU" | "Global">("MOUAU");
  const [matricNumber, setMatricNumber] = useState("");
  const [department, setDepartment] = useState("Computer Engineering");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const routeForRole = (userRole: UserRole) => {
    if (userRole === "INSTRUCTOR" || userRole === "ADMIN") {
      router.push("/instructor");
    } else {
      router.push("/dashboard");
    }
  };

  const handleQuickDemo = async (demoRole: "student" | "instructor") => {
    setError(null);
    setSubmitting(true);
    const demoEmail =
      demoRole === "instructor"
        ? "victor.lead@bemsinstitute.ng"
        : "chinedu.okeke@mouau.edu.ng";

    const result = await login(demoEmail, "demo1234");
    setSubmitting(false);
    if (!result.ok || !result.user) {
      setError(result.error ?? "Unable to sign into demo account.");
      return;
    }
    routeForRole(result.user.role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (password.length < 8) {
        setError("Your password must be at least 8 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!agreeTerms) {
        setError("Please agree to the terms of service to continue.");
        return;
      }
    }

    setSubmitting(true);

    if (mode === "signin") {
      const result = await login(email, password);
      setSubmitting(false);
      if (!result.ok || !result.user) {
        setError(result.error ?? "Invalid email or password.");
        return;
      }
      routeForRole(result.user.role);
      return;
    }

    const result = await signup(
      name,
      email,
      password,
      role === "INSTRUCTOR" ? "INSTRUCTOR" : "STUDENT"
    );
    setSubmitting(false);

    if (!result.ok || !result.user) {
      setError(result.error ?? "Could not create your account.");
      return;
    }
    routeForRole(result.user.role);
  };

  return (
    <EduportAuthSplitLayout>
      {mode === "signin" ? (
        /* ================= LOGIN MODE ================= */
        <div>
          <span className="text-[36px] leading-none block mb-3 select-none" aria-hidden="true">
            👋
          </span>
          <h1 className="font-display text-[30px] sm:text-[36px] font-extrabold text-[#1D2026] tracking-tight leading-[1.15] mb-2">
            Login into BEMS!
          </h1>
          <p className="text-[#64748B] text-[15px] mb-7">
            Nice to see you! Please log in with your account.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-[#FBE9EB] border border-[#D6293E]/25 text-[#D6293E] text-[13px] font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-[13.5px] font-medium text-[#475569] mb-2">
                Email address *
              </label>
              <div className="flex items-center gap-3 bg-[#F3F5F7] rounded-lg px-4 py-3 border border-transparent focus-within:border-[#066AC9] focus-within:bg-white transition-colors">
                <EnvelopeIcon />
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

            {/* Password */}
            <div>
              <label className="block text-[13.5px] font-medium text-[#475569] mb-2">
                Password *
              </label>
              <div className="flex items-center gap-3 bg-[#F3F5F7] rounded-lg px-4 py-3 border border-transparent focus-within:border-[#066AC9] focus-within:bg-white transition-colors">
                <LockIcon />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*********"
                  className="w-full bg-transparent text-[14px] text-[#1D2026] placeholder:text-[#94A3B8] focus:outline-none"
                />
              </div>
              <p className="text-[12px] text-[#94A3B8] mt-1.5">
                Your password must be 8 characters at least
              </p>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-[13.5px]">
              <label className="inline-flex items-center gap-2 text-[#64748B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#066AC9] focus:ring-[#066AC9]"
                />
                <span>Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[#64748B] hover:text-[#066AC9] underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-[#066AC9] hover:bg-[#0556A5] text-white font-semibold text-[15px] shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Instant Demo Access */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Instant Demo Access
              </span>
              <span className="text-[11px] text-[#64748B]">One-click sign in</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo("student")}
                className="py-2 px-3 rounded-lg bg-[#E7EFF7] hover:bg-[#D8E6F3] text-[#066AC9] font-semibold text-[12.5px] transition-colors cursor-pointer"
              >
                Student Demo
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo("instructor")}
                className="py-2 px-3 rounded-lg bg-[#E8F8F3] hover:bg-[#D5F2E9] text-[#0F6E56] font-semibold text-[12.5px] transition-colors cursor-pointer"
              >
                Instructor Demo
              </button>
            </div>
          </div>

          {/* Divider Or */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="bg-white px-4 text-[13px] text-[#94A3B8] font-medium">
              Or
            </span>
            <div className="w-full border-t border-slate-200" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickDemo("student")}
              className="w-full py-2.5 px-4 rounded-lg bg-[#3C7FF0] hover:bg-[#316FD8] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="font-display font-black text-[15px]">G</span>
              <span>Login with Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("student")}
              className="w-full py-2.5 px-4 rounded-lg bg-[#5D82D1] hover:bg-[#4E71BE] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="font-display font-black text-[15px]">f</span>
              <span>Login with Facebook</span>
            </button>
          </div>

          {/* Switch to Sign Up */}
          <p className="mt-7 text-center text-[14px] text-[#64748B]">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("signup");
              }}
              className="text-[#066AC9] font-semibold hover:underline cursor-pointer"
            >
              Signup here
            </button>
          </p>
        </div>
      ) : (
        /* ================= SIGN UP MODE ================= */
        <div>
          <span className="text-[36px] leading-none block mb-3 select-none" aria-hidden="true">
            🙌
          </span>
          <h1 className="font-display text-[30px] sm:text-[36px] font-extrabold text-[#1D2026] tracking-tight leading-[1.15] mb-2">
            Sign up for your account!
          </h1>
          <p className="text-[#64748B] text-[15px] mb-6">
            Nice to see you! Please Sign up with your account.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-[#FBE9EB] border border-[#D6293E]/25 text-[#D6293E] text-[13px] font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[13.5px] font-medium text-[#475569] mb-1.5">
                Full Name *
              </label>
              <div className="flex items-center gap-3 bg-[#F3F5F7] rounded-lg px-4 py-2.5 border border-transparent focus-within:border-[#066AC9] focus-within:bg-white transition-colors">
                <UserIcon />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-transparent text-[14px] text-[#1D2026] placeholder:text-[#94A3B8] focus:outline-none"
                />
              </div>
            </div>

            {/* Email address */}
            <div>
              <label className="block text-[13.5px] font-medium text-[#475569] mb-1.5">
                Email address *
              </label>
              <div className="flex items-center gap-3 bg-[#F3F5F7] rounded-lg px-4 py-2.5 border border-transparent focus-within:border-[#066AC9] focus-within:bg-white transition-colors">
                <EnvelopeIcon />
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

            {/* Role & Campus Stream Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                  Account Type
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#F3F5F7] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#1D2026] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                  Campus Stream
                </label>
                <select
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value as "MOUAU" | "Global")}
                  className="w-full bg-[#F3F5F7] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#1D2026] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
                >
                  <option value="MOUAU">MOUAU Campus</option>
                  <option value="Global">Global Learner</option>
                </select>
              </div>
            </div>

            {institution === "MOUAU" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                    Matric Number
                  </label>
                  <input
                    type="text"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    placeholder="MOUAU/CME/22/..."
                    className="w-full bg-[#F3F5F7] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#1D2026] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Engineering"
                    className="w-full bg-[#F3F5F7] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#1D2026] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-[13.5px] font-medium text-[#475569] mb-1.5">
                Password *
              </label>
              <div className="flex items-center gap-3 bg-[#F3F5F7] rounded-lg px-4 py-2.5 border border-transparent focus-within:border-[#066AC9] focus-within:bg-white transition-colors">
                <LockIcon />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*********"
                  className="w-full bg-transparent text-[14px] text-[#1D2026] placeholder:text-[#94A3B8] focus:outline-none"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[13.5px] font-medium text-[#475569] mb-1.5">
                Confirm Password *
              </label>
              <div className="flex items-center gap-3 bg-[#F3F5F7] rounded-lg px-4 py-2.5 border border-transparent focus-within:border-[#066AC9] focus-within:bg-white transition-colors">
                <LockIcon />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="*********"
                  className="w-full bg-transparent text-[14px] text-[#1D2026] placeholder:text-[#94A3B8] focus:outline-none"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="inline-flex items-center gap-2.5 text-[13.5px] text-[#64748B] cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-[#066AC9] focus:ring-[#066AC9]"
              />
              <span>
                By signing up, you agree to the{" "}
                <Link href="/legal/terms" className="text-[#066AC9] underline hover:text-[#0556A5]">
                  terms of service
                </Link>
              </span>
            </label>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-[#066AC9] hover:bg-[#0556A5] text-white font-semibold text-[15px] shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Divider Or */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="bg-white px-4 text-[13px] text-[#94A3B8] font-medium">
              Or
            </span>
            <div className="w-full border-t border-slate-200" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickDemo("student")}
              className="w-full py-2.5 px-4 rounded-lg bg-[#3C7FF0] hover:bg-[#316FD8] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="font-display font-black text-[15px]">G</span>
              <span>Signup with Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("student")}
              className="w-full py-2.5 px-4 rounded-lg bg-[#5D82D1] hover:bg-[#4E71BE] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="font-display font-black text-[15px]">f</span>
              <span>Signup with Facebook</span>
            </button>
          </div>

          {/* Switch to Sign In */}
          <p className="mt-6 text-center text-[14px] text-[#64748B]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("signin");
              }}
              className="text-[#066AC9] font-semibold hover:underline cursor-pointer"
            >
              Sign in here
            </button>
          </p>
        </div>
      )}
    </EduportAuthSplitLayout>
  );
}
