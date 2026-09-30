import {
  CommunityChannel,
  AppNotification,
  SubscriptionTier
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

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "tier-cohort",
    name: "FutureSkills Accelerator",
    badge: "Most Popular",
    priceNaira: 79000,
    billingPeriod: "One-Time",
    description: "Full 3-Month practical cohort training at BEMS Hub Labs or Live Zoom, Capstone project, and verified Certificate.",
    features: [
      "Access to all modules & HD lesson recordings for your track",
      "Dedicated Umuahia physical lab workstation & high-speed internet",
      "Weekly live code reviews & mentoring with Mr. Victor / Timi / Temi",
      "Pre-submission AI code review & 24/7 AI Tutor assistant",
      "Printable BEMS Certificate with cryptographic QR verifier",
      "Direct admission to official BEMS Class WhatsApp Community"
    ],
    isPopular: true,
    ctaText: "Enroll in October 2026 Cohort"
  },
  {
    id: "tier-all-access",
    name: "BEMS All-Access Pro Pass",
    badge: "Unlimited Tech Learning",
    priceNaira: 15000,
    billingPeriod: "Monthly",
    description: "Cross-skill continuously across all 4 tracks (AI, Web, Design, Cyber) with priority lab desk access.",
    features: [
      "Unlimited access to ALL 4 technical tracks simultaneously",
      "Priority physical lab seating in Umuahia during open lab hours",
      "1-on-1 monthly code clinic with Senior Lead Instructors",
      "Unlimited AI Quiz generations & automated capstone audits",
      "Access to exclusive employer talent directory matchmaking",
      "Cancel or pause anytime with no hidden penalty"
    ],
    isPopular: false,
    ctaText: "Subscribe for ₦15,000 / mo"
  },
  {
    id: "tier-alumni",
    name: "Alumni Tech Mastermind",
    badge: "Career Matchmaking",
    priceNaira: 8000,
    billingPeriod: "Monthly",
    description: "For graduates who want ongoing career referrals, weekly engineering masterclasses, and freelance client leads.",
    features: [
      "Weekly live technical architecture deep-dives",
      "Direct introductions to hiring tech startups across Nigeria & remote",
      "BEMS Innovation Hub hot-desk pass (2 days/week)",
      "Portfolio case study reviews for international job applications",
      "Private Alumni WhatsApp Mastermind networking group"
    ],
    isPopular: false,
    ctaText: "Join Alumni Club (₦8,000 / mo)"
  }
];

export const mockNotifications = INITIAL_NOTIFICATIONS;
export const mockSubscriptionTiers = SUBSCRIPTION_TIERS;


