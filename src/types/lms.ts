export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  duration: string;
  videoUrl: string;
  description: string;
  isFreePreview?: boolean;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface LMSCourse {
  id: string;
  slug: string;
  title: string;
  badge: string;
  tutor: string;
  tutorRole: string;
  tutorAvatar?: string;
  schedule: string;
  duration: string;
  delivery: string;
  tagline: string;
  priceFull: number;
  priceParts: number;
  deposit: number;
  finalProject: string;
  modules: Module[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  enrolledAt: string;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
}

// -------------------------------------------------------------
// PHASE 2 — ASSESSMENT TYPES
// -------------------------------------------------------------

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOption: number; // 0-indexed
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  passingScore: number; // e.g. 70
  questions: QuizQuestion[];
}

export interface QuizResult {
  quizId: string;
  userId: string;
  score: number; // percentage
  passed: boolean;
  selectedAnswers: Record<string, number>;
  attemptedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  brief: string;
  requirements: string[];
  rubric: {
    criteria: string;
    points: number;
  }[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  courseId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  githubUrl: string;
  liveDemoUrl: string;
  notes: string;
  status: 'SUBMITTED' | 'GRADED' | 'RESUBMISSION_REQUESTED';
  score?: number; // 0 - 100
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  submittedAt: string;
}

export interface Certificate {
  id: string;
  certNumber: string; // e.g. BEMS-CERT-2026-WD-8819
  userId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  gradeTitle: string; // "Distinction" | "Credit" | "Pass"
  finalScore: number;
  issuedAt: string;
  qrVerifyUrl: string;
}

// -------------------------------------------------------------
// PHASE 3 — INSTRUCTOR & ADMIN MANAGEMENT TYPES
// -------------------------------------------------------------

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseId: string;
  courseTitle: string;
  cohort: string;
  deliveryMode: "Physical Lab (Umuahia)" | "Virtual Live Zoom";
  paymentPlan: "FULL" | "INSTALLMENT";
  amountPaid: number;
  totalDue: number;
  paymentStatus: "PAID_FULL" | "PARTIAL" | "PENDING";
  // For a bank transfer awaiting confirmation, the reference/narration the
  // student entered at checkout — what staff match against the bank
  // statement before confirming. Null for Paystack (which verifies itself)
  // or before any reference has been recorded.
  paymentReference?: string | null;
  progressPercent: number;
  quizScore?: number;
  capstoneStatus: "NOT_STARTED" | "SUBMITTED" | "GRADED";
  certificateIssued: boolean;
  qrSource: string;
  enrolledAt: string;
}

export interface AdminCourse {
  id: string;
  slug: string;
  title: string;
  badge: string;
  tutor: string;
  tutorRole: string;
  priceFull: number;
  priceParts: number;
  deposit: number;
  delivery: string;
  schedule: string;
  enrolledCount: number;
  status: "ACTIVE" | "UPCOMING" | "ARCHIVED";
  modulesCount: number;
}

export interface AnalyticsSummary {
  totalStudents: number;
  targetStudents: number;
  totalRevenue: number;
  targetRevenue: number;
  completionRate: number;
  certificatesIssued: number;
  trackDistribution: {
    track: string;
    count: number;
    revenue: number;
    color: string;
  }[];
  deliveryDistribution: {
    mode: string;
    count: number;
    percentage: number;
  }[];
  bannerChannelYield: {
    source: string;
    location: string;
    scans: number;
    registrations: number;
    revenue: number;
    conversionRate: number;
  }[];
}

