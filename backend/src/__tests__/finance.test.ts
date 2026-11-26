import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { confirmPaymentTransaction } from "@/lib/payment-ledger";
import { planParts, viewSchedule, runInstallmentReminders, endOfLagosDay, lagosDate } from "@/lib/installments";
import { createTestAdmin, createTestStudent, cleanupTestData, SessionAgent, TEST_PASSWORD, testEmail } from "./helpers";

afterAll(cleanupTestData);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const DAY = 24 * 60 * 60 * 1000;

async function staff(label: string, role: UserRole) {
  const email = testEmail(label);
  const user = await prisma.user.create({ data: { name: `Vitest ${label}`, email, passwordHash: await hashPassword(TEST_PASSWORD), role } });
  const agent = new SessionAgent();
  expect((await agent.post("/api/auth/login", { email, password: TEST_PASSWORD })).status).toBe(200);
  return { agent, userId: user.id };
}

async function pay(agent: SessionAgent, body: Record<string, unknown>) {
  const init = await agent.post("/api/payments/init", { courseId: "web-dev", ...body });
  expect(init.status).toBe(200);
  const r = await confirmPaymentTransaction(init.body.reference, { status: "success", amount: init.body.amountKobo, channel: "card", paid_at: new Date().toISOString(), gateway_response: "Approved" });
  expect(r.ok).toBe(true);
  return init.body as { reference: string; amount: number };
}

describe("instalment plan rules", () => {
  it("splits into deposit + two halves, due 30 and 60 days after the cohort starts", () => {
    const createdAt = new Date("2026-11-01T10:00:00Z");
    const parts = planParts({ createdAt, totalDue: 90000, deposit: 35000, cohortStart: new Date("2026-11-10T08:00:00Z") });
    expect(parts.map((p) => p.amount)).toEqual([35000, 27500, 27500]);
    expect(parts.map((p) => lagosDate(p.dueDate))).toEqual(["2026-11-01", "2026-12-10", "2027-01-09"]);
    // A late joiner counts from their own registration.
    const late = planParts({ createdAt, totalDue: 90001, deposit: 35000, cohortStart: new Date("2026-10-01T08:00:00Z") });
    expect(late.map((p) => p.amount)).toEqual([35000, 27501, 27500]);
    expect(lagosDate(late[1].dueDate)).toBe("2026-12-01");
  });

  it("works out paid parts oldest first, and due soon / overdue in Lagos days", () => {
    const now = new Date("2026-12-08T12:00:00Z");
    const rows = [
      { id: "a", seq: 1, amount: 35000, dueDate: endOfLagosDay("2026-11-01") },
      { id: "b", seq: 2, amount: 27500, dueDate: endOfLagosDay("2026-12-10") },
      { id: "c", seq: 3, amount: 27500, dueDate: endOfLagosDay("2026-12-05") }
    ].map((r) => ({ ...r, remindedBeforeAt: null, remindedDueAt: null, remindedOverdueAt: null }));
    const v = viewSchedule(rows, { amountPaid: 40000, paymentStatus: "PARTIAL", status: "ACTIVE" }, now);
    expect(v.map((p) => [p.status, p.outstanding])).toEqual([["PAID", 0], ["DUE_SOON", 22500], ["OVERDUE", 27500]]);
    expect(v[2].daysOverdue).toBe(3);
    expect(viewSchedule(rows, { amountPaid: 35000, paymentStatus: "PAID_FULL", status: "ACTIVE" }, now).every((p) => p.status === "PAID")).toBe(true);
    expect(viewSchedule(rows, { amountPaid: 35000, paymentStatus: "REFUNDED", status: "WITHDRAWN" }, now).every((p) => p.status === "CANCELLED" && p.outstanding === 0)).toBe(true);
  });
});

describe("receipts", () => {
  it("the payer and finance can open a numbered receipt; other students and waivers can't", async () => {
    const { agent: student } = await createTestStudent("fin-receipt-student");
    await pay(student, { paymentPlan: "full" });
    const mine = (await student.get("/api/finance/my-payments")).body.enrollments[0];
    const paymentId = mine.payments[0].id as string;
    expect(mine.payments[0]).toMatchObject({ kind: "PAYMENT", method: "Card (Paystack)" });
    expect(mine.payments[0].receiptNumber).toMatch(/^BEMS-\d{4}-\d{6}$/);

    const r = await student.get(`/api/finance/receipts/${paymentId}`);
    expect(r.status).toBe(200);
    expect(r.body.receipt).toMatchObject({ kind: "PAYMENT", receiptNumber: mine.payments[0].receiptNumber, course: { title: "Web Development" }, balance: 0 });
    expect(r.body.receipt.paidToDate).toBe(r.body.receipt.totalDue);
    // The number doesn't change on a second look.
    expect((await student.get(`/api/finance/receipts/${paymentId}`)).body.receipt.receiptNumber).toBe(mine.payments[0].receiptNumber);

    const { agent: other } = await createTestStudent("fin-receipt-other");
    expect((await other.get(`/api/finance/receipts/${paymentId}`)).status).toBe(403);
    const fin = await staff("fin-receipt-finance", "FINANCE");
    expect((await fin.agent.get(`/api/finance/receipts/${paymentId}`)).status).toBe(200);
    const mgmt = await staff("fin-receipt-mgmt", "MANAGEMENT");
    expect((await mgmt.agent.get(`/api/finance/receipts/${paymentId}`)).status).toBe(403);

    const txn = await prisma.paymentTransaction.findUniqueOrThrow({ where: { id: paymentId } });
    const waiver = await prisma.paymentTransaction.create({ data: { reference: `waiver_vitest_${Date.now()}`, userId: txn.userId, courseId: txn.courseId, paymentPlan: "full", amount: 1, status: "SUCCESS", channel: "second_chance_waiver", paidAt: new Date() } });
    expect((await fin.agent.get(`/api/finance/receipts/${waiver.id}`)).status).toBe(404);
  });

  it("a staff-confirmed bank transfer gets a receipt and appears in the ledger with it", async () => {
    const { agent: admin } = await createTestAdmin("fin-bank-admin");
    const { agent: student, userId } = await createTestStudent("fin-bank-student");
    await student.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });
    const enr = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId, courseId: "web-dev" } } });
    expect((await admin.post(`/api/admin/enrollments/${enr.id}/payment`, { status: "PAID_FULL", amountPaid: enr.totalDue })).status).toBe(200);
    const bank = await prisma.paymentTransaction.findFirstOrThrow({ where: { userId, reference: { startsWith: "bank_" } } });
    expect(bank.receiptNumber).toMatch(/^BEMS-/); // given when the confirmation email went out
    const ledger = (await admin.get("/api/admin/payment-ledger")).body;
    const rows = (ledger.transactions ?? ledger.ledger ?? ledger) as { id: string; receiptNumber: string | null; hasReceipt: boolean }[];
    expect(rows.find((t) => t.id === bank.id)).toMatchObject({ receiptNumber: bank.receiptNumber, hasReceipt: true });
    expect((await student.get(`/api/finance/receipts/${bank.id}`)).body.receipt.method).toBe("Bank transfer");
  });
});

describe("instalment plans", () => {
  it("after the deposit a student sees 3 parts and pays the next one, not the whole balance", async () => {
    const { agent: student, userId } = await createTestStudent("fin-parts-student");
    const deposit = await pay(student, { paymentPlan: "installment" });
    const mine = (await student.get("/api/finance/my-payments")).body.enrollments[0];
    expect(mine.plan).toBe("installment");
    expect(mine.installments).toHaveLength(3);
    expect(mine.installments[0]).toMatchObject({ seq: 1, paid: true, status: "PAID", amount: deposit.amount });
    const second = mine.installments[1];
    expect(second.paid).toBe(false);

    const next = await student.post("/api/payments/init", { courseId: "web-dev", payWhat: "next" });
    expect(next.body.amount).toBe(second.amount);
    const all = await student.post("/api/payments/init", { courseId: "web-dev", payWhat: "balance" });
    expect(all.body.amount).toBe(mine.totalDue - deposit.amount);
    await prisma.paymentTransaction.deleteMany({ where: { userId, status: "PENDING" } });
  });

  it("finance sees overdue parts and can move a due date (audited); others can't", async () => {
    const { agent: student, userId } = await createTestStudent("fin-overdue-student");
    await pay(student, { paymentPlan: "installment" });
    await student.get("/api/finance/my-payments"); // creates the schedule
    const enr = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId, courseId: "web-dev" } } });
    const part2 = await prisma.installment.findUniqueOrThrow({ where: { enrollmentId_seq: { enrollmentId: enr.id, seq: 2 } } });
    await prisma.installment.update({ where: { id: part2.id }, data: { dueDate: new Date(Date.now() - 5 * DAY) } });

    const fin = await staff("fin-overdue-finance", "FINANCE");
    const list = (await fin.agent.get("/api/finance/installments?status=overdue")).body;
    const row = list.installments.find((p: { id: string }) => p.id === part2.id);
    expect(row).toMatchObject({ status: "OVERDUE", seq: 2, outstanding: part2.amount, student: { id: userId } });
    expect(row.daysOverdue).toBeGreaterThanOrEqual(4);
    expect(list.totals.overdueAmount).toBeGreaterThanOrEqual(part2.amount);

    const adm = await staff("fin-overdue-admissions", "ADMISSIONS");
    expect((await adm.agent.get("/api/finance/installments")).status).toBe(403);
    expect((await adm.agent.patch(`/api/finance/installments/${part2.id}`, { dueDate: "2030-01-15" })).status).toBe(403);
    expect((await fin.agent.patch(`/api/finance/installments/${part2.id}`, { dueDate: "not a date" })).status).toBe(400);
    const moved = await fin.agent.patch(`/api/finance/installments/${part2.id}`, { dueDate: "2030-01-15" });
    expect(moved.status).toBe(200);
    expect(lagosDate(new Date(moved.body.installment.dueDate))).toBe("2030-01-15");
    expect(await prisma.auditEvent.count({ where: { action: "installment.due_date_changed", targetId: enr.id } })).toBe(1);
  });

  it("reminders go out 3 days before, on the day and 3 days late, once each, only in the daytime", async () => {
    const { agent: student, userId } = await createTestStudent("fin-remind-student");
    await pay(student, { paymentPlan: "installment" });
    await student.get("/api/finance/my-payments");
    const enr = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId, courseId: "web-dev" } }, include: { installments: true } });
    const p2 = enr.installments.find((p) => p.seq === 2)!;
    const p3 = enr.installments.find((p) => p.seq === 3)!;
    const noon = new Date("2031-03-10T11:00:00Z"); // 12:00 Lagos
    await prisma.installment.update({ where: { id: p2.id }, data: { dueDate: endOfLagosDay("2031-03-12") } }); // in 2 days
    await prisma.installment.update({ where: { id: p3.id }, data: { dueDate: endOfLagosDay("2031-03-12") } });

    const night = new Date("2031-03-10T22:00:00Z"); // 23:00 Lagos
    expect(await runInstallmentReminders(night)).toEqual({ before: 0, due: 0, overdue: 0 });

    const first = await runInstallmentReminders(noon);
    expect(first.before).toBeGreaterThanOrEqual(2);
    const again = await runInstallmentReminders(noon);
    const mineAfter = await prisma.notification.count({ where: { userId, title: { startsWith: "Instalment due" } } });
    expect(mineAfter).toBe(2); // parts 2 and 3, once each
    expect(again.before).toBe(0);

    // On the day, then 3 days late (part 2 only, part 3 gets paid off first).
    await runInstallmentReminders(new Date("2031-03-12T11:00:00Z"));
    expect(await prisma.notification.count({ where: { userId, title: "Instalment due today" } })).toBe(2);
    await prisma.enrollment.update({ where: { id: enr.id }, data: { amountPaid: enr.amountPaid + p2.amount + p3.amount, paymentStatus: "PAID_FULL" } });
    await runInstallmentReminders(new Date("2031-03-15T11:00:00Z"));
    expect(await prisma.notification.count({ where: { userId, title: "Instalment overdue" } })).toBe(0);
  });
});

describe("daily check", () => {
  it("without Paystack keys it still lists the day's bank transfers", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", "");
    const { agent: admin } = await createTestAdmin("fin-recon-admin");
    const { agent: student, userId } = await createTestStudent("fin-recon-bank");
    await student.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });
    const enr = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId, courseId: "web-dev" } } });
    await admin.post(`/api/admin/enrollments/${enr.id}/payment`, { status: "PARTIAL", amountPaid: 10000 });
    const r = await admin.get(`/api/finance/reconciliation?date=${lagosDate(new Date())}`);
    expect(r.status).toBe(200);
    expect(r.body.paystackConfigured).toBe(false);
    expect(r.body.bankTransfers.some((b: { email: string; amount: number }) => b.email === testEmail("fin-recon-bank").toLowerCase() || b.amount === 10000)).toBe(true);
    expect((await admin.get("/api/finance/reconciliation?date=26-11-2026")).status).toBe(400);
  });

  it("sorts Paystack's list into matched, not credited, credited-but-not-on-Paystack and amount mismatch", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", "sk_test_vitest");
    const { agent: admin } = await createTestAdmin("fin-recon2-admin");
    const { agent: a } = await createTestStudent("fin-recon2-a");
    const { agent: b } = await createTestStudent("fin-recon2-b");
    const { agent: c } = await createTestStudent("fin-recon2-c");
    const matched = await pay(a, { paymentPlan: "full" });
    const notCredited = (await b.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" })).body;
    const ledgerOnly = await pay(c, { paymentPlan: "full" });
    const today = lagosDate(new Date());
    const paystack = [
      { reference: matched.reference, amount: matched.amount * 100, status: "success", paid_at: new Date().toISOString(), channel: "card" },
      { reference: notCredited.reference, amount: notCredited.amountKobo, status: "success", paid_at: new Date().toISOString(), channel: "card" },
      { reference: "not_from_this_site", amount: 500000, status: "success", paid_at: new Date().toISOString(), channel: "card" }
    ];
    const realFetch = globalThis.fetch;
    vi.stubGlobal("fetch", async (url: string | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.startsWith("https://api.paystack.co/transaction?")) return new Response(JSON.stringify({ status: true, data: paystack, meta: { pageCount: 1 } }));
      if (u.startsWith("https://api.paystack.co/transaction/verify/")) {
        const ref = decodeURIComponent(u.split("/").pop()!);
        if (ref === notCredited.reference) return new Response(JSON.stringify({ status: true, data: { ...paystack[1], gateway_response: "Approved" } }));
        return new Response(JSON.stringify({ status: true, data: { reference: ref, status: "failed", amount: 0, channel: null, paid_at: null, gateway_response: "Declined" } }));
      }
      return realFetch(url, init);
    });

    const r = (await admin.get(`/api/finance/reconciliation?date=${today}`)).body;
    expect(r.paystackConfigured).toBe(true);
    const refs = (k: string) => (r[k] as { reference: string }[]).map((x) => x.reference);
    expect(refs("matched")).toContain(matched.reference);
    expect(refs("paystackOnly")).toEqual(expect.arrayContaining([notCredited.reference, "not_from_this_site"]));
    expect(refs("ledgerOnly")).toContain(ledgerOnly.reference);

    // Recheck credits the real one; the stranger isn't in our ledger.
    const fin = await staff("fin-recon2-finance", "FINANCE");
    const re = await fin.agent.post(`/api/finance/reconciliation/${notCredited.reference}/recheck`);
    expect(re.body.result).toEqual({ ok: true });
    expect((await prisma.paymentTransaction.findUniqueOrThrow({ where: { reference: notCredited.reference } })).status).toBe("SUCCESS");
    expect((await fin.agent.post("/api/finance/reconciliation/not_from_this_site/recheck")).status).toBe(404);
    expect(await prisma.auditEvent.count({ where: { action: "payment.rechecked", details: { path: ["reference"], equals: notCredited.reference } } })).toBe(1);
  });
});
