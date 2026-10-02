import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestStudent, createTestAdmin, cleanupTestData } from "./helpers";

// PRD §4.2 "small projects every 2-3 weeks" — a milestone is real, graded
// practice, but only the final capstone should ever issue a certificate.
describe("certificate issuance is gated on assignment type", () => {
  let studentAgent: Awaited<ReturnType<typeof createTestStudent>>["agent"];
  let adminAgent: Awaited<ReturnType<typeof createTestAdmin>>["agent"];

  beforeAll(async () => {
    const student = await createTestStudent("cert-student");
    const admin = await createTestAdmin("cert-admin");
    studentAgent = student.agent;
    adminAgent = admin.agent;

    await studentAgent.post("/api/lms/enroll", {
      courseId: "web-dev",
      paymentMethod: "bank",
      paymentPlan: "full",
      bankReference: "VITEST-CERT"
    });

    const roster = await adminAgent.get("/api/admin/roster");
    const row = roster.body.roster.find((r: { email: string }) => r.email === student.email);
    await adminAgent.post(`/api/admin/enrollments/${row.id}/payment`, { status: "PAID_FULL", amountPaid: 79000 });
  });

  afterAll(cleanupTestData);

  it("does not issue a certificate for a passing MILESTONE grade", async () => {
    const submit = await studentAgent.post("/api/lms/submissions", {
      assignmentId: "milestone-web-dev-1",
      githubUrl: "https://github.com/vitest/portfolio",
      liveDemoUrl: "https://example.com"
    });
    expect(submit.status).toBe(200);

    const grade = await adminAgent.post(`/api/lms/submissions/${submit.body.submission.id}/grade`, {
      score: 85,
      feedback: "Clean layout."
    });
    expect(grade.status).toBe(200);
    expect(grade.body.certificate).toBeNull();
  });

  it("issues a certificate for a passing CAPSTONE grade", async () => {
    const submit = await studentAgent.post("/api/lms/submissions", {
      assignmentId: "assign-web-dev",
      githubUrl: "https://github.com/vitest/final",
      liveDemoUrl: "https://example.com"
    });
    expect(submit.status).toBe(200);

    const grade = await adminAgent.post(`/api/lms/submissions/${submit.body.submission.id}/grade`, {
      score: 90,
      feedback: "Excellent."
    });
    expect(grade.status).toBe(200);
    expect(grade.body.certificate).not.toBeNull();
    expect(grade.body.certificate.certNumber).toMatch(/^BEMS-CERT-/);
  });
});
