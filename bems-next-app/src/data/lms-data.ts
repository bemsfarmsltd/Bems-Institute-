import { LMSCourse } from "@/types/lms";

export const LMS_COURSES: LMSCourse[] = [
  {
    id: "web-dev",
    slug: "web-dev",
    title: "Web Development",
    badge: "Most Popular",
    tutor: "Mr. Victor",
    tutorRole: "Senior Full-Stack Software Engineer",
    schedule: "3x a week · Flexible Batches",
    duration: "3 Months",
    delivery: "Physical Lab (Umuahia) + Virtual Live Zoom",
    tagline: "Build real websites employers pay for — in 3 months, in Umuahia.",
    priceFull: 79000,
    priceParts: 90000,
    deposit: 35000,
    finalProject: "A live, fully responsive production website hosted on a public domain",
    modules: [
      {
        id: "mod-wd-1",
        title: "Module 1: Semantic HTML5 & Modern CSS3 Fundamentals",
        order: 1,
        lessons: [
          {
            id: "les-1",
            title: "Course Welcome & Development Environment Setup",
            slug: "welcome-setup",
            duration: "18:40",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Orientation with Mr. Victor. Program expectations, lab workstation setup, tools installation (VS Code, Chrome DevTools), and roadmap.",
            isFreePreview: true
          },
          {
            id: "les-2",
            title: "Semantic HTML5 Elements & Page Architecture",
            slug: "semantic-html5",
            duration: "24:10",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Deep dive into header, main, nav, article, section, aside, and accessible markup.",
            isFreePreview: true
          },
          {
            id: "les-3",
            title: "Forms, Validations & User Input Controls",
            slug: "html5-forms",
            duration: "18:30",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Building production contact forms, input types, regex validations, and accessible form labels.",
            isFreePreview: false
          }
        ]
      },
      {
        id: "mod-wd-2",
        title: "Module 2: Advanced Responsive Design with Flexbox & CSS Grid",
        order: 2,
        lessons: [
          {
            id: "les-4",
            title: "CSS Box Model & Modern Flexbox Layouts",
            slug: "flexbox-layouts",
            duration: "28:15",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Master flex-direction, justify-content, align-items, flex-wrap, and building responsive navigation bars.",
            isFreePreview: false
          },
          {
            id: "les-5",
            title: "CSS Grid Systems & Two-Dimensional Page Layouts",
            slug: "css-grid-mastery",
            duration: "32:00",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Grid template areas, repeat(), minmax(), responsive auto-fit cards without media queries.",
            isFreePreview: false
          },
          {
            id: "les-6",
            title: "Mobile-First Media Queries & Responsive Breakpoints",
            slug: "mobile-first-design",
            duration: "21:45",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Designing for Android smartphones, iPads/tablets, and desktop screens with smooth viewport typography.",
            isFreePreview: false
          }
        ]
      },
      {
        id: "mod-wd-3",
        title: "Module 3: JavaScript Core to ES6+ & Interactive DOM",
        order: 3,
        lessons: [
          {
            id: "les-7",
            title: "JavaScript Variables, Data Types & Functions",
            slug: "js-fundamentals",
            duration: "35:20",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "const, let, template literals, arrow functions, higher-order array methods (map, filter, reduce).",
            isFreePreview: false
          },
          {
            id: "les-8",
            title: "DOM Manipulation, Event Listeners & Dynamic UI",
            slug: "dom-manipulation",
            duration: "29:50",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Selecting elements, adding event listeners, dynamic modals, accordions, and interactive toggles.",
            isFreePreview: false
          },
          {
            id: "les-9",
            title: "Asynchronous JavaScript, Fetch API & Promises",
            slug: "fetch-api-async",
            duration: "30:10",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Working with JSON data, async/await, handling network errors, and loading states.",
            isFreePreview: false
          }
        ]
      },
      {
        id: "mod-wd-4",
        title: "Module 4: Version Control, GitHub & Capstone Deployment",
        order: 4,
        lessons: [
          {
            id: "les-10",
            title: "Git Version Control & Terminal Mastery",
            slug: "git-version-control",
            duration: "26:00",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "git init, commit, branch, merge, merge conflicts, and publishing repositories to GitHub.",
            isFreePreview: false
          },
          {
            id: "les-11",
            title: "Connecting Third-Party APIs (Paystack, WhatsApp Webhooks)",
            slug: "third-party-integrations",
            duration: "33:40",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Integrating Paystack inline payment popups, redirecting to WhatsApp communities, and webhook handling.",
            isFreePreview: false
          },
          {
            id: "les-12",
            title: "Capstone Production Deployment to Vercel & Netlify",
            slug: "production-deployment",
            duration: "27:15",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Deploying production-ready client portals, configuring custom domains, SSL certificates, and performance auditing.",
            isFreePreview: false
          }
        ]
      }
    ]
  },
  {
    id: "ai-automation",
    slug: "ai-automation",
    title: "AI & Automation",
    badge: "High Demand 2026",
    tutor: "Timi",
    tutorRole: "AI Solutions Engineer & Automation Specialist",
    schedule: "2x a week · Evening & Weekend Options",
    duration: "3 Months",
    delivery: "Physical Lab (Umuahia) + Virtual Live Zoom",
    tagline: "Build working AI agents and automate business workflows.",
    priceFull: 84000,
    priceParts: 95000,
    deposit: 35000,
    finalProject: "A working AI/automation mini-tool deployed and functioning for real businesses",
    modules: [
      {
        id: "mod-ai-1",
        title: "Module 1: Generative AI Principles & Prompt Engineering",
        order: 1,
        lessons: [
          {
            id: "les-ai-1",
            title: "Welcome & Modern AI Landscape Overview",
            slug: "ai-landscape",
            duration: "20:10",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Introduction to LLMs, multimodal models, tokens, temperature, and enterprise use-cases.",
            isFreePreview: true
          },
          {
            id: "les-ai-2",
            title: "Advanced Prompt Engineering Frameworks",
            slug: "prompt-engineering",
            duration: "26:30",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Zero-shot, few-shot, chain-of-thought, system instructions, and structured JSON output techniques.",
            isFreePreview: false
          }
        ]
      },
      {
        id: "mod-ai-2",
        title: "Module 2: No-Code Automation & Autonomous Agents",
        order: 2,
        lessons: [
          {
            id: "les-ai-3",
            title: "Workflow Automation with Make & Zapier",
            slug: "make-zapier-automation",
            duration: "31:40",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Automating lead intake, email notifications, Google Sheets synchronization, and webhooks.",
            isFreePreview: false
          },
          {
            id: "les-ai-4",
            title: "Building Customer Support AI WhatsApp Agents",
            slug: "whatsapp-ai-agent",
            duration: "38:15",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Connecting Gemini API to WhatsApp Business API with knowledge retrieval.",
            isFreePreview: false
          }
        ]
      }
    ]
  },
  {
    id: "product-design",
    slug: "product-design",
    title: "Product Design (UI/UX)",
    badge: "Creative Tech",
    tutor: "Temi",
    tutorRole: "Lead Product Designer & UX Researcher",
    schedule: "3x a week · Practical Studios",
    duration: "3 Months",
    delivery: "Physical Lab (Umuahia) + Virtual Live Zoom",
    tagline: "Design digital products users love and build an employer-ready portfolio.",
    priceFull: 70000,
    priceParts: 80000,
    deposit: 30000,
    finalProject: "A full, professional design case study ready for portfolio presentation",
    modules: [
      {
        id: "mod-pd-1",
        title: "Module 1: Design Thinking & UX Research",
        order: 1,
        lessons: [
          {
            id: "les-pd-1",
            title: "Design Thinking Methodology & User Empathy",
            slug: "design-thinking",
            duration: "22:15",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Empathize, Define, Ideate, Prototype, and Test. Conducting real-world user interviews.",
            isFreePreview: true
          },
          {
            id: "les-pd-2",
            title: "Wireframing & Information Architecture",
            slug: "wireframing-ia",
            duration: "25:40",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Low-fidelity sketches, user journey mapping, and sitemaps.",
            isFreePreview: false
          }
        ]
      },
      {
        id: "mod-pd-2",
        title: "Module 2: Figma Mastery & Design Systems",
        order: 2,
        lessons: [
          {
            id: "les-pd-3",
            title: "Auto-Layout, Variants & Interactive Components",
            slug: "figma-auto-layout",
            duration: "34:20",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Advanced Figma workflows: responsive auto-layout, nested variants, interactive component states.",
            isFreePreview: false
          },
          {
            id: "les-pd-4",
            title: "Design Systems & Developer Handoff",
            slug: "design-systems-handoff",
            duration: "29:10",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Color tokens, typography scales, spacing rules, accessibility contrast, and Dev Mode handoff.",
            isFreePreview: false
          }
        ]
      }
    ]
  },
  {
    id: "cybersecurity",
    slug: "cybersecurity",
    title: "Cybersecurity",
    badge: "Critical Skill",
    tutor: "Specialist Faculty",
    tutorRole: "Information Security & Infrastructure Auditor",
    schedule: "2-3x a week · Lab Intensive",
    duration: "3 Months",
    delivery: "Physical Lab (Umuahia) + Virtual Live Zoom",
    tagline: "Protect digital systems, identify vulnerabilities, and master defense.",
    priceFull: 79000,
    priceParts: 90000,
    deposit: 35000,
    finalProject: "A comprehensive vulnerability assessment and security check-up report",
    modules: [
      {
        id: "mod-cs-1",
        title: "Module 1: Computer Networking & Threat Vectors",
        order: 1,
        lessons: [
          {
            id: "les-cs-1",
            title: "TCP/IP Suite, OSI Model & Network Topologies",
            slug: "tcp-ip-osi",
            duration: "25:30",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Packet analysis, Wireshark fundamentals, DNS, HTTP/HTTPS, and routing protocols.",
            isFreePreview: true
          },
          {
            id: "les-cs-2",
            title: "Common Cyber Attacks & Threat Intelligence",
            slug: "threat-vectors",
            duration: "28:15",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Phishing, Man-in-the-Middle, SQL Injection, XSS, Ransomware, and social engineering anatomy.",
            isFreePreview: false
          }
        ]
      },
      {
        id: "mod-cs-2",
        title: "Module 2: Vulnerability Auditing & Defense Tactics",
        order: 2,
        lessons: [
          {
            id: "les-cs-3",
            title: "Vulnerability Scanning with Nmap & OpenVAS",
            slug: "vulnerability-scanning",
            duration: "33:00",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            description: "Port scanning, service enumeration, detecting outdated packages, and creating audit logs.",
            isFreePreview: false
          },
          {
            id: "les-cs-4",
            title: "Hardening Servers & Incident Response Planning",
            slug: "server-hardening-incident",
            duration: "36:40",
            videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            description: "Firewall rules (UFW/iptables), SSH key authentication, least privilege access, and incident playbooks.",
            isFreePreview: false
          }
        ]
      }
    ]
  }
];

