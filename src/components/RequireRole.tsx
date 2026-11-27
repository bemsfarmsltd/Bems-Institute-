"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import type { UserRole } from "@/types/lms";
import { ShieldAlert, Lock, ArrowRight } from "lucide-react";

type Role = UserRole;

function GateScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FAF8FF] text-center px-6">
      <ShieldAlert className="w-8 h-8 text-[#AE54C6] animate-pulse" />
      <p className="text-sm font-semibold text-[#645F80]">{label}</p>
    </div>
  );
}

/**
 * Client-side route guard: only lets a user through if their session role is
 * in `allow`. This checks LMSContext's localStorage-backed user, not a real
 * server session, so it stops casual/accidental access but isn't a substitute
 * for server-side auth if this app ever gets a real backend.
 */
export function RequireRole({
  allow,
  children
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user, isHydrated } = useLMS();
  const router = useRouter();
  const authorized =
    !!user &&
    (allow.includes(user.role) ||
      (Array.isArray(user.roles) && user.roles.some((r) => allow.includes(r))));

  // Only signed-out visitors are sent to sign in; signed-in staff without
  // this role see the same "no access" screen as the other portals.
  useEffect(() => {
    if (isHydrated && !user) {
      router.replace("/login");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated) {
    return <GateScreen label="Checking your session…" />;
  }

  if (!user) {
    return <GateScreen label="Redirecting to sign in…" />;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#F1E2F5] p-8 text-center shadow-xs space-y-4">
          <Lock className="w-10 h-10 text-rose-500 mx-auto" />
          <h1 className="text-xl font-black text-[#303654]">You don&apos;t have access to this portal</h1>
          <p className="text-sm text-[#645F80]">Your account doesn&apos;t include permission for this area.</p>
          <Link
            href={user.homePath || "/dashboard"}
            className="m-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#AE54C6] text-white text-sm font-bold"
          >
            Go to my home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
