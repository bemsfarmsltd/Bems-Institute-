export type UserRole =
  | "STUDENT"
  | "INSTRUCTOR"
  | "ADMIN"
  | "FINANCE"
  | "ADMISSIONS"
  | "MANAGEMENT";

export interface UserPortal {
  role: UserRole;
  label: string;
  path: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  permissions?: string[];
  portals?: UserPortal[];
  homePath?: string;
  avatarUrl?: string | null;
}

export interface AuditEvent {
  id: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  summary: string;
  createdAt: string;
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

export interface UserEnrollmentRecord {
  id: string;
  courseId: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'WITHDRAWN';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID_FULL' | 'REFUNDED';
  paymentPlan: 'full' | 'installment';
  amountPaid: number;
  totalDue: number;
  hasAccess: boolean;
  awaitingApproval: boolean;
  deliveryMode?: "PHYSICAL_LAB" | "VIRTUAL_ZOOM";
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
  // PRD §4.2 "small projects every 2-3 weeks" — a MILESTONE is graded
  // practice along the way; only a CAPSTONE issues a certificate. order
  // sorts a course's assignments in actual curriculum sequence.
  type: "MILESTONE" | "CAPSTONE";
  order: number;
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
  paymentStatus: "PAID_FULL" | "PARTIAL" | "PENDING" | "REFUNDED";
  // For a bank transfer awaiting confirmation, the reference/narration the
  // student entered at checkout — what staff match against the bank
  // statement before confirming. Null for Paystack (which verifies itself)
  // or before any reference has been recorded.
  paymentReference?: string | null;
  // PRD §4.2's one-time "second chance" rejoin needs a dropped-out
  // enrollment to actually exist as a state, and a way to check a
  // student hasn't already used their lifetime second chance.
  enrollmentStatus: "PENDING" | "ACTIVE" | "COMPLETED" | "DROPPED" | "WITHDRAWN";
  secondChanceUsed: boolean;
  progressPercent: number;
  quizScore?: number;
  capstoneStatus: "NOT_STARTED" | "SUBMITTED" | "GRADED";
  certificateIssued: boolean;
  certificateId?: string;
  certificateNumber?: string;
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
  // PRD §4.1 steps 1-2 ("See our advert" / "Visit the sign-up page").
  // estimatedAdViews is a manual staff estimate (ad impressions aren't
  // observable online); home/signupPageViews are real, deduped page-view
  // counts (see PageView model, POST /lms/track-pageview).
  estimatedAdViews: number;
  homePageViews: number;
  signupPageViews: number;
  // Corrected money/student figures (docs/admin-audit.md). Revenue comes
  // from the payment ledger: totalRevenue is payments minus refunds, with
  // second-chance waivers excluded and reported in waivedTotal.
  outstandingBalance: number;
  refundedTotal: number;
  waivedTotal: number;
  abandonedCheckouts: number;
  pendingBankTransfers: number;
  awaitingApproval: number;
  completedEnrollments: number;
  inProgressEnrollments: number;
  lessonsCompleted: number;
  revenueByMonth: { month: string; amount: number }[];
}

export type MySpaceGoalType = "JOB" | "FREELANCE" | "OWN_PRODUCT" | "UPSKILL" | "OTHER";
export type MySpaceExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

// Fields are null until the student answers them (partial saves are allowed).
export interface MySpaceProfile {
  goalType: MySpaceGoalType | null;
  goal: string | null;
  experienceLevel: MySpaceExperienceLevel | null;
  weeklyHours: number | null;
  motivation: string | null;
  weeklyRecapEmail?: boolean;
  shareWithTutor?: boolean;
  onboardedAt: string | null;
}

export interface MySpaceRoadmapModule {
  title: string;
  completed: number;
  total: number;
  status: "DONE" | "CURRENT" | "UPCOMING";
}

export interface MySpaceRoadmapProject {
  id: string;
  title: string;
  type: "MILESTONE" | "CAPSTONE";
  status: "NOT_SUBMITTED" | "SUBMITTED" | "GRADED" | "RESUBMISSION_REQUESTED";
  score: number | null;
  href: string | null;
}

export interface MySpaceRoadmap {
  modules: MySpaceRoadmapModule[];
  projects: MySpaceRoadmapProject[];
  certificate: {
    certNumber: string;
    gradeTitle: string;
    issuedAt: string;
    href: string;
  } | null;
}

export interface MySpaceCourse {
  enrollmentId: string;
  courseId: string;
  slug: string;
  title: string;
  color: string | null;
  tutor: string;
  tutorRole: string | null;
  deliveryMode: "PHYSICAL_LAB" | "VIRTUAL_ZOOM";
  hasAccess: boolean;
  cohort: {
    name: string;
    startDate: string;
    endDate: string;
    phase: "BEFORE_START" | "IN_PROGRESS" | "FINISHED";
    daysToStart: number;
    daysToEnd: number;
  } | null;
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
  nextLesson: {
    id: string;
    title: string;
    moduleTitle: string;
    href: string;
  } | null;
  nextLiveSession: {
    title: string;
    type: string;
    scheduledAt: string;
    meetingUrl: string | null;
  } | null;
  latestFeedback: {
    assignmentTitle: string;
    score: number | null;
    feedback: string | null;
    gradedBy: string | null;
    gradedAt: string | null;
  } | null;
  roadmap?: MySpaceRoadmap;
}

export interface MySpaceWeekDay {
  date: string;
  active: boolean;
  minutes: number;
  isToday: boolean;
  isFuture: boolean;
}

export type MySpaceAccentColor =
  | "purple"
  | "indigo"
  | "blue"
  | "teal"
  | "green"
  | "amber"
  | "rose";

export type MySpaceBanner =
  | "aurora"
  | "circuit"
  | "sunrise"
  | "midnight"
  | "lagoon"
  | "plain";

export interface MySpaceAppearance {
  accentColor: MySpaceAccentColor;
  accentHex: string;
  banner: MySpaceBanner;
}

export interface MySpaceBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
  isNew: boolean;
}

export interface MySpaceData {
  firstName: string;
  greeting: string;
  onboarded: boolean;
  profile: MySpaceProfile | null;
  appearance?: MySpaceAppearance;
  badges?: MySpaceBadge[];
  courses: MySpaceCourse[];
  week: {
    startsAt: string;
    lessonsCompleted: number;
    minutesStudied: number;
    goalMinutes: number | null;
    percentOfGoal: number | null;
    days?: MySpaceWeekDay[];
  };
  streak: number;
  streaks?: {
    days: number;
    studiedToday: boolean;
    weeksOnTarget: number;
  };
  communityUrl: string | null;
}

export interface PublicPortfolio {
  handle: string;
  headline: string | null;
  name: string;
  avatarUrl: string | null;
  tracks: Array<{
    title: string;
    slug: string;
    color: string | null;
    status: "IN_PROGRESS" | "COMPLETED";
  }>;
  badges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string | null;
  }>;
  projects: Array<{
    title: string;
    type: "MILESTONE" | "CAPSTONE";
    courseTitle: string;
    githubUrl: string | null;
    liveDemoUrl: string | null;
    score: number | null;
    gradedAt: string | null;
  }>;
  certificates: Array<{
    certNumber: string;
    courseTitle: string;
    gradeTitle: string;
    issuedAt: string;
    href: string;
  }>;
}

export interface PortfolioSettings {
  enabled: boolean;
  handle: string | null;
  headline: string | null;
  showScores: boolean;
  suggestedHandle: string;
  url: string | null;
  canEnable: boolean;
  preview: PublicPortfolio;
}

export interface StudyNoteItem {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  courseTitle: string;
  courseSlug: string;
  href: string | null;
  body: string;
  updatedAt: string;
}

export interface BookmarkItem {
  id: string;
  kind: "LESSON" | "LINK";
  title: string;
  url: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  courseTitle: string | null;
  href: string | null;
  createdAt: string;
}

export interface RemindersSettings {
  classes: boolean;
  goal: boolean;
  streak: boolean;
  whatsapp: boolean;
  push: {
    publicKey: string | null;
    devices: number;
  };
  whatsappAvailable: boolean;
  phoneOnFile: boolean;
}

export interface TutorCourseSummary {
  id: string;
  title: string;
  slug: string;
  color: string | null;
}

export interface TutorStudentFlag {
  kind: "NOT_STARTED" | "INACTIVE" | "BEHIND_GOAL" | "LOW_QUIZ" | "RESUBMIT" | "WEAK_TOPICS";
  label: string;
}

export interface TutorStudentRow {
  userId: string;
  name: string;
  avatarUrl: string | null;
  courseId: string;
  courseTitle: string;
  cohortName: string | null;
  deliveryMode: "PHYSICAL_LAB" | "VIRTUAL_ZOOM";
  status: string;
  goal: {
    goalType: MySpaceGoalType | null;
    goalLabel: string | null;
    goal: string | null;
    experienceLevel: MySpaceExperienceLevel | null;
    weeklyHours: number | null;
  } | null;
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
  currentLesson: {
    title: string;
    moduleTitle: string;
  } | null;
  lastActiveAt: string | null;
  streakDays: number;
  week: {
    minutesStudied: number;
    goalMinutes: number | null;
  };
  projects: {
    submitted: number;
    awaitingGrade: number;
    latestScore: number | null;
  };
  quiz: {
    attempts: number;
    latestScore: number | null;
  };
  flags: TutorStudentFlag[];
  needsAttention: boolean;
}

export interface TutorStudentDetail extends TutorStudentRow {
  contact: {
    email: string;
    phone: string | null;
  };
  modules: Array<{
    title: string;
    completed: number;
    total: number;
    status: "DONE" | "CURRENT" | "UPCOMING";
  }>;
  recentActivity: Array<{
    type: string;
    label: string;
    lessonTitle: string | null;
    at: string;
  }>;
  quizAttempts: Array<{
    quizTitle: string;
    score: number;
    passed: boolean;
    at: string;
  }>;
  submissions: Array<{
    id: string;
    title: string;
    type: "MILESTONE" | "CAPSTONE";
    status: string;
    score: number | null;
    githubUrl: string | null;
    liveDemoUrl: string | null;
    submittedAt: string;
    gradedAt: string | null;
  }>;
}

