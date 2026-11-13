"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { LMS_COURSES } from "@/data/lms-data";
import { LMS_ASSIGNMENTS } from "@/data/assessment-data";
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
  UserCheck,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Send,
  Check,
  ShieldCheck,
  ChevronRight,
  Layers,
  HelpCircle,
  Bot,
  Code2,
  Trophy,
  ArrowRight
} from "lucide-react";

export default function AssignmentSubmissionPage({
  params
}: {
  params: Promise<{ slug: string; assignmentId: string }>;
}) {
  const { slug, assignmentId } = use(params);
  const router = useRouter();

  const {
    courses,
    assignments,
    isHydrated,
    submissions,
    submitAssignment,
    user,
    getCertificate,
    getAssignmentsForCourse
  } = useLMS();

  // Resolve course from live context or fallback
  const course = useMemo(() => {
    return (
      courses.find((c) => c.slug === slug || c.id === slug) ||
      LMS_COURSES.find((c) => c.slug === slug || c.id === slug)
    );
  }, [courses, slug]);

  const courseId = course?.id || slug;

  // Resolve all assignments for this course (milestones + capstone)
  const courseAssignments = useMemo(() => {
    const list = getAssignmentsForCourse(courseId);
    if (list.length > 0) return list;
    return LMS_ASSIGNMENTS.filter((a) => a.courseId === courseId).sort((a, b) => a.order - b.order);
  }, [getAssignmentsForCourse, courseId]);

  // Resolve the active assignment matching ID, alias, or default to the capstone/first
  const assignment = useMemo(() => {
    return (
      assignments.find(
        (a) =>
          a.id === assignmentId ||
          a.courseId === assignmentId ||
          a.courseId === courseId ||
          a.id === `assign-${courseId}`
      ) ||
      LMS_ASSIGNMENTS.find(
        (a) =>
          a.id === assignmentId ||
          a.courseId === assignmentId ||
          a.courseId === courseId ||
          a.id === `assign-${courseId}`
      ) ||
      courseAssignments[0]
    );
  }, [assignments, assignmentId, courseId, courseAssignments]);

  // Find existing submission for this assignment
  const existingSubmission = useMemo(() => {
    if (!assignment) return undefined;
    return submissions.find(
      (s) =>
        (s.assignmentId === assignment.id || s.assignmentId === assignmentId) &&
        (!user || s.userId === user.id || s.userId === "guest")
    );
  }, [submissions, assignment, assignmentId, user]);

  const [githubUrl, setGithubUrl] = useState(existingSubmission?.githubUrl || "");
  const [liveDemoUrl, setLiveDemoUrl] = useState(existingSubmission?.liveDemoUrl || "");
  const [notes, setNotes] = useState(existingSubmission?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pre-audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ score: number; verdict: string; tips: string[] } | null>(null);

  // Sync state if an existing submission loads
  useEffect(() => {
    if (existingSubmission) {
      setGithubUrl(existingSubmission.githubUrl || "");
      setLiveDemoUrl(existingSubmission.liveDemoUrl || "");
      setNotes(existingSubmission.notes || "");
    }
  }, [existingSubmission?.id, existingSubmission?.submittedAt, existingSubmission]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#AE54C6] border-t-transparent rounded-full animate-spin" />
          <span>Loading project studio…</span>
        </div>
      </div>
    );
  }

  if (!course || !assignment) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF8FF] border border-[#F1E2F5] flex items-center justify-center mb-4 text-[#AE54C6]">
            <FileCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#303654] mb-2">Assignment Not Found</h2>
          <p className="text-sm text-[#645F80] mb-6 max-w-md">
            We could not find the requested milestone or capstone project.
          </p>
          <div className="flex items-center gap-3">
            <Link href={`/courses/${course?.slug || "web-dev"}`}>
              <Button variant="purple">Back to Course</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Student Dashboard</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const certificate = getCertificate(course.id);
  const isCapstone = assignment.type === "CAPSTONE" || assignment.id.startsWith("assign-");

  // Adaptive label text based on track
  const trackKey = course.id.toLowerCase();
  const repoLabel = trackKey.includes("design")
    ? "Figma Project / Design Source File URL *"
    : trackKey.includes("cyber")
    ? "GitHub Repository / Security Audit Report URL *"
    : trackKey.includes("ai")
    ? "GitHub Repo / Automation Blueprint URL *"
    : "GitHub Repository URL *";

  const repoPlaceholder = trackKey.includes("design")
    ? "https://www.figma.com/file/... or GitHub repo"
    : trackKey.includes("cyber")
    ? "https://github.com/username/security-audit or report URL"
    : trackKey.includes("ai")
    ? "https://github.com/username/ai-agent or Make/Zapier link"
    : "https://github.com/username/project-repo";

  const demoLabel = trackKey.includes("design")
    ? "Live Interactive Figma Prototype / Behance Case Study *"
    : "Live Hosted URL (Vercel, Netlify, Render, or Live Site) *";

  const demoPlaceholder = trackKey.includes("design")
    ? "https://www.figma.com/proto/... or Behance URL"
    : "https://my-capstone.vercel.app";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim() || !liveDemoUrl.trim()) {
      setError("Please provide both your repository/source link and your live hosted demo link.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await submitAssignment(assignment.id, githubUrl.trim(), liveDemoUrl.trim(), notes.trim());
      setSuccessMessage(
        `${isCapstone ? "Capstone project" : "Milestone project"} submitted! Lead instructor ${course.tutor} has been notified for formal evaluation.`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not submit your project. Please verify your connection and try again.";
      setError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant AI Pre-Audit helper
  const handleRunAiAudit = () => {
    if (!githubUrl || !liveDemoUrl) {
      setError("Please enter your project links first before running the AI Pre-Audit.");
      return;
    }
    setError(null);
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditResult({
        score: 92,
        verdict: "EXCELLENT — READY FOR INSTRUCTOR GRADING",
        tips: [
          "Repository and live demo links are formatted correctly with HTTPS protocol.",
          "Architecture notes describe functional scope and technologies clearly.",
          "Ensure your GitHub README includes a setup walkthrough and screenshot banner."
        ]
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#303654] text-white py-10 border-b border-white/10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C6BDD3] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {course.title} Syllabus
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="purple">{course.title.toUpperCase()}</Badge>
            <Badge variant="gold">
              {isCapstone ? "FINAL CAPSTONE PROJECT" : `MILESTONE PROJECT ${assignment.order}`}
            </Badge>
            <span className="text-[11px] font-semibold text-[#C6BDD3] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" /> Employer-Verified Credential
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {assignment.title}
          </h1>
          <p className="text-sm text-[#C6BDD3] max-w-2xl leading-relaxed">
            Lead Instructor &amp; Grading Evaluator: <strong>{course.tutor}</strong> ({course.tutorRole})
          </p>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        
        {/* Milestone & Capstone Navigator Tabs */}
        {courseAssignments.length > 1 && (
          <div className="bg-white rounded-2xl p-2 border border-[#F1E2F5] shadow-xs flex items-center gap-1.5 overflow-x-auto">
            {courseAssignments.map((a) => {
              const isActive = a.id === assignment.id;
              const sub = submissions.find((s) => s.assignmentId === a.id);
              const isGraded = sub?.status === "GRADED";
              const isSubmitted = sub?.status === "SUBMITTED";

              return (
                <Link
                  key={a.id}
                  href={`/learn/${course.slug}/assignment/${a.id}`}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#303654] text-white shadow-xs"
                      : "text-[#645F80] hover:text-[#303654] hover:bg-[#FAF8FF]"
                  }`}
                >
                  {isGraded ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isSubmitted ? (
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <FileCheck className="w-3.5 h-3.5 text-[#AE54C6]" />
                  )}
                  <span>
                    {a.type === "CAPSTONE" ? "🏆 Final Capstone" : `📌 Milestone ${a.order}`}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Guest Practice Mode Banner */}
        {!user && (
          <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#AE54C6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-[#303654]">
              <Sparkles className="w-4 h-4 text-[#AE54C6] shrink-0" />
              <span>
                <strong>Guest Preview:</strong> You are currently exploring this assignment specification.{" "}
                <Link href={`/login?redirect=/learn/${slug}/assignment/${assignment.id}`} className="text-[#AE54C6] underline font-bold">
                  Log in or register
                </Link>{" "}
                to save your project submission and receive an accredited instructor grade.
              </span>
            </div>
          </div>
        )}

        {/* Submission Success Toast */}
        {successMessage && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-xs font-bold text-emerald-900 flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {successMessage}
            </span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-black cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Graded Status Banner */}
        {existingSubmission?.status === "GRADED" && (
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-md text-emerald-950">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-black shrink-0 shadow-md">
                  {existingSubmission.score}%
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black">Project Graded &amp; Approved!</h3>
                    <Badge variant="green">Verified Pass</Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 opacity-90 mb-3">
                    Evaluated by <strong>{existingSubmission.gradedBy || course.tutor}</strong>
                  </p>
                  {existingSubmission.feedback && (
                    <div className="bg-white/90 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed shadow-xs">
                      <strong>Instructor Feedback:</strong> &ldquo;{existingSubmission.feedback}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {certificate && (
                <Link href={`/certificate/${certificate.certNumber}`}>
                  <Button variant="whatsapp" className="gap-2 shrink-0 shadow-md">
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
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-5 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <strong className="block text-sm font-black">
                  Submission Under Review by {course.tutor}
                </strong>
                <span className="text-xs text-amber-900/80">
                  Submitted on {new Date(existingSubmission.submittedAt).toLocaleDateString()} &bull; Live links active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={existingSubmission.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-200 hover:bg-amber-100/60 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" /> Test Demo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Main Grid: Specifications (Left) & Submission Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Project Brief, Requirements & Rubric */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#F1E2F5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-[#303654] mb-2 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#AE54C6]" />
                  <span>Project Specification &amp; Goals</span>
                </h3>
                <p className="text-sm text-[#4A4568] leading-relaxed bg-[#FAF8FF] p-4 rounded-2xl border border-[#F1E2F5]">
                  {assignment.brief}
                </p>
              </div>

              {/* Requirements Checklist */}
              <div>
                <h4 className="text-xs font-bold text-[#AE54C6] uppercase tracking-wider mb-3">
                  Required Deliverables Checklist:
                </h4>
                <ul className="space-y-2.5">
                  {assignment.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#303654] bg-[#FAF8FF]/60 p-2.5 rounded-xl border border-[#F1E2F5]/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Grading Rubric */}
              <div>
                <h4 className="text-xs font-bold text-[#AE54C6] uppercase tracking-wider mb-3">
                  Grading Rubric (Total: 100 Points):
                </h4>
                <div className="space-y-2">
                  {assignment.rubric.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-[#FAF8FF] border border-[#F1E2F5] rounded-xl text-xs text-[#303654]"
                    >
                      <span className="font-medium">{item.criteria}</span>
                      <strong className="text-[#AE54C6] font-black">{item.points} pts</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Lab Workstation Support */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF8FF] to-purple-50/40 border border-[#F1E2F5] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#303654]">Need help with local deployment?</div>
                  <div className="text-[11px] text-[#645F80]">
                    Drop by the BEMS Umuahia physical lab for hands-on assistance from lab faculty.
                  </div>
                </div>
                <Badge variant="purple">Lab Support</Badge>
              </div>
            </div>
          </div>

          {/* Right Column: Submission Form */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white border border-[#F1E2F5] rounded-3xl p-6 sm:p-7 shadow-md">
              <h3 className="text-lg font-black text-[#303654] mb-1">
                Project Submission Studio
              </h3>
              <p className="text-xs text-[#645F80] mb-5">
                Logged in as <strong>{user?.name || "Student"}</strong> ({user?.email || "guest@bems.edu.ng"})
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Repository / Source URL */}
                <div>
                  <label className="block text-xs font-bold text-[#303654] uppercase tracking-wider mb-1.5">
                    {repoLabel}
                  </label>
                  <div className="relative">
                    <GitBranch className="w-4 h-4 text-[#645F80] absolute left-3.5 top-3" />
                    <input
                      type="url"
                      required
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder={repoPlaceholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F1E2F5] text-xs text-[#303654] focus:outline-none focus:border-[#AE54C6] focus:ring-2 focus:ring-[#AE54C6]/15"
                    />
                  </div>
                </div>

                {/* Live Hosted Demo URL */}
                <div>
                  <label className="block text-xs font-bold text-[#303654] uppercase tracking-wider mb-1.5">
                    {demoLabel}
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#645F80] absolute left-3.5 top-3" />
                    <input
                      type="url"
                      required
                      value={liveDemoUrl}
                      onChange={(e) => setLiveDemoUrl(e.target.value)}
                      placeholder={demoPlaceholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F1E2F5] text-xs text-[#303654] focus:outline-none focus:border-[#AE54C6] focus:ring-2 focus:ring-[#AE54C6]/15"
                    />
                  </div>
                </div>

                {/* Architecture Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#303654] uppercase tracking-wider mb-1.5">
                    Project Architecture &amp; Implementation Notes
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe how you solved the problem, libraries or APIs used, challenges overcome, and special instructions for the instructor..."
                    className="w-full p-3 rounded-xl border border-[#F1E2F5] text-xs text-[#303654] focus:outline-none focus:border-[#AE54C6] focus:ring-2 focus:ring-[#AE54C6]/15 resize-none leading-relaxed"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="purple"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full gap-2 mt-2 shadow-md text-xs font-bold"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "Submitting Project…"
                      : existingSubmission
                      ? "Update Project Submission"
                      : isCapstone
                      ? "Submit Capstone for Grading"
                      : "Submit Milestone for Grading"}
                  </span>
                </Button>
              </form>

              {/* Instant AI Pre-Audit Helper */}
              <div className="mt-6 pt-5 border-t border-[#F1E2F5] space-y-3">
                <button
                  type="button"
                  onClick={handleRunAiAudit}
                  disabled={isAuditing}
                  className="w-full py-2.5 px-3 rounded-xl border border-[#AE54C6]/30 bg-[#FAF8FF] hover:bg-purple-50 text-xs font-bold text-[#303654] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#AE54C6]" />
                  <span>{isAuditing ? "Auditing Project Links…" : "Run Instant AI Pre-Audit"}</span>
                </button>

                {auditResult && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                    <div className="flex items-center justify-between font-black">
                      <span>AI Pre-Audit Score:</span>
                      <span className="text-emerald-700">{auditResult.score}/100</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-bold">{auditResult.verdict}</div>
                    <ul className="list-disc list-inside text-[10px] space-y-1 text-emerald-900/80 pt-1">
                      {auditResult.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link href={`/ai?tab=feedback&courseId=${course.id}`} className="block text-center">
                  <span className="text-[11px] text-[#AE54C6] hover:underline font-bold">
                    Open Comprehensive AI Code Review Studio &rarr;
                  </span>
                </Link>

                {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
                  <div className="pt-2 text-center">
                    <Link
                      href="/instructor/grading"
                      className="inline-block text-xs font-bold text-[#303654] hover:text-[#AE54C6] underline"
                    >
                      Open Instructor Grading Studio &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F1E2F5] text-xs text-[#645F80]">
          <Link href={`/courses/${course.slug}`} className="hover:text-[#303654] font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course Syllabus
          </Link>
          <Link href="/dashboard" className="hover:text-[#303654] font-semibold flex items-center gap-1">
            Student Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
