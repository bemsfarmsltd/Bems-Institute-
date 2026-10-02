import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { createTestStudent, createTestAdmin, cleanupTestData } from "./helpers";

// PRD §4.2: "A second chance... once. That turns a drop-out into a
// finisher instead of a refund." Lifetime, not per-course.
describe("second chance rejoin", () => {
  let originalCohortId: string;
  let nextCohortId: string;

  beforeAll(async () => {
    // Created first, so it's the "current" cohort the enrollment attaches
    // to below (enroll always attaches to whichever cohort is newest).
    const original = await prisma.cohort.create({
      data: {
        name: "Vitest Original Cohort",
        startDate: new Date("2026-10-01"),
        endDate: new Date("2026-12-31"),
        targetStudents: 10,
        targetRevenue: 1000000
      }
    });
    originalCohortId = original.id;

    // Created second, so it's now the newer one — the second-chance
    // rejoin target, proving the enrollment actually moves cohorts.
    const next = await prisma.cohort.create({
      data: {
        name: "Vitest Next Cohort",
        startDate: new Date("2027-01-01"),
        endDate: new Date("2027-03-31"),
        targetStudents: 10,
        targetRevenue: 1000000
      }
    });
    nextCohortId = next.id;
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.cohort.deleteMany({ where: { id: { in: [originalCohortId, nextCohortId] } } });
  });

  it("waives the remaining balance, switches cohort, and blocks a second use", async () => {
    const student = await createTestStudent("second-chance");
    const admin = await createTestAdmin("second-chance-admin");

    await student.agent.post("/api/lms/enroll", {
      courseId: "web-dev",
      paymentMethod: "bank",
      paymentPlan: "installment",
      bankReference: "VITEST-2ND-CHANCE"
    });

    const roster = await admin.agent.get("/api/admin/roster");
    const row = roster.body.roster.find((r: { email: string }) => r.email === student.email);
    expect(row.totalDue).toBe(90000);
    // enroll() always attaches to whichever cohort is newest — "Next"
    // was created after "Original", so that's where a fresh enrollment lands.
    expect(row.cohort).toBe("Vitest Next Cohort");

    // Partial payment, then dropped.
    await admin.agent.post(`/api/admin/enrollments/${row.id}/payment`, { status: "PARTIAL", amountPaid: 35000 });
    const dropped = await admin.agent.patch(`/api/admin/enrollments/${row.id}/status`, { status: "DROPPED" });
    expect(dropped.status).toBe(200);

    // Rejoin into the OLDER cohort — proves cohortId actually changes to
    // whatever is requested, not just "whichever is newest."
    const activate = await admin.agent.post(`/api/admin/enrollments/${row.id}/second-chance`, {
      targetCohortId: originalCohortId
    });
    expect(activate.status).toBe(200);
    expect(activate.body.waivedAmount).toBe(55000); // 90000 - 35000
    expect(activate.body.enrollment.paymentStatus).toBe("PAID_FULL");
    expect(activate.body.enrollment.amountPaid).toBe(90000);
    expect(activate.body.enrollment.cohortId).toBe(originalCohortId);
    expect(activate.body.enrollment.status).toBe("ACTIVE");

    // Access is restored — the whole point of a second chance.
    const progress = await student.agent.post("/api/lms/progress", { lessonId: "les-1" });
    expect(progress.status).toBe(200);

    // One-time: a second attempt is rejected, even targeting back at the newer cohort.
    const secondAttempt = await admin.agent.post(`/api/admin/enrollments/${row.id}/second-chance`, {
      targetCohortId: nextCohortId
    });
    expect(secondAttempt.status).toBe(400);
    expect(secondAttempt.body.error).toMatch(/already used/i);
  });
});
