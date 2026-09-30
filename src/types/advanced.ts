// Backed by real LiveSession rows (backend/src/routes/attendance.ts GET /live) —
// status/meetingUrl are the only fields the backend actually has; there's no
// real video hosting, attendee count, or agenda data, so those don't exist
// here (see the frontend audit that found the old mock fields for them).
export interface LiveClass {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  instructor: string;
  instructorRole: string;
  scheduledAt: string; // ISO date string
  status: "LIVE_NOW" | "UPCOMING";
  meetingUrl: string | null;
}

export interface CommunityChannel {
  id: string;
  name: string;
  description: string;
  category: "CLASS_TRACKS" | "CAMPUS_HUB" | "CAREER";
}

// Backed by the real CommunityMessage model — senderRole matches the real
// Prisma UserRole enum (no "ALUMNI", which was never a real role).
export interface CommunityMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  content: string;
  codeSnippet?: string | null;
  likes: number;
  createdAt: string; // ISO date string
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: "CLASS" | "GRADING" | "PAYMENT" | "GAMIFICATION";
  timestamp: string;
  read: boolean;
  linkUrl?: string;
}

// Backed by GET /api/lms/leaderboard (backend/src/lib/leaderboard.ts) — one
// row per real STUDENT user, XP/level/badges computed from their actual
// completed lessons, quiz scores, certificates, and learning streak.
export interface LeaderboardStudent {
  rank: number;
  userId: string;
  name: string;
  track: string;
  xpPoints: number;
  level: number;
  levelTitle: string;
  streakDays: number;
  badges: string[];
  badgesCount: number;
  isMe: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  badge?: string;
  priceNaira: number;
  billingPeriod: "One-Time" | "Monthly" | "Quarterly";
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}
