"use client";

import React from "react";
import Link from "next/link";
import { useLMS } from "@/context/LMSContext";
import { RequireRole } from "@/components/RequireRole";
import { LearningInsights } from "@/components/LearningInsights";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Award,
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MessageCircle,
  FileText
} from "lucide-react";

function StudentDashboardContent() {
  const {
    user,
    courses,
    enrolledCourseIds,
    getCourseProgress,
    quizResults,
    submissions,
    certificates
  } = useLMS();

  const enrolledCourses = courses.filter((c) =>
    enrolledCourseIds.includes(c.id)
  );
  const mySubmissions = submissions.filter((s) => s.userId === user?.id);
  const myCertificates = certificates.filter((c) => c.userId === user?.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Top Banner */}
      <div className="bg-[#18143D] text-white py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="purple">STUDENT PORTAL</Badge>
                <Badge variant="gold">OCTOBER 2026 COHORT</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Welcome back, {user?.name || "Student"}!
              </h1>
              <p className="text-sm text-[#A5A0C8] mt-1">
                BEMS Institute of Technology &middot; FutureSkills Accelerator Dashboard
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/instructor/grading">
                <Button
                  variant="outline"
                  className="border-purple-400/30 text-purple-200 hover:bg-white/10"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Tutor Grading Studio
                </Button>
              </Link>
              <a
                href="https://chat.whatsapp.com/BEMS-FutureSkills-2026"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center"
              >
                <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-[#18143D] font-bold">
                  <MessageCircle className="w-4 h-4 mr-2" /> Class WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <LearningInsights />

        {/* Enrolled Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#18143D]">
                My Enrolled Courses
              </h2>
              <p className="text-xs sm:text-sm text-[#645F80]">
                Access course modules, video lessons, and continue where you left off.
              </p>
            </div>
            <Link href="/#courses">
              <Button variant="outline" size="sm" className="border-[#D1C9EB]">
                Explore All Tracks
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => {
              const progress = getCourseProgress(course.id);
              const firstLessonId = course.modules[0]?.lessons[0]?.id || "les-1";

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-[#E6E1F5] p-6 shadow-xs hover:border-[#7928CA]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="purple">{course.badge}</Badge>
                      <span className="text-xs font-bold text-[#7928CA]">
                        {progress.percent}% Completed
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#18143D] mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#645F80] mb-4">
                      Tutor: {course.tutor} &middot; {course.delivery}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E6E1F5] rounded-full h-2 mb-4 overflow-hidden">
                      <div
                        className="bg-[#7928CA] h-full transition-all duration-300"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#F0EDF9]">
                    <span className="text-xs text-[#8580A3]">
                      {progress.completed} of {progress.total} lessons finished
                    </span>

                    <div className="flex items-center gap-2">
                      <Link href={`/learn/${course.slug}/${firstLessonId}`}>
                        <Button variant="purple" size="sm">
                          <PlayCircle className="w-4 h-4 mr-1.5" /> Continue Classroom
                        </Button>
                      </Link>
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="outline" size="sm">
                          Syllabus
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase 2 Assessment & Credentials Card */}
        <div className="bg-white rounded-2xl border border-[#E6E1F5] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F0EDF9]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="purple">PHASE 2 ASSESSMENT</Badge>
                <Badge variant="gold">ACCREDITATION</Badge>
              </div>
              <h2 className="text-2xl font-black text-[#18143D]">
                Assessment & Verified Certificates
              </h2>
            </div>
            <p className="text-xs text-[#645F80] max-w-sm">
              Pass your comprehensive exam and submit your Capstone project to receive an institutional BEMS certificate with tamper-proof QR verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Quiz Widget */}
            <div className="bg-[#FAF8FF] border border-[#E6E1F5] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#645F80]">STEP 1</span>
                  <Award className="w-5 h-5 text-[#7928CA]" />
                </div>
                <h4 className="font-bold text-[#18143D] text-base mb-1">
                  Technical Knowledge Exam
                </h4>
                <p className="text-xs text-[#645F80] mb-4">
                  Multiple-choice exam validating core fundamentals.
                </p>
                {quizResults["quiz-web-dev"] ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Passed (
                    {quizResults["quiz-web-dev"].score}%)
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 font-semibold">
                    Not attempted yet
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E6E1F5]">
                <Link href="/learn/web-dev/quiz/quiz-web-dev">
                  <Button variant="outline" size="sm" className="w-full">
                    Take / Review Exam
                  </Button>
                </Link>
              </div>
            </div>

            {/* 2. Capstone Submission Widget */}
            <div className="bg-[#FAF8FF] border border-[#E6E1F5] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#645F80]">STEP 2</span>
                  <FileText className="w-5 h-5 text-[#7928CA]" />
                </div>
                <h4 className="font-bold text-[#18143D] text-base mb-1">
                  Capstone Project
                </h4>
                <p className="text-xs text-[#645F80] mb-4">
                  Submit GitHub repository and live deployment URL.
                </p>
                {mySubmissions.length > 0 ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Graded (
                    {mySubmissions[0].score}/100)
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 font-semibold">
                    Pending submission
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E6E1F5]">
                <Link href="/learn/web-dev/assignment/assign-web-dev">
                  <Button variant="outline" size="sm" className="w-full">
                    View Capstone Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* 3. Certificate Widget */}
            <div className="bg-[#FAF8FF] border border-[#E6E1F5] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#645F80]">STEP 3</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="font-bold text-[#18143D] text-base mb-1">
                  Institutional Certificate
                </h4>
                <p className="text-xs text-[#645F80] mb-4">
                  Print-ready digital certificate with public verification.
                </p>
                {myCertificates.length > 0 ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#7928CA]" /> Issued (
                    {myCertificates[0].gradeTitle})
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Awaiting grading</span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E6E1F5]">
                {myCertificates.length > 0 ? (
                  <Link href={`/certificate/${myCertificates[0].id}`}>
                    <Button variant="purple" size="sm" className="w-full">
                      View Official Certificate <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="w-full">
                    Locked
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <RequireRole allow={["STUDENT", "INSTRUCTOR", "ADMIN"]}>
      <StudentDashboardContent />
    </RequireRole>
  );
}

