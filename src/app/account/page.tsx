"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { RequireRole } from "@/components/RequireRole";
import { UserAvatar } from "@/components/UserAvatar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { AlertTriangle, Lock, Bell, UserCog } from "lucide-react";

type NotifyCategory = "CLASS" | "GRADING" | "PAYMENT" | "GAMIFICATION" | "ATTENDANCE";

const STAFF_NOTIFY_OPTIONS: { key: NotifyCategory; label: string }[] = [
  { key: "CLASS", label: "Live class & attendance check-ins" },
  { key: "GRADING", label: "Capstone submissions awaiting grading" },
  { key: "PAYMENT", label: "Enrollment & payment confirmations" },
  { key: "GAMIFICATION", label: "Referral credit & gamification events" },
  { key: "ATTENDANCE", label: "Students flagged for missed classes" }
];

function AccountContent() {
  const { user, updateProfile, logout } = useLMS();
  const router = useRouter();
  const isStaff = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  // Profile
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Notifications (staff only — see schema: notifyCategories only affects
  // staff-broadcast alerts, never a student's own personal notifications)
  const [notifyCategories, setNotifyCategories] = useState<NotifyCategory[]>([]);
  const [savingNotify, setSavingNotify] = useState(false);

  // Deactivate
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/auth/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.profile) return;
        setName(data.profile.name || "");
        setPhone(data.profile.phone || "");
        setNotifyCategories(data.profile.notifyCategories || []);
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    const result = await updateProfile(name, phone);
    setSavingProfile(false);
    setProfileMsg(
      result.ok
        ? { type: "ok", text: "Profile updated." }
        : { type: "err", text: result.error || "Could not update your profile." }
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "err", text: "New passwords don't match." });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: "ok", text: "Password changed. Your other sessions have been signed out." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "err", text: data.error || "Could not change your password." });
      }
    } catch {
      setPasswordMsg({ type: "err", text: "Could not reach the server. Please try again." });
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleNotifyCategory = async (key: NotifyCategory) => {
    const next = notifyCategories.includes(key)
      ? notifyCategories.filter((c) => c !== key)
      : [...notifyCategories, key];
    setNotifyCategories(next);
    setSavingNotify(true);
    try {
      await apiFetch("/api/auth/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: next })
      });
    } finally {
      setSavingNotify(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    setDeactivateError(null);
    try {
      const res = await apiFetch("/api/auth/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deactivatePassword })
      });
      const data = await res.json();
      if (res.ok) {
        await logout();
        router.push("/");
      } else {
        setDeactivateError(data.error || "Could not deactivate your account.");
      }
    } catch {
      setDeactivateError("Could not reach the server. Please try again.");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="bg-[#18143D] text-white py-12 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="purple">ACCOUNT</Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">Edit Profile</h1>
          <p className="text-sm text-[#C6BDD3] mt-1">
            Manage your photo, contact details, password, and account.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Profile */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl border border-[#E6E1F5] p-6 sm:p-8 shadow-xs space-y-5"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#F7EDF9]">
            <UserCog className="w-4 h-4 text-[#AE54C6]" />
            <h2 className="text-base font-extrabold text-[#18143D]">Profile</h2>
          </div>

          <div className="flex items-center gap-4">
            <UserAvatar user={user} size={72} editable />
            <p className="text-xs text-[#645F80]">
              Click the camera icon to upload a new photo or GIF (up to 5MB).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#645F80] mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6E1F5] text-sm focus:outline-none focus:border-[#AE54C6]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#645F80] mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6E1F5] text-sm focus:outline-none focus:border-[#AE54C6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#645F80] mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6E1F5] bg-[#FAF8FF] text-sm text-[#8580A3]"
            />
            <p className="text-[11px] text-[#8580A3] mt-1">
              Your email is your sign-in ID and can&apos;t be changed here.
            </p>
          </div>

          {profileMsg && (
            <p className={`text-xs font-semibold ${profileMsg.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>
              {profileMsg.text}
            </p>
          )}

          <Button type="submit" variant="purple" disabled={savingProfile || !profileLoaded}>
            {savingProfile ? "Saving…" : "Save Profile"}
          </Button>
        </form>

        {/* Password */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white rounded-2xl border border-[#E6E1F5] p-6 sm:p-8 shadow-xs space-y-5"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#F7EDF9]">
            <Lock className="w-4 h-4 text-[#AE54C6]" />
            <h2 className="text-base font-extrabold text-[#18143D]">Change Password</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#645F80] mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6E1F5] text-sm focus:outline-none focus:border-[#AE54C6]"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#645F80] mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6E1F5] text-sm focus:outline-none focus:border-[#AE54C6]"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#645F80] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6E1F5] text-sm focus:outline-none focus:border-[#AE54C6]"
                required
                minLength={8}
              />
            </div>
          </div>

          {passwordMsg && (
            <p className={`text-xs font-semibold ${passwordMsg.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>
              {passwordMsg.text}
            </p>
          )}

          <Button type="submit" variant="outline" disabled={savingPassword}>
            {savingPassword ? "Changing…" : "Change Password"}
          </Button>
        </form>

        {/* Staff-only notification preferences */}
        {isStaff && (
          <div className="bg-white rounded-2xl border border-[#E6E1F5] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F7EDF9]">
              <Bell className="w-4 h-4 text-[#AE54C6]" />
              <h2 className="text-base font-extrabold text-[#18143D]">Staff Notification Preferences</h2>
            </div>
            <p className="text-xs text-[#645F80] -mt-1">
              Controls the notification bell for these staff-wide event types. A student&apos;s own
              personal notifications (their submission graded, etc.) always send regardless of this setting.
            </p>
            <div className="space-y-3">
              {STAFF_NOTIFY_OPTIONS.map((opt) => {
                const checked = notifyCategories.includes(opt.key);
                return (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      disabled={savingNotify}
                      onClick={() => toggleNotifyCategory(opt.key)}
                      className={`w-9 h-5 rounded-full transition-colors shrink-0 relative disabled:opacity-60 ${
                        checked ? "bg-[#AE54C6]" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                          checked ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs text-[#24292D]">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div id="danger-zone" className="bg-red-50 rounded-2xl border border-red-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-red-100">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h2 className="text-base font-extrabold text-red-900">Danger Zone</h2>
          </div>

          {!showDeactivateConfirm ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-red-900">Deactivate Account</h3>
                <p className="text-xs text-red-700 mt-0.5">
                  Signs you out everywhere and blocks login. Your data is kept — contact admissions to
                  restore it later.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100 shrink-0"
                onClick={() => setShowDeactivateConfirm(true)}
              >
                Deactivate My Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-red-900">
                Enter your password to confirm. You&apos;ll be signed out immediately.
              </p>
              <input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                placeholder="Password"
                className="w-full max-w-xs px-3.5 py-2.5 rounded-lg border border-red-300 text-sm focus:outline-none focus:border-red-500"
              />
              {deactivateError && <p className="text-xs font-semibold text-red-700">{deactivateError}</p>}
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={deactivating || !deactivatePassword}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deactivating ? "Deactivating…" : "Yes, Deactivate My Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeactivateConfirm(false);
                    setDeactivatePassword("");
                    setDeactivateError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <RequireRole allow={["STUDENT", "INSTRUCTOR", "ADMIN"]}>
      <AccountContent />
    </RequireRole>
  );
}
