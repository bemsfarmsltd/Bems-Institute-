"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LMS_COURSES } from "@/data/lms-data";
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
  Bot
} from "lucide-react";

export default function LessonViewPage({
  params
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = use(params);
  const router = useRouter();
  const {
    isEnrolled,
    completedLessonIds,
    toggleLessonComplete,
    isLessonCompleted,
    getCourseProgress
  } = useLMS();

  const course = LMS_COURSES.find((c) => c.slug === slug);

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

  const handleNextOrFinish = () => {
    if (!isCompleted) {
      toggleLessonComplete(currentLesson.id);
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

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/ai?tab=tutor" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-400/50 bg-[#7928CA]/20 text-purple-200 hover:bg-[#7928CA]/40"
              >
                <Bot className="w-4 h-4 mr-1.5 text-purple-300" /> Ask AI Tutor
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
                poster="/images/hero-classroom.png"
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
              <div className="pt-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#645F80] mb-2">
                    Lesson Overview & Objectives
                  </h3>
                  <p className="text-sm text-[#4A4568] leading-relaxed">
                    {currentLesson.description}
                  </p>
                </div>

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
