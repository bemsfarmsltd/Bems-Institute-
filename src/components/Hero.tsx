import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Briefcase, 
  ShieldCheck, 
  Wallet, 
  Users, 
  Sparkles, 
  QrCode, 
  MessageCircle 
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAF8FF] to-[#F4EFFF] py-16 md:py-24 border-b border-[#E6E1F5]">
      
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radial from-[#7928CA]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-radial from-[#18143D]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7">
            <div className="mb-4">
              <Badge variant="purple" className="py-1.5 px-4 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> ASPIRE · LEARN · SUCCEED
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#18143D] tracking-tight leading-[1.12] mb-6">
              Learn in Umuahia, <br />
              <span className="bg-gradient-to-r from-[#7928CA] to-[#3B82F6] bg-clip-text text-transparent">
                Earn Anywhere.
              </span>
            </h1>

            <p className="text-lg text-[#645F80] leading-relaxed mb-8 max-w-2xl">
              The <strong className="text-[#18143D]">BEMS FutureSkills Accelerator</strong> trains you until you are work-ready, builds an employer-verified portfolio, and opens direct hiring pathways with BEMS Group and partner tech enterprises.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link href="http://localhost:3000/enroll">
                <Button size="lg" className="gap-2">
                  <span>Apply for October Cohort</span>
                </Button>
              </Link>
              <Link href="#courses">
                <Button variant="outline" size="lg">
                  Explore 4 Tracks
                </Button>
              </Link>
            </div>

            <div className="pt-6 border-t border-[#E6E1F5] grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-semibold text-[#18143D]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7928CA]" />
                <span>Verified Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#7928CA]" />
                <span>Job Introductions</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#7928CA]" />
                <span>Pay in 3 Parts</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E6E1F5] rounded-3xl p-6 sm:p-8 shadow-xl relative">
              
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6E1F5]">
                <div>
                  <span className="text-xs font-semibold text-[#645F80] uppercase tracking-wide">
                    Cohort 1 Admissions
                  </span>
                  <h3 className="text-xl font-black text-[#18143D]">
                    October 2026 Batch
                  </h3>
                </div>
                <Badge variant="gold" className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> 80 Seats Only
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#FAF8FF] border border-[#7928CA]/15 rounded-2xl p-4 text-center">
                  <span className="text-2xl font-black text-[#18143D] block">3 Months</span>
                  <span className="text-xs font-bold text-[#7928CA] uppercase">Hands-On Labs</span>
                </div>
                <div className="bg-[#FAF8FF] border border-[#7928CA]/15 rounded-2xl p-4 text-center">
                  <span className="text-2xl font-black text-[#18143D] block">70% Target</span>
                  <span className="text-xs font-bold text-[#7928CA] uppercase">Finish & Get Hired</span>
                </div>
              </div>

              {/* Banner QR Callout */}
              <div className="bg-gradient-to-r from-[#18143D] to-[#2B185A] text-white rounded-2xl p-4 flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-[#18143D]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-snug">Roll-Up Banner & Handbill QR</h4>
                  <p className="text-xs text-[#A5A0C8] mt-0.5">
                    Scan at the BEMS Hub, MOUAU, or LGA to register on the spot.
                  </p>
                  <Link href="http://localhost:3000/qr-studio" className="text-xs font-bold text-[#D8B4FE] hover:underline mt-1 inline-block">
                    Open Banner QR Studio →
                  </Link>
                </div>
              </div>

              <Link href="http://localhost:3000/enroll" className="block w-full">
                <Button variant="whatsapp" className="w-full gap-2 py-3">
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant WhatsApp Onboarding</span>
                </Button>
              </Link>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
