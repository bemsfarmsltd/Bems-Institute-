"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Calendar,
  FileCheck,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Code2,
  BookOpen,
  Award,
  RefreshCw,
  Trophy,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  XCircle,
  Zap,
  Check,
  HelpCircle,
  Printer,
  Download,
  Flame,
  GraduationCap,
  Clock,
  Target,
  Layers,
  CheckSquare,
  Square
} from "lucide-react";
import Button from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { useLMS } from "@/context/LMSContext";
import { LearningInsights } from "@/components/LearningInsights";
import { apiFetch } from "@/lib/api-client";
import {
  AIChatMessage,
  GeneratedQuiz,
  AIStudyPlan,
  StudyPlanWeek,
  AIFeedbackResult,
  PersonalizedRecommendation
} from "@/types/ai";

const TRACK_PRESETS: Record<string, { label: string; topics: string[] }> = {
  "web-dev": {
    label: "Web Development",
    topics: [
      "Modern JavaScript & ES6",
      "React Hooks & State",
      "CSS Flexbox & Responsive Grid",
      "Next.js App Router & SSR",
      "REST APIs & Paystack Webhooks",
      "SQL & Database Schemas"
    ]
  },
  "ai-automation": {
    label: "Applied AI & Automation",
    topics: [
      "Prompt Engineering & Few-Shot",
      "LLM Hallucinations & Grounding",
      "Make & Zapier Automations",
      "Vector DBs & RAG Architecture",
      "Autonomous AI Agents"
    ]
  },
  "product-design": {
    label: "Product Design (UI/UX)",
    topics: [
      "Figma Auto-Layout & Tokens",
      "WCAG Accessibility & Contrast",
      "User Journey & Usability Tests",
      "Mobile-First Prototyping",
      "Design Systems & Reusable UI"
    ]
  },
  "cybersecurity": {
    label: "Cybersecurity Defense",
    topics: [
      "SQL Injection & XSS Defense",
      "Authentication & JWT Security",
      "Password Hashing & Salts",
      "Network Port Scanning",
      "Zero-Trust Architecture"
    ]
  }
};

function generateClientFallbackQuiz(
  topic: string,
  difficulty: "Beginner" | "Intermediate" | "Advanced",
  count: number,
  track: string
): GeneratedQuiz {
  const safeCount = Math.min(Math.max(count || 3, 1), 10);
  const t = topic.toLowerCase();

  let pool = [
    {
      id: "fallback-q1",
      prompt: `In the context of ${topic}, which practice represents the industry standard for production reliability?`,
      options: [
        "Hardcoding configuration values directly in client-side code",
        "Isolating environment variables and validating inputs with strict schemas",
        "Skipping version control commits during development sprints",
        "Disabling error boundaries and console logging in production"
      ],
      correctOption: 1,
      explanation: "Production-grade engineering relies on environment isolation (.env), rigorous schema validation (Zod/TypeScript), and structured error handling to prevent runtime failures."
    },
    {
      id: "fallback-q2",
      prompt: `When building solutions with ${topic} for users on mobile networks (such as 3G/4G connections across Nigeria), what is the most effective approach?`,
      options: [
        "Loading uncompressed 4K media assets unconditionally",
        "Responsive asset compression, lazy loading, and asynchronous code splitting",
        "Stripping all accessibility ARIA attributes to save bytes",
        "Running blocking synchronous computations on the browser main thread"
      ],
      correctOption: 1,
      explanation: "Modern web performance and data efficiency depend on responsive formats (WebP/AVIF), lazy-loading below-the-fold content, and non-blocking asynchronous chunks."
    },
    {
      id: "fallback-q3",
      prompt: `How does an engineer verify that their ${topic} implementation remains defect-free across all screen sizes and browsers?`,
      options: [
        "Relying solely on visual inspection on a single desktop viewport",
        "Automated unit testing, cross-browser audits, and responsive breakpoint verification",
        "Deploying untested local experimental branches directly to the primary domain",
        "Suppressing runtime errors with empty catch blocks"
      ],
      correctOption: 1,
      explanation: "Quality assurance combines automated unit/integration tests with disciplined viewport testing across mobile, tablet, and desktop form factors."
    },
    {
      id: "fallback-q4",
      prompt: `When collaborating with team members on ${topic}, what is the best workflow for code reviews and version control?`,
      options: [
        "Directly force-pushing untested changes to the main production branch",
        "Creating feature branches, writing descriptive commit messages, and opening pull requests with peer review",
        "Sharing code snippets via unencrypted social media chats instead of git",
        "Disabling linting and automated CI checks to accelerate deployments"
      ],
      correctOption: 1,
      explanation: "Professional development uses structured Git workflows: feature branches, atomic commits, automated lint/test CI checks, and peer reviews."
    },
    {
      id: "fallback-q5",
      prompt: `Which principle is most critical when securing user data and state when implementing ${topic}?`,
      options: [
        "Storing raw passwords and private tokens in plaintext localStorage",
        "Enforcing principle of least privilege, sanitized inputs, and cryptographic hashing",
        "Allowing unrestricted Cross-Origin Resource Sharing (CORS *) on all internal APIs",
        "Bypassing authentication headers for mobile API consumers"
      ],
      correctOption: 1,
      explanation: "Security requires least-privilege access, strict input sanitization, parameterized queries, and industry-standard hashing (e.g. bcrypt/argon2)."
    }
  ];

  if (t.includes("react") || t.includes("hook") || t.includes("state")) {
    pool = [
      {
        id: "react-q1",
        prompt: "Why should you avoid mutating React state directly (e.g. `state.items.push(newItem)`)?",
        options: [
          "It permanently disables JavaScript garbage collection",
          "React relies on reference equality to detect state changes; direct mutations skip re-renders",
          "Direct mutation converts arrays into read-only objects",
          "Browsers do not permit memory writes to variables created with `useState`"
        ],
        correctOption: 1,
        explanation: "React compares old and new state references (`Object.is`). Mutating an existing object or array in place keeps the same memory pointer, preventing React from scheduling a re-render."
      },
      {
        id: "react-q2",
        prompt: "What is the primary purpose of the dependency array in `useEffect`?",
        options: [
          "To specify CSS classes that should trigger animation re-paints",
          "To tell React which external reactive values the effect depends on, re-running the effect only when they change",
          "To list the external npm libraries imported by the component",
          "To force the component to re-mount every 100 milliseconds"
        ],
        correctOption: 1,
        explanation: "The dependency array informs React when to execute the effect. Passing an empty array `[]` runs it once on mount; omitting it runs on every single render."
      },
      {
        id: "react-q3",
        prompt: "When rendering a dynamic list in React, why is using item index as `key` discouraged for items that can reorder or be deleted?",
        options: [
          "It throws a fatal syntax error in Node.js",
          "It can cause component state to attach to the wrong DOM node during reordering or deletion",
          "Index keys exceed the maximum 32-bit integer limit",
          "React automatically deletes components with numeric keys"
        ],
        correctOption: 1,
        explanation: "Keys provide stable identities for virtual DOM reconciliation. Using array indices when items can reorder causes React to misidentify which items changed, producing subtle UI bugs."
      },
      {
        id: "react-q4",
        prompt: "Which hook should you use when multiple state variables need to update together or follow complex state transitions?",
        options: [
          "`useLayoutEffect`",
          "`useReducer`",
          "`useId`",
          "`useDeferredValue`"
        ],
        correctOption: 1,
        explanation: "`useReducer` is ideal for managing complex state logic where the next state depends on the previous state or involves multiple interrelated values."
      },
      {
        id: "react-q5",
        prompt: "What does the `useMemo` hook optimize in React?",
        options: [
          "It speeds up network download bandwidth",
          "It caches the result of an expensive calculation between re-renders unless dependencies change",
          "It automatically minifies JavaScript source code",
          "It caches HTTP responses in the browser cache storage"
        ],
        correctOption: 1,
        explanation: "`useMemo` memorizes calculated values to avoid expensive re-computations on every render when the input dependencies haven't changed."
      }
    ];
  } else if (t.includes("css") || t.includes("flex") || t.includes("grid")) {
    pool = [
      {
        id: "css-q1",
        prompt: "In CSS Flexbox, which property aligns items along the cross axis (vertical by default in a row)?",
        options: [
          "`justify-content`",
          "`align-items`",
          "`flex-direction`",
          "`order`"
        ],
        correctOption: 1,
        explanation: "`align-items` governs cross-axis alignment, whereas `justify-content` aligns items along the main axis."
      },
      {
        id: "css-q2",
        prompt: "What is the key advantage of CSS Grid over Flexbox for two-dimensional page layouts?",
        options: [
          "CSS Grid does not require HTML elements to render",
          "CSS Grid controls both rows and columns simultaneously, whereas Flexbox is primarily one-dimensional",
          "CSS Grid only works on desktop monitors",
          "CSS Grid converts all text into SVG vector paths"
        ],
        correctOption: 1,
        explanation: "CSS Grid is built for 2D layouts (rows and columns together), while Flexbox excels at 1D linear alignment (either a row OR a column)."
      },
      {
        id: "css-q3",
        prompt: "What does the CSS rule `box-sizing: border-box;` accomplish?",
        options: [
          "It removes borders from all HTML cards",
          "It includes padding and border within the element's total declared width and height",
          "It converts all block elements into flex items",
          "It forces the layout into a 3D isometric perspective"
        ],
        correctOption: 1,
        explanation: "Under `border-box`, padding and borders are factored into the element's declared width and height, preventing overflow and making responsive sizing predictable."
      }
    ];
  } else if (t.includes("ai") || t.includes("prompt") || t.includes("llm") || t.includes("automation")) {
    pool = [
      {
        id: "ai-q1",
        prompt: "What is 'hallucination' in Large Language Models (LLMs) and how is it best mitigated?",
        options: [
          "Hardware overheating in GPU clusters; mitigated by liquid cooling",
          "The model generating factually inaccurate assertions with high confidence; mitigated by Retrieval-Augmented Generation (RAG) and grounded prompts",
          "Token rate-limiting by API gateways; mitigated by exponential backoff",
          "Loss of Wi-Fi connection during streaming inference"
        ],
        correctOption: 1,
        explanation: "Hallucinations occur when LLMs extrapolate statistically plausible but factually wrong outputs. RAG supplies verified reference context to ground responses."
      },
      {
        id: "ai-q2",
        prompt: "Which prompt engineering technique involves providing 2–3 exemplar input-output pairs to guide the model's response structure?",
        options: [
          "Zero-shot prompting",
          "Few-shot prompting",
          "Chain of thought compression",
          "Context window pruning"
        ],
        correctOption: 1,
        explanation: "Few-shot prompting gives the model concrete examples of the desired format and reasoning style before asking it to solve the target task."
      },
      {
        id: "ai-q3",
        prompt: "In workflow automation platforms (like Make or Zapier), what is a webhook?",
        options: [
          "A physical cable connecting servers",
          "An HTTP callback triggered by an event in one application to send real-time data immediately to another",
          "A cron job that polls an API every 24 hours",
          "A CSS styling hook for dark mode toggles"
        ],
        correctOption: 1,
        explanation: "A webhook is an event-driven HTTP POST request that pushes data in real time as soon as an event occurs (e.g. payment verified on Paystack), eliminating polling delays."
      }
    ];
  }

  return {
    id: `client-quiz-${Date.now()}`,
    topic,
    difficulty,
    track,
    generatedAt: new Date().toISOString(),
    questions: pool.slice(0, safeCount)
  };
}

function generateClientFallbackStudyPlan(
  studentName: string,
  track: string,
  hoursPerWeek: number = 8,
  pace: "Accelerated" | "Standard" | "Flexible Weekend" = "Standard",
  targetGoal: string = "Launch First Full App / SaaS"
): AIStudyPlan {
  const isWeekend = pace === "Flexible Weekend";
  const isAccelerated = pace === "Accelerated";
  const numWeeks = isAccelerated ? 6 : isWeekend ? 12 : 10;
  const trackKey = track.toLowerCase();

  let trackTitle = "Full-Stack Web Development";
  let weeks: StudyPlanWeek[] = [];

  if (trackKey.includes("ai") || trackKey.includes("automation")) {
    trackTitle = "Generative AI & Automation";
    weeks = [
      {
        weekNumber: 1,
        title: "LLM Foundations & Prompt Engineering",
        focusArea: "Context windows, tokenization, system prompts, few-shot vs zero-shot formatting",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: isWeekend
          ? [
              { day: "Saturday Morning", task: "Study Gemini 2.5 architecture & prompt temperature controls", duration: "3 Hours" },
              { day: "Saturday Afternoon", task: "Build structured JSON extraction prompts in Google AI Studio", duration: "2 Hours" },
              { day: "Sunday Evening", task: "Complete Week 1 prompt evaluation benchmark and quiz", duration: "3 Hours" }
            ]
          : [
              { day: "Monday", task: "Explore LLM tokens, hallucinations, and system instructions", duration: "2 Hours" },
              { day: "Wednesday", task: "Design few-shot exemplars for structured JSON outputs", duration: "3 Hours" },
              { day: "Friday", task: "Prompt security & prompt injection defense workshop", duration: "3 Hours" }
            ],
        milestoneProject: "Automated customer email classification and structured triage prompt",
        labWorkstationTip: "Use Workstation 3 in the BEMS Lab for high-speed fiber access to Gemini API endpoints.",
        keySkills: ["Prompt Engineering", "Gemini 2.5 Flash", "JSON Mode"],
        checkpointQuizTopic: "Prompt Engineering & Structured Outputs"
      },
      {
        weekNumber: 2,
        title: "Workflow Automation with Make & Zapier",
        focusArea: "Webhooks, REST triggers, payload parsing, conditional routers, error retries",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: isWeekend
          ? [
              { day: "Saturday", task: "Set up Make.com scenarios triggered by Paystack webhook events", duration: "4 Hours" },
              { day: "Sunday", task: "Format automated WhatsApp notifications with Twilio integration", duration: "4 Hours" }
            ]
          : [
              { day: "Tuesday", task: "Configure inbound webhook listeners & test payload schemas", duration: "2.5 Hours" },
              { day: "Thursday", task: "Add Gemini API node for automated sentiment summarization", duration: "3 Hours" },
              { day: "Saturday", task: "End-to-end stress testing and Take AI Practice Quiz", duration: "2.5 Hours" }
            ],
        milestoneProject: "Zero-code invoice generation pipeline sending automated receipts upon payment",
        labWorkstationTip: "Set up Webhook.site on your browser tab to inspect raw headers before routing.",
        keySkills: ["Make.com", "Webhooks", "REST APIs"],
        checkpointQuizTopic: "Webhooks & Automation Architecture"
      },
      {
        weekNumber: 3,
        title: "Retrieval-Augmented Generation (RAG) & Embeddings",
        focusArea: "Text chunking strategies, vector embeddings, vector databases (Pinecone/Chroma), grounded search",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Wednesday", task: "Implement text chunking with overlap & generate embeddings", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Friday", task: "Query vector index and ground Gemini prompt with top-k snippets", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Interactive AI Knowledge Bot trained on custom BEMS course PDFs",
        labWorkstationTip: "Keep chunk size around 500 characters with 50-character overlap for optimal recall.",
        keySkills: ["Vector Embeddings", "RAG Architecture", "Vector Search"],
        checkpointQuizTopic: "RAG & Vector Retrieval"
      },
      {
        weekNumber: 4,
        title: "Autonomous AI Agents & Tool Calling",
        focusArea: "Function calling (tools), multi-agent loops, stateful conversations, memory management",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Tuesday", task: "Define OpenAPI JSON tool schemas for real-time weather and currency APIs", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Thursday", task: "Build autonomous agent loop that executes tools and synthesizes final answer", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Autonomous Nigerian Market Research Agent executing live currency conversions",
        labWorkstationTip: "Inspect raw tool_call objects in console to verify arguments before model execution.",
        keySkills: ["Function Calling", "Tool Calling", "Autonomous Loops"],
        checkpointQuizTopic: "AI Agents & Function Calling"
      }
    ];
  } else if (trackKey.includes("design") || trackKey.includes("ui") || trackKey.includes("graphic")) {
    trackTitle = "UI/UX & Product Design";
    weeks = [
      {
        weekNumber: 1,
        title: "Design Thinking, User Personas & Wireframing",
        focusArea: "User journey mapping, low-fidelity wireframing, information architecture, Figma basics",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: isWeekend
          ? [
              { day: "Saturday", task: "Interview 2 students & draft empathy maps and user personas", duration: "4 Hours" },
              { day: "Sunday", task: "Sketch paper wireframes & create 8-screen wireframe flow in Figma", duration: "4 Hours" }
            ]
          : [
              { day: "Monday", task: "User research methods and pain-point identification", duration: "2 Hours" },
              { day: "Wednesday", task: "Low-fidelity wireframing for mobile fintech app", duration: "3 Hours" },
              { day: "Friday", task: "Peer critique session in BEMS Design Studio", duration: "3 Hours" }
            ],
        milestoneProject: "Complete UX case study wireframe for a local student food delivery app",
        labWorkstationTip: "Review wireframes at 100% zoom scale on mobile devices via Figma Mirror app.",
        keySkills: ["Figma Wireframes", "UX Research", "Information Architecture"],
        checkpointQuizTopic: "Design Thinking & Wireframing"
      },
      {
        weekNumber: 2,
        title: "Figma Auto-Layout & Design Systems",
        focusArea: "Auto-layout nested frames, responsive constraints, typography scales, color token architecture",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: isWeekend
          ? [
              { day: "Saturday", task: "Build modular component library (buttons, cards, navigation bars)", duration: "4 Hours" },
              { day: "Sunday", task: "Configure Figma component variants, boolean props, and instance swap", duration: "4 Hours" }
            ]
          : [
              { day: "Tuesday", task: "Figma Auto-Layout horizontal and vertical resizing behaviors", duration: "2.5 Hours" },
              { day: "Thursday", task: "Establishing 8pt grid system and accessible WCAG color contrast", duration: "3 Hours" },
              { day: "Saturday", task: "Responsive component stress testing across 375px and 1440px", duration: "2.5 Hours" }
            ],
        milestoneProject: "High-class UI Component Design System with 20+ production-ready variants",
        labWorkstationTip: "Check color contrast using the Stark Figma plugin to ensure AAA accessibility.",
        keySkills: ["Figma Auto-Layout", "Design Tokens", "Design Systems"],
        checkpointQuizTopic: "Auto-Layout & Design Tokens"
      },
      {
        weekNumber: 3,
        title: "Interactive Prototyping & Micro-Interactions",
        focusArea: "Smart Animate, interactive components, hover/press states, prototype page transitions",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Wednesday", task: "Build interactive modals, bottom sheets, and animated card transitions", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Friday", task: "Conduct prototype usability tests and record user interaction heatmaps", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Clickable, high-fidelity mobile banking prototype with realistic pin checkout",
        labWorkstationTip: "Use Smart Animate with 300ms ease-out timing curve for natural-feeling animations.",
        keySkills: ["Smart Animate", "Interactive Prototyping", "Usability Testing"],
        checkpointQuizTopic: "Prototyping & Micro-Interactions"
      },
      {
        weekNumber: 4,
        title: "Developer Handoff & Capstone Design Showcase",
        focusArea: "Design tokens export, CSS inspection, asset exporting (SVG/WebP), Behance case study formatting",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Tuesday", task: "Annotate design specs for Next.js developers (margins, paddings, tokens)", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Thursday", task: "Publish polished Behance presentation and present to lead instructor", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Complete Behance-ready UI/UX Portfolio Case Study with live prototype link",
        labWorkstationTip: "Export SVGs with outline strokes and optimized paths to minimize web bundle size.",
        keySkills: ["Developer Handoff", "Design Specs", "Portfolio Presentation"],
        checkpointQuizTopic: "Developer Handoff & Specifications"
      }
    ];
  } else if (trackKey.includes("cyber") || trackKey.includes("security")) {
    trackTitle = "Cybersecurity Defense";
    weeks = [
      {
        weekNumber: 1,
        title: "Linux Foundations & Network Fundamentals",
        focusArea: "Linux CLI, file permissions, TCP/IP stack, DNS resolution, Wireshark packet capture",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: isWeekend
          ? [
              { day: "Saturday", task: "Master Linux terminal commands, SSH keys, and user permissions", duration: "4 Hours" },
              { day: "Sunday", task: "Capture and analyze HTTP vs HTTPS packets using Wireshark", duration: "4 Hours" }
            ]
          : [
              { day: "Monday", task: "Linux administration, chmod, chown, and process management", duration: "2 Hours" },
              { day: "Wednesday", task: "OSI model layers and TCP handshake analysis", duration: "3 Hours" },
              { day: "Friday", task: "Hands-on packet filtering and network subnetting lab", duration: "3 Hours" }
            ],
        milestoneProject: "Hardened Ubuntu server sandbox with custom firewall rules and SSH keys",
        labWorkstationTip: "Practice on BEMS Isolated Lab Network 2 to safely run network scans.",
        keySkills: ["Linux CLI", "Wireshark", "TCP/IP"],
        checkpointQuizTopic: "Linux & Networking Fundamentals"
      },
      {
        weekNumber: 2,
        title: "Web Security & OWASP Top 10 Defenses",
        focusArea: "SQL injection, Cross-Site Scripting (XSS), CSRF tokens, secure session management",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: isWeekend
          ? [
              { day: "Saturday", task: "Exploit and remediate SQL injection in intentionally vulnerable lab app", duration: "4 Hours" },
              { day: "Sunday", task: "Implement Content Security Policy (CSP) and sanitization headers", duration: "4 Hours" }
            ]
          : [
              { day: "Tuesday", task: "Analyze Reflected vs Stored XSS attack vectors", duration: "2.5 Hours" },
              { day: "Thursday", task: "SQL query parameterization and ORM vulnerability audit", duration: "3 Hours" },
              { day: "Saturday", task: "Take AI Practice Quiz on OWASP Top 10 standards", duration: "2.5 Hours" }
            ],
        milestoneProject: "Comprehensive vulnerability assessment report with proof-of-concept remediation",
        labWorkstationTip: "Always run Burp Suite proxy on port 8080 with scope limited to localhost.",
        keySkills: ["OWASP Top 10", "Input Sanitization", "Burp Suite"],
        checkpointQuizTopic: "Web Application Security & OWASP"
      },
      {
        weekNumber: 3,
        title: "Vulnerability Scanning & Penetration Testing",
        focusArea: "Nmap port scanning, vulnerability discovery, Nessus/OpenVAS audits, CVE analysis",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Wednesday", task: "Run structured Nmap syn-scans and service version detection", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Friday", task: "Draft executive summary and technical vulnerability matrix", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Executive penetration test report simulating an audit of a fintech banking gateway",
        labWorkstationTip: "Verify target IP addresses before starting scans to avoid unapproved network traffic.",
        keySkills: ["Nmap", "Vulnerability Scanning", "CVE Analysis"],
        checkpointQuizTopic: "Penetration Testing & Port Scanning"
      },
      {
        weekNumber: 4,
        title: "Defensive Security, Incident Response & Capstone",
        focusArea: "SIEM logging, intrusion detection, auth rate limiting, incident response playbooks",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Tuesday", task: "Configure fail2ban, rate limiting, and automated IP ban rules", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Thursday", task: "Present incident response post-mortem to BEMS security faculty", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Full security audit handbook and live production defensive firewall configuration",
        labWorkstationTip: "Review /var/log/auth.log to inspect simulated brute-force attempt captures.",
        keySkills: ["Fail2ban", "SIEM Logging", "Incident Response"],
        checkpointQuizTopic: "Defensive Security & Incident Response"
      }
    ];
  } else {
    // Default: Full-Stack Web Development
    trackTitle = "Full-Stack Web Development";
    weeks = [
      {
        weekNumber: 1,
        title: "Development Environment & Semantic Foundations",
        focusArea: "Workstation setup, VS Code extensions, Git workflow & HTML5 semantic architecture",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: isWeekend
          ? [
              { day: "Saturday Morning", task: "Watch Module 1 lessons & set up local lab tools and git", duration: "3 Hours" },
              { day: "Saturday Afternoon", task: "Build initial semantic layout exercises and forms", duration: "2 Hours" },
              { day: "Sunday Evening", task: "Git commit exercises & take Week 1 self-quiz", duration: "3 Hours" }
            ]
          : [
              { day: "Monday", task: "Watch Lesson 1 & configure VS Code workspace with Prettier and ESLint", duration: "2 Hours" },
              { day: "Wednesday", task: "Practical lab exercises on semantic HTML5 architecture and accessibility", duration: "3 Hours" },
              { day: "Friday", task: "Review with Mr. Victor & submit Module 1 check-in", duration: "3 Hours" }
            ],
        milestoneProject: "Personal developer portfolio skeleton with semantic HTML5 and Git history",
        labWorkstationTip: "Workstation B2 is pre-configured with Node.js v20 LTS and GitHub Desktop.",
        keySkills: ["HTML5 Semantics", "Git & GitHub", "VS Code"],
        checkpointQuizTopic: "Semantic HTML & Git Foundations"
      },
      {
        weekNumber: 2,
        title: "Modern Layouts & Responsive Breakpoints",
        focusArea: "CSS Flexbox, CSS Grid, mobile-first responsive design (375px to 1440px+)",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: isWeekend
          ? [
              { day: "Saturday", task: "Master flexbox navigation & 2D Grid card systems", duration: "4 Hours" },
              { day: "Sunday", task: "Test fluid media queries on mobile and tablet screens", duration: "4 Hours" }
            ]
          : [
              { day: "Tuesday", task: "Flexbox container & item properties in Chrome DevTools", duration: "2.5 Hours" },
              { day: "Thursday", task: "CSS Grid template areas and auto-fit minmax() systems", duration: "3 Hours" },
              { day: "Saturday", task: "Mobile breakpoint testing & Take AI Practice Quiz", duration: "2.5 Hours" }
            ],
        milestoneProject: "Fully responsive multi-card product showcase page with responsive navbar",
        labWorkstationTip: "Always test in Chrome DevTools Device Mode at 375px before styling larger desktop views.",
        keySkills: ["CSS Flexbox", "CSS Grid", "Responsive Design"],
        checkpointQuizTopic: "CSS Flexbox & Responsive Grid"
      },
      {
        weekNumber: 3,
        title: "Modern JavaScript (ES6+) & DOM Interaction",
        focusArea: "Arrow functions, array methods (map, filter, reduce), destructuring, event listeners",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Tuesday", task: "Hands-on ES6+ syntax drills, closures, and object destructuring", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Thursday", task: "Dynamic DOM manipulation: dynamic cart counter and item filters", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Interactive task manager with local storage persistence and filter chips",
        labWorkstationTip: "Open the browser Console tab to inspect event bubbling and target objects.",
        keySkills: ["JavaScript ES6+", "DOM Events", "LocalStorage"],
        checkpointQuizTopic: "JavaScript ES6+ & DOM Events"
      },
      {
        weekNumber: 4,
        title: "Async JavaScript, REST APIs & Paystack Integration",
        focusArea: "Promises, async/await, fetch API, handling JSON payloads, payment popup triggers",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Wednesday", task: "Asynchronous JavaScript & handling live REST endpoint responses", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Friday", task: "Connecting live endpoints with Paystack test popup triggers", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Interactive event ticket booking modal with live pricing and Paystack checkout trigger",
        labWorkstationTip: "Use Paystack test secret keys in .env.local; never commit secret keys to Git.",
        keySkills: ["Async/Await", "Fetch API", "Paystack Checkout"],
        checkpointQuizTopic: "Async JavaScript & REST APIs"
      },
      {
        weekNumber: 5,
        title: "React Fundamentals, Components & State",
        focusArea: "JSX syntax, props vs state, useState, useEffect, custom hooks, component lifecycles",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Tuesday", task: "Deconstruct UI into reusable functional components and pass props", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Thursday", task: "State management with useState and useEffect data fetching", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Multi-step interactive onboarding and subscription selector in React",
        labWorkstationTip: "Install React Developer Tools extension in Chrome to inspect component props live.",
        keySkills: ["React 19", "useState", "useEffect"],
        checkpointQuizTopic: "React Components & Hooks"
      },
      {
        weekNumber: 6,
        title: "Next.js App Router, Tailwind & Capstone Launch",
        focusArea: "Server vs Client Components, routing, Tailwind CSS utility classes, Vercel deployment",
        estimatedHours: hoursPerWeek,
        dailyBreakdown: [
          { day: isWeekend ? "Saturday" : "Wednesday", task: "Build Next.js pages with Tailwind styling and dynamic routes", duration: `${Math.ceil(hoursPerWeek / 2)} Hours` },
          { day: isWeekend ? "Sunday" : "Friday", task: "Deploy production build to Vercel and present Capstone to Mr. Victor", duration: `${Math.floor(hoursPerWeek / 2)} Hours` }
        ],
        milestoneProject: "Live BEMS Capstone Web Application deployed with 100% Lighthouse score",
        labWorkstationTip: "Run npm run build locally before pushing to Vercel to catch TypeScript errors early.",
        keySkills: ["Next.js App Router", "Tailwind CSS", "Vercel Deployment"],
        checkpointQuizTopic: "Next.js & Production Deployment"
      }
    ];
  }

  return {
    id: `plan-${Date.now()}`,
    studentName,
    trackTitle,
    hoursPerWeek,
    totalWeeks: numWeeks,
    learningPace: pace,
    createdAt: new Date().toISOString(),
    tutorTip: `Consistency beats cramming! In the BEMS Umuahia lab, students who spend ${hoursPerWeek} focused hours every week finish their capstones 3 weeks ahead of schedule.`,
    estimatedGraduation: isAccelerated ? "6 Weeks from today" : "12 Weeks from today",
    levelBadge: "Level 1: Code Cadet 🛡️",
    targetGoal,
    weeks
  };
}

function AIHubContent() {
  const searchParams = useSearchParams();
  const { user, getCourseProgress } = useLMS();
  const initialTab = searchParams.get("tab") || "tutor";
  const initialCourse = searchParams.get("courseId") || searchParams.get("course") || "web-dev";
  const initialLessonTitle = searchParams.get("lessonTitle") || "";

  const [activeTab, setActiveTab] = useState<"tutor" | "quiz" | "study-plan" | "feedback" | "recommendations">(
    (initialTab as any) || "tutor"
  );

  // 1. AI Tutor State
  const [tutorName, setTutorName] = useState(
    initialCourse === "ai-automation"
      ? "Dr. Amaka"
      : initialCourse === "digital-marketing"
      ? "Mrs. Funke"
      : initialCourse === "graphic-design"
      ? "Mr. Tunde"
      : "Mr. Victor"
  );
  const [track, setTrack] = useState(initialCourse);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorMessages, setTutorMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: initialLessonTitle
        ? `Hello! I see you're studying "${initialLessonTitle}". Ask me to explain any concept from this lesson, walk through code examples, or test you with a quick question!`
        : "Hello! I'm Mr. Victor Okeke, Lead Web Development Instructor at BEMS Institute of Technology. What are you building or debugging today? Ask me any question about HTML, CSS, JavaScript, Next.js, or your capstone!",
      timestamp: "Just now"
    }
  ]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(
    initialLessonTitle
      ? [
          `Explain "${initialLessonTitle}" simply with a real-world analogy`,
          `Give me a practical code example for "${initialLessonTitle}"`,
          `Quiz me with 1 question on "${initialLessonTitle}"`
        ]
      : [
          "How do I center a div using CSS Flexbox vs Grid?",
          "Explain async/await with a real Paystack API fetch example",
          "What are the requirements to pass the Capstone project?"
        ]
  );
  const [ragSources, setRagSources] = useState<
    { id: string; title: string; sourceType: string; lessonUrl?: string }[]
  >([]);
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);

  // 2. Quiz Generator State
  const [quizTrack, setQuizTrack] = useState<string>("web-dev");
  const [quizTopic, setQuizTopic] = useState("Modern JavaScript & ES6");
  const [quizDifficulty, setQuizDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [quizCount, setQuizCount] = useState<number>(3);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizError, setQuizError] = useState<string | null>(null);

  // 3. Study Plan State
  const [studentName, setStudentName] = useState(user?.name || "Chinedu Okeke");
  const [studyHours, setStudyHours] = useState(8);
  const [studyPace, setStudyPace] = useState<"Accelerated" | "Standard" | "Flexible Weekend">("Standard");
  const [studyTrack, setStudyTrack] = useState<string>("web-dev");
  const [targetGoal, setTargetGoal] = useState<string>("Launch First Full App / SaaS");
  const [studyPlan, setStudyPlan] = useState<AIStudyPlan | null>(null);
  const [isStudyLoading, setIsStudyLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | "all">("all");

  useEffect(() => {
    if (studyPlan?.id && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`bems_study_tasks_${studyPlan.id}`);
        if (stored) {
          setCompletedTasks(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [studyPlan?.id]);

  const toggleTaskCompletion = (taskKey: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskKey]: !prev[taskKey] };
      if (typeof window !== "undefined" && studyPlan?.id) {
        try {
          localStorage.setItem(`bems_study_tasks_${studyPlan.id}`, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (user?.name) {
      setStudentName(user.name);
    }
  }, [user?.name]);

  // 4. Code Feedback State
  const [codeSubmission, setCodeSubmission] = useState(
    `// BEMS Capstone Submission\n// GitHub: https://github.com/chinedu/bems-ecommerce\n// Live Demo: https://bems-store.vercel.app\n\nasync function verifyPayment(reference) {\n  const res = await fetch('/api/verify?ref=' + reference);\n  return res.json();\n}`
  );
  const [feedbackResult, setFeedbackResult] = useState<AIFeedbackResult | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // 5. Recommendations State
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "recommendations" && recommendations.length === 0) {
      loadRecommendations();
    }
  }, [activeTab]);

  // Handler: Tutor Send
  const handleSendTutorMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || tutorInput.trim();
    if (!textToSend || isTutorLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setTutorMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setTutorInput("");
    setIsTutorLoading(true);

    try {
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tutor",
          prompt: textToSend,
          courseTrack: track,
          tutorName: tutorName,
          history: tutorMessages
        })
      });

      if (!res.ok) throw new Error("Tutor failed to respond");
      const data = await res.json();

      const botMsg: AIChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setTutorMessages((prev) => [...prev, botMsg]);
      if (data.suggestedPrompts && data.suggestedPrompts.length > 0) {
        setSuggestedPrompts(data.suggestedPrompts);
      }
      if (Array.isArray(data.ragSources)) {
        setRagSources(data.ragSources);
      }
      if (Array.isArray(data.weakConcepts)) {
        setWeakConcepts(data.weakConcepts);
      }
    } catch (err) {
      console.error(err);
      setTutorMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          content: "I ran into a temporary connection issue. Please check your internet connection and try asking again.",
          timestamp: "Just now"
        }
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // Handler: Generate Quiz
  const handleGenerateQuiz = async (overrideTopic?: string) => {
    const topicToUse = (overrideTopic || quizTopic).trim();
    if (!topicToUse) return;

    setIsQuizLoading(true);
    setQuizError(null);
    setGeneratedQuiz(null);
    setQuizAnswers({});
    setShowQuizResults(false);
    setQuizQuestionIndex(0);

    const trackLabel = TRACK_PRESETS[quizTrack]?.label || "Web Development";

    try {
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quiz",
          topic: topicToUse,
          difficulty: quizDifficulty,
          count: quizCount,
          track: trackLabel
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedQuiz(data);
      } else {
        // Seamless fallback for guests/unauthenticated or cold-starting servers
        const fallbackQuiz = generateClientFallbackQuiz(topicToUse, quizDifficulty, quizCount, trackLabel);
        setGeneratedQuiz(fallbackQuiz);
      }
    } catch {
      // Seamless fallback for offline or network issues
      const fallbackQuiz = generateClientFallbackQuiz(topicToUse, quizDifficulty, quizCount, trackLabel);
      setGeneratedQuiz(fallbackQuiz);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Handler: Ask AI Tutor about missed or tricky question
  const handleAskTutorAboutQuestion = (q: any, selectedOptionIndex?: number) => {
    const selectedText =
      selectedOptionIndex !== undefined && q.options[selectedOptionIndex]
        ? `I chose option (${String.fromCharCode(65 + selectedOptionIndex)}): "${q.options[selectedOptionIndex]}"`
        : "I wasn't sure how to answer";

    const promptText = `Hi ${tutorName}, I was taking a practice quiz on "${generatedQuiz?.topic || quizTopic}" and encountered this question:

> **"${q.prompt}"**

${selectedText}, but the correct answer is option (${String.fromCharCode(65 + q.correctOption)}): "${q.options[q.correctOption]}".

Could you please explain the concept in simple terms, why the correct answer is right, and what mental model I should use so I never miss this on the official Capstone?`;

    setActiveTab("tutor");
    handleSendTutorMessage(promptText);
  };

  // Handler: Generate Study Plan
  const handleGenerateStudyPlan = async () => {
    setIsStudyLoading(true);
    const trackTitle =
      studyTrack === "ai-automation"
        ? "Generative AI & Automation"
        : studyTrack === "graphic-design"
        ? "UI/UX & Product Design"
        : studyTrack === "cybersecurity"
        ? "Cybersecurity Defense"
        : "Full-Stack Web Development";

    try {
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "study-plan",
          studentName,
          trackTitle,
          hoursPerWeek: studyHours,
          learningPace: studyPace,
          targetGoal
        })
      });

      if (!res.ok) throw new Error("Plan generation returned non-200");
      const data = await res.json();
      setStudyPlan(data);
      setCompletedTasks({});
    } catch (err) {
      console.warn("Backend study plan generation failed, using intelligent client curriculum fallback:", err);
      const fallback = generateClientFallbackStudyPlan(
        studentName,
        studyTrack,
        studyHours,
        studyPace,
        targetGoal
      );
      setStudyPlan(fallback);
      setCompletedTasks({});
    } finally {
      setIsStudyLoading(false);
    }
  };

  const handleAskTutorAboutWeek = (week: StudyPlanWeek) => {
    const mentorMap: Record<string, string> = {
      "web-dev": "Mr. Victor",
      "ai-automation": "Dr. Amaka",
      "graphic-design": "Mr. Tunde",
      "cybersecurity": "Specialist Faculty"
    };
    const targetMentor = mentorMap[studyTrack] || tutorName;
    setTutorName(targetMentor);
    setTrack(studyTrack);

    const promptText = `Hi ${targetMentor}, I'm working on Week ${week.weekNumber} of my study plan: "${week.title}" (${week.focusArea}).

My milestone deliverable is: "${week.milestoneProject}".
Workstation Tip: "${week.labWorkstationTip || 'Hands-on workstation practice'}".

Can you give me practical advice, common rookie mistakes to avoid, and step-by-step guidance on how to complete this week's milestone with distinction?`;

    setActiveTab("tutor");
    handleSendTutorMessage(promptText);
  };

  const handleTestWeekQuiz = (week: StudyPlanWeek) => {
    setQuizTopic(week.checkpointQuizTopic || week.title);
    setQuizTrack(studyTrack);
    setActiveTab("quiz");
  };

  const handleDownloadCalendar = () => {
    if (!studyPlan) return;
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

    const events = studyPlan.weeks.map((week, idx) => {
      const weekStart = new Date(now.getTime() + idx * 7 * 24 * 60 * 60 * 1000);
      const startStr = `${weekStart.getUTCFullYear()}${pad(weekStart.getUTCMonth() + 1)}${pad(weekStart.getUTCDate())}T090000Z`;
      const endStr = `${weekStart.getUTCFullYear()}${pad(weekStart.getUTCMonth() + 1)}${pad(weekStart.getUTCDate())}T110000Z`;

      return `BEGIN:VEVENT
UID:bems-week-${week.weekNumber}-${studyPlan.id}@bems.edu.ng
DTSTAMP:${stamp}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:BEMS Study: Week ${week.weekNumber} - ${week.title}
DESCRIPTION:${week.focusArea}. Milestone: ${week.milestoneProject}.
LOCATION:BEMS Umuahia Tech Lab / Online Workstation
END:VEVENT`;
    }).join("\n");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BEMS Institute of Technology//AI Study Architect//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:BEMS Study Roadmap - ${studentName}
${events}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BEMS_Study_Schedule_${studentName.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler: Code Feedback
  const handleEvaluateCode = async () => {
    setIsFeedbackLoading(true);
    try {
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "feedback",
          submissionContent: codeSubmission,
          track: "Web Development"
        })
      });

      if (!res.ok) throw new Error("Evaluation failed");
      const data = await res.json();
      setFeedbackResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  // Handler: Recommendations
  const loadRecommendations = async () => {
    setIsRecsLoading(true);
    try {
      const liveProgress = getCourseProgress(track)?.percent || 50;
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recommendations",
          courseId: track,
          progressPercent: liveProgress,
          quizScore: 88
        })
      });

      if (!res.ok) throw new Error("Recommendations failed");
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="max-w-7xl mx-auto w-full flex-1 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-navy via-brand-dark to-purple-900 text-white p-6 sm:p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-purple/30 border border-brand-purple/40 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BEMS AI Academic Suite • Phase 4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              AI Technical Tutor &amp; Learning Companion
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-purple-100/90 leading-relaxed">
              Powered by Google Gemini and custom-trained on the BEMS FutureSkills curriculum. Get 24/7 technical tutoring, custom practice quizzes, pre-submission capstone audits, and personalized study roadmaps.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-gray-200 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("tutor")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "tutor"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Tutor Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "quiz"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI Quiz Generator</span>
          </button>

          <button
            onClick={() => setActiveTab("study-plan")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "study-plan"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>AI Study Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "feedback"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Capstone Pre-Review</span>
          </button>

          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "recommendations"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Personalized Next Steps</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AI TUTOR CHAT */}
        {/* ========================================================================= */}
        {activeTab === "tutor" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                <h3 className="font-bold text-brand-dark text-sm flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-brand-purple" />
                  <span>Choose Faculty Persona</span>
                </h3>

                <div className="space-y-2">
                  {[
                    { name: "Mr. Victor", role: "Web Dev & Next.js Lead", avatar: "VO" },
                    { name: "Timi", role: "AI & Automation Engineer", avatar: "TA" },
                    { name: "Temi", role: "UI/UX Product Design Lead", avatar: "TE" },
                    { name: "Specialist Faculty", role: "Cybersecurity Auditor", avatar: "SF" }
                  ].map((tutor) => (
                    <button
                      key={tutor.name}
                      onClick={() => setTutorName(tutor.name)}
                      className={`w-full text-left p-3 rounded-xl flex items-center space-x-3 transition-all ${
                        tutorName === tutor.name
                          ? "bg-brand-purple/10 border-2 border-brand-purple text-brand-dark"
                          : "bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {tutor.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{tutor.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{tutor.role}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block mb-2">Subject Context</label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                  >
                    <option value="web-dev">Full-Stack Web Development</option>
                    <option value="ai-prompt">AI & Prompt Engineering</option>
                    <option value="ui-ux">UI/UX Product Design</option>
                    <option value="cybersecurity">Cybersecurity & Defense</option>
                  </select>
                </div>
              </div>

              {/* Fast Prompt Suggestions */}
              <div className="bg-brand-lavender/30 rounded-2xl p-5 border border-brand-purple/10 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-brand-navy">
                  <Lightbulb className="w-4 h-4 text-brand-purple" />
                  <span>Suggested Questions</span>
                </div>
                <div className="space-y-2">
                  {suggestedPrompts.map((promptText, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendTutorMessage(promptText)}
                      className="w-full text-left p-2.5 rounded-lg bg-white border border-brand-purple/10 text-xs text-gray-700 hover:border-brand-purple hover:text-brand-purple transition-colors shadow-2xs"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Conversation Area */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col h-[560px] sm:h-[650px] overflow-hidden order-1 lg:order-2">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-brand-dark">{tutorName} (BEMS AI Tutor)</h3>
                    <p className="text-[11px] text-gray-500">October 2026 Cohort • Active Workspace</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setTutorMessages([
                      {
                        id: "welcome-reset",
                        role: "assistant",
                        content: `Hello! I am ${tutorName}. How can I assist your coding journey today?`,
                        timestamp: "Just now"
                      }
                    ])
                  }
                  className="text-xs text-gray-400 hover:text-brand-purple flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear Chat</span>
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {tutorMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.role === "user" ? "bg-brand-purple text-white" : "bg-brand-navy text-white"
                      }`}
                    >
                      {msg.role === "user" ? "ME" : tutorName.substring(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-xs ${
                        msg.role === "user"
                          ? "bg-brand-navy text-white rounded-tr-none"
                          : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                      ) : (
                        <ChatMarkdown content={msg.content} />
                      )}
                      <span className={`block text-[10px] mt-2 ${msg.role === "user" ? "text-purple-200" : "text-gray-400"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isTutorLoading && (
                  <div className="flex items-center space-x-3 text-gray-400 text-xs py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
                    <span>{tutorName} is thinking and formulating guidance...</span>
                  </div>
                )}
                {ragSources.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-purple-50/70 border border-brand-purple/20 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Grounded in BEMS Course Material (RAG)
                      </span>
                      {weakConcepts.length > 0 && (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Targeting weak concepts: {weakConcepts.join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ragSources.map((src) =>
                        src.lessonUrl ? (
                          <a
                            key={src.id}
                            href={src.lessonUrl}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-brand-purple/20 text-brand-dark hover:border-brand-purple hover:text-brand-purple font-medium transition-colors"
                          >
                            📖 {src.title} &rarr;
                          </a>
                        ) : (
                          <span
                            key={src.id}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700"
                          >
                            📝 {src.title}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* LearnIQ Pedagogical Quick-Action Pills + Input Box */}
              <div className="p-4 border-t border-gray-100 bg-white space-y-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    {
                      label: "Explain simpler",
                      prompt: "Explain that last concept in simpler beginner terms using a real-world analogy."
                    },
                    {
                      label: "Give me an example",
                      prompt: "Give me a clean, practical code example I can run in the BEMS Sandbox."
                    },
                    {
                      label: "Quiz me",
                      prompt: "Ask me 1 quick diagnostic question on this concept to test my understanding."
                    },
                    {
                      label: "Give me a hint",
                      prompt: "Give me a step-by-step hint without revealing the full answer right away."
                    },
                    {
                      label: "Show me where I went wrong",
                      prompt: "Based on my weak concepts and quiz history, show me where I might be going wrong and how to fix my mental model."
                    }
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      disabled={isTutorLoading}
                      onClick={() => handleSendTutorMessage(action.prompt)}
                      className="px-3 py-1.5 rounded-full bg-brand-lavender/50 hover:bg-brand-purple hover:text-white border border-brand-purple/20 text-brand-dark text-xs font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendTutorMessage();
                  }}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="text"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    placeholder={`Ask ${tutorName} a technical question (e.g. Next.js, CSS Flexbox, APIs)...`}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40"
                    disabled={isTutorLoading}
                  />
                  <Button
                    type="submit"
                    variant="purple"
                    disabled={isTutorLoading || !tutorInput.trim()}
                    className="shrink-0 px-5"
                  >
                    {isTutorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI QUIZ GENERATOR */}
        {/* ========================================================================= */}
        {activeTab === "quiz" && (
          <div className="bg-white rounded-3xl border border-[#F1E2F5] shadow-xs p-6 md:p-8 space-y-8">
            {/* Top Generator Configuration Card */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-2xl bg-purple-50 text-[#AE54C6] border border-purple-200/60 shadow-2xs">
                    <BrainCircuit className="w-6 h-6" />
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#303654]">
                      Dynamic Practice Quiz Generator
                    </h2>
                    <p className="text-xs sm:text-sm text-[#645F80]">
                      Generate syllabus-aligned, interactive exam questions to test your comprehension before official Capstones.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 text-[#AE54C6] border border-purple-200 text-xs font-bold shadow-2xs self-start sm:self-auto shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#AE54C6]" />
                  <span>Powered by Gemini 2.5 Flash</span>
                </span>
              </div>

              {!user && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/90 to-amber-50/60 border border-purple-200/70 text-xs font-semibold text-[#4A4568] shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">🎓</span>
                    <span>
                      <strong>Guest Practice Mode:</strong> You can generate and take practice quizzes freely!
                    </span>
                  </div>
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-1 font-bold text-[#AE54C6] hover:text-[#913ea9] shrink-0 underline"
                  >
                    <span>Sign in to save scores &amp; earn XP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                {/* Track Selector */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Course Track
                  </label>
                  <select
                    value={quizTrack}
                    onChange={(e) => {
                      const newTrack = e.target.value;
                      setQuizTrack(newTrack);
                      const firstPreset = TRACK_PRESETS[newTrack]?.topics[0];
                      if (firstPreset) setQuizTopic(firstPreset);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] bg-white text-xs font-semibold text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30 shadow-2xs"
                  >
                    <option value="web-dev">Full-Stack Web Development</option>
                    <option value="ai-automation">Applied AI &amp; Automation</option>
                    <option value="product-design">Product Design (UI/UX)</option>
                    <option value="cybersecurity">Cybersecurity &amp; Defense</option>
                  </select>
                </div>

                {/* Difficulty Selector */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setQuizDifficulty(diff)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                          quizDifficulty === diff
                            ? "bg-[#AE54C6] text-white border-[#AE54C6] shadow-xs"
                            : "bg-[#FAF8FF] text-[#645F80] border-[#F1E2F5] hover:border-purple-200 hover:bg-white"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count Selector */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Question Count
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { count: 3, label: "3 Sprint" },
                      { count: 5, label: "5 Standard" },
                      { count: 10, label: "10 Exam" }
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setQuizCount(item.count)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                          quizCount === item.count
                            ? "bg-[#303654] text-white border-[#303654] shadow-xs"
                            : "bg-[#FAF8FF] text-[#645F80] border-[#F1E2F5] hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic Input with Quick Preset Chips */}
                <div className="md:col-span-12 space-y-2">
                  <label className="block text-xs font-bold text-[#303654]">
                    Topic or Specific Concept
                  </label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="e.g. React Hooks, CSS Flexbox, Next.js SSR, Paystack Webhooks, SQL Joins..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F1E2F5] text-sm text-[#303654] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30 shadow-2xs"
                  />

                  {/* Syllabus Topic Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-bold text-[#8580A3] mr-1">
                      Quick Topics:
                    </span>
                    {(TRACK_PRESETS[quizTrack]?.topics || TRACK_PRESETS["web-dev"].topics).map((topicItem) => {
                      const isSelected = quizTopic.trim().toLowerCase() === topicItem.toLowerCase();
                      return (
                        <button
                          key={topicItem}
                          type="button"
                          onClick={() => setQuizTopic(topicItem)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-100 text-[#AE54C6] border-purple-300 font-bold"
                              : "bg-white text-[#645F80] border-[#F1E2F5] hover:border-purple-200 hover:text-[#AE54C6]"
                          }`}
                        >
                          {topicItem}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="purple"
                  onClick={() => handleGenerateQuiz()}
                  disabled={isQuizLoading || !quizTopic.trim()}
                  className="font-bold shadow-md text-xs px-6 py-2.5"
                >
                  {isQuizLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Synthesizing Questions with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span>Generate Practice Quiz</span>
                    </>
                  )}
                </Button>

                {generatedQuiz && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedQuiz(null);
                      setQuizAnswers({});
                      setShowQuizResults(false);
                      setQuizQuestionIndex(0);
                    }}
                    className="bg-white text-[#303654] font-bold text-xs shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#AE54C6]" />
                    <span>Reset Quiz</span>
                  </Button>
                )}
              </div>

              {quizError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center justify-between">
                  <span>{quizError}</span>
                  <button
                    type="button"
                    onClick={() => handleGenerateQuiz()}
                    className="underline text-red-900 font-black"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* ================================================================= */}
            {/* ACTIVE QUIZ RUNNER (STEP-BY-STEP OR ALL QUESTIONS) */}
            {/* ================================================================= */}
            {generatedQuiz && !showQuizResults && (
              <div className="pt-6 border-t border-[#F7EDF9] space-y-6">
                {/* Quiz Header & Progress Bar */}
                <div className="bg-[#FAF8FF] p-5 rounded-2xl border border-[#F1E2F5] space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-[#AE54C6] border border-purple-200 font-bold">
                          {generatedQuiz.track}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white text-[#303654] border border-[#F1E2F5] font-bold">
                          {generatedQuiz.difficulty}
                        </span>
                        <span className="text-xs text-[#8580A3] font-semibold">
                          {generatedQuiz.questions.length} Questions
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#303654]">
                        {generatedQuiz.topic}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#AE54C6] block">
                        {Object.keys(quizAnswers).length} of {generatedQuiz.questions.length} Answered
                      </span>
                      <span className="text-[11px] text-[#8580A3]">
                        {Math.round((Object.keys(quizAnswers).length / generatedQuiz.questions.length) * 100)}% Complete
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#F1E2F5]">
                    <div
                      className="h-full bg-gradient-to-r from-[#AE54C6] to-[#7B2CBF] transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.round(
                          (Object.keys(quizAnswers).length / generatedQuiz.questions.length) * 100
                        )}%`
                      }}
                    />
                  </div>

                  {/* Question Stepper Dots */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {generatedQuiz.questions.map((q, idx) => {
                      const isAnswered = quizAnswers[q.id] !== undefined;
                      const isCurrent = idx === quizQuestionIndex;

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setQuizQuestionIndex(idx)}
                          className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-[#303654] text-white ring-2 ring-[#303654]/30 shadow-xs scale-105"
                              : isAnswered
                              ? "bg-purple-100 text-[#AE54C6] border border-purple-300 font-extrabold"
                              : "bg-white text-[#8580A3] border border-[#F1E2F5] hover:border-purple-200"
                          }`}
                        >
                          {isAnswered && !isCurrent ? (
                            <Check className="w-3.5 h-3.5 text-[#AE54C6]" />
                          ) : (
                            idx + 1
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Question View */}
                {(() => {
                  const currentQ = generatedQuiz.questions[quizQuestionIndex] || generatedQuiz.questions[0];
                  const selectedOpt = quizAnswers[currentQ.id];

                  return (
                    <div className="p-6 sm:p-7 rounded-3xl border border-[#F1E2F5] bg-white shadow-xs space-y-6">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#AE54C6] px-3 py-1 rounded-lg bg-purple-50 border border-purple-100">
                          Question {quizQuestionIndex + 1} of {generatedQuiz.questions.length}
                        </span>
                        <span className="text-xs text-[#8580A3] font-semibold">
                          Select one correct answer
                        </span>
                      </div>

                      <p className="text-base sm:text-lg font-black text-[#303654] leading-relaxed">
                        {currentQ.prompt}
                      </p>

                      {/* 4 Large Interactive Option Cards */}
                      <div className="space-y-3">
                        {currentQ.options.map((option, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          const letter = String.fromCharCode(65 + optIdx);

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                setQuizAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }));
                              }}
                              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                                isSelected
                                  ? "border-[#AE54C6] bg-purple-50/70 text-[#303654] ring-2 ring-[#AE54C6]/20 font-bold shadow-xs"
                                  : "border-[#F1E2F5] hover:border-purple-300 hover:bg-[#FAF8FF] text-[#4A4568]"
                              }`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <span
                                  className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? "bg-[#AE54C6] text-white"
                                      : "bg-white text-[#645F80] border border-[#F1E2F5]"
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "border-[#AE54C6] bg-[#AE54C6] text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#F7EDF9]">
                        <Button
                          variant="outline"
                          onClick={() => setQuizQuestionIndex((prev) => Math.max(0, prev - 1))}
                          disabled={quizQuestionIndex === 0}
                          className="bg-white text-[#303654] font-bold text-xs shadow-xs"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1 text-[#AE54C6]" />
                          <span>Previous Question</span>
                        </Button>

                        <div className="flex items-center gap-2">
                          {quizQuestionIndex < generatedQuiz.questions.length - 1 ? (
                            <Button
                              variant="purple"
                              onClick={() =>
                                setQuizQuestionIndex((prev) =>
                                  Math.min(generatedQuiz.questions.length - 1, prev + 1)
                                )
                              }
                              className="font-bold text-xs shadow-xs"
                            >
                              <span>Next Question</span>
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          ) : (
                            <Button
                              variant="purple"
                              onClick={() => setShowQuizResults(true)}
                              disabled={Object.keys(quizAnswers).length < generatedQuiz.questions.length}
                              className="font-bold text-xs shadow-md"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              <span>Submit Quiz &amp; Grade Answers</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ================================================================= */}
            {/* CELEBRATORY RESULTS & QUESTION-BY-QUESTION REVIEW */}
            {/* ================================================================= */}
            {generatedQuiz && showQuizResults && (() => {
              const totalQ = generatedQuiz.questions.length;
              const correctCount = generatedQuiz.questions.filter(
                (q) => quizAnswers[q.id] === q.correctOption
              ).length;
              const scorePct = Math.round((correctCount / totalQ) * 100);
              const isPassed = scorePct >= 70;
              const earnedXP = correctCount * 20;

              return (
                <div className="pt-6 border-t border-[#F7EDF9] space-y-8">
                  {/* Score Celebration Hero Banner */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-sm ${
                      isPassed
                        ? "bg-gradient-to-br from-purple-50 via-[#FAF8FF] to-emerald-50/50 border-purple-200"
                        : "bg-gradient-to-br from-[#FAF8FF] to-amber-50/50 border-amber-200"
                    }`}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-2 border-purple-200 shadow-md mx-auto">
                      {scorePct === 100 ? (
                        <Trophy className="w-9 h-9 text-amber-500 fill-amber-400" />
                      ) : isPassed ? (
                        <Award className="w-9 h-9 text-[#AE54C6]" />
                      ) : (
                        <Zap className="w-9 h-9 text-amber-500 fill-amber-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-3xl sm:text-5xl font-black text-[#303654]">
                          {scorePct}%
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#8580A3]">
                          ({correctCount}/{totalQ} Correct)
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-[#303654]">
                        {scorePct === 100
                          ? "🏆 Flawless Victory! Complete Mastery!"
                          : isPassed
                          ? "🌟 Capstone Ready! Great Technical Comprehension!"
                          : "💪 Good Practice Run! Keep Building Your Mental Model!"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#645F80] max-w-lg mx-auto mt-1">
                        {isPassed
                          ? "You demonstrated strong understanding of the core concepts tested in this module. Review the breakdown below to reinforce key details."
                          : "Review the question explanations below, then ask your AI Tutor to clarify any tricky points before your next attempt."}
                      </p>
                    </div>

                    {/* Gamified Reward Banner */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-black text-[#AE54C6] shadow-2xs">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>+{earnedXP} XP Earned towards BEMS Scholar Rank</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <Button
                        variant="purple"
                        onClick={() => handleGenerateQuiz()}
                        className="font-bold text-xs shadow-xs px-5"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        <span>Generate Similar Quiz</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizAnswers({});
                          setShowQuizResults(false);
                          setQuizQuestionIndex(0);
                        }}
                        className="bg-white text-[#303654] font-bold text-xs shadow-xs px-5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#AE54C6]" />
                        <span>Retake This Quiz</span>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setGeneratedQuiz(null);
                          setQuizAnswers({});
                          setShowQuizResults(false);
                          setQuizQuestionIndex(0);
                        }}
                        className="text-[#645F80] text-xs font-bold"
                      >
                        Change Topic / Settings
                      </Button>
                    </div>
                  </div>

                  {/* Question Breakdown Header */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <h4 className="text-base font-black text-[#303654] flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#AE54C6]" />
                      <span>Detailed Answer Breakdown &amp; Explanations</span>
                    </h4>
                    <span className="text-xs text-[#8580A3] font-semibold">
                      {totalQ} Questions Reviewed
                    </span>
                  </div>

                  {/* Question Review Cards */}
                  <div className="space-y-6">
                    {generatedQuiz.questions.map((q, qIndex) => {
                      const selected = quizAnswers[q.id];
                      const isCorrect = selected === q.correctOption;

                      return (
                        <div
                          key={q.id}
                          className={`p-6 rounded-3xl border transition-all ${
                            isCorrect
                              ? "bg-white border-emerald-200/80 shadow-2xs"
                              : "bg-white border-rose-200 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-bold text-[#8580A3]">
                              Question {qIndex + 1} of {totalQ}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                                isCorrect
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Correct (+20 XP)</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Needs Review</span>
                                </>
                              )}
                            </span>
                          </div>

                          <p className="font-black text-sm sm:text-base text-[#303654] mb-4">
                            {q.prompt}
                          </p>

                          {/* Options Breakdown */}
                          <div className="space-y-2 mb-4">
                            {q.options.map((option, optIdx) => {
                              const isThisCorrect = optIdx === q.correctOption;
                              const isThisSelected = selected === optIdx;
                              const letter = String.fromCharCode(65 + optIdx);

                              let cardStyle = "border-slate-200 bg-slate-50/50 text-slate-600";
                              if (isThisCorrect) {
                                cardStyle =
                                  "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/30";
                              } else if (isThisSelected && !isThisCorrect) {
                                cardStyle =
                                  "border-rose-400 bg-rose-50 text-rose-950 font-semibold line-through";
                              }

                              return (
                                <div
                                  key={optIdx}
                                  className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${cardStyle}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                                        isThisCorrect
                                          ? "bg-emerald-600 text-white"
                                          : isThisSelected
                                          ? "bg-rose-500 text-white"
                                          : "bg-white text-slate-500 border border-slate-200"
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                    <span>{option}</span>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5 text-xs">
                                    {isThisCorrect && (
                                      <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span className="hidden sm:inline">Correct Answer</span>
                                      </span>
                                    )}
                                    {isThisSelected && !isThisCorrect && (
                                      <span className="text-rose-700 font-extrabold flex items-center gap-1">
                                        <XCircle className="w-4 h-4 text-rose-600" />
                                        <span className="hidden sm:inline">Your Selection</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pedagogical Explanation */}
                          <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] text-xs text-[#4A4568] space-y-1.5 mb-4">
                            <div className="flex items-center gap-1.5 font-bold text-[#AE54C6]">
                              <Lightbulb className="w-4 h-4 text-amber-500" />
                              <span>Instructor Explanation &amp; Core Principle:</span>
                            </div>
                            <p className="leading-relaxed pl-5 text-[#303654]">
                              {q.explanation}
                            </p>
                          </div>

                          {/* Ask AI Tutor 1-Click Action */}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleAskTutorAboutQuestion(q, selected)}
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-xs font-bold text-[#AE54C6] transition-all cursor-pointer hover:scale-[1.02]"
                            >
                              <Bot className="w-4 h-4 text-[#AE54C6]" />
                              <span>Ask AI Tutor ({tutorName}) to Explain This</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* TAB 3: AI STUDY ASSISTANT & PACE ARCHITECT */}
        {/* ========================================================================= */}
        {activeTab === "study-plan" && (
          <div className="space-y-8">
            {/* Top Form: Study Schedule & Pace Architect Studio */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 md:p-10 space-y-8">
              {/* Header */}
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-brand-purple text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>AI Academic Architect</span>
                  <span className="text-gray-400">•</span>
                  <span>BEMS FutureSkills Cohort</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#303654] tracking-tight flex items-center gap-2.5">
                  <Sparkles className="w-6 h-6 text-[#AE54C6]" />
                  <span>AI Study Schedule & Pace Architect</span>
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Generate a personalized, gamified study roadmap calibrated to your weekly hours, learning pace, and milestone deliverables. Track daily micro-tasks, unlock physical Umuahia lab tips, and build momentum toward your Capstone certification.
                </p>
              </div>

              {/* Form Controls */}
              <div className="space-y-6 pt-2">
                {/* 1. Track Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
                    1. Select Your Learning Track
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        id: "web-dev",
                        title: "Web Development",
                        mentor: "Mr. Victor",
                        skills: "HTML, CSS, React, Next.js, Node",
                        icon: Code2,
                        activeBorder: "border-[#AE54C6] bg-purple-50/60 ring-2 ring-[#AE54C6]/20",
                        activeBadge: "bg-[#AE54C6] text-white"
                      },
                      {
                        id: "ai-automation",
                        title: "AI & Automation",
                        mentor: "Dr. Amaka",
                        skills: "LLMs, Prompt Eng, Agents, Make",
                        icon: BrainCircuit,
                        activeBorder: "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20",
                        activeBadge: "bg-emerald-600 text-white"
                      },
                      {
                        id: "graphic-design",
                        title: "UI/UX Design",
                        mentor: "Mr. Tunde",
                        skills: "Figma, Wireframing, Systems, Apps",
                        icon: Layers,
                        activeBorder: "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20",
                        activeBadge: "bg-amber-600 text-white"
                      },
                      {
                        id: "cybersecurity",
                        title: "Cyber Defense",
                        mentor: "Specialist Faculty",
                        skills: "Linux, OWASP, Wireshark, Audits",
                        icon: Award,
                        activeBorder: "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20",
                        activeBadge: "bg-blue-600 text-white"
                      }
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = studyTrack === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setStudyTrack(t.id)}
                          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer hover:border-gray-300 relative ${
                            isSelected
                              ? t.activeBorder
                              : "border-gray-200 bg-white hover:bg-gray-50/70"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? t.activeBadge : "bg-gray-100 text-gray-700"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#AE54C6] text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-sm text-[#303654]">{t.title}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">Mentor: {t.mentor}</div>
                          <div className="text-[10px] text-gray-400 mt-2 truncate">{t.skills}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Student Name & Target Goal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      2. Your Student Name
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Chinedu Okeke"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30 bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Target Milestone Goal
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Launch First Full App / SaaS",
                        "Ace BEMS Capstone (90%+)",
                        "Build Job-Ready Portfolio",
                        "Fast-Track Foundations"
                      ].map((goal) => {
                        const isSelected = targetGoal === goal;
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => setTargetGoal(goal)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#303654] text-white shadow-xs"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
                            }`}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Schedule Mode & Weekly Hours Commitment */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      3. Learning Pace & Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: "Accelerated",
                          title: "Accelerated Sprint",
                          badge: "6-8 Weeks",
                          icon: Flame,
                          desc: "Intensive sprint for full-time learners ready to launch fast."
                        },
                        {
                          id: "Standard",
                          title: "Standard Balanced",
                          badge: "10-12 Weeks",
                          icon: Target,
                          desc: "Recommended for university & secondary school students."
                        },
                        {
                          id: "Flexible Weekend",
                          title: "Weekend Intensive",
                          badge: "12-14 Weeks",
                          icon: Clock,
                          desc: "Saturdays & Sundays focused with physical Umuahia lab hours."
                        }
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = studyPace === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setStudyPace(mode.id as any)}
                            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#AE54C6] bg-purple-50/70 ring-2 ring-[#AE54C6]/20 shadow-xs"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs text-[#303654] flex items-center gap-1.5">
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#AE54C6]" : "text-gray-500"}`} />
                                {mode.title}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-[#AE54C6] mb-1">{mode.badge}</div>
                            <div className="text-[11px] text-gray-500 leading-snug">{mode.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Weekly Hours Commitment
                    </label>
                    <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-medium">Available Focus Hours:</span>
                        <span className="text-base font-extrabold text-[#AE54C6]">{studyHours} hrs/week</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[6, 8, 12, 16].map((hrs) => (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => setStudyHours(hrs)}
                            className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              studyHours === hrs
                                ? "bg-[#AE54C6] text-white shadow-xs"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {hrs}h
                          </button>
                        ))}
                      </div>
                      <input
                        type="range"
                        min={4}
                        max={24}
                        step={1}
                        value={studyHours}
                        onChange={(e) => setStudyHours(Number(e.target.value))}
                        className="w-full accent-[#AE54C6] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button
                    variant="purple"
                    size="lg"
                    onClick={handleGenerateStudyPlan}
                    disabled={isStudyLoading}
                    className="w-full sm:w-auto shadow-md hover:shadow-lg cursor-pointer text-sm font-bold"
                  >
                    {isStudyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Structuring Gamified Roadmap with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span>Generate Custom Study Roadmap</span>
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Includes interactive checklists, workstation lab tips & PDF export</span>
                  </div>
                </div>
              </div>
            </div>

            {/* If no plan is generated yet, show inspirational curriculum feature preview */}
            {!studyPlan && !isStudyLoading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/80 to-white border border-purple-100/90 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#AE54C6]/10 text-[#AE54C6] flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#303654] text-base">Gamified Daily Micro-Tasks</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Break 12 weeks of software engineering into bite-sized daily tasks. Earn +50 XP per completed task and watch your student level rise from Code Cadet to BEMS Legend.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 to-white border border-blue-100/90 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#303654] text-base">Physical Umuahia Lab Tips</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Calibrated for BEMS Workstations B2 and C4. Discover exact terminal tools, Chrome DevTools profiling tricks, and Paystack webhook test setups.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/90 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#303654] text-base">1-Click Tutor & Quiz Loops</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Stuck on a week's milestone? Click one button to jump into chat with Mr. Victor or Dr. Amaka, or launch an instant checkpoint practice quiz.
                  </p>
                </div>
              </div>
            )}

            {/* Generated Study Plan Dashboard */}
            {studyPlan && (() => {
              const allTasks = studyPlan.weeks.flatMap((w) =>
                w.dailyBreakdown.map((d, idx) => ({
                  key: `${w.weekNumber}-${idx}`,
                  weekNumber: w.weekNumber,
                  ...d
                }))
              );
              const totalTasksCount = allTasks.length;
              const completedTasksCount = Object.values(completedTasks).filter(Boolean).length;
              const progressPercent = totalTasksCount > 0 ? Math.min(100, Math.round((completedTasksCount / totalTasksCount) * 100)) : 0;
              const earnedXp = completedTasksCount * 50;

              let dynamicLevel = "Level 1: Code Cadet 🛡️";
              if (progressPercent >= 100) dynamicLevel = "Level 5: BEMS Legend 🏆";
              else if (progressPercent >= 75) dynamicLevel = "Level 4: Full-Stack Architect 🚀";
              else if (progressPercent >= 50) dynamicLevel = "Level 3: Component Crafter 🎨";
              else if (progressPercent >= 25) dynamicLevel = "Level 2: Bug Buster 🐛";

              const displayedWeeks = selectedWeekFilter === "all"
                ? studyPlan.weeks
                : studyPlan.weeks.filter((w) => w.weekNumber === selectedWeekFilter);

              return (
                <div className="space-y-8 animate-fadeIn">
                  {/* Gamified Hero Dashboard Banner */}
                  <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#303654] via-[#242A45] to-[#4A2060] text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-purple-200">
                            {studyPlan.trackTitle}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                            {studyPlan.learningPace} Mode
                          </span>
                          <span className="text-xs text-white/60">
                            {studyPlan.hoursPerWeek} hrs/week
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                          {studyPlan.studentName}&apos;s Personalized Roadmap
                        </h3>
                        <p className="text-sm text-white/80 flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-300 shrink-0" />
                          <span>Goal: <strong>{studyPlan.targetGoal || targetGoal}</strong></span>
                          <span className="text-white/40">•</span>
                          <span>Target: {studyPlan.estimatedGraduation || `${studyPlan.totalWeeks} Weeks`}</span>
                        </p>
                      </div>

                      {/* Gamification Level & XP Badge */}
                      <div className="w-full lg:w-auto p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between lg:justify-start gap-4">
                        <div className="space-y-1">
                          <div className="text-[11px] uppercase tracking-wider text-purple-200 font-bold">Student Rank</div>
                          <div className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                            {dynamicLevel}
                          </div>
                        </div>
                        <div className="h-8 w-px bg-white/20" />
                        <div className="space-y-1 text-right lg:text-left">
                          <div className="text-[11px] uppercase tracking-wider text-purple-200 font-bold">XP Earned</div>
                          <div className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-1">
                            <Flame className="w-4 h-4 text-amber-400" />
                            <span>{earnedXp} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 pt-6 border-t border-white/15 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-purple-200 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-300" />
                          <span>Overall Roadmap Completion</span>
                        </span>
                        <span className="text-white font-extrabold">{completedTasksCount} of {totalTasksCount} tasks ({progressPercent}%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#AE54C6] via-purple-400 to-emerald-400 transition-all duration-500 ease-out shadow-xs"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      {progressPercent === 100 && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-300 shrink-0" />
                          <span>Incredible achievement! You have completed all weekly roadmap milestones. You are ready to present your BEMS Capstone!</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Action Toolbar */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleDownloadCalendar}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <Calendar className="w-4 h-4 text-purple-200" />
                        <span>Sync to Study Calendar (.ics)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <Printer className="w-4 h-4 text-purple-200" />
                        <span>Print / Save PDF Roadmap</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white/80 transition-all cursor-pointer ml-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-white/60" />
                        <span>Adjust Pace or Target</span>
                      </button>
                    </div>
                  </div>

                  {/* Tutor Guidance Banner */}
                  <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200/90 flex items-start space-x-3.5 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-[#AE54C6] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#303654] uppercase tracking-wider">
                        Lead Instructor Guidance
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
                        {studyPlan.tutorTip}
                      </p>
                    </div>
                  </div>

                  {/* Week Stepper Filter Tabs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-[#303654] uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#AE54C6]" />
                        <span>Weekly Syllabus & Milestone Modules ({studyPlan.weeks.length} Weeks)</span>
                      </h4>
                      <span className="text-xs text-gray-500 font-medium">Click tasks to check off & earn XP</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setSelectedWeekFilter("all")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          selectedWeekFilter === "all"
                            ? "bg-[#303654] text-white shadow-xs"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All Weeks ({studyPlan.weeks.length})
                      </button>
                      {studyPlan.weeks.map((w) => {
                        const wTasks = w.dailyBreakdown.map((_, idx) => `${w.weekNumber}-${idx}`);
                        const wDone = wTasks.every((k) => completedTasks[k]);
                        const isSelected = selectedWeekFilter === w.weekNumber;
                        return (
                          <button
                            key={w.weekNumber}
                            type="button"
                            onClick={() => setSelectedWeekFilter(w.weekNumber)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? "bg-[#AE54C6] text-white shadow-xs"
                                : wDone
                                ? "bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <span>Week {w.weekNumber}</span>
                            {wDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weekly Milestone Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {displayedWeeks.map((week) => {
                      const weekTaskKeys = week.dailyBreakdown.map((_, idx) => `${week.weekNumber}-${idx}`);
                      const isWeekCompleted = weekTaskKeys.every((k) => completedTasks[k]);
                      const isWeekInProgress = weekTaskKeys.some((k) => completedTasks[k]) && !isWeekCompleted;

                      return (
                        <div
                          key={week.weekNumber}
                          className={`rounded-3xl border transition-all duration-200 p-6 sm:p-7 space-y-5 bg-white shadow-xs hover:shadow-md ${
                            isWeekCompleted
                              ? "border-emerald-300 ring-2 ring-emerald-500/10"
                              : isWeekInProgress
                              ? "border-[#AE54C6]/40 ring-2 ring-[#AE54C6]/10"
                              : "border-gray-200/90 hover:border-gray-300"
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-lg bg-[#303654] text-white text-xs font-extrabold tracking-wide">
                                  Week {week.weekNumber}
                                </span>
                                {isWeekCompleted ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Completed
                                  </span>
                                ) : isWeekInProgress ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-brand-purple text-[11px] font-extrabold flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-brand-purple" />
                                    In Progress
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
                                    Upcoming
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base sm:text-lg font-bold text-[#303654] pt-1">
                                {week.title}
                              </h4>
                            </div>

                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg shrink-0">
                              {week.estimatedHours} hrs
                            </span>
                          </div>

                          {/* Focus Area */}
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {week.focusArea}
                          </p>

                          {/* Key Skills Tags */}
                          {week.keySkills && week.keySkills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {week.keySkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="px-2.5 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold text-gray-700"
                                >
                                  #{sk}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Daily Micro-Tasks Checklist */}
                          <div className="space-y-2 border-t border-gray-100 pt-4">
                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                              Daily Micro-Tasks (Click to check off)
                            </div>
                            <div className="space-y-2">
                              {week.dailyBreakdown.map((item, idx) => {
                                const taskKey = `${week.weekNumber}-${idx}`;
                                const isChecked = !!completedTasks[taskKey];

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleTaskCompletion(taskKey)}
                                    className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                                      isChecked
                                        ? "bg-emerald-50/70 border-emerald-200 text-gray-500 line-through"
                                        : "bg-gray-50/60 hover:bg-gray-100/80 border-gray-200 text-gray-800"
                                    }`}
                                  >
                                    <div className="shrink-0 mt-0.5">
                                      {isChecked ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <Square className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <span className="font-bold text-[#AE54C6] mr-1.5">{item.day}:</span>
                                      <span className={isChecked ? "text-gray-500" : "text-gray-800 font-medium"}>
                                        {item.task}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-1">
                                      {item.duration}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Milestone Project */}
                          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                            <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Milestone Deliverable:</span>
                            </div>
                            <div className="text-gray-800 font-medium pl-5">
                              {week.milestoneProject}
                            </div>
                          </div>

                          {/* Lab Workstation Tip */}
                          {week.labWorkstationTip && (
                            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-950 flex items-start gap-2.5">
                              <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-blue-900 mr-1">Workstation Tip:</span>
                                <span className="text-gray-700">{week.labWorkstationTip}</span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons for Week */}
                          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleAskTutorAboutWeek(week)}
                              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-[#AE54C6] transition-all cursor-pointer hover:scale-[1.01]"
                            >
                              <Bot className="w-3.5 h-3.5 text-[#AE54C6]" />
                              <span>Ask Tutor About Week {week.weekNumber}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTestWeekQuiz(week)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-all cursor-pointer"
                            >
                              <BrainCircuit className="w-3.5 h-3.5 text-gray-600" />
                              <span>Practice Quiz</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PRE-SUBMISSION CAPSTONE REVIEW */}
        {/* ========================================================================= */}
        {activeTab === "feedback" && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-6">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-xl font-bold text-brand-dark flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-brand-purple" />
                <span>Pre-Submission Capstone Review & Audit</span>
              </h2>
              <p className="text-sm text-gray-600">
                Run automated pre-flight verification on your code or live URLs against the 4 official BEMS Capstone rubrics before Mr. Victor posts your permanent certification grade.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Paste Code Snippet or Repository & Live URLs
                </label>
                <textarea
                  rows={6}
                  value={codeSubmission}
                  onChange={(e) => setCodeSubmission(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple/30 bg-gray-50"
                />
              </div>

              <Button
                variant="purple"
                onClick={handleEvaluateCode}
                disabled={isFeedbackLoading || !codeSubmission.trim()}
              >
                {isFeedbackLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Analyzing Rubric Standards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Run AI Pre-Flight Audit</span>
                  </>
                )}
              </Button>
            </div>

            {feedbackResult && (
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-navy to-purple-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-purple-200 font-semibold">
                      Audit Readiness Verdict
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      {feedbackResult.readinessVerdict === "READY_FOR_GRADING"
                        ? "✅ Ready for Formal Faculty Evaluation"
                        : "⚠️ Minor Revisions Recommended"}
                    </h3>
                    <p className="text-xs text-purple-100 mt-2 max-w-xl">{feedbackResult.summary}</p>
                  </div>
                  <div className="text-center md:text-right shrink-0 bg-white/10 p-4 rounded-xl border border-white/20">
                    <span className="text-xs text-purple-200 font-medium block">Estimated Score</span>
                    <span className="text-3xl font-black text-white">{feedbackResult.overallScore} / 100</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {feedbackResult.criteriaAnalysis.map((c, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-brand-dark">{c.criteria}</h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {c.scoreEstimate} / 25
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{c.feedback}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Recommended Polish Items Before Final Submission</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-900">
                    {feedbackResult.actionItems.map((action, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="font-bold">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PERSONALIZED NEXT STEPS */}
        {/* ========================================================================= */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            <LearningInsights />
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-xl font-bold text-brand-dark flex items-center space-x-2">
                <Award className="w-5 h-5 text-brand-purple" />
                <span>Personalized Career &amp; Academic Milestones</span>
              </h2>
              <p className="text-sm text-gray-600">
                Tailored recommendations synthesized from your completed modules, exam performance, and career aspirations.
              </p>
            </div>

            {isRecsLoading ? (
              <div className="py-12 text-center text-sm text-gray-400 flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-brand-purple" />
                <span>Synthesizing smart recommendations...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-6 rounded-2xl border border-gray-200 hover:border-brand-purple/40 transition-all bg-white shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-purple/10 text-brand-purple">
                          {rec.badge}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            rec.urgency === "HIGH" ? "text-red-600" : "text-brand-navy"
                          }`}
                        >
                          {rec.urgency} Priority
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-brand-dark">{rec.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{rec.reason}</p>
                    </div>

                    <a
                      href={rec.actionUrl}
                      className="inline-flex items-center text-xs font-bold text-brand-purple hover:text-brand-navy pt-2 group"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-light/30">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        </div>
      }
    >
      <AIHubContent />
    </Suspense>
  );
}

