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
  Bot,
  Code2,
  Video,
  MessageSquare,
  Trophy,
  Search,
  BookOpen,
  GraduationCap,
  Table2
} from "lucide-react";

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
    courses,
    enrolledCourseIds,
    getCourseProgress,
    getQuizForCourse,
    getAssignmentForCourse,
    quizResults,
    submissions,
    certificates
  } = useLMS();

  const [xp, setXp] = useState<{ points: number; levelTitle: string } | null>(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseSort, setCourseSort] = useState<"progress" | "title">("progress");

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
            <span className="block px-3.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8580A3]">
              Learning Tools
            </span>
            <SidebarLink href="/ai" icon={<Bot className="w-4 h-4" />} label="24/7 AI Tutor" />
            <SidebarLink href="/sandbox" icon={<Code2 className="w-4 h-4" />} label="Coding Sandbox" />
            <SidebarLink href="/live" icon={<Video className="w-4 h-4" />} label="Live Classes" />
            <SidebarLink href="/community" icon={<MessageSquare className="w-4 h-4" />} label="Community Chat" />
            <SidebarLink href="/leaderboard" icon={<Trophy className="w-4 h-4" />} label="Leaderboard" />

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
                      {mySubmissions.length > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Graded (
                          {mySubmissions[0].score}/100)
                        </div>
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
