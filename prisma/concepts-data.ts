// Concept taxonomy for the personalization loop: what each course actually
// teaches, broken into the granularity a student's mastery gets tracked at.
// web-dev is the fully-fleshed reference course (with a parent/child example
// under CSS Layout); the other three tracks get one concept per quiz
// question, which is enough for the recommendation engine to work with.

export interface ConceptSeed {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface ConceptLinkSeed {
  conceptId: string;
  importance?: number; // 1-5
}

export const CONCEPTS: ConceptSeed[] = [
  // --- Web Development ---
  { id: "concept-css-layout", courseId: "web-dev", name: "CSS Layout", description: "Arranging elements on the page with modern CSS." },
  { id: "concept-flexbox", courseId: "web-dev", name: "CSS Flexbox", description: "One-dimensional layout with the flex box model.", parentId: "concept-css-layout" },
  { id: "concept-css-grid", courseId: "web-dev", name: "CSS Grid", description: "Two-dimensional layout with grid template areas.", parentId: "concept-css-layout" },
  { id: "concept-semantic-html", courseId: "web-dev", name: "Semantic HTML5", description: "Using the right element for the right kind of content." },
  { id: "concept-array-methods", courseId: "web-dev", name: "JavaScript Array Methods", description: "map, filter, reduce and friends." },
  { id: "concept-async-js", courseId: "web-dev", name: "Async/Await & Error Handling", description: "Handling asynchronous operations and network errors safely." },
  { id: "concept-dom", courseId: "web-dev", name: "DOM Manipulation", description: "Selecting elements and responding to events." },
  { id: "concept-git", courseId: "web-dev", name: "Git Version Control", description: "Tracking changes and collaborating with Git." },

  // --- AI & Automation ---
  { id: "concept-prompt-engineering", courseId: "ai-automation", name: "Prompt Engineering", description: "Few-shot, zero-shot, and structured prompting techniques." },
  { id: "concept-webhooks", courseId: "ai-automation", name: "Webhooks & Automation Triggers", description: "Real-time event-driven automation." },

  // --- Product Design ---
  { id: "concept-design-thinking", courseId: "product-design", name: "Design Thinking Process", description: "Empathize, Define, Ideate, Prototype, Test." },
  { id: "concept-accessibility", courseId: "product-design", name: "Accessibility & Contrast Standards", description: "WCAG contrast ratios and inclusive design." },

  // --- Cybersecurity ---
  { id: "concept-osi-model", courseId: "cybersecurity", name: "Network Layer & OSI Model", description: "How packets actually get routed and delivered." },
  { id: "concept-sql-injection", courseId: "cybersecurity", name: "SQL Injection Defense", description: "Parameterized queries and input handling." }
];

// Which quiz question tests which concept(s) — this is the ground truth
// ConceptMastery scores are computed from.
export const QUESTION_CONCEPTS: Record<string, ConceptLinkSeed[]> = {
  "q-wd-1": [{ conceptId: "concept-semantic-html", importance: 4 }],
  "q-wd-2": [{ conceptId: "concept-flexbox", importance: 4 }],
  "q-wd-3": [{ conceptId: "concept-array-methods", importance: 4 }],
  "q-wd-4": [{ conceptId: "concept-async-js", importance: 5 }],
  "q-wd-5": [{ conceptId: "concept-git", importance: 3 }],
  "q-ai-1": [{ conceptId: "concept-prompt-engineering", importance: 5 }],
  "q-ai-2": [{ conceptId: "concept-webhooks", importance: 4 }],
  "q-pd-1": [{ conceptId: "concept-design-thinking", importance: 5 }],
  "q-pd-2": [{ conceptId: "concept-accessibility", importance: 4 }],
  "q-cs-1": [{ conceptId: "concept-osi-model", importance: 4 }],
  "q-cs-2": [{ conceptId: "concept-sql-injection", importance: 5 }]
};

// Which lesson(s) teach which concept(s) — used so a weak-concept
// recommendation can point at something concrete to (re-)watch.
export const LESSON_CONCEPTS: Record<string, ConceptLinkSeed[]> = {
  "les-1": [
    { conceptId: "concept-semantic-html", importance: 3 },
    { conceptId: "concept-git", importance: 3 }
  ], // welcome & dev environment setup
  "les-2": [{ conceptId: "concept-semantic-html", importance: 5 }], // semantic-html5
  "les-3": [{ conceptId: "concept-semantic-html", importance: 3 }], // html5-forms
  "les-4": [
    { conceptId: "concept-css-layout", importance: 4 },
    { conceptId: "concept-flexbox", importance: 5 }
  ], // flexbox-layouts
  "les-5": [
    { conceptId: "concept-css-layout", importance: 4 },
    { conceptId: "concept-css-grid", importance: 5 }
  ], // css-grid-mastery
  "les-6": [
    { conceptId: "concept-css-layout", importance: 5 },
    { conceptId: "concept-flexbox", importance: 3 }
  ], // mobile-first media queries
  "les-7": [{ conceptId: "concept-array-methods", importance: 4 }], // js-fundamentals
  "les-8": [{ conceptId: "concept-dom", importance: 5 }], // dom-manipulation
  "les-9": [{ conceptId: "concept-async-js", importance: 5 }], // fetch-api-async
  "les-10": [{ conceptId: "concept-git", importance: 5 }], // git-version-control
  "les-11": [{ conceptId: "concept-async-js", importance: 4 }], // connecting third-party APIs
  "les-12": [{ conceptId: "concept-git", importance: 4 }], // capstone deployment
  "les-ai-1": [{ conceptId: "concept-prompt-engineering", importance: 4 }],
  "les-ai-2": [{ conceptId: "concept-prompt-engineering", importance: 5 }],
  "les-ai-3": [{ conceptId: "concept-webhooks", importance: 4 }],
  "les-pd-1": [{ conceptId: "concept-design-thinking", importance: 5 }],
  "les-pd-2": [{ conceptId: "concept-design-thinking", importance: 4 }],
  "les-pd-3": [{ conceptId: "concept-accessibility", importance: 4 }],
  "les-pd-4": [{ conceptId: "concept-accessibility", importance: 5 }],
  "les-cs-1": [{ conceptId: "concept-osi-model", importance: 5 }],
  "les-cs-2": [{ conceptId: "concept-sql-injection", importance: 5 }]
};
