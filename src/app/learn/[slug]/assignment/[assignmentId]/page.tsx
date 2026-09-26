"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  GitBranch,
  Globe,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck,
  UserCheck
} from "lucide-react";

export default function AssignmentSubmissionPage({
  params
}: {
  params: Promise<{ slug: string; assignmentId: string }>;
}) {
  const { slug, assignmentId } = use(params);
  const router = useRouter();
  const { courses, assignments, isHydrated, submissions, submitAssignment, user, getCertificate } =
    useLMS();

  const course = courses.find((c) => c.slug === slug);
  const assignment = assignments.find((a) => a.id === assignmentId);

  const existingSubmission = submissions.find(
    (s) => s.assignmentId === assignmentId && s.userId === user?.id
  );

  const [githubUrl, setGithubUrl] = useState(existingSubmission?.githubUrl || "");
  const [liveDemoUrl, setLiveDemoUrl] = useState(existingSubmission?.liveDemoUrl || "");
  const [notes, setNotes] = useState(existingSubmission?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // submissions loads asynchronously after mount — sync the form once a
  // prior submission for this user/assignment shows up.
  useEffect(() => {
    if (existingSubmission) {
      setGithubUrl(existingSubmission.githubUrl);
      setLiveDemoUrl(existingSubmission.liveDemoUrl);
      setNotes(existingSubmission.notes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingSubmission?.id, existingSubmission?.submittedAt]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        Loading assignment…
      </div>
    );
  }

  if (!course || !assignment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Assignment Not Found</h2>
          <Link href="/">
            <Button>Back to Courses</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const certificate = getCertificate(course.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !liveDemoUrl) {
      alert("Please provide both your GitHub Repository URL and Live Hosted Demo URL.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await submitAssignment(assignment.id, githubUrl, liveDemoUrl, notes);
      alert("Capstone project submitted successfully! Our lead tutor has been notified.");
    } catch {
      setError("Could not submit your capstone. Please sign in and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#18143D] via-[#241E56] to-[#18143D] text-white py-12 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-2 text-xs text-[#D8B4FE] hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {course.title}
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="purple">FINAL CAPSTONE ASSESSMENT</Badge>
            <Badge variant="gold">Employer-Verified Milestone</Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            {assignment.title}
          </h1>
          <p className="text-sm text-[#D8B4FE] max-w-2xl">
            Lead Instructor: <strong>{course.tutor}</strong> ({course.tutorRole})
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-10">

        {/* Graded Status Banner */}
        {existingSubmission?.status === "GRADED" && (
          <div className="bg-[#D1FAE5]/70 border border-[#10B981] rounded-3xl p-6 sm:p-8 shadow-lg text-[#065F46]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#10B981] text-white flex items-center justify-center text-xl font-black shrink-0">
                  {existingSubmission.score}%
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black">Project Graded & Approved!</h3>
                    <Badge variant="green">Verified Pass</Badge>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-3">
                    Evaluated by <strong>{existingSubmission.gradedBy || course.tutor}</strong>
                  </p>
                  {existingSubmission.feedback && (
                    <div className="bg-white/80 border border-[#10B981]/30 rounded-xl p-3 text-xs text-[#065F46] leading-relaxed">
                      <strong>Instructor Feedback:</strong> &ldquo;{existingSubmission.feedback}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {certificate && (
                <Link href={`/certificate/${certificate.certNumber}`}>
                  <Button variant="whatsapp" className="gap-2 shrink-0">
                    <Award className="w-4 h-4" />
                    <span>View Official Certificate</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Pending Review Banner */}
        {existingSubmission && existingSubmission.status === "SUBMITTED" && (
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-6 text-[#92400E] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#D97706] shrink-0" />
              <div>
                <strong className="block text-sm">Submission Under Review by {course.tutor}</strong>
                <span className="text-xs opacity-90">
                  Submitted on {new Date(existingSubmission.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Link href="/instructor/grading">
              <Button size="sm" variant="outline" className="text-xs">
                Switch to Tutor Mode (Grade Now)
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left 7 Cols: Project Brief & Rubric */}
          <div className="lg:col-span-7 space-y-6">

            <div className="bg-white border border-[#E6E1F5] rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-black text-[#18143D] mb-3 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#7928CA]" />
                <span>Capstone Specification</span>
              </h3>
              <p className="text-sm text-[#645F80] leading-relaxed mb-6">
                {assignment.brief}
              </p>

              <h4 className="text-xs font-bold text-[#7928CA] uppercase tracking-wider mb-3">
                Mandatory Deliverables:
              </h4>
              <ul className="space-y-2.5 mb-6">
                {assignment.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#1E1B38]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-xs font-bold text-[#7928CA] uppercase tracking-wider mb-3">
                Grading Rubric (Total: 100 Points):
              </h4>
              <div className="space-y-2">
                {assignment.rubric.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-[#FAF8FF] border border-[#E6E1F5] rounded-xl text-xs text-[#18143D]"
                  >
                    <span>{item.criteria}</span>
                    <strong className="text-[#7928CA] font-bold">{item.points} pts</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right 5 Cols: Submission Input Box */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white border border-[#E6E1F5] rounded-3xl p-6 sm:p-8 shadow-lg">
              <h3 className="text-lg font-black text-[#18143D] mb-1">
                Student Project Submission
              </h3>
              <p className="text-xs text-[#645F80] mb-6">
                Logged in as <strong>{user?.name || "Student"}</strong> ({user?.email})
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#18143D] uppercase tracking-wider mb-1.5">
                    GitHub Repository URL *
                  </label>
                  <div className="relative">
                    <GitBranch className="w-4 h-4 text-[#645F80] absolute left-3.5 top-3" />
                    <input
                      type="url"
                      required
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6E1F5] text-xs text-[#18143D] focus:outline-none focus:border-[#7928CA] focus:ring-2 focus:ring-[#7928CA]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18143D] uppercase tracking-wider mb-1.5">
                    Live Hosted URL (Vercel / Netlify) *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#645F80] absolute left-3.5 top-3" />
                    <input
                      type="url"
                      required
                      value={liveDemoUrl}
                      onChange={(e) => setLiveDemoUrl(e.target.value)}
                      placeholder="https://my-app.vercel.app"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6E1F5] text-xs text-[#18143D] focus:outline-none focus:border-[#7928CA] focus:ring-2 focus:ring-[#7928CA]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18143D] uppercase tracking-wider mb-1.5">
                    Project Architecture Notes & Features
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe how you solved the problem, technologies used, and key features..."
                    className="w-full p-3 rounded-xl border border-[#E6E1F5] text-xs text-[#18143D] focus:outline-none focus:border-[#7928CA] focus:ring-2 focus:ring-[#7928CA]/15"
                  />
                </div>

                {error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {existingSubmission ? "Update Capstone Submission" : "Submit Capstone for Grading"}
                  </span>
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#E6E1F5] text-center">
                <Link
                  href="/instructor/grading"
                  className="text-xs font-bold text-[#7928CA] hover:underline"
                >
                  Tutor Demo: Open Grading Dashboard →
                </Link>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
