"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireRole } from "@/components/RequireRole";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Globe,
  Clock,
  Sparkles,
  ArrowLeft,
  UserCheck
} from "lucide-react";

function InstructorGradingContent() {
  const { user, submissions, gradeSubmission, certificates } = useLMS();

  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(92);
  const [feedbackInput, setFeedbackInput] = useState<string>(
    "Outstanding responsive layout, clean semantic tags, and reliable API consumption. Approved with distinction!"
  );
  const [error, setError] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  // submissions loads asynchronously — default to the first one once it lands.
  useEffect(() => {
    if (!selectedSubId && submissions.length > 0) {
      setSelectedSubId(submissions[0].id);
    }
  }, [submissions, selectedSubId]);

  const selectedSub = submissions.find((s) => s.id === selectedSubId);
  const selectedCertificate = selectedSub
    ? certificates.find(
        (c) => c.userId === selectedSub.userId && c.courseId === selectedSub.courseId
      )
    : undefined;

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setError(null);
    setIsGrading(true);
    try {
      await gradeSubmission(selectedSub.id, scoreInput, feedbackInput);
      alert(`Submission graded successfully! Certificate has been generated for ${selectedSub.studentName}.`);
    } catch {
      setError("Could not save this grade. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Top Banner */}
      <div className="bg-[#18143D] text-white py-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple">PHASE 2 ASSESSMENT</Badge>
              <Badge variant="gold">FACULTY PORTAL</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Instructor Capstone Grading Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#A5A0C8]">
              Evaluate student GitHub repositories and live deployments. Approving with 70%+ score automatically issues verified BEMS certificates.
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Student Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 4-5 Cols: Submissions List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E1F5]">
              <h3 className="font-extrabold text-[#18143D] text-base">
                Pending & Graded Submissions ({submissions.length})
              </h3>
              <span className="text-xs text-[#645F80]">Click to evaluate</span>
            </div>

            {submissions.map((sub) => {
              const isSelected = sub.id === selectedSubId;
              const isGraded = sub.status === "GRADED";

              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubId(sub.id);
                    if (sub.score) setScoreInput(sub.score);
                    if (sub.feedback) setFeedbackInput(sub.feedback);
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-[#7928CA] shadow-md ring-2 ring-[#7928CA]/20"
                      : "bg-white border-[#E6E1F5] hover:border-[#7928CA]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#18143D]">
                      {sub.studentName}
                    </span>
                    <Badge variant={isGraded ? "green" : "gold"}>
                      {isGraded ? `Graded (${sub.score}%)` : "Awaiting Review"}
                    </Badge>
                  </div>
                  <div className="text-xs text-[#7928CA] font-semibold mb-1">
                    Course: {sub.courseId.toUpperCase()} Capstone
                  </div>
                  <div className="text-[11px] text-[#645F80] truncate">
                    Repo: {sub.githubUrl}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 7-8 Cols: Grading Studio Workbench */}
          <div className="lg:col-span-7">
            {selectedSub ? (
              <div className="bg-white border border-[#E6E1F5] rounded-3xl p-6 sm:p-8 shadow-md">
                
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6E1F5]">
                  <div>
                    <span className="text-[11px] font-bold text-[#7928CA] uppercase tracking-wider block">
                      Evaluating Capstone Deliverables
                    </span>
                    <h2 className="text-xl font-black text-[#18143D]">
                      {selectedSub.studentName}
                    </h2>
                    <span className="text-xs text-[#645F80]">{selectedSub.studentEmail}</span>
                  </div>

                  <Badge variant={selectedSub.status === "GRADED" ? "green" : "gold"}>
                    {selectedSub.status}
                  </Badge>
                </div>

                {/* Student Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <a
                    href={selectedSub.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 bg-[#FAF8FF] border border-[#E6E1F5] rounded-xl text-xs font-semibold text-[#18143D] hover:border-[#7928CA] transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <GitBranch className="w-4 h-4 text-[#7928CA]" />
                      <span className="truncate">View GitHub Repository</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#645F80] shrink-0" />
                  </a>

                  <a
                    href={selectedSub.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 bg-[#FAF8FF] border border-[#E6E1F5] rounded-xl text-xs font-semibold text-[#18143D] hover:border-[#7928CA] transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Globe className="w-4 h-4 text-[#10B981]" />
                      <span className="truncate">Open Live Deployment</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#645F80] shrink-0" />
                  </a>
                </div>

                {selectedSub.notes && (
                  <div className="mb-6 p-4 bg-[#FAF8FF] border border-[#E6E1F5] rounded-xl text-xs text-[#18143D]">
                    <strong className="block text-[#7928CA] mb-1">Student Notes:</strong>
                    <p className="text-[#645F80] leading-relaxed">{selectedSub.notes}</p>
                  </div>
                )}

                {/* Grading Form */}
                <form onSubmit={handleGrade} className="space-y-5 pt-4 border-t border-[#E6E1F5]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#18143D] uppercase tracking-wider mb-1.5">
                        Numerical Score (0 – 100) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={scoreInput}
                        onChange={(e) => setScoreInput(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1F5] text-sm text-[#18143D] font-bold focus:outline-none focus:border-[#7928CA]"
                      />
                      <span className="text-[11px] text-[#645F80] mt-1 block">
                        Scores 70%+ automatically trigger certificate generation.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#18143D] uppercase tracking-wider mb-1.5">
                        Grading Instructor
                      </label>
                      <div className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1F5] bg-[#FAF8FF] text-xs text-[#18143D] font-semibold">
                        {user?.name || "Signed-in instructor"}
                      </div>
                      <span className="text-[11px] text-[#645F80] mt-1 block">
                        Attributed to your signed-in account.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18143D] uppercase tracking-wider mb-1.5">
                      Constructive Feedback & Evaluation Comments *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#E6E1F5] text-xs text-[#18143D] focus:outline-none focus:border-[#7928CA]"
                    />
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button type="submit" size="lg" disabled={isGrading} className="flex-1 gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isGrading ? "Saving…" : "Approve Grade & Issue Certificate"}</span>
                    </Button>

                    {selectedSub.status === "GRADED" && selectedCertificate && (
                      <Link href={`/certificate/${selectedCertificate.id}`}>
                        <Button variant="outline" size="lg" className="gap-2">
                          <Award className="w-4 h-4 text-[#7928CA]" />
                          <span>View Certificate</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </form>

              </div>
            ) : (
              <div className="bg-white border border-[#E6E1F5] rounded-3xl p-12 text-center text-[#645F80]">
                Select a submission on the left to grade.
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function InstructorGradingPage() {
  return (
    <RequireRole allow={["INSTRUCTOR", "ADMIN"]}>
      <InstructorGradingContent />
    </RequireRole>
  );
}
