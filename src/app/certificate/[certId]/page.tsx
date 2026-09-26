"use client";

import React, { use } from "react";
import Link from "next/link";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  Printer,
  Share2,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  ExternalLink
} from "lucide-react";

export default function CertificateViewPage({
  params
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = use(params);
  const { certificates, user, isHydrated } = useLMS();

  // Find certificate by id or certNumber
  const certificate = certificates.find(
    (c) => c.id === certId || c.certNumber === certId
  );

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        Loading certificate…
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-[#18143D] mb-4">
            Certificate Not Found
          </h2>
          <p className="text-sm text-[#645F80] mb-6">
            No certificate was found matching this credential identifier.
          </p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${certificate.studentName} - BEMS Verified Certificate`,
        text: `Verified Certificate of Competence in ${certificate.courseTitle} from BEMS Institute of Technology.`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Certificate URL copied to clipboard for sharing!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Action Toolbar (hidden during print) */}
      <div className="print:hidden bg-[#18143D] text-white py-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-[#A5A0C8] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="gold">OFFICIAL CREDENTIAL</Badge>
                <span className="text-xs text-[#A5A0C8]">
                  ID: {certificate.certNumber}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">
                Verified BEMS Certificate of Competence
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
            </Button>
            <Button
              onClick={handleShare}
              variant="purple"
              size="sm"
              className="shadow-sm"
            >
              <Share2 className="w-4 h-4 mr-1.5" /> Share Credential
            </Button>
            <Link href={`/verify/${certificate.certNumber}`}>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-400/30 text-emerald-300 hover:bg-white/10"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Public Verifier
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Certificate Canvas */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 print:p-0 print:m-0 print:max-w-none">
        <div className="bg-white rounded-3xl border-8 border-double border-[#7928CA]/30 p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center print:shadow-none print:border-4 print:border-[#7928CA]">
          {/* Subtle Guilloche / Watermark Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <div className="w-[600px] h-[600px] rounded-full border-[40px] border-[#18143D]" />
          </div>

          {/* Institutional Crest Header */}
          <div className="relative z-10 flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-[#18143D] text-white flex items-center justify-center font-black text-3xl shadow-lg border-2 border-[#7928CA] mb-3">
              B
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-widest text-[#18143D] uppercase">
              Bems Institute of Technology
            </h2>
            <p className="text-xs uppercase tracking-wider text-[#7928CA] font-extrabold mt-1">
              & Vocational Studies &middot; FutureSkills Accelerator
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#7928CA] to-transparent my-4" />
          </div>

          {/* Certificate Award Statement */}
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-bold text-[#645F80]">
              This is to certify that
            </span>

            <h3 className="text-3xl sm:text-5xl font-black text-[#18143D] tracking-tight border-b-2 border-[#E6E1F5] pb-4 inline-block px-8">
              {certificate.studentName}
            </h3>

            <p className="text-sm sm:text-base text-[#4A4568] leading-relaxed">
              has satisfactorily completed the intensive 3-Month practical curriculum, practical lab exercises, comprehensive examination, and capstone project in
            </p>

            <div className="py-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#7928CA] block">
                {certificate.courseTitle}
              </span>
              <span className="inline-block mt-2 px-4 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                Graduated with {certificate.gradeTitle} &middot; Final Score: {certificate.finalScore}%
              </span>
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-8 items-end mt-14 pt-8 border-t border-[#E6E1F5]">
            <div className="text-center sm:text-left">
              <div className="font-serif italic text-lg sm:text-xl text-[#18143D] mb-1 font-bold">
                Victor E.
              </div>
              <div className="w-40 h-0.5 bg-[#18143D]/40 mb-1 mx-auto sm:mx-0" />
              <div className="text-xs font-bold text-[#18143D]">
                Lead Course Instructor
              </div>
              <div className="text-[11px] text-[#645F80]">
                Department of Applied Technology
              </div>
            </div>

            {/* Official Gold/Purple Seal */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7928CA] to-[#8B5CF6] text-white flex flex-col items-center justify-center p-2 shadow-xl border-4 border-white ring-4 ring-[#7928CA]/20">
                <Award className="w-8 h-8 text-yellow-300 mb-0.5" />
                <span className="text-[9px] font-black uppercase tracking-wider text-center">
                  BEMS SEAL
                </span>
                <span className="text-[8px] opacity-80">VERIFIED</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-serif italic text-lg sm:text-xl text-[#18143D] mb-1 font-bold">
                Chima B.
              </div>
              <div className="w-40 h-0.5 bg-[#18143D]/40 mb-1 ml-auto mr-auto sm:mr-0" />
              <div className="text-xs font-bold text-[#18143D]">
                Director of Studies
              </div>
              <div className="text-[11px] text-[#645F80]">
                BEMS Institute of Technology
              </div>
            </div>
          </div>

          {/* Certificate Verification Footer */}
          <div className="relative z-10 mt-10 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8580A3] border-t border-[#F0EDF9]">
            <span>
              Certificate No: <strong className="text-[#18143D]">{certificate.certNumber}</strong>
            </span>
            <span>
              Date of Conferral: <strong className="text-[#18143D]">{new Date(certificate.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tamper-Proof Cryptographic ID
            </span>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

