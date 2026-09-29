"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Button } from "./ui/button";
import { NotificationBell } from "./NotificationBell";
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
  Settings,
  BookOpen
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isHydrated, logout } = useLMS();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/courses");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  const navLinkClass = (href: string) =>
    `inline-flex items-center gap-1 transition-colors ${
      isActive(href)
        ? "text-[#066AC9] font-extrabold"
        : "text-[#24292D] hover:text-[#066AC9]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Brand Logo + Eduport Category Pill */}
          <div className="flex items-center gap-3 min-w-0 shrink lg:shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-slate-200 shadow-2xs shrink-0">
                <Image
                  src="/images/bems-logo.jpg"
                  alt="BEMS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-[#24292D] text-sm sm:text-lg tracking-tight block leading-tight truncate">
                  BEMS INSTITUTE
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-[#066AC9] tracking-normal sm:tracking-wider uppercase block truncate">
                  OF TECHNOLOGY &amp; VOCATIONAL STUDIES
                </span>
              </div>
            </Link>

            <Link
              href="/courses"
              className="hidden xl:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#E8F1FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white text-xs font-bold transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
                <rect x="9.5" y="1" width="5.5" height="5.5" rx="1" />
                <rect x="1" y="9.5" width="5.5" height="5.5" rx="1" />
                <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" />
              </svg>
              <span>Category</span>
            </Link>
          </div>

          {/* Desktop Navigation with Eduport Dropdowns (Images 1 & 4) */}
          <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-[13px] font-semibold whitespace-nowrap">
            <Link href="/courses" className={navLinkClass("/courses")}>
              <span>Courses</span>
            </Link>

            {/* Eduport "Pages ⌄" Dropdown Menu (Image 1) */}
            <div className="relative group py-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[#24292D] group-hover:text-[#066AC9] font-semibold cursor-pointer"
              >
                <span>Pages</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>

              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(24,20,61,0.12)] border border-slate-100 p-2 z-50">
                <Link
                  href="/courses"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-semibold text-[#066AC9] bg-[#E8F1FA]/60 hover:bg-[#E8F1FA]"
                >
                  <span>Course Categories</span>
                  <span>•••</span>
                </Link>
                <Link
                  href="/courses/web-dev"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span>Full-Stack Web Dev</span>
                </Link>
                <Link
                  href="/courses/ai-automation"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span>AI &amp; Automation</span>
                </Link>
                <Link
                  href="/courses/product-design"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span>Product Design (UI/UX)</span>
                </Link>
                <Link
                  href="/courses/cybersecurity"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span>Cybersecurity Defense</span>
                </Link>
                <Link
                  href="/instructor"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span>Become an Instructor</span>
                </Link>
                <Link
                  href="/sandbox"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span>Interactive Code Lab</span>
                </Link>
                <Link
                  href="/qr-studio"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span>Banner QR Studio</span>
                </Link>
                <Link
                  href="/subscriptions"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span>Tuition &amp; Admissions</span>
                </Link>
              </div>
            </div>

            {/* Eduport "Accounts ⌄" Dropdown Menu (Image 4) */}
            <div className="relative group py-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[#24292D] group-hover:text-[#066AC9] font-semibold cursor-pointer"
              >
                <span>Accounts</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>

              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full w-52 bg-white rounded-xl shadow-[0_10px_40px_rgba(24,20,61,0.12)] border border-slate-100 p-2 z-50">
                <Link
                  href="/instructor"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span className="inline-flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5" /> Instructor
                  </span>
                  <span>•••</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5" /> Student
                  </span>
                  <span>•••</span>
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </span>
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <Link
                  href="/ai"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <Bot className="w-3.5 h-3.5" /> AI Tutor Hub
                </Link>
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-[#747579] hover:bg-[#E8F1FA]/50 hover:text-[#066AC9]"
                >
                  <Settings className="w-3.5 h-3.5" /> Leaderboard &amp; Stats
                </Link>
              </div>
            </div>

            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link href="/ai" className={navLinkClass("/ai")}>
              <Bot className="w-3.5 h-3.5 shrink-0 text-[#066AC9]" />
              <span>AI Tutor</span>
            </Link>

            <Link href="/sandbox" className={navLinkClass("/sandbox")}>
              <Code2 className="w-3.5 h-3.5 shrink-0" />
              <span>Sandbox</span>
            </Link>

            <Link href="/live" className={navLinkClass("/live")}>
              <Video className="w-3.5 h-3.5 shrink-0" />
              <span>Live</span>
            </Link>
          </nav>

          {/* Right Search Input + User / Auth Actions */}
          <div className="flex items-center gap-2">
            {/* Eduport Compact Navbar Search Input */}
            <form
              onSubmit={handleNavSearch}
              className="hidden xl:flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-44 focus-within:border-[#066AC9] transition-colors"
            >
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search"
                className="w-full text-xs text-[#24292D] placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button type="submit" aria-label="Search courses" className="text-slate-500 hover:text-[#066AC9]">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {isHydrated && user ? (
              <>
                <NotificationBell />
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link
                    href={
                      user.role === "ADMIN"
                        ? "/admin"
                        : user.role === "INSTRUCTOR"
                        ? "/instructor"
                        : "/dashboard"
                    }
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F5F7F9] border border-slate-200 hover:border-[#066AC9]/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#066AC9] text-white text-xs font-bold flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left leading-tight">
                      <span className="block text-xs font-bold text-[#24292D] max-w-[100px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                      <span className="block text-[9px] font-bold text-[#066AC9] uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs gap-1 px-2.5"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#747579]" />
                    <span className="hidden 2xl:inline">Sign Out</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-xs px-2.5 sm:px-3.5">
                    Sign In
                  </Button>
                </Link>
                <Link href="/subscriptions" className="hidden sm:inline-block">
                  <Button size="sm" className="gap-1.5 text-xs font-bold bg-[#066AC9] hover:bg-[#0556A5]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enroll Now</span>
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
            {isHydrated && user && (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F5F7F9] border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#066AC9] text-white text-xs font-bold flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#24292D]">{user.name}</div>
                    <div className="text-[10px] font-bold text-[#066AC9] uppercase">
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
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#066AC9]" /> Course Categories
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#066AC9]" /> Student Dashboard
              </Link>
              <Link
                href="/ai"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-[#066AC9]" /> AI Tutor &amp; Hub
              </Link>
              <Link
                href="/sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5 text-[#066AC9]" /> Coding Sandbox
              </Link>
              <Link
                href="/live"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-[#066AC9]" /> Live Classes
              </Link>
              <Link
                href="/community"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#066AC9]" /> Community Chat
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5 text-[#066AC9]" /> Leaderboard
              </Link>
              <Link
                href="/subscriptions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#066AC9]" /> Plans &amp; Enroll
              </Link>
              <Link
                href="/qr-studio"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-[#066AC9]" /> Banner QR Studio
              </Link>
              {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN" || !user) && (
                <Link
                  href="/instructor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#066AC9]" /> Instructor Studio
                </Link>
              )}
              {(user?.role === "ADMIN" || !user) && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-[#F5F7F9] text-[#24292D] hover:text-[#066AC9] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#066AC9]" /> Admin Portal
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
