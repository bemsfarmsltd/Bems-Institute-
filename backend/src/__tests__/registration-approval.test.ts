import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { confirmPaymentTransaction } from "@/lib/payment-ledger";
import { createTestStudent, createTestAdmin, cleanupTestData } from "./helpers";

// The boss's flow: QR -> register -> pay -> email receipt -> admin notified
// -> admin confirms -> student notified -> course unlocked. Paystack itself
// can't be called from tests, so a "paid" checkout is simulated by opening a
// real /payments/init ledger entry and feeding confirmPaymentTransaction the
// same shape Paystack's verify API returns.
async function payViaPaystack(agent: Awaited<ReturnType<typeof createTestStudent>>["agent"], courseId = "web-dev") {
  const init = await agent.post("/api/payments/init", { courseId, paymentPlan: "full", source: "qr_flyer" });
  expect(init.status).toBe(200);
  const result = await confirmPaymentTransaction(init.body.reference, {
    status: "success",
    amount: init.body.amountKobo,
    channel: "card",
    paid_at: new Date().toISOString(),
    gateway_response: "Approved"
  });
  expect(result.ok).toBe(true);
  return init.body.reference as string;
}

describe("paid registrations wait for admin confirmation", () => {
  afterAll(cleanupTestData);

  it("an opened-but-unpaid checkout reveals no paid content", async () => {
    const { agent } = await createTestStudent("approval-unpaid");
    const init = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });
    expect(init.status).toBe(200);

    const me = await agent.get("/api/lms/me");
    expect(me.body.enrolledCourseIds).not.toContain("web-dev");
    expect(me.body.enrollments.find((e: { courseId: string }) => e.courseId === "web-dev").hasAccess).toBe(false);

    const catalog = await agent.get("/api/lms/catalog");
    const course = catalog.body.courses.find((c: { id: string }) => c.id === "web-dev");
    const lockedVideos = course.modules
      .flatMap((m: { lessons: { isFreePreview: boolean; videoUrl: string }[] }) => m.lessons)
      .filter((l: { isFreePreview: boolean }) => !l.isFreePreview)
      .map((l: { videoUrl: string }) => l.videoUrl);
    expect(lockedVideos.every((v: string) => v === "")).toBe(true);
  });

  it("payment alone keeps the course locked and alerts admins", async () => {
    const { agent, userId } = await createTestStudent("approval-paid");
    await createTestAdmin("approval-alerted-admin");
    await payViaPaystack(agent);

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });
    expect(enrollment?.paymentStatus).toBe("PAID_FULL");
    expect(enrollment?.status).toBe("PENDING");

    const me = await agent.get("/api/lms/me");
    expect(me.body.enrolledCourseIds).not.toContain("web-dev");
    const row = me.body.enrollments.find((e: { courseId: string }) => e.courseId === "web-dev");
    expect(row.awaitingApproval).toBe(true);

    const progress = await agent.post("/api/lms/progress", { lessonId: "les-1" });
    expect(progress.status).toBe(403);

    const studentNote = await prisma.notification.findFirst({ where: { userId, category: "PAYMENT" } });
    expect(studentNote?.message).toMatch(/confirm your registration/i);
  });

  it("an admin sees it in the queue, approves it, and the student gets access + a notification", async () => {
    const { agent, userId, email } = await createTestStudent("approval-full");
    const { agent: admin } = await createTestAdmin("approval-admin");
    await payViaPaystack(agent);

    const queue = await admin.get("/api/admin/enrollments/pending-approval");
    expect(queue.status).toBe(200);
    const mine = queue.body.enrollments.find((e: { student: { email: string } }) => e.student.email === email);
    expect(mine).toBeDefined();
    expect(mine.amountPaid).toBeGreaterThan(0);
    expect(mine.source).toBe("qr_flyer");

    const approve = await admin.post(`/api/admin/enrollments/${mine.id}/approve`);
    expect(approve.status).toBe(200);
    expect(approve.body.alreadyApproved).toBe(false);
    expect(approve.body.enrollment.status).toBe("ACTIVE");

    const me = await agent.get("/api/lms/me");
    expect(me.body.enrolledCourseIds).toContain("web-dev");

    const progress = await agent.post("/api/lms/progress", { lessonId: "les-1" });
    expect(progress.status).toBe(200);

    const confirmed = await prisma.notification.findFirst({
      where: { userId, title: { startsWith: "Registration confirmed" } }
    });
    expect(confirmed).not.toBeNull();

    // Approving twice is harmless and doesn't notify again.
    const again = await admin.post(`/api/admin/enrollments/${mine.id}/approve`);
    expect(again.body.alreadyApproved).toBe(true);
    const count = await prisma.notification.count({
      where: { userId, title: { startsWith: "Registration confirmed" } }
    });
    expect(count).toBe(1);
  });

  it("refuses to approve an unpaid registration, and students can't approve themselves", async () => {
    const { agent, userId } = await createTestStudent("approval-refuse");
    const { agent: admin } = await createTestAdmin("approval-refuse-admin");
    await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });
    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });

    const self = await agent.post(`/api/admin/enrollments/${enrollment.id}/approve`);
    expect(self.status).toBe(403);

    const unpaid = await admin.post(`/api/admin/enrollments/${enrollment.id}/approve`);
    expect(unpaid.status).toBe(400);

    const toggle = await admin.patch(`/api/admin/enrollments/${enrollment.id}/status`, { status: "ACTIVE" });
    expect(toggle.status).toBe(400);
  });

  it("an installment on an already-approved course doesn't re-lock it", async () => {
    const { agent, userId } = await createTestStudent("approval-installment");
    const { agent: admin } = await createTestAdmin("approval-installment-admin");

    const init = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "installment" });
    await confirmPaymentTransaction(init.body.reference, {
      status: "success",
      amount: init.body.amountKobo,
      channel: "card",
      paid_at: new Date().toISOString(),
      gateway_response: "Approved"
    });
    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });
    expect(enrollment.paymentStatus).toBe("PARTIAL");
    await admin.post(`/api/admin/enrollments/${enrollment.id}/approve`);

    const balance = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "installment" });
    await confirmPaymentTransaction(balance.body.reference, {
      status: "success",
      amount: balance.body.amountKobo,
      channel: "card",
      paid_at: new Date().toISOString(),
      gateway_response: "Approved"
    });

    const after = await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollment.id } });
    expect(after.status).toBe("ACTIVE");
    expect(after.paymentStatus).toBe("PAID_FULL");
  });
});
