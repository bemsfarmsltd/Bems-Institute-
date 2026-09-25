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
  PlayCircle,
  Lock,
  CheckCircle2,
  Clock,
  UserCheck,
  Award,
  ArrowLeft,
  Sparkles,
  MessageCircle,
  BookOpen
} from "lucide-react";

export default function CourseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { isEnrolled, enrollInCourse, isLessonCompleted, getCourseProgress } = useLMS();

  const course = LMS_COURSES.find((c) => c.slug === slug);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold text-[#18143D] mb-4">Course Not Found</h1>
          <Link href="/">
            <Button>Back to Courses</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const enrolled = isEnrolled(course.id);
  const progress = getCourseProgress(course.id);
  const firstLessonId = course.modules[0]?.lessons[0]?.id || "les-1";
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  const handleEnroll = () => {
    enrollInCourse(course.id);
    router.push(`/learn/${course.slug}/${firstLessonId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="bg-gradient-to-r from-[#18143D] via-[#241E56] to-[#18143D] text-white py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/#courses" className="inline-flex items-center gap-2 text-xs text-[#D8B4FE] hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Course Catalog
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="purple">{course.badge}</Badge>
            <Badge variant="gold">{course.duration}</Badge>
            <span className="text-xs text-[#A5A0C8]">
              {course.modules.length} Modules · {totalLessons} Video Lessons
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            {course.title}
          </h1>
          <p className="text-lg text-[#D8B4FE] max-w-2xl mb-6">
            {course.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-white/90">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#D8B4FE]" />
              <span><strong>Lead Instructor:</strong> {course.tutor} ({course.tutorRole})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D8B4FE]" />
              <span><strong>Schedule:</strong> {course.schedule}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-[#18143D] mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#7928CA]" />
                <span>Course Curriculum & Video Lessons</span>
              </h2>
              <p className="text-sm text-[#645F80]">
                Structured step-by-step learning modules. Complete all lessons and the final project to unlock your BEMS Verified Certificate.
              </p>
            </div>

            <div className="space-y-6">
              {course.modules.map((mod) => (
                <div 
                  key={mod.id} 
                  className="bg-white border border-[#E6E1F5] rounded-2xl overflow-hidden shadow-xs"
                >
                  <div className="bg-[#FAF8FF] px-6 py-4 border-b border-[#E6E1F5] flex items-center justify-between">
                    <h3 className="font-bold text-[#18143D] text-base">
                      {mod.title}
                    </h3>
                    <span className="text-xs font-semibold text-[#7928CA]">
                      {mod.lessons.length} Lessons
                    </span>
                  </div>

                  <div className="divide-y divide-[#E6E1F5]">
                    {mod.lessons.map((lesson) => {
                      const completed = isLessonCompleted(lesson.id);
                      const canWatch = enrolled || lesson.isFreePreview;

                      return (
                        <div 
                          key={lesson.id} 
                          className="px-6 py-4 flex items-center justify-between hover:bg-[#FAF8FF]/60 transition-colors"
                        >
                          <div className="flex items-start gap-3.5">
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                            ) : canWatch ? (
                              <PlayCircle className="w-5 h-5 text-[#7928CA] shrink-0 mt-0.5" />
                            ) : (
                              <Lock className="w-5 h-5 text-[#A5A0C8] shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-[#18143D]">
                                  {lesson.title}
                                </span>
                                {lesson.isFreePreview && !enrolled && (
                                  <Badge variant="green" className="text-[10px] py-0 px-2">
                                    Free Preview
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-[#645F80] mt-0.5 line-clamp-1">
                                {lesson.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 ml-4">
                            <span className="text-xs text-[#645F80] font-mono">
                              {lesson.duration}
                            </span>
                            {canWatch ? (
                              <Link href={`/learn/${course.slug}/${lesson.id}`}>
                                <Button size="sm" variant={completed ? "outline" : "primary"}>
                                  {completed ? "Review" : "Watch"}
                                </Button>
                              </Link>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                Locked
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-6 flex items-start gap-4">
              <Award className="w-8 h-8 text-[#D97706] shrink-0" />
              <div>
                <h4 className="font-bold text-[#92400E] text-base mb-1">
                  Mandatory Final Capstone Project (Proof for Employers)
                </h4>
                <p className="text-sm text-[#78350F]">
                  {course.finalProject}
                </p>
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white border border-[#E6E1F5] rounded-3xl p-6 sm:p-8 shadow-lg">
              
              {enrolled ? (
                <div>
                  <Badge variant="green" className="mb-3">
                    ACTIVE ENROLLMENT
                  </Badge>
                  <h3 className="text-xl font-black text-[#18143D] mb-2">
                    Your Course Progress
                  </h3>
                  <p className="text-xs text-[#645F80] mb-4">
                    {progress.completed} of {progress.total} lessons completed ({progress.percent}%)
                  </p>

                  <div className="w-full h-3 bg-[#F4EFFF] rounded-full overflow-hidden mb-6">
                    <div 
                      className="h-full bg-gradient-to-r from-[#7928CA] to-[#10B981] transition-all duration-500"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>

                  <Link href={`/learn/${course.slug}/${firstLessonId}`} className="block w-full mb-3">
                    <Button className="w-full gap-2" size="lg">
                      <PlayCircle className="w-5 h-5" />
                      <span>Continue Learning</span>
                    </Button>
                  </Link>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Link href={`/learn/${course.slug}/quiz/quiz-${course.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Take Quiz
                      </Button>
                    </Link>
                    <Link href={`/learn/${course.slug}/assignment/assign-${course.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Capstone
                      </Button>
                    </Link>
                  </div>

                  <Link href="https://chat.whatsapp.com/BEMSFutureSkills2026Cohort" target="_blank" className="block w-full">
                    <Button variant="whatsapp" className="w-full gap-2" size="sm">
                      <MessageCircle className="w-4 h-4" />
                      <span>Cohort WhatsApp Group</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold text-[#7928CA] uppercase tracking-wider block mb-1">
                    Full Course Access
                  </span>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-black text-[#18143D]">
                      ₦{course.priceFull.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#645F80] line-through">
                      ₦{course.priceParts.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#FAF8FF] border border-[#E6E1F5] rounded-xl p-3.5 mb-6 text-xs text-[#18143D] space-y-1.5">
                    <div><strong>Pay in Parts Option:</strong> ₦{course.priceParts.toLocaleString()}</div>
                    <div className="text-[#7928CA] font-semibold">
                      Start today with ₦{course.deposit.toLocaleString()} deposit
                    </div>
                  </div>

                  <Button onClick={handleEnroll} size="lg" className="w-full gap-2 mb-3">
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Demo Enroll (Unlock LMS)</span>
                  </Button>

                  <Link href={`http://localhost:3000/enroll?course=${course.id}`} className="block w-full">
                    <Button variant="outline" size="md" className="w-full">
                      Full Checkout & Paystack Portal
                    </Button>
                  </Link>

                  <ul className="mt-6 pt-6 border-t border-[#E6E1F5] space-y-2.5 text-xs text-[#645F80]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>All {totalLessons} HD Video Lessons & Notes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Phase 2 Quizzes & Capstone Grading</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Verified BEMS Certificate of Competence</span>
                    </li>
                  </ul>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
