import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#18143D] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-white p-0.5">
                <Image src="/images/bems-logo.jpg" alt="Logo" fill className="object-contain" />
              </div>
              <div>
                <strong className="text-white text-base block leading-none">BEMS INSTITUTE</strong>
                <span className="text-[10px] text-[#D8B4FE] font-bold uppercase">TECHNOLOGY & VOCATIONAL STUDIES</span>
              </div>
            </div>
            <p className="text-xs text-[#A5A0C8] leading-relaxed mb-4">
              Training people, getting them hired, and growing from there. Selling results, not just courses.
            </p>
            <span className="text-xs font-bold text-[#D8B4FE] uppercase tracking-wider block">
              ASPIRE · LEARN · SUCCEED
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#D8B4FE]">
              Programs
            </h4>
            <ul className="space-y-2 text-xs text-[#A5A0C8]">
              <li><Link href="/subscriptions?course=ai-automation" className="hover:text-white">AI & Automation</Link></li>
              <li><Link href="/subscriptions?course=web-dev" className="hover:text-white">Web Development</Link></li>
              <li><Link href="/subscriptions?course=product-design" className="hover:text-white">Product Design (UI/UX)</Link></li>
              <li><Link href="/subscriptions?course=cybersecurity" className="hover:text-white">Cybersecurity</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#D8B4FE]">
              Portals & Tools
            </h4>
            <ul className="space-y-2 text-xs text-[#A5A0C8]">
              <li><Link href="/subscriptions" className="hover:text-white">Student Enrollment</Link></li>
              <li><Link href="/qr-studio" className="hover:text-white">Banner QR Studio</Link></li>
              <li><Link href="/admin" className="hover:text-white">Live Scoreboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#D8B4FE]">
              Campus Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A5A0C8]">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#7928CA]" />
                <span>BEMS Labs, Umuahia, Abia State</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#25D366]" />
                <span>+234 800 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#7928CA]" />
                <span>admissions@bemsinstitute.ng</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7928CA]" />
                <span>Mon – Sat: 8:00 AM – 6:00 PM</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A5A0C8] gap-4">
          <div>
            &copy; 2026 BEMS Institute of Technology & Vocational Studies. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Admission</Link>
            <Link href="/admin" className="hover:text-white text-[#D8B4FE]">Staff Scoreboard</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
