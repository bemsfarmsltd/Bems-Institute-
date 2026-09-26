"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireRole } from "@/components/RequireRole";
import { InstructorConceptInsights } from "@/components/InstructorConceptInsights";
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  FileCheck,
  Video,
  Filter,
  Search,
  UserCheck
} from "lucide-react";

function InstructorDashboardContent() {
  const { adminStudents, submissions, adminCourses, user } = useLMS();

  const [selectedTutor, setSelectedTutor] = useState<string>("Mr. Victor");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("web-dev");

  // Determine tutor's assigned courses
  const assignedCourses = adminCourses.filter(
    (c) => c.tutor.toLowerCase().includes(selectedTutor.toLowerCase()) || selectedTutor === "All"
  );

  // Filter students enrolled in the instructor's courses
  const tutorStudents = adminStudents.filter(
    (s) => selectedCourseFilter === "all" || s.courseId === selectedCourseFilter
  );

  const pendingSubmissions = submissions.filter((s) => s.status === "SUBMITTED");
  const gradedSubmissions = submissions.filter((s) => s.status === "GRADED");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Instructor Top Banner */}
      <div className="bg-[#18143D] text-white py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="purple">PHASE 3 INSTRUCTOR PORTAL</Badge>
                <Badge variant="gold">OCTOBER 2026 COHORT</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Instructor Studio: {selectedTutor}
              </h1>
              <p className="text-xs sm:text-sm text-[#A5A0C8] mt-1">
                Oversee student lab progress, review Capstone submissions, and track learning milestones.
              </p>
            </div>

            {/* Persona Switcher & Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedTutor}
                onChange={(e) => {
                  setSelectedTutor(e.target.value);
                  if (e.target.value === "Mr. Victor") setSelectedCourseFilter("web-dev");
                  else if (e.target.value === "Timi") setSelectedCourseFilter("ai-automation");
                  else if (e.target.value === "Temi") setSelectedCourseFilter("product-design");
                  else setSelectedCourseFilter("all");
                }}
                className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden"
              >
                <option value="Mr. Victor" className="text-[#18143D]">Mr. Victor (Web Dev Lead)</option>
                <option value="Timi" className="text-[#18143D]">Timi (AI & Automation)</option>
                <option value="Temi" className="text-[#18143D]">Temi (Product Design)</option>
                <option value="All" className="text-[#18143D]">All Faculty View</option>
              </select>

              <Link href="/instructor/grading">
                <Button variant="purple" className="shadow-md">
                  <Sparkles className="w-4 h-4 mr-1.5" /> Open Grading Studio
                </Button>
              </Link>

              {user?.role === "ADMIN" && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    Admin Master Console &rarr;
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#645F80]">
                Active Students
              </span>
              <Users className="w-5 h-5 text-[#7928CA]" />
            </div>
            <div className="text-3xl font-black text-[#18143D]">
              {tutorStudents.length}
            </div>
            <p className="text-xs text-[#8580A3] mt-1">
              Enrolled in assigned tracks
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#645F80]">
                Pending Capstones
              </span>
              <FileCheck className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-600">
              {pendingSubmissions.length}
            </div>
            <p className="text-xs text-[#8580A3] mt-1">
              Awaiting instructor review & scoring
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#645F80]">
                Graded & Certified
              </span>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-700">
              {gradedSubmissions.length}
            </div>
            <p className="text-xs text-[#8580A3] mt-1">
              Certificates automatically issued
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#645F80]">
                Average Progress
              </span>
              <CheckCircle2 className="w-5 h-5 text-[#7928CA]" />
            </div>
            <div className="text-3xl font-black text-[#18143D]">
              {Math.round(
                tutorStudents.reduce((acc, s) => acc + s.progressPercent, 0) /
                  (tutorStudents.length || 1)
              )}%
            </div>
            <p className="text-xs text-[#8580A3] mt-1">
              Cohort module completion rate
            </p>
          </div>
        </div>

        {/* Live Lab Support & Quick Actions */}
        <div className="bg-gradient-to-r from-[#18143D] to-[#2E1065] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold">
              <Video className="w-4 h-4 text-purple-300" /> Umuahia Labs + Live Zoom Hybrid
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Lead Tutor Office Hours & Live Lab Sessions
            </h3>
            <p className="text-xs sm:text-sm text-[#C4BDE7]">
              Need to broadcast an urgent class update, change physical lab seating, or launch a live Zoom code review? Dispatch directly to the BEMS WhatsApp group.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://chat.whatsapp.com/BEMS-FutureSkills-2026"
              target="_blank"
              rel="noreferrer"
            >
              <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-[#18143D] font-black">
                <MessageCircle className="w-4 h-4 mr-2" /> Class WhatsApp Community
              </Button>
            </a>
            <Link href="/instructor/grading">
              <Button variant="purple">
                Review Submissions &rarr;
              </Button>
            </Link>
          </div>
        </div>

        <InstructorConceptInsights courseId={selectedCourseFilter} />

        {/* Student Roster Table */}
        <div className="bg-white rounded-2xl border border-[#E6E1F5] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#F0EDF9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#18143D]">
                Student Progress Roster
              </h2>
              <p className="text-xs text-[#645F80]">
                Real-time tracking of lab attendance, exam scores, and project delivery.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-bold text-[#645F80]">
                <Filter className="w-3.5 h-3.5" /> Track:
              </div>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#D1C9EB] text-xs font-bold text-[#18143D] bg-white focus:outline-hidden"
              >
                <option value="all">All Tracks</option>
                <option value="web-dev">Web Development</option>
                <option value="ai-automation">AI & Automation</option>
                <option value="product-design">Product Design</option>
                <option value="cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-[#645F80] font-bold uppercase tracking-wider border-b border-[#E6E1F5]">
                <tr>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-4">Track</th>
                  <th className="py-3.5 px-4">Delivery Mode</th>
                  <th className="py-3.5 px-4">Curriculum Progress</th>
                  <th className="py-3.5 px-4">Quiz Score</th>
                  <th className="py-3.5 px-4">Capstone</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDF9] text-[#18143D]">
                {tutorStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#FAF8FF]/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm text-[#18143D]">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-[#8580A3]">
                        {student.email} &middot; {student.phone}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-[#7928CA]">
                      {student.courseTitle}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        student.deliveryMode.includes("Physical")
                          ? "bg-purple-100 text-purple-900"
                          : "bg-blue-100 text-blue-900"
                      }`}>
                        {student.deliveryMode}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-[#E6E1F5] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#7928CA] h-full"
                            style={{ width: `${student.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px]">
                          {student.progressPercent}%
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {student.quizScore !== undefined ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {student.quizScore}%
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#8580A3]">
                          Not taken
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {student.capstoneStatus === "GRADED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <Award className="w-3 h-3 text-emerald-600" /> Certified
                        </span>
                      )}
                      {student.capstoneStatus === "SUBMITTED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> Needs Grading
                        </span>
                      )}
                      {student.capstoneStatus === "NOT_STARTED" && (
                        <span className="text-[11px] text-[#8580A3]">
                          In progress
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {student.capstoneStatus === "SUBMITTED" ? (
                        <Link href="/instructor/grading">
                          <Button variant="purple" size="sm" className="text-xs">
                            Grade Project &rarr;
                          </Button>
                        </Link>
                      ) : student.certificateIssued ? (
                        <Link href="/certificate/cert-001">
                          <Button variant="outline" size="sm" className="text-xs">
                            View Cert
                          </Button>
                        </Link>
                      ) : (
                        <a
                          href={`https://wa.me/234${student.phone.replace(/[^0-9]/g, "").slice(-10)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="text-xs text-[#25D366]">
                            <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp
                          </Button>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function InstructorDashboardPage() {
  return (
    <RequireRole allow={["INSTRUCTOR", "ADMIN"]}>
      <InstructorDashboardContent />
    </RequireRole>
  );
}
