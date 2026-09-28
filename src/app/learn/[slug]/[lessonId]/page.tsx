"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  FileCheck,
  Target,
  Bot
} from "lucide-react";
import { CONCEPTS, LESSON_CONCEPTS } from "../../../../../prisma/concepts-data";

export default function LessonViewPage({
  params
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = use(params);
  const router = useRouter();
  const {
    courses,
    isHydrated,
    isEnrolled,
    completedLessonIds,
    toggleLessonComplete,
    isLessonCompleted,
    getCourseProgress,
    learningProfile
  } = useLMS();

  const course = courses.find((c) => c.slug === slug);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        Loading lesson…
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-[#18143D] mb-4">Course Not Found</h2>
          <Link href="/">
            <Button>Back to Courses</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Flatten lessons for linear navigation
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const currentLesson =
    currentLessonIndex !== -1 ? allLessons[currentLessonIndex] : allLessons[0];

  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;

  const isCompleted = isLessonCompleted(currentLesson.id);
  const progress = getCourseProgress(course.id);

  // Resolve concepts taught in this lesson + student's live mastery score from learningProfile
  const allMastery = [...learningProfile.strengths, ...learningProfile.weaknesses];
  const rawLinks = LESSON_CONCEPTS[currentLesson.id] ?? [];
  const mappedConcepts = rawLinks
    .map((link) => CONCEPTS.find((c) => c.id === link.conceptId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const lessonConcepts =
    mappedConcepts.length > 0
      ? mappedConcepts
      : CONCEPTS.filter((c) => c.courseId === course.id).slice(0, 2);

  const handleNextOrFinish = async () => {
    if (!isCompleted) {
      await toggleLessonComplete(currentLesson.id);
    }
    if (nextLesson) {
      router.push(`/learn/${slug}/${nextLesson.id}`);
    } else {
      router.push(`/learn/${slug}/quiz/quiz-${slug}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Classroom Header Bar */}
      <div className="bg-[#18143D] text-white py-4 px-4 sm:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${slug}`}
              className="text-[#A5A0C8] hover:text-white transition-colors p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#A5A0C8] font-bold">
                  {course.title} Classroom
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#7928CA]/30 text-purple-200 border border-[#7928CA]/50 font-semibold">
                  {progress.percent}% Completed
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white truncate max-w-xl">
                {currentLesson.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/ai?tab=tutor&courseId=${encodeURIComponent(course.id)}&lessonTitle=${encodeURIComponent(currentLesson.title)}`}
            >
              <Button
                variant="purple"
                size="sm"
                className="shadow-xs text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Ask AI Tutor
              </Button>
            </Link>
            <Link href={`/learn/${slug}/quiz/quiz-${slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-400/40 text-purple-200 hover:bg-white/10"
              >
                <Award className="w-4 h-4 mr-1.5 text-yellow-400" /> Take Assessment
              </Button>
            </Link>
            <Link href={`/learn/${slug}/assignment/assign-${slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-400/40 text-purple-200 hover:bg-white/10"
              >
                <FileCheck className="w-4 h-4 mr-1.5 text-purple-300" /> Capstone
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Classroom Workspace: Video + Sidebar */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video & Lesson Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-black shadow-xl border border-[#E6E1F5] aspect-video relative group">
              <video
                key={currentLesson.videoUrl}
                controls
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={currentLesson.videoUrl} type="video/mp4" />
                Your browser does not support HTML5 video streaming.
              </video>
            </div>

            {/* Lesson Control Bar */}
            <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EDF9]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#7928CA]">
                      LESSON {currentLessonIndex + 1} OF {allLessons.length}
                    </span>
                    <span className="text-xs text-[#8580A3] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {currentLesson.duration}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#18143D]">
                    {currentLesson.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => toggleLessonComplete(currentLesson.id)}
                    variant={isCompleted ? "secondary" : "outline"}
                    className="border-[#D1C9EB]"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 mr-1.5 text-[#8580A3]" />
                        Mark as Complete
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleNextOrFinish}
                    variant="purple"
                    className="shadow-sm"
                  >
                    {nextLesson ? (
                      <>
                        Next Lesson <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    ) : (
                      <>
                        Start Assessment Exam <Award className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Lesson Overview & Notes */}
              <div className="pt-4 space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#645F80] mb-2">
                    Lesson Overview & Objectives
                  </h3>
                  <p className="text-sm text-[#4A4568] leading-relaxed">
                    {currentLesson.description}
                  </p>
                </div>

                {/* Knowledge Concepts Covered in This Lesson */}
                {lessonConcepts.length > 0 && (
                  <div className="pt-3 border-t border-[#F0EDF9]">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#645F80] flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#7928CA]" /> Knowledge Concepts in This Lesson
                      </h3>
                      <span className="text-[11px] font-semibold text-[#7928CA]">
                        Tracked by LearnIQ Engine
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lessonConcepts.map((concept) => {
                        const masteryRecord = allMastery.find(
                          (m) => m.conceptId === concept.id
                        );
                        const masteryPct = masteryRecord
                          ? Math.round(masteryRecord.masteryScore * 100)
                          : null;
                        const isStrong = masteryPct !== null && masteryPct >= 75;
                        return (
                          <div
                            key={concept.id}
                            className="p-3.5 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5] flex flex-col justify-between gap-2.5"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold text-[#18143D]">
                                  {concept.name}
                                </span>
                                {masteryPct !== null ? (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      isStrong
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                    }`}
                                  >
                                    {masteryPct}% Mastery
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#645F80] border border-[#E6E1F5]">
                                    Untested
                                  </span>
                                )}
                              </div>
                              {concept.description && (
                                <p className="text-xs text-[#645F80] leading-relaxed">
                                  {concept.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <Link
                                href={`/ai?tab=tutor&courseId=${encodeURIComponent(course.id)}&lessonTitle=${encodeURIComponent(`${currentLesson.title} — ${concept.name}`)}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#7928CA] hover:text-[#5B189A] transition-colors"
                              >
                                <Bot className="w-3.5 h-3.5" /> Explain {concept.name} with AI →
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7928CA]/10 text-[#7928CA] flex items-center justify-center font-bold text-sm">
                      {course.tutor.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#18143D]">
                        Lead Tutor: {course.tutor}
                      </div>
                      <div className="text-xs text-[#645F80]">
                        {course.tutorRole}
                      </div>
                    </div>
                  </div>
                  <Badge variant="purple">Instructor Support</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Course Curriculum Drawer / Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E6E1F5] shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9] mb-4">
                <h3 className="font-bold text-[#18143D] text-sm">
                  Course Content & Modules
                </h3>
                <span className="text-xs font-semibold text-[#7928CA]">
                  {progress.completed}/{progress.total} Done
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#E6E1F5] rounded-full h-2 mb-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#7928CA] to-[#8B5CF6] h-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              {/* Modules list */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {course.modules.map((mod) => (
                  <div key={mod.id} className="space-y-2">
                    <div className="text-xs font-bold text-[#18143D] px-2 py-1 bg-[#FAF8FF] rounded-lg border border-[#E6E1F5]/60">
                      {mod.title}
                    </div>

                    <div className="space-y-1 pl-2">
                      {mod.lessons.map((les) => {
                        const isCurrent = les.id === currentLesson.id;
                        const isDone = isLessonCompleted(les.id);

                        return (
                          <Link
                            key={les.id}
                            href={`/learn/${slug}/${les.id}`}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                              isCurrent
                                ? "bg-[#7928CA] text-white font-semibold shadow-xs"
                                : "hover:bg-[#FAF8FF] text-[#4A4568]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              {isDone ? (
                                <CheckCircle2
                                  className={`w-4 h-4 flex-shrink-0 ${
                                    isCurrent ? "text-emerald-300" : "text-emerald-600"
                                  }`}
                                />
                              ) : (
                                <Play
                                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                                    isCurrent ? "text-white" : "text-[#8580A3]"
                                  }`}
                                />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <span
                              className={`text-[10px] ml-2 ${
                                isCurrent ? "text-purple-200" : "text-[#8580A3]"
                              }`}
                            >
                              {les.duration}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Assessment Card in Sidebar */}
              <div className="mt-6 pt-4 border-t border-[#F0EDF9] space-y-2">
                <div className="text-xs font-bold text-[#18143D]">
                  Next Step: Assessment & Certification
                </div>
                <Link
                  href={`/learn/${slug}/quiz/quiz-${slug}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-purple-50 text-[#7928CA] hover:bg-purple-100 transition-colors text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4" /> Comprehensive Quiz
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/learn/${slug}/assignment/assign-${slug}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" /> Capstone Submission
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

