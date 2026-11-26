"use client";

import React from "react";
import Link from "next/link";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { UserRole } from "@/types/lms";
import { Lock, ArrowRight } from "lucide-react";

interface PortalGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export function PortalGuard({ requiredRole, children }: PortalGuardProps) {
  const { user, isHydrated } = useLMS();

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 text-sm text-[#645F80]">
          Loading portal…
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#F1E2F5] p-8 text-center shadow-xs space-y-4">
            <Lock className="w-10 h-10 text-[#AE54C6] mx-auto" />
            <h1 className="text-xl font-black text-[#303654]">Sign in required</h1>
            <p className="text-sm text-[#645F80]">
              Please sign in with your BEMS staff account to open this portal.
            </p>
            <Link
              href="/login"
              className="m-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#AE54C6] text-white text-sm font-bold"
            >
              Go to Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasAccess =
    user.role === "ADMIN" ||
    user.role === requiredRole ||
    (Array.isArray(user.roles) && user.roles.includes(requiredRole));

  if (!hasAccess) {
    const homeHref = user.homePath || "/dashboard";
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#F1E2F5] p-8 text-center shadow-xs space-y-4">
            <Lock className="w-10 h-10 text-rose-500 mx-auto" />
            <h1 className="text-xl font-black text-[#303654]">
              You don&apos;t have access to this portal
            </h1>
            <p className="text-sm text-[#645F80]">
              Your account doesn&apos;t include permission for this area.
            </p>
            <Link
              href={homeHref}
              className="m-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#AE54C6] text-white text-sm font-bold"
            >
              Go to my home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
