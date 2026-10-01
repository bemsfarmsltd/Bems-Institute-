import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, QrCode, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white text-[#747579] pt-16 pb-10 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-200/80">
          {/* Column 1 (4 cols): Brand Info + Social Icons */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white p-0.5 shrink-0">
                <Image src="/images/bems-logo.jpg" alt="BEMS Logo" fill className="object-contain" />
              </div>
              <div>
                <strong className="text-[#24292D] text-base font-extrabold block leading-none">
                  BEMS INSTITUTE
                </strong>
                <span className="text-[10px] text-[#AE54C6] font-bold uppercase tracking-wider">
                  OF TECHNOLOGY &amp; VOCATIONAL STUDIES
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#747579] leading-relaxed mb-5 max-w-sm">
              BEMS FutureSkills Accelerator trains learners in Umuahia and online until they are work-ready, building employer-verified portfolios and direct hiring pathways.
            </p>

            {/* Eduport-style colorful social icon squares */}
            <div className="flex items-center gap-2.5">
              <a
                href="#courses"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-[#5D82D1] hover:text-white text-[#5D82D1] flex items-center justify-center transition-colors text-xs font-extrabold"
              >
                f
              </a>
              <a
                href="#courses"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-[#C22B72] hover:text-white text-[#C22B72] flex items-center justify-center transition-colors text-xs font-extrabold"
              >
                ig
              </a>
              <a
                href="#courses"
                aria-label="Twitter"
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-[#40BFF5] hover:text-white text-[#40BFF5] flex items-center justify-center transition-colors text-xs font-extrabold"
              >
                𝕏
              </a>
              <a
                href="#courses"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-[#238CC8] hover:text-white text-[#238CC8] flex items-center justify-center transition-colors text-xs font-extrabold"
              >
                in
              </a>
            </div>
          </div>

          {/* Column 2 (2 cols): Programs */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold text-[#24292D] mb-4">Programs</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/courses/ai-automation"
                  className="hover:text-[#AE54C6] transition-colors"
                >
                  AI &amp; Automation
                </Link>
              </li>
              <li>
                <Link href="/courses/web-dev" className="hover:text-[#AE54C6] transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link
                  href="/courses/product-design"
                  className="hover:text-[#AE54C6] transition-colors"
                >
                  Product Design (UI/UX)
                </Link>
              </li>
              <li>
                <Link
                  href="/courses/cybersecurity"
                  className="hover:text-[#AE54C6] transition-colors"
                >
                  Cybersecurity
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 (2 cols): Community & Hub */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold text-[#24292D] mb-4">Community</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-[#AE54C6] transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/ai" className="hover:text-[#AE54C6] transition-colors">
                  24/7 AI Tutor
                </Link>
              </li>
              <li>
                <Link href="/sandbox" className="hover:text-[#AE54C6] transition-colors">
                  Coding Sandbox
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[#AE54C6] transition-colors">
                  Cohort Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/graduates" className="hover:text-[#AE54C6] transition-colors">
                  Graduate Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 (2 cols): Teaching & Admissions */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold text-[#24292D] mb-4">Teaching</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/become-instructor" className="hover:text-[#AE54C6] transition-colors">
                  Become a Tutor
                </Link>
              </li>
              <li>
                <Link href="/instructor/grading" className="hover:text-[#AE54C6] transition-colors">
                  Capstone Grading
                </Link>
              </li>
              <li>
                <Link href="/qr-studio" className="hover:text-[#AE54C6] transition-colors">
                  Banner QR Studio
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#AE54C6] transition-colors">
                  Admin Scoreboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 (2 cols): Contact */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold text-[#24292D] mb-4">Contact</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#AE54C6] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[#24292D] font-semibold">+234 800 000 0000</span>
                  <span className="text-[11px] text-[#747579]">(8:00 AM to 6:00 PM)</span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#AE54C6] shrink-0" />
                <span className="truncate">admissions@bemsinstitute.ng</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#AE54C6] shrink-0 mt-0.5" />
                <span>BEMS Innovation Hub, Umuahia, Abia State</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F7C32E] shrink-0" />
                <span>Mon – Sat · Hybrid Labs</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between text-xs text-[#747579] gap-4">
          <div>
            Copyrights &copy;2026 BEMS Institute of Technology &amp; Vocational Studies. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/qr-studio"
              className="inline-flex items-center gap-1 hover:text-[#AE54C6] transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Studio</span>
            </Link>
            <Link href="/subscriptions" className="hover:text-[#AE54C6] transition-colors">
              Terms of Admission
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[#24292D] font-semibold hover:text-[#AE54C6] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#AE54C6]" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
