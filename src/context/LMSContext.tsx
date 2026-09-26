"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  User,
  QuizResult,
  Submission,
  Certificate,
  LMSCourse,
  Quiz,
  Assignment,
  AdminStudent,
  AdminCourse,
  AnalyticsSummary
} from "@/types/lms";
import type { LearningProfileSummary } from "@/lib/learning-engine";

const EMPTY_LEARNING_PROFILE: LearningProfileSummary = {
  strengths: [],
  weaknesses: [],
  recommendations: [],
  learningStreak: 0
};

const EMPTY_ANALYTICS: AnalyticsSummary = {
  totalStudents: 0,
  targetStudents: 0,
  totalRevenue: 0,
  targetRevenue: 0,
  completionRate: 0,
  certificatesIssued: 0,
  trackDistribution: [],
  deliveryDistribution: [],
  bannerChannelYield: []
};

export interface EnrollOptions {
  source?: string;
  deliveryMode?: "PHYSICAL_LAB" | "VIRTUAL_ZOOM";
  paymentPlan?: "full" | "installment";
  paymentMethod?: "paystack" | "bank";
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: User;
}

interface LMSContextType {
  user: User | null;
  isHydrated: boolean;
  isAdminDataLoaded: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (
    name: string,
    email: string,
    password: string,
    role?: "STUDENT" | "INSTRUCTOR"
  ) => Promise<AuthResult>;
  setVerifiedUser: (user: User) => void;
  logout: () => void;
  // Course catalog — DB-backed, public
  courses: LMSCourse[];
  quizzes: Quiz[];
  assignments: Assignment[];
  getCourse: (courseId: string) => LMSCourse | undefined;
  getQuizForCourse: (courseId: string) => Quiz | undefined;
  getAssignmentForCourse: (courseId: string) => Assignment | undefined;
  // Enrollment & progress — DB-backed, per user
  enrolledCourseIds: string[];
  enrollInCourse: (courseId: string, options?: EnrollOptions) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
  completedLessonIds: string[];
  toggleLessonComplete: (lessonId: string) => Promise<void>;
  isLessonCompleted: (lessonId: string) => boolean;
  getCourseProgress: (courseId: string) => {
    completed: number;
    total: number;
    percent: number;
  };
  // Assessment — DB-backed
  quizResults: Record<string, QuizResult>;
  submitQuiz: (quizId: string, answers: Record<string, number>) => Promise<QuizResult>;
  getQuizResult: (quizId: string) => QuizResult | undefined;
  submissions: Submission[];
  submitAssignment: (
    assignmentId: string,
    githubUrl: string,
    liveDemoUrl: string,
    notes: string
  ) => Promise<Submission>;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => Promise<void>;
  certificates: Certificate[];
  getCertificate: (courseId: string) => Certificate | undefined;
  isCertificateEligible: (courseId: string) => boolean;
  // The core personalization loop — strengths/weaknesses/recommendations
  // computed server-side from real learning events, not client-derived.
  learningProfile: LearningProfileSummary;
  refreshLearningProfile: () => Promise<void>;
  // Admin roster/analytics — DB-backed, staff only
  adminStudents: AdminStudent[];
  adminCourses: AdminCourse[];
  analytics: AnalyticsSummary;
  addCourse: (course: {
    title: string;
    slug: string;
    tutor: string;
    tutorRole: string;
    badge?: string;
    schedule?: string;
    delivery?: string;
    priceFull: number;
    priceParts: number;
    deposit: number;
  }) => Promise<void>;
  updateCourseStatus: (courseId: string, status: "ACTIVE" | "UPCOMING" | "ARCHIVED") => Promise<void>;
  updateStudentPayment: (
    enrollmentId: string,
    status: "PAID_FULL" | "PARTIAL",
    amountPaid: number
  ) => Promise<void>;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export function LMSProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAdminDataLoaded, setIsAdminDataLoaded] = useState(false);

  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({});
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [learningProfile, setLearningProfile] = useState<LearningProfileSummary>(EMPTY_LEARNING_PROFILE);

  const refreshLearningProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/learning/profile");
      if (res.ok) setLearningProfile(await res.json());
    } catch {
      // leave whatever was already loaded
    }
  }, []);

  // Admin roster/analytics — fetched from the DB only for staff sessions.
  const [adminStudents, setAdminStudents] = useState<AdminStudent[]>([]);
  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(EMPTY_ANALYTICS);

  const loadAdminData = useCallback(async () => {
    try {
      const [rosterRes, coursesRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/roster"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/analytics")
      ]);
      if (rosterRes.ok) setAdminStudents((await rosterRes.json()).roster || []);
      if (coursesRes.ok) setAdminCourses((await coursesRes.json()).courses || []);
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch {
      // admin data unavailable — non-staff users never call this anyway
    } finally {
      setIsAdminDataLoaded(true);
    }
  }, []);

  const addCourse: LMSContextType["addCourse"] = async (course) => {
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(course)
    });
    if (res.ok) {
      const data = await res.json();
      setAdminCourses((prev) => [data.course, ...prev]);
    }
  };

  const updateCourseStatus = async (courseId: string, status: "ACTIVE" | "UPCOMING" | "ARCHIVED") => {
    const res = await fetch(`/api/admin/courses/${courseId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const data = await res.json();
      setAdminCourses((prev) => prev.map((c) => (c.id === courseId ? data.course : c)));
    }
  };

  const updateStudentPayment = async (
    enrollmentId: string,
    status: "PAID_FULL" | "PARTIAL",
    amountPaid: number
  ) => {
    const res = await fetch(`/api/admin/enrollments/${enrollmentId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, amountPaid })
    });
    if (res.ok) {
      setAdminStudents((prev) =>
        prev.map((s) => (s.id === enrollmentId ? { ...s, paymentStatus: status, amountPaid } : s))
      );
    }
  };

  // Fetches the signed-in user's own enrollment/progress/quiz/submission
  // records (plus the admin roster/courses/analytics for staff). Called on
  // initial mount and again right after login/signup — the LMSProvider
  // stays mounted across a client-side navigation, so without this a
  // freshly-logged-in user would keep seeing empty state until a full page
  // reload.
  const loadOwnLmsData = useCallback(
    async (role: User["role"]) => {
      try {
        const lmsMeRes = await fetch("/api/lms/me");
        if (lmsMeRes.ok) {
          const lmsMe = await lmsMeRes.json();
          setEnrolledCourseIds(lmsMe.enrolledCourseIds || []);
          setCompletedLessonIds(lmsMe.completedLessonIds || []);
          setQuizResults(lmsMe.quizResults || {});
          setSubmissions(lmsMe.submissions || []);
        }
      } catch {
        // per-user data unavailable — catalog still loaded fine
      }
      await refreshLearningProfile();
      if (role === "INSTRUCTOR" || role === "ADMIN") {
        await loadAdminData();
      }
    },
    [loadAdminData, refreshLearningProfile]
  );

  // Load the public catalog (courses/quizzes/assignments/certificates),
  // then the real server session, then — if signed in — that user's own
  // enrollment/progress/quiz/submission records. Nothing here is trusted
  // from localStorage; it's only used to avoid a blank flash of the user's
  // name while the real fetches resolve.
  useEffect(() => {
    let cancelled = false;

    try {
      const cachedUser = localStorage.getItem("bems_lms_user");
      if (cachedUser) setUser(JSON.parse(cachedUser));
    } catch {
      // ignore malformed cache
    }

    async function bootstrap() {
      try {
        const catalogRes = await fetch("/api/lms/catalog");
        const catalog = await catalogRes.json();
        if (cancelled) return;
        setCourses(catalog.courses || []);
        setQuizzes(catalog.quizzes || []);
        setAssignments(catalog.assignments || []);
        setCertificates(catalog.certificates || []);
      } catch {
        // catalog unavailable — leave state empty rather than crash
      }

      let sessionUser: User | null = null;
      try {
        const meRes = await fetch("/api/auth/me");
        const meData: { user: User | null } = await meRes.json();
        sessionUser = meData.user;
      } catch {
        // no server session reachable
      }

      if (cancelled) return;

      if (sessionUser) {
        setUser(sessionUser);
        localStorage.setItem("bems_lms_user", JSON.stringify(sessionUser));
        await loadOwnLmsData(sessionUser.role);
      } else {
        // No verified session — never trust a cached elevated role.
        setUser((prev) => {
          if (prev && (prev.role === "INSTRUCTOR" || prev.role === "ADMIN")) {
            localStorage.removeItem("bems_lms_user");
            return null;
          }
          return prev;
        });
      }

      if (!cancelled) setIsHydrated(true);
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("bems_lms_user", JSON.stringify(data.user));
        await loadOwnLmsData(data.user.role);
        return { ok: true, user: data.user };
      }
      return { ok: false, error: data.error || "Sign in failed." };
    } catch {
      return { ok: false, error: "Could not reach the server. Please try again." };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "STUDENT" | "INSTRUCTOR" = "STUDENT"
  ): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("bems_lms_user", JSON.stringify(data.user));
        await loadOwnLmsData(data.user.role);
        return { ok: true, user: data.user };
      }
      return { ok: false, error: data.error || "Could not create account." };
    } catch {
      return { ok: false, error: "Could not reach the server. Please try again." };
    }
  };

  const setVerifiedUser = (verified: User) => {
    setUser(verified);
    localStorage.setItem("bems_lms_user", JSON.stringify(verified));
    loadOwnLmsData(verified.role);
  };

  const logout = () => {
    setUser(null);
    setEnrolledCourseIds([]);
    setCompletedLessonIds([]);
    setQuizResults({});
    setSubmissions([]);
    setAdminStudents([]);
    setAdminCourses([]);
    setAnalytics(EMPTY_ANALYTICS);
    setIsAdminDataLoaded(false);
    setLearningProfile(EMPTY_LEARNING_PROFILE);
    localStorage.removeItem("bems_lms_user");
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  };

  const getCourse = useCallback((courseId: string) => courses.find((c) => c.id === courseId), [courses]);
  const getQuizForCourse = useCallback(
    (courseId: string) => quizzes.find((q) => q.courseId === courseId),
    [quizzes]
  );
  const getAssignmentForCourse = useCallback(
    (courseId: string) => assignments.find((a) => a.courseId === courseId),
    [assignments]
  );

  const enrollInCourse = async (courseId: string, options?: EnrollOptions) => {
    try {
      const res = await fetch("/api/lms/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, ...options })
      });
      if (res.ok) {
        const data = await res.json();
        setEnrolledCourseIds(data.enrolledCourseIds || []);
      }
    } catch {
      // leave state as-is on network failure
    }
  };

  const isEnrolled = (courseId: string) => enrolledCourseIds.includes(courseId);

  const toggleLessonComplete = async (lessonId: string) => {
    try {
      const res = await fetch("/api/lms/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId })
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedLessonIds(data.completedLessonIds || []);
        refreshLearningProfile();
      }
    } catch {
      // leave state as-is on network failure
    }
  };

  const isLessonCompleted = (lessonId: string) => completedLessonIds.includes(lessonId);

  const getCourseProgress = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return { completed: 0, total: 0, percent: 0 };

    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const total = allLessonIds.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };

    const completed = allLessonIds.filter((id) => completedLessonIds.includes(id)).length;
    const percent = Math.round((completed / total) * 100);

    return { completed, total, percent };
  };

  const submitQuiz = async (quizId: string, answers: Record<string, number>): Promise<QuizResult> => {
    const res = await fetch("/api/lms/quiz-attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, answers })
    });
    const data = await res.json();
    if (!res.ok || !data.result) {
      throw new Error(data.error || "Could not submit quiz.");
    }
    setQuizResults((prev) => ({ ...prev, [quizId]: data.result }));
    refreshLearningProfile();
    return data.result;
  };

  const getQuizResult = (quizId: string) => quizResults[quizId];

  const submitAssignment = async (
    assignmentId: string,
    githubUrl: string,
    liveDemoUrl: string,
    notes: string
  ): Promise<Submission> => {
    const res = await fetch("/api/lms/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, githubUrl, liveDemoUrl, notes })
    });
    const data = await res.json();
    if (!res.ok || !data.submission) {
      throw new Error(data.error || "Could not submit assignment.");
    }
    setSubmissions((prev) => [
      data.submission,
      ...prev.filter((s) => s.id !== data.submission.id)
    ]);
    return data.submission;
  };

  const gradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    const res = await fetch(`/api/lms/submissions/${submissionId}/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, feedback })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Could not grade submission.");
    }
    setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? data.submission : s)));
    if (data.certificate) {
      setCertificates((prev) => [
        data.certificate,
        ...prev.filter((c) => c.id !== data.certificate.id)
      ]);
    }
  };

  const isCertificateEligible = (courseId: string) => {
    const progress = getCourseProgress(courseId);
    const allDone = progress.percent === 100;

    const quiz = getQuizForCourse(courseId);
    const quizPassed = quiz ? quizResults[quiz.id]?.passed : true;

    const sub = submissions.find(
      (s) => s.courseId === courseId && s.status === "GRADED" && (s.score || 0) >= 70
    );

    return allDone && (quizPassed ?? false) && !!sub;
  };

  const getCertificate = (courseId: string) =>
    certificates.find((c) => c.courseId === courseId && c.userId === user?.id);

  return (
    <LMSContext.Provider
      value={{
        user,
        isHydrated,
        isAdminDataLoaded,
        login,
        signup,
        setVerifiedUser,
        logout,
        courses,
        quizzes,
        assignments,
        getCourse,
        getQuizForCourse,
        getAssignmentForCourse,
        enrolledCourseIds,
        enrollInCourse,
        isEnrolled,
        completedLessonIds,
        toggleLessonComplete,
        isLessonCompleted,
        getCourseProgress,
        quizResults,
        submitQuiz,
        getQuizResult,
        submissions,
        submitAssignment,
        gradeSubmission,
        certificates,
        getCertificate,
        isCertificateEligible,
        learningProfile,
        refreshLearningProfile,
        adminStudents,
        adminCourses,
        analytics,
        addCourse,
        updateCourseStatus,
        updateStudentPayment
      }}
    >
      {children}
    </LMSContext.Provider>
  );
}

export function useLMS() {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error("useLMS must be used within an LMSProvider");
  }
  return context;
}
