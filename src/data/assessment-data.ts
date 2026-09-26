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

export const LMS_ASSIGNMENTS: Assignment[] = [
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

