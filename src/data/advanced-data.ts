import {
  CommunityChannel,
  AppNotification
} from "@/types/advanced";

// Channels are a small, fixed, code-defined taxonomy — not a DB table (see
// the CommunityMessage model for what's actually persisted per channel).
export const COMMUNITY_CHANNELS: CommunityChannel[] = [
  {
    id: "chan-announcements",
    name: "school-announcements",
    description: "Official BEMS Institute notices, schedule changes, and guest lecture links.",
    category: "CAMPUS_HUB"
  },
  {
    id: "chan-web-dev",
    name: "web-development",
    description: "HTML, CSS, JavaScript, Next.js discussions & lab troubleshooting with Mr. Victor.",
    category: "CLASS_TRACKS"
  },
  {
    id: "chan-ai-auto",
    name: "ai-and-automation",
    description: "Make.com, Zapier, Gemini API, and autonomous chatbot builds with Timi.",
    category: "CLASS_TRACKS"
  },
  {
    id: "chan-design",
    name: "product-design-uiux",
    description: "Figma wireframes, design systems, usability feedback with Temi.",
    category: "CLASS_TRACKS"
  },
  {
    id: "chan-project-help",
    name: "project-showcase-and-help",
    description: "Share live Vercel deployments, ask for bug fixes, and find study group partners.",
    category: "CAREER"
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Live Class Happening Now",
    message: "Mr. Victor has started 'Responsive Design & Mobile Breakpoints' in Lab 1 + Zoom.",
    category: "CLASS",
    timestamp: "Just now",
    read: false,
    linkUrl: "/live"
  },
  {
    id: "notif-2",
    title: "Capstone Graded: Distinction (95/100)",
    message: "Your Web Development portal capstone was approved by Mr. Victor! Your verified certificate is ready.",
    category: "GRADING",
    timestamp: "2 hours ago",
    read: false,
    linkUrl: "/certificate/cert-001"
  },
  {
    id: "notif-3",
    title: "🔥 5-Day Study Streak Active!",
    message: "Awesome consistency! You unlocked the 'CSS Grid Master' badge and earned +150 XP.",
    category: "GAMIFICATION",
    timestamp: "Yesterday",
    read: true,
    linkUrl: "/leaderboard"
  },
  {
    id: "notif-4",
    title: "Tuition Receipt Acknowledged",
    message: "Installment payment of ₦35,000 for October 2026 Cohort has been verified in the ledger.",
    category: "PAYMENT",
    timestamp: "3 days ago",
    read: true,
    linkUrl: "/dashboard"
  }
];

export const mockNotifications = INITIAL_NOTIFICATIONS;


