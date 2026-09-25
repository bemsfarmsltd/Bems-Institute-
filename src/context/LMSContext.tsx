"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, QuizResult, Submission, Certificate, AdminStudent, AdminCourse, AnalyticsSummary } from "@/types/lms";
import { LMS_COURSES } from "@/data/lms-data";
import { LMS_QUIZZES } from "@/data/assessment-data";
import { INITIAL_ADMIN_STUDENTS, INITIAL_ADMIN_COURSES, INITIAL_ANALYTICS } from "@/data/admin-data";

interface LMSContextType {
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  enrolledCourseIds: string[];
  enrollInCourse: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  completedLessonIds: string[];
  toggleLessonComplete: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  getCourseProgress: (courseId: string) => {
    completed: number;
    total: number;
    percent: number;
  };
  // Phase 2 Assessment State & Methods
  quizResults: Record<string, QuizResult>;
  submitQuiz: (quizId: string, answers: Record<string, number>) => QuizResult;
  getQuizResult: (quizId: string) => QuizResult | undefined;
  submissions: Submission[];
  submitAssignment: (
    assignmentId: string,
    courseId: string,
    githubUrl: string,
    liveDemoUrl: string,
    notes: string
  ) => Submission;
  gradeSubmission: (
    submissionId: string,
    score: number,
    feedback: string,
    gradedBy: string
  ) => void;
  certificates: Certificate[];
  getCertificate: (courseId: string) => Certificate | undefined;
  generateCertificate: (courseId: string, score?: number) => Certificate;
  isCertificateEligible: (courseId: string) => boolean;
  // Phase 3 Instructor & Admin
  adminStudents: AdminStudent[];
  adminCourses: AdminCourse[];
  analytics: AnalyticsSummary;
  addCourse: (course: AdminCourse) => void;
  updateCourseStatus: (courseId: string, status: "ACTIVE" | "UPCOMING" | "ARCHIVED") => void;
  updateStudentPayment: (studentId: string, status: "PAID_FULL" | "PARTIAL", amountPaid: number) => void;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

const DEFAULT_USER: User = {
  id: "usr-bems-001",
  name: "Chinedu Okeke",
  email: "chinedu.okeke@mouau.edu.ng",
  role: "STUDENT"
};

// Seed initial sample submission for grading demo
const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: "sub-wd-001",
    assignmentId: "assign-web-dev",
    courseId: "web-dev",
    userId: "usr-bems-001",
    studentName: "Chinedu Okeke",
    studentEmail: "chinedu.okeke@mouau.edu.ng",
    githubUrl: "https://github.com/chinedu-dev/bems-portal-capstone",
    liveDemoUrl: "https://bems-futureskills.vercel.app",
    notes: "I built the full responsive portal with semantic HTML5, CSS Flexbox & CSS Grid, and connected dynamic REST APIs. Deployed live on Vercel.",
    status: "GRADED",
    score: 95,
    feedback: "Exceptional code structure and semantic markup, Chinedu! The mobile responsiveness is fluid and the color harmony matches the BEMS logo perfectly.",
    gradedBy: "Mr. Victor (Lead Web Dev Tutor)",
    gradedAt: "2026-09-24T18:30:00.000Z",
    submittedAt: "2026-09-24T12:00:00.000Z"
  }
];

export function LMSProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(["web-dev"]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([
    "les-1", "les-2", "les-3", "les-4", "les-5", "les-6", "les-7", "les-8", "les-9", "les-10", "les-11", "les-12"
  ]);

  // Phase 2 states
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({
    "quiz-web-dev": {
      quizId: "quiz-web-dev",
      userId: "usr-bems-001",
      score: 100,
      passed: true,
      selectedAnswers: { "q-wd-1": 2, "q-wd-2": 1, "q-wd-3": 2, "q-wd-4": 2, "q-wd-5": 0 },
      attemptedAt: "2026-09-24T15:00:00.000Z"
    }
  });
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "cert-001",
      certNumber: "BEMS-CERT-2026-WD-8819",
      userId: "usr-bems-001",
      studentName: "Chinedu Okeke",
      courseId: "web-dev",
      courseTitle: "Web Development",
      gradeTitle: "Distinction (95%)",
      finalScore: 95,
      issuedAt: "2026-09-24T18:35:00.000Z",
      qrVerifyUrl: "http://localhost:3001/verify/BEMS-CERT-2026-WD-8819"
    }
  ]);

  // Phase 3 Admin & Instructor State
  const [adminStudents, setAdminStudents] = useState<AdminStudent[]>(INITIAL_ADMIN_STUDENTS);
  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>(INITIAL_ADMIN_COURSES);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(INITIAL_ANALYTICS);

  const addCourse = (newCourse: AdminCourse) => {
    setAdminCourses((prev) => [newCourse, ...prev]);
  };

  const updateCourseStatus = (courseId: string, status: "ACTIVE" | "UPCOMING" | "ARCHIVED") => {
    setAdminCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status } : c))
    );
  };

  const updateStudentPayment = (studentId: string, status: "PAID_FULL" | "PARTIAL", amountPaid: number) => {
    setAdminStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, paymentStatus: status, amountPaid } : s))
    );
  };

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("bems_lms_user");
      const savedEnrolled = localStorage.getItem("bems_lms_enrolled");
      const savedCompleted = localStorage.getItem("bems_lms_completed");
      const savedQuizzes = localStorage.getItem("bems_lms_quizzes");
      const savedSubmissions = localStorage.getItem("bems_lms_submissions");
      const savedCertificates = localStorage.getItem("bems_lms_certificates");

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedEnrolled) setEnrolledCourseIds(JSON.parse(savedEnrolled));
      if (savedCompleted) setCompletedLessonIds(JSON.parse(savedCompleted));
      if (savedQuizzes) setQuizResults(JSON.parse(savedQuizzes));
      if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
      if (savedCertificates) setCertificates(JSON.parse(savedCertificates));
    } catch (e) {
      console.error("Failed to load LMS state:", e);
    }
  }, []);

  const login = (name: string, email: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: "STUDENT"
    };
    setUser(newUser);
    localStorage.setItem("bems_lms_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bems_lms_user");
  };

  const enrollInCourse = (courseId: string) => {
    if (!enrolledCourseIds.includes(courseId)) {
      const updated = [...enrolledCourseIds, courseId];
      setEnrolledCourseIds(updated);
      localStorage.setItem("bems_lms_enrolled", JSON.stringify(updated));
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourseIds.includes(courseId);
  };

  const toggleLessonComplete = (lessonId: string) => {
    let updated: string[];
    if (completedLessonIds.includes(lessonId)) {
      updated = completedLessonIds.filter((id) => id !== lessonId);
    } else {
      updated = [...completedLessonIds, lessonId];
    }
    setCompletedLessonIds(updated);
    localStorage.setItem("bems_lms_completed", JSON.stringify(updated));
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessonIds.includes(lessonId);
  };

  const getCourseProgress = (courseId: string) => {
    const course = LMS_COURSES.find((c) => c.id === courseId);
    if (!course) return { completed: 0, total: 0, percent: 0 };

    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const total = allLessonIds.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };

    const completed = allLessonIds.filter((id) => completedLessonIds.includes(id)).length;
    const percent = Math.round((completed / total) * 100);

    return { completed, total, percent };
  };

  // Phase 2: Quiz Submission & Scoring
  const submitQuiz = (quizId: string, answers: Record<string, number>) => {
    const quiz = LMS_QUIZZES.find((q) => q.id === quizId);
    if (!quiz) throw new Error("Quiz not found");

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const result: QuizResult = {
      quizId,
      userId: user?.id || "guest",
      score,
      passed,
      selectedAnswers: answers,
      attemptedAt: new Date().toISOString()
    };

    const updated = { ...quizResults, [quizId]: result };
    setQuizResults(updated);
    localStorage.setItem("bems_lms_quizzes", JSON.stringify(updated));
    return result;
  };

  const getQuizResult = (quizId: string) => {
    return quizResults[quizId];
  };

  // Phase 2: Assignment Submission
  const submitAssignment = (
    assignmentId: string,
    courseId: string,
    githubUrl: string,
    liveDemoUrl: string,
    notes: string
  ) => {
    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      courseId,
      userId: user?.id || "guest",
      studentName: user?.name || "Student",
      studentEmail: user?.email || "student@example.com",
      githubUrl,
      liveDemoUrl,
      notes,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString()
    };

    const filtered = submissions.filter(
      (s) => !(s.assignmentId === assignmentId && s.userId === newSub.userId)
    );
    const updated = [newSub, ...filtered];
    setSubmissions(updated);
    localStorage.setItem("bems_lms_submissions", JSON.stringify(updated));
    return newSub;
  };

  // Phase 2: Instructor Grading
  const gradeSubmission = (
    submissionId: string,
    score: number,
    feedback: string,
    gradedBy: string
  ) => {
    const updated = submissions.map((s) => {
      if (s.id === submissionId) {
        return {
          ...s,
          score,
          feedback,
          status: "GRADED" as const,
          gradedBy,
          gradedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setSubmissions(updated);
    localStorage.setItem("bems_lms_submissions", JSON.stringify(updated));

    // Automatically check certificate eligibility
    const target = updated.find((s) => s.id === submissionId);
    if (target && score >= 70) {
      generateCertificate(target.courseId, score);
    }
  };

  // Phase 2: Certificate Issuance & Verification
  const isCertificateEligible = (courseId: string) => {
    const progress = getCourseProgress(courseId);
    const allDone = progress.percent === 100;

    const quiz = LMS_QUIZZES.find((q) => q.courseId === courseId);
    const quizPassed = quiz ? quizResults[quiz.id]?.passed : true;

    const sub = submissions.find(
      (s) => s.courseId === courseId && s.status === "GRADED" && (s.score || 0) >= 70
    );

    return allDone && (quizPassed ?? false) && !!sub;
  };

  const generateCertificate = (courseId: string, score: number = 90) => {
    const existing = certificates.find((c) => c.courseId === courseId);
    if (existing) return existing;

    const course = LMS_COURSES.find((c) => c.id === courseId);
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const prefixMap: Record<string, string> = {
      "web-dev": "WD",
      "ai-automation": "AI",
      "product-design": "UX",
      "cybersecurity": "SEC"
    };
    const code = prefixMap[courseId] || "TECH";
    const certNumber = `BEMS-CERT-2026-${code}-${randomCode}`;

    let gradeTitle = "Pass";
    if (score >= 90) gradeTitle = "Distinction (90%+)";
    else if (score >= 75) gradeTitle = "Credit (75%+)";

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certNumber,
      userId: user?.id || "usr-001",
      studentName: user?.name || "Chinedu Okeke",
      courseId,
      courseTitle: course?.title || "Technology Program",
      gradeTitle,
      finalScore: score,
      issuedAt: new Date().toISOString(),
      qrVerifyUrl: `http://localhost:3001/verify/${certNumber}`
    };

    const updated = [newCert, ...certificates];
    setCertificates(updated);
    localStorage.setItem("bems_lms_certificates", JSON.stringify(updated));
    return newCert;
  };

  const getCertificate = (courseId: string) => {
    return certificates.find((c) => c.courseId === courseId);
  };

  return (
    <LMSContext.Provider
      value={{
        user,
        login,
        logout,
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
        generateCertificate,
        isCertificateEligible,
        // Phase 3 values
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
