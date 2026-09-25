import { QuizQuestion } from "./lms";

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant" | "model";
  content: string;
  timestamp: string;
  tutorPersona?: string;
  suggestedPrompts?: string[];
}

export interface GeneratedQuiz {
  id: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  track: string;
  questions: QuizQuestion[];
  generatedAt: string;
}

export interface StudyPlanWeek {
  weekNumber: number;
  title: string;
  focusArea: string;
  estimatedHours: number;
  dailyBreakdown: {
    day: string;
    task: string;
    duration: string;
  }[];
  milestoneProject: string;
}

export interface AIStudyPlan {
  id: string;
  studentName: string;
  trackTitle: string;
  hoursPerWeek: number;
  totalWeeks: number;
  learningPace: "Accelerated" | "Standard" | "Flexible Weekend";
  weeks: StudyPlanWeek[];
  tutorTip: string;
  createdAt: string;
}

export interface AIFeedbackCriterion {
  criteria: string;
  scoreEstimate: number; // 0-25
  status: "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT";
  feedback: string;
  remediationSnippet?: string;
}

export interface AIFeedbackResult {
  overallScore: number; // 0-100
  readinessVerdict: "READY_FOR_GRADING" | "MINOR_REVISION_RECOMMENDED" | "MAJOR_REWORK_NEEDED";
  summary: string;
  criteriaAnalysis: AIFeedbackCriterion[];
  actionItems: string[];
  reviewedAt: string;
}

export interface PersonalizedRecommendation {
  id: string;
  type: "LESSON" | "PRACTICE" | "PROJECT" | "CROSS_SKILL";
  title: string;
  badge: string;
  reason: string;
  actionUrl: string;
  urgency: "HIGH" | "MEDIUM" | "RECOMMENDED";
}
