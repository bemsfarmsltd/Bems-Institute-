// Pay-in-parts schedules: 3 parts (the deposit, then the rest split in two,
// due 30 and 60 days after the cohort starts, or after registration if that's
// later). A schedule is created once the deposit is paid. Whether a part is
// paid is worked out from Enrollment.amountPaid, oldest part first, so every
// way money arrives (Paystack, bank transfer, waiver) or leaves (refund)
// counts the same, and a fully paid registration has every part paid.

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendPush } from "@/lib/push";
import { sendEmail, frontendUrl, naira } from "@/lib/email";
import { audit } from "@/lib/audit";

const DAY = 24 * 60 * 60 * 1000;
export const DUE_SOON_DAYS = 3;
export const OVERDUE_REMINDER_DAYS = 3;

export type InstallmentStatus = "PAID" | "UPCOMING" | "DUE_SOON" | "OVERDUE" | "CANCELLED";

/** "YYYY-MM-DD" in Lagos. */
export function lagosDate(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
}
function dayNumber(isoDate: string): number {
  return Math.round(Date.parse(`${isoDate}T00:00:00Z`) / DAY);
}
/** Whole Lagos days from `now` until `due` (negative once it's past). */
export function daysUntil(due: Date, now: Date): number {
  return dayNumber(lagosDate(due)) - dayNumber(lagosDate(now));
}
/** The end of a Lagos day (23:59:59 WAT = 22:59:59 UTC): a part is due until then. */
export function endOfLagosDay(isoDate: string): Date {
  return new Date(`${isoDate}T22:59:59.000Z`);
}

/** Parses "YYYY-MM-DD" or an ISO date into the end of that Lagos day; null if invalid. */
export function parseDueDate(input: unknown): Date | null {
  if (typeof input !== "string") return null;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(input.trim());
  if (!m || Number.isNaN(Date.parse(`${m[1]}T00:00:00Z`))) return null;
  return endOfLagosDay(m[1]);
}

interface PlanInput {
  createdAt: Date;
  totalDue: number;
  deposit: number;
  cohortStart: Date | null;
}

/** The 3 parts for a registration (amounts and due dates). */
export function planParts({ createdAt, totalDue, deposit, cohortStart }: PlanInput): { seq: number; amount: number; dueDate: Date }[] {
  const first = Math.min(Math.max(deposit, 0), totalDue);
  const rest = totalDue - first;
  const second = Math.ceil(rest / 2);
  const third = rest - second;
  const base = cohortStart && cohortStart > createdAt ? cohortStart : createdAt;
  const due = (days: number) => endOfLagosDay(lagosDate(new Date(base.getTime() + days * DAY)));
  return [
    { seq: 1, amount: first, dueDate: endOfLagosDay(lagosDate(createdAt)) },
    { seq: 2, amount: second, dueDate: due(30) },
    { seq: 3, amount: third, dueDate: due(60) }
  ].filter((p) => p.amount > 0);
}

const scheduleEnrollmentWhere: Prisma.EnrollmentWhereInput = {
  paymentPlan: "installment",
  amountPaid: { gt: 0 },
  totalDue: { gt: 0 },
  paymentStatus: { not: "REFUNDED" },
  status: { not: "WITHDRAWN" },
  installments: { none: {} }
};

/** Creates schedules for paying pay-in-parts registrations that don't have one yet. */
export async function ensureSchedules(where: Prisma.EnrollmentWhereInput = {}): Promise<number> {
  const missing = await prisma.enrollment.findMany({
    where: { ...scheduleEnrollmentWhere, ...where },
    select: { id: true, createdAt: true, totalDue: true, course: { select: { deposit: true } }, cohort: { select: { startDate: true } } }
  });
  for (const e of missing) {
    const parts = planParts({ createdAt: e.createdAt, totalDue: e.totalDue, deposit: e.course.deposit, cohortStart: e.cohort?.startDate ?? null });
    await prisma.installment.createMany({ data: parts.map((p) => ({ ...p, enrollmentId: e.id })), skipDuplicates: true });
  }
  return missing.length;
}

export interface InstallmentView {
  id: string;
  seq: number;
  amount: number;
  dueDate: string;
  paid: boolean;
  outstanding: number;
  status: InstallmentStatus;
  daysOverdue: number;
  lastReminderAt: string | null;
}

type Row = { id: string; seq: number; amount: number; dueDate: Date; remindedBeforeAt: Date | null; remindedDueAt: Date | null; remindedOverdueAt: Date | null };
type EnrollmentState = { amountPaid: number; paymentStatus: string; status: string };

/** Paid/outstanding/status for each part, oldest part first. */
export function viewSchedule(rows: Row[], e: EnrollmentState, now: Date = new Date()): InstallmentView[] {
  const cancelled = e.paymentStatus === "REFUNDED" || e.status === "WITHDRAWN";
  let covered = e.paymentStatus === "PAID_FULL" ? Number.POSITIVE_INFINITY : e.amountPaid;
  return [...rows].sort((a, b) => a.seq - b.seq).map((r) => {
    const paidPart = Math.min(r.amount, Math.max(covered, 0));
    covered -= paidPart;
    const outstanding = r.amount - paidPart;
    const days = daysUntil(r.dueDate, now);
    const status: InstallmentStatus = cancelled ? "CANCELLED" : outstanding === 0 ? "PAID" : days < 0 ? "OVERDUE" : days <= DUE_SOON_DAYS ? "DUE_SOON" : "UPCOMING";
    const stamps = [r.remindedBeforeAt, r.remindedDueAt, r.remindedOverdueAt].filter((d): d is Date => Boolean(d));
    const last = stamps.length ? new Date(Math.max(...stamps.map((d) => d.getTime()))) : null;
    return {
      id: r.id,
      seq: r.seq,
      amount: r.amount,
      dueDate: r.dueDate.toISOString(),
      paid: outstanding === 0,
      outstanding: cancelled ? 0 : outstanding,
      status,
      daysOverdue: status === "OVERDUE" ? -days : 0,
      lastReminderAt: last?.toISOString() ?? null
    };
  });
}

/** What the next "pay next instalment" charge should be (0 if nothing is due). */
export async function nextInstallmentAmount(enrollmentId: string): Promise<number | null> {
  await ensureSchedules({ id: enrollmentId });
  const e = await prisma.enrollment.findUnique({ where: { id: enrollmentId }, select: { amountPaid: true, paymentStatus: true, status: true, installments: true } });
  if (!e || e.installments.length === 0) return null;
  const next = viewSchedule(e.installments, e).find((p) => p.outstanding > 0);
  return next?.outstanding ?? 0;
}

const STATUS_ORDER: Record<InstallmentStatus, number> = { OVERDUE: 0, DUE_SOON: 1, UPCOMING: 2, PAID: 3, CANCELLED: 4 };

/** The Finance list. `status` filters; "all" includes paid and cancelled parts. */
export async function listInstallments(filter: { status?: string; cohortId?: string }, now: Date = new Date()) {
  await ensureSchedules();
  const enrollments = await prisma.enrollment.findMany({
    where: { installments: { some: {} }, ...(filter.cohortId ? { cohortId: filter.cohortId } : {}) },
    select: {
      id: true, amountPaid: true, paymentStatus: true, status: true, installments: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      course: { select: { id: true, title: true } }
    }
  });
  const all = enrollments.flatMap((e) =>
    viewSchedule(e.installments, e, now).map((p) => ({ ...p, enrollmentId: e.id, student: e.user, course: e.course, parts: e.installments.length }))
  );
  const open = all.filter((p) => p.status === "OVERDUE" || p.status === "DUE_SOON");
  const totals = {
    overdueCount: open.filter((p) => p.status === "OVERDUE").length,
    overdueAmount: open.filter((p) => p.status === "OVERDUE").reduce((s, p) => s + p.outstanding, 0),
    dueSoonCount: open.filter((p) => p.status === "DUE_SOON").length,
    dueSoonAmount: open.filter((p) => p.status === "DUE_SOON").reduce((s, p) => s + p.outstanding, 0)
  };
  const want: Record<string, InstallmentStatus[]> = { overdue: ["OVERDUE"], due_soon: ["DUE_SOON"], upcoming: ["UPCOMING"] };
  const statuses = want[filter.status ?? ""] ?? null;
  const installments = all
    .filter((p) => (statuses ? statuses.includes(p.status) : filter.status === "all" ? true : p.status !== "PAID" && p.status !== "CANCELLED"))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.dueDate.localeCompare(b.dueDate));
  return { installments, totals };
}

/** Finance moves a due date. Resets the reminders for that part so the new date gets its own. */
export async function changeDueDate(id: string, dueDate: Date, actor: { id: string; name: string }) {
  const row = await prisma.installment.findUnique({ where: { id }, include: { enrollment: { select: { id: true, user: { select: { name: true } }, course: { select: { title: true } } } } } });
  if (!row) return null;
  const updated = await prisma.installment.update({
    where: { id },
    data: { dueDate, remindedBeforeAt: null, remindedDueAt: null, remindedOverdueAt: null }
  });
  await audit({
    actor, action: "installment.due_date_changed", targetType: "enrollment", targetId: row.enrollment.id,
    summary: `${row.enrollment.user.name} · ${row.enrollment.course.title}: part ${row.seq} due ${lagosDate(row.dueDate)} → ${lagosDate(dueDate)}`,
    details: { installmentId: id, seq: row.seq, from: row.dueDate.toISOString(), to: dueDate.toISOString() }
  });
  return updated;
}

/** Lagos hours when payment reminders may go out (8am to 7pm). */
export function inPaymentReminderWindow(now: Date): boolean {
  const hour = Number(now.toLocaleString("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", hour12: false }));
  return hour >= 8 && hour < 19;
}

type Stage = "BEFORE" | "DUE" | "OVERDUE";
const STAMP: Record<Stage, "remindedBeforeAt" | "remindedDueAt" | "remindedOverdueAt"> = { BEFORE: "remindedBeforeAt", DUE: "remindedDueAt", OVERDUE: "remindedOverdueAt" };

/** Sends due payment reminders (in-app, push, email); each stage once per part. */
export async function runInstallmentReminders(now: Date = new Date()): Promise<{ before: number; due: number; overdue: number }> {
  const sent = { before: 0, due: 0, overdue: 0 };
  if (!inPaymentReminderWindow(now)) return sent;
  await ensureSchedules();
  const rows = await prisma.installment.findMany({
    where: {
      dueDate: { lte: new Date(now.getTime() + (DUE_SOON_DAYS + 1) * DAY) },
      OR: [{ remindedBeforeAt: null }, { remindedDueAt: null }, { remindedOverdueAt: null }],
      enrollment: { paymentStatus: { notIn: ["PAID_FULL", "REFUNDED"] }, status: { not: "WITHDRAWN" }, user: { deactivatedAt: null } }
    },
    select: { id: true, enrollmentId: true }
  });
  const enrollmentIds = [...new Set(rows.map((r) => r.enrollmentId))];
  for (const enrollmentId of enrollmentIds) {
    const e = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        amountPaid: true, paymentStatus: true, status: true, installments: true,
        user: { select: { id: true, name: true, email: true } },
        course: { select: { title: true } }
      }
    });
    if (!e) continue;
    const views = viewSchedule(e.installments, e, now);
    for (const v of views) {
      if (v.outstanding === 0 || v.status === "CANCELLED") continue;
      const row = e.installments.find((r) => r.id === v.id)!;
      const days = daysUntil(row.dueDate, now);
      const stage: Stage | null = days >= 1 && days <= DUE_SOON_DAYS ? "BEFORE" : days === 0 ? "DUE" : days <= -OVERDUE_REMINDER_DAYS ? "OVERDUE" : null;
      if (!stage || row[STAMP[stage]]) continue;
      // Claim this stage (and any earlier one it replaces) so a parallel run can't send it too.
      const earlier: Stage[] = stage === "OVERDUE" ? ["BEFORE", "DUE"] : stage === "DUE" ? ["BEFORE"] : [];
      const claim = await prisma.installment.updateMany({
        where: { id: row.id, [STAMP[stage]]: null },
        data: Object.fromEntries([stage, ...earlier].map((s) => [STAMP[s], now]))
      });
      if (claim.count === 0) continue;
      await sendReminder(stage, { ...v, days }, e.user, e.course.title, views.length);
      sent[stage === "BEFORE" ? "before" : stage === "DUE" ? "due" : "overdue"]++;
    }
  }
  return sent;
}

async function sendReminder(
  stage: Stage,
  part: InstallmentView & { days: number },
  student: { id: string; name: string; email: string },
  courseTitle: string,
  parts: number
) {
  const first = student.name.trim().split(/\s+/)[0] || student.name;
  const when = new Date(part.dueDate).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", weekday: "long", day: "numeric", month: "long" });
  const amount = naira(part.outstanding);
  const title =
    stage === "BEFORE" ? `Instalment due ${part.days === 1 ? "tomorrow" : `in ${part.days} days`}` : stage === "DUE" ? "Instalment due today" : "Instalment overdue";
  const body =
    stage === "OVERDUE"
      ? `Part ${part.seq} of ${parts} for ${courseTitle} (${amount}) was due on ${when}. Please pay now, or talk to us if you need more time.`
      : `Part ${part.seq} of ${parts} for ${courseTitle}: ${amount}, due ${stage === "DUE" ? "today" : when}.`;
  const url = "/dashboard#payments";
  await createNotification({ userId: student.id, title, message: body, category: "PAYMENT", linkUrl: url });
  await sendPush(student.id, { title, body, url, tag: `installment-${part.id}-${stage}` });
  await sendEmail({
    to: student.email,
    subject: `${title}: ${courseTitle}`,
    text: [
      `Hello ${first},`,
      body,
      `Pay securely here: ${frontendUrl(url)}`,
      "Already paid by bank transfer? Reply to this email with your reference and we'll update your account.",
      "BEMS Finance"
    ].join("\n\n")
  });
}
