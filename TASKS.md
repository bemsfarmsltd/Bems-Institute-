# Task board

Shared between Claude Code, Antigravity and Codex — see "Working on this
repo" in `AGENTS.md` for lanes and folders. Newest entries at the top of each
section.

## In progress

| Task | Agent | Branch | Files / areas | Started |
|---|---|---|---|---|
| **Trial task:** audit main @ `cabc99f`: payment → admissions gating (no course access before payment *and* admin confirmation), certificate integrity (issued only by a graded capstone, can't be forged or viewed wrongly), plus edge cases turned into new vitest tests. Report bugs with file:line here; flag fixes for the owning agent rather than changing their code. | Codex | `codex/audit-cabc99f` | Read: whole repo. Write: `backend/src/__tests__/`, `docs/` | 2026-11-14 |

## Done: production merge (Claude Code, 2026-11-14)

`main` @ `cabc99f` merges `antigravity/lms-core-upgrade`,
`claude/security-hardening`, `claude/registration-approval`,
`claude/admin-fixes` and `antigravity/admin-frontend-fixes`. Verified before
push: tsc (frontend + backend), 31/31 backend tests, `next build`. Render
deployed it (live 10:08 UTC). No schema changes.

Owner actions still open (Render, see Claude's notes): `PAYSTACK_SECRET_KEY` /
`PAYSTACK_PUBLIC_KEY` aren't set (card checkout fails), `EMAIL_FROM` is
Resend's test sender (students get no email until a domain is verified),
`RESEND_API_KEY` needs replacing, `ADMIN_ACCESS_CODE` to rotate after staff
onboarding.

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
1. [x] **Fabricated certificates.** `LMS_CERTIFICATES` in `src/data/assessment-data.ts`
   seeded `certificates` state with made-up graduates. *Fixed:* Deleted `LMS_CERTIFICATES`; `certificates` state starts strictly as `[]` and only populates from real server DB records.
2. [x] **Certificates issued without grading.** In `submitAssignment`, offline/guest
   submissions auto-issued a certificate. *Fixed:* Removed all client-side certificate issuance. Certificates are strictly issued by the server when an instructor grades the capstone.
3. [x] **Silent fake success.** Fallbacks reported "SUBMITTED" when the server never saved anything. *Fixed:* Unauthenticated or network failures now throw explicit errors, retaining the student's inputs (GitHub/demo URLs, notes) in the form so work is never lost. Quiz guest attempts are explicitly watermarked as `Practice Mode (Unrecorded)`.
4. [x] **Full pipeline verification.** Verified in `C:\dev\bems` outside OneDrive: frontend `tsc` (0 errors), backend `tsc` (0 errors), Next.js `next build` (30/30 pages compiled cleanly, 0 errors).

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

### 2026-11-14: Refund Excess Overpayment UI & Multi-User Dynamic Campaign QR Studio (Antigravity)
- **Claimed by**: Antigravity (Frontend)
- **Branch**: `antigravity/admin-refund-excess-and-qr-builder` (branched off `origin/claude/payment-integrity`)
- **What was built**:
  - **1. "Refund excess" Button on Student Rows & Earnings Tab** (`src/app/admin/page.tsx`):
    - Added "Refund excess" action button on every paying student row in the Students tab alongside "Refund".
    - Added "+ Refund excess" action button and dedicated modal on the Earnings tab in the Payment Ledger header.
    - Prompts admin confirmation, then calls `POST /api/admin/enrollments/:id/refund-excess` (admin-only, no body).
    - On success: refreshes admin data, displays live notice of refunded excess amount, and preserves student course access.
    - On zero-excess or failure: displays server error banner (`There's no overpayment on this registration`).
  - **2. Multi-User Dynamic Campaign QR Studio & Randomizer** (`src/app/qr-studio/page.tsx`):
    - Upgraded Custom Campaign QR Builder with 6 interactive categories: Church Youth Seminar, NYSC CDS Group, Student Ambassador Referral, Tech Meetup, Partner NGO, and Custom Campaign.
    - Added **"🎲 Randomize / New Campaign"** one-click generator that randomizes campaign labels, organizers, destinations, unique 4-character tokens, and theme colors.
    - Added Target Destination quick-pickers: All Courses Catalog, Web Dev, AI & Automation, Product Design, Cybersecurity, Code Sandbox, Admissions Landing, or custom URL.
    - Added QR Contrast Theme Palette (Royal Purple, Deep Navy, Forest Emerald, Amber Orange, Crimson Red) at print-ready 300 DPI.
    - Added **"Generated Campaign Codes Gallery"** (persisted in `localStorage`), allowing multi-user QR creation, direct PNG downloads, URL copying, external link previews, and deletion.
  - **3. Test Fix in Backend Auth Rate-Limiter** (`backend/src/__tests__/auth.test.ts`):
    - Added `beforeEach` hook to clear loopback `signup:` quota attempts so running Vitest repeatedly within 1 hour never fails with 429.
- **Verification**:
  - Root TypeScript (`npx tsc --noEmit`): 0 errors.
  - Backend TypeScript (`npx tsc -p backend/tsconfig.json --noEmit`): 0 errors.
  - Backend Vitest (`npm test --prefix backend`): 8 test files passed, 39/39 tests passed (100%).
  - Next.js Production Build (`npx next build`): 32/32 routes compiled cleanly in 2.3s.

### 2026-11-13: QR → Registration → Paystack Payment → Admin Confirmation Pipeline (Antigravity + Claude Code)
- **Claimed by**: Antigravity (Frontend) & Claude Code (Backend)
- **Branch**: `antigravity/lms-core-upgrade` & `claude/registration-approval`
- **What was built**:
  - **1. QR → Registration Redirect** (`src/app/login/page.tsx`, `src/app/subscriptions/page.tsx`):
    - Handled `?redirect=` / `?returnUrl=`.
    - When an unauthenticated visitor scans a flyer/banner QR code (`/subscriptions?course=<id>&utm_source=qr_flyer`), they are prompted to create a student account and seamlessly returned to checkout with their chosen course and UTM source intact.
  - **2. Post-Payment "Awaiting Admissions Confirmation"** (`src/app/subscriptions/page.tsx`):
    - When `POST /api/payments/verify` returns `awaitingApproval: true`, the premature "You're enrolled! Start First Lesson" banner is replaced with an official "Payment Received · Awaiting Admissions Confirmation" status card displaying the Paystack reference, amount paid, cohort details, WhatsApp Admissions link, and link to the student dashboard.
  - **3. Student States across Dashboard & Course Page** (`src/types/lms.ts`, `src/context/LMSContext.tsx`, `src/app/dashboard/page.tsx`, `src/app/courses/[slug]/page.tsx`):
    - Added `UserEnrollmentRecord` tracking `status`, `paymentStatus`, `hasAccess`, and `awaitingApproval`.
    - Handled all 3 states on Course Detail Page and Dashboard:
      - *Not paid*: Displays enrollment and installment deposit CTAs.
      - *Paid, awaiting confirmation*: Displays prominent "Payment Verified · Awaiting Admissions Confirmation" banner with status badge, explaining that admissions is confirming their cohort seat. Hides duplicate "Pay" buttons so students never double-pay.
      - *Active*: Full classroom and video lesson access.
  - **4. Admin Admissions Queue & 1-Click Confirmation** (`src/app/admin/page.tsx`):
    - Fetches `GET /api/admin/enrollments/pending-approval`.
    - Displays dynamic count badge in the sidebar navigation next to "Students".
    - Renders an "Awaiting Registration Confirmation" review table listing applicant details, track, cohort, delivery mode, QR source, amount paid, and reference.
    - Added **"Confirm Registration"** action button (in both the queue and student list/grid rows) that calls `POST /api/admin/enrollments/:id/approve` to activate the student, trigger their confirmation email with Lesson 1 link, and unlock video content.
- **Verification**:
  - `node C:\dev\bems\node_modules\typescript\bin\tsc -p C:\dev\bems\tsconfig.json --noEmit` -> 0 errors.
  - `node C:\dev\bems\node_modules\typescript\bin\tsc -p C:\dev\bems\backend\tsconfig.json --noEmit` -> 0 errors.
  - `node C:\dev\bems\node_modules\next\dist\bin\next build C:\dev\bems` -> 30/30 pages compiled cleanly in 2.3s.

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
