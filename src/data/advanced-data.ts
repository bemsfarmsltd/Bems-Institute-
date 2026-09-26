import {
  LiveClass,
  CommunityChannel,
  CommunityMessage,
  AppNotification,
  GamificationProfile,
  LeaderboardStudent,
  SubscriptionTier
} from "@/types/advanced";

export const mockLiveClasses: LiveClass[] = [
  {
    id: "live-101",
    title: "Mastering Next.js 16 App Router & Server Actions in Umuahia Lab 1",
    courseId: "web-dev",
    courseTitle: "Full-Stack Web & Next.js Modern Engineering",
    instructor: "Mr. Victor Okeke",
    instructorRole: "Lead Full-Stack Instructor & Principal Architect",
    startTime: "Today, 4:00 PM (WAT)",
    duration: "90 Mins",
    status: "LIVE_NOW",
    location: "Hybrid (BEMS Tech Lab 1, Umuahia + Zoom Video Room A)",
    zoomJoinUrl: "https://zoom.us/j/9827364120",
    streamVideoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    currentAttendees: 42,
    agenda: [
      "Deep dive into React 19 useActionState and Server Actions",
      "Deploying high-performance edge lambdas on Vercel",
      "Live Q&A and coding with Umuahia cohort participants"
    ]
  },
  {
    id: "live-102",
    title: "Autonomous Agent Orchestration with Gemini 2.5 Flash & Function Calling",
    courseId: "ai-prompt",
    courseTitle: "Generative AI, Prompt Engineering & AI Workflows",
    instructor: "Engr. Timi Adebayo",
    instructorRole: "AI Automation Architect",
    startTime: "Tomorrow, 2:00 PM (WAT)",
    duration: "120 Mins",
    status: "UPCOMING",
    location: "Virtual Broadcast Room & BEMS Computer Lab",
    zoomJoinUrl: "https://zoom.us/j/9827364121",
    currentAttendees: 58,
    agenda: [
      "Structured Outputs with Pydantic & TypeScript schemas",
      "Gemini Multimodal analysis for real-time document OCR",
      "Building a WhatsApp-powered business intelligence bot"
    ]
  },
  {
    id: "live-103",
    title: "Figma Variables, Tokenized Design Systems & Design-to-Code Handoff",
    courseId: "ui-ux",
    courseTitle: "UI/UX Product Design & Design Systems Mastery",
    instructor: "Temi Adeleke",
    instructorRole: "Principal Product Designer",
    startTime: "Thursday, 11:00 AM (WAT)",
    duration: "75 Mins",
    status: "UPCOMING",
    location: "Design Studio & Google Meet",
    zoomJoinUrl: "https://meet.google.com/bem-dsgn-lab",
    currentAttendees: 31,
    agenda: [
      "Advanced Auto-layout 5.0 techniques",
      "Creating accessible color contrast tokens (WCAG AAA)",
      "Prototyping dynamic state variants"
    ]
  },
  {
    id: "live-104",
    title: "Live Fire Vulnerability Scanning & Defensive Hardening Workshop",
    courseId: "cybersecurity",
    courseTitle: "Cybersecurity Fundamentals & Defense Operations",
    instructor: "Faculty Security Lead",
    instructorRole: "Certified Ethical Hacker & Infrastructure Auditor",
    startTime: "Yesterday, 3:00 PM (WAT)",
    duration: "105 Mins",
    status: "RECORDED",
    location: "Recorded in BEMS Security Sandbox",
    zoomJoinUrl: "https://zoom.us/rec/play/bems-cyber-01",
    recordingUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    currentAttendees: 64,
    agenda: [
      "OWASP Top 10 hands-on penetration testing",
      "Configuring Cloudflare WAF rules & rate limiters",
      "Post-incident review and forensic log aggregation"
    ]
  }
];

export const mockChannels: CommunityChannel[] = [
  {
    id: "general-announcements",
    name: "📢 announcements",
    description: "Official notices from BEMS Academic Directorate & Umuahia Lab Coordinators",
    category: "CAMPUS_HUB",
    unreadCount: 1
  },
  {
    id: "web-dev-chat",
    name: "💻 full-stack-devs",
    description: "HTML, CSS, TypeScript, Next.js, and server-side bug solving",
    category: "CLASS_TRACKS",
    unreadCount: 4
  },
  {
    id: "ai-prompt-chat",
    name: "🤖 genai-automations",
    description: "Prompt tuning, Gemini integrations, Make.com flows, and bot deployments",
    category: "CLASS_TRACKS"
  },
  {
    id: "ui-ux-design",
    name: "🎨 product-designers",
    description: "Figma critiques, user journey mapping, and mobile UI feedback",
    category: "CLASS_TRACKS"
  },
  {
    id: "cyber-defense",
    name: "🛡️ security-operations",
    description: "Penetration testing labs, network packets, and safe coding practices",
    category: "CLASS_TRACKS"
  },
  {
    id: "career-freelance",
    name: "💼 freelance-and-jobs",
    description: "Upwork proposals, remote tech opportunities, and portfolio critiques",
    category: "CAREER",
    unreadCount: 2
  }
];

export const mockMessages: CommunityMessage[] = [
  {
    id: "msg-1",
    channelId: "web-dev-chat",
    senderName: "Chukwudi Nwachukwu",
    senderRole: "STUDENT",
    content: "Hey guys! I just completed Capstone Project 1 for the Next.js e-commerce store. Quick tip: make sure you use 'next/image' with proper aspect ratio attributes or your layout shifts on mobile preview!",
    codeSnippet: `// Tip for clean responsive images in Next.js\n<div className="relative w-full aspect-video rounded-xl overflow-hidden">\n  <Image src="/banner.jpg" alt="Cohort Banner" fill className="object-cover" />\n</div>`,
    likes: 7,
    timestamp: "10 mins ago"
  },
  {
    id: "msg-2",
    channelId: "web-dev-chat",
    senderName: "Mr. Victor Okeke",
    senderRole: "INSTRUCTOR",
    content: "Great pointer @Chukwudi! Cumulative Layout Shift (CLS) is a vital Core Web Vital. In today's 4:00 PM live session, we will also demonstrate how to combine this with Next.js 16 Partial Prerendering (PPR). Bring your laptop to Lab 1 or join the Zoom room early!",
    likes: 14,
    timestamp: "6 mins ago"
  },
  {
    id: "msg-3",
    channelId: "ai-prompt-chat",
    senderName: "Amina Yusuf",
    senderRole: "STUDENT",
    content: "The Gemini 2.5 Flash SDK function calling is so fast! I hooked it up to query a local SQLite database for inventory tracking in Aba market and response time is under 400ms.",
    likes: 9,
    timestamp: "25 mins ago"
  },
  {
    id: "msg-4",
    channelId: "career-freelance",
    senderName: "Blessing Eze",
    senderRole: "ALUMNI",
    content: "To all October 2026 cohort trainees: don't wait until graduation to polish your GitHub profiles. Upload every capstone project, add a live Vercel demo link, and share it on LinkedIn tagging BEMS Institute!",
    likes: 21,
    timestamp: "1 hour ago"
  }
];

export const mockNotifications: AppNotification[] = [
  {
    id: "notif-1",
    title: "🔴 Live Class Starting Soon",
    message: "Mr. Victor Okeke is starting 'Next.js 16 App Router & Server Actions' in 15 minutes at Umuahia Lab 1 and Zoom.",
    category: "CLASS",
    timestamp: "15m ago",
    read: false,
    linkUrl: "/live"
  },
  {
    id: "notif-2",
    title: "🎉 Certificate Earned",
    message: "Congratulations! You have completed all 4 core modules in Full-Stack Web Development. View your verified Certificate of Competence.",
    category: "GAMIFICATION",
    timestamp: "2h ago",
    read: false,
    linkUrl: "/certificate/BEMS-FS-2026-WD01"
  },
  {
    id: "notif-3",
    title: "📝 Faculty Grade Posted",
    message: "Your submission for 'E-Commerce Storefront Architecture' has been graded: 96/100 (Pass with Distinction) with personal feedback from Mr. Victor.",
    category: "GRADING",
    timestamp: "1d ago",
    read: true,
    linkUrl: "/learn/web-development/assignment/web-assign-1"
  },
  {
    id: "notif-4",
    title: "💳 Tuition Payment Confirmed",
    message: "₦85,000 for Full-Stack Web Cohort has been verified via Paystack. Your physical workstation at Umuahia Lab 1 is reserved.",
    category: "PAYMENT",
    timestamp: "3d ago",
    read: true,
    linkUrl: "/dashboard"
  }
];

export const mockGamificationProfile: GamificationProfile = {
  xpPoints: 2450,
  streakDays: 8,
  level: 4,
  levelTitle: "Senior Apprentice Architect",
  badges: [
    {
      id: "b-first-code",
      title: "First Commit",
      description: "Successfully executed your first program in the BEMS Sandbox IDE.",
      icon: "🚀",
      unlockedAt: "Sep 18, 2026",
      isUnlocked: true
    },
    {
      id: "b-quiz-whiz",
      title: "Quiz Whiz",
      description: "Scored 100% on the Modern JavaScript & ES6 Architecture quiz.",
      icon: "🎯",
      unlockedAt: "Sep 21, 2026",
      isUnlocked: true
    },
    {
      id: "b-streak-7",
      title: "7-Day Code Streak",
      description: "Engaged in lessons or code challenges for 7 consecutive days.",
      icon: "🔥",
      unlockedAt: "Sep 24, 2026",
      isUnlocked: true
    },
    {
      id: "b-capstone-hero",
      title: "Capstone Hero",
      description: "Built and deployed a production-grade full-stack web application.",
      icon: "🏆",
      unlockedAt: "Sep 25, 2026",
      isUnlocked: true
    },
    {
      id: "b-ai-collaborator",
      title: "AI Co-Pilot",
      description: "Conducted 10+ prompt sessions with BEMS AI Technical Companion.",
      icon: "🤖",
      isUnlocked: false
    },
    {
      id: "b-bug-hunter",
      title: "Bug Hunter",
      description: "Passed all edge case unit tests on first attempt in Sandbox.",
      icon: "⚡",
      isUnlocked: false
    }
  ]
};

export const mockLeaderboard: LeaderboardStudent[] = [
  {
    rank: 1,
    id: "lead-1",
    name: "Emeka Anyanwu",
    track: "Full-Stack Web Development",
    xpPoints: 3120,
    streakDays: 14,
    badgesCount: 6,
    avatarText: "EA"
  },
  {
    rank: 2,
    id: "lead-2",
    name: "Chukwudi Nwachukwu",
    track: "Full-Stack Web Development",
    xpPoints: 2450,
    streakDays: 8,
    badgesCount: 4,
    avatarText: "CN"
  },
  {
    rank: 3,
    id: "lead-3",
    name: "Amina Yusuf",
    track: "Generative AI & Prompt Engineering",
    xpPoints: 2380,
    streakDays: 11,
    badgesCount: 5,
    avatarText: "AY"
  },
  {
    rank: 4,
    id: "lead-4",
    name: "Ngozi Obi",
    track: "UI/UX Product Design",
    xpPoints: 2190,
    streakDays: 7,
    badgesCount: 4,
    avatarText: "NO"
  },
  {
    rank: 5,
    id: "lead-5",
    name: "Tariq Adeleke",
    track: "Cybersecurity & Defense Operations",
    xpPoints: 1940,
    streakDays: 6,
    badgesCount: 3,
    avatarText: "TA"
  },
  {
    rank: 6,
    id: "lead-6",
    name: "Kelechi Umeh",
    track: "Full-Stack Web Development",
    xpPoints: 1810,
    streakDays: 5,
    badgesCount: 3,
    avatarText: "KU"
  }
];

export const mockSubscriptionTiers: SubscriptionTier[] = [
  {
    id: "tier-cohort",
    name: "FutureSkills Cohort Tuition",
    badge: "Official October 2026 Batch",
    priceNaira: 85000,
    billingPeriod: "One-Time",
    description: "Complete 12-week intensive accelerator with physical workstation in Umuahia, mentorship, capstone certification, and WhatsApp VIP forum.",
    features: [
      "Physical Lab seat at BEMS Tech Lab 1, Umuahia",
      "High-speed dedicated Wi-Fi & solar power backup",
      "Live interactive classes with Mr. Victor & faculty",
      "Full access to AI Academic Tutor & Sandbox IDE",
      "Verified Certificate of Competence with QR verification",
      "Direct WhatsApp VIP Community & Instructor desk"
    ],
    isPopular: true,
    ctaText: "Enroll in Cohort (₦85,000)"
  },
  {
    id: "tier-hybrid-monthly",
    name: "Self-Paced Hybrid Access",
    priceNaira: 32000,
    billingPeriod: "Monthly",
    description: "Flexible remote learning with optional weekend campus lab privileges and full on-demand video classroom access.",
    features: [
      "Full 24/7 on-demand video curriculum and sandbox",
      "Weekly live Zoom Q&A and code clinics",
      "Weekend pass to Umuahia Tech Lab (Saturdays 9am - 4pm)",
      "Automated AI Quiz generator and assignment grading",
      "Community forum and peer feedback channels"
    ],
    ctaText: "Start Monthly (₦32,000/mo)"
  },
  {
    id: "tier-enterprise",
    name: "Corporate & Institution Sponsor",
    badge: "B2B & Government",
    priceNaira: 280000,
    billingPeriod: "Quarterly",
    description: "Sponsor 3+ trainees or upskill your corporate staff with dedicated progress reporting, custom capstones, and physical lab reserved slots.",
    features: [
      "Up to 4 team members enrolled simultaneously",
      "Dedicated company admin portal with performance metrics",
      "Custom business capstone aligned with your software stack",
      "Quarterly executive evaluation report",
      "Priority physical lab bookings and boardroom access"
    ],
    ctaText: "Inquire for Enterprise"
  }
];
