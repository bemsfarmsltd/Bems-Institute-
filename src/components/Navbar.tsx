"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Button } from "./ui/button";
import { NotificationBell } from "./NotificationBell";
import { UserAvatar } from "./UserAvatar";
import {
  QrCode,
  Sparkles,
  Bot,
  Code2,
  Video,
  MessageSquare,
  Trophy,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  Search,
  BookOpen,
  CreditCard,
  ShoppingBag,
  FileText,
  HelpCircle,
  Edit3,
  Trash2,
  FilePlus,
  FileCheck,
  TrendingUp,
  Star,
  MoreHorizontal
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isHydrated, logout, courses, enrolledCourseIds, getQuizForCourse } = useLMS();
  const myCourse = courses.find((c) => enrolledCourseIds.includes(c.id));
  const myFirstLessonId = myCourse?.modules[0]?.lessons[0]?.id;
  const myQuiz = myCourse ? getQuizForCourse(myCourse.id) : undefined;
  const dashboardHref = user?.role === "ADMIN" ? "/admin" : user?.role === "INSTRUCTOR" ? "/instructor" : "/dashboard";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const q = navSearch.trim();
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  const navLinkClass = (href: string) =>
    `inline-flex items-center gap-1 transition-colors ${
      isActive(href)
        ? "text-[#AE54C6] font-extrabold"
        : "text-[#24292D] hover:text-[#AE54C6]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 min-w-0 shrink lg:shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/images/bems-logo.jpg"
                  alt="BEMS Logo"
                  fill
                  sizes="(min-width: 640px) 64px, 48px"
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-[#24292D] text-xs sm:text-base tracking-tight block leading-tight truncate">
                  BEMS INSTITUTE
                </span>
                <span className="text-[7px] sm:text-[9px] font-bold text-[#AE54C6] tracking-normal sm:tracking-wider uppercase block truncate">
                  OF TECHNOLOGY &amp; VOCATIONAL STUDIES
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation: Home, Resources ⌄, Accounts ⌄ (with nested Instructor/Student flyouts), More */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-[13px] font-semibold whitespace-nowrap">
            <Link href="/" className={navLinkClass("/")}>
              Home
            </Link>

            {/* "Resources ⌄" Dropdown */}
            <div className="relative group py-2">
              <button
                type="button"
                className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${
                  pathname.startsWith("/courses")
                    ? "text-[#AE54C6]"
                    : "text-[#747579] group-hover:text-[#AE54C6]"
                }`}
              >
                <span>Resources</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>

              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(24,20,61,0.12)] border border-slate-100 p-2 z-50">
                <Link
                  href="/courses"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-semibold text-[#AE54C6] bg-[#F7EDF9]/60 hover:bg-[#F7EDF9]"
                >
                  <span>Course</span>
                </Link>
                <Link
                  href="/courses/web-dev"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <span>Full-Stack Web Dev</span>
                </Link>
                <Link
                  href="/courses/ai-automation"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <span>AI &amp; Automation</span>
                </Link>
                <Link
                  href="/courses/product-design"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <span>Product Design (UI/UX)</span>
                </Link>
                <Link
                  href="/courses/cybersecurity"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <span>Cybersecurity Defense</span>
                </Link>
                <Link
                  href="/instructor"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <span>Become an Instructor</span>
                </Link>
                <Link
                  href="/subscriptions"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <span>Tuition &amp; Admissions</span>
                </Link>
                <Link
                  href="/qr-studio"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <span>Banner QR Studio</span>
                </Link>
              </div>
            </div>

            {/* "Accounts ⌄" Multi-Level Dropdown */}
            <div className="relative group py-2">
              <button
                type="button"
                className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${
                  pathname.startsWith("/dashboard") ||
                  pathname.startsWith("/instructor") ||
                  pathname.startsWith("/admin")
                    ? "text-[#AE54C6]"
                    : "text-[#747579] group-hover:text-[#AE54C6]"
                }`}
              >
                <span>Accounts</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>

              {/* First-Level Accounts Menu */}
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(24,20,61,0.14)] border border-slate-100 p-2 z-50">
                {/* Nested Sub-Menu 1: Instructor ••• (Image 2) — only shown to
                    instructors/admins or signed-out visitors, matching the
                    mobile drawer's gate below; a logged-in student has no
                    reason to see the instructor console in this menu. */}
                {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN" || !user) && (
                <div className="relative group/instructor">
                  <Link
                    href="/instructor"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#747579] group-hover/instructor:bg-[#F7EDF9] group-hover/instructor:text-[#AE54C6] transition-colors"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <UserIcon className="w-4 h-4" />
                      <span>Instructor</span>
                    </span>
                    <MoreHorizontal className="w-4 h-4" />
                  </Link>

                  {/* Flyout to the right for Instructor */}
                  <div className="invisible opacity-0 group-hover/instructor:visible group-hover/instructor:opacity-100 transition-all duration-150 absolute left-full top-0 ml-1.5 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(24,20,61,0.14)] border border-slate-100 p-2 z-50">
                    <Link
                      href="/courses"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Courses</span>
                    </Link>
                    <Link
                      href="/admin/courses"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6]"
                    >
                      <FilePlus className="w-3.5 h-3.5" />
                      <span>Create Course</span>
                    </Link>
                    <Link
                      href="/admin/courses"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6]"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Course Added</span>
                    </Link>
                    <Link
                      href="/admin/analytics"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6]"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Earnings</span>
                    </Link>
                    <Link
                      href="/admin/students"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6]"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Students</span>
                    </Link>
                    <Link
                      href="/instructor/grading"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6]"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Grading</span>
                    </Link>
                  </div>
                </div>
                )}

                {/* Nested Sub-Menu 2: Student ••• (Image 1) */}
                <div className="relative group/student">
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#747579] group-hover/student:bg-[#F7EDF9] group-hover/student:text-[#AE54C6] transition-colors"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>Student</span>
                    </span>
                    <MoreHorizontal className="w-4 h-4" />
                  </Link>

                  {/* Flyout to the right for Student */}
                  <div className="invisible opacity-0 group-hover/student:visible group-hover/student:opacity-100 transition-all duration-150 absolute left-full top-0 ml-1.5 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(24,20,61,0.14)] border border-slate-100 p-2 z-50">
                    <Link
                      href="/subscriptions"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#AE54C6] bg-[#F7EDF9]/60 hover:bg-[#F7EDF9]"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>My Subscriptions</span>
                    </Link>
                    <Link
                      href="/dashboard#my-courses-list"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Courses</span>
                    </Link>
                    <Link
                      href={myCourse && myFirstLessonId ? `/learn/${myCourse.slug}/${myFirstLessonId}` : "/dashboard"}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Course Resume</span>
                    </Link>
                    <Link
                      href={myCourse && myQuiz ? `/learn/${myCourse.slug}/quiz/${myQuiz.id}` : "/dashboard"}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6]"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Quiz</span>
                    </Link>
                  </div>
                </div>

                {/* Direct Account Items */}
                {(user?.role === "ADMIN" || !user) && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6] transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
                )}
                <Link
                  href="/account"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6] transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Link>
                <Link
                  href="/account#danger-zone"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#747579] hover:bg-[#F7EDF9] hover:text-[#AE54C6] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Profile</span>
                </Link>

              </div>
            </div>

            {/* "•••" More Menu */}
            <div className="relative group py-2">
              <button
                type="button"
                aria-label="More links"
                className="inline-flex items-center text-[#747579] group-hover:text-[#AE54C6] cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full w-48 bg-white rounded-xl shadow-[0_10px_40px_rgba(24,20,61,0.12)] border border-slate-100 p-2 z-50">
                <Link
                  href="/ai"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <Bot className="w-3.5 h-3.5 text-[#AE54C6]" /> AI Tutor
                </Link>
                <Link
                  href="/sandbox"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#AE54C6]" /> Sandbox
                </Link>
                <Link
                  href="/live"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <Video className="w-3.5 h-3.5 text-[#AE54C6]" /> Live Studio
                </Link>
                <Link
                  href="/community"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#AE54C6]" /> Community
                </Link>
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#F7EDF9]/50 hover:text-[#AE54C6]"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#AE54C6]" /> Leaderboard
                </Link>
              </div>
            </div>

            <Link href={dashboardHref} className={navLinkClass(dashboardHref)}>
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Dashboard</span>
            </Link>
          </nav>

          {/* Right Search Input + User / Auth Actions */}
          <div className="flex items-center gap-2.5">
            {/* Eduport Navbar Search Input */}
            <form
              onSubmit={handleNavSearch}
              className="hidden sm:flex items-center bg-white border border-slate-200 rounded-lg px-3.5 py-2 w-44 lg:w-56 focus-within:border-[#AE54C6] transition-colors"
            >
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search"
                className="w-full text-xs text-[#24292D] placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                aria-label="Search courses"
                className="text-slate-500 hover:text-[#AE54C6]"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {isHydrated && user ? (
              <>
                <NotificationBell />
                <div className="hidden sm:flex items-center gap-2 pl-1">
                  <Link
                    href={dashboardHref}
                    title={`${user.name} (${user.role})`}
                    className="inline-flex hover:scale-105 transition-transform"
                  >
                    <UserAvatar user={user} size={40} className="border-2 border-white ring-1 ring-slate-200 text-xs" />
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs gap-1 px-2.5"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#747579]" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-xs px-3">
                    Sign In
                  </Button>
                </Link>
                <Link href="/subscriptions" className="hidden md:inline-block">
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs font-bold bg-[#AE54C6] hover:bg-[#A03BBC]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enroll</span>
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-[#24292D] hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search — the desktop search box is hidden below the sm
                breakpoint, so this is the only search entry point on true
                mobile widths. */}
            <form
              onSubmit={handleNavSearch}
              className="flex items-center bg-[#F5F7F9] border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#AE54C6] transition-colors"
            >
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search courses"
                className="w-full text-xs text-[#24292D] placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                aria-label="Search courses"
                className="text-slate-500 hover:text-[#AE54C6]"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {isHydrated && user && (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F5F7F9] border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <UserAvatar user={user} size={32} className="text-[11px]" />
                  <div>
                    <div className="text-xs font-bold text-[#24292D]">{user.name}</div>
                    <div className="text-[10px] font-bold text-[#AE54C6] uppercase">
                      {user.role} · {user.email}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs gap-1">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#AE54C6]" /> Course Categories
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#AE54C6]" /> Student Dashboard
              </Link>
              <Link
                href="/ai"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-[#AE54C6]" /> AI Tutor &amp; Hub
              </Link>
              <Link
                href="/sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5 text-[#AE54C6]" /> Coding Sandbox
              </Link>
              <Link
                href="/live"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-[#AE54C6]" /> Live Classes
              </Link>
              <Link
                href="/community"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#AE54C6]" /> Community Chat
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5 text-[#AE54C6]" /> Leaderboard
              </Link>
              <Link
                href="/subscriptions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#AE54C6]" /> Plans &amp; Enroll
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#AE54C6]" /> Login / Signup
              </Link>
              <Link
                href="/qr-studio"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-[#AE54C6]" /> Banner QR Studio
              </Link>
              {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN" || !user) && (
                <Link
                  href="/instructor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#AE54C6]" /> Instructor Studio
                </Link>
              )}
              {(user?.role === "ADMIN" || !user) && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#AE54C6] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#AE54C6]" /> Admin Portal
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
