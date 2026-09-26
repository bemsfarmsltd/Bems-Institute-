import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { QrCode, Sparkles } from "lucide-react";

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

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#18143D]">
            <Link href="/#courses" className="hover:text-[#7928CA] transition-colors">
              Courses
            </Link>
            <Link href="/dashboard" className="hover:text-[#7928CA] transition-colors">
              Student Dashboard
            </Link>
            <Link href="/instructor" className="hover:text-[#7928CA] transition-colors">
              Instructor Studio
            </Link>
            <Link href="/admin" className="text-[#7928CA] hover:text-[#5d1d9e] transition-colors">
              Admin Portal
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/qr-studio" target="_blank">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs">
                <QrCode className="w-3.5 h-3.5 text-[#7928CA]" />
                <span>QR Studio</span>
              </Button>
            </Link>
            <Link href="/subscriptions">
              <Button size="sm" className="gap-1.5 text-xs font-bold">
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
