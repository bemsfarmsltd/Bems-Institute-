"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface InviteInfo {
  email: string;
  role: "ADMIN" | "INSTRUCTOR";
  expiresAt: string;
  accountExists: boolean;
}

export default function StaffInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { setVerifiedUser } = useLMS();
  const token = params?.token || "";

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadError("Invalid staff invite link.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    apiFetch(`/api/staff-invites/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.invite) {
          setLoadError(data.error || "This invite link is invalid or has expired.");
          return;
        }
        setInvite(data.invite);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not verify this invite link. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;
    setSubmitError(null);

    if (!invite.accountExists) {
      if (password.length < 8) {
        setSubmitError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setSubmitError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = invite.accountExists
        ? { password }
        : { name: name.trim(), password };
      const res = await apiFetch(`/api/staff-invites/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error || "Could not accept invite.");
        return;
      }
      if (data.signInRequired) {
        router.push("/login");
        return;
      }
      if (data.user) {
        setVerifiedUser(data.user);
        router.push(
          data.user.homePath ||
            (data.user.role === "ADMIN" ? "/admin" : "/tutor")
        );
        return;
      }
      router.push("/login");
    } catch {
      setSubmitError("Network error while accepting invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="m-lift max-w-md w-full bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-10 shadow-lg">
          {loading ? (
            <div className="py-10 text-center text-sm text-[#645F80]">
              Checking invite link…
            </div>
          ) : loadError || !invite ? (
            <div className="text-center space-y-4">
              <div className="m-pop w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#303654]">
                Invite Unavailable
              </h1>
              <p className="text-xs sm:text-sm text-[#645F80] leading-relaxed">
                {loadError || "This invite link is no longer valid."}
              </p>
              <Link href="/login" className="inline-block pt-2">
                <Button variant="purple" className="font-bold">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="m-pop w-14 h-14 rounded-2xl bg-[#AE54C6]/10 text-[#AE54C6] flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="purple">STAFF INVITE &middot; {invite.role}</Badge>
                </div>
                <h1 className="text-2xl font-black text-[#303654]">
                  {invite.accountExists ? "Confirm Staff Access" : "Create Staff Account"}
                </h1>
                <p className="text-xs sm:text-sm text-[#645F80] mt-1.5">
                  Invited as <strong className="text-[#303654]">{invite.role}</strong> for{" "}
                  <span className="font-semibold text-[#AE54C6] break-all">{invite.email}</span>
                </p>
              </div>

              {invite.accountExists && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    An account already exists for this email. Enter your current password to accept{" "}
                    <strong>{invite.role}</strong> access.
                  </span>
                </div>
              )}

              <form onSubmit={handleAccept} className="space-y-4">
                {!invite.accountExists && (
                  <div>
                    <label className="block text-xs font-bold text-[#303654] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chima Nwosu"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5C8ED] focus:border-[#AE54C6] focus:outline-hidden text-sm text-[#303654] bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    {invite.accountExists ? "Your Account Password *" : "Create Password *"}
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
                  {!invite.accountExists && (
                    <p className="text-[11px] text-[#8580A3] mt-1">At least 8 characters.</p>
                  )}
                </div>

                {!invite.accountExists && (
                  <div>
                    <label className="block text-xs font-bold text-[#303654] mb-1.5">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5C8ED] focus:border-[#AE54C6] focus:outline-hidden text-sm text-[#303654] bg-white"
                    />
                  </div>
                )}

                {submitError && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {submitError}
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
                    ? "Activating Access…"
                    : invite.accountExists
                    ? `Accept ${invite.role} Access`
                    : "Create Account & Enter"}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>

              <p className="text-[11px] text-[#8580A3] text-center mt-5">
                Invite expires{" "}
                {new Date(invite.expiresAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
