"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { buildWhatsAppLink, BEMS_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { CourseDetailTour } from "@/components/tours/CourseDetailTour";
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
  BookOpen,
  AlertTriangle,
  Star,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap
} from "lucide-react";
import { LMS_COURSES } from "@/data/lms-data";

export default function CourseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const {
    courses,
    isHydrated,
    isEnrolled,
    enrollInCourse,
    isLessonCompleted,
    getCourseProgress,
    getQuizForCourse,
    getAssignmentForCourse,
    getCertificate,
    user
  } = useLMS();

  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestName, setInterestName] = useState("");
  const [interestPhone, setInterestPhone] = useState("");
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [interestWhatsappSent, setInterestWhatsappSent] = useState(false);

  interface CourseReview {
    id: string;
    userId: string;
    name: string;
    avatarUrl: string | null;
    rating: number;
    comment: string | null;
    createdAt: string;
  }
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [reviewAverage, setReviewAverage] = useState(0);
  const [myRatingDraft, setMyRatingDraft] = useState(0);
  const [myCommentDraft, setMyCommentDraft] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  const course =
    courses.find((c) => c.slug === slug || c.id === slug) ||
    LMS_COURSES.find((c) => c.slug === slug || c.id === slug);

  useEffect(() => {
    if (!course) return;
    apiFetch(`/api/lms/reviews?courseId=${course.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setReviews(data.reviews || []);
        setReviewAverage(data.average || 0);
        const mine = (data.reviews || []).find((r: CourseReview) => r.userId === user?.id);
        if (mine) {
          setMyRatingDraft(mine.rating);
          setMyCommentDraft(mine.comment || "");
        }
      })
      .catch(() => {
        // reviews unavailable — the rest of the course page still works
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id]);

  const handleSubmitReview = async () => {
    if (!course || myRatingDraft < 1) return;
    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      const res = await apiFetch("/api/lms/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, rating: myRatingDraft, comment: myCommentDraft.trim() })
      });
      if (res.ok) {
        const refreshed = await apiFetch(`/api/lms/reviews?courseId=${course.id}`);
        if (refreshed.ok) {
          const data = await refreshed.json();
          setReviews(data.reviews || []);
          setReviewAverage(data.average || 0);
        }
        setReviewMsg("Thanks for your review!");
      } else {
        const data = await res.json().catch(() => ({}));
        setReviewMsg(data.error || "Could not submit review.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] text-sm text-[#645F80]">
        Loading course…
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold text-[#303654] mb-4">Course Not Found</h1>
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
  const firstFreeLesson = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.isFreePreview);
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const courseQuiz = getQuizForCourse(course.id);
  const courseAssignment = getAssignmentForCourse(course.id);

  const handleEnroll = async () => {
    await enrollInCourse(course.id);
    router.push(`/learn/${course.slug}/${firstLessonId}`);
  };

  const openInterestModal = () => {
    setInterestError(null);
    setInterestSubmitted(false);
    setShowInterestModal(true);
  };

  const handleSubmitInterest = async () => {
    if (!interestName.trim() || !interestPhone.trim()) {
      setInterestError("Please fill in your name and phone number.");
      return;
    }
    setSubmittingInterest(true);
    setInterestError(null);
    try {
      const res = await apiFetch("/api/lms/register-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: interestName.trim(), phone: interestPhone.trim(), courseId: course.id })
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setInterestWhatsappSent(Boolean(data.whatsappSent));
        setInterestSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setInterestError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setInterestError("Could not reach the server. Please try again.");
    } finally {
      setSubmittingInterest(false);
    }
  };

  const interestWhatsAppUrl = buildWhatsAppLink(
    BEMS_WHATSAPP_NUMBER,
    `Hi BEMS! I'm ${interestName || "interested"} and I'd like to know more about the ${course.title} track.`
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <CourseDetailTour />
      <Navbar />

      <div className="bg-gradient-to-r from-[#303654] via-[#3E4569] to-[#303654] text-white py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/courses" className="inline-flex items-center gap-2 text-xs text-[#F4E0FA] hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Course Catalog
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="purple">{course.badge}</Badge>
            <Badge variant="gold">{course.duration}</Badge>
            <span className="text-xs text-[#C6BDD3]">
              {course.modules.length} Modules · {totalLessons} Video Lessons
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            {course.title}
          </h1>
          <p className="text-lg text-[#F4E0FA] max-w-2xl mb-6">
            {course.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-white/90">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#F4E0FA]" />
              <span><strong>Lead Instructor:</strong> {course.tutor} ({course.tutorRole})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F4E0FA]" />
              <span><strong>Schedule:</strong> {course.schedule}</span>
            </div>
          </div>

          {/* Hero Action CTAs */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
            {enrolled ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/learn/${course.slug}/${firstLessonId}`}>
                  <Button variant="purple" size="lg" className="shadow-xl text-sm font-black gap-2">
                    <PlayCircle className="w-5 h-5 text-emerald-400" />
                    <span>Continue Learning ({progress.percent}%)</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                {courseQuiz && (
                  <Link href={`/learn/${course.slug}/quiz/${courseQuiz.id}`}>
                    <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm font-bold">
                      <Award className="w-4 h-4 mr-1.5 text-amber-400" /> Take Assessment
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/subscriptions?course=${course.id}`}>
                  <Button variant="purple" size="lg" className="shadow-xl text-sm font-black gap-2 bg-[#AE54C6] hover:bg-[#9E3FB6]">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Enroll Now &bull; ₦{course.priceFull.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>

                <Link href={`/subscriptions?course=${course.id}&plan=installment`}>
                  <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm font-bold">
                    <span>Pay in Parts &bull; ₦{course.deposit.toLocaleString()} deposit</span>
                  </Button>
                </Link>

                {firstFreeLesson && (
                  <Link href={`/learn/${course.slug}/${firstFreeLesson.id}`}>
                    <Button variant="secondary" size="lg" className="bg-white text-[#303654] hover:bg-[#FAF8FF] text-sm font-bold gap-1.5">
                      <PlayCircle className="w-4 h-4 text-[#AE54C6]" />
                      <span>Free Preview Lesson</span>
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-24 lg:pb-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-[#303654] mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#AE54C6]" />
                <span>Course Curriculum & Video Lessons</span>
              </h2>
              <p className="text-sm text-[#645F80]">
                Structured step-by-step learning modules. Complete all lessons and the final project to unlock your BEMS Verified Certificate.
              </p>
            </div>

            {course.modules.length === 0 ? (
              <div className="bg-white border border-[#F1E2F5] rounded-2xl p-8 text-center">
                <BookOpen className="w-8 h-8 text-[#C6BDD3] mx-auto mb-3" />
                <h3 className="font-bold text-[#303654] mb-1">Curriculum Coming Soon</h3>
                <p className="text-sm text-[#645F80]">
                  Modules and video lessons for this track haven&apos;t been published yet. Check back soon.
                </p>
              </div>
            ) : (
            <div className="space-y-6">
              {course.modules.map((mod) => (
                <div 
                  key={mod.id} 
                  className="bg-white border border-[#F1E2F5] rounded-2xl overflow-hidden shadow-xs"
                >
                  <div className="bg-[#FAF8FF] px-6 py-4 border-b border-[#F1E2F5] flex items-center justify-between">
                    <h3 className="font-bold text-[#303654] text-base">
                      {mod.title}
                    </h3>
                    <span className="text-xs font-semibold text-[#AE54C6]">
                      {mod.lessons.length} Lessons
                    </span>
                  </div>

                  <div className="divide-y divide-[#F1E2F5]">
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
                              <PlayCircle className="w-5 h-5 text-[#AE54C6] shrink-0 mt-0.5" />
                            ) : (
                              <Lock className="w-5 h-5 text-[#C6BDD3] shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-[#303654]">
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
                                <Button size="sm" variant={completed ? "outline" : "primary"} className="text-xs font-bold">
                                  {completed ? "Review" : "Watch"}
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/learn/${course.slug}/${lesson.id}`}>
                                <Button size="sm" variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-50 gap-1 text-xs font-bold">
                                  <Lock className="w-3 h-3 text-amber-600" /> Unlock
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            )}

            {course.modules.length > 0 && (
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
            )}

            {/* Reviews Section — Verified Student Feedback */}
            <div className="bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs w-full" data-tour="reviews">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#F7EDF9]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1.5 rounded-lg bg-[#FAF8FF] border border-[#F1E2F5] text-[#AE54C6]">
                      <GraduationCap className="w-5 h-5" />
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#303654]">Student Reviews</h3>
                  </div>
                  <p className="text-xs text-[#645F80]">
                    Verified feedback from students who completed this curriculum and earned their credentials.
                  </p>
                </div>

                {reviews.length > 0 ? (
                  <div className="flex items-center gap-3 bg-[#FAF8FF] px-4 py-2 rounded-2xl border border-[#F1E2F5] shrink-0 self-start sm:self-auto">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-4 h-4 ${
                            n <= Math.round(reviewAverage) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-[#303654]">{reviewAverage.toFixed(1)}</span>
                      <span className="text-xs text-[#645F80] font-medium">
                        ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-[#AE54C6] border border-[#F1E2F5] shrink-0 self-start sm:self-auto">
                    Verified Reviews Only 🎓
                  </span>
                )}
              </div>

              {/* Graduate Review Submission Form */}
              {getCertificate(course.id) && (
                <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FAF8FF] to-[#F5EDF9] border-2 border-[#E5C8ED] shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">🎉</span>
                    <p className="text-sm font-black text-[#303654]">
                      You earned this certificate — leave a review for future students!
                    </p>
                  </div>
                  <p className="text-xs text-[#645F80] mb-4">
                    Rate your learning experience and share what you built or enjoyed most.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setMyRatingDraft(n)}
                          className="p-1 hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                          title={`${n} Stars`}
                        >
                          <Star
                            className={`w-6 h-6 sm:w-7 sm:h-7 ${
                              n <= myRatingDraft ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#AE54C6]">
                      {myRatingDraft === 5 && "🌟 Outstanding — Loved it!"}
                      {myRatingDraft === 4 && "👍 Great Course & Tutor!"}
                      {myRatingDraft === 3 && "🙂 Good Learning Experience"}
                      {myRatingDraft === 2 && "😐 Needs Improvement"}
                      {myRatingDraft === 1 && "⚠️ Disappointed"}
                      {myRatingDraft === 0 && "Select your star rating"}
                    </span>
                  </div>

                  <textarea
                    value={myCommentDraft}
                    onChange={(e) => setMyCommentDraft(e.target.value)}
                    rows={3}
                    placeholder="What did you build? What was your favorite lesson? Any tips for future students?"
                    className="w-full px-4 py-3 rounded-xl border border-[#F1E2F5] bg-white text-sm text-[#303654] placeholder:text-[#8580A3] mb-3 focus:outline-none focus:border-[#AE54C6] focus:ring-2 focus:ring-[#AE54C6]/20 transition-all resize-none"
                  />

                  {reviewMsg && (
                    <div className="p-3 mb-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-[#AE54C6] font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>{reviewMsg}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || myRatingDraft < 1}
                    variant="purple"
                    size="sm"
                    className="font-bold shadow-xs px-5 text-xs"
                  >
                    {submittingReview ? "Submitting Review…" : "Submit Graduate Review"}
                  </Button>
                </div>
              )}

              {/* Reviews Display / Modern Empty State */}
              {reviews.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5]">
                  <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-white border border-[#E5C8ED] flex items-center justify-center text-[#AE54C6] shadow-xs">
                    <Star className="w-7 h-7 fill-amber-400/30 text-amber-500" />
                  </div>
                  <h4 className="text-base font-black text-[#303654] mb-1.5">
                    No Reviews Yet — Be the First Graduate!
                  </h4>
                  <p className="text-xs sm:text-sm text-[#645F80] max-w-md mx-auto leading-relaxed mb-4">
                    Reviews on BEMS are reserved exclusively for students who complete all video lessons and submit their verified capstone project.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F1E2F5] text-[11px] font-bold text-[#AE54C6] shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Complete all lessons & earn your certificate to review</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] transition-all hover:border-[#E5C8ED]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#AE54C6] to-[#303654] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-[#303654]">{r.name}</span>
                              <Badge variant="green" className="text-[10px] py-0.5 px-2 font-bold">
                                Verified Graduate 🎓
                              </Badge>
                            </div>
                            {r.createdAt && (
                              <span className="text-[10px] text-[#8580A3]">
                                {new Date(r.createdAt).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-[#F1E2F5] self-start sm:self-auto">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`w-3.5 h-3.5 ${
                                n <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {r.comment && (
                        <p className="text-xs sm:text-sm text-[#4A4568] leading-relaxed pl-0 sm:pl-12">
                          &ldquo;{r.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white border border-[#F1E2F5] rounded-3xl p-6 sm:p-8 shadow-lg">
              
              {enrolled ? (
                <div>
                  <Badge variant="green" className="mb-3">
                    ACTIVE ENROLLMENT
                  </Badge>
                  <h3 className="text-xl font-black text-[#303654] mb-2">
                    Your Course Progress
                  </h3>
                  <p className="text-xs text-[#645F80] mb-4">
                    {progress.completed} of {progress.total} lessons completed ({progress.percent}%)
                  </p>

                  <div className="w-full h-3 bg-[#FBF6FC] rounded-full overflow-hidden mb-6">
                    <div 
                      className="h-full bg-gradient-to-r from-[#AE54C6] to-[#10B981] transition-all duration-500"
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
                    {courseQuiz ? (
                      <Link href={`/learn/${course.slug}/quiz/${courseQuiz.id}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Take Quiz
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                        Quiz Coming Soon
                      </Button>
                    )}
                    {courseAssignment ? (
                      <Link href={`/learn/${course.slug}/assignment/${courseAssignment.id}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Capstone
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                        Capstone Coming Soon
                      </Button>
                    )}
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
                  <span className="text-xs font-bold text-[#AE54C6] uppercase tracking-wider block mb-1">
                    Full Course Access
                  </span>
                  <div className="mb-1">
                    <span className="text-3xl font-black text-[#303654]">
                      ₦{course.priceFull.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#645F80] mb-4">Paid in full, one time</p>

                  <div className="bg-[#FAF8FF] border border-[#F1E2F5] rounded-xl p-3.5 mb-6 text-xs text-[#303654] space-y-1.5">
                    <div><strong>Pay in Parts Option:</strong> ₦{course.priceParts.toLocaleString()} total</div>
                    <div className="text-[#AE54C6] font-semibold">
                      Start today with ₦{course.deposit.toLocaleString()} deposit
                    </div>
                  </div>

                  {/* Free instant enrollment bypasses payment entirely, so it's
                      restricted to staff for demoing/QA — a real visitor only
                      ever sees the paid checkout path below. */}
                  {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
                    <Button onClick={handleEnroll} variant="outline" size="md" className="w-full gap-2 mb-3">
                      <Sparkles className="w-4 h-4" />
                      <span>Instant Demo Enroll (Staff Only)</span>
                    </Button>
                  )}

                  <div className="space-y-2">
                    <Link href={`/subscriptions?course=${course.id}`} className="block w-full" data-tour="checkout-link">
                      <Button size="lg" variant="purple" className="w-full text-xs font-black shadow-lg gap-2 bg-[#AE54C6] hover:bg-[#9E3FB6]">
                        <Sparkles className="w-4 h-4 text-emerald-300" />
                        <span>Enroll in Course &bull; ₦{course.priceFull.toLocaleString()}</span>
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>

                    <Link href={`/subscriptions?course=${course.id}&plan=installment`} className="block w-full">
                      <Button size="md" variant="outline" className="w-full text-xs font-bold border-[#AE54C6]/30 text-[#303654] hover:bg-[#FAF8FF]">
                        <span>Pay in Installments &bull; ₦{course.deposit.toLocaleString()} Deposit</span>
                      </Button>
                    </Link>

                    {firstFreeLesson && (
                      <Link href={`/learn/${course.slug}/${firstFreeLesson.id}`} className="block w-full">
                        <Button size="sm" variant="secondary" className="w-full text-xs font-bold gap-1.5 text-[#303654]">
                          <PlayCircle className="w-4 h-4 text-[#AE54C6]" />
                          <span>Watch Free Preview Lesson</span>
                        </Button>
                      </Link>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={openInterestModal}
                    data-tour="register-interest"
                    className="w-full mt-3 py-2 text-xs font-bold text-[#AE54C6] hover:text-[#8f3ba3] cursor-pointer text-center block"
                  >
                    Not ready to pay yet? Register your interest &rarr;
                  </button>

                  <ul className="mt-6 pt-6 border-t border-[#F1E2F5] space-y-2.5 text-xs text-[#645F80]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>
                        {totalLessons > 0 ? `All ${totalLessons} HD Video Lessons & Notes` : "HD Video Lessons & Notes (publishing soon)"}
                      </span>
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

      {/* Sticky Mobile Enrollment / Resume Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-200/90 p-3 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        {enrolled ? (
          <>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-emerald-700 block truncate">
                Enrolled · {progress.percent}% Completed
              </span>
              <span className="text-xs font-black text-[#303654] truncate block">
                {course.title}
              </span>
            </div>
            <Link href={`/learn/${course.slug}/${firstLessonId}`} className="shrink-0">
              <Button size="sm" variant="purple" className="text-xs font-bold px-4 py-2">
                Continue Learning
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-[#303654]">
                  ₦{course.priceFull.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#8580A3] font-bold">one-time</span>
              </div>
              <span className="text-[10px] text-[#AE54C6] font-semibold block">
                or ₦{course.deposit.toLocaleString()} deposit
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openInterestModal}
                className="text-[11px] font-bold text-[#AE54C6] hover:underline px-2 py-1"
              >
                Inquire
              </button>
              <Link href={`/subscriptions?course=${course.id}`}>
                <Button size="sm" variant="purple" className="text-xs font-bold px-4 py-2 shadow-xs">
                  Enroll Now
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      {showInterestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-[#F1E2F5] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F7EDF9]">
              <h3 className="text-base font-black text-[#303654]">Register Your Interest</h3>
              <button
                onClick={() => setShowInterestModal(false)}
                className="text-[#8580A3] hover:text-[#303654] text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {interestSubmitted ? (
              <div className="space-y-4 text-center py-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm text-[#303654] font-bold">
                  Thanks, {interestName.split(" ")[0]}! We&apos;ve got your interest in {course.title}.
                </p>
                <p className="text-xs text-[#645F80]">
                  {interestWhatsappSent
                    ? `We've just sent you a WhatsApp message at ${interestPhone} — check your chats!`
                    : `We'll reach out to ${interestPhone} soon. You can also message us directly right now:`}
                </p>
                <a href={interestWhatsAppUrl} target="_blank" rel="noreferrer" className="block w-full">
                  <Button variant="whatsapp" className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Us on WhatsApp</span>
                  </Button>
                </a>
              </div>
            ) : (
              <div className="space-y-3.5">
                <p className="text-xs text-[#645F80]">
                  Just leave your name and phone — no payment, no commitment. BEMS Admissions will reach out about{" "}
                  <strong>{course.title}</strong>.
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={interestName}
                    onChange={(e) => setInterestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#F1E2F5] text-sm focus:outline-none focus:border-[#AE54C6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={interestPhone}
                    onChange={(e) => setInterestPhone(e.target.value)}
                    placeholder="e.g. 0801 234 5678"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#F1E2F5] text-sm focus:outline-none focus:border-[#AE54C6]"
                  />
                </div>

                {interestError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{interestError}</span>
                  </div>
                )}

                <Button
                  onClick={handleSubmitInterest}
                  disabled={submittingInterest}
                  variant="purple"
                  className="w-full mt-1"
                >
                  {submittingInterest ? "Submitting…" : "Register Interest"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

