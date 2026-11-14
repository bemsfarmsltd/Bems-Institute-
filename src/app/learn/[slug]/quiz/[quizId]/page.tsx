"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { LMS_COURSES } from "@/data/lms-data";
import { LMS_QUIZZES } from "@/data/assessment-data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Sparkles,
  Bot,
  Clock,
  Check,
  AlertCircle,
  Trophy,
  GraduationCap,
  ExternalLink
} from "lucide-react";

export default function QuizAssessmentPage({
  params
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const { slug, quizId } = use(params);
  const router = useRouter();

  const {
    courses,
    quizzes,
    user,
    isHydrated,
    submitQuiz,
    getQuizResult
  } = useLMS();

  // Resolve course from live context or fallback
  const course = useMemo(() => {
    return (
      courses.find((c) => c.slug === slug || c.id === slug) ||
      LMS_COURSES.find((c) => c.slug === slug || c.id === slug)
    );
  }, [courses, slug]);

  // Resolve quiz from live context or fallback matching ID, courseId, or slug
  const quiz = useMemo(() => {
    const courseId = course?.id || slug;
    return (
      quizzes.find(
        (q) =>
          q.id === quizId ||
          q.courseId === quizId ||
          q.courseId === courseId ||
          q.id === `quiz-${courseId}`
      ) ||
      LMS_QUIZZES.find(
        (q) =>
          q.id === quizId ||
          q.courseId === quizId ||
          q.courseId === courseId ||
          q.id === `quiz-${courseId}`
      )
    );
  }, [quizzes, quizId, course, slug]);

  const existingResult = quiz ? getQuizResult(quiz.id) : undefined;

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    existingResult?.selectedAnswers || {}
  );
  const [submitted, setSubmitted] = useState<boolean>(Boolean(existingResult));
  const [latestResult, setLatestResult] = useState(existingResult);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with existing result once loaded
  useEffect(() => {
    if (existingResult) {
      setSelectedAnswers(existingResult.selectedAnswers);
      setSubmitted(true);
      setLatestResult(existingResult);
    }
  }, [existingResult?.attemptedAt, existingResult]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#AE54C6] border-t-transparent rounded-full animate-spin" />
          <span>Loading assessment…</span>
        </div>
      </div>
    );
  }

  if (!course || !quiz) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF8FF] border border-[#F1E2F5] flex items-center justify-center mb-4 text-[#AE54C6]">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#303654] mb-2">Quiz Assessment Not Found</h2>
          <p className="text-sm text-[#645F80] mb-6 max-w-md">
            We could not locate the requested assessment. You can take the assessment directly from your course track.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={`/courses/${slug || "web-dev"}`}>
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

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setError(null);
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount < totalQuestions) {
      setError(`Please answer all ${totalQuestions} questions before submitting (currently ${answeredCount} answered).`);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await submitQuiz(quiz.id, selectedAnswers);
      setLatestResult(res);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not submit your assessment. Please try again.";
      setError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setLatestResult(undefined);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Header Bar */}
      <div className="bg-[#303654] text-white py-10 border-b border-white/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C6BDD3] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {course.title} Syllabus
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="purple">{course.title.toUpperCase()}</Badge>
            <Badge variant="gold">PASSING SCORE: {quiz.passingScore}%</Badge>
            <span className="text-[11px] font-semibold text-[#C6BDD3] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> ~15 Mins
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {quiz.title}
          </h1>
          <p className="text-sm text-[#C6BDD3] leading-relaxed max-w-2xl">
            {quiz.description ||
              "Test your technical understanding of the core concepts taught in this program. Achieving the passing threshold is required for official BEMS certification."}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        
        {/* Guest Practice Mode Notice */}
        {!user && (
          <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#AE54C6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-[#303654]">
              <Sparkles className="w-4 h-4 text-[#AE54C6] shrink-0" />
              <span>
                <strong>Practice Mode:</strong> You are taking this assessment as a prospective student. Your score will be calculated immediately.{" "}
                <Link href={`/login?redirect=/learn/${slug}/quiz/${quiz.id}`} className="text-[#AE54C6] underline font-bold">
                  Sign in or create an account
                </Link>{" "}
                to save it permanently to your transcript.
              </span>
            </div>
          </div>
        )}

        {/* Result Banner if Submitted */}
        {submitted && latestResult && (
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-lg transition-all ${
              latestResult.passed
                ? "bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-300 text-emerald-950"
                : "bg-gradient-to-br from-rose-50 to-amber-50 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    latestResult.passed
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {latestResult.passed ? (
                    <Trophy className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        latestResult.passed
                          ? "bg-emerald-200/80 text-emerald-900"
                          : "bg-rose-200/80 text-rose-900"
                      }`}
                    >
                      {latestResult.passed ? "PASSED WITH DISTINCTION" : "BELOW PASSING THRESHOLD"}
                    </span>
                    {(!user || latestResult.userId === "guest") && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Practice Mode (Unrecorded)
                      </span>
                    )}
                    <span className="text-xs text-[#645F80] font-medium">
                      Exam Requirement: {quiz.passingScore}%
                    </span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight">
                    {latestResult.passed
                      ? "Technical Assessment Successfully Passed!"
                      : "Good Effort! More Practice Recommended"}
                  </h2>

                  <p className="text-sm mt-1 leading-relaxed">
                    You scored <strong className="text-xl font-black">{latestResult.score}%</strong>.{" "}
                    {latestResult.passed
                      ? "Your score demonstrates technical mastery of this track's foundational modules."
                      : "Review the tutor explanations and sample hints below, then retake the exam to boost your score."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                {!latestResult.passed && (
                  <Button
                    onClick={handleRetake}
                    variant="outline"
                    className="w-full sm:w-auto bg-white border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs"
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" /> Retake Assessment
                  </Button>
                )}

                {latestResult.passed && (
                  <Link href={`/learn/${course.slug}/assignment/assign-${course.slug}`} className="w-full sm:w-auto">
                    <Button variant="purple" className="w-full sm:w-auto shadow-md text-xs font-bold">
                      Proceed to Capstone Project <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                )}

                <Link href={`/learn/${course.slug}/${course.modules[0]?.lessons[0]?.id || "les-1"}`} className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto text-xs font-bold">
                    Back to Lessons
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Progress & Question Tracker Bar */}
        {!submitted && (
          <div className="bg-white rounded-2xl p-4 border border-[#F1E2F5] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#645F80]">
              <span className="flex items-center gap-1.5 text-[#303654]">
                <Award className="w-4 h-4 text-[#AE54C6]" />
                Questions Completed: {answeredCount} of {totalQuestions}
              </span>
              <span className="text-[#AE54C6]">{progressPercent}% Ready</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#F1E2F5] rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#AE54C6] to-[#C591E9] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick Question Navigation Buttons */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
              {quiz.questions.map((q, idx) => {
                const isDone = selectedAnswers[q.id] !== undefined;
                return (
                  <a
                    key={q.id}
                    href={`#question-${q.id}`}
                    className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? "bg-[#AE54C6] text-white shadow-xs"
                        : "bg-[#FAF8FF] text-[#645F80] border border-[#F1E2F5] hover:border-[#AE54C6]"
                    }`}
                    title={`Question ${idx + 1}: ${isDone ? "Answered" : "Unanswered"}`}
                  >
                    {idx + 1}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Form */}
        <form onSubmit={handleSubmitQuiz} className="space-y-6">
          {quiz.questions.map((q, idx) => {
            const chosenOption = selectedAnswers[q.id];
            const isCorrect = chosenOption === q.correctOption;

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F1E2F5] shadow-xs hover:border-[#E5C8ED] transition-all scroll-mt-24 space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] text-[#303654] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#303654] leading-snug">
                      {q.prompt}
                    </h3>
                  </div>

                  {submitted && (
                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct (+1)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-xs">
                          <XCircle className="w-4 h-4 text-rose-600" /> Incorrect
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3 pt-1">
                  {q.options.map((option, optIdx) => {
                    const isSelected = chosenOption === optIdx;
                    let optionStyle =
                      "border-[#F1E2F5] bg-white text-[#303654] hover:bg-[#FAF8FF] hover:border-[#AE54C6]/40";

                    if (submitted) {
                      if (optIdx === q.correctOption) {
                        optionStyle =
                          "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs";
                      } else if (isSelected && !isCorrect) {
                        optionStyle =
                          "border-rose-300 bg-rose-50/70 text-rose-950 line-through opacity-80";
                      } else {
                        optionStyle = "border-[#F1E2F5] bg-gray-50/40 text-[#8580A3] opacity-50";
                      }
                    } else if (isSelected) {
                      optionStyle =
                        "border-[#AE54C6] bg-[#FAF8FF] text-[#303654] font-bold shadow-xs ring-2 ring-[#AE54C6]/20";
                    }

                    return (
                      <button
                        type="button"
                        key={optIdx}
                        disabled={submitted}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black transition-all ${
                              isSelected
                                ? "border-[#AE54C6] bg-[#AE54C6] text-white"
                                : "border-[#E5C8ED] text-[#8580A3] bg-[#FAF8FF]"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-sm font-medium leading-relaxed">{option}</span>
                        </div>

                        {submitted && optIdx === q.correctOption && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tutor Explanation & AI Tutor Helper on Submitted View */}
                {submitted && (
                  <div className="mt-4 p-4 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] space-y-3">
                    <div className="flex items-start gap-2.5 text-xs text-[#4A4568]">
                      <HelpCircle className="w-4 h-4 text-[#AE54C6] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#303654]">Instructor Explanation: </strong>
                        {q.explanation}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F1E2F5]/60 flex items-center justify-between">
                      <Link
                        href={`/ai?tab=tutor&courseId=${encodeURIComponent(course.id)}&prompt=${encodeURIComponent(`Why is "${q.options[q.correctOption]}" the correct answer to: "${q.prompt}" in ${course.title}?`)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AE54C6] hover:text-[#8E3BA6] transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5" /> Ask AI Tutor to explain in detail &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Form Actions Footer */}
          {!submitted && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 bg-white p-6 rounded-3xl border border-[#F1E2F5] shadow-xs">
              <div className="text-xs text-[#645F80]">
                {answeredCount < totalQuestions ? (
                  <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {totalQuestions - answeredCount} question(s) remaining before submission
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    All {totalQuestions} questions answered! Ready to submit.
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {error && (
                  <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="purple"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto shadow-md text-xs font-bold"
                >
                  {isSubmitting ? "Grading Assessment…" : `Submit Assessment (${answeredCount}/${totalQuestions})`}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Additional Navigation Links */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F1E2F5] text-xs text-[#645F80]">
          <Link href={`/courses/${course.slug}`} className="hover:text-[#303654] font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course Syllabus
          </Link>
          <Link href="/dashboard" className="hover:text-[#303654] font-semibold flex items-center gap-1">
            Student Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
