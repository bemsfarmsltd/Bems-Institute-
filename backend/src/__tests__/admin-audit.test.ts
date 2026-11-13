import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { confirmPaymentTransaction } from "@/lib/payment-ledger";
import { toCsv } from "@/lib/csv";
import { createTestStudent, createTestAdmin, cleanupTestData, SessionAgent } from "./helpers";

// Regression tests for docs/admin-audit.md (backend items B1-B8).

async function payFull(agent: SessionAgent, courseId = "web-dev") {
  const init = await agent.post("/api/payments/init", { courseId, paymentPlan: "full" });
  expect(init.status).toBe(200);
  await confirmPaymentTransaction(init.body.reference, {
    status: "success",
    amount: init.body.amountKobo,
    channel: "card",
    paid_at: new Date().toISOString(),
    gateway_response: "Approved"
  });
  return prisma.enrollment.findFirstOrThrow({ where: { paymentReference: init.body.reference } });
}

describe("admin analytics counts real students and real money", () => {
  afterAll(cleanupTestData);

  it("ignores abandoned checkouts, and nets out refunds", async () => {
    const { agent: admin } = await createTestAdmin("audit-analytics-admin");
    const before = (await admin.get("/api/admin/analytics")).body;

    // Opened the Paystack window and left: not a student, no revenue.
    const { agent: browser } = await createTestStudent("audit-abandoned");
    await browser.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });

    const afterAbandon = (await admin.get("/api/admin/analytics")).body;
    expect(afterAbandon.totalStudents).toBe(before.totalStudents);
    expect(afterAbandon.totalRevenue).toBe(before.totalRevenue);
    expect(afterAbandon.abandonedCheckouts).toBe(before.abandonedCheckouts + 1);

    // A real payment counts...
    const { agent: payer } = await createTestStudent("audit-payer");
    const enrollment = await payFull(payer);
    const afterPay = (await admin.get("/api/admin/analytics")).body;
    expect(afterPay.totalStudents).toBe(before.totalStudents + 1);
    expect(afterPay.totalRevenue).toBe(before.totalRevenue + enrollment.amountPaid);
    expect(afterPay.awaitingApproval).toBe(before.awaitingApproval + 1);

    // ...and a refund takes it back out, which summing amountPaid never did.
    const refund = await admin.post(`/api/admin/enrollments/${enrollment.id}/refund`, {
      amount: enrollment.amountPaid,
      reason: "test"
    });
    expect(refund.status).toBe(200);
    const afterRefund = (await admin.get("/api/admin/analytics")).body;
    expect(afterRefund.totalRevenue).toBe(before.totalRevenue);
    expect(afterRefund.refundedTotal).toBe(before.refundedTotal + enrollment.amountPaid);
    expect(afterRefund.totalStudents).toBe(before.totalStudents);
    expect(afterRefund.revenueByMonth).toHaveLength(12);
  });

  it("refuses a second refund of the same registration", async () => {
    const { agent: admin } = await createTestAdmin("audit-refund-admin");
    const { agent } = await createTestStudent("audit-refund-twice");
    const enrollment = await payFull(agent);

    const first = await admin.post(`/api/admin/enrollments/${enrollment.id}/refund`, { amount: 1000 });
    expect(first.status).toBe(200);
    const second = await admin.post(`/api/admin/enrollments/${enrollment.id}/refund`, { amount: 1000 });
    expect(second.status).toBe(400);
    const refunds = await prisma.paymentTransaction.count({
      where: { userId: enrollment.userId, courseId: enrollment.courseId, status: "REFUNDED" }
    });
    expect(refunds).toBe(1);
  });
});

describe("second chance", () => {
  afterAll(cleanupTestData);

  it("needs a dropped, paying student, and its waiver isn't revenue", async () => {
    const { agent: admin } = await createTestAdmin("audit-sc-admin");
    const cohort = await prisma.cohort.findFirstOrThrow({ orderBy: { createdAt: "desc" } });

    // Unpaid registration: would give the course away.
    const { agent: unpaid, userId: unpaidId } = await createTestStudent("audit-sc-unpaid");
    await unpaid.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });
    const unpaidEnrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId: unpaidId, courseId: "web-dev" } }
    });
    await prisma.enrollment.update({ where: { id: unpaidEnrollment.id }, data: { status: "DROPPED" } });
    const refused = await admin.post(`/api/admin/enrollments/${unpaidEnrollment.id}/second-chance`, {
      targetCohortId: cohort.id
    });
    expect(refused.status).toBe(400);

    // Paid the deposit, then dropped: eligible, and the balance is waived.
    const { agent: student } = await createTestStudent("audit-sc-paid");
    const init = await student.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "installment" });
    await confirmPaymentTransaction(init.body.reference, {
      status: "success",
      amount: init.body.amountKobo,
      channel: "card",
      paid_at: new Date().toISOString(),
      gateway_response: "Approved"
    });
    const enrollment = await prisma.enrollment.findFirstOrThrow({ where: { paymentReference: init.body.reference } });

    const notDropped = await admin.post(`/api/admin/enrollments/${enrollment.id}/second-chance`, {
      targetCohortId: cohort.id
    });
    expect(notDropped.status).toBe(400);

    await admin.patch(`/api/admin/enrollments/${enrollment.id}/status`, { status: "DROPPED" });
    const before = (await admin.get("/api/admin/analytics")).body;
    const ok = await admin.post(`/api/admin/enrollments/${enrollment.id}/second-chance`, {
      targetCohortId: cohort.id
    });
    expect(ok.status).toBe(200);
    expect(ok.body.waivedAmount).toBeGreaterThan(0);

    const after = (await admin.get("/api/admin/analytics")).body;
    expect(after.totalRevenue).toBe(before.totalRevenue);
    expect(after.waivedTotal).toBe(before.waivedTotal + ok.body.waivedAmount);

    // The waived part can't be refunded: only the deposit actually came in.
    const tooMuch = await admin.post(`/api/admin/enrollments/${enrollment.id}/refund`, {
      amount: enrollment.amountPaid + 1
    });
    expect(tooMuch.status).toBe(400);
  });
});

describe("recording a bank payment", () => {
  afterAll(cleanupTestData);

  it("won't lower a payment, and a repeat click records nothing twice", async () => {
    const { agent: admin } = await createTestAdmin("audit-bank-admin");
    const { agent, userId } = await createTestStudent("audit-bank");
    await agent.post("/api/lms/enroll", {
      courseId: "web-dev",
      paymentPlan: "installment",
      paymentMethod: "bank",
      bankReference: "TRF-123"
    });
    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });

    const first = await admin.post(`/api/admin/enrollments/${enrollment.id}/payment`, {
      status: "PARTIAL",
      amountPaid: 20000
    });
    expect(first.status).toBe(200);

    const repeat = await admin.post(`/api/admin/enrollments/${enrollment.id}/payment`, {
      status: "PARTIAL",
      amountPaid: 20000
    });
    expect(repeat.status).toBe(200);
    expect(repeat.body.unchanged).toBe(true);

    const lower = await admin.post(`/api/admin/enrollments/${enrollment.id}/payment`, {
      status: "PARTIAL",
      amountPaid: 5000
    });
    expect(lower.status).toBe(400);

    const partialButFull = await admin.post(`/api/admin/enrollments/${enrollment.id}/payment`, {
      status: "PARTIAL",
      amountPaid: enrollment.totalDue
    });
    expect(partialButFull.status).toBe(400);

    const ledger = await prisma.paymentTransaction.findMany({ where: { userId, channel: "bank" } });
    expect(ledger).toHaveLength(1);
    expect(ledger[0].amount).toBe(20000);
  });
});

describe("welcome-call list", () => {
  afterAll(cleanupTestData);

  it("leaves out people who never paid", async () => {
    const { agent: admin } = await createTestAdmin("audit-welcome-admin");
    const { agent: unpaid, email: unpaidEmail } = await createTestStudent("audit-welcome-unpaid");
    await unpaid.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });
    const { agent: paid, email: paidEmail } = await createTestStudent("audit-welcome-paid");
    await payFull(paid);

    const list = await admin.get("/api/admin/welcome-calls");
    const emails = list.body.enrollments.map((e: { studentEmail: string }) => e.studentEmail);
    expect(emails).toContain(paidEmail);
    expect(emails).not.toContain(unpaidEmail);
  });
});

describe("staff management", () => {
  afterAll(cleanupTestData);

  it("lists staff, and deactivating ends their session", async () => {
    const { agent: admin, userId: adminId } = await createTestAdmin("audit-staff-admin");
    const { agent: other, userId: otherId } = await createTestAdmin("audit-staff-other");

    const list = await admin.get("/api/admin/staff");
    expect(list.status).toBe(200);
    const ids = list.body.staff.map((s: { id: string }) => s.id);
    expect(ids).toContain(otherId);

    const self = await admin.post(`/api/admin/staff/${adminId}/deactivate`);
    expect(self.status).toBe(400);

    expect((await other.get("/api/admin/roster")).status).toBe(200);
    const off = await admin.post(`/api/admin/staff/${otherId}/deactivate`);
    expect(off.status).toBe(200);
    expect((await other.get("/api/admin/roster")).status).toBe(403);

    const on = await admin.post(`/api/admin/staff/${otherId}/reactivate`);
    expect(on.status).toBe(200);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: otherId } });
    expect(row.deactivatedAt).toBeNull();
  });

  it("is admin-only", async () => {
    const { agent } = await createTestStudent("audit-staff-student");
    expect((await agent.get("/api/admin/staff")).status).toBe(403);
    expect((await agent.get("/api/admin/reviews")).status).toBe(403);
  });
});

describe("review moderation", () => {
  afterAll(cleanupTestData);

  it("lets an admin list and remove a review", async () => {
    const { agent: admin } = await createTestAdmin("audit-review-admin");
    const { userId } = await createTestStudent("audit-reviewer");
    const review = await prisma.review.create({
      data: { userId, courseId: "web-dev", rating: 1, comment: "spam" }
    });

    const list = await admin.get("/api/admin/reviews");
    expect(list.body.reviews.map((r: { id: string }) => r.id)).toContain(review.id);

    expect((await admin.delete(`/api/admin/reviews/${review.id}`)).status).toBe(200);
    expect(await prisma.review.findUnique({ where: { id: review.id } })).toBeNull();
    expect((await admin.delete(`/api/admin/reviews/${review.id}`)).status).toBe(404);
  });
});

describe("CSV export", () => {
  it("neutralises spreadsheet formulas but keeps numbers numeric", () => {
    const csv = toCsv(
      [{ name: '=HYPERLINK("http://evil","x")', amount: -500, note: "@SUM(A1)" }],
      ["name", "amount", "note"]
    );
    const row = csv.split("\r\n")[1];
    expect(row).toBe(`"'=HYPERLINK(""http://evil"",""x"")",-500,'@SUM(A1)`);
  });
});
