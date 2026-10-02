import { describe, it, expect, afterAll } from "vitest";
import { createTestStudent, createTestAdmin, cleanupTestData } from "./helpers";

// isEnrolled() in api-auth.ts is the single chokepoint gating lesson
// progress/quiz/submission access on actual payment, not just the
// existence of an enrollment row — this is the fix for the exploit where
// a client used to be able to self-assert PAID_FULL for free.
describe("course access is gated on real payment, not just enrollment", () => {
  afterAll(cleanupTestData);

  it("blocks lesson progress while payment is PENDING (bank transfer, not yet confirmed)", async () => {
    const { agent } = await createTestStudent("gating-pending");

    const enroll = await agent.post("/api/lms/enroll", {
      courseId: "web-dev",
      paymentMethod: "bank",
      paymentPlan: "full",
      bankReference: "VITEST-PENDING"
    });
    expect(enroll.status).toBe(200);

    const progress = await agent.post("/api/lms/progress", { lessonId: "les-1" });
    expect(progress.status).toBe(403);
  });

  it("grants lesson progress once staff confirm the payment", async () => {
    const { agent, email } = await createTestStudent("gating-confirmed");
    const { agent: adminAgent } = await createTestAdmin("gating-admin");

    await agent.post("/api/lms/enroll", {
      courseId: "web-dev",
      paymentMethod: "bank",
      paymentPlan: "full",
      bankReference: "VITEST-CONFIRMED"
    });

    // Roster rows aren't scoped to just this test's data (other tests in
    // this file create their own web-dev/PENDING enrollments too) — match
    // on this student's own email, which is unique per test run.
    const roster = await adminAgent.get("/api/admin/roster");
    const row = roster.body.roster.find((r: { email: string }) => r.email === email);
    expect(row).toBeTruthy();

    const confirm = await adminAgent.post(`/api/admin/enrollments/${row.id}/payment`, {
      status: "PAID_FULL",
      amountPaid: 79000
    });
    expect(confirm.status).toBe(200);

    const progress = await agent.post("/api/lms/progress", { lessonId: "les-1" });
    expect(progress.status).toBe(200);
    expect(progress.body.completedLessonIds).toContain("les-1");
  });

  it("rejects the old exploit: asserting paymentMethod paystack no longer grants free access", async () => {
    const { agent } = await createTestStudent("gating-exploit");

    await agent.post("/api/lms/enroll", {
      courseId: "web-dev",
      paymentMethod: "paystack",
      paymentPlan: "full"
    });

    const progress = await agent.post("/api/lms/progress", { lessonId: "les-1" });
    expect(progress.status).toBe(403);
  });
});
