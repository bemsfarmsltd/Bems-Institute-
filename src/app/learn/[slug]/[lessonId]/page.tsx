"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { LMS_COURSES } from "@/data/lms-data";
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
  Bot,
  Lock,
  Code2,
  Video,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  HelpCircle,
  Check,
  ExternalLink,
  ShieldCheck,
  Laptop
} from "lucide-react";
import { CONCEPTS, LESSON_CONCEPTS } from "../../../../../prisma/concepts-data";

function parseVideoSource(url: string | undefined | null) {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim();

  // YouTube matching
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube" as const,
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // Vimeo matching
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|))(\d+)/;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: "vimeo" as const,
      src: `https://player.vimeo.com/video/${vimeoMatch[3]}?badge=0&autopause=0&player_id=0`
    };
  }

  // Direct video file (MP4, WebM, or HLS)
  return {
    type: "video" as const,
    src: trimmed
  };
}

export default function LessonViewPage({
  params
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = use(params);
  const router = useRouter();

  const {
    courses,
    user,
    isHydrated,
    isEnrolled,
    toggleLessonComplete,
    isLessonCompleted,
    getCourseProgress,
    learningProfile
  } = useLMS();

  const [theaterMode, setTheaterMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "sandbox" | "ai" | "resources">("overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  // Resolve course from live catalog or fallback to built-in LMS data
  const course = useMemo(() => {
    return (
      courses.find((c) => c.slug === slug || c.id === slug) ||
      LMS_COURSES.find((c) => c.slug === slug || c.id === slug)
    );
  }, [courses, slug]);

  // Flatten lessons for linear navigation
  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap((m) => m.lessons);
  }, [course]);

  // Find current lesson matching by ID or slug
  const currentLessonIndex = useMemo(() => {
    if (allLessons.length === 0) return -1;
    const idx = allLessons.findIndex((l) => l.id === lessonId || l.slug === lessonId);
    return idx !== -1 ? idx : 0;
  }, [allLessons, lessonId]);

  const currentLesson = allLessons[currentLessonIndex] || allLessons[0];

  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;

  // Find which module contains the current lesson
  const currentModule = useMemo(() => {
    if (!course || !currentLesson) return null;
    return course.modules.find((m) => m.lessons.some((l) => l.id === currentLesson.id));
  }, [course, currentLesson]);

  // Default open all modules or current module
  useEffect(() => {
    if (course) {
      const initial: Record<string, boolean> = {};
      course.modules.forEach((m) => {
        initial[m.id] = true;
      });
      setOpenModules(initial);
    }
  }, [course]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#AE54C6] border-t-transparent rounded-full animate-spin" />
          <span>Loading classroom…</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF8FF] border border-[#F1E2F5] flex items-center justify-center mb-4 text-[#AE54C6]">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#303654] mb-2">Course Not Found</h2>
          <p className="text-sm text-[#645F80] mb-6 max-w-md">
            The course you are looking for does not exist or may have been updated.
          </p>
          <Link href="/courses">
            <Button variant="purple">Explore Available Tracks</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (allLessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-black text-[#303654] mb-2">Curriculum Coming Soon</h2>
          <p className="text-sm text-[#645F80] mb-6 max-w-md">
            {course.title} doesn&apos;t have any published lessons yet. Check back soon or explore another track.
          </p>
          <Link href={`/courses/${course.slug}`}>
            <Button variant="purple">Back to {course.title}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Access check: Staff or Enrolled or Free Preview
  const isStaff = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";
  const userIsEnrolled = isStaff || isEnrolled(course.id) || isEnrolled(course.slug);
  const isFree = Boolean(currentLesson.isFreePreview);
  const canAccessLesson = isFree || userIsEnrolled;

  const isCompleted = isLessonCompleted(currentLesson.id);
  const progress = getCourseProgress(course.id);

  // First free lesson in this course (for the lock-screen prompt)
  const firstFreeLesson = allLessons.find((l) => l.isFreePreview);

  // Resolve concepts taught in this lesson + student's live mastery score from learningProfile
  const allMastery = [...(learningProfile?.strengths || []), ...(learningProfile?.weaknesses || [])];
  const rawLinks = LESSON_CONCEPTS[currentLesson.id] ?? [];
  const mappedConcepts = rawLinks
    .map((link) => CONCEPTS.find((c) => c.id === link.conceptId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const lessonConcepts =
    mappedConcepts.length > 0
      ? mappedConcepts
      : CONCEPTS.filter((c) => c.courseId === course.id).slice(0, 3);

  const parsedVideo = parseVideoSource(currentLesson.videoUrl);

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

  const copyLessonLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const toggleModule = (modId: string) => {
    setOpenModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Classroom Header Bar */}
      <div className="bg-[#303654] text-white py-4 px-4 sm:px-8 border-b border-white/10 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/courses/${slug}`}
              className="text-[#C6BDD3] hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
              title="Back to Course Details"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-[#C6BDD3] font-bold">
                  {course.title}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#AE54C6]/30 text-purple-200 border border-[#AE54C6]/50 font-semibold">
                  {progress.percent}% Completed
                </span>
                {isFree && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    Free Preview
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-black text-white truncate max-w-xl">
                {currentLesson.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/sandbox`}
              target="_blank"
            >
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-bold"
              >
                <Code2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Open Sandbox
              </Button>
            </Link>

            <Link
              href={`/ai?tab=tutor&courseId=${encodeURIComponent(course.id)}&lessonTitle=${encodeURIComponent(currentLesson.title)}`}
            >
              <Button
                variant="purple"
                size="sm"
                className="shadow-xs text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Ask AI Tutor
              </Button>
            </Link>

            <button
              onClick={copyLessonLink}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Copy Lesson Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <ExternalLink className="w-4 h-4 text-[#C6BDD3]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid grid-cols-1 ${theaterMode ? "lg:grid-cols-1" : "lg:grid-cols-3"} gap-8 transition-all`}>
          
          {/* Main Video & Lesson Content Column */}
          <div className={`${theaterMode ? "w-full" : "lg:col-span-2"} space-y-6`}>
            
            {/* Video Player or Locked Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-[#18143D] shadow-2xl border border-[#F1E2F5] aspect-video flex flex-col justify-center items-center">
              
              {/* Theater Mode Toggle button */}
              <button
                onClick={() => setTheaterMode((prev) => !prev)}
                className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer opacity-80 hover:opacity-100"
                title={theaterMode ? "Exit Theater Mode" : "Expand to Theater Mode"}
              >
                {theaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* State 1: User has access and video exists */}
              {canAccessLesson && parsedVideo && (
                <>
                  {parsedVideo.type === "youtube" && (
                    <iframe
                      src={parsedVideo.src}
                      title={currentLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-none"
                    />
                  )}

                  {parsedVideo.type === "vimeo" && (
                    <iframe
                      src={parsedVideo.src}
                      title={currentLesson.title}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-none"
                    />
                  )}

                  {parsedVideo.type === "video" && (
                    <video
                      key={parsedVideo.src}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src={parsedVideo.src} type="video/mp4" />
                      Your browser does not support HTML5 video playback.
                    </video>
                  )}
                </>
              )}

              {/* State 2: User has access, but video recording is pending / offline */}
              {canAccessLesson && !parsedVideo && (
                <div className="p-8 text-center max-w-md text-white space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-emerald-400">
                    <Video className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Class Session Recording</h3>
                    <p className="text-xs text-[#C6BDD3] mt-1 leading-relaxed">
                      The video recording for this lecture is currently being rendered or scheduled for live Zoom. Explore the notes and sandbox below to practice!
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Link href="/sandbox" target="_blank">
                      <Button variant="purple" size="sm" className="text-xs font-bold">
                        <Code2 className="w-3.5 h-3.5 mr-1.5" /> Practice in Sandbox
                      </Button>
                    </Link>
                    <Link href={`/ai?tab=tutor&courseId=${encodeURIComponent(course.id)}&lessonTitle=${encodeURIComponent(currentLesson.title)}`}>
                      <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-300" /> Explain Topic
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* State 3: User DOES NOT have access (Locked Lesson) */}
              {!canAccessLesson && (
                <div className="p-6 sm:p-10 text-center max-w-lg text-white space-y-4 relative z-10">
                  <div className="w-16 h-16 rounded-3xl bg-[#AE54C6]/20 border border-[#AE54C6]/40 mx-auto flex items-center justify-center text-[#C591E9] shadow-lg">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                      Enrollment Required
                    </span>
                    <h3 className="text-xl font-black mt-2">
                      Unlock Full Access to {course.title}
                    </h3>
                    <p className="text-xs text-[#C6BDD3] mt-2 leading-relaxed">
                      This lesson is reserved for students enrolled in the <strong>{course.title}</strong> cohort. Enroll today to access all modules, live mentor Zoom sessions, quizzes, and official BEMS certification.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>3 Months Hands-on Practical Training (Lab + Zoom)</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Flexible installment: ₦{course.deposit.toLocaleString()} deposit to start</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Direct 1-on-1 mentorship with {course.tutor}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link href={`/courses/${course.slug}`} className="w-full sm:w-auto">
                      <Button variant="purple" size="md" className="w-full text-xs font-bold shadow-lg">
                        Enroll in Course &bull; ₦{course.priceFull.toLocaleString()}
                      </Button>
                    </Link>

                    {!user && (
                      <Link href={`/login?redirect=/learn/${slug}/${currentLesson.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="md" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-bold">
                          Already Enrolled? Log In
                        </Button>
                      </Link>
                    )}

                    {firstFreeLesson && firstFreeLesson.id !== currentLesson.id && (
                      <Link href={`/learn/${slug}/${firstFreeLesson.id}`} className="w-full sm:w-auto">
                        <Button variant="secondary" size="md" className="w-full text-xs font-bold">
                          Watch Free Preview
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Control & Completion Bar */}
            <div className="bg-white rounded-3xl p-6 border border-[#F1E2F5] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F7EDF9]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-black text-[#AE54C6] tracking-wide">
                      LESSON {currentLessonIndex + 1} OF {allLessons.length}
                    </span>
                    <span className="text-xs text-[#8580A3] flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" /> {currentLesson.duration}
                    </span>
                    {currentModule && (
                      <span className="text-[11px] text-[#645F80] font-medium bg-[#FAF8FF] px-2.5 py-0.5 rounded-full border border-[#F1E2F5]">
                        {currentModule.title}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#303654]">
                    {currentLesson.title}
                  </h2>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
                  {/* Mark as Complete Button */}
                  <Button
                    onClick={() => toggleLessonComplete(currentLesson.id)}
                    variant={isCompleted ? "secondary" : "outline"}
                    className="flex-1 sm:flex-initial text-xs font-bold"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 mr-1.5 text-[#8580A3]" />
                        Mark Complete
                      </>
                    )}
                  </Button>

                  {/* Previous Lesson Button */}
                  {prevLesson && (
                    <Link href={`/learn/${slug}/${prevLesson.id}`}>
                      <Button variant="outline" size="sm" className="p-2.5" title="Previous Lesson">
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}

                  {/* Next / Finish Button */}
                  <Button
                    onClick={handleNextOrFinish}
                    variant="purple"
                    className="flex-1 sm:flex-initial shadow-md text-xs font-bold"
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

              {/* Tabs for Lesson Details */}
              <div className="pt-4">
                <div className="flex items-center gap-2 border-b border-[#F1E2F5] pb-2 overflow-x-auto">
                  {[
                    { id: "overview", label: "Overview & Notes", icon: BookOpen },
                    { id: "sandbox", label: "Interactive Sandbox", icon: Code2 },
                    { id: "ai", label: "AI Tutor Companion", icon: Sparkles },
                    { id: "resources", label: "Resources", icon: FileCheck }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          isActive
                            ? "bg-[#303654] text-white shadow-xs"
                            : "text-[#645F80] hover:text-[#303654] hover:bg-[#FAF8FF]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Overview & Notes */}
                {activeTab === "overview" && (
                  <div className="pt-5 space-y-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#645F80] mb-2">
                        Lesson Overview & Objectives
                      </h3>
                      <p className="text-sm text-[#4A4568] leading-relaxed bg-[#FAF8FF] p-4 rounded-2xl border border-[#F1E2F5]">
                        {currentLesson.description ||
                          "In this lesson, you will master essential real-world concepts, practice hands-on code examples, and prepare for production deployment."}
                      </p>
                    </div>

                    {/* Knowledge Concepts Covered in This Lesson */}
                    {lessonConcepts.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#645F80] flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-[#AE54C6]" /> Knowledge Concepts in This Lesson
                          </h3>
                          <span className="text-[11px] font-semibold text-[#AE54C6]">
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
                                className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] flex flex-col justify-between gap-2.5"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-xs font-bold text-[#303654]">
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
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#645F80] border border-[#F1E2F5]">
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
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#AE54C6] hover:text-[#9132A8] transition-colors"
                                  >
                                    <Bot className="w-3.5 h-3.5" /> Explain {concept.name} with AI &rarr;
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Instructor Card */}
                    <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#AE54C6]/10 text-[#AE54C6] flex items-center justify-center font-black text-sm">
                          {course.tutor.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#303654]">
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
                )}

                {/* Tab 2: Interactive Sandbox */}
                {activeTab === "sandbox" && (
                  <div className="pt-5 space-y-4">
                    <div className="p-5 rounded-2xl bg-[#303654] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                          <Code2 className="w-4 h-4" /> BEMS Browser IDE
                        </div>
                        <h4 className="text-base font-black">Practice Code for {currentLesson.title}</h4>
                        <p className="text-xs text-[#C6BDD3] mt-1 max-w-lg">
                          Experiment with HTML, CSS, and JavaScript in real-time. Test DOM manipulation, style responsive layouts, and verify output without installing anything on your PC.
                        </p>
                      </div>
                      <Link href="/sandbox" target="_blank" className="shrink-0">
                        <Button variant="purple" size="sm" className="font-bold text-xs">
                          Launch Fullscreen Sandbox <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] space-y-2 text-xs text-[#4A4568]">
                      <div className="font-bold text-[#303654]">Recommended Sandbox Exercises for this Lesson:</div>
                      <ul className="list-disc list-inside space-y-1 text-[#645F80] pl-1">
                        <li>Implement the core layout structure covered by {course.tutor}.</li>
                        <li>Verify responsive breakpoints on 375px mobile and 1024px desktop frames.</li>
                        <li>Add event listeners in JavaScript to capture user clicks and log results to the console.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tab 3: AI Tutor Companion */}
                {activeTab === "ai" && (
                  <div className="pt-5 space-y-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-[#AE54C6]/10 to-[#303654]/10 border border-[#AE54C6]/20">
                      <div className="flex items-center gap-2 text-[#AE54C6] font-bold text-xs mb-1">
                        <Sparkles className="w-4 h-4" /> 24/7 AI Tutor Guidance
                      </div>
                      <h4 className="text-base font-black text-[#303654]">Have a question about {currentLesson.title}?</h4>
                      <p className="text-xs text-[#645F80] mt-1 mb-4">
                        Our specialized BEMS AI Tutor can explain tricky bugs, provide code snippets, or break down concepts in simple terms tailored to your pace.
                      </p>
                      <Link
                        href={`/ai?tab=tutor&courseId=${encodeURIComponent(course.id)}&lessonTitle=${encodeURIComponent(currentLesson.title)}`}
                      >
                        <Button variant="purple" size="sm" className="text-xs font-bold">
                          Ask AI Tutor about this Lesson &rarr;
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {[
                        `Explain "${currentLesson.title}" like I am 10 years old`,
                        `What are the top 3 mistakes beginners make in this topic?`,
                        `Give me a practical challenge to practice right now`,
                        `How does this concept apply to real Nigerian tech jobs?`
                      ].map((promptText, i) => (
                        <Link
                          key={i}
                          href={`/ai?tab=tutor&courseId=${encodeURIComponent(course.id)}&prompt=${encodeURIComponent(promptText)}`}
                          className="p-3 rounded-xl bg-white border border-[#F1E2F5] hover:border-[#AE54C6] hover:bg-[#FAF8FF] transition-all text-[#303654] font-medium flex items-center justify-between"
                        >
                          <span className="truncate mr-2">&ldquo;{promptText}&rdquo;</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#AE54C6] shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 4: Resources */}
                {activeTab === "resources" && (
                  <div className="pt-5 space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] space-y-3">
                      <h4 className="font-bold text-[#303654] text-sm">Downloadable Assets & References</h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-white rounded-xl border border-[#F1E2F5] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <FileCheck className="w-4 h-4 text-[#AE54C6]" />
                            <div>
                              <div className="font-bold text-[#303654]">Official BEMS Track Syllabus (PDF)</div>
                              <div className="text-[10px] text-[#8580A3]">Full 12-week breakdown & milestone schedule</div>
                            </div>
                          </div>
                          <Badge variant="purple">Available</Badge>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-[#F1E2F5] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Laptop className="w-4 h-4 text-emerald-600" />
                            <div>
                              <div className="font-bold text-[#303654]">Physical Lab Workstation Access (Umuahia)</div>
                              <div className="text-[10px] text-[#8580A3]">High-speed fiber optic Wi-Fi & backup power</div>
                            </div>
                          </div>
                          <Badge variant="green">Open 9AM - 5PM</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Curriculum Sidebar Column */}
          <div className={`${theaterMode ? "w-full" : "lg:col-span-1"} space-y-6`}>
            <div className="bg-white rounded-3xl border border-[#F1E2F5] shadow-xs p-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7EDF9] mb-4">
                <h3 className="font-black text-[#303654] text-sm">
                  Course Modules & Lessons
                </h3>
                <span className="text-xs font-black text-[#AE54C6]">
                  {progress.completed}/{progress.total} Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#F1E2F5] rounded-full h-2.5 mb-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#AE54C6] to-[#C591E9] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              {/* Modules Accordion List */}
              <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
                {course.modules.map((mod) => {
                  const isOpen = openModules[mod.id] ?? true;
                  const completedInMod = mod.lessons.filter((l) => isLessonCompleted(l.id)).length;

                  return (
                    <div key={mod.id} className="space-y-2 border border-[#F1E2F5] rounded-2xl p-2.5 bg-[#FAF8FF]/60">
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center justify-between text-left p-1 text-xs font-black text-[#303654] cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#AE54C6] shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8580A3] shrink-0" />}
                          <span className="truncate">{mod.title}</span>
                        </div>
                        <span className="text-[10px] text-[#8580A3] shrink-0 font-bold ml-2">
                          {completedInMod}/{mod.lessons.length}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="space-y-1 pt-1">
                          {mod.lessons.map((les) => {
                            const isCurrent = les.id === currentLesson.id;
                            const isDone = isLessonCompleted(les.id);
                            const canViewThis = les.isFreePreview || userIsEnrolled;

                            return (
                              <Link
                                key={les.id}
                                href={`/learn/${slug}/${les.id}`}
                                className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                                  isCurrent
                                    ? "bg-[#303654] text-white font-bold shadow-sm"
                                    : "hover:bg-white text-[#4A4568]"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {isDone ? (
                                    <CheckCircle2
                                      className={`w-4 h-4 shrink-0 ${
                                        isCurrent ? "text-emerald-300" : "text-emerald-600"
                                      }`}
                                    />
                                  ) : canViewThis ? (
                                    <Play
                                      className={`w-3.5 h-3.5 shrink-0 ${
                                        isCurrent ? "text-white" : "text-[#8580A3]"
                                      }`}
                                    />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                  )}
                                  <span className="truncate">{les.title}</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  {les.isFreePreview && !userIsEnrolled && (
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold px-1.5 py-0.2 rounded-full">
                                      FREE
                                    </span>
                                  )}
                                  <span
                                    className={`text-[10px] ${
                                      isCurrent ? "text-[#C6BDD3]" : "text-[#8580A3]"
                                    }`}
                                  >
                                    {les.duration}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Assessment & Capstone Cards */}
              <div className="mt-6 pt-4 border-t border-[#F7EDF9] space-y-2">
                <div className="text-xs font-black text-[#303654] mb-1">
                  Certifications & Capstones
                </div>
                <Link
                  href={`/learn/${slug}/quiz/quiz-${slug}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 text-[#AE54C6] hover:bg-purple-100 transition-colors text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4" /> Comprehensive Quiz
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/learn/${slug}/assignment/assign-${slug}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" /> Capstone Project Submission
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
