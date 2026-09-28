"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { ShieldAlert } from "lucide-react";

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

function GateScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FAF8FF] text-center px-6">
      <ShieldAlert className="w-8 h-8 text-[#7928CA] animate-pulse" />
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
  const authorized = !!user && allow.includes(user.role);

  useEffect(() => {
    if (isHydrated && !authorized) {
      router.replace("/login");
    }
  }, [isHydrated, authorized, router]);

  if (!isHydrated) {
    return <GateScreen label="Checking your session…" />;
  }

  if (!authorized) {
    return <GateScreen label="You don't have access to this page. Redirecting to sign in…" />;
  }

  return <>{children}</>;
}
