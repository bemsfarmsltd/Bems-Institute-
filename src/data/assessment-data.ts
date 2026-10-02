import { Quiz, Assignment } from "@/types/lms";

export const LMS_QUIZZES: Quiz[] = [
  {
    id: "quiz-web-dev",
    courseId: "web-dev",
    title: "Web Development Technical Assessment",
    description: "Validate your mastery of Semantic HTML5, CSS Flexbox & Grid, JavaScript ES6+, and API integrations before receiving your capstone credential.",
    passingScore: 70,
    questions: [
      {
        id: "q-wd-1",
        prompt: "Which HTML5 semantic element is best suited to represent an independent, self-contained piece of content that could be distributed on its own (e.g., a blog post or news item)?",
        options: [
          "<section>",
          "<div>",
          "<article>",
          "<aside>"
        ],
        correctOption: 2,
        explanation: "The <article> element represents a complete, self-contained composition in a document, page, or site which is independently distributable."
      },
      {
        id: "q-wd-2",
        prompt: "In CSS Flexbox, what property controls the alignment of flex items along the cross axis?",
        options: [
          "justify-content",
          "align-items",
          "flex-direction",
          "align-content"
        ],
        correctOption: 1,
        explanation: "align-items defines the default behavior for how flex items are laid out along the cross axis on the current line."
      },
      {
        id: "q-wd-3",
        prompt: "Which JavaScript array method creates a new array populated with the results of calling a provided function on every element in the calling array?",
        options: [
          ".forEach()",
          ".filter()",
          ".map()",
          ".reduce()"
        ],
        correctOption: 2,
        explanation: ".map() creates a new array with the results of calling the callback function on each element without mutating the original array."
      },
      {
        id: "q-wd-4",
        prompt: "When handling an asynchronous operation using async/await, what structure should be used to catch rejected promises and network errors?",
        options: [
          "if...else block",
          "switch statement",
          "try...catch block",
          "defer promise"
        ],
        correctOption: 2,
        explanation: "In modern JavaScript, async/await code uses standard try...catch blocks to cleanly catch runtime exceptions and rejected promises."
      },
      {
        id: "q-wd-5",
        prompt: "What is the primary role of Git in professional software engineering workflows?",
        options: [
          "Distributed version control and tracking changes in source code",
          "Hosting production database servers",
          "Compiling CSS into machine code",
          "Encrypting user passwords in local storage"
        ],
        correctOption: 0,
        explanation: "Git is a distributed version control system designed to track source code history, enable branching/merging, and facilitate team collaboration."
      }
    ]
  },
  {
    id: "quiz-ai-automation",
    courseId: "ai-automation",
    title: "AI & Automation Proficiency Exam",
    description: "Assess your understanding of LLMs, prompt engineering frameworks, Zapier/Make webhooks, and AI agent architectures.",
    passingScore: 70,
    questions: [
      {
        id: "q-ai-1",
        prompt: "What prompt technique provides the model with multiple input-output examples before asking for the final answer?",
        options: [
          "Zero-shot prompting",
          "Few-shot prompting",
          "Negative prompting",
          "Temperature sampling"
        ],
        correctOption: 1,
        explanation: "Few-shot prompting provides contextual demonstrations to guide the model towards the expected format and reasoning pattern."
      },
      {
        id: "q-ai-2",
        prompt: "What mechanism is typically used in Make or Zapier to receive real-time notifications whenever a new event occurs in an external web application?",
        options: [
          "Polled CSV uploads",
          "Instant Webhooks (HTTP POST)",
          "Manual browser refresh",
          "FTP synchronization"
        ],
        correctOption: 1,
        explanation: "Webhooks allow systems to send instant real-time HTTP POST notifications as soon as an event happens."
      }
    ]
  },
  {
    id: "quiz-product-design",
    courseId: "product-design",
    title: "Product Design (UI/UX) Evaluation",
    description: "Evaluate your competency in design thinking, user flows, Figma auto-layout, design tokens, and accessibility standards.",
    passingScore: 70,
    questions: [
      {
        id: "q-pd-1",
        prompt: "What is the first phase in the standard Stanford d.school Design Thinking framework?",
        options: [
          "Prototype",
          "Empathize",
          "Ideate",
          "Test"
        ],
        correctOption: 1,
        explanation: "Empathize is the critical foundation where designers research and understand user pain points, needs, and motivations."
      },
      {
        id: "q-pd-2",
        prompt: "Which WCAG 2.1 Level AA color contrast ratio is required for normal body text against its background?",
        options: [
          "3:1",
          "4.5:1",
          "7:1",
          "2:1"
        ],
        correctOption: 1,
        explanation: "WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold)."
      }
    ]
  },
  {
    id: "quiz-cybersecurity",
    courseId: "cybersecurity",
    title: "Cybersecurity Fundamentals Audit",
    description: "Test your skills in networking security, threat modeling, port scanning with Nmap, and defensive system hardening.",
    passingScore: 70,
    questions: [
      {
        id: "q-cs-1",
        prompt: "Which OSI model layer is responsible for end-to-end packet delivery and logical addressing (IP addresses)?",
        options: [
          "Data Link Layer (Layer 2)",
          "Network Layer (Layer 3)",
          "Transport Layer (Layer 4)",
          "Application Layer (Layer 7)"
        ],
        correctOption: 1,
        explanation: "Layer 3 (Network Layer) handles routing, packet forwarding, and logical addressing such as IPv4 and IPv6."
      },
      {
        id: "q-cs-2",
        prompt: "What common defense mechanism protects databases against SQL Injection attacks?",
        options: [
          "Concatenating raw user inputs into query strings",
          "Parameterized queries (Prepared Statements)",
          "Disabling SSL encryption",
          "Opening port 3306 to public 0.0.0.0/0"
        ],
        correctOption: 1,
        explanation: "Prepared statements with parameterized queries treat user input strictly as data, never as executable SQL commands."
      }
    ]
  }
];

// PRD §4.2: "Small projects along the way, not one big exam... every
// 2-3 weeks, so they can see themselves making progress." Each course gets
// 2 graded milestones (order 1, 2) ahead of its existing capstone (order
// 99) — real, scoped checkpoints that build toward the final project,
// not just practice for its own sake. Milestones never issue a
// certificate (see POST /submissions/:id/grade's type check); only the
// capstone does.
export const LMS_ASSIGNMENTS: Assignment[] = [
  // ---- Web Development ----
  {
    id: "milestone-web-dev-1",
    courseId: "web-dev",
    title: "Milestone 1: Static Portfolio Page",
    brief: "Build and deploy a single-page personal portfolio using semantic HTML5 and CSS (Flexbox/Grid) — no JavaScript required yet. This is the foundation your capstone's front-end will build on.",
    requirements: [
      "Public GitHub repository with a clean file structure and a README.",
      "Live deployment (Vercel, Netlify, or GitHub Pages).",
      "Fully responsive across mobile (375px+), tablet, and desktop.",
      "Uses semantic elements (<header>, <main>, <section>, <footer>) — not generic <div> soup."
    ],
    rubric: [
      { criteria: "Semantic HTML Structure", points: 40 },
      { criteria: "Responsive Layout (Flexbox/Grid)", points: 40 },
      { criteria: "Live Deployment Works", points: 20 }
    ],
    type: "MILESTONE",
    order: 1
  },
  {
    id: "milestone-web-dev-2",
    courseId: "web-dev",
    title: "Milestone 2: Dynamic Form with API Integration",
    brief: "Add an interactive feature to your portfolio: a working contact form with client-side validation, and at least one component that fetches live data from a public API (e.g. weather, GitHub stats, a quote API) using fetch/async-await.",
    requirements: [
      "Form validates required fields and shows clear error states before submitting.",
      "At least one fetch() call to a real public API, with a loading and an error state shown to the user.",
      "Code pushed to the same GitHub repository as Milestone 1, with a new commit history showing the work."
    ],
    rubric: [
      { criteria: "Form Validation & UX", points: 35 },
      { criteria: "Working API Integration (fetch/async)", points: 45 },
      { criteria: "Code Quality & Commit History", points: 20 }
    ],
    type: "MILESTONE",
    order: 2
  },
  {
    id: "assign-web-dev",
    courseId: "web-dev",
    title: "Capstone Project: Production Web Application Deployment",
    brief: "Build and deploy a responsive web portal for a real business or community organization (such as an educational portal, e-commerce storefront, or event registration system). Your project must adhere to modern semantic HTML5, clean CSS/Tailwind layouts, and interactive JavaScript features.",
    requirements: [
      "Public GitHub repository containing well-commented, modular source code with a detailed README.md.",
      "Live deployment hosted on Vercel, Netlify, or GitHub Pages with zero broken links or 404 errors.",
      "Strict mobile-first responsive layout tested across mobile (375px+), tablet (768px), and desktop (1200px+).",
      "Interactive DOM or client-side form with dynamic user feedback and validation.",
      "Adherence to BEMS Brand styling guidelines (accessible contrast, modern typography)."
    ],
    rubric: [
      { criteria: "Code Architecture & Semantic HTML5 Standards", points: 25 },
      { criteria: "Responsive UI & Cross-Device Compatibility", points: 25 },
      { criteria: "Interactive JavaScript Functionality & Error Handling", points: 25 },
      { criteria: "Live Production Deployment & Git Commit History", points: 25 }
    ],
    type: "CAPSTONE",
    order: 99
  },
  // ---- AI & Automation ----
  {
    id: "milestone-ai-automation-1",
    courseId: "ai-automation",
    title: "Milestone 1: Prompt Engineering Workbook",
    brief: "Document a set of prompts solving 3 distinct, realistic business tasks (e.g. drafting customer replies, summarizing documents, classifying support tickets), each showing a 'before' naive prompt and an 'after' optimized one using few-shot examples or chain-of-thought.",
    requirements: [
      "3 tasks, each with a naive prompt, an optimized prompt, and the model's actual output for both.",
      "A short written explanation of why the optimized version performs better.",
      "Submitted as a shared doc or GitHub repo link."
    ],
    rubric: [
      { criteria: "Quality & Realism of the 3 Business Tasks", points: 30 },
      { criteria: "Effective Use of Few-Shot/Chain-of-Thought Technique", points: 45 },
      { criteria: "Clarity of Written Reasoning", points: 25 }
    ],
    type: "MILESTONE",
    order: 1
  },
  {
    id: "milestone-ai-automation-2",
    courseId: "ai-automation",
    title: "Milestone 2: Single-Step Automation",
    brief: "Build one working automation connecting two apps via Zapier or Make — for example, a form submission that triggers a Slack message or an email notification. This is the building block your capstone's multi-step pipeline will extend.",
    requirements: [
      "A live, working Zap/Scenario (not just a plan) connecting a trigger app to an action app.",
      "A screen recording or screenshots showing it firing end-to-end with real test data.",
      "A short note on what business problem this specific step solves."
    ],
    rubric: [
      { criteria: "Automation Actually Works End-to-End", points: 50 },
      { criteria: "Correct Trigger/Action Configuration", points: 30 },
      { criteria: "Clarity of Business Justification", points: 20 }
    ],
    type: "MILESTONE",
    order: 2
  },
  {
    id: "assign-ai-automation",
    courseId: "ai-automation",
    title: "Capstone: Autonomous Workflow or WhatsApp AI Assistant",
    brief: "Build and deploy an automated business pipeline using Make/Zapier, or an autonomous chatbot that handles customer queries with structured prompt engineering.",
    requirements: [
      "Architecture diagram and workflow execution logs.",
      "Live working webhook endpoint or interactive chatbot demo.",
      "Detailed project documentation detailing the business problem solved."
    ],
    rubric: [
      { criteria: "Workflow Complexity & Reliable Error Handling", points: 30 },
      { criteria: "Prompt Optimization & Response Quality", points: 30 },
      { criteria: "Real-World Business Impact & Live Demo", points: 40 }
    ],
    type: "CAPSTONE",
    order: 99
  },
  // ---- Product Design (UI/UX) ----
  {
    id: "milestone-product-design-1",
    courseId: "product-design",
    title: "Milestone 1: User Research & Problem Framing",
    brief: "Pick the real problem your capstone case study will solve, then do the research to back it up: at least 3 short user interviews or survey responses, one empathy map, and 1-2 user personas.",
    requirements: [
      "Notes or recordings from at least 3 real interviews/survey responses.",
      "One completed empathy map.",
      "1-2 user personas with goals, frustrations, and context.",
      "A one-paragraph problem statement derived directly from the research."
    ],
    rubric: [
      { criteria: "Depth & Realism of Research", points: 40 },
      { criteria: "Quality of Personas/Empathy Map", points: 35 },
      { criteria: "Sharp, Well-Grounded Problem Statement", points: 25 }
    ],
    type: "MILESTONE",
    order: 1
  },
  {
    id: "milestone-product-design-2",
    courseId: "product-design",
    title: "Milestone 2: Wireframes & Design System Basics",
    brief: "Turn your research into low/mid-fidelity wireframes for the 3-5 key screens of your capstone project, plus the start of a design token library (colors, type scale, spacing).",
    requirements: [
      "Wireframes (low or mid-fidelity) for 3-5 key screens, shared as a Figma link.",
      "A basic design token set: a color palette, a type scale, and spacing values.",
      "A short note on how each screen maps back to a persona's goal from Milestone 1."
    ],
    rubric: [
      { criteria: "Wireframe Clarity & Coverage of Key Screens", points: 40 },
      { criteria: "Design Token Library Foundations", points: 30 },
      { criteria: "Traceability Back to User Research", points: 30 }
    ],
    type: "MILESTONE",
    order: 2
  },
  {
    id: "assign-product-design",
    courseId: "product-design",
    title: "Capstone: End-to-End Product Design Case Study",
    brief: "Publish a comprehensive design case study on Behance/Figma showcasing research, wireframing, high-fidelity prototypes, and a complete design system.",
    requirements: [
      "Public Figma link with view-only or prototype permissions.",
      "Documented user research, user personas, and empathy maps.",
      "High-fidelity interactive prototype with micro-interactions.",
      "Design token library with color, typography, and spacing components."
    ],
    rubric: [
      { criteria: "UX Research Depth & Problem Framing", points: 30 },
      { criteria: "Figma Component & Auto-Layout Mastery", points: 40 },
      { criteria: "Visual Polish & Presentation Flow", points: 30 }
    ],
    type: "CAPSTONE",
    order: 99
  },
  // ---- Cybersecurity ----
  {
    id: "milestone-cybersecurity-1",
    courseId: "cybersecurity",
    title: "Milestone 1: Network Reconnaissance & Asset Inventory",
    brief: "Using Nmap against an authorized sandbox/lab target (never a system you don't own or have explicit permission to scan), produce a full asset and service inventory — the foundation your capstone's vulnerability assessment will build on.",
    requirements: [
      "Full Nmap scan output (hosts, open ports, detected services/versions).",
      "A clean asset inventory table derived from the scan.",
      "A short note confirming the target was an authorized lab/sandbox environment."
    ],
    rubric: [
      { criteria: "Scan Thoroughness & Correct Nmap Usage", points: 45 },
      { criteria: "Accuracy & Clarity of Asset Inventory", points: 35 },
      { criteria: "Documented Authorization/Scope", points: 20 }
    ],
    type: "MILESTONE",
    order: 1
  },
  {
    id: "milestone-cybersecurity-2",
    courseId: "cybersecurity",
    title: "Milestone 2: Threat Model & Risk Register",
    brief: "Using the asset inventory from Milestone 1, build a basic threat model (e.g. STRIDE) for the target and produce a prioritized risk register ranking each finding by likelihood and impact.",
    requirements: [
      "A threat model covering at least the top 5 assets/services from Milestone 1.",
      "A risk register with likelihood, impact, and an overall priority ranking per finding.",
      "Clear reasoning for how each priority ranking was decided."
    ],
    rubric: [
      { criteria: "Threat Model Completeness & Rigor", points: 40 },
      { criteria: "Risk Register Quality & Prioritization Logic", points: 40 },
      { criteria: "Clarity of Written Reasoning", points: 20 }
    ],
    type: "MILESTONE",
    order: 2
  },
  {
    id: "assign-cybersecurity",
    courseId: "cybersecurity",
    title: "Capstone: Network Vulnerability Assessment Report",
    brief: "Execute an authorized security audit on a simulated target network or sandbox environment and compile an executive-grade vulnerability assessment report.",
    requirements: [
      "Executive summary suitable for non-technical stakeholders.",
      "Detailed vulnerability breakdown categorized by CVSS severity.",
      "Actionable remediation and hardening instructions."
    ],
    rubric: [
      { criteria: "Discovery Rigor & Network Mapping", points: 35 },
      { criteria: "Risk Scoring & Threat Classification", points: 35 },
      { criteria: "Remediation Precision & Quality of Report", points: 30 }
    ],
    type: "CAPSTONE",
    order: 99
  }
];

