# Task board

Shared between Claude Code, Antigravity and Codex — see "Working on this
repo" in `AGENTS.md` for lanes and folders. Newest entries at the top of each
section.

## In progress

| Task | Agent | Branch | Files / areas | Started |
|---|---|---|---|---|
| **My Space API, Phase 1** (done, awaiting review): welcome-setup answers saved privately; one `GET /api/lms/my-space` with first name + Lagos-time greeting, per course tutor / class type / cohort countdown / progress / next lesson / next live class / latest feedback, this week's study time vs the student's own weekly hours, streak. Also: the student live-classes list no longer gives meeting links to unpaid registrations. API below. | Claude Code | `claude/my-space` | `backend/` (schema + migration, `lib/my-space.ts`, `routes/lms.ts`, `routes/attendance.ts`) | 2026-11-16 |
| **My Space UI, Phase 1**: welcome setup, personal dashboard header, Continue-where-you-left-off, personal home for signed-in students, fix the 375px dashboard header overlap. Per the API below. | Antigravity | `antigravity/my-space-ui`, off `claude/my-space` | `src/app/dashboard/page.tsx`, new `src/app/welcome/page.tsx`, `src/app/page.tsx` / `src/components/Hero.tsx`, `src/context/LMSContext.tsx` | 2026-11-16 |
| **Personalisation audit + My Space review**: (1) walk the whole student journey (sign up → register → pay → confirmed → learn → feedback) at 375px and desktop, and list every spot that feels generic or impersonal (same for everyone, placeholder people/numbers, "Student" instead of their name, fake activity), with file:line and a one-line fix; (2) review `claude/my-space` for privacy (no other student's data, no meeting/lesson links before confirmation, staff behaviour) and the Lagos week/greeting edge cases; add tests in `backend/src/__tests__/` | Codex | `codex/my-space-review` | Read all; write `backend/src/__tests__/` + notes here | 2026-11-16 |

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
