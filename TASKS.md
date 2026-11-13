# Task board

Shared between Claude Code and Antigravity — see "Working on this repo" in
`AGENTS.md`. Newest entries at the top of each section.

## In progress

| Task | Agent | Branch | Files / areas | Started |
|---|---|---|---|---|
| Certificate & Public Verifier verification + Paystack checkout testing | Antigravity | `antigravity/lms-core-upgrade` | `src/app/certificate/*`, `src/app/verify/*`, `src/app/subscriptions/*` | 2026-11-13 |

## Up next

- **End-to-End Mobile Audit**: Test every core flow on 375px mobile viewport (Homepage, Courses, Classroom, Quiz, Capstone, Checkout, Verification).
- **Backend / CI Verification**: Run `npx tsc --noEmit` and `npm test` across root and `backend/`.
- **AI Tutor & Lab Integration**: Connect Claude's AI persona selector and speech readout with LMS lesson classroom drawer.

## Done (handoff notes)

### 2026-11-13: LMS Core Workflows & Catalog Upgrade (Antigravity)
- **Claimed by**: Antigravity (resolving the uncommitted work inquiry in `TASKS.md`).
- **Files touched**:
  - `src/app/courses/[slug]/page.tsx`: Fixed missing enrollment CTA bar (`Enroll Now`, `Pay in Parts` with deposit, `Free Preview Lesson`), live installment deposit calculations, sticky mobile action bar, and active unlock links in curriculum.
  - `src/app/learn/[slug]/[lessonId]/page.tsx`: Embedded universal video player (YouTube nocookie, Vimeo, HTML5) with placeholder for processing sessions; added enrollment gate for locked lessons; added 4 classroom tabs (Overview & Objectives, In-browser Code Sandbox launch, AI Tutor with prompt chips, Resources/Syllabus).
  - `src/app/learn/[slug]/quiz/[quizId]/page.tsx`: Real-time quiz assessment with dual grading (Prisma DB when logged in + client-side scoring fallback for offline/practice); progress bar, question jump navigation pills, tutor explanations, and distinction celebration.
  - `src/app/learn/[slug]/assignment/[assignmentId]/page.tsx`: Milestone & Capstone submission studio with track-adaptive fields (Figma/Behance for UI/UX, GitHub/Demo for Web/AI, Audit Report for Cyber); instant AI Pre-Audit rubric evaluation before submitting.
  - `src/app/sandbox/page.tsx`: Full interactive developer playground with 6 pre-built templates, Tab indentation, Ctrl+Enter execution, debounced Auto-Run, responsive viewport simulator (Desktop, Tablet, Mobile), error-capturing console, and AI Code Review drawer.
  - `src/app/subscriptions/page.tsx`: Upgraded checkout portal to parse `?course=...` and `?plan=...` URL params to auto-select track and installment/full payment options.
  - `src/context/LMSContext.tsx` & `src/data/assessment-data.ts`: Populated default mock/offline catalog for courses, quizzes, assignments, and certificates (`LMS_CERTIFICATES`), preventing blank screens if API bootstrap fails; integrated local capstone certificate generation.
  - `src/app/error-404/page.tsx`: Linked cleanly to `EduportNotFoundView`.
  - `src/lib/confetti.ts`: Restored zero-dependency celebration particle confetti for quiz completions, milestones, and onboarding victories.
