export interface Course {
  id: string;
  title: string;
  badge: string;
  tutor: string;
  tutorRole: string;
  schedule: string;
  duration: string;
  delivery: string;
  tagline: string;
  priceFull: number;
  priceParts: number;
  deposit: number;
  installmentPlan: string;
  finalProject: string;
  modules: string[];
}

export const COURSES: Course[] = [
  {
    id: "ai-automation",
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
    installmentPlan: "₦35,000 deposit + ₦30,000 (Month 2) + ₦30,000 (Month 3)",
    finalProject: "A working AI/automation mini-tool deployed and functioning for real businesses",
    modules: [
      "Foundations of Modern AI & Generative Workflows",
      "No-Code Automation with Zapier, Make & Webhooks",
      "AI API Integrations & Gemini/LLM Scripting",
      "Building Custom Chatbots & Autonomous AI Assistants",
      "Enterprise Automation & Client Pitch Project"
    ]
  },
  {
    id: "web-dev",
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
    installmentPlan: "₦35,000 deposit + ₦30,000 (Month 2) + ₦25,000 (Month 3)",
    finalProject: "A live, fully responsive production website hosted on a public domain",
    modules: [
      "Modern Semantic HTML5 & Advanced Responsive CSS3",
      "JavaScript Core to ES6+ & Interactive DOM Engineering",
      "Version Control, Collaboration & Git / GitHub Mastery",
      "Frontend Frameworks, APIs & Dynamic Data Fetching",
      "Full Web App Capstone & Production Cloud Deployment"
    ]
  },
  {
    id: "product-design",
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
    installmentPlan: "₦30,000 deposit + ₦25,000 (Month 2) + ₦25,000 (Month 3)",
    finalProject: "A full, professional design case study ready for portfolio presentation",
    modules: [
      "Design Thinking, User Research & Problem Identification",
      "Wireframing, Information Architecture & User Flows",
      "Figma Mastery: Auto-Layout, Components & Interactive Prototypes",
      "Design Systems, Accessibility (a11y) & Handoff to Engineers",
      "Portfolio Case Study Creation & Client Presentation"
    ]
  },
  {
    id: "cybersecurity",
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
    installmentPlan: "₦35,000 deposit + ₦30,000 (Month 2) + ₦25,000 (Month 3)",
    finalProject: "A comprehensive vulnerability assessment and security check-up report",
    modules: [
      "Networking Protocols, TCP/IP & Computer System Defense",
      "Threat Vectors, Malware Analysis & Social Engineering",
      "Ethical Hacking Tools & Vulnerability Scanning Techniques",
      "Security Auditing, Compliance & Incident Response",
      "Real-World Defensive Architecture & Final Audit Report"
    ]
  }
];
