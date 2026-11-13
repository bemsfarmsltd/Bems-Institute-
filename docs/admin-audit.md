# Admin console audit

Reviewed on the combined code of `claude/registration-approval`,
`antigravity/lms-core-upgrade` and `claude/security-hardening`, which is
what goes live once they merge. Backend fixes: Claude, on
`claude/admin-fixes`. Frontend: Antigravity.

## Summary

The plumbing is sound. Every admin route checks the caller's role on the
server, every API call the admin page makes has a matching route, and
payment actions are admin-only. The problems are what the console *shows*:

- **The landing Dashboard tab is made up.** "1958 Completed Courses",
  "1600 Enrolled", "1235 In Progress", "845 hrs Watch Time", the earnings
  chart, the traffic donut, "Support Requests" and "Top Instructors" are
  all fixed numbers and names copied from a template.
- **The Students tab mixes fake students into the real ones.** Template
  students ("Blessing Adeyemi, Mumbai", ...) are listed alongside real
  students, and every real student gets a borrowed template avatar and
  "4 courses".
- **Instructors, Instructor Requests and Reviews tabs are fake.** Hard-coded
  people; approving a request or a review only changes the screen and is
  lost on refresh.
- **Money figures are wrong.** "Total Collected" still counts refunded
  money and waived second-chance balances. "Students" and "Outstanding
  Balance" count everyone who ever opened a checkout and left.

## What works

| Area | Status |
|---|---|
| Admin sign-in and registration (server-checked role) | Works |
| Registration approval queue + Confirm | Works (new) |
| Earnings: payment ledger table + CSV export | Works |
| Roster CSV export | Works (formula-injection fix below) |
| Cohorts: list, create, edit targets | Works |
| Placements / job-help list, promote graduate to instructor | Works |
| Leads queue, welcome-call tracker | Works (welcome calls fix below) |
| Bank-transfer recording, refunds, second chance | Work, with the bugs below |
| Course list, create course, change course status | Works |
| Graduates page (`/admin/graduates`) | Works |
| Settings: site info, registration mode, own notification categories | Works; registration mode is enforced at sign-up |

## Bugs

### Backend (Claude, `claude/admin-fixes`)

| # | Severity | Problem | Fix |
|---|---|---|---|
| B1 | High | Revenue counts refunded money (a refund never lowers `amountPaid`) and second-chance waivers (recorded as a `SUCCESS` payment). | Revenue is computed from the ledger: real payments minus refunds, waivers excluded and reported separately. |
| B2 | High | "Students", completion rate, track counts and outstanding balance include abandoned checkouts and refunded students. | Count only paid registrations; report abandoned checkouts separately. |
| B3 | High | CSV exports run spreadsheet formulas: a student named `=HYPERLINK(...)` executes when an admin opens the roster in Excel. | Prefix cells that start with `= + - @` so they're plain text. |
| B4 | Medium | Second chance works on any enrollment, even one that was never paid, which gives the whole course away and books the price as revenue. | Require the student to be marked Dropped and to have paid something. |
| B5 | Medium | A refund can be recorded twice for the same enrollment. | Refuse a second refund. |
| B6 | Medium | Recording a bank payment can silently *lower* what a student paid, can mark PARTIAL when the full amount is in, and two quick clicks can write the payment to the ledger twice. | Validate, and do the update and the ledger entry in one transaction. |
| B7 | Medium | The welcome-call list includes people who opened a checkout and never paid, so staff would phone non-customers. | Paid registrations only. |
| B8 | Medium | New admins sign up with one shared code that never expires, and there's no way to see or remove admins and instructors. | Staff list with deactivate/reactivate (below). Owner should change `ADMIN_ACCESS_CODE` on Render after onboarding and whenever staff leave. |
| B9 | Low | Instructors can read the full payment ledger, revenue and every student's contact details. | **Owner decision.** Left as is until the owner decides. |

### Frontend (Antigravity)

| # | Problem | Fix |
|---|---|---|
| F1 | Students tab includes template students and borrowed avatars. | Delete `EDUPORT_STUDENTS`; use `UserAvatar`, real course count, real location from delivery mode. |
| F2 | Dashboard tab tiles, earnings chart, traffic donut, Support Requests, Top Instructors are fake. | Use the new analytics fields below. Suggested: tiles = paid students, awaiting confirmation, completed, lessons completed; chart = `revenueByMonth`; donut = `bannerChannelYield`; "Support Requests" → the awaiting-confirmation queue + newest leads; "Top Instructors" → staff list. |
| F3 | Instructors tab and Instructor Requests tab are fake, and "instructor requests" doesn't exist anywhere in the database. | Instructors tab → `GET /api/admin/staff`. Remove Instructor Requests until there's a real process behind it. |
| F4 | Reviews tab is fake; actions aren't saved. | Use `GET /api/admin/reviews` and `DELETE /api/admin/reviews/:id`. |
| F5 | Earnings tiles use the miscounted fields. | Use `totalRevenue`, `outstandingBalance`, `refundedTotal`, `waivedTotal`. |
| F6 | Settings → Email still says no email provider is connected. | Say transactional email goes through Resend, configured on the server. |

## API changes (backend, `claude/admin-fixes`)

### `GET /api/admin/analytics`: corrected and extended

Changed meaning (same names):
- `totalStudents`: paid registrations only (PARTIAL or PAID_FULL).
- `totalRevenue`: net money actually received: payments minus refunds,
  excluding second-chance waivers.
- `completionRate`, `trackDistribution`, `deliveryDistribution`: paid
  registrations only.

New fields:
```json
{
  "outstandingBalance": 120000,
  "refundedTotal": 0,
  "waivedTotal": 0,
  "abandonedCheckouts": 7,
  "pendingBankTransfers": 1,
  "awaitingApproval": 2,
  "completedEnrollments": 3,
  "inProgressEnrollments": 11,
  "lessonsCompleted": 240,
  "revenueByMonth": [{ "month": "2026-10", "amount": 450000 }]
}
```
`revenueByMonth` covers the last 12 months, oldest first, with months that
had no payments included as 0. `abandonedCheckouts` are unpaid
registrations with no reference (a Paystack window opened and closed);
`pendingBankTransfers` are unpaid ones with a transfer reference that
staff still need to match. The new fields are already in
`AnalyticsSummary` (`src/types/lms.ts`) and `EMPTY_ANALYTICS`.

Also changed: `POST /api/admin/enrollments/:id/payment` now refuses to
lower a recorded amount, refuses PARTIAL for a full amount, returns
`{ unchanged: true }` on a repeat click, and `409` if another admin just
changed it. Second chance needs the student Dropped with a payment on
record. A second refund of the same registration is refused.

### Staff (ADMIN only)
- `GET /api/admin/staff` → `{ staff: [{ id, name, email, role, avatarUrl, active, createdAt }] }`
  (every ADMIN and INSTRUCTOR).
- `POST /api/admin/staff/:id/deactivate` → signs them out everywhere and
  blocks sign-in. Refuses your own account and the last active admin.
- `POST /api/admin/staff/:id/reactivate`.

### Reviews (ADMIN only)
- `GET /api/admin/reviews` → `{ reviews: [{ id, rating, comment, createdAt, student: { id, name, email }, course: { id, title } }] }`, newest first.
- `DELETE /api/admin/reviews/:id` → removes an abusive or fake review.

## Later upgrades (not started)

- Record who approved, refunded or waived what (an admin activity log).
- Replace the shared staff code with one-time invites an admin sends.
- Pay out a refund through Paystack instead of bookkeeping only.
- Split the 5,400-line `src/app/admin/page.tsx` into one file per tab.
