# Task board

Shared between Claude Code, Antigravity and Codex — see "Working on this
repo" in `AGENTS.md` for lanes and folders. Newest entries at the top of each
section.

## In progress

| Task | Agent | Branch | Files / areas | Started |
|---|---|---|---|---|
| **Phase 5.2 Finance API** (done, 161/161 backend tests; Antigravity can start): receipts (numbered, printable), 3-part instalment schedules with due dates, automatic reminders (3 days before, on the day, 3 days late), overdue list, Paystack daily check. API below. | Claude Code | `claude/finance-tools` | `backend/` (schema + migration, new `lib/receipts.ts`, `lib/installments.ts`, `lib/reconcile.ts`, `routes/finance.ts`; `routes/payments.ts`, `routes/admin.ts`, `lib/payment-ledger.ts` (receipt links in emails), `lib/reminders.ts`) | 2026-11-26 |
| **Phase 5.2 Finance UI** (done, `next build` & `tsc` pass; ready for review): printable `/receipts/[id]` (`window.print()` PDF + print CSS), Finance portal "Instalments" and "Daily check" tabs, receipt links in Payment Ledger, student "My payments" card. | Antigravity | `antigravity/finance-ui`, off `claude/finance-tools` | `src/app/receipts/[id]/page.tsx`, `src/app/finance/page.tsx`, `src/components/finance/FinanceInstallmentsTab.tsx`, `src/components/finance/FinanceDailyCheckTab.tsx`, `src/components/StudentMyPaymentsCard.tsx`, `src/app/dashboard/page.tsx`, `src/lib/lagos-time.ts`, `src/types/lms.ts` | 2026-11-26 |
| **Automated browser tests (Playwright)** (can start now, off `main`): turn the manual portal checks into tests that run on every PR. Brief below. | GitHub Copilot | `copilot/e2e-tests`, off `main` | new `e2e/`, `playwright.config.ts`, root `package.json` (devDependency + script), `.github/workflows/` (new job), `backend/prisma/` seed helpers only if needed | 2026-11-26 |
| **Phase 5.1 Roles & permissions API** (merged in PR #7, live 2026-11-26): three new staff roles (Finance, Admissions, Management), extra roles on one account, a permission per admin endpoint, roles read from the database on every request, portal list in `/api/auth/me`, audit log of money/registration/staff/settings changes. API below. Plan: [Upgrade plan doc](https://claude.ai/artifact/QYyPxeXD463wgUARDs7XJv). | Claude Code | `claude/roles-permissions` | `backend/` (schema + migration, `lib/permissions.ts`, `lib/audit.ts`, `lib/api-auth.ts`, `lib/session.ts`, `lib/staff-invites.ts`, `lib/tutor-view.ts`, `routes/admin.ts`, `routes/auth.ts`, `routes/staff-invites.ts`, `routes/graduates.ts`, `routes/tutor-applications.ts`, `routes/instructor.ts`) | 2026-11-26 |
| **Phase 5.1 UI: portal shells, Staff & Access roles, audit screen** per the API below | Antigravity | `antigravity/portals-shell`, off `claude/roles-permissions` | new `src/app/finance/`, `src/app/admissions/`, `src/app/management/`, `src/app/admin/page.tsx` (Staff & Access, audit), `src/context/LMSContext.tsx`, `src/app/login`, `src/components/Navbar.tsx` | 2026-11-26 |
| **Vibrant photos** (can start now, independent of the roles work): replace template graphics with licensed photos; brief below | Antigravity | `antigravity/vibrant-photos`, off `main` | `public/images/`, `src/components/Hero.tsx`, home page sections, `src/app/courses/**`, `src/app/become-instructor`, new `public/images/CREDITS.md` | 2026-11-26 |
| **Review `claude/roles-permissions`**: (1) every admin endpoint has the right permission and no office role reaches teaching features (grading, lesson videos, attendance); (2) roles come from the database, not the cookie; a removed role stops access at once; (3) role changes: last-admin protection, Admin never an extra role, invites add roles to existing staff correctly; (4) audit entries are written for money, registration, staff and settings changes and hold no secrets; add tests | GitHub Copilot | `copilot/roles-permissions-review` | Read all; write `backend/src/__tests__/` + notes here | 2026-11-26 |
| **Become a Tutor page rewrite**: replace every line of template placeholder text on `/become-instructor` with the content below, connect the form to the API, and add an admin "Tutor applications" screen. | Antigravity | `antigravity/become-tutor-page`, off `claude/tutor-applications` | `src/components/EduportBecomeInstructorView.tsx`, `src/app/become-instructor/*`, `src/app/admin/page.tsx` | 2026-11-25 |
| **My Space Phase 4 API** (done, 125/125 backend tests; awaiting Codex review): public portfolio, tutor view + admin tutor assignment, reminders (in-app + push + opt-in WhatsApp, `POST /api/jobs/reminders` every 15 min), lesson notes + bookmarks, "share with my tutor" setting. API below. | Claude Code | `claude/my-space-phase4` | `backend/` (schema + migration, `lib/portfolio.ts`, `lib/study-notes.ts`, `lib/tutor-view.ts`, `lib/reminders.ts`, `lib/push.ts`, `lib/twilio.ts`, `routes/space.ts`, `routes/portfolio.ts`, `routes/instructor.ts`, `routes/jobs.ts`), `.github/workflows/reminders.yml` | 2026-11-23 |
| **My Space Phase 4 UI**: public page `/u/[handle]`, portfolio card, notes + bookmarks, reminders card + service worker, tutor view, admin "Course tutors", welcome/dashboard privacy copy. Per the API below. | Antigravity | `antigravity/my-space-phase4-ui`, off `claude/my-space-phase4` | new `src/app/u/[handle]/page.tsx`, new `src/app/tutor/page.tsx`, `public/sw.js` (add push handlers), `src/app/dashboard/page.tsx`, `src/app/learn/**` (lesson page), `src/app/admin/page.tsx`, `src/app/welcome/page.tsx`, `src/types/lms.ts`, `src/context/LMSContext.tsx` | 2026-11-23 |
| **Review `claude/my-space-phase4`** (done; see Copilot Phase 4 review below): (1) public portfolio privacy and safe links; (2) tutor course/goal/motivation privacy; (3) note and bookmark ownership/access; (4) reminder deduplication, student eligibility, Lagos windows, and WhatsApp opt-in; (5) push subscription input. Add tests. | GitHub Copilot | `copilot/my-space-phase4-review` | `backend/src/__tests__/` + review notes | 2026-11-23 |
| **My Space Phase 2 API** (done; Codex review found no defects; browser-tested with the UI; awaiting merge): roadmap per course (modules → projects → capstone → certificate), Lagos-day study streak + this week's 7-day strip + weeks-in-a-row on target, AI tutor told the student's name / goal / level / current lesson, weekly recap (Sunday 18:00 Lagos: in-app + email, opt-out) via GitHub Actions + `POST /api/jobs/weekly-recap` and an admin fallback. API below. | Claude Code | `claude/my-space-phase2` | `backend/` (schema + migration, `lib/my-space.ts`, `lib/weekly-recap.ts`, `routes/jobs.ts`, `routes/ai.ts`, `routes/admin.ts`), `.github/workflows/weekly-recap.yml` | 2026-11-16 |
| **My Space Phase 2 UI** (done, browser-tested at 375px + desktop, awaiting merge): roadmap, streak strip, weekly-email toggle, admin "Send weekly recaps now" button, per the API below | Antigravity | `antigravity/my-space-phase2-ui`, off `claude/my-space-phase2` (after Phase 1b is pushed) | `src/app/dashboard/page.tsx`, `src/app/courses/[slug]/page.tsx`, `src/app/admin/page.tsx`, `src/types/lms.ts`, `src/app/welcome/page.tsx` (one line) | 2026-11-16 |
| **Review `antigravity/my-space-copy`** (done; remaining issues listed below) | Codex | `codex/my-space-copy-review` | `TASKS.md` + review of `src/` | 2026-11-16 |
| **Review `claude/my-space-phase2`** (done, 1a23b5f): recap job auth (secret compare, no secret = 503), once-per-week claim under concurrent runs, week choice around Sunday/Monday midnight Lagos, what goes to the AI provider (no motivation, email, phone, payment), streak edge cases; add tests | Codex | `codex/my-space-phase2-review` | Read all; write `backend/src/__tests__/` + notes here | 2026-11-16 |
| **My Space Phase 1b, Codex audit copy fixes**: the items in Codex's journey audit below (signup heading, track choice on direct checkout visits, personal pending/confirmation copy with name + class type, no "Student" fallback while loading, personal AI-tutor intro from `mySpace.profile`, neutral empty states instead of "Be the First Graduate!", stale October 2026 labels: read the cohort from data, Hero static counts). Use `mySpace` from LMSContext. | Antigravity | `antigravity/my-space-copy`, off main after the Phase 1 merge | `src/app/login`, `src/app/subscriptions`, `src/app/dashboard`, `src/app/courses/[slug]`, `src/app/learn`, `src/components/Hero.tsx`, `src/components/EduportStudentFeedback.tsx` | 2026-11-16 |
| **My Space API, Phase 1** (done; Codex findings fixed in fee8b17; browser-tested with the UI, awaiting merge): welcome-setup answers saved privately; one `GET /api/lms/my-space` with first name + Lagos-time greeting, per course tutor / class type / cohort countdown / progress / next lesson / next live class / latest feedback, this week's study time vs the student's own weekly hours, streak. Also: the student live-classes list no longer gives meeting links to unpaid registrations. API below. | Claude Code | `claude/my-space` | `backend/` (schema + migration, `lib/my-space.ts`, `routes/lms.ts`, `routes/attendance.ts`) | 2026-11-16 |
| **My Space UI, Phase 1** (done, browser-tested end to end at 375px + desktop, awaiting merge): welcome setup, personal dashboard header, Continue-where-you-left-off, personal home for signed-in students, fix the 375px dashboard header overlap. Per the API below. | Antigravity | `antigravity/my-space-ui`, off `claude/my-space` | `src/app/dashboard/page.tsx`, new `src/app/welcome/page.tsx`, `src/app/page.tsx` / `src/components/Hero.tsx`, `src/context/LMSContext.tsx` | 2026-11-16 |
| **Personalisation audit + My Space review** (done; 2 findings fixed): (1) walk the whole student journey (sign up → register → pay → confirmed → learn → feedback) at 375px and desktop, and list every spot that feels generic or impersonal (same for everyone, placeholder people/numbers, "Student" instead of their name, fake activity), with file:line and a one-line fix; (2) review `claude/my-space` for privacy (no other student's data, no meeting/lesson links before confirmation, staff behaviour) and the Lagos week/greeting edge cases; add tests in `backend/src/__tests__/` | Codex | `codex/my-space-review` | Read all; write `backend/src/__tests__/` + notes here | 2026-11-16 |

### Copilot Phase 4 review

- **Finding — 🟡 MEDIUM, high confidence:** `backend/src/lib/push.ts:42` accepts any HTTPS endpoint. An authenticated student can subscribe an attacker-controlled or internal HTTPS URL, which `sendPush` later sends to directly (`backend/src/lib/push.ts:80-83`), creating an SSRF vector. Restrict subscriptions to supported push-service origins and validate the resolved destination at delivery time; redirects must not bypass validation.
- **Coverage:** The public portfolio projection excludes the requested private fields and filters unsafe schemes; tutor course assignment and `shareWithTutor` checks are enforced, with motivation omitted; notes and bookmarks are owner-scoped and require lesson access; reminder claims, eligible-student filters, Lagos windows, and WhatsApp opt-in checks are present.
- **Regression test:** `backend/src/__tests__/my-space-phase4.test.ts` now records the private-HTTPS endpoint case as an expected failure until the owning backend agent addresses the finding.
- **Verification:** Backend `npm install`, `npx prisma generate`, and `npx tsc --noEmit` passed. `npm test -- --reporter=dot` passed with 125 tests and 1 expected failure (the new regression test), using only the local database and a test-only session secret; no `.env*` file was read or copied. Root `npx tsc --noEmit` and focused test lint passed. Root `npm run lint` remains blocked by 36 errors and 58 warnings in existing frontend files; backend lint exited 0 with the existing missing-pages-directory warning.
- No runtime behavior was changed; the SSRF finding is handed off to the backend owner per the review-lane instructions.

### Codex Phase 2 review (2026-11-16)

- **Recap job security:** `backend/src/routes/jobs.ts:10-23` returns 503 when `CRON_SECRET` is missing, rejects secrets shorter than 32 characters, and compares SHA-256 digests with `timingSafeEqual`; authorization is required before invoking the sender. Added a test for a configured short secret. No auth bypass found.
- **Concurrent delivery:** `backend/src/lib/weekly-recap.ts:85-91` uses a conditional `updateMany` claim for the student's week before building/sending. Added an integration test that runs two authorized job requests concurrently and asserts one in-app recap; it passes. This claim provides at-most-once behavior. A downstream email failure is not retried that week because the claim happens before sending.
- **Sunday/Monday Lagos boundary:** `recapWeekStart` (`backend/src/lib/weekly-recap.ts:20-25`) chooses the same Monday-start week for Sunday 23:59:59 and Monday 00:00 Lagos. Added exact-boundary tests, including Monday 02:00 late-run and Wednesday behavior; all pass.
- **AI provider context:** `backend/src/lib/my-space.ts:366-405` selects only account name/role, teaching profile fields, and confirmed-course progress to build personal context. `backend/src/routes/ai.ts:56-101` adds that context and quiz-derived weak/strong concepts to the provider prompt; motivation, email, phone, and payment reference are absent. The student-authored prompt/history and tutor/course identifiers are also passed through as request inputs. Expanded the context test with unique sensitive-data sentinels; it confirms those account/profile/payment fields are excluded.
- **Streak edges:** `backend/src/lib/my-space.ts:163-198,315-350` uses Lagos date keys, keeps yesterday's streak alive until today's activity, breaks after a missed calendar day, and computes weekly targets from Lagos Monday boundaries. Added Sunday/Monday midnight and missed-day assertions; all pass.
- **Tests:** `backend/src/__tests__/my-space-phase2.test.ts` — 13/13 passed; backend `npx tsc --noEmit` passed. The full backend suite did not produce reporter output after about 90 seconds and was interrupted. The clone initially had a stale generated Prisma client; regenerated it from `backend/prisma/schema.prisma` (no database command/access) before verification.
- **Findings for Claude:** No confirmed security, duplicate-send, week-boundary, AI-context privacy, or dashboard-streak defects in the reviewed scope. No runtime behavior changed.

### Codex My Space copy review (2026-11-16)

Compared `origin/antigravity/my-space-copy` at `fda5263` (including `f7d85b8`) with latest `main` `1b3f492`.

#### Audit checklist

| Audit item | Result |
|---|---|
| Signup heading and instructions | Fixed on `/login`; the heading identifies BEMS and tells students the next steps. However, the adjacent `EduportAuthSplitLayout` still shows synthetic named avatars, an `80+` count and an expired October 2026 cohort (below). |
| Direct checkout without a course | Fixed: selection starts empty and the page asks the visitor to choose a track. The header badge only says “CURRENT COHORT”; confirm a current cohort is actually available or display its data. |
| Payment pending / confirmation | Mostly personalized with the student's name, class mode and next lesson. The new “typically within 24 hours” confirmation promise is unverified; owner should confirm the admissions SLA. `Tuition Verified!` remains a generic fallback if My Space has not loaded. |
| Dashboard identity | Fixed: skeleton while the session hydrates, then the account name; no hard-coded “Student” fallback found in the dashboard heading/avatar. |
| AI tutor intro | Personalized with name, track, current lesson/progress, level and (when set) goal. **Privacy finding:** the private goal is also embedded in the `/ai` URL's `prompt` query parameter (`src/app/learn/[slug]/[lessonId]/page.tsx:687-711`), where it may enter browser history and request/referrer logs. Pass the context through app state or the request body instead. |
| Review prompt / empty state | Fixed to a course/name-specific thank-you and neutral “No reviews yet.” `EduportStudentFeedback` fetches outcomes from `/api/graduates`; no hard-coded testimonial quote was found in that component. Accuracy and student consent for database records still need owner confirmation. |
| Stale dates and Hero counts | Not fully fixed: old cohort/date copy remains in the auth split panel and CourseCards, and Hero still shows unverified counts (details below). |

#### Remaining visitor-facing issues for Antigravity / owner

| File:line | What remains | Suggested follow-up |
|---|---|---|
| `src/app/page.tsx:23-25` | The signed-in Hero can greet the student, but the home page still renders generic `CourseCards`, trending courses and graduate feedback directly after it. | Hide or personalize marketing sections for signed-in students. |
| `src/components/EduportAuthSplitLayout.tsx:7,282-292` | Dicebear avatars seeded with `Chinedu`, `Amarachi`, `Tunde`, `Ngozi` are labeled “BEMS student”; the copy claims “80+ students joining the October 2026 cohort.” These are synthetic identities and a stale date/count. | Remove the seeded people/count and use a neutral illustration with current, verified cohort information. |
| `src/components/Hero.tsx:171,179-189` | `courses.length || 5` can claim five tracks before data loads; static “4 Expert Tutors & Mentors” and “80 Seats Per Cohort” remain without a live source or verification. | Render a loading state then real catalog count; remove or connect tutor/capacity claims to verified data. |
| `src/components/Hero.tsx:374` | The image's alt text identifies the pictured person as a “BEMS Institute Tech Student”; source/identity and consent are not established by code. | Confirm it is a real, consented BEMS learner or relabel/replace it as illustrative. |
| `src/components/CourseCards.tsx:215` | “October 2026 batch” remains in the instructor promo shown on the home page. | Remove the date or read the next cohort from current data. |
| `src/components/EduportStudentFeedback.tsx:100-103` | When there are no outcome records, “Be our first success story” is generic promotional copy. | Use a neutral “No graduate outcomes published yet” empty state. |
| `src/data/courses.ts:24,47,70,93` | Tutor identities/titles (`Timi`, `Mr. Victor`, `Temi`, `Specialist Faculty`) remain hard-coded and were not substantiated in this source review. | Owner to confirm the named people/titles are real; replace unverified entries with accurate faculty labels. |
| `src/app/subscriptions/page.tsx:367-368`; `src/app/courses/[slug]/page.tsx:708`; `src/app/dashboard/page.tsx:676` | “Reviews typically complete within 24 hours” is repeated as an operational promise. | Owner to confirm this is the actual admissions SLA or remove the timeframe. |
| `src/app/courses/[slug]/page.tsx:696,714` | Pending approval can still say “Tuition Verified!” without a name, and the button label is “Go to Student Dashboard.” | Use the loaded user's name in the fallback too, and label the destination “Dashboard.” |

No hard-coded student testimonial remains in the reviewed feedback component; it displays API outcomes or an explicit empty state. This was a source review, not a visual browser pass.

#### Full backend suite on latest main

- Checked out `origin/main` at `1b3f492` before running tests.
- Command: `npx.cmd vitest run --maxWorkers=1 --reporter=verbose` in `backend/` against the local test database.
- **Passed: 16 test files, 100 tests; 95.63 seconds.**

### Codex My Space review (2026-11-16)

#### Student-journey personalisation findings for Antigravity

The computer-use/browser host was unavailable, so I could not verify visual layout at 375px or desktop. These source references are from the current `claude/my-space` checkout; the diff from `main` is backend-only, while the UI work is on Antigravity's separate branch.

| Journey | File:line | Generic / impersonal spot | One-line fix |
|---|---|---|---|
| Home after sign-in | `src/app/page.tsx:15-25` | Every signed-in student still gets the same marketing Hero, course cards and generic feedback section; My Space isn't connected in this branch. | For signed-in students, replace the marketing hero with the My Space greeting, their track and Continue card; leave the public home intact. |
| Signup | `src/app/login/page.tsx:407-410` | “Sign up for your account!” / “Nice to see you! Please Sign up with your account.” repeats itself and doesn't say what the student is joining. | Use “Create your BEMS student account” and explain the next step (choose a track and class type). |
| Register / checkout entry | `src/app/subscriptions/page.tsx:70,310,308-318` | A direct visit silently defaults to Web Development and uses a generic “Invest in High-Income Tech Skills” pitch; the page still advertises the October 2026 cohort even though the audit date is Nov 16, 2026. | Ask students to choose a track when no course was passed in, reflect that track in the heading, and show only a current cohort. |
| Payment waiting for approval | `src/app/subscriptions/page.tsx:341-347`; `src/app/dashboard/page.tsx:600-610`; `src/app/courses/[slug]/page.tsx:678-684` | Repeated generic admissions copy gives no student name, cohort/class type or expected confirmation window. | Address the student by first name and show their cohort, delivery mode, payment state, and a realistic next update time. |
| Payment confirmed | `src/app/subscriptions/page.tsx:387-397` | “You're enrolled in {course}!” and “Your classroom modules…” never acknowledge the student's name or chosen class type. | Confirm “{firstName}, your {course} {deliveryMode} place is confirmed” and point to their next lesson. |
| Dashboard identity | `src/app/dashboard/page.tsx:376,389` | Authenticated view falls back to generic “Student” instead of an identity/skeleton state. | Show the loaded student's actual name; use a loading skeleton until auth resolves. |
| Learning | `src/app/learn/[slug]/[lessonId]/page.tsx:688-698` | AI Tutor intro and CTA are identical for every learner, with no goal, level, current progress or latest feedback context. | Pass the student's My Space goal and current lesson/progress into the tutor intro and prompt. |
| Feedback prompt / success | `src/app/courses/[slug]/page.tsx:122,434-437,542-545` | Toast is only “Thanks for your review!”; title and empty state (“Be the First Graduate!”) are generic and call a learner a graduate prematurely. | Thank the learner by first name and course, and use a neutral “No reviews yet” empty state. |
| Home feedback section | `src/components/EduportStudentFeedback.tsx:152-155` | “Some valuable feedback…” section is generic marketing copy; its employer-audited capstone/hiring introductions claim has no per-student outcome behind it. | Lead with a real, consented student outcome; keep the explicit empty-state copy if none are published. |
| Home cohort visuals | `src/components/Hero.tsx:22-43,363-403` | Static `20+` tutors, `80 Seats`, `100% QR-Verified Certificates`, initials/`80+` avatar, and floating “Your admission completed” card read as fabricated activity; October 2026 cohort is already past on the audit date. | Replace with verified live counts and real consented student content/current cohort details, or remove the count/avatar/admission card. |

#### API review and regression tests

- **Confirmed onboarding-state bug:** `backend/src/lib/my-space.ts:102-107` merges persisted values to decide setup completion; `LearningProfile.experienceLevel` defaults to `BEGINNER` (`backend/prisma/schema.prisma:839`). After a student saves goal + hours without choosing an experience level, a later partial edit sees the schema default and marks `onboarded` true. Test `doesn't treat the schema's default BEGINNER as an answer the student gave` fails at `backend/src/__tests__/my-space.test.ts:146`. Claude should track an explicit answer/step-completion state instead of inferring an answer from the DB default.
- **Confirmed input-validation bug:** `Number(true) === 1` in `saveSpaceProfile` means JSON boolean `weeklyHours: true` is accepted as one hour. The added validation assertion fails (`200` received instead of `400`). Reject non-number input before integer/range checks.
- **Privacy/access checks:** `/api/lms/my-space` and profile writes are bound to the authenticated `session.id`; private motivation is not returned through the class-goals endpoint. `nextLesson`, My Space meeting URLs, and `/api/attendance/live` are restricted to paid-and-confirmed enrollments. Staff get `onboarded: true`; no other student's profile or submissions were found in the response query. Added/extended ownership-spoofing and instructor behavior assertions.
- **Lagos boundaries:** the Monday 00:00 Lagos transition and exact morning/afternoon/evening cutoffs are covered in tests. `lagosWeekStart` uses UTC+1 fixed offset (appropriate for Lagos) and the checked boundary calculations are correct.
- Tests: `npx vitest run src/__tests__/my-space.test.ts` — 11 passed, 2 intentionally failing (the default-experience and boolean-hours findings). Added exact week/greeting boundary tests and instructor/ownership checks. The browser-based 375px/desktop checks remain unverified because the computer-use host could not expose a browser window.

## Codex staff security review + public content sweep (2026-11-15)

### Security finding for Claude Code

- **High — concurrent 2FA guesses bypass the five-failure limit.** `backend/src/lib/rate-limit.ts` checks failure count and writes attempts in separate operations; `backend/src/routes/auth.ts` calls them separately for `2fa:<userId>`. A regression test fired 50 concurrent invalid codes with one valid challenge and observed all 50 reach verification (401), with no 429. Add an atomic per-account limiter (or equivalent serialized attempt claim) before relying on this limit to stop guessing. Codex did not change runtime behavior.
- Added `backend/src/__tests__/staff-security.test.ts` coverage for parallel guesses and for an existing session after staff 2FA reset. The parallel-guess test is intentionally failing on this branch; 2FA reset session revocation passed.
- **Other requested controls reviewed:** no confirmed way found to create staff publicly or accept one invite twice; existing-account invitations require that account’s password; reset links with 2FA enabled do not create a session; 2FA challenge binds to `tokenVersion`; authenticator steps and recovery codes are consumed atomically; role changes and staff 2FA reset bump `tokenVersion`; setup returns the authenticator secret only to the signed-in user after password verification, recovery codes are returned only at creation/rotation, and security/staff listing responses omit secret material. Existing staff-security tests cover the positive/negative paths. Invite acceptance's invite claim is atomic.

### Visitor-facing copy for owner confirmation

The live Vercel host could not be fetched in the available browser lookup, so these are source-confirmed items on public routes/components; owner should confirm what is currently deployed and which statements are accurate. `Real?` means unverified and needs owner confirmation.

| File:line | Visitor-facing content | Real? |
|---|---|---|
| `src/components/Footer.tsx:163` and `src/lib/whatsapp.ts:1-3` | `+234 800 000 0000`; WhatsApp helper comment explicitly calls it a placeholder and says replace it before launch. | **No — placeholder; replace with admissions number.** |
| `src/components/Footer.tsx:169`; `src/app/privacy/page.tsx:117-118`; `src/app/terms/page.tsx:124-125` | `admissions@bemsinstitute.ng`. | Confirm mailbox exists and receives mail. |
| `src/components/Footer.tsx:173` | `BEMS Innovation Hub, Umuahia, Abia State`. | Confirm exact public address/name. |
| `src/components/Footer.tsx:33,42,51,60` | Facebook `bitvstudies`, Instagram `bemsinstitute`, X/Twitter `bemsInstitute`, LinkedIn `bemsumuahia`. | Confirm each account is controlled by BEMS and active. |
| `src/components/Hero.tsx:22-43` | Marketing stats: `20+ Expert Tutors & Mentors`, `80 Seats` for October 2026, `100% QR-Verified Certificates`. | Confirm each metric and cohort availability. |
| `src/components/Hero.tsx:363-379` | October 2026 cohort card with initials `CO`, `AN`, `EK`, `UI` and `80+` avatar. | Confirm these represent real students and current cohort. |
| `src/components/EduportAuthSplitLayout.tsx:7,282-292` | Dicebear avatar seeds `Chinedu`, `Amarachi`, `Tunde`, `Ngozi`, labeled BEMS students; text says `80+ students joining the October 2026 cohort`. | Confirm names/count; avatars appear synthetic. |
| `src/components/EduportBecomeInstructorView.tsx:806-827` | `25K Total Instructors`, `180K Total Courses`, `20+ Languages` (generic template-style counters). | **Likely template filler — confirm or remove.** |
| `src/data/courses.ts:24-25,47-48,70-71,93-94` (also `src/data/lms-data.ts`) | Course instructor identities/titles: `Timi — AI Solutions Engineer & Automation Specialist`, `Mr. Victor — Senior Full-Stack Software Engineer`, `Temi — Lead Product Designer & UX Researcher`, `Specialist Faculty — Information Security & Infrastructure Auditor`. | Confirm these are real instructors and titles. |
| `src/app/leaderboard/page.tsx:263-266` | Claims top 10 students in every cohort are featured in an employer matchmaking portfolio distributed to hiring firms in Lagos, Abuja and abroad. | Confirm the program, portfolio, and employer distribution are real. |
| `src/app/graduates/page.tsx:52,63` | Heading copy says “Real … graduates, hired and building careers in tech”; empty state says the first cohort graduates in early 2027. | Confirm timeline; heading should not imply graduate outcomes before records exist. |
| `src/components/EduportStudentFeedback.tsx:31-36,64-105` | Testimonials/outcomes load from the graduates API; empty state says “Be our first success story.” No hard-coded student testimonial found. | Dynamic records still need consent/accuracy review; empty state is explicit. |

### Verification

- `backend`: `npx prisma generate` completed from the checked-out schema (no DB/migration action).
- Focused `staff-security.test.ts` passed before the concurrency case was expanded: 14/14.
- Re-ran the parallel-guess case with 50 concurrent requests: **failed as intended**, 50 invalid requests returned 401 instead of being stopped at five failures; this is the reported finding.
- No live-site content was edited. No production services or database were accessed.

### Campaign QR API (Claude Code → Antigravity)
All admin-only (`403` otherwise). A campaign object:
`{ id, code, label, target, active, source, shortUrl, scans, registrations, paidRegistrations, createdAt }`.
The printed QR must encode **`shortUrl`** (`https://<site>/q/<code>`), never the target: that's what makes it re-pointable and counted.
- `GET /api/admin/qr-campaigns` → `{ campaigns }`, newest first.
- `POST /api/admin/qr-campaigns` `{ label, target }` → `201 { campaign }`. `target`: a path on the site (`/subscriptions?course=web-dev`) or an `https://` URL. `400 { error }` with a message to show as is.
- `PATCH /api/admin/qr-campaigns/:id` `{ label?, target?, active? }` → `{ campaign }`. No delete: switch off instead (scans of a switched-off code go to the homepage).

### Staff & Access + Security API (Claude Code → Antigravity)
Errors are always `{ error }` with a message to show as is. `429` = too many tries.

**Sign-in now has an optional second step** (login page AND `AdminGate`):
- `POST /api/auth/login` may return `200 { twoFactorRequired: true, challenge }` instead of `{ user }`: no session yet. Ask for the 6-digit code from their authenticator app (or a recovery code like `k7m2-9xq4`), then
- `POST /api/auth/login/2fa` `{ challenge, code }` → `{ user }` (+ `recoveryCodesLeft` if a recovery code was used: warn when low). Challenge lasts 5 minutes; on `401` "timed out" go back to the password step.
- `POST /api/auth/reset-password` may return `{ ok: true, signInRequired: true }` (2-step is on): send them to sign in instead of assuming they're signed in.

**Security tab** (any signed-in user, `/api/account`):
- `GET /security` → `{ twoFactor: { enabled, enabledAt, recoveryCodesLeft }, recentSignIns: [{ method, ip, userAgent, createdAt }], failedSignInsLast7Days }`. `method`: `password`, `password+2fa`, `password+recovery-code`, `invite`.
- Turn on: `POST /2fa/setup` `{ password }` → `{ secret, otpauthUrl }`. Show `otpauthUrl` as a QR code (the `qrcode` package is already used by qr-studio) and `secret` for typing in. Then `POST /2fa/enable` `{ code }` → `{ recoveryCodes: string[8] }`: show once, with copy/download, and say they won't be shown again.
- Turn off: `POST /2fa/disable` `{ password, code }`.
- New recovery codes: `POST /2fa/recovery-codes` `{ code }` → `{ recoveryCodes }`.
- `POST /sign-out-everywhere` → ends every other session; this browser stays signed in.

**Staff & Access tab** (admin-only, `/api/admin`):
- `GET /staff` → `{ staff: [{ id, name, email, role, active, createdAt, twoFactorEnabled, lastSignInAt, isYou }] }`.
- Invite: `POST /staff/invites` `{ email, role: "INSTRUCTOR" | "ADMIN" }` → `201 { invite, inviteUrl, emailed }`. Always show `inviteUrl` with a copy button (and a WhatsApp share link): `emailed` is false while email isn't set up. `409` if they already have that access.
- `GET /staff/invites` → `{ invites: [{ id, email, role, status: pending|accepted|revoked|expired, invitedBy, expiresAt, acceptedAt, createdAt }] }`. `POST /staff/invites/:id/revoke`.
- `POST /staff/:id/role` `{ role: "STUDENT" | "INSTRUCTOR" | "ADMIN" }` (STUDENT = remove staff access, keep the account). Not on yourself (`isYou`).
- `POST /staff/:id/reset-2fa` for someone who lost their phone. Not on yourself.
- Existing: `POST /staff/:id/deactivate`, `POST /staff/:id/reactivate`.

**New public page `/staff-invite/[token]`** (what the invite link opens):
- `GET /api/staff-invites/:token` → `{ invite: { email, role, expiresAt, accountExists } }`, or `410` (expired/used: show the message).
- `POST /api/staff-invites/:token/accept`: new person `{ name, password }` (8+ chars); `accountExists` → just `{ password }` of that account. → `{ user }` (signed in: go to `/admin` or `/instructor` by role) or `{ ok, signInRequired: true }` (send to `/login`).
- `AdminGate`'s "register with staff code" now returns `403` once any admin exists: replace that tab with "Staff accounts are invite-only. Ask an admin for an invite link."

### Phase 5.2 Finance API (Claude Code → Antigravity)
Branch `claude/finance-tools`. All amounts are whole naira. Dates are ISO strings; show them in Lagos time.

**Receipts.** Every confirmed Paystack or bank payment has a receipt; every refund has a refund note. Waivers (second chance) have neither.
- `GET /api/finance/receipts/:transactionId` (the student who paid, or anyone with `payments.view`) → `{ receipt: { receiptNumber: "BEMS-2026-000123", kind: "PAYMENT" | "REFUND", issuedAt, student: { name, email }, course: { title }, plan: "full" | "installment", amount, method: "Card (Paystack)" | "Bank transfer" | …, reference, totalDue, paidToDate, balance } }`. 404 for a waiver or an unconfirmed charge.
- Payment emails (Paystack and staff-confirmed bank transfers) now include a link to `/receipts/<transactionId>`.
- **Page `/receipts/[id]`** (Antigravity): an A4-friendly receipt with BEMS logo, institute name, receipt number, date, student, course, plan, amount, method, reference, paid to date and balance. Include a "Download PDF" button that calls `window.print()`, and print CSS that hides the navbar, footer and button. Show "Refund note" instead of "Receipt" when `kind` is `REFUND`. Sign-in required; on 403/404 show a short message.

**Instalment plans.** Pay-in-parts registrations get 3 parts: the deposit, then the rest split in two, due 30 and 60 days after the deposit was paid (courses are self-paced, so there is no class start date). Finance can move a due date.
- `GET /api/finance/my-payments` (student) → `{ enrollments: [{ enrollmentId, course: { id, title, slug }, plan, totalDue, amountPaid, balance, installments: [{ id, seq, amount, dueDate, paid, outstanding, status }], payments: [{ id, kind, amount, paidAt, method, receiptNumber }] }] }`. `status` is `PAID`, `UPCOMING`, `DUE_SOON` (within 3 days), `OVERDUE` or `CANCELLED` (refunded/withdrawn). `installments` is empty for full-payment plans.
- Paying: `POST /api/payments/init` takes an optional `payWhat: "next" | "balance"`. For an instalment plan after the deposit, `"next"` charges what's left of the next part; `"balance"` (the default, as today) charges everything left. The "Pay next instalment" button sends `payWhat: "next"`.
- `GET /api/finance/installments?status=overdue|due_soon|upcoming|all&courseId=` (`payments.view`) → `{ installments: [{ id, enrollmentId, student: { id, name, email, phone }, course: { id, title }, seq, amount, outstanding, dueDate, status, daysOverdue, lastReminderAt }], totals: { overdueCount, overdueAmount, dueSoonCount, dueSoonAmount } }`, overdue first.
- `PATCH /api/finance/installments/:id` `{ dueDate }` (`payments.view` + `payments.record`) → `{ installment }`. 409 `{ error }` if it would put parts out of order (part 2 after part 3); show the error. Audited (`installment.due_date_changed`).
- Reminders run in the existing 15-minute job between 08:00 and 19:00 Lagos: in-app + email, 3 days before, on the day and 3 days late, each once per part.

**Daily check (Paystack vs our ledger).**
- `GET /api/finance/reconciliation?date=YYYY-MM-DD` (`payments.view`; one Lagos day, default today) → `{ date, paystackConfigured, totals: { paystack, ledgerPaystack, bank, refunds }, matched: [...], paystackOnly: [...], ledgerOnly: [...], amountMismatch: [...], bankTransfers: [...] }`. Each row: `{ reference, amount, paystackAmount?, status, paidAt, studentName?, email?, courseTitle? }`.
  - `paystackOnly`: paid on Paystack but not credited here. Show a "Recheck" button.
  - `ledgerOnly`: credited here but not a success on Paystack. Show it as a warning for Finance to investigate.
  - `bankTransfers`: staff-confirmed transfers that day, to tick off against the bank statement.
- `POST /api/finance/reconciliation/:reference/recheck` (`payments.record`) → `{ result }`. Asks Paystack again and credits the payment if it really succeeded (same logic as the webhook).
- If Paystack isn't configured, `paystackConfigured` is `false` and only `bankTransfers` is filled. Say so on the screen.

**Finance portal (Antigravity), new tabs:**
- **Instalments:** filter chips Overdue / Due soon / Upcoming / All, plus totals at the top. Each row has the student, course, part `n of 3`, outstanding amount, due date (editable with a date picker, saved via PATCH), days late, last reminder, and Email / WhatsApp buttons (`mailto:` / `wa.me` using `toWhatsAppDigits`).
- **Daily check:** a date picker, four totals, then the sections above. Use green for matched, amber for bank transfers, red for paystackOnly/ledgerOnly/amountMismatch. Add a "Recheck" button on paystackOnly rows.
- **Payment Ledger tab:** add a "Receipt" link for rows with a `receiptNumber` (the ledger API will include `transactionId` and `receiptNumber`).

**Student dashboard (Antigravity):** a "My payments" card for students with an instalment plan or a balance. Show the parts with status chips, a "Pay next instalment (₦…)" button (Paystack, `payWhat: "next"`) and a receipts list linking to `/receipts/[id]`.

### Automated browser tests brief (Copilot)
Goal: what Claude checked by hand for PR #7 runs automatically on every pull request.
- Add `@playwright/test` (exact version) as a root devDependency, `playwright.config.ts`, and tests in `e2e/`. Chromium only, viewports 1366×900 and 375×812.
- CI job in `.github/workflows/` (new job or file): Postgres 17 service, `backend` `npm ci` + `npx prisma migrate deploy` + seed, start the backend on 4020 with `FRONTEND_URL=http://localhost:3020`, build the frontend with `NEXT_PUBLIC_API_URL=http://localhost:4020`, `next start -p 3020`, then run Playwright. Upload the HTML report and screenshots on failure. Use a test-only `CRON_SECRET`-free setup; no real Paystack, Resend or Twilio keys. Email just logs when unconfigured.
- Test data: a setup step creates one account per role (Admin, Finance, Admissions, Management (+Admissions extra), Tutor, Student) with a known test password, plus one paid registration awaiting approval. Use Prisma directly in a setup script or seed helper; never the production database.
- Tests:
  1. Each role signs in and lands on its home (`/admin`, `/finance`, `/admissions`, `/management`, `/tutor`, `/dashboard` or `/welcome`), and gets the "no access" screen on the other portals and on `/admin`.
  2. Admissions approves the paid registration; Management sees it in the audit log.
  3. Admin changes the Management user's extra roles in Staff & Access; the audit log shows it; that user's old session is signed out.
  4. Management + Admissions sees the portal switcher (desktop) and "My portals" (phone menu).
  5. No page errors and no 5xx responses during the run.
- Make selectors robust: prefer roles/labels/text. If an element has no good selector, list it in TASKS.md for Antigravity to add an `aria-label` or `data-testid`; don't edit app code.
- Report run time and flakiness in TASKS.md under "Copilot E2E notes".

### Phase 5.1 Roles & permissions API (Claude Code → Antigravity)
Branch `claude/roles-permissions`. Part of the [School Management System & LMS upgrade plan](https://claude.ai/artifact/QYyPxeXD463wgUARDs7XJv) (Phase 1 of 4).

**Roles**: `STUDENT`, `INSTRUCTOR` (shown as "Tutor"), `ADMIN`, and new `FINANCE`, `ADMISSIONS`, `MANAGEMENT`. An account has one main role plus optional extra roles (e.g. Management + Admissions). Admin is only ever a main role.

**What each office role may open** (everything else returns 403 "You don't have access to this."):
| Role | Endpoints |
|---|---|
| Finance | `GET /api/admin/analytics`, `/cohorts`, `/roster` (full), `/roster/export`, `/payment-ledger` (+ export), `POST /enrollments/:id/payment`, `/refund`, `/refund-excess` |
| Admissions | `/cohorts`, `/roster` (full), `/roster/export`, `POST /enrollments/:id/payment`, `/leads`, `/welcome-calls`, `/enrollments/pending-approval`, `/approve`, `/status`, `/second-chance`, `/qr-campaigns`, `/api/tutor-applications` |
| Management | `/analytics`, `/cohorts`, `/placements` (read), `/reviews` (read), `GET /api/admin/audit` |
| Tutor | unchanged: tutor view, grading, attendance, the limited roster |

**Where to send people**: `GET /api/auth/me` now returns `user.roles` (main first), `user.permissions` (list of strings, e.g. `"payments.refund"`), `user.portals` (`[{ role, label, path }]`, home first) and `user.homePath`. After sign-in, redirect to `homePath`. Paths: `/admin`, `/management`, `/finance`, `/admissions`, `/tutor`, `/dashboard`. If `portals.length > 1`, show a portal switcher in the navbar ("Finance · Admissions"). Hide any menu item whose permission the user lacks rather than letting it 403.

**Portal shells (this task)**: one page per office role, reusing the admin console's existing components, showing only what that role may open:
- `/finance`: payment ledger with export, record payment, refunds, revenue chart (from `/analytics`).
- `/admissions`: pending approvals, leads, welcome calls, QR campaigns, tutor applications, student list.
- `/management`: the analytics dashboard, placements and reviews (read-only), and the audit log.
- A signed-in person without that portal's role gets "You don't have access to this portal" with a link to their `homePath`. The full Phase 2 versions (fee plans, debtors, receipts, targets, weekly report) come next; this is the shell.

**Staff & Access (admin)**: `GET /api/admin/staff` now includes office staff and returns `roles` and `roleLabels`. Invite form roles: Tutor, Admin, Finance, Admissions, Management (`POST /api/admin/staff/invites { email, role }`; inviting existing staff adds the role). Role editor: main-role select + extra-role checkboxes (Tutor, Finance, Admissions, Management) → `POST /api/admin/staff/:id/role { role, extraRoles }`. Errors come back in `error`. Changing someone's roles signs them out once.

**Audit log**: `GET /api/admin/audit?targetType=&targetId=&action=&before=<ISO>&limit=50` → `{ events: [{ id, actorName, action, targetType, targetId, summary, createdAt }], hasMore }` (newest first; load more with `before` = the last `createdAt`). Show it in the management portal and in admin Settings → "Audit log", as a list: time, who, summary. Actions so far: `payment.recorded`, `payment.refunded`, `payment.refunded_excess`, `enrollment.approved`, `enrollment.status_changed`, `enrollment.second_chance`, `course.created`, `course.status_changed`, `settings.changed`, `staff.invited`, `staff.roles_changed`, `staff.deactivated`, `staff.reactivated`, `staff.2fa_reset`.

### Copilot roles review

Reviewed `origin/claude/roles-permissions` at `2c1ad31`. No runtime behavior was changed; only backend regression tests and this review note were added.

**Verified:** Admin handlers in `backend/src/routes/admin.ts` and related tutor-application, graduate and course-tutor routes were checked against `backend/src/lib/permissions.ts`. Office permissions are scoped to the listed finance/admissions/management operations; grading and attendance-management handlers use Tutor/Admin checks. `GET /api/attendance/live` is an exception: an office-role account with a paid enrollment can see its meeting and recording links (finding below). Session role/extra-role values are reloaded from the database in `backend/src/lib/api-auth.ts` on each request. The role editor rejects Admin as an extra role and protects sequential last-admin changes; invites create/promote/add roles as intended, including making an Admin invite the main role.

**Problems for the backend owner (runtime fixes are outside this review lane):**

| File:line | Finding | Suggested fix |
|---|---|---|
| `backend/src/routes/attendance.ts:85-130` | `/api/attendance/live` treats every authenticated non-Tutor/Admin as a student. An office-role account with a paid enrollment can retrieve live-session meeting and recording URLs. | Restrict this endpoint to explicit Student or Tutor/Admin roles; deny office-only role sets and test with an enrolled Finance, Admissions and Management account. |
| `backend/src/routes/lms.ts:320,359,431` | Progress, quiz-attempt and submission routes enforce paid/confirmed enrollment only when the main role is `STUDENT`. Office-role accounts therefore bypass the enrollment checks and can write learning state without enrollment. | Apply the enrollment gate to non-teaching users (rather than only `STUDENT`); explicitly define whether an office account with Tutor as an extra role is exempt. |
| `backend/src/routes/admin.ts:1184,1278,1343`; `backend/src/lib/audit.ts:33-46` | Second-chance and refund events store the entire request body in audit details, and the audit API returns those details. Arbitrary submitted fields or free-text reason can persist sensitive values and expose them to audit readers. | Store an explicit allowlist of non-secret fields and return an explicit response projection; add a canary test for both persistence and API output. |
| `backend/src/routes/staff-invites.ts:76` | Accepting a second role for existing staff updates `extraRoles` without incrementing `tokenVersion`; their existing sessions stay active, unlike changes made through the role editor. Acceptance also has no role-change audit event. | Invalidate existing sessions on role-changing invite acceptance and audit the resulting role change; test both effects. |
| `backend/src/routes/admin.ts:1488-1500` | Revoking a staff invite is not audited, although invite/staff changes are part of the audit scope. | Record a `staff.invite_revoked` audit event with the actor and invite ID, without the raw token. |
| `backend/src/routes/admin.ts:1403-1411,1526-1533` | Potential race: last-admin protection checks the active-admin count separately from the write. A coordinated pair of concurrent changes could pass both checks; this was not reproduced in ordinary integration tests. | Make the invariant atomic (transaction/lock or equivalent) and add a deterministic concurrency test. |
| `backend/src/lib/audit.ts:16-29` | Audit write failures are logged and swallowed, so a money/role action may succeed without its required audit event. | Decide whether critical mutations must fail/rollback when audit persistence fails; otherwise expose failed audit writes to operations and test the policy. |
| `backend/src/routes/lms.ts:33-56,488` | Some teaching checks use only `session.role`, while `isStaff()` uses main plus extra roles. An account with an office main role and explicit Tutor extra role may get inconsistent access to teaching features. | Align teaching gates on the central role-union helper and test the chosen office+Tutor policy. |

**Regression coverage added:** expected-failure tests expose office-role access to live meeting links, the three learning-write enrollment bypasses, invite acceptance session/audit gap, missing invite-revocation auditing, and audit-body secret leakage. Passing tests cover office-only role combinations being denied attendance management and unreleased lesson videos. Expected failures remain visible until the owner fixes the runtime code.

**Claude's fixes (all 8 findings):**
1. `/api/attendance/live`: office-only accounts get 403. New `isLearner()` in `lib/api-auth.ts`. Rule: learning features are for students and teaching staff (Tutor/Admin, main or extra role).
2. LMS progress, quiz attempts and submissions: anyone who isn't teaching staff must be a student *and* enrolled.
3. Audit details are an allow-list: second chance → `targetCohortId`; refund → `amount`, `reason` (max 300 chars); refund-excess → none. `listAudit` returns an explicit field list (no `actorId`).
4. Invite acceptance that changes roles bumps `tokenVersion` and writes `staff.roles_changed`. A brand-new account writes `staff.joined`.
5. Revoking an invite writes `staff.invite_revoked` (email + role, never the token).
6. Last-admin checks (role change, deactivate) run inside a transaction holding `pg_advisory_xact_lock`, so concurrent demotions are serialized. No integration test: it would deactivate admins that other test files use in parallel.
7. Audit write failures: policy is to *not* undo the action (a refund or payment has already happened), but log `AUDIT_WRITE_FAILED` with action/target/actor for the Render logs.
8. LMS teaching checks use `isStaff()` (main + extra roles). An office account with Tutor as an extra role can teach. Test added.

Copilot's `it.fails` tests are now normal tests. Backend: 22 files, 152 tests pass.

**Verification:** Backend `npm install`, `npx prisma generate`, `npx prisma migrate deploy` (isolated local PostgreSQL test DB only), and `npx tsc --noEmit` passed. Full `npm test -- --maxWorkers=1 --reporter=dot` passed: 22 files, 146 tests passed, 5 expected failures for the documented gaps. The initial install was blocked by an incomplete `jiti` package; a clean backend `npm ci --ignore-scripts` repaired dependencies before rerunning `npm install`. npm reported 3 high-severity dependency advisories; they were not audited as part of this roles review. Root `npm run lint` is blocked by a missing `eslint-plugin-react-hooks` runtime file; backend has no `lint` script.

### Vibrant photos brief (Antigravity)
The site has two photos. Replace template graphics with bright, real-looking photos of young Africans learning tech, without misleading anyone.
- Source only from **Unsplash** or **Pexels** (free for commercial use, no attribution required). Record each photo's page URL and photographer in `public/images/CREDITS.md`.
- What to show: students at laptops coding or designing, small groups working together, a tutor helping at a desk, a bright classroom or lab, a graduation or certificate moment. Prefer Nigerian/West African settings; avoid obviously foreign signage, uniforms or snow.
- Never caption or imply they are BEMS students or BEMS premises ("our students", "our lab"). Describe the scene ("Students working on a web project"). Real BEMS photos replace these after the photo shoot.
- Where: home hero and the sections below it, course cards and course pages (one per track that matches the subject), Become a Tutor hero, login/welcome side panels, empty states.
- Performance: `next/image` with `sizes`, WebP, hero ≤ 200 KB and others ≤ 120 KB at 1600 px wide, `alt` text that describes the scene, no layout shift. Keep text readable over photos (an overlay where text sits on an image).
- Check at 375 px and desktop; run the Vercel-style build (`npx next build`, Turbopack) before handing over.

### Become a Tutor: API and page content (Claude Code → Antigravity)
Branch `claude/tutor-applications`. Every line on `/become-instructor` today is template placeholder text ("Satisfied conveying a dependent contented he gentleman…"), and the steps describe a course marketplace ("Add your Course", "Start Earning Money"). BEMS doesn't work like that: it hires tutors to teach its own four courses. The content below uses only facts from the PRD (§7 Tracks, Tutors & Delivery; §5 graduates return as teaching assistants). Items marked **[owner to confirm]** need the owner's yes before they go live; until then use the safe wording given.

**API**
- `POST /api/tutor-applications` (no sign-in) `{ name, email, phone, track, teachingMode, experience, portfolioUrl?, website }` → 201 `{ ok, id }`.
  - `track`: a course id from the catalogue (`ai-automation`, `web-dev`, `product-design`, `cybersecurity`) or `"other"`.
  - `teachingMode`: `IN_PERSON` | `ONLINE` | `EITHER`.
  - `experience`: 30 to 3,000 characters. `portfolioUrl`: optional, https only.
  - `website` is a hidden honeypot: render it off-screen with `tabIndex={-1}` and `autoComplete="off"`, and leave it empty. Bots fill it in and are dropped silently.
  - Errors return 400 `{ error }` with a sentence to show under the form, and 429 after 5 applications an hour from one connection.
  - The applicant gets a confirmation email; admins get an in-app notification and an email.
- Admin: `GET /api/tutor-applications?status=` → `{ applications: [{ id, name, email, phone, track, trackTitle, teachingMode, teachingModeLabel, experience, portfolioUrl, status, staffNotes, createdAt }], counts: { NEW, CONTACTED, INTERVIEW, HIRED, DECLINED } }`. `PATCH /api/tutor-applications/:id { status?, staffNotes? }`.

**Page content** (mobile first; keep the existing illustrations if they fit, but remove anything that implies a marketplace or course uploads)
- Page title (metadata): "Teach at BEMS". Description: "Teach a tech course at BEMS Institute of Technology in Umuahia or online. See what tutors do and apply."
- Hero, heading: **Teach tech at BEMS**. Text: "BEMS FutureSkills Accelerator trains people in Umuahia and online until they're ready for work. We're looking for practitioners who can teach a small class, mark real projects and help students get hired." Button: "Apply to teach" (scrolls to the form).
- **Now recruiting**: "Cybersecurity tutor: lead our 3-month Cybersecurity course, ending in a security check-up report each student can show employers." Under it: "Teach AI & Automation, Web Development or Product Design? We welcome applications for future cohorts and teaching support too." **[owner to confirm** that the Cybersecurity role is still open before launch; if it's filled, drop this block and keep the second line.**]**
- **What a BEMS tutor does** (4 short cards):
  1. *Teach live classes*: 2–3 classes a week, in person at our Umuahia lab and online.
  2. *Mark small projects*: students build something every 2–3 weeks; you give feedback they can act on.
  3. *Guide a final project*: every course ends with real work a student can show an employer.
  4. *Step in early*: your tutor dashboard shows who's falling behind, so you can help before they drop out.
- **The four courses** (a simple table or cards, 3 months each): AI & Automation, 2 classes a week, final project "a working AI or automation mini-tool"; Web Development, 3 a week, "a live website anyone can visit"; Product Design (UI/UX), 3 a week, "a full design case study"; Cybersecurity, schedule set with the tutor, "a security check-up report".
- **Who we're looking for**: real working experience in the subject (a portfolio, past projects or a current role); able to explain things clearly to beginners; available for a full 3-month cohort; for in-person classes, able to be at our Umuahia lab on class days. **[owner to confirm** these requirements.**]**
- **How to apply** (3 steps): 1. Fill in the form below. 2. We'll call you to talk about your experience and the course. 3. If it's a fit, we agree pay and schedule, and you start with the next cohort. **[owner to confirm** whether there's a teaching demo; if so add "2b. Give a short teaching demo".**]**
- **Pay**: "This is a paid role. We'll talk through pay and schedule on the call." Don't show figures: the PRD still has "BEMS to confirm pay per tutor per month".
- **BEMS graduates**: "Finished a BEMS course? Our best graduates can come back as paid teaching assistants." (PRD §5). Link "See our courses" → `/courses`.
- **Form** heading "Apply to teach". Fields: Full name; Email; Phone (WhatsApp if possible); Course you'd like to teach (select: the four courses + "Something else"); How you'd like to teach (In person in Umuahia / Online / Either); Your experience (textarea, placeholder "What have you built or taught? Where do you work now?"); Portfolio or LinkedIn link (optional); the hidden `website` field. Button "Send application", disabled while sending.
  - Success state: "Thanks, {first name}. Your application has arrived, and we've emailed you a copy. We'll be in touch if your experience matches what we need."
  - Show the API's `error` text on failure; never show success unless the API returned 201.
- Remove: the "Instructor Dashboard / You can be your guiding star" block, the "Create Account / Add your Course / Start Earning Money" steps, the "Instructor Role / Start with Course" tabs and every placeholder paragraph.

**Admin**: Settings → "Tutor applications" sub-tab (next to Course tutors): status filter chips with counts, newest first. Each card shows name, course, teaching mode, date, experience (expandable), portfolio link, Email / WhatsApp buttons (`buildWhatsAppLink` from `src/lib/whatsapp.ts`), a status dropdown and a notes box that saves on blur. When someone is hired, a hint: "Invite them as an Instructor in Staff & Access, then assign their course in Course tutors."

### My Space Phase 4 API (Claude Code → Antigravity)
Branch `claude/my-space-phase4`. All new endpoints; nothing existing changed shape (the one addition is `profile.shareWithTutor`).

**1. Public portfolio** (student opt-in; my pick for the headline feature)
- Settings: `GET /api/lms/my-space/portfolio` → `{ enabled, handle, headline, showScores, suggestedHandle, url, canEnable, preview }`. `preview` has exactly what the public sees.
- Save: `PATCH /api/lms/my-space/portfolio { handle?, headline?, showScores?, enabled? }`. Handle: 3–30 lowercase letters, numbers and single hyphens (input is lowercased). Errors come back in `error` ready to show: 400 bad or reserved handle, 409 "That address is taken", 403 "Your public page opens once your registration is confirmed" (`canEnable: false` until then, so disable the switch with that line under it). `enabled: true` needs a handle, so the first save can send both.
- Public: `GET /api/portfolio/:handle` (no sign-in) → `{ portfolio: { handle, headline, name, avatarUrl, tracks: [{ title, slug, color, status: "IN_PROGRESS" | "COMPLETED" }], badges: [{ id, title, description, icon, earnedAt }] (earned only), projects: [{ title, type, courseTitle, githubUrl, liveDemoUrl, score (null unless showScores), gradedAt }] (graded only), certificates: [{ certNumber, courseTitle, gradeTitle, issuedAt, href }] } }`. Off, unknown and deactivated all return 404 "This page isn't available."
- Page `src/app/u/[handle]/page.tsx`: name, headline, track chips in course colours, badge grid, project cards (GitHub / Live demo buttons only when the link isn't null), certificates linking to `href` (the existing verify page), a "Learn with BEMS" call to action to `/courses`. Server-render it with `generateMetadata` (title "Ada Obi · BEMS Institute", description from the headline) so shared links preview well on WhatsApp/LinkedIn. Mobile first (375px). Treat everything as untrusted text (React escapes it; don't use `dangerouslySetInnerHTML`).
- Dashboard card "Your public page": address field with `www.bemsinstitute.com/u/` prefix (prefill `suggestedHandle`), headline (120 max), "Show my project scores" switch, the on/off switch, Copy link + Share to WhatsApp (`https://wa.me/?text=` + url) once on, and the preview. Plain line: "Only your name, headline, badges, graded projects and certificates are shown. Your email, phone, goals and feedback never are."

**2. Lesson notes and bookmarks** (private to the student)
- Notes: `GET /api/lms/notes/:lessonId` → `{ note: { body, updatedAt } | null }`; `PUT /api/lms/notes/:lessonId { body }` saves (empty deletes, 5,000 characters max); `GET /api/lms/notes` → `{ notes: [{ lessonId, lessonTitle, moduleTitle, courseTitle, courseSlug, href, body, updatedAt }] }` (newest first; `href` null if they can no longer open it). 404 if the lesson isn't one they can open.
- Bookmarks: `GET /api/lms/bookmarks` → `{ bookmarks: [{ id, kind: "LESSON" | "LINK", title, url, lessonId, lessonTitle, courseTitle, href, createdAt }] }`; `POST /api/lms/bookmarks { lessonId }` or `{ url, title }` (https links only) → 201 `{ bookmark }` (saving twice returns the same one); `DELETE /api/lms/bookmarks/:id`.
- Lesson page: a "My notes" panel (autosave about 1 s after typing stops, "Saved" status, works on mobile as a bottom sheet) and a bookmark toggle by the lesson title. Dashboard: a "Notes & saved" section with two tabs (notes grouped by course, bookmarks with an "Add a link" form).

**3. Reminders**
- Settings: `GET /api/lms/reminders` → `{ classes, goal, streak, whatsapp, push: { publicKey, devices }, whatsappAvailable, phoneOnFile }`; `PATCH /api/lms/reminders { classes?, goal?, streak?, whatsapp? }` (booleans; `whatsapp: true` with no phone → 400 "Add your phone number in your account settings first.").
- What gets sent: "Class starts at 4:00 pm" (about 1 hour before a live class), "You're 1 lesson from your weekly goal" (Thu–Sun evenings), "Keep your 4-day streak going" (7–10 pm if not studied today). Always as an in-app notification; also push on every allowed browser; WhatsApp only for class and goal reminders, only if opted in.
- Push: `push.publicKey` is null until the server keys are set; hide the "Allow notifications" button then. When set: use the existing `/sw.js` registration (`navigator.serviceWorker.ready`), `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey })`, send `POST /api/lms/push/subscribe` with `subscription.toJSON()` (`{ endpoint, keys: { p256dh, auth } }`); "Turn off on this device" → unsubscribe in the browser + `POST /api/lms/push/unsubscribe { endpoint }`. Only ask after the student taps the button (never on page load). On iPhone, push works only after "Add to Home Screen", so show that hint on iOS Safari.
- `public/sw.js` already exists (offline cache, registered in `layout.tsx`): add handlers there. On `push`, show `{ title, body, tag }` from the JSON payload with the BEMS icon; on `notificationclick`, focus or open `data.url` (a site path; default `/dashboard`).
- Dashboard "Reminders" card: three switches (Class reminders, Weekly goal nudge, Streak nudge), the push button with this device's state, and a WhatsApp switch shown only when `whatsappAvailable` (disabled with the phone hint when `!phoneOnFile`).

**4. Tutor view** (staff only)
- `GET /api/instructor/students?courseId=` → `{ courses: [{ id, title, slug, color }], students: [...], summary: { total, needsAttention } }`. Admins see every course; a tutor only the courses an admin assigned them (none until assigned, which shows an empty state "An admin hasn't assigned you a course yet."). 403 for a course they don't teach.
- Each student: `{ userId, name, avatarUrl, courseId, courseTitle, cohortName, deliveryMode, status, goal: { goalType, goalLabel, goal, experienceLevel, weeklyHours } | null, progress: { completed, total, percent }, currentLesson: { title, moduleTitle } | null, lastActiveAt, streakDays, week: { minutesStudied, goalMinutes }, projects: { submitted, awaitingGrade, latestScore }, quiz: { attempts, latestScore }, flags: [{ kind, label }], needsAttention }`. Sorted with those needing attention first. Flag kinds: `NOT_STARTED`, `INACTIVE`, `BEHIND_GOAL`, `LOW_QUIZ`, `RESUBMIT`, `WEAK_TOPICS`; show `label` as-is. `goal` is null when the student doesn't share it: show "Not shared".
- `GET /api/instructor/students/:userId?courseId=` → `{ student: { ...row, contact: { email, phone }, modules: [{ title, completed, total, status }], recentActivity: [{ type, label, lessonTitle, at }], quizAttempts: [{ quizTitle, score, passed, at }], submissions: [{ id, title, type, status, score, githubUrl, liveDemoUrl, submittedAt, gradedAt }] } }`.
- Page `src/app/tutor/page.tsx` (staff only; link it from the admin console and from the dashboard for INSTRUCTOR users): course filter, "Needs attention (n)" / "All" tabs, a card or table row per student with progress bar, last active ("3 days ago"), streak, flags as chips; tapping opens the detail (journey, activity, quizzes, projects with links, and WhatsApp/email buttons from `contact`).
- Admin, Settings → "Course tutors": `GET /api/instructor/course-tutors` → `{ courses: [{ id, title, catalogueTutor, tutors: [{ id, name, email }] }], staff: [{ id, name, email, role }] }`; `PUT /api/instructor/course-tutors/:courseId { userIds }` replaces the list (staff accounts only, else 400). A multi-select per course.

**5. Privacy copy (needed for the tutor view)**
- New `profile.shareWithTutor` (`PATCH /api/lms/my-space/profile { shareWithTutor }`). New students default to sharing; everyone who signed up before today was set to not sharing, because they were told "Only you (and your AI tutor) see this".
- Welcome setup line → "Your tutor and your AI tutor see your goal, level and weekly time, to help you. Your reason for joining stays private." with a "Share with my tutor" switch (on). Same switch in the dashboard Preferences card, replacing "Only you (and your AI tutor) see your goals and weekly pace."

#### Phase 4 QA (Claude Code, 2026-11-24)

Merged `antigravity/my-space-phase4-ui` and Copilot's review into `claude/my-space-phase4` (PR #2). Backend 126/126; frontend `tsc` and `next build` OK. Browser-checked at 375px and 1366px against a local backend:
- the public page saves, shows only public data and hides unsafe links;
- notes autosave (a tab on desktop, a bottom sheet on mobile);
- bookmarks and the reminder switches save;
- the tutor list, flags, detail view and contact buttons work;
- admin Course tutors works;
- no page errors and no horizontal scroll.

Fixes in QA:
- Push sign-up only accepts the browsers' push services (Copilot's SSRF finding), and the address is checked again before each send.
- Project links must be https web addresses when submitted, and the tutor view filters out old unsafe ones (a `javascript:` "Demo" link was showing in the tutor detail).
- WhatsApp buttons turn local numbers (0803…) into 234… (`src/lib/whatsapp.ts`), because `wa.me/0803…` doesn't open a chat. This also fixes admin's existing student WhatsApp buttons.
- `/u/[handle]`: share-preview (Open Graph) tags, no duplicate site name in the title, and not-found pages aren't indexed. The root layout has `metadataBase` (www.bemsinstitute.com, or `NEXT_PUBLIC_SITE_URL`).

Left for Antigravity (not blocking):
- The new files add a few "setState in an effect" lint errors, the same pattern as the existing pages.
- The portfolio address box is narrow at 375px.

### My Space Phase 3 API (Claude Code → Antigravity)
All additive on `GET /api/lms/my-space`.

**Appearance** (`appearance: { accentColor, accentHex, banner }`, defaults filled in: purple / aurora):
- Accents: `purple #9C3FB5` (default), `indigo #4F46E5`, `blue #2563EB`, `teal #0B7F75`, `green #23803F`, `amber #A85F00`, `rose #C2185B`. All have 4.5:1+ contrast with white text, so buttons/chips with white text are fine.
- Banners: `aurora`, `circuit`, `sunrise`, `midnight`, `lagoon`, `plain`. You design them (CSS gradients/patterns, no images needed); keep the name text readable on each.
- Save: `PATCH /api/lms/my-space/profile { accentColor: "teal", banner: "lagoon" }`; `null` resets to default; anything else → 400.
- Apply `accentHex` (e.g. a CSS variable `--space-accent` on the dashboard and the signed-in home panel) to the header, progress ring, roadmap "done" steps, streak strip and primary buttons. Banner = the dashboard header background. Brand chrome (navbar, footer) stays BEMS purple.
- "Make it yours" picker on the dashboard (Preferences card or a button on the banner): colour swatches with names (not colour alone, for colour-blind users) and banner thumbnails, live preview, Save.

**Badges** (`badges: [{ id, title, description, icon, earned, earnedAt, isNew }]`, always all 12, staff get `[]`):
- First Step, Module Master, Halfway There, All Lessons Done, On a Roll (3-day streak), Week Warrior (7-day), Goal Getter (weekly goal once), Consistency Champ (3 weeks in a row), Shipped It (first project), Top Marks (85+ project), Quiz Ace (100% quiz), Certified. `icon` is a lucide icon name hint.
- Badge shelf on the dashboard: earned ones in the accent colour with the date; locked ones greyed with `description` as "how to earn it". Show "4 of 12 badges".
- Celebration: when any badge has `isNew`, show a short, dismissible celebration (badge pops in; motion system, nothing for reduced motion beyond a fade), then call `POST /api/lms/my-space/badges/seen` so it doesn't repeat. Each badge also arrives as a notification "Badge earned: …".
- Badges are private to the student for now (no leaderboard/public profile).

#### Phase 3 QA (Claude Code, 2026-11-16)

Merged `antigravity/my-space-phase3-ui` (bbc230a) and Codex's test (00e053a). Backend 108/108; build OK. Browser-checked at 375px and 1366px with reduced motion on: the picker saves and resets (named swatches, `aria-pressed`, live preview), the teal look reaches the dashboard and signed-in home, the shelf shows "3 of 12", no page errors, no horizontal scroll.

Fixes in QA:
- The celebration moved to the top of the dashboard. It sat below the roadmap on mobile, but badges are marked seen on load, so students missed it.
- With several new badges, the line under the titles no longer shows only the first badge's description.
- Picker drafts are seeded when it opens instead of in an effect (lint).

### My Space Phase 2 API (Claude Code → Antigravity)
All additive on `GET /api/lms/my-space` (Phase 1 fields unchanged).

**Roadmap**: each `courses[i].roadmap`:
```
{ modules:  [{ title, completed, total, status: "DONE" | "CURRENT" | "UPCOMING" }],
  projects: [{ id, title, type: "MILESTONE" | "CAPSTONE", status: "NOT_SUBMITTED" | "SUBMITTED" | "GRADED" | "RESUBMISSION_REQUESTED", score, href }],
  certificate: null | { certNumber, gradeTitle, issuedAt, href } }
```
Show it as one vertical journey on the dashboard (and the course page): modules, then milestone projects, then the capstone, then the certificate at the end. Done steps lit in the course colour with a check, CURRENT pulsing gently (motion system, respects reduced motion), upcoming muted. Certificate step: locked "Your certificate" until `certificate` is set, then a link to `href`. `href` on projects is null until confirmed.

**Streaks**:
- `week.days`: 7 items Monday → Sunday (Lagos) `{ date, active, minutes, isToday, isFuture }`. Show a small M T W T F S S strip under the weekly ring: filled = studied, outlined = missed, faded = future, today ringed.
- `streaks: { days, studiedToday, weeksOnTarget }`. `streak` (number) still = `streaks.days`. Copy: "🔥 4-day streak"; if `!studiedToday && days > 0`: "Study today to keep your 4-day streak". `weeksOnTarget > 1`: "3 weeks in a row on target".
- "Studied" = finished a lesson, a quiz, practice question, submitted a project, or used the AI tutor that day.

**Weekly recap email**: `profile.weeklyRecapEmail` (default true). Toggle on the dashboard (a small "Weekly progress email" switch in a Preferences card, with the welcome answers editable there too) → `PATCH /api/lms/my-space/profile { weeklyRecapEmail: false }`. Sundays 18:00 every confirmed student gets an in-app notification "Your week at BEMS"; the email only if the switch is on.

**Admin**: in Settings → General (under the community link), button "Send weekly recaps now" → `POST /api/admin/recaps/send` → `{ sent, emailed }` ("Sent to 12 students, 9 by email"). Note under it: "Sent automatically every Sunday at 6 pm. Each student gets each week's recap once."

**AI tutor**: nothing to change in the UI; the tutor now knows the student's first name, goal, level and current lesson. Add to the welcome setup's "Only you see this" line: "Only you (and your AI tutor) see this".

### My Space API, Phase 1 (Claude Code → Antigravity)
Goal (from the owner): the student should feel they are in their own space. Use their name, their goal, their tutor, their class type and their progress everywhere it fits; never placeholder people or numbers.

**`GET /api/lms/my-space`** (signed in; 401 otherwise). Load it on the dashboard and the signed-in home page.
```
{ firstName: "Ada", greeting: "Good morning",          // Lagos time
  onboarded: false,                                    // false → show the welcome setup (staff: always true)
  profile: null | { goalType, goal, experienceLevel, weeklyHours, motivation, onboardedAt },
  courses: [{ enrollmentId, courseId, slug, title, color,
    tutor: "Mr. Victor", tutorRole,                     // one tutor per track
    deliveryMode: "PHYSICAL_LAB" | "VIRTUAL_ZOOM", hasAccess,
    cohort: null | { name, startDate, endDate, phase: "BEFORE_START"|"IN_PROGRESS"|"FINISHED", daysToStart, daysToEnd },
    progress: { completed, total, percent },
    nextLesson: null | { id, title, moduleTitle, href },        // null until confirmed, or when finished
    nextLiveSession: null | { title, type, scheduledAt, meetingUrl }, // confirmed only
    latestFeedback: null | { assignmentTitle, score, feedback, gradedBy, gradedAt } }],
  week: { startsAt, lessonsCompleted, minutesStudied, goalMinutes, percentOfGoal },  // goal null until weeklyHours set
  streak: 3, communityUrl }
```

**`PATCH /api/lms/my-space/profile`**: any subset of
- `goalType`: `JOB` "Get a tech job" · `FREELANCE` "Freelance / earn on my own" · `OWN_PRODUCT` "Build my own product or business" · `UPSKILL` "Grow in my current job" · `OTHER`
- `goal`: their own words, max 160 chars, e.g. "Build websites for shops in Umuahia"
- `experienceLevel`: `BEGINNER` | `INTERMEDIATE` | `ADVANCED`
- `weeklyHours`: whole number 1–60
- `motivation`: "Why did you join BEMS?", max 280 chars

Returns `{ profile }`; `400 { error }` with a message to show. `onboarded` becomes true once goalType, experienceLevel and weeklyHours are all set. These answers are private (classmates never see them); the public class goal is still `PATCH /api/lms/my-goal`.

**UI, Phase 1:**
1. **Welcome setup** (`/welcome`, or a full-screen step): after sign-in, students with `onboarded: false` see 4 short steps (goal + their own words, experience, weekly hours, why they joined). Friendly, one question per screen on phones, "Skip for now" (ask again next sign-in, not every page). Ends on "Your space is ready, Ada" → dashboard.
2. **Dashboard header**: "{greeting}, {firstName}", their track, "Your tutor: {tutor}", class type ("Physical, BEMS lab, Umuahia" / "Virtual, live online"), cohort countdown ("Class starts in 5 days" / "Week 3 · 41 days to graduation"), and their goal quoted back ("You're here to: Build websites for shops in Umuahia").
3. **Continue where you left off**: big card linking to `nextLesson.href` ("Module 2 · Flexbox layouts"), with the course progress bar and the weekly ring "{minutesStudied} of {goalMinutes} min this week". Not confirmed yet → "Your space opens when admissions confirms your registration". Finished → certificate/capstone prompt.
4. **Next class + latest feedback** cards from `nextLiveSession` (Join button only when `meetingUrl`) and `latestFeedback` ("Mr. Victor: Clean layout. 88/100").
5. **Signed-in home page**: a signed-in student landing on `/` sees a personal "Welcome back, Ada" panel (continue lesson, next class) in place of the marketing hero; visitors and staff see the normal page.
6. **Fix**: the dashboard profile header overlaps the avatar at 375px.

### WhatsApp community + class type API (Claude Code → Antigravity)
**Class type at registration** (`src/app/subscriptions/page.tsx`): before payment, the student picks **Physical class (BEMS lab, Umuahia)** or **Virtual class (live online)**. No default: they must choose. Send it as `deliveryMode: "PHYSICAL_LAB" | "VIRTUAL_ZOOM"` in BOTH `POST /api/payments/init` and `POST /api/lms/enroll` (the server already stores it; without it everyone was recorded as physical). `GET /api/lms/me` now returns `deliveryMode` on each enrollment: show it on the dashboard ("Class: Virtual").

**Community button** (dashboard): `GET /api/lms/me` returns `communityUrl` (a `https://chat.whatsapp.com/...` link) only when the student has a confirmed registration, else `null`. When set, show a prominent green "Join the WhatsApp community" button (opens in a new tab) with a line like "Chat with your instructor and classmates". Don't render or log the link anywhere else.

**Settings > General** (admin):
- `GET/PATCH /api/admin/settings/general` now include `whatsappCommunityUrl`. Field label "WhatsApp community invite link", placeholder `https://chat.whatsapp.com/...`. Empty clears it. `400` with a message if it isn't a WhatsApp invite link.
- Button "Send link to confirmed students" → `POST /api/admin/settings/community/send-pending` → `{ sent }` ("Sent to 12 students"). For students confirmed before the link was set; each student only ever gets it once. `400` if no link is saved.
- Note under the field: "Each student gets this link automatically (email + notification) when their registration is confirmed."


## Codex motion QA (2026-11-14)

Compared `origin/main` at `c4cf776` with `origin/antigravity/motion-pages` at `d538b9c` (includes Antigravity's Hero fix). Built and served both locally with `npx next build --webpack` / `npx next start`; both builds passed. The motion build initially retried Google Fonts requests with `ECONNRESET` for about 3.7 minutes, then passed. The main build passed in about 20 seconds.

### Limited first-response check (not Lighthouse)

`curl --limit-rate 50k` requests (about 400 kbit/s down, without simulated latency, browser parsing, JS, CSS, image or API throttling) against local production servers. All requests returned HTTP 200 and the checked first-screen marker was present. These numbers are document transfer measurements only; they are not browser-level Slow 3G results.

| Page | Main bytes | Main TTFB / total (s) | Motion bytes | Motion TTFB / total (s) | Initial text |
|---|---:|---:|---:|---:|---|
| Home | 124,055 | 0.103 / 2.508 | 125,352 | 0.172 / 2.596 | “Earn Anywhere” present in both |
| Courses | 87,526 | 0.031 / 1.732 | 87,499 | 0.036 / 1.731 | BEMS cohort heading present in both |
| Subscriptions | 10,016 | 0.024 / 0.025 | 10,185 | 0.032 / 0.033 | “Loading subscription plans…” present in both |

### Requested browser checks

| Check | Main | Motion branch | Result |
|---|---|---|---|
| Lighthouse mobile Performance: home / courses / subscriptions | N/A | N/A | Could not run: browser automation host unavailable and Lighthouse CLI was neither installed nor cached; npm registry invocation stalled. No scores are claimed. |
| Lighthouse CLS: home / courses / subscriptions | N/A | N/A | Same limitation; requires browser instrumentation. |
| Reduced-motion runtime at mobile viewport | N/A | N/A | Could not emulate in browser. Static review: reveal hiding CSS is inside `prefers-reduced-motion: no-preference`; `MotionProvider` returns before adding `motion-ready` when reduction is enabled; Hero entrance keyframes are also no-preference only. No stuck-hidden path found by inspection. |
| Real slow-3G first-screen rendering | N/A | N/A | Browser-level throttling unavailable. Limited HTML response check above found first-screen text in each response; it does not test hydration/render timing. |
| Physical/touch tap feedback at 375px | N/A | N/A | Could not test in browser/device. Static CSS review confirms `:active` feedback for `.m-lift` and `.m-press` on no-preference devices. |

### Handoff findings

- No motion-specific defect was confirmed in the requested checks. Keep the browser-only items open for Antigravity to verify in a browser that can access localhost.
- **Check with Antigravity/Claude:** `/subscriptions` server-renders “Loading subscription plans…” rather than the course/payment selector on both main and motion. It is not blank, but the available HTML-only probe cannot establish how long that placeholder remains while JS and API requests load on slow connections. Verify a useful nonblank fallback in a browser under real Slow 3G throttling.
- No UI or behavior files were changed by Codex; this entry records QA evidence and limitations only.

## Codex payment review (2026-11-14)

- **High — repeated checkout initialization can create duplicate live charges.** `backend/src/routes/payments.ts:75-79` always creates a new pending transaction for the current remaining balance. There is no per-enrollment reservation or invalidation of earlier pending references. If multiple checkout references are paid, sequential confirmation can credit beyond `totalDue`; concurrent confirmation can mark both ledger entries successful while a stale enrollment write records only one. Suggested owner fix: serialize/reserve the outstanding balance and make confirmation conditional/atomic per enrollment.
- **Medium — amount verification rounds away kobo differences.** `backend/src/lib/payment-ledger.ts:38-45` rounds the Paystack amount to whole naira before comparing. A charge up to 50 kobo below the expected amount can round up and be credited. Compare integer kobo exactly against `txn.amount * 100`.
- **Low — legacy enrollment endpoint reports free enrollment as unlocked.** `backend/src/routes/lms.ts:150,201-223` treats every non-`bank` payment method as `null`, creates an ACTIVE/PENDING enrollment, and sends a notification claiming classroom access is unlocked. The access guard still blocks course content while payment is PENDING, but the confirmation is false. Reject unsupported/missing payment methods or return a neutral pending response.

**Added:** `backend/src/__tests__/payment-flow.test.ts` covers failed and abandoned results, amount mismatch, duplicate success webhooks, and installment deposit followed by balance payment. No payment or registration behavior was changed.

**Checks:** root and backend TypeScript checks pass; focused ESLint on the new test file passes (with the repo's `pages` directory advisory). Root ESLint reports 34 errors / 61 warnings across existing files. `next build` failed in the Google Fonts Turbopack import after a fonts.gstatic.com request timed out. Backend Vitest was not run: its tests load database configuration and `cleanupTestData` deletes rows, and I could not establish that the configured database is disposable without opening protected environment files or risking the prohibited database actions.
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

### 2026-11-14: Saved Campaign QR Studio Builder & Dynamic Short URL Dispatch (Antigravity)
- **Claimed by**: Antigravity (Frontend)
- **Branch**: `antigravity/qr-campaign-builder` (off `origin/claude/qr-campaigns`)
- **What was built**:
  - **1. Backend Persistence**: Integrated `POST /api/admin/qr-campaigns` (displaying 400 error message as is per spec), `GET /api/admin/qr-campaigns`, and `PATCH /api/admin/qr-campaigns/:id` for inline destination updates and active/inactive state toggles.
  - **2. Dynamic Short URL QR Encoding**: Saved campaign QR canvas strictly encodes `campaign.shortUrl` (`/q/<code>`), never the raw target destination, ensuring physical banners and flyers can be dynamically re-pointed or switched off at any time.
  - **3. Admin-Only Gating**: Public visitors see the 7 official PRD flex banner presets (MOUAU Main Gate, Umuahia Town Center, LGA Secretariat, 4 course flyers) plus partner/ambassador contact guidance; full builder form, quick-pickers, color palette, and live campaign gallery render strictly for administrators (`useLMS().user.role === 'ADMIN'`).
  - **4. Zero Fake Partnerships / Neutral Placeholders**: Removed all placeholder organizations/churches/ambassadors (Assemblies of God, St. Michael's Catholic, Winners Chapel, RCF, named ambassadors); starts with an empty list from the DB and neutral placeholder `"e.g. Youth seminar, March"`.
  - **5. Destination Quick-Pickers & Color Palette**: Preserved 8 one-click course and catalog chips and 5 high-contrast brand QR colors (Royal Purple, Deep Navy, Forest Emerald, Crimson Red, BEMS Amber).
  - **6. Actions**: Download PNG, Copy shortlink, Single QR 300 DPI Print Sheet modal, inline Target edit, and instant switch-off.
- **Verification**:
  - Frontend TypeScript (`tsc -p tsconfig.json --noEmit`): 0 errors.
  - ESLint (`npx eslint src/app/qr-studio/page.tsx`): 0 errors.
  - Next.js Build (`next build`): 32/32 routes compiled cleanly.
  - Mobile responsiveness: Verified clean responsive grid wrapping down to 375px mobile viewport.

### 2026-11-14: Admin Refund Excess Overpayment Button & Auth Test Limiter Fix (Antigravity)
- **Claimed by**: Antigravity (Frontend)
- **Branch**: `antigravity/refund-excess-button` (off `main`)
- **What was built**:
  - **1. Student Table "Refund excess" Button** (`src/app/admin/page.tsx`):
    - Added dedicated "Refund excess" button next to "Refund" for paying students.
    - Calls `POST /api/admin/enrollments/:id/refund-excess` without withdrawing the student.
    - Displays refunded excess notice upon success, or the server 400 error message if there's no overpayment.
  - **2. Earnings Tab "Refund excess" Modal** (`src/app/admin/page.tsx`):
    - Added "+ Refund excess" button in the Payment Ledger header alongside "Export CSV".
    - Opens a dedicated modal enabling admins to select an active paying student from a dropdown and trigger an excess refund in 1 click.
  - **3. Rate-Limit Test Stabilizer** (`backend/src/__tests__/auth.test.ts`):
    - Added `beforeEach` hook clearing loopback `signup:` quota attempts so back-to-back Vitest runs never trip HTTP 429.
- **Verification**:
  - Frontend TypeScript (`npx tsc --noEmit`): 0 errors.
  - Backend TypeScript (`npx tsc -p backend/tsconfig.json --noEmit`): 0 errors.
  - Backend Vitest (`npm test --prefix backend`): All tests passed.
  - Next.js Build (`npx next build`): 32/32 routes compiled cleanly.

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

### Claude browser QA (2026-11-14, headless Chrome + Lighthouse 12.3)

Local production builds, 375px phone and 1366px desktop, onboarding tours marked seen.

- Reveal: nothing on the first screen hidden; nothing still hidden after scrolling each page (home 18, courses 12, subscriptions 9 reveal blocks).
- Reduced motion: `motion-ready` never set, nothing hidden, no running animations.
- Desktop hover: hero floating card and stat cards lift (scale 1.015, -6px).
- **Bug found and fixed (27c3956):** touch taps gave no squash (CSS `:active` unreliable on touch). MotionProvider now sets `data-pressed`; after the fix taps squash (m-lift 0.975, m-press 0.94) on all three pages.
- CLS: 0 on all pages (load + full scroll).

| Lighthouse mobile Performance | main @ c4cf776 | motion branch |
|---|---|---|
| Home | 57, 57 | 51, 54, 53 |
| Courses | 68, 69 | 61, 66, 65 |
| Subscriptions | 51, 48 | 47, 52, 57 |

Motion costs about 3 to 4 points on home/courses. The baseline is already slow (about 2s total blocking time, LCP 4 to 5s on main): follow-up task.
