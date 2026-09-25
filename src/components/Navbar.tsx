import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { NotificationBell } from "./NotificationBell";
import { QrCode, Sparkles, Bot, Radio, Code2, Users, Trophy } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E6E1F5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link href="/" className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E6E1F5] shadow-xs">
              <Image 
                src="/images/bems-logo.jpg" 
                alt="BEMS Logo" 
                fill 
                className="object-contain" 
              />
            </div>
            <div>
              <span className="font-extrabold text-[#18143D] text-lg tracking-tight block leading-tight">
                BEMS INSTITUTE
              </span>
              <span className="text-[10px] font-bold text-[#7928CA] tracking-wider uppercase block">
                TECHNOLOGY & VOCATIONAL STUDIES
              </span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-5 text-xs font-bold text-[#18143D]">
            <Link href="/dashboard" className="hover:text-[#7928CA] transition-colors">
              Student Portal
            </Link>
            <Link href="/live" className="hover:text-[#7928CA] transition-colors flex items-center gap-1 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              Live Classes
            </Link>
            <Link href="/sandbox" className="hover:text-[#7928CA] transition-colors flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-[#7928CA]" /> Sandbox
            </Link>
            <Link href="/community" className="hover:text-[#7928CA] transition-colors flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#7928CA]" /> Community
            </Link>
            <Link href="/ai" className="text-[#7928CA] hover:text-[#581c87] transition-colors flex items-center gap-1 font-extrabold">
              <Bot className="w-3.5 h-3.5" /> AI Suite
            </Link>
            <Link href="/leaderboard" className="hover:text-[#7928CA] transition-colors flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Leaderboard
            </Link>
            <Link href="/subscriptions" className="hover:text-[#7928CA] transition-colors">
              Plans & Tuition
            </Link>
            <Link href="/admin" className="text-[#645F80] hover:text-[#18143D] transition-colors">
              Admin
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell />

            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="http://localhost:3000/qr-studio" target="_blank">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs">
                <QrCode className="w-3.5 h-3.5 text-[#7928CA]" />
                <span>QR Studio</span>
              </Button>
            </Link>
            <Link href="http://localhost:3000/enroll">
              <Button size="sm" className="gap-1.5 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enroll (Oct 2026)</span>
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
