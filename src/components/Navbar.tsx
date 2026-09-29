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
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isHydrated, logout } = useLMS();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  const navLinkClass = (href: string) =>
    `inline-flex items-center gap-1 transition-colors ${
      isActive(href)
        ? "text-[#7928CA] font-extrabold"
        : "text-[#18143D] hover:text-[#7928CA]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E6E1F5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink lg:shrink-0 mr-1.5">
            <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-[#E6E1F5] shadow-xs shrink-0">
              <Image
                src="/images/bems-logo.jpg"
                alt="BEMS Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-[#18143D] text-sm sm:text-lg tracking-tight block leading-tight truncate">
                BEMS INSTITUTE
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-[#7928CA] tracking-normal sm:tracking-wider uppercase block truncate">
                OF TECHNOLOGY &amp; VOCATIONAL STUDIES
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-4 text-xs font-bold whitespace-nowrap">
            <Link href="/#courses" className="text-[#18143D] hover:text-[#7928CA] transition-colors">
              Courses
            </Link>

            {(!user || user.role === "STUDENT" || user.role === "ADMIN") && (
              <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>Dashboard</span>
              </Link>
            )}

            {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
              <Link href="/instructor" className={navLinkClass("/instructor")}>
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Instructor</span>
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link href="/admin" className={navLinkClass("/admin")}>
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Admin</span>
              </Link>
            )}

            <Link href="/ai" className={navLinkClass("/ai")}>
              <Bot className="w-3.5 h-3.5 shrink-0 text-[#7928CA]" />
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

            <Link href="/community" className={navLinkClass("/community")}>
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Community</span>
            </Link>

            <Link href="/leaderboard" className={navLinkClass("/leaderboard")}>
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Leaderboard</span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isHydrated && user ? (
              <>
                <NotificationBell />
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E6E1F5]">
                  <Link
                    href={
                      user.role === "ADMIN"
                        ? "/admin"
                        : user.role === "INSTRUCTOR"
                        ? "/instructor"
                        : "/dashboard"
                    }
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5] hover:border-[#7928CA]/40 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#7928CA] text-white text-[10px] font-bold flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left leading-tight">
                      <span className="block text-xs font-bold text-[#18143D] max-w-[110px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                      <span className="block text-[9px] font-bold text-[#7928CA] uppercase tracking-wider">
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
                    <LogOut className="w-3.5 h-3.5 text-[#645F80]" />
                    <span className="hidden xl:inline">Sign Out</span>
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
                <Link href="/qr-studio" target="_blank">
                  <Button variant="outline" size="sm" className="hidden xl:inline-flex gap-1.5 text-xs">
                    <QrCode className="w-3.5 h-3.5 text-[#7928CA]" />
                    <span>QR Studio</span>
                  </Button>
                </Link>
                <Link href="/subscriptions" className="hidden sm:inline-block">
                  <Button size="sm" className="gap-1.5 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enroll (Oct 2026)</span>
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-[#18143D] hover:bg-[#FAF8FF] border border-[#E6E1F5] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E6E1F5] space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            {isHydrated && user && (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7928CA] text-white text-xs font-bold flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#18143D]">{user.name}</div>
                    <div className="text-[10px] font-bold text-[#7928CA] uppercase">
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
                href="/#courses"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA]"
              >
                Course Catalog
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA] flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#7928CA]" /> Student Dashboard
              </Link>
              <Link
                href="/ai"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA] flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-[#7928CA]" /> AI Tutor &amp; Hub
              </Link>
              <Link
                href="/sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA] flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5 text-[#7928CA]" /> Coding Sandbox
              </Link>
              <Link
                href="/live"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA] flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-[#7928CA]" /> Live Classes
              </Link>
              <Link
                href="/community"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA] flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#7928CA]" /> Community Chat
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA] flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5 text-[#7928CA]" /> Leaderboard
              </Link>
              <Link
                href="/subscriptions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7928CA]" /> Plans &amp; Enroll
              </Link>
              {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN" || !user) && (
                <Link
                  href="/instructor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA] flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#7928CA]" /> Instructor Studio
                </Link>
              )}
              {(user?.role === "ADMIN" || !user) && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-[#FAF8FF] text-[#18143D] hover:text-[#7928CA] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7928CA]" /> Admin Portal
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

