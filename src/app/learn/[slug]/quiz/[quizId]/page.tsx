"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LMS_COURSES } from "@/data/lms-data";
import { LMS_QUIZZES } from "@/data/assessment-data";
import { useLMS } from "@/context/LMSContext";
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
  BookOpen
} from "lucide-react";

export default function QuizAssessmentPage({
  params
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const { slug, quizId } = use(params);
  const router = useRouter();
  const { submitQuiz, getQuizResult, user } = useLMS();

  const course = LMS_COURSES.find((c) => c.slug === slug);
  const quiz = LMS_QUIZZES.find((q) => q.id === quizId);

  const existingResult = getQuizResult(quizId);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    existingResult?.selectedAnswers || {}
  );
  const [submitted, setSubmitted] = useState<boolean>(!!existingResult);
  const [latestResult, setLatestResult] = useState(existingResult);

  if (!course || !quiz) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-[#18143D] mb-4">Quiz Not Found</h2>
          <Link href="/">
            <Button>Back to Courses</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      alert("Please answer all questions before submitting your assessment.");
      return;
    }
    const res = submitQuiz(quiz.id, selectedAnswers);
    setLatestResult(res);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setLatestResult(undefined);
  };

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#18143D] text-white py-10 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A5A0C8] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {course.title} Syllabus
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="purple">PHASE 2 ASSESSMENT</Badge>
            <Badge variant="gold">PASSING SCORE: {quiz.passingScore}%</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {quiz.title}
          </h1>
          <p className="text-sm text-[#A5A0C8] leading-relaxed">
            {quiz.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Result Banner if submitted */}
        {submitted && latestResult && (
          <div
            className={`p-6 rounded-2xl mb-8 border transition-all ${
              latestResult.passed
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-red-50 border-red-200 text-red-950"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {latestResult.passed ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h2 className="text-xl font-black">
                    {latestResult.passed
                      ? "Assessment Passed! Congratulations!"
                      : "Assessment Score Below Passing Threshold"}
                  </h2>
                  <p className="text-sm mt-1">
                    You scored{" "}
                    <span className="font-extrabold text-lg">
                      {latestResult.score}%
                    </span>{" "}
                    (Passing requirement is {quiz.passingScore}%).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!latestResult.passed && (
                  <Button
                    onClick={handleRetake}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" /> Retake Exam
                  </Button>
                )}
                {latestResult.passed && (
                  <Link href={`/learn/${slug}/assignment/assign-${slug}`}>
                    <Button variant="purple" className="shadow-md">
                      Go to Capstone Project <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Question Form */}
        <form onSubmit={handleSubmitQuiz} className="space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-[#645F80] pb-2 border-b border-[#E6E1F5]">
            <span>
              TOTAL QUESTIONS: {totalQuestions}
            </span>
            <span>
              ANSWERED: {answeredCount} / {totalQuestions}
            </span>
          </div>

          {quiz.questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const chosenOption = selectedAnswers[q.id];
            const isCorrect = chosenOption === q.correctOption;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs hover:border-[#D1C9EB] transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#FAF8FF] border border-[#E6E1F5] text-[#18143D] text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-[#18143D]">
                      {q.prompt}
                    </h3>
                  </div>

                  {submitted && (
                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  {q.options.map((option, optIdx) => {
                    const isSelected = chosenOption === optIdx;
                    let optionStyle =
                      "border-[#E6E1F5] bg-white text-[#18143D] hover:bg-[#FAF8FF]";

                    if (submitted) {
                      if (optIdx === q.correctOption) {
                        optionStyle =
                          "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium";
                      } else if (isSelected && !isCorrect) {
                        optionStyle =
                          "border-red-400 bg-red-50 text-red-950 line-through";
                      } else {
                        optionStyle = "border-[#E6E1F5] bg-gray-50/50 text-[#8580A3] opacity-60";
                      }
                    } else if (isSelected) {
                      optionStyle =
                        "border-[#7928CA] bg-[#FAF8FF] text-[#18143D] font-medium shadow-xs";
                    }

                    return (
                      <button
                        type="button"
                        key={optIdx}
                        disabled={submitted}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? "border-[#7928CA] bg-[#7928CA] text-white"
                                : "border-[#CCC7E5] text-[#8580A3]"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on submitted view */}
                {submitted && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5] text-xs text-[#4A4568] flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-[#7928CA] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#18143D]">Tutor Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!submitted && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="submit"
                variant="purple"
                size="lg"
                className="w-full sm:w-auto shadow-md"
              >
                Submit Exam Answers ({answeredCount}/{totalQuestions})
              </Button>
            </div>
          )}
        </form>
      </div>

      <Footer />
    </div>
  );
}
