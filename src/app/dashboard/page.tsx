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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { getCourseVisual } from "@/lib/course-visuals";
import { UserAvatar } from "@/components/UserAvatar";
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
  Target
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
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
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
    logout,
    updateProfile,
    courses,
    enrolledCourseIds,
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

  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));
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
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Profile Banner */}
      <div className="relative bg-gradient-to-r from-[#303654] via-[#3E4569] to-[#303654] h-44 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Profile Row */}
        <div className="-mt-14 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            <div className="relative shrink-0">
              <UserAvatar
                user={user ? { name: user.name, avatarUrl: user.avatarUrl } : { name: "Student", avatarUrl: null }}
                size={112}
                editable
                className="ring-4 ring-white shadow-lg text-2xl"
              />
              {xp && (
                <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm whitespace-nowrap">
                  {xp.levelTitle}
                </span>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#303654]">
                {user?.name || "Student"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs sm:text-sm text-[#645F80] font-semibold">
                {xp && <span>{xp.points} XP</span>}
                <span>{completedCoursesCount} Completed courses</span>
                <span>{totalCompletedLessons} Completed lessons</span>
              </div>
            </div>
          </div>

          <a href="#my-courses-list">
            <Button variant="outline" className="shrink-0">
              View my courses
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 pb-14">
          {/* Sidebar */}
          <aside className="bg-[#303654] rounded-2xl p-3 h-fit lg:sticky lg:top-28 space-y-1">
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
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#FEF6E0] rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#F7C32E] shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#303654] block leading-tight">
                    {enrolledCourses.length}
                  </span>
                  <span className="text-xs font-semibold text-[#645F80]">Total Courses</span>
                </div>
              </div>
              <div className="bg-[#F7EDF9] rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#AE54C6] shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#303654] block leading-tight">
                    {totalCompletedLessons}
                  </span>
                  <span className="text-xs font-semibold text-[#645F80]">Complete Lessons</span>
                </div>
              </div>
              <div className="bg-[#E5F5F7] rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#17A2B8] shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#303654] block leading-tight">
                    {myCertificates.length}
                  </span>
                  <span className="text-xs font-semibold text-[#645F80]">Achieved Certificates</span>
                </div>
              </div>
            </div>

            {/* My Courses List */}
            <div id="my-courses-list" className="bg-white rounded-2xl border border-[#F1E2F5] p-6 shadow-xs">
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
              <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F7EDF9]">
                  <FileText className="w-4 h-4 text-[#AE54C6]" />
                  <h2 className="text-base font-extrabold text-[#303654]">
                    Milestone Projects — {myCourse.title}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myMilestones.map((m) => {
                    const sub = mySubmissions.find((s) => s.assignmentId === m.id);
                    return (
                      <Link
                        key={m.id}
                        href={`/learn/${myCourse.slug}/assignment/${m.id}`}
                        className="block p-4 rounded-xl border border-[#F1E2F5] hover:border-[#AE54C6]/40 transition-colors"
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
              <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
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
              <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. Quiz Widget */}
                  <div className="bg-[#FAF8FF] border border-[#F1E2F5] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#645F80]">STEP 1</span>
                        <Award className="w-5 h-5 text-[#AE54C6]" />
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
                  <div className="bg-[#FAF8FF] border border-[#F1E2F5] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#645F80]">STEP 2</span>
                        <FileText className="w-5 h-5 text-[#AE54C6]" />
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
                  <div className="bg-[#FAF8FF] border border-[#F1E2F5] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#645F80]">STEP 3</span>
                        <Sparkles className="w-5 h-5 text-amber-500" />
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
                <Link href="/instructor/grading">
                  <Button variant="outline">
                    <Award className="w-4 h-4 mr-2" /> Grading Studio
                  </Button>
                </Link>
              )}
              <a href="https://chat.whatsapp.com/BEMS-FutureSkills-2026" target="_blank" rel="noreferrer">
                <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-[#303654] font-bold">
                  <MessageCircle className="w-4 h-4 mr-2" /> Class WhatsApp
                </Button>
              </a>
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
