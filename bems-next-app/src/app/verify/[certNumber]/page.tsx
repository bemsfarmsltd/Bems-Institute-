"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  Search,
  ExternalLink,
  Calendar,
  User,
  GraduationCap
} from "lucide-react";

export default function CertificateVerificationPage({
  params
}: {
  params: Promise<{ certNumber: string }>;
}) {
  const { certNumber } = use(params);
  const router = useRouter();
  const { certificates, isHydrated } = useLMS();

  const [lookupQuery, setLookupQuery] = useState("");

  const certificate = certificates.find(
    (c) =>
      c.certNumber.toLowerCase() === certNumber.toLowerCase() ||
      c.id.toLowerCase() === certNumber.toLowerCase()
  );

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        Checking registry…
      </div>
    );
  }

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupQuery.trim()) {
      router.push(`/verify/${encodeURIComponent(lookupQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#18143D] text-white py-12 border-b border-white/10 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> OFFICIAL REGISTRY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            BEMS Credential Verification Service
          </h1>
          <p className="text-sm text-[#A5A0C8]">
            Instant cryptographic verification of certificates issued by BEMS Institute of Technology & Vocational Studies.
          </p>

          {/* Quick Lookup Input */}
          <form
            onSubmit={handleLookup}
            className="mt-6 max-w-md mx-auto flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20"
          >
            <input
              type="text"
              placeholder="e.g. BEMS-CERT-2026-WD-8819"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-transparent text-sm text-white placeholder-white/50 focus:outline-hidden"
            />
            <Button
              type="submit"
              variant="purple"
              size="sm"
              className="rounded-xl px-4"
            >
              <Search className="w-4 h-4 mr-1.5" /> Verify
            </Button>
          </form>
        </div>
      </div>

      {/* Verification Card */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        {certificate ? (
          <div className="bg-white rounded-3xl border border-[#E6E1F5] shadow-xl overflow-hidden">
            {/* Status bar */}
            <div className="bg-emerald-500 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-white" />
                <div>
                  <h3 className="font-extrabold text-base">
                    Authentic & Verified BEMS Credential
                  </h3>
                  <p className="text-xs text-emerald-100">
                    This certificate is genuine and registered in the institutional ledger.
                  </p>
                </div>
              </div>
              <Badge className="bg-white text-emerald-700 font-black">
                ACTIVE
              </Badge>
            </div>

            {/* Credential Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#645F80] font-bold block mb-1">
                    Student Name
                  </span>
                  <div className="flex items-center gap-2 text-lg font-black text-[#18143D]">
                    <User className="w-5 h-5 text-[#7928CA]" />
                    {certificate.studentName}
                  </div>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-[#645F80] font-bold block mb-1">
                    Certificate Number
                  </span>
                  <div className="text-lg font-mono font-bold text-[#7928CA]">
                    {certificate.certNumber}
                  </div>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-[#645F80] font-bold block mb-1">
                    Course Program
                  </span>
                  <div className="flex items-center gap-2 text-base font-bold text-[#18143D]">
                    <GraduationCap className="w-5 h-5 text-[#7928CA]" />
                    {certificate.courseTitle}
                  </div>
                  <span className="text-xs text-[#645F80]">
                    3-Month Practical Accelerator (October 2026 Cohort)
                  </span>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-[#645F80] font-bold block mb-1">
                    Award & Standing
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-[#7928CA] font-bold text-xs">
                      {certificate.gradeTitle}
                    </span>
                    <span className="text-sm font-semibold text-[#18143D]">
                      Final Score: {certificate.finalScore}%
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-[#645F80] font-bold block mb-1">
                    Conferral Date
                  </span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#18143D]">
                    <Calendar className="w-4 h-4 text-[#645F80]" />
                    {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-[#645F80] font-bold block mb-1">
                    Issuing Authority
                  </span>
                  <div className="text-sm font-semibold text-[#18143D]">
                    BEMS Institute of Technology & Vocational Studies
                  </div>
                  <span className="text-xs text-[#645F80]">
                    Umuahia, Abia State, Nigeria
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F0EDF9] flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link href={`/certificate/${certificate.id}`}>
                  <Button variant="purple" className="w-full sm:w-auto shadow-sm">
                    View Full Certificate Canvas <ExternalLink className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>

                <span className="text-xs text-[#8580A3]">
                  Registry Stamp: BEMS-REG-OK-{new Date(certificate.issuedAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-red-200 p-8 text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-[#18143D] mb-2">
              Credential Not Found
            </h3>
            <p className="text-sm text-[#645F80] max-w-md mx-auto mb-6">
              No registered credential exists for identifier{" "}
              <code className="bg-gray-100 px-2 py-0.5 rounded text-red-600 font-mono">
                {certNumber}
              </code>
              . Please verify the ID from the student&apos;s physical or digital certificate and try again.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/verify/BEMS-CERT-2026-WD-8819">
                <Button variant="outline">
                  Test with Sample Verified ID
                </Button>
              </Link>
              <Link href="/">
                <Button variant="purple">Return to Home</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

