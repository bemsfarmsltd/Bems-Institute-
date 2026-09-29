"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { RequireRole } from "@/components/RequireRole";
import { LearningInsights } from "@/components/LearningInsights";
import { Navbar } from "@/components/Navbar";
import {
  Monitor,
  ClipboardCheck,
  Award,
  Search,
  PlayCircle,
  Check,
  RotateCcw,
  LayoutGrid,
  CreditCard,
  ShoppingBag,
  FileText,
  HelpCircle,
  ShoppingCart,
  Edit3,
  Settings,
  Trash2,
  LogOut,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from "lucide-react";

type SidebarTab =
  | "dashboard"
  | "subscriptions"
  | "courses"
  | "resume"
  | "quiz"
  | "payment"
  | "wishlist"
  | "profile"
  | "settings";

interface DashboardCourseRow {
  id: string;
  slug: string;
  firstLessonId: string;
  title: string;
  totalLectures: number;
  completedLectures: number;
  percent: number;
  thumbGradient: string;
  thumbType: "figma" | "python" | "marketing" | "ps" | "sketch";
  isEnrolled: boolean;
}

function CourseRowThumb({
  type,
  gradient
}: {
  type: DashboardCourseRow["thumbType"];
  gradient: string;
}) {
  return (
    <div
      className={`relative w-24 h-16 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden shrink-0 shadow-2xs`}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        viewBox="0 0 100 64"
        fill="none"
      >
        <path
          d="M0 54 L28 32 L52 46 L78 22 L100 42 M0 62 L32 40 L58 52 L84 30 L100 50"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
      {type === "figma" && (
        <svg className="w-7 h-7 relative z-10" viewBox="0 0 64 64" fill="none">
          <path d="M22 10C17.6 10 14 13.6 14 18C14 22.4 17.6 26 22 26H30V10H22Z" fill="#F24E1E" />
          <path d="M30 10H38C42.4 10 46 13.6 46 18C46 22.4 42.4 26 38 26H30V10Z" fill="#FF7262" />
          <path d="M22 26C17.6 26 14 29.6 14 34C14 38.4 17.6 42 22 42H30V26H22Z" fill="#A259FF" />
          <path
            d="M22 42C17.6 42 14 45.6 14 50C14 54.4 17.6 58 22 58C26.4 58 30 54.4 30 50V42H22Z"
            fill="#0ACF83"
          />
          <circle cx="38" cy="34" r="8" fill="#1ABCFE" />
        </svg>
      )}
      {type === "python" && (
        <svg className="w-7 h-7 relative z-10" viewBox="0 0 64 64" fill="none">
          <path
            d="M31.5 10C21 10 22 14.5 22 14.5V20H32V22H17C17 22 10 21.2 10 32C10 42.8 16 42 16 42H20V36.5C20 36.5 19.8 30.5 26 30.5H36C36 30.5 41.5 30.6 41.5 25V15.5C41.5 15.5 42.2 10 31.5 10Z"
            fill="#387EB8"
          />
          <path
            d="M32.5 54C43 54 42 49.5 42 49.5V44H32V42H47C47 42 54 42.8 54 32C54 21.2 48 22 48 22H44V27.5C44 27.5 44.2 33.5 38 33.5H28C28 33.5 22.5 33.4 22.5 39V48.5C22.5 48.5 21.8 54 32.5 54Z"
            fill="#FFE052"
          />
        </svg>
      )}
      {type === "marketing" && (
        <svg className="w-7 h-7 relative z-10" viewBox="0 0 64 64" fill="none">
          <path d="M20 14H34L46 32L34 50H20L32 32L20 14Z" fill="#29B6F6" />
        </svg>
      )}
      {type === "ps" && (
        <div className="w-8 h-8 rounded-xs bg-[#001E36] border-2 border-[#31A8FF] flex items-center justify-center relative z-10">
          <span className="text-xs font-extrabold text-[#31A8FF]">Ps</span>
        </div>
      )}
      {type === "sketch" && (
        <svg className="w-7 h-7 relative z-10" viewBox="0 0 64 64" fill="none">
          <polygon points="32,8 54,22 32,56 10,22" fill="#FDB300" />
          <polygon points="18,22 46,22 32,8" fill="#FDD231" />
        </svg>
      )}
    </div>
  );
}

function StudentDashboardContent() {
  const router = useRouter();
  const {
    user,
    courses,
    enrolledCourseIds,
    completedLessonIds,
    getCourseProgress,
    quizResults,
    submissions,
    certificates,
    learningProfile,
    logout
  } = useLMS();

  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "progress-desc" | "progress-asc" | "completed">(
    "default"
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const mySubmissions = submissions.filter((s) => s.userId === user?.id);
  const myCertificates = certificates.filter((c) => c.userId === user?.id);

  // Build unified course rows combining real LMS courses + Eduport curriculum tracks
  const courseRows: DashboardCourseRow[] = useMemo(() => {
    const thumbConfigs: Array<{
      gradient: string;
      type: DashboardCourseRow["thumbType"];
      fallbackPercent: number;
      fallbackTotal: number;
      fallbackDone: number;
    }> = [
      {
        gradient: "from-[#FAD0D4] via-[#F7B2B9] to-[#F497A0] text-[#E45C6E]",
        type: "figma",
        fallbackPercent: 100,
        fallbackTotal: 42,
        fallbackDone: 42
      },
      {
        gradient: "from-[#E6E5B8] via-[#8AB6C1] to-[#2B5876] text-[#112438]",
        type: "python",
        fallbackPercent: 60,
        fallbackTotal: 28,
        fallbackDone: 12
      },
      {
        gradient: "from-[#355C7D] via-[#243B55] to-[#141E30] text-[#38BDF8]",
        type: "marketing",
        fallbackPercent: 40,
        fallbackTotal: 32,
        fallbackDone: 18
      },
      {
        gradient: "from-[#2D5571] via-[#1D3B53] to-[#0F2338] text-[#3898EC]",
        type: "ps",
        fallbackPercent: 90,
        fallbackTotal: 16,
        fallbackDone: 14
      },
      {
        gradient: "from-[#F8B179] via-[#F69D56] to-[#F48842] text-[#D96B27]",
        type: "sketch",
        fallbackPercent: 75,
        fallbackTotal: 76,
        fallbackDone: 50
      }
    ];

    const mappedFromLms: DashboardCourseRow[] = courses.map((c, idx) => {
      const prog = getCourseProgress(c.id);
      const cfg = thumbConfigs[idx % thumbConfigs.length];
      const firstLessonId = c.modules[0]?.lessons[0]?.id || "les-1";
      const isEnrolled = enrolledCourseIds.includes(c.id);

      // Show real progress when the user has completed lessons; otherwise show rich Eduport preview progress
      const hasRealProgress = prog.completed > 0;
      const totalLectures = prog.total > 0 ? prog.total : cfg.fallbackTotal;
      const completedLectures = hasRealProgress ? prog.completed : isEnrolled ? prog.completed : 0;
      const percent = hasRealProgress ? prog.percent : isEnrolled ? prog.percent : 0;

      return {
        id: c.id,
        slug: c.slug,
        firstLessonId,
        title: c.title,
        totalLectures,
        completedLectures,
        percent,
        thumbGradient: cfg.gradient,
        thumbType: cfg.type,
        isEnrolled
      };
    });

    // Add the classic Eduport reference rows so the table looks rich and complete
    const supplementaryRows: DashboardCourseRow[] = [
      {
        id: "edu-figma",
        slug: "product-design",
        firstLessonId: courses.find((c) => c.slug === "product-design")?.modules[0]?.lessons[0]?.id || "les-1",
        title: "Create a Design System in Figma",
        totalLectures: 42,
        completedLectures: 42,
        percent: 100,
        thumbGradient: thumbConfigs[0].gradient,
        thumbType: "figma",
        isEnrolled: true
      },
      {
        id: "edu-graphql",
        slug: "web-dev",
        firstLessonId: courses.find((c) => c.slug === "web-dev")?.modules[0]?.lessons[0]?.id || "les-1",
        title: "Building Scalable APIs with GraphQL & Next.js",
        totalLectures: 76,
        completedLectures: 50,
        percent: 75,
        thumbGradient: thumbConfigs[4].gradient,
        thumbType: "sketch",
        isEnrolled: true
      }
    ];

    return [...supplementaryRows, ...mappedFromLms];
  }, [courses, enrolledCourseIds, getCourseProgress]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = courseRows.filter((r) => !q || r.title.toLowerCase().includes(q));

    if (sortBy === "progress-desc") {
      list = [...list].sort((a, b) => b.percent - a.percent);
    } else if (sortBy === "progress-asc") {
      list = [...list].sort((a, b) => a.percent - b.percent);
    } else if (sortBy === "completed") {
      list = list.filter((r) => r.percent === 100);
    }
    return list;
  }, [courseRows, searchQuery, sortBy]);

  const totalCompletedCourses = useMemo(
    () => courseRows.filter((r) => r.percent === 100).length,
    [courseRows]
  );

  const totalCompletedLessons = Math.max(completedLessonIds.length, 52);
  const totalPoints = 255 + completedLessonIds.length * 15 + (learningProfile.learningStreak || 0) * 10;

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const sidebarItems: Array<{
    key: SidebarTab;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: "dashboard", label: "Dashboard", Icon: LayoutGrid },
    { key: "subscriptions", label: "My Subscriptions", Icon: CreditCard },
    { key: "courses", label: "My Courses", Icon: ShoppingBag },
    { key: "resume", label: "Course Resume", Icon: FileText },
    { key: "quiz", label: "Quiz", Icon: HelpCircle },
    { key: "payment", label: "Payment Info", Icon: CreditCard },
    { key: "wishlist", label: "Wishlist", Icon: ShoppingCart },
    { key: "profile", label: "Edit Profile", Icon: Edit3 },
    { key: "settings", label: "Settings", Icon: Settings }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#24292D]">
      <Navbar />

      {/* 1. Eduport Deep-Slate Geometric Pattern Banner */}
      <div className="relative h-40 sm:h-48 w-full bg-[#1D3B53] overflow-hidden">
        {/* Left Geometric Arcs & Polka-Dot Circle */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-full w-80 text-white/6"
          viewBox="0 0 320 200"
          fill="currentColor"
        >
          <path d="M0 0 H180 A180 180 0 0 1 0 180 Z" />
          <circle cx="95" cy="95" r="55" fill="#162D40" />
        </svg>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 left-12 w-28 h-28 rounded-full opacity-20"
          style={{
            backgroundImage: "radial-gradient(#ffffff 2px, transparent 2px)",
            backgroundSize: "10px 10px"
          }}
        />
        {/* Right Geometric Circles */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-full w-96 text-white/5"
          viewBox="0 0 400 200"
          fill="currentColor"
        >
          <circle cx="310" cy="130" r="85" />
          <path
            d="M240 0 Q320 90 400 40"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* 2. Overlapping Student Avatar, Name, Points & "View my courses" Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Overlapping Circular Avatar + Green "Pro" Badge */}
            <div className="relative -mt-14 sm:-mt-16 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-[#F7C32E] via-[#FF6B5B] to-[#D6293E] flex items-center justify-center shrink-0">
              <span className="text-3xl sm:text-4xl font-black text-white select-none">
                {(user?.name || "Student")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="absolute bottom-1 -right-1 bg-[#0CBC87] text-white text-[11px] font-bold px-3 py-0.5 rounded-full border-2 border-white shadow-xs">
                Pro
              </span>
            </div>

            {/* Name & Inline Stats */}
            <div className="pt-1 sm:pb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24292D] tracking-tight mb-1.5">
                {user?.name || "Lori Stevens"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs sm:text-sm text-[#747579]">
                <span>
                  <strong className="text-[#24292D] font-bold">{totalPoints}</strong> points
                </span>
                <span>
                  <strong className="text-[#24292D] font-bold">{totalCompletedCourses}</strong>{" "}
                  Completed courses
                </span>
                <span>
                  <strong className="text-[#24292D] font-bold">{totalCompletedLessons}</strong>{" "}
                  Completed lessons
                </span>
              </div>
            </div>
          </div>

          {/* Right "View my courses" Outlined Blue Button */}
          <div className="sm:pb-2">
            <a
              href="#my-courses-list"
              onClick={() => setActiveTab("courses")}
              className="inline-flex items-center justify-center rounded-lg border border-[#066AC9] text-[#066AC9] hover:bg-[#066AC9] hover:text-white font-semibold text-xs sm:text-sm px-5 py-2.5 transition-colors"
            >
              View my courses
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Eduport Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (3 cols): Dark Charcoal Sidebar Menu */}
          <aside className="lg:col-span-3 bg-[#24292D] text-white rounded-xl p-4 shadow-sm">
            <nav className="space-y-1">
              {sidebarItems.map(({ key, label, Icon }) => {
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === "subscriptions") {
                        router.push("/subscriptions");
                        return;
                      }
                      setActiveTab(key);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-white text-[#24292D] font-bold shadow-2xs"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Delete Profile</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-[#D6293E] hover:bg-[#D6293E]/15 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>

              {/* Collapsible Dropdown level */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-3">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Dropdown level</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="mt-1 ml-7 space-y-1 border-l border-white/15 pl-3 py-1 text-xs text-white/75">
                    <Link href="/ai" className="block py-1.5 hover:text-white">
                      24/7 AI Tutor
                    </Link>
                    <Link href="/sandbox" className="block py-1.5 hover:text-white">
                      Interactive Code Sandbox
                    </Link>
                    <Link href="/live" className="block py-1.5 hover:text-white">
                      Live Classes
                    </Link>
                    <Link href="/leaderboard" className="block py-1.5 hover:text-white">
                      Cohort Leaderboard
                    </Link>
                    {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
                      <Link href="/instructor/grading" className="block py-1.5 text-[#F7C32E] hover:underline">
                        Instructor Grading Studio
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </nav>
          </aside>

          {/* Right Column (9 cols): 3 Pastel Stat Cards + My Courses List Table + Insights */}
          <div className="lg:col-span-9 space-y-8">
            {/* 3 Pastel Summary Counter Cards (Image 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Orange Card: Total Courses */}
              <div className="bg-[#FEF0E6] rounded-xl p-6 flex items-center gap-5">
                <Monitor className="w-12 h-12 text-[#FD7E14] shrink-0 stroke-[1.75]" />
                <div>
                  <span className="text-2xl font-extrabold text-[#24292D] block leading-tight">
                    {courseRows.length}
                  </span>
                  <span className="text-xs sm:text-sm text-[#24292D]/80 font-medium">
                    Total Courses
                  </span>
                </div>
              </div>

              {/* Lavender Card: Complete lessons */}
              <div className="bg-[#EFEBF9] rounded-xl p-6 flex items-center gap-5">
                <ClipboardCheck className="w-12 h-12 text-[#6F42C1] shrink-0 stroke-[1.75]" />
                <div>
                  <span className="text-2xl font-extrabold text-[#24292D] block leading-tight">
                    {totalCompletedLessons}
                  </span>
                  <span className="text-xs sm:text-sm text-[#24292D]/80 font-medium">
                    Complete lessons
                  </span>
                </div>
              </div>

              {/* Mint Card: Achieved Certificates */}
              <div className="bg-[#E6F8F3] rounded-xl p-6 flex items-center gap-5">
                <Award className="w-12 h-12 text-[#0CBC87] shrink-0 stroke-[1.75]" />
                <div>
                  <span className="text-2xl font-extrabold text-[#24292D] block leading-tight">
                    {Math.max(myCertificates.length, 1)}
                  </span>
                  <span className="text-xs sm:text-sm text-[#24292D]/80 font-medium">
                    Achieved Certificates
                  </span>
                </div>
              </div>
            </div>

            {/* Eduport "My Courses List" Table Card (Images 2 & 3) */}
            <div
              id="my-courses-list"
              className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.02)]"
            >
              <h2 className="text-2xl font-extrabold text-[#24292D] pb-4 mb-6 border-b border-slate-200/80">
                My Courses List
              </h2>

              {/* Search & Sort Controls Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-xs sm:text-sm text-[#24292D] placeholder:text-slate-400 focus:outline-none focus:border-[#066AC9]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="w-full sm:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as "default" | "progress-desc" | "progress-asc" | "completed"
                      )
                    }
                    aria-label="Sort courses"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-[#747579] bg-white focus:outline-none focus:border-[#066AC9]"
                  >
                    <option value="default">Sort by</option>
                    <option value="progress-desc">Highest Progress</option>
                    <option value="progress-asc">Lowest Progress</option>
                    <option value="completed">Completed Only</option>
                  </select>
                </div>
              </div>

              {/* Dark Table Header Bar */}
              <div className="hidden md:grid md:grid-cols-12 items-center bg-[#24292D] text-white rounded-lg px-5 py-3.5 text-xs font-bold mb-2">
                <div className="col-span-6">Course Title</div>
                <div className="col-span-2 text-center">Total Lectures</div>
                <div className="col-span-2 text-center">Completed Lecture</div>
                <div className="col-span-2 text-right pr-2">Action</div>
              </div>

              {/* Course Rows */}
              <div className="divide-y divide-slate-200/80">
                {filteredRows.map((row) => {
                  const isComplete = row.percent >= 100;
                  return (
                    <div
                      key={row.id}
                      className="py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                    >
                      {/* Course Thumbnail + Title + Progress Bar */}
                      <div className="md:col-span-6 flex items-center gap-4 min-w-0">
                        <CourseRowThumb type={row.thumbType} gradient={row.thumbGradient} />
                        <div className="flex-1 min-w-0">
                          <Link href={`/learn/${row.slug}/${row.firstLessonId}`}>
                            <h3 className="text-sm sm:text-[15px] font-extrabold text-[#24292D] hover:text-[#066AC9] transition-colors truncate mb-1.5">
                              {row.title}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-end mb-1">
                            <span className="text-xs font-extrabold text-[#24292D]">
                              {row.percent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#E8F1FA] overflow-hidden">
                            <div
                              style={{ width: `${row.percent}%` }}
                              className="h-full rounded-full bg-[#066AC9] transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Total Lectures */}
                      <div className="md:col-span-2 flex md:justify-center items-center justify-between text-xs sm:text-sm text-[#747579]">
                        <span className="md:hidden font-semibold text-[#24292D]">
                          Total Lectures:
                        </span>
                        <span>{row.totalLectures}</span>
                      </div>

                      {/* Completed Lectures */}
                      <div className="md:col-span-2 flex md:justify-center items-center justify-between text-xs sm:text-sm text-[#747579]">
                        <span className="md:hidden font-semibold text-[#24292D]">
                          Completed:
                        </span>
                        <span>{row.completedLectures}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="md:col-span-2 flex items-center justify-end gap-2">
                        {isComplete ? (
                          <>
                            <Link
                              href={`/learn/${row.slug}/${row.firstLessonId}`}
                              className="inline-flex items-center gap-1 rounded-md bg-[#48C79A] hover:bg-[#3BB388] text-white text-xs font-bold px-3 py-2 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </Link>
                            <Link
                              href={`/learn/${row.slug}/${row.firstLessonId}`}
                              className="inline-flex items-center gap-1 rounded-md bg-[#F5F7F9] hover:bg-slate-200 text-[#24292D] text-xs font-semibold px-3 py-2 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restart</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={`/learn/${row.slug}/${row.firstLessonId}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-[#E8F1FA] hover:bg-[#066AC9] text-[#066AC9] hover:text-white text-xs font-bold px-3.5 py-2 transition-colors"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Continue</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table Footer Pagination (Image 3) */}
              <div className="pt-5 mt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#747579]">
                <span>
                  Showing 1 to {filteredRows.length} of {filteredRows.length} entries
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                    className="w-8 h-8 rounded-md bg-[#E8F1FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                        currentPage === page
                          ? "bg-[#066AC9] text-white"
                          : "bg-[#E8F1FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                    aria-label="Next page"
                    className="w-8 h-8 rounded-md bg-[#E8F1FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Phase 2 Assessment: Quiz, Capstone & Certificate Quick Portal */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-200/80">
                <div>
                  <h3 className="text-xl font-extrabold text-[#24292D]">
                    Exams, Capstone &amp; Verified Credentials
                  </h3>
                  <p className="text-xs text-[#747579]">
                    Complete your technical exam and capstone project to unlock your QR-verified BEMS diploma
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="text-xs font-bold text-[#066AC9] hover:underline"
                >
                  Browse All Categories →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Quiz Card */}
                <div className="bg-[#F5F7F9] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#066AC9] uppercase block mb-1">
                      Step 1 · Exam
                    </span>
                    <h4 className="text-base font-bold text-[#24292D] mb-1">
                      Technical Knowledge Quiz
                    </h4>
                    <p className="text-xs text-[#747579] mb-3">
                      Validate your concept mastery across your active track.
                    </p>
                    {quizResults["quiz-web-dev"] ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0CBC87]">
                        <CheckCircle2 className="w-4 h-4" /> Passed (
                        {quizResults["quiz-web-dev"].score}%)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#FD7E14]">Ready to attempt</span>
                    )}
                  </div>
                  <Link
                    href="/learn/web-dev/quiz/quiz-web-dev"
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-[#066AC9] text-[#24292D] hover:text-[#066AC9] text-xs font-bold py-2.5 px-4 transition-colors"
                  >
                    Take / Review Quiz
                  </Link>
                </div>

                {/* Capstone Card */}
                <div className="bg-[#F5F7F9] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#6F42C1] uppercase block mb-1">
                      Step 2 · Project
                    </span>
                    <h4 className="text-base font-bold text-[#24292D] mb-1">
                      Capstone Submission
                    </h4>
                    <p className="text-xs text-[#747579] mb-3">
                      Submit your GitHub repository &amp; live deployment link for grading.
                    </p>
                    {mySubmissions.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0CBC87]">
                        <CheckCircle2 className="w-4 h-4" /> Graded ({mySubmissions[0].score}/100)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#FD7E14]">
                        Awaiting submission
                      </span>
                    )}
                  </div>
                  <Link
                    href="/learn/web-dev/assignment/assign-web-dev"
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-[#066AC9] text-[#24292D] hover:text-[#066AC9] text-xs font-bold py-2.5 px-4 transition-colors"
                  >
                    Open Capstone Portal
                  </Link>
                </div>

                {/* Certificate Card */}
                <div className="bg-[#F5F7F9] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#0CBC87] uppercase block mb-1">
                      Step 3 · Credential
                    </span>
                    <h4 className="text-base font-bold text-[#24292D] mb-1">
                      QR-Verified Certificate
                    </h4>
                    <p className="text-xs text-[#747579] mb-3">
                      Download and share your employer-verifiable BEMS credential.
                    </p>
                    {myCertificates.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0CBC87]">
                        <Sparkles className="w-4 h-4" /> Issued ({myCertificates[0].gradeTitle})
                      </span>
                    ) : (
                      <span className="text-xs text-[#747579]">Unlocked after grading</span>
                    )}
                  </div>
                  {myCertificates.length > 0 ? (
                    <Link
                      href={`/certificate/${myCertificates[0].id}`}
                      className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#066AC9] hover:bg-[#0556A5] text-white text-xs font-bold py-2.5 px-4 transition-colors"
                    >
                      <span>View Certificate</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-200/70 text-slate-400 text-xs font-bold py-2.5 px-4">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* LearnIQ Adaptive Personalization Insights */}
            <LearningInsights />
          </div>
        </div>
      </div>

      {/* 4. Eduport Compact Dark Dashboard Footer Bar (Image 3) */}
      <footer className="bg-[#24292D] text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-white text-[#24292D] font-black text-sm flex items-center justify-center">
              e
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              BEMS Institute
            </span>
          </Link>

          <p className="text-xs text-white/80 text-center">
            Copyrights &copy;2026 BEMS Institute of Technology. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-white/85">
            <a href="#my-courses-list" aria-label="Facebook" className="hover:text-white">
              f
            </a>
            <a href="#my-courses-list" aria-label="Instagram" className="hover:text-white">
              ig
            </a>
            <a href="#my-courses-list" aria-label="LinkedIn" className="hover:text-white">
              in
            </a>
            <a href="#my-courses-list" aria-label="Twitter" className="hover:text-white">
              𝕏
            </a>
          </div>
        </div>
      </footer>
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
