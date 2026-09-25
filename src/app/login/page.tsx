"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useLMS();

  const [name, setName] = useState(user?.name || "Chinedu Okeke");
  const [email, setEmail] = useState(user?.email || "chinedu.okeke@mouau.edu.ng");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR" | "ADMIN">("STUDENT");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(name, email);
    if (role === "ADMIN") {
      router.push("/admin");
    } else if (role === "INSTRUCTOR") {
      router.push("/instructor");
    } else {
      router.push("/dashboard");
    }
  };

  const handleDemoStudent = () => {
    setName("Chinedu Okeke");
    setEmail("chinedu.okeke@mouau.edu.ng");
    setRole("STUDENT");
    login("Chinedu Okeke", "chinedu.okeke@mouau.edu.ng");
    router.push("/dashboard");
  };

  const handleDemoInstructor = () => {
    setName("Mr. Victor (Lead Tutor)");
    setEmail("victor.lead@bemsinstitute.ng");
    setRole("INSTRUCTOR");
    login("Mr. Victor (Lead Tutor)", "victor.lead@bemsinstitute.ng");
    router.push("/instructor");
  };

  const handleDemoAdmin = () => {
    setName("Academic Director (Admin)");
    setEmail("admin@bemsinstitute.ng");
    setRole("ADMIN");
    login("Academic Director", "admin@bemsinstitute.ng");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6E1F5] p-8 sm:p-10 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#7928CA]/10 text-[#7928CA] flex items-center justify-center mx-auto mb-4 font-black text-xl">
              B
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="purple">CORE LMS AUTH</Badge>
            </div>
            <h1 className="text-2xl font-black text-[#18143D]">
              Sign in to BEMS LMS
            </h1>
            <p className="text-xs sm:text-sm text-[#645F80] mt-1">
              Enter your credentials or choose a 1-click demo persona to test Phase 1 & 2 workflows.
            </p>
          </div>

          {/* Quick 1-Click Persona Switchers */}
          <div className="space-y-2 mb-6 p-4 rounded-2xl bg-[#FAF8FF] border border-[#E6E1F5]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#645F80] block text-center mb-2">
              ⚡ 1-Click Fast Access Persona
            </span>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDemoStudent}
                className="text-[11px] px-2 border-[#D1C9EB] hover:border-[#7928CA] hover:text-[#7928CA]"
              >
                <GraduationCap className="w-3.5 h-3.5 mr-1 text-[#7928CA]" /> Student
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDemoInstructor}
                className="text-[11px] px-2 border-[#D1C9EB] hover:border-[#7928CA] hover:text-[#7928CA]"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1 text-amber-600" /> Tutor
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDemoAdmin}
                className="text-[11px] px-2 border-[#D1C9EB] hover:border-[#7928CA] hover:text-[#7928CA]"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Admin
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chinedu Okeke"
                className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chinedu.okeke@mouau.edu.ng"
                className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                Role Destination
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "STUDENT" | "INSTRUCTOR" | "ADMIN")}
                className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white font-medium"
              >
                <option value="STUDENT">Student Dashboard (/dashboard)</option>
                <option value="INSTRUCTOR">Instructor Studio (/instructor)</option>
                <option value="ADMIN">Master Admin Console (/admin)</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="purple"
              size="lg"
              className="w-full shadow-md mt-2 font-bold"
            >
              Sign In to Learning Portal <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#F0EDF9] text-center">
            <Link
              href="/"
              className="text-xs text-[#645F80] hover:text-[#18143D] font-semibold"
            >
              &larr; Back to BEMS Public Landing Page
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
