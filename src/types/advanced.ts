export interface LiveClass {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  instructor: string;
  instructorRole: string;
  startTime: string; // ISO date or display string
  duration: string;
  status: "LIVE_NOW" | "UPCOMING" | "RECORDED";
  location: "BEMS Hub Lab 1 (Umuahia) + Zoom" | "Virtual Live Zoom";
  zoomJoinUrl: string;
  streamVideoUrl?: string;
  currentAttendees: number;
  agenda: string[];
  recordingUrl?: string;
}

export interface CommunityChannel {
  id: string;
  name: string;
  description: string;
  category: "CLASS_TRACKS" | "CAMPUS_HUB" | "CAREER";
  unreadCount?: number;
}

export interface CommunityMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: "STUDENT" | "INSTRUCTOR" | "ALUMNI";
  senderAvatar?: string;
  content: string;
  codeSnippet?: string;
  likes: number;
  timestamp: string;
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

export interface GamificationProfile {
  xpPoints: number;
  streakDays: number;
  level: number;
  levelTitle: string;
  badges: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    isUnlocked: boolean;
  }[];
}

export interface LeaderboardStudent {
  rank: number;
  id: string;
  name: string;
  track: string;
  xpPoints: number;
  streakDays: number;
  badgesCount: number;
  avatarText: string;
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
