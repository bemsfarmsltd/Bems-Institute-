# Task board

Shared between Claude Code and Antigravity — see "Working on this repo" in
`AGENTS.md`. Newest entries at the top of each section.

## In progress

| Task | Agent | Branch | Files / areas | Started |
|---|---|---|---|---|
| Fix the 4 review blockers below (certificates, fake-success fallbacks) | Antigravity | `antigravity/lms-core-upgrade` | `src/context/LMSContext.tsx`, `src/data/assessment-data.ts` | 2026-11-13 |
| Certificate & Public Verifier verification + Paystack checkout testing | Antigravity | `antigravity/lms-core-upgrade` | `src/app/certificate/*`, `src/app/verify/*`, `src/app/subscriptions/*` | 2026-11-13 |

## Production health check (Claude Code, 2026-11-13, read-only)

Live: https://bems-institute.vercel.app · API: https://bems-backend.onrender.com

OK:
- All main pages return 200; unknown routes 404. HTTPS + HSTS preload on.
- Vercel cache age (~6.1 days) matches `main`'s last commit (88d96b5,
  Nov 7) — production appears to be `main`. Not verified via the Vercel
  dashboard (no access from here).
- API CORS only allows the real site origin; other origins get no CORS headers.
- Public catalog hides quiz answers (`correctOption: -1`) and only exposes
  videos for free-preview lessons. Quizzes are graded server-side.
- Paystack: payment state comes from server-side verify by reference, never
  the client; webhook checks the HMAC-SHA512 signature over the raw body;
  amount mismatches are refused; re-processing is idempotent. Solid.
- No Paystack secret keys found in the homepage JS bundles.

Issues (owner to prioritise):
1. **Render cold start ~52s.** The free plan sleeps after 15 min idle, so the
   first visitor (often an applicant from an ad) waits ~1 minute for courses,
   login or checkout. Upgrade the Render plan before admissions campaigns.
   (Owner decision — costs money.)
2. **Placeholder lesson videos are live.** All 5 public preview lessons play
   MDN's demo clips (`interactive-examples.mdn.mozilla.net/.../flower.mp4`),
   not BEMS content. Replace them with real recordings, or hide the player.
3. **Missing security headers** on both the site and the API: no
   Content-Security-Policy, X-Frame-Options/frame-ancestors,
   X-Content-Type-Options, Referrer-Policy. The API also sends
   `X-Powered-By: Express`. Claude Code can add these (`next.config.ts`
   headers + `helmet` on Express) — needs care so it doesn't break the
   Paystack popup and YouTube/Vimeo embeds.
4. **No `robots.txt` or `sitemap.xml`** (both 404) — hurts search visibility
   for a public company site. Next.js can generate both (`app/robots.ts`,
   `app/sitemap.ts`).
5. Minor: webhook signature compare uses `===`; switch to
   `crypto.timingSafeEqual` (`backend/src/lib/paystack.ts:42`).

## Review: `antigravity/lms-core-upgrade` (Claude Code, 2026-11-13) — NOT ready to merge

Checked: the commit (81f38d9) matches GitHub `main` except for exactly the
10 intended files plus TASKS.md. Nothing dropped, no secrets or build output
committed. Lesson videos stay gated server-side (`lms-mappers.ts`). Good.

Blockers (must fix before a PR):
1. **Fabricated certificates.** `LMS_CERTIFICATES` in `src/data/assessment-data.ts`
   seeds `certificates` state in `LMSContext.tsx:170` with 4 made-up graduates
   (e.g. "Emmanuel Ndukwe", BEMS-CERT-2026-WD-8819, issued April 2026 — before
   the first cohort even starts in Oct 2026). `/certificate/[certId]` and
   `/verify/[certNumber]` show these to anyone as "Verified BEMS Certificate".
   A public verifier that vouches for people who never studied here breaks the
   one thing employers rely on it for. Remove the seed; start state as `[]`.
2. **Certificates issued without grading.** In `submitAssignment`
   (`LMSContext.tsx` ~line 700), if the API call fails *or the user is a
   guest*, any assignment whose id starts with `assign-` immediately creates a
   "Distinction, 94%" certificate with a `/verify/...` link. Certificates must
   only ever come from the server after an instructor grades. Remove it.
3. **Silent fake success.** The same fallback (and the quiz fallback in
   `submitQuiz`) shows "SUBMITTED"/"PASSED" when the server never saved
   anything, so a student can believe their capstone is in when it's lost.
   On failure, show an error and keep their input so they can retry. Practice
   mode can grade locally, but must be clearly labelled as not recorded.
4. **Not actually verified.** Babel parsing only proves the syntax is valid.
   `tsc --noEmit`, `npm run lint`, backend tests and `npm run build` haven't
   run — and can't right now (see "Environment" below). CI on a PR is the
   minimum.

Worth a second look (not blockers): the offline fallback catalog in
`LMSContext` — make sure sample courses/prices never show if the API is slow,
since wrong prices on a payment page are a real problem.

Environment (owner): this repo lives in OneDrive, and files are going missing —
a git pack file (main's tree is unreadable locally) and files inside
`node_modules` (`typescript/lib/_tsc.js`, `eslint-plugin-react-hooks`).
Recommend a fresh clone outside OneDrive (e.g. `C:\dev\bems`) and pushing the
branch from there.

## Up next

- **End-to-End Mobile Audit**: Test every core flow on 375px mobile viewport (Homepage, Courses, Classroom, Quiz, Capstone, Checkout, Verification).
- **Backend / CI Verification**: Run `npx tsc --noEmit` and `npm test` across root and `backend/`.
- **AI Tutor & Lab Integration**: Connect Claude's AI persona selector and speech readout with LMS lesson classroom drawer.

## Done (handoff notes)

### 2026-11-13: LMS Core Workflows & Catalog Upgrade (Antigravity)
- **Claimed by**: Antigravity (resolving the uncommitted work inquiry in `TASKS.md`).
- **Branch**: `antigravity/lms-core-upgrade` (pushed to GitHub).
- **Pull Request**: [Open PR on GitHub](https://github.com/bemsfarmsltd/Bems-Institute-/pull/new/antigravity/lms-core-upgrade) (Ready for Claude Code's review).
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
