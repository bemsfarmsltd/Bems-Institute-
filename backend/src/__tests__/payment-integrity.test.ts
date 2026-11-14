import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { confirmPaymentTransaction } from "@/lib/payment-ledger";
import { createTestStudent, createTestAdmin, cleanupTestData, SessionAgent } from "./helpers";

// Regression tests for Codex's payment audit of main @ cabc99f, plus the
// cohort / bank-balance problems found while verifying it.

const success = (amountKobo: number) => ({
  status: "success" as const,
  amount: amountKobo,
  channel: "card",
  paid_at: new Date().toISOString(),
  gateway_response: "Approved"
});

async function init(agent: SessionAgent, paymentPlan: "full" | "installment" = "full") {
  const res = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan });
  expect(res.status).toBe(200);
  return res.body as { reference: string; amount: number; amountKobo: number };
}

describe("payment confirmation", () => {
  afterAll(cleanupTestData);

  it("credits a reference once when verify and the webhook arrive together", async () => {
    const { agent, userId } = await createTestStudent("integrity-race");
    const { reference, amountKobo } = await init(agent);

    const results = await Promise.all([
      confirmPaymentTransaction(reference, success(amountKobo)),
      confirmPaymentTransaction(reference, success(amountKobo)),
      confirmPaymentTransaction(reference, success(amountKobo))
    ]);
    expect(results.filter((r) => r.ok && !("alreadyProcessed" in r && r.alreadyProcessed))).toHaveLength(1);

    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });
    expect(enrollment.amountPaid).toBe(amountKobo / 100);
  });

  it("refuses a charge even 50 kobo short", async () => {
    const { agent, userId } = await createTestStudent("integrity-kobo");
    const { reference, amountKobo } = await init(agent);

    const result = await confirmPaymentTransaction(reference, success(amountKobo - 50));
    expect(result).toEqual({ ok: false, reason: "amount_mismatch" });
    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });
    expect(enrollment.amountPaid).toBe(0);
  });

  it("two checkout windows both paid: never over-credits, and the excess can be refunded", async () => {
    const { agent: admin } = await createTestAdmin("integrity-excess-admin");
    const { agent, userId } = await createTestStudent("integrity-two-tabs");
    const first = await init(agent);
    const second = await init(agent);

    // One after the other, as when a student pays in one window, then the
    // other. (Concurrently, the old code lost one payment instead.)
    await confirmPaymentTransaction(first.reference, success(first.amountKobo));
    await confirmPaymentTransaction(second.reference, success(second.amountKobo));

    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });
    expect(enrollment.amountPaid).toBe(enrollment.totalDue);
    expect(enrollment.paymentStatus).toBe("PAID_FULL");

    const refund = await admin.post(`/api/admin/enrollments/${enrollment.id}/refund-excess`);
    expect(refund.status).toBe(200);
    expect(refund.body.refunded).toBe(second.amount);
    const again = await admin.post(`/api/admin/enrollments/${enrollment.id}/refund-excess`);
    expect(again.status).toBe(400);

    // The student keeps their place.
    const after = await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollment.id } });
    expect(after.paymentStatus).toBe("PAID_FULL");
    expect(after.status).toBe(enrollment.status);
  });

  it("refund-excess is admin-only and refuses when nothing is overpaid", async () => {
    const { agent: admin } = await createTestAdmin("integrity-noexcess-admin");
    const { agent } = await createTestStudent("integrity-noexcess");
    const { reference, amountKobo } = await init(agent);
    await confirmPaymentTransaction(reference, success(amountKobo));
    const enrollment = await prisma.enrollment.findFirstOrThrow({ where: { paymentReference: reference } });

    expect((await agent.post(`/api/admin/enrollments/${enrollment.id}/refund-excess`)).status).toBe(403);
    expect((await admin.post(`/api/admin/enrollments/${enrollment.id}/refund-excess`)).status).toBe(400);
  });
});

describe("paying the balance", () => {
  const cohortIds: string[] = [];
  afterAll(async () => {
    await cleanupTestData();
    await prisma.cohort.deleteMany({ where: { id: { in: cohortIds } } });
  });

  it("keeps the student's cohort and plan when they pay the rest", async () => {
    const original = await prisma.cohort.create({
      data: { name: "Vitest Integrity A", startDate: new Date("2026-10-01"), endDate: new Date("2026-12-31"), targetStudents: 10, targetRevenue: 1 }
    });
    cohortIds.push(original.id);
    const { agent, userId } = await createTestStudent("integrity-balance");
    const deposit = await init(agent, "installment");
    await confirmPaymentTransaction(deposit.reference, success(deposit.amountKobo));
    const before = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });
    expect(before.cohortId).toBe(original.id);

    // Next intake opens, then the student pays the balance (the request even
    // claims the full plan, which used to reprice the registration).
    const next = await prisma.cohort.create({
      data: { name: "Vitest Integrity B", startDate: new Date("2027-01-01"), endDate: new Date("2027-03-31"), targetStudents: 10, targetRevenue: 1 }
    });
    cohortIds.push(next.id);
    const balance = await init(agent, "full");
    expect(balance.amount).toBe(before.totalDue - before.amountPaid);

    const after = await prisma.enrollment.findUniqueOrThrow({ where: { id: before.id } });
    expect(after.cohortId).toBe(original.id);
    expect(after.paymentPlan).toBe("installment");
    expect(after.totalDue).toBe(before.totalDue);
  });

  it("a bank transfer for the balance doesn't wipe the card deposit", async () => {
    const { agent, userId } = await createTestStudent("integrity-bank-balance");
    const deposit = await init(agent, "installment");
    await confirmPaymentTransaction(deposit.reference, success(deposit.amountKobo));

    const res = await agent.post("/api/lms/enroll", {
      courseId: "web-dev",
      paymentPlan: "installment",
      paymentMethod: "bank",
      bankReference: "TRF-BALANCE-1"
    });
    expect(res.status).toBe(200);

    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });
    expect(enrollment.amountPaid).toBe(deposit.amount);
    expect(enrollment.paymentStatus).toBe("PARTIAL");
    expect(enrollment.paymentReference).toBe("TRF-BALANCE-1");
  });
});

describe("registration entry points", () => {
  afterAll(cleanupTestData);

  it("a student can't register without choosing how to pay", async () => {
    const { agent } = await createTestStudent("integrity-no-method");
    const res = await agent.post("/api/lms/enroll", { courseId: "web-dev", paymentPlan: "full" });
    expect(res.status).toBe(400);
  });

  it("a refunded registration can't be reopened by starting a new checkout", async () => {
    const { agent: admin } = await createTestAdmin("integrity-refunded-admin");
    const { agent } = await createTestStudent("integrity-refunded");
    const { reference, amountKobo } = await init(agent);
    await confirmPaymentTransaction(reference, success(amountKobo));
    const enrollment = await prisma.enrollment.findFirstOrThrow({ where: { paymentReference: reference } });
    expect((await admin.post(`/api/admin/enrollments/${enrollment.id}/refund`, { amount: 1000 })).status).toBe(200);

    expect((await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" })).status).toBe(400);
  });
});
