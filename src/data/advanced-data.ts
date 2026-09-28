import {
  LiveClass,
  CommunityChannel,
  CommunityMessage,
  AppNotification,
  GamificationProfile,
  LeaderboardStudent,
  SubscriptionTier
} from "@/types/advanced";

export const INITIAL_LIVE_CLASSES: LiveClass[] = [
  {
    id: "live-wd-101",
    title: "Live Studio: Real-World Responsive Flexbox & Mobile Breakpoints",
    courseId: "web-dev",
    courseTitle: "Web Development",
    instructor: "Mr. Victor",
    instructorRole: "Senior Full-Stack Engineer",
    startTime: "Happening Now",
    duration: "90 Minutes",
    status: "LIVE_NOW",
    location: "BEMS Hub Lab 1 (Umuahia) + Zoom",
    zoomJoinUrl: "https://zoom.us/j/bems-futureskills-live",
    streamVideoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    currentAttendees: 48,
    agenda: [
      "Common CSS layout traps on Android & iPhone screens",
      "Live refactoring of student submissions from GitHub",
      "Live Q&A and interactive code debugging in Chrome DevTools"
    ]
  },
  {
    id: "live-ai-102",
    title: "Masterclass: Connecting Gemini 2.5 Flash to WhatsApp Webhooks",
    courseId: "ai-automation",
    courseTitle: "AI & Automation",
    instructor: "Timi",
    instructorRole: "AI Solutions Engineer",
    startTime: "Tomorrow &middot; 4:30 PM WAT",
    duration: "75 Minutes",
    status: "UPCOMING",
    location: "Virtual Live Zoom",
    zoomJoinUrl: "https://zoom.us/j/bems-ai-webhooks",
    currentAttendees: 36,
    agenda: [
      "Deploying instant webhooks on Make.com without servers",
      "Structuring prompt instructions for customer service bots",
      "Handling real Nigerian customer dialect variations"
    ]
  },
  {
    id: "live-pd-103",
    title: "Design Critique Studio: Portfolio Review & Figma Auto-Layout",
    courseId: "product-design",
    courseTitle: "Product Design (UI/UX)",
    instructor: "Temi",
    instructorRole: "Lead Product Designer",
    startTime: "Friday &middot; 3:00 PM WAT",
    duration: "60 Minutes",
    status: "UPCOMING",
    location: "BEMS Hub Lab 2 (Umuahia) + Zoom",
    zoomJoinUrl: "https://zoom.us/j/bems-figma-critique",
    currentAttendees: 28,
    agenda: [
      "Live review of 3 student case study prototypes",
      "Figma variable tokens & developer handoff checklist",
      "Preparing Behance case studies for international job recruiters"
    ]
  },
  {
    id: "live-rec-01",
    title: "Recorded Archive: Git Merge Conflicts & Team Collaboration",
    courseId: "web-dev",
    courseTitle: "Web Development",
    instructor: "Mr. Victor",
    instructorRole: "Senior Full-Stack Engineer",
    startTime: "Recorded Yesterday",
    duration: "84 Minutes",
    status: "RECORDED",
    location: "BEMS Hub Lab 1 (Umuahia) + Zoom",
    zoomJoinUrl: "https://zoom.us/rec/play/bems-git-archive",
    recordingUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    currentAttendees: 62,
    agenda: [
      "Anatomy of a 3-way merge conflict in VS Code",
      "Resolving git HEAD tags without losing code",
      "Pull request reviews on GitHub"
    ]
  }
];

export const COMMUNITY_CHANNELS: CommunityChannel[] = [
  {
    id: "chan-announcements",
    name: "school-announcements",
    description: "Official BEMS Institute notices, schedule changes, and guest lecture links.",
    category: "CAMPUS_HUB",
    unreadCount: 0
  },
  {
    id: "chan-web-dev",
    name: "web-development",
    description: "HTML, CSS, JavaScript, Next.js discussions & lab troubleshooting with Mr. Victor.",
    category: "CLASS_TRACKS",
    unreadCount: 3
  },
  {
    id: "chan-ai-auto",
    name: "ai-and-automation",
    description: "Make.com, Zapier, Gemini API, and autonomous chatbot builds with Timi.",
    category: "CLASS_TRACKS",
    unreadCount: 1
  },
  {
    id: "chan-design",
    name: "product-design-uiux",
    description: "Figma wireframes, design systems, usability feedback with Temi.",
    category: "CLASS_TRACKS",
    unreadCount: 0
  },
  {
    id: "chan-project-help",
    name: "project-showcase-and-help",
    description: "Share live Vercel deployments, ask for bug fixes, and find study group partners.",
    category: "CAREER",
    unreadCount: 2
  }
];

export const INITIAL_COMMUNITY_MESSAGES: CommunityMessage[] = [
  {
    id: "msg-c-1",
    channelId: "chan-web-dev",
    senderName: "Mr. Victor",
    senderRole: "INSTRUCTOR",
    content: "Good morning team! Remember today's live interactive clinic at 4:30 PM in Lab 1. We will be live-refactoring mobile navigation bars. Bring your questions!",
    likes: 14,
    timestamp: "9:15 AM"
  },
  {
    id: "msg-c-2",
    channelId: "chan-web-dev",
    senderName: "Chinedu Okeke",
    senderRole: "STUDENT",
    content: "Thank you Mr. Victor! I had an issue where my hamburger drawer wasn't sliding smoothly on Android Chrome, but adding `transform: translateX(0)` fixed the jitter!",
    codeSnippet: `.drawer {\n  transform: translateX(-100%);\n  transition: transform 0.3s ease-in-out;\n}\n.drawer.open {\n  transform: translateX(0);\n}`,
    likes: 8,
    timestamp: "10:30 AM"
  },
  {
    id: "msg-c-3",
    channelId: "chan-web-dev",
    senderName: "Ngozi Eze",
    senderRole: "STUDENT",
    content: "Are lab workstations 14 to 20 free for practice this afternoon before the Zoom session starts?",
    likes: 3,
    timestamp: "11:05 AM"
  },
  {
    id: "msg-c-4",
    channelId: "chan-web-dev",
    senderName: "Mr. Victor",
    senderRole: "INSTRUCTOR",
    content: "Yes Ngozi! Lab 1 is open from 1:00 PM with backup inverter power and high-speed fibre internet. See you there.",
    likes: 9,
    timestamp: "11:12 AM"
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

export const INITIAL_GAMIFICATION: GamificationProfile = {
  xpPoints: 1450,
  streakDays: 5,
  level: 4,
  levelTitle: "Senior Lab Apprentice",
  badges: [
    {
      id: "badge-first-code",
      title: "First Line of Code",
      description: "Successfully configured your local development environment and ran your first script.",
      icon: "⚡",
      unlockedAt: "2026-09-18",
      isUnlocked: true
    },
    {
      id: "badge-css-wizard",
      title: "CSS Grid Wizard",
      description: "Built a fully responsive two-dimensional grid layout without breaking on mobile.",
      icon: "📐",
      unlockedAt: "2026-09-20",
      isUnlocked: true
    },
    {
      id: "badge-quiz-ace",
      title: "Quiz Ace (100%)",
      description: "Scored a perfect 100% on the technical assessment exam on first attempt.",
      icon: "🎯",
      unlockedAt: "2026-09-22",
      isUnlocked: true
    },
    {
      id: "badge-capstone",
      title: "Capstone Finisher",
      description: "Deployed a production-grade web application to a public domain.",
      icon: "🚀",
      unlockedAt: "2026-09-24",
      isUnlocked: true
    },
    {
      id: "badge-graduate",
      title: "Pioneer Graduate",
      description: "Conferred with the official institutional Certificate of Competence.",
      icon: "🎓",
      isUnlocked: true,
      unlockedAt: "2026-09-24"
    }
  ]
};

export const LEADERBOARD_STUDENTS: LeaderboardStudent[] = [
  {
    rank: 1,
    id: "stu-001",
    name: "Chinedu Okeke",
    track: "Web Development",
    xpPoints: 1450,
    streakDays: 5,
    badgesCount: 5,
    avatarText: "CO"
  },
  {
    rank: 2,
    id: "stu-009",
    name: "Obinna Uzor",
    track: "Cybersecurity",
    xpPoints: 1380,
    streakDays: 6,
    badgesCount: 4,
    avatarText: "OU"
  },
  {
    rank: 3,
    id: "stu-011",
    name: "David Madu",
    track: "Product Design",
    xpPoints: 1320,
    streakDays: 4,
    badgesCount: 4,
    avatarText: "DM"
  },
  {
    rank: 4,
    id: "stu-003",
    name: "Emmanuel Kalu",
    track: "Web Development",
    xpPoints: 1190,
    streakDays: 4,
    badgesCount: 3,
    avatarText: "EK"
  },
  {
    rank: 5,
    id: "stu-006",
    name: "Favour Chukwuebuka",
    track: "AI & Automation",
    xpPoints: 1150,
    streakDays: 3,
    badgesCount: 3,
    avatarText: "FC"
  },
  {
    rank: 6,
    id: "stu-004",
    name: "Amarachi Nwosu",
    track: "Product Design",
    xpPoints: 1040,
    streakDays: 3,
    badgesCount: 3,
    avatarText: "AN"
  },
  {
    rank: 7,
    id: "stu-002",
    name: "Ngozi Eze",
    track: "AI & Automation",
    xpPoints: 920,
    streakDays: 2,
    badgesCount: 2,
    avatarText: "NE"
  },
  {
    rank: 8,
    id: "stu-008",
    name: "Chioma Daniel",
    track: "Web Development",
    xpPoints: 890,
    streakDays: 3,
    badgesCount: 2,
    avatarText: "CD"
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

export const mockLiveClasses = INITIAL_LIVE_CLASSES;
export const mockChannels = COMMUNITY_CHANNELS;
export const mockMessages = INITIAL_COMMUNITY_MESSAGES;
export const mockNotifications = INITIAL_NOTIFICATIONS;
export const mockGamificationProfile = INITIAL_GAMIFICATION;
export const mockLeaderboard = LEADERBOARD_STUDENTS;
export const mockSubscriptionTiers = SUBSCRIPTION_TIERS;


