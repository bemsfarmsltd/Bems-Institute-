# QR → registration → payment → admin approval → access

How a student gets from a QR code to an unlocked classroom. Backend:
`claude/registration-approval`. Frontend: Antigravity.

## The flow

| # | Step | Who | What happens |
|---|---|---|---|
| 1 | Scan QR | Student | Opens `/subscriptions?course=<slug>&utm_source=<qr-label>` (the QR studio already generates these). |
| 2 | Register | Student | Not signed in → send them to sign-up with a return link back to step 1 (keep `course` and `utm_source`). Signed in → straight to step 3. |
| 3 | Pay | Student | `POST /api/payments/init` → Paystack popup → `POST /api/payments/verify`. Unchanged from today. |
| 4 | Receipt | Backend | Student gets an in-app notification and an email: "payment received, admissions will confirm". |
| 5 | Admin alert | Backend | Every ADMIN gets an in-app notification and an email: "new payment, confirm registration". |
| 6 | Confirm | Admin | Admin console → "Awaiting confirmation" list → **Confirm** → `POST /api/admin/enrollments/:id/approve`. |
| 7 | Unlock | Backend | Enrollment becomes `ACTIVE`. Student gets an in-app notification and an email with a link to lesson 1. |

Bank transfers keep their existing one-step path: an admin recording the
payment (`POST /api/admin/enrollments/:id/payment`) also confirms the
registration, and the student gets an email.

## Access rule (backend-enforced)

A student can open paid content only when **both** of these hold:
`paymentStatus` is `PARTIAL`/`PAID_FULL` **and** `status` is not `PENDING`
or `WITHDRAWN`. Lesson videos, quiz answers, progress, quizzes and
submissions all follow this rule. Students who were already active keep
their access. Only new first payments wait for approval.

## API changes the frontend needs

### `POST /api/payments/verify`: two new fields
```json
{ "ok": true, "paymentStatus": "PAID_FULL", "enrollmentStatus": "PENDING", "awaitingApproval": true, "amountPaid": 79000, "totalDue": 79000 }
```
When `awaitingApproval` is true, show a "Payment received. Admissions will
confirm your registration shortly, and we've emailed you a receipt" screen.
Don't send the student into the classroom, because it's still locked.

### `GET /api/lms/me`: `enrolledCourseIds` meaning changed, new `enrollments`
- `enrolledCourseIds` now lists **only courses the student can open**. It
  used to include unpaid enrollments too.
- New `enrollments` array, one per registration:
```json
{ "id": "…", "courseId": "web-dev", "status": "PENDING", "paymentStatus": "PAID_FULL",
  "paymentPlan": "full", "amountPaid": 79000, "totalDue": 79000,
  "hasAccess": false, "awaitingApproval": true }
```
Use it for the dashboard and the course page states: *not paid*, *paid,
awaiting confirmation*, *active*.

### `GET /api/admin/enrollments/pending-approval` (ADMIN only)
```json
{ "enrollments": [ {
  "id": "…", "student": { "id": "…", "name": "…", "email": "…", "phone": "…" },
  "course": { "id": "web-dev", "title": "…", "slug": "web-dev" },
  "cohortName": "October 2026", "deliveryMode": "PHYSICAL_LAB", "source": "qr_flyer",
  "paymentPlan": "full", "paymentStatus": "PAID_FULL", "amountPaid": 79000, "totalDue": 79000,
  "paymentReference": "bems_…", "paymentChannel": "card",
  "paidAt": "2026-11-13T…Z", "registeredAt": "2026-11-13T…Z" } ] }
```
Oldest first. Show it at the top of the admin students page with a count
badge.

### `POST /api/admin/enrollments/:id/approve` (ADMIN only, no body)
- `200 { enrollment, alreadyApproved: false }`: approved, and the student was notified.
- `200 { enrollment, alreadyApproved: true }`: already approved (safe to retry).
- `400`: no confirmed payment yet. `403`: not an admin. `404`: unknown id.

`PATCH /api/admin/enrollments/:id/status` now refuses `PENDING → ACTIVE`;
use `/approve` for that.

## Email setup (owner)

Set these on Render: `RESEND_API_KEY`, `EMAIL_FROM` (an address on a domain
verified in Resend), and optionally `ADMIN_NOTIFY_EMAILS`. Until they're set,
emails are written to the server log instead of being sent. In-app
notifications work either way.

## Frontend implementation (Antigravity)

1. **Seamless Sign-up / Login Return (`src/app/login/page.tsx`)**:
   - Supports `?redirect=` and `?returnUrl=`.
   - When visitors arrive via flyer QR (`/subscriptions?course=<id>&utm_source=qr_flyer`), unauthenticated students are prompted to sign up/in and smoothly redirected back to checkout with all track and attribution parameters intact.

2. **LMS Context & State (`src/types/lms.ts`, `src/context/LMSContext.tsx`)**:
   - Added `UserEnrollmentRecord` interface tracking `status`, `paymentStatus`, `hasAccess`, `awaitingApproval`, and payment amounts.
   - Populated from `GET /api/lms/me` and exposed as `userEnrollments` across the entire frontend.

3. **Post-Payment Confirmation Banner (`src/app/subscriptions/page.tsx`)**:
   - Replaced premature "You're enrolled! Start First Lesson" banner with an official "Payment Verified · Awaiting Admissions Confirmation" status card when `awaitingApproval` is true.
   - Displays payment reference, amount paid, cohort details, WhatsApp Admissions Desk link, and student dashboard link.

4. **Student Dashboard Admissions Tracker (`src/app/dashboard/page.tsx`)**:
   - Students with a paid registration awaiting admin approval see a prominent "Registration Pending Confirmation" card informing them that admissions is reviewing their placement and will notify them by email when lessons unlock.

5. **Admin Admissions Queue & 1-Click Approval (`src/app/admin/page.tsx`)**:
   - Fetches `GET /api/admin/enrollments/pending-approval`.
   - Displays a count badge in the sidebar navigation next to "Students".
   - Renders an "Awaiting Registration Confirmation" queue card with applicant name, email, phone, course, cohort, mode, QR source, amount paid, and reference.
   - Prominent **"Confirm Registration"** button calls `POST /api/admin/enrollments/:id/approve`, unlocks the course, and dispatches the confirmation email.
   - Also integrated directly into the Student Grid and List views for fast verification.
