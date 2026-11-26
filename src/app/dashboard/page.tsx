"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { RequireRole } from "@/components/RequireRole";
import { LearningInsights } from "@/components/LearningInsights";
import { ReferAFriendCard } from "@/components/ReferAFriendCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardTour } from "@/components/tours/DashboardTour";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { getCourseVisual } from "@/lib/course-visuals";
import { buildWhatsAppLink, BEMS_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { UserAvatar } from "@/components/UserAvatar";
import { CountUp } from "@/components/CountUp";
import { CourseRoadmap } from "@/components/CourseRoadmap";
import { BadgeCelebration, BadgeShelf } from "@/components/BadgeShelf";
import {
  PublicPortfolioCard,
  NotesAndSavedCard,
  RemindersCard
} from "@/components/MySpacePhase4Cards";
import { StudentMyPaymentsCard } from "@/components/StudentMyPaymentsCard";
import {
  MY_SPACE_ACCENTS,
  MY_SPACE_BANNERS,
  getAccentHex,
  getBannerConfig
} from "@/lib/my-space-appearance";
import type {
  MySpaceAccentColor,
  MySpaceBanner,
  MySpaceExperienceLevel,
  MySpaceGoalType
} from "@/types/lms";
import type { LeaderboardStudent } from "@/types/advanced";
import {
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MessageCircle,
  FileText,
  LayoutDashboard,
  CreditCard,
  HelpCircle,
  Compass,
  LogOut,
  Search,
  BookOpen,
  GraduationCap,
  Table2,
  UserCog,
  Lock,
  Bell,
  AlertTriangle,
  Target,
  Clock,
  Flame,
  PlayCircle,
  Calendar,
  MapPin,
  Video,
  Palette
} from "lucide-react";

type NotifyCategory = "CLASS" | "GRADING" | "PAYMENT" | "GAMIFICATION" | "ATTENDANCE";

const STAFF_NOTIFY_OPTIONS: { key: NotifyCategory; label: string }[] = [
  { key: "CLASS", label: "Live class & attendance check-ins" },
  { key: "GRADING", label: "Capstone submissions awaiting grading" },
  { key: "PAYMENT", label: "Enrollment & payment confirmations" },
  { key: "GAMIFICATION", label: "Referral credit & gamification events" },
  { key: "ATTENDANCE", label: "Students flagged for missed classes" }
];

function SidebarLink({
  href,
  icon,
  label,
  active
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`m-press flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
        active ? "bg-white text-[#303654]" : "text-[#E8CFEF] hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function StudentDashboardContent() {
  const router = useRouter();
  const {
    user,
    isHydrated,
    logout,
    updateProfile,
    courses,
    enrolledCourseIds,
    userEnrollments,
    communityUrl,
    mySpace,
    markBadgesSeen,
    updateMySpaceProfile,
    getCourseProgress,
    getQuizForCourse,
    getAssignmentForCourse,
    getAssignmentsForCourse,
    quizResults,
    submissions,
    certificates
  } = useLMS();
  const isStaff = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  const [xp, setXp] = useState<{ points: number; levelTitle: string } | null>(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseSort, setCourseSort] = useState<"progress" | "title">("progress");

  // Account settings — Profile / Change Password / Notifications / Danger Zone
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // notifyCategories only affects staff-broadcast alerts, never a
  // student's own personal notifications — see the schema comment on
  // User.notifyCategories — so this section only renders for staff.
  const [notifyCategories, setNotifyCategories] = useState<NotifyCategory[]>([]);
  const [savingNotify, setSavingNotify] = useState(false);

  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  interface PaymentHistoryEntry {
    id: string;
    reference: string;
    courseTitle: string;
    courseSlug: string;
    paymentPlan: string;
    amount: number;
    status: "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED";
    channel: string | null;
    paidAt: string | null;
    createdAt: string;
  }
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryEntry[]>([]);

  interface ClassGoal {
    userId: string;
    name: string;
    goalStatement: string;
    isMe: boolean;
  }
  const [myGoalDraft, setMyGoalDraft] = useState("");
  const [classGoals, setClassGoals] = useState<ClassGoal[]>([]);
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    apiFetch("/api/lms/leaderboard")
      .then((res) => (res.ok ? res.json() : { leaderboard: [] }))
      .then((data) => {
        const me = (data.leaderboard || []).find((s: LeaderboardStudent) => s.isMe);
        if (me) setXp({ points: me.xpPoints, levelTitle: me.levelTitle });
      })
      .catch(() => {
        // leaderboard unavailable — the page still works without the XP stat
      });
  }, []);

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

  useEffect(() => {
    apiFetch("/api/payments/history")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPaymentHistory(data.transactions || []);
      })
      .catch(() => {
        // payment history unavailable — the rest of the dashboard still works
      });
  }, []);

  useEffect(() => {
    if (
      user?.role === "STUDENT" &&
      mySpace &&
      mySpace.onboarded === false &&
      typeof window !== "undefined" &&
      sessionStorage.getItem("bems_skip_welcome") !== "1"
    ) {
      router.replace("/welcome");
    }
  }, [user?.role, mySpace, router]);

  const primarySpaceCourse = mySpace?.courses?.[0] ?? null;
  const [prefGoalType, setPrefGoalType] = useState<MySpaceGoalType>("JOB");
  const [prefGoal, setPrefGoal] = useState("");
  const [prefExpLevel, setPrefExpLevel] = useState<MySpaceExperienceLevel>("BEGINNER");
  const [prefWeeklyHours, setPrefWeeklyHours] = useState<number>(6);
  const [prefMotivation, setPrefMotivation] = useState("");
  const [prefWeeklyRecap, setPrefWeeklyRecap] = useState<boolean>(true);
  const [prefShareWithTutor, setPrefShareWithTutor] = useState<boolean>(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showAppearancePicker, setShowAppearancePicker] = useState(false);
  const [draftAccent, setDraftAccent] = useState<MySpaceAccentColor>("purple");
  const [draftBanner, setDraftBanner] = useState<MySpaceBanner>("aurora");
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [appearanceMsg, setAppearanceMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Drafts start from the saved look each time the picker opens.
  const toggleAppearancePicker = () => {
    setAppearanceMsg(null);
    if (!showAppearancePicker) {
      setDraftAccent(mySpace?.appearance?.accentColor || "purple");
      setDraftBanner(mySpace?.appearance?.banner || "aurora");
    }
    setShowAppearancePicker((prev) => !prev);
  };

  const activeAccentColor: MySpaceAccentColor = showAppearancePicker
    ? draftAccent
    : mySpace?.appearance?.accentColor || "purple";
  const activeBanner: MySpaceBanner = showAppearancePicker
    ? draftBanner
    : mySpace?.appearance?.banner || "aurora";
  const activeAccentHex = showAppearancePicker
    ? getAccentHex(draftAccent)
    : mySpace?.appearance?.accentHex || getAccentHex(activeAccentColor);

  const handleSaveAppearance = async (reset = false) => {
    setSavingAppearance(true);
    setAppearanceMsg(null);
    const res = await updateMySpaceProfile(
      reset
        ? { accentColor: null, banner: null }
        : { accentColor: draftAccent, banner: draftBanner }
    );
    setSavingAppearance(false);
    if (!res.ok) {
      setAppearanceMsg({ type: "err", text: res.error || "Could not save your look." });
      return;
    }
    if (reset) {
      setDraftAccent("purple");
      setDraftBanner("aurora");
    }
    setAppearanceMsg({ type: "ok", text: reset ? "Reset to default look." : "Look saved!" });
  };

  useEffect(() => {
    if (!mySpace?.profile) return;
    if (mySpace.profile.goalType) setPrefGoalType(mySpace.profile.goalType);
    setPrefGoal(mySpace.profile.goal || "");
    if (mySpace.profile.experienceLevel) setPrefExpLevel(mySpace.profile.experienceLevel);
    if (typeof mySpace.profile.weeklyHours === "number") {
      setPrefWeeklyHours(mySpace.profile.weeklyHours);
    }
    setPrefMotivation(mySpace.profile.motivation || "");
    setPrefWeeklyRecap(mySpace.profile.weeklyRecapEmail ?? true);
    setPrefShareWithTutor(mySpace.profile.shareWithTutor ?? true);
  }, [mySpace?.profile]);

  const handleToggleShareWithTutor = async () => {
    const next = !prefShareWithTutor;
    setPrefShareWithTutor(next);
    setPrefsMsg(null);
    const res = await updateMySpaceProfile({ shareWithTutor: next });
    if (!res.ok) {
      setPrefShareWithTutor(!next);
      setPrefsMsg({ type: "err", text: res.error || "Could not update tutor sharing setting." });
    }
  };

  const handleToggleWeeklyRecap = async () => {
    const next = !prefWeeklyRecap;
    setPrefWeeklyRecap(next);
    setPrefsMsg(null);
    const res = await updateMySpaceProfile({ weeklyRecapEmail: next });
    if (!res.ok) {
      setPrefWeeklyRecap(!next);
      setPrefsMsg({ type: "err", text: res.error || "Could not update weekly email setting." });
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefsMsg(null);
    const res = await updateMySpaceProfile({
      goalType: prefGoalType,
      goal: prefGoal.trim() || undefined,
      experienceLevel: prefExpLevel,
      weeklyHours: prefWeeklyHours,
      motivation: prefMotivation.trim() || undefined,
      weeklyRecapEmail: prefWeeklyRecap,
      shareWithTutor: prefShareWithTutor
    });
    setSavingPrefs(false);
    if (!res.ok) {
      setPrefsMsg({ type: "err", text: res.error || "Could not save preferences." });
      return;
    }
    setPrefsMsg({ type: "ok", text: "Preferences saved." });
  };
  const cohortCountdownText = useMemo(() => {
    const cohort = primarySpaceCourse?.cohort;
    if (!cohort) return null;
    if (cohort.phase === "BEFORE_START") {
      if (cohort.daysToStart <= 0) return "Class starts today";
      if (cohort.daysToStart === 1) return "Class starts tomorrow";
      return `Class starts in ${cohort.daysToStart} days`;
    }
    if (cohort.phase === "IN_PROGRESS") {
      return `${cohort.name} · ${cohort.daysToEnd} ${cohort.daysToEnd === 1 ? "day" : "days"} to graduation`;
    }
    return `${cohort.name} · Completed`;
  }, [primarySpaceCourse]);

  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));
  const pendingApprovals = (userEnrollments || []).filter((e) => e.awaitingApproval);
  const mySubmissions = submissions.filter((s) => s.userId === user?.id);
  const myCertificates = certificates.filter((c) => c.userId === user?.id);

  // The student's primary track for the sidebar's Course Resume/Quiz links
  // and the Phase 2 Assessment block below — the first course they
  // enrolled in, same convention the Navbar's Accounts dropdown uses.
  const myCourse = enrolledCourses[0];
  const myFirstLessonId = myCourse?.modules[0]?.lessons[0]?.id;
  const myQuiz = myCourse ? getQuizForCourse(myCourse.id) : undefined;
  const myAssignment = myCourse ? getAssignmentForCourse(myCourse.id) : undefined;
  const myQuizResult = myQuiz ? quizResults[myQuiz.id] : undefined;
  // PRD §4.2 "small projects every 2-3 weeks" — milestones are separate
  // from the capstone, so each needs its own submission lookup rather than
  // assuming mySubmissions[0] is the capstone (it might be a milestone).
  const myMilestones = myCourse ? getAssignmentsForCourse(myCourse.id).filter((a) => a.type === "MILESTONE") : [];
  const myCapstoneSubmission = mySubmissions.find((s) => s.assignmentId === myAssignment?.id);

  useEffect(() => {
    if (!myCourse) return;
    apiFetch(`/api/lms/class-goals?courseId=${myCourse.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setClassGoals(data.goals || []);
        const mine = (data.goals || []).find((g: ClassGoal) => g.isMe);
        if (mine) setMyGoalDraft(mine.goalStatement);
      })
      .catch(() => {
        // class goals unavailable — the rest of the dashboard still works
      });
    // Depending on myCourse?.id (not the whole myCourse object, which is a
    // fresh array-derived reference every render) — re-fetching only when
    // the actual enrolled course changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myCourse?.id]);

  const handleSaveGoal = async () => {
    if (!myCourse) return;
    setSavingGoal(true);
    try {
      const res = await apiFetch("/api/lms/my-goal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: myCourse.id, goalStatement: myGoalDraft })
      });
      if (res.ok) {
        const refreshed = await apiFetch(`/api/lms/class-goals?courseId=${myCourse.id}`);
        if (refreshed.ok) setClassGoals((await refreshed.json()).goals || []);
      }
    } finally {
      setSavingGoal(false);
    }
  };

  const completedCoursesCount = enrolledCourses.filter(
    (c) => getCourseProgress(c.id).percent === 100
  ).length;
  const totalCompletedLessons = enrolledCourses.reduce(
    (sum, c) => sum + getCourseProgress(c.id).completed,
    0
  );

  const courseRows = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    const rows = enrolledCourses
      .map((course) => ({ course, progress: getCourseProgress(course.id) }))
      .filter(({ course }) => !q || course.title.toLowerCase().includes(q));
    return rows.sort((a, b) =>
      courseSort === "progress"
        ? b.progress.percent - a.progress.percent
        : a.course.title.localeCompare(b.course.title)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolledCourses, courseSearch, courseSort]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

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
    <div
      className="min-h-screen flex flex-col bg-[#FAF8FF]"
      style={{ "--space-accent": activeAccentHex } as React.CSSProperties}
    >
      <DashboardTour />
      <Navbar />

      {/* Profile Banner */}
      <div
        className="relative h-44 overflow-hidden transition-all duration-300"
        style={getBannerConfig(activeBanner).style}
      >
        {user?.role === "STUDENT" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex justify-end">
            <button
              type="button"
              onClick={toggleAppearancePicker}
              aria-expanded={showAppearancePicker}
              className="m-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/25 hover:bg-black/35 backdrop-blur-sm border border-white/25 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
              {showAppearancePicker ? "Close picker" : "Make it yours"}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Profile Row — stacked on 375px so avatar & level badge never overlap text */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 min-w-0">
            <div className="m-pop -mt-11 sm:-mt-14 mb-2 sm:mb-0 relative self-start shrink-0">
              {!isHydrated || !user ? (
                <div className="w-[88px] h-[88px] rounded-full bg-slate-200 animate-pulse ring-4 ring-white shadow-lg" />
              ) : (
                <UserAvatar
                  user={{ name: user.name, avatarUrl: user.avatarUrl }}
                  size={88}
                  editable
                  className="ring-4 ring-white shadow-lg text-xl sm:text-2xl"
                />
              )}
              {xp && (
                <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm whitespace-nowrap">
                  {xp.levelTitle}
                </span>
              )}
            </div>
            <div className="pt-1 sm:pt-3 min-w-0 space-y-1.5">
              {!isHydrated || !user ? (
                <div className="space-y-2">
                  <div className="h-8 w-52 rounded-lg bg-slate-200 animate-pulse" />
                  <div className="h-4 w-72 rounded bg-slate-200 animate-pulse" />
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl font-black text-[#303654] leading-tight">
                  {mySpace ? `${mySpace.greeting}, ${mySpace.firstName}` : user.name}
                </h1>
              )}

              {primarySpaceCourse ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-[#645F80] font-semibold">
                  <span className="text-[#303654] font-bold">{primarySpaceCourse.title}</span>
                  <span>Your tutor: {primarySpaceCourse.tutor}</span>
                  <span
                    className="inline-flex items-center gap-1 font-bold"
                    style={{ color: activeAccentHex }}
                  >
                    {primarySpaceCourse.deliveryMode === "VIRTUAL_ZOOM" ? (
                      <>
                        <Video className="w-3.5 h-3.5" /> Virtual, live online
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5" /> Physical, BEMS lab, Umuahia
                      </>
                    )}
                  </span>
                  {cohortCountdownText && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: activeAccentHex }}
                    >
                      {cohortCountdownText}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#645F80] font-semibold">
                  {xp && <span>{xp.points} XP</span>}
                  <span>{completedCoursesCount} Completed courses</span>
                  <span>{totalCompletedLessons} Completed lessons</span>
                </div>
              )}

              {mySpace?.profile?.goal && (
                <p className="text-xs sm:text-sm text-[#303654] font-medium">
                  You&apos;re here to:{" "}
                  <span className="font-bold" style={{ color: activeAccentHex }}>
                    {mySpace.profile.goal}
                  </span>
                </p>
              )}
            </div>
          </div>

          <a href="#my-courses-list" className="self-start sm:self-auto shrink-0">
            <Button variant="outline" size="sm" className="shrink-0 text-xs sm:text-sm">
              View my courses
            </Button>
          </a>
        </div>

        {/* New badge celebration: up top, where the student looks first */}
        {user?.role === "STUDENT" && Array.isArray(mySpace?.badges) && mySpace.badges.length > 0 && (
          <div className="mb-6">
            <BadgeCelebration
              badges={mySpace.badges}
              accentHex={activeAccentHex}
              onMarkSeen={markBadgesSeen}
            />
          </div>
        )}

        {/* Make It Yours Picker */}
        {showAppearancePicker && user?.role === "STUDENT" && (
          <div className="mb-8 bg-white rounded-2xl border border-[#F1E2F5] p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F7EDF9]">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#303654]">
                  Make it yours
                </h2>
                <p className="text-xs text-[#645F80]">
                  Pick your accent colour and banner — changes preview live above and on your home page.
                </p>
              </div>
              {appearanceMsg && (
                <span
                  className={`text-xs font-bold ${
                    appearanceMsg.type === "err" ? "text-rose-600" : "text-emerald-700"
                  }`}
                >
                  {appearanceMsg.text}
                </span>
              )}
            </div>

            {/* Colour Swatches (with names) */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold text-[#303654]">Accent Colour</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {MY_SPACE_ACCENTS.map((swatch) => {
                  const selected = draftAccent === swatch.id;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => setDraftAccent(swatch.id)}
                      aria-pressed={selected}
                      className={`m-press flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs font-bold cursor-pointer transition-all ${
                        selected
                          ? "bg-[#FAF8FF] text-[#303654] shadow-xs"
                          : "border-slate-200 bg-white text-[#475569] hover:border-slate-300"
                      }`}
                      style={selected ? { borderColor: swatch.hex, boxShadow: `0 0 0 1px ${swatch.hex}` } : undefined}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span className="truncate">{swatch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner Thumbnails */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold text-[#303654]">Header Banner</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {MY_SPACE_BANNERS.map((b) => {
                  const selected = draftBanner === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setDraftBanner(b.id)}
                      aria-pressed={selected}
                      className={`m-press rounded-xl border p-1.5 text-left cursor-pointer transition-all ${
                        selected ? "bg-[#FAF8FF]" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      style={selected ? { borderColor: activeAccentHex, boxShadow: `0 0 0 1px ${activeAccentHex}` } : undefined}
                    >
                      <div className="h-12 w-full rounded-lg mb-1.5" style={b.style} />
                      <div className="text-[11px] font-bold text-[#303654] px-1 truncate">
                        {b.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Mini Preview */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="h-10 px-4 flex items-center justify-between text-white text-xs font-bold" style={getBannerConfig(draftBanner).style}>
                <span>Live preview</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: activeAccentHex }}
                >
                  {MY_SPACE_ACCENTS.find((a) => a.id === draftAccent)?.name}
                </span>
              </div>
              <div className="p-3 bg-[#FAF8FF] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#303654]">
                  {mySpace ? `${mySpace.greeting}, ${mySpace.firstName}` : "Your Space"}
                </span>
                <span
                  className="px-3 py-1 rounded-lg text-white font-bold text-[11px]"
                  style={{ backgroundColor: activeAccentHex }}
                >
                  Resume Lesson
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                disabled={savingAppearance}
                onClick={() => void handleSaveAppearance(true)}
                className="m-press px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#645F80] hover:text-[#303654] cursor-pointer disabled:opacity-60"
              >
                Reset to default
              </button>
              <button
                type="button"
                disabled={savingAppearance}
                onClick={() => void handleSaveAppearance(false)}
                className="m-press px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: activeAccentHex }}
              >
                {savingAppearance ? "Saving…" : "Save look"}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Dashboard Quick Navigation Bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
          <Link
            href="/dashboard"
            className="m-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#303654] text-white text-xs font-bold whitespace-nowrap shadow-xs shrink-0"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Link
            href="/subscriptions"
            className="m-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#F1E2F5] text-[#303654] text-xs font-semibold whitespace-nowrap hover:border-[#AE54C6] shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#AE54C6]" /> Subscriptions
          </Link>
          {myCourse && myFirstLessonId && (
            <Link
              href={`/learn/${myCourse.slug}/${myFirstLessonId}`}
              className="m-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7EDF9] border border-purple-200 text-[#AE54C6] text-xs font-bold whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5" /> Resume Course
            </Link>
          )}
          {myCourse && myQuiz && (
            <Link
              href={`/learn/${myCourse.slug}/quiz/${myQuiz.id}`}
              className="m-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#F1E2F5] text-[#303654] text-xs font-semibold whitespace-nowrap shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Quiz
            </Link>
          )}
          <Link
            href="/courses"
            className="m-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#F1E2F5] text-[#303654] text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <Compass className="w-3.5 h-3.5 text-blue-500" /> Catalog
          </Link>
          <Link
            href="/dashboard#edit-profile"
            className="m-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#F1E2F5] text-[#303654] text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <UserCog className="w-3.5 h-3.5 text-slate-500" /> Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 pb-14">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block bg-[#303654] rounded-2xl p-3 h-fit lg:sticky lg:top-28 space-y-1">
            <SidebarLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" active />
            <SidebarLink href="/subscriptions" icon={<CreditCard className="w-4 h-4" />} label="My Subscriptions" />
            <SidebarLink
              href={myCourse && myFirstLessonId ? `/learn/${myCourse.slug}/${myFirstLessonId}` : "/courses"}
              icon={<FileText className="w-4 h-4" />}
              label="Course Resume"
            />
            <SidebarLink
              href={myCourse && myQuiz ? `/learn/${myCourse.slug}/quiz/${myQuiz.id}` : "/courses"}
              icon={<HelpCircle className="w-4 h-4" />}
              label="Quiz"
            />
            <SidebarLink href="/courses" icon={<Compass className="w-4 h-4" />} label="Explore Courses" />

            <div className="my-2 border-t border-white/10" />
            <SidebarLink href="/dashboard#edit-profile" icon={<UserCog className="w-4 h-4" />} label="Edit Profile" />

            <div className="my-2 border-t border-white/10" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-300 hover:bg-white/10 hover:text-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </aside>

          {/* Main Content */}
          <div className="space-y-8 min-w-0">
            {/* My Space: Continue where you left off + Weekly Goal Ring */}
            {mySpace && (
              <div className="space-y-5">
                <div
                  data-reveal
                  className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#F7EDF9] text-[#AE54C6] text-[11px] font-extrabold uppercase tracking-wider">
                        Continue where you left off
                      </span>
                      {(() => {
                        const days = mySpace.streaks?.days ?? mySpace.streak;
                        const studiedToday = mySpace.streaks?.studiedToday ?? true;
                        const weeksOnTarget = mySpace.streaks?.weeksOnTarget ?? 0;
                        return (
                          <>
                            {days > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-extrabold">
                                <Flame className="w-3.5 h-3.5" /> {days}-day streak
                              </span>
                            )}
                            {!studiedToday && days > 0 && (
                              <span className="text-[11px] font-bold text-amber-700">
                                Study today to keep your {days}-day streak
                              </span>
                            )}
                            {weeksOnTarget > 1 && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold">
                                {weeksOnTarget} weeks in a row on target
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {!primarySpaceCourse ? (
                      <>
                        <h2 className="text-lg sm:text-xl font-black text-[#303654]">
                          Pick your first BEMS track
                        </h2>
                        <p className="text-xs sm:text-sm text-[#645F80]">
                          Enroll in a hands-on cohort to unlock lessons, live classes, and tutor feedback.
                        </p>
                        <Link href="/courses" className="inline-block pt-1">
                          <Button variant="purple" size="sm" className="gap-2">
                            Browse courses <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </>
                    ) : !primarySpaceCourse.hasAccess ? (
                      <>
                        <h2 className="text-lg sm:text-xl font-black text-[#303654]">
                          {primarySpaceCourse.title} ·{" "}
                          {primarySpaceCourse.deliveryMode === "VIRTUAL_ZOOM"
                            ? "Virtual, live online"
                            : "Physical, BEMS lab, Umuahia"}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#645F80]">
                          {mySpace.firstName}, your{" "}
                          {primarySpaceCourse.cohort ? `${primarySpaceCourse.cohort.name} ` : ""}
                          seat is awaiting admissions confirmation. Reviews are completed within 24 hours, and your space will open as soon as it&apos;s approved.
                        </p>
                      </>
                    ) : primarySpaceCourse.nextLesson ? (
                      <>
                        <h2 className="text-lg sm:text-xl font-black text-[#303654]">
                          {primarySpaceCourse.nextLesson.moduleTitle} · {primarySpaceCourse.nextLesson.title}
                        </h2>
                        <div className="space-y-1.5 max-w-md">
                          <div className="flex items-center justify-between text-xs font-bold text-[#645F80]">
                            <span>{primarySpaceCourse.title}</span>
                            <span style={{ color: activeAccentHex }}>
                              {primarySpaceCourse.progress.percent}% ({primarySpaceCourse.progress.completed}/{primarySpaceCourse.progress.total})
                            </span>
                          </div>
                          <div className="w-full bg-[#F7EDF9] rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${primarySpaceCourse.progress.percent}%`,
                                backgroundColor: activeAccentHex
                              }}
                            />
                          </div>
                        </div>
                        <div className="pt-1">
                          <Link href={primarySpaceCourse.nextLesson.href}>
                            <Button
                              size="sm"
                              className="gap-2 text-white border-0"
                              style={{ backgroundColor: activeAccentHex }}
                            >
                              <PlayCircle className="w-4 h-4" /> Resume Lesson
                            </Button>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-lg sm:text-xl font-black text-[#303654]">
                          All lessons completed in {primarySpaceCourse.title}!
                        </h2>
                        <p className="text-xs sm:text-sm text-[#645F80]">
                          Submit your final capstone or view your verified certificate.
                        </p>
                        <div className="flex flex-wrap gap-2.5 pt-1">
                          <Link href={`/courses/${primarySpaceCourse.slug}`}>
                            <Button variant="purple" size="sm" className="gap-2">
                              Open Course <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Weekly Goal Ring + M-S Streak Strip */}
                  <div className="bg-[#FAF8FF] border border-[#F1E2F5] rounded-2xl p-4 shrink-0 space-y-3">
                    <div className="flex items-center gap-4">
                      {(() => {
                        const pct = Math.min(100, Math.max(0, mySpace.week.percentOfGoal ?? 0));
                        const radius = 28;
                        const circumference = 2 * Math.PI * radius;
                        const dashOffset = circumference - (pct / 100) * circumference;
                        return (
                          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 68 68">
                              <circle
                                cx="34"
                                cy="34"
                                r={radius}
                                fill="none"
                                stroke="#E5C8ED"
                                strokeWidth="6"
                              />
                              <circle
                                cx="34"
                                cy="34"
                                r={radius}
                                fill="none"
                                stroke={activeAccentHex}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                              />
                            </svg>
                            <span className="absolute text-xs font-black text-[#303654]">
                              {mySpace.week.goalMinutes ? `${pct}%` : `${mySpace.week.lessonsCompleted}`}
                            </span>
                          </div>
                        );
                      })()}
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#303654]">This week</div>
                        {mySpace.week.goalMinutes ? (
                          <p className="text-xs text-[#645F80] font-semibold mt-0.5">
                            {mySpace.week.minutesStudied} of {mySpace.week.goalMinutes} min this week
                          </p>
                        ) : (
                          <div className="mt-0.5 space-y-1">
                            <p className="text-xs text-[#645F80] font-semibold">
                              {mySpace.week.minutesStudied} min this week
                            </p>
                            <Link
                              href="/welcome"
                              className="text-[11px] font-bold text-[#AE54C6] hover:underline inline-block"
                            >
                              Set weekly goal
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {mySpace.week.days && mySpace.week.days.length === 7 && (
                      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#F1E2F5]">
                        {["M", "T", "W", "T", "F", "S", "S"].map((label, idx) => {
                          const day = mySpace.week.days![idx];
                          return (
                            <div
                              key={day.date || idx}
                              title={`${day.date}: ${day.minutes} min`}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-colors ${
                                day.active
                                  ? "text-white"
                                  : day.isFuture
                                  ? "bg-slate-50 border border-slate-200/60 text-slate-300"
                                  : "bg-white border border-slate-300 text-[#645F80]"
                              } ${day.isToday ? "ring-2 ring-offset-1" : ""}`}
                              style={{
                                backgroundColor: day.active ? activeAccentHex : undefined,
                                ...(day.isToday ? { ["--tw-ring-color" as string]: activeAccentHex } : {})
                              }}
                            >
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Class + Latest Feedback */}
                {primarySpaceCourse && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 shadow-xs flex flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#AE54C6]">
                          <Calendar className="w-4 h-4" /> Next Class
                        </div>
                        {primarySpaceCourse.nextLiveSession ? (
                          <>
                            <h3 className="text-base font-extrabold text-[#303654]">
                              {primarySpaceCourse.nextLiveSession.title}
                            </h3>
                            <p className="text-xs text-[#645F80] font-semibold">
                              {new Date(
                                primarySpaceCourse.nextLiveSession.scheduledAt
                              ).toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs sm:text-sm text-[#645F80]">
                            No upcoming live class scheduled yet.
                          </p>
                        )}
                      </div>
                      {primarySpaceCourse.nextLiveSession?.meetingUrl && (
                        <a
                          href={primarySpaceCourse.nextLiveSession.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="self-start"
                        >
                          <Button variant="purple" size="sm" className="gap-1.5">
                            Join Live Class <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>

                    <div className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                          <MessageCircle className="w-4 h-4" /> Latest Feedback
                        </div>
                        {primarySpaceCourse.latestFeedback?.score !== null &&
                          primarySpaceCourse.latestFeedback?.score !== undefined && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black">
                              {primarySpaceCourse.latestFeedback.score}/100
                            </span>
                          )}
                      </div>
                      {primarySpaceCourse.latestFeedback ? (
                        <>
                          <div className="text-xs font-bold text-[#645F80]">
                            {primarySpaceCourse.latestFeedback.assignmentTitle}
                          </div>
                          <p className="text-xs sm:text-sm text-[#303654] font-medium">
                            <strong className="font-extrabold">
                              {primarySpaceCourse.latestFeedback.gradedBy ||
                                primarySpaceCourse.tutor}
                              :
                            </strong>{" "}
                            {primarySpaceCourse.latestFeedback.feedback || "Graded"}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs sm:text-sm text-[#645F80]">
                          No graded feedback yet — submit assignments to get notes from{" "}
                          {primarySpaceCourse.tutor}.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Vertical Learning Roadmap */}
                {primarySpaceCourse?.roadmap && (
                  <CourseRoadmap
                    roadmap={primarySpaceCourse.roadmap}
                    courseTitle={primarySpaceCourse.title}
                    color={activeAccentHex}
                  />
                )}

                {/* Milestone Badges */}
                {Array.isArray(mySpace.badges) && mySpace.badges.length > 0 && (
                  <BadgeShelf badges={mySpace.badges} accentHex={activeAccentHex} />
                )}
              </div>
            )}

            {/* Stat Cards */}
            <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="m-lift bg-[#FEF6E0] rounded-2xl p-5 flex items-center gap-4">
                <div className="m-icon w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#F7C32E] shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#303654] block leading-tight">
                    <CountUp value={enrolledCourses.length} />
                  </span>
                  <span className="text-xs font-semibold text-[#645F80]">Total Courses</span>
                </div>
              </div>
              <div className="m-lift bg-[#F7EDF9] rounded-2xl p-5 flex items-center gap-4">
                <div className="m-icon w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#AE54C6] shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#303654] block leading-tight">
                    <CountUp value={totalCompletedLessons} />
                  </span>
                  <span className="text-xs font-semibold text-[#645F80]">Complete Lessons</span>
                </div>
              </div>
              <div className="m-lift bg-[#E5F5F7] rounded-2xl p-5 flex items-center gap-4">
                <div className="m-icon w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#17A2B8] shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#303654] block leading-tight">
                    <CountUp value={myCertificates.length} />
                  </span>
                  <span className="text-xs font-semibold text-[#645F80]">Achieved Certificates</span>
                </div>
              </div>
            </div>

            {communityUrl && (
              <div
                data-reveal
                className="m-lift bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="m-icon w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#1D2026]">
                      Student WhatsApp Community
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-900/80 mt-0.5">
                      Chat with your instructor and classmates
                    </p>
                  </div>
                </div>
                <a
                  href={communityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m-press inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm shadow-sm shrink-0 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Join the WhatsApp community
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Student My Payments (instalment schedule & receipts) */}
            <StudentMyPaymentsCard accentHex={activeAccentHex} />

            {/* My Courses List */}
            <div data-reveal id="my-courses-list" className="bg-white rounded-2xl border border-[#F1E2F5] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h2 className="text-xl font-black text-[#303654]">
                  My Courses List ({enrolledCourses.length})
                </h2>
                {enrolledCourses.length > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-[#FAF8FF] border border-[#F1E2F5] rounded-lg px-3 py-2">
                      <Search className="w-3.5 h-3.5 text-[#8580A3]" />
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search"
                        className="text-xs bg-transparent focus:outline-none w-28"
                      />
                    </div>
                    <select
                      value={courseSort}
                      onChange={(e) => setCourseSort(e.target.value as "progress" | "title")}
                      className="text-xs font-semibold bg-[#FAF8FF] border border-[#F1E2F5] rounded-lg px-3 py-2 text-[#645F80] focus:outline-none"
                    >
                      <option value="progress">Sort: Progress</option>
                      <option value="title">Sort: Title</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Pending Admissions Approvals */}
              {pendingApprovals.length > 0 && (
                <div className="space-y-3 mb-6">
                  {pendingApprovals.map((pa) => {
                    const course = courses.find((c) => c.id === pa.courseId || c.slug === pa.courseId);
                    return (
                      <div
                        key={pa.id}
                        className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                                Registration Pending Confirmation
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Payment Confirmed
                              </span>
                            </div>
                            <div className="text-sm font-extrabold text-[#303654] mt-0.5">
                              {course?.title || pa.courseId} · ₦{pa.amountPaid.toLocaleString()} Paid
                            </div>
                            <div className="text-xs text-[#645F80] mt-0.5 max-w-xl">
                              Our admissions team is reviewing your registration and assigning your cohort seat. You will receive an email as soon as your classroom lessons and video content unlock.
                            </div>
                          </div>
                        </div>
                        {BEMS_WHATSAPP_NUMBER && (
                        <a
                          href={buildWhatsAppLink(
                            BEMS_WHATSAPP_NUMBER,
                            `Hello BEMS Admissions, I am checking on my registration approval for ${course?.title || pa.courseId}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-full sm:w-auto"
                        >
                          <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs font-bold border-amber-400 bg-white hover:bg-amber-100/50">
                            <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                            <span>Admissions Help Desk</span>
                          </Button>
                        </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {enrolledCourses.length === 0 ? (
                <div className="text-center py-10">
                  <GraduationCap className="w-9 h-9 text-[#E5C8ED] mx-auto mb-3" />
                  <p className="text-sm text-[#645F80] mb-4">
                    You&apos;re not enrolled in any courses yet.
                  </p>
                  <Link href="/courses">
                    <Button variant="purple" size="sm">
                      Browse Tracks
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="bg-[#303654] text-white text-left text-xs">
                        <th className="px-6 py-3 font-bold">Course Title</th>
                        <th className="px-4 py-3 font-bold">Total Lectures</th>
                        <th className="px-4 py-3 font-bold">Completed</th>
                        <th className="px-6 py-3 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F7EDF9]">
                      {courseRows.map(({ course, progress }) => {
                        const visual = getCourseVisual(course.slug);
                        const firstLessonId = course.modules[0]?.lessons[0]?.id || "les-1";
                        const enrollment = (userEnrollments || []).find(
                          (e) => e.courseId === course.id
                        );
                        const classTypeLabel =
                          enrollment?.deliveryMode === "VIRTUAL_ZOOM"
                            ? "Virtual"
                            : enrollment?.deliveryMode === "PHYSICAL_LAB"
                            ? "Physical"
                            : null;
                        return (
                          <tr key={course.id}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3.5">
                                <div
                                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 [&_svg]:w-5 [&_svg]:h-5"
                                  style={{ backgroundColor: visual.solid }}
                                >
                                  {visual.icon}
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    href={`/courses/${course.slug}`}
                                    className="font-bold text-sm text-[#303654] hover:text-[#AE54C6] transition-colors block truncate"
                                  >
                                    {course.title}
                                  </Link>
                                  {classTypeLabel && (
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#F7EDF9] text-[#AE54C6] text-[10.5px] font-bold">
                                      Class: {classTypeLabel}
                                    </span>
                                  )}
                                  <div className="w-36 bg-[#F7EDF9] rounded-full h-1.5 mt-1.5 overflow-hidden">
                                    <div
                                      className="h-full bg-[#AE54C6]"
                                      style={{ width: `${progress.percent}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-[#AE54C6]">
                                    {progress.percent}%
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-[#645F80]">
                              <span className="inline-flex items-center gap-1.5">
                                <Table2 className="w-3.5 h-3.5 text-[#8580A3]" /> {progress.total}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-[#645F80]">{progress.completed}</td>
                            <td className="px-6 py-4 text-right">
                              <Link href={`/learn/${course.slug}/${firstLessonId}`}>
                                <Button variant={progress.percent === 100 ? "outline" : "purple"} size="sm">
                                  {progress.percent === 100 ? "Review" : "Continue"}
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <LearningInsights />

            <ReferAFriendCard />

            {/* Milestones — PRD §4.2 "small projects every 2-3 weeks,"
                separate from the final capstone below. */}
            {myCourse && myMilestones.length > 0 && (
              <div data-reveal className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F7EDF9]">
                  <FileText className="w-4 h-4 text-[#AE54C6]" />
                  <h2 className="text-base font-extrabold text-[#303654]">
                    Milestone Projects — {myCourse.title}
                  </h2>
                </div>
                <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myMilestones.map((m) => {
                    const sub = mySubmissions.find((s) => s.assignmentId === m.id);
                    return (
                      <Link
                        key={m.id}
                        href={`/learn/${myCourse.slug}/assignment/${m.id}`}
                        className="m-lift block p-4 rounded-xl border border-[#F1E2F5] hover:border-[#AE54C6]/40 transition-colors"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#AE54C6] mb-1">
                          Milestone {m.order}
                        </div>
                        <div className="text-sm font-bold text-[#303654] mb-2">{m.title}</div>
                        {sub?.score != null ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Graded ({sub.score}/100)
                          </span>
                        ) : sub ? (
                          <span className="text-xs font-semibold text-[#AE54C6]">Submitted — awaiting grade</span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600">Not submitted yet</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Class Goal — PRD §4.2: "each student states their goal in
                the class group... saying it out loud, in front of others." */}
            {myCourse && (
              <div data-reveal className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F7EDF9]">
                  <Target className="w-4 h-4 text-[#AE54C6]" />
                  <h2 className="text-base font-extrabold text-[#303654]">
                    Class Goal — {myCourse.title}
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mb-5">
                  <input
                    type="text"
                    value={myGoalDraft}
                    onChange={(e) => setMyGoalDraft(e.target.value)}
                    placeholder="State your goal out loud to your classmates — e.g. 'I will finish and land my first client by March.'"
                    maxLength={240}
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#F1E2F5] text-sm focus:outline-none focus:border-[#AE54C6]"
                  />
                  <Button onClick={handleSaveGoal} disabled={savingGoal} variant="purple" className="shrink-0">
                    {savingGoal ? "Saving…" : "Save Goal"}
                  </Button>
                </div>
                {classGoals.length === 0 ? (
                  <p className="text-xs text-[#645F80]">
                    No one in your cohort has stated a goal yet — be the first.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {classGoals.map((g) => (
                      <li
                        key={g.userId}
                        className={`text-xs p-3 rounded-lg ${
                          g.isMe ? "bg-[#FAF8FF] border border-[#F1E2F5]" : "bg-slate-50"
                        }`}
                      >
                        <strong className="text-[#303654]">{g.isMe ? "You" : g.name}:</strong>{" "}
                        <span className="text-[#645F80]">{g.goalStatement}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Phase 2 Assessment & Credentials Card */}
            {myCourse && (
              <div data-reveal className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F7EDF9]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="purple">PHASE 2 ASSESSMENT</Badge>
                      <Badge variant="gold">ACCREDITATION</Badge>
                    </div>
                    <h2 className="text-2xl font-black text-[#303654]">
                      Assessment &amp; Verified Certificates
                    </h2>
                  </div>
                  <p className="text-xs text-[#645F80] max-w-sm">
                    Pass your {myCourse.title} exam and submit your Capstone project to receive an
                    institutional BEMS certificate with tamper-proof QR verification.
                  </p>
                </div>

                <div data-reveal-group className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. Quiz Widget */}
                  <div className="m-lift bg-[#FAF8FF] border border-[#F1E2F5] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#645F80]">STEP 1</span>
                        <Award className="m-icon w-5 h-5 text-[#AE54C6]" />
                      </div>
                      <h4 className="font-bold text-[#303654] text-base mb-1">
                        Technical Knowledge Exam
                      </h4>
                      <p className="text-xs text-[#645F80] mb-4">
                        Multiple-choice exam validating core fundamentals.
                      </p>
                      {myQuizResult ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Passed ({myQuizResult.score}%)
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-semibold">Not attempted yet</span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F1E2F5]">
                      {myQuiz ? (
                        <Link href={`/learn/${myCourse.slug}/quiz/${myQuiz.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            Take / Review Exam
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          Exam Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 2. Capstone Submission Widget */}
                  <div className="m-lift bg-[#FAF8FF] border border-[#F1E2F5] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#645F80]">STEP 2</span>
                        <FileText className="m-icon w-5 h-5 text-[#AE54C6]" />
                      </div>
                      <h4 className="font-bold text-[#303654] text-base mb-1">Capstone Project</h4>
                      <p className="text-xs text-[#645F80] mb-4">
                        Submit GitHub repository and live deployment URL.
                      </p>
                      {myCapstoneSubmission?.score != null ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Graded (
                          {myCapstoneSubmission.score}/100)
                        </div>
                      ) : myCapstoneSubmission ? (
                        <span className="text-xs text-[#AE54C6] font-semibold">Submitted — awaiting grade</span>
                      ) : (
                        <span className="text-xs text-amber-600 font-semibold">Pending submission</span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F1E2F5]">
                      {myAssignment ? (
                        <Link href={`/learn/${myCourse.slug}/assignment/${myAssignment.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Capstone Portal
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          Capstone Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 3. Certificate Widget */}
                  <div className="m-lift bg-[#FAF8FF] border border-[#F1E2F5] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#645F80]">STEP 3</span>
                        <Sparkles className="m-icon w-5 h-5 text-amber-500" />
                      </div>
                      <h4 className="font-bold text-[#303654] text-base mb-1">
                        Institutional Certificate
                      </h4>
                      <p className="text-xs text-[#645F80] mb-4">
                        Print-ready digital certificate with public verification.
                      </p>
                      {myCertificates.length > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-[#AE54C6]" /> Issued (
                          {myCertificates[0].gradeTitle})
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Awaiting grading</span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F1E2F5]">
                      {myCertificates.length > 0 ? (
                        <Link href={`/certificate/${myCertificates[0].id}`}>
                          <Button variant="purple" size="sm" className="w-full">
                            View Official Certificate <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="sm" disabled className="w-full">
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/ai">
                <Button variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" /> Ask AI Tutor
                </Button>
              </Link>
              {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
                <>
                  <Link href="/tutor">
                    <Button variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" /> Tutor View
                    </Button>
                  </Link>
                  <Link href="/instructor/grading">
                    <Button variant="outline">
                      <Award className="w-4 h-4 mr-2" /> Grading Studio
                    </Button>
                  </Link>
                </>
              )}
              {communityUrl && (
              <a href={communityUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-[#303654] font-bold">
                  <MessageCircle className="w-4 h-4 mr-2" /> Class WhatsApp
                </Button>
              </a>
              )}
              <Link href="/courses" className="ml-auto">
                <Button variant="outline" className="gap-1.5">
                  Explore All Tracks <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Payment History — the student's own copy of the same ledger
                staff see in /admin, so "have I actually paid" never has to
                be taken on faith. */}
            {paymentHistory.length > 0 && (
              <div
                id="payment-history"
                className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs space-y-4 scroll-mt-28"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-[#F7EDF9]">
                  <CreditCard className="w-4 h-4 text-[#AE54C6]" />
                  <h2 className="text-base font-extrabold text-[#303654]">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[#8580A3] uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-2 pr-4">Course</th>
                        <th className="py-2 pr-4">Plan</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Channel</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F7EDF9]">
                      {paymentHistory.map((txn) => {
                        const statusClass =
                          txn.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700"
                            : txn.status === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700";
                        return (
                          <tr key={txn.id}>
                            <td className="py-2.5 pr-4 font-bold text-[#303654]">{txn.courseTitle}</td>
                            <td className="py-2.5 pr-4 text-[#645F80] capitalize">{txn.paymentPlan}</td>
                            <td className="py-2.5 pr-4 font-medium text-[#303654]">
                              ₦{txn.amount.toLocaleString()}
                            </td>
                            <td className="py-2.5 pr-4 text-[#645F80] capitalize">{txn.channel || "—"}</td>
                            <td className="py-2.5 pr-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusClass}`}>
                                {txn.status}
                              </span>
                            </td>
                            <td className="py-2.5 pr-4 text-[#8580A3]">
                              {new Date(txn.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Phase 4 Student Cards: Public Portfolio, Notes & Bookmarks, Reminders */}
            {user?.role === "STUDENT" && (
              <>
                <PublicPortfolioCard accentHex={activeAccentHex} />
                <NotesAndSavedCard accentHex={activeAccentHex} />
                <RemindersCard accentHex={activeAccentHex} />
              </>
            )}

            {/* My Space Preferences Card */}
            {mySpace && user?.role === "STUDENT" && (
              <form
                onSubmit={handleSavePreferences}
                className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F7EDF9]">
                  <div>
                    <h2 className="text-base font-extrabold text-[#303654]">My Space Preferences</h2>
                    <p className="text-xs text-[#645F80] mt-0.5">
                      Your tutor and your AI tutor see your goal, level and weekly time, to help you. Your reason for joining stays private.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 shrink-0">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-xs font-bold text-[#303654]">Share with my tutor</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={prefShareWithTutor}
                        onClick={() => void handleToggleShareWithTutor()}
                        className={`m-press relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          prefShareWithTutor ? "bg-[#AE54C6]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            prefShareWithTutor ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-xs font-bold text-[#303654]">Weekly progress email</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={prefWeeklyRecap}
                        onClick={() => void handleToggleWeeklyRecap()}
                        className={`m-press relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          prefWeeklyRecap ? "bg-[#AE54C6]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            prefWeeklyRecap ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                {prefsMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      prefsMsg.type === "ok"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {prefsMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">
                      Main Goal
                    </label>
                    <select
                      value={prefGoalType}
                      onChange={(e) => setPrefGoalType(e.target.value as MySpaceGoalType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] bg-white text-sm text-[#303654]"
                    >
                      <option value="JOB">Get a tech job</option>
                      <option value="FREELANCE">Freelance / earn on my own</option>
                      <option value="OWN_PRODUCT">Build my own product or business</option>
                      <option value="UPSKILL">Grow in my current job</option>
                      <option value="OTHER">Something else</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">
                      Experience Level
                    </label>
                    <select
                      value={prefExpLevel}
                      onChange={(e) => setPrefExpLevel(e.target.value as MySpaceExperienceLevel)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] bg-white text-sm text-[#303654]"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">
                      Weekly Hours (1–60)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={prefWeeklyHours}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v)) setPrefWeeklyHours(v);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] bg-white text-sm text-[#303654]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">
                      Goal in your own words
                    </label>
                    <input
                      type="text"
                      maxLength={160}
                      value={prefGoal}
                      onChange={(e) => setPrefGoal(e.target.value)}
                      placeholder="e.g. Build websites for shops in Umuahia"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] bg-white text-sm text-[#303654]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">
                      Why you joined BEMS
                    </label>
                    <input
                      type="text"
                      maxLength={280}
                      value={prefMotivation}
                      onChange={(e) => setPrefMotivation(e.target.value)}
                      placeholder="Your personal reminder"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] bg-white text-sm text-[#303654]"
                    />
                  </div>
                </div>

                <Button type="submit" variant="purple" size="sm" disabled={savingPrefs}>
                  {savingPrefs ? "Saving…" : "Save Preferences"}
                </Button>
              </form>
            )}

            {/* Account Settings */}
            <form
              id="edit-profile"
              onSubmit={handleSaveProfile}
              className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs space-y-5 scroll-mt-28"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#F7EDF9]">
                <UserCog className="w-4 h-4 text-[#AE54C6]" />
                <h2 className="text-base font-extrabold text-[#303654]">Profile</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#F1E2F5] text-sm focus:outline-none focus:border-[#AE54C6]"
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#F1E2F5] text-sm focus:outline-none focus:border-[#AE54C6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#645F80] mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#F1E2F5] bg-[#FAF8FF] text-sm text-[#8580A3]"
                />
                <p className="text-[11px] text-[#8580A3] mt-1">
                  Your email is your sign-in ID and can&apos;t be changed here. Your photo can be
                  changed via the camera icon at the top of this page.
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

            <form
              onSubmit={handleChangePassword}
              className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs space-y-5"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#F7EDF9]">
                <Lock className="w-4 h-4 text-[#AE54C6]" />
                <h2 className="text-base font-extrabold text-[#303654]">Change Password</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#645F80] mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#F1E2F5] text-sm focus:outline-none focus:border-[#AE54C6]"
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#F1E2F5] text-sm focus:outline-none focus:border-[#AE54C6]"
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#F1E2F5] text-sm focus:outline-none focus:border-[#AE54C6]"
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

            {isStaff && (
              <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F7EDF9]">
                  <Bell className="w-4 h-4 text-[#AE54C6]" />
                  <h2 className="text-base font-extrabold text-[#303654]">Staff Notification Preferences</h2>
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

            <div id="danger-zone" className="bg-red-50 rounded-2xl border border-red-200 p-6 sm:p-8 space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2 pb-3 border-b border-red-100">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h2 className="text-base font-extrabold text-red-900">Danger Zone</h2>
              </div>

              {!showDeactivateConfirm ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-red-900">Deactivate Account</h3>
                    <p className="text-xs text-red-700 mt-0.5">
                      Signs you out everywhere and blocks login. Your data is kept — contact admissions
                      to restore it later.
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
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <RequireRole allow={["STUDENT", "INSTRUCTOR", "ADMIN"]}>
      <StudentDashboardContent />
    </RequireRole>
  );
}
