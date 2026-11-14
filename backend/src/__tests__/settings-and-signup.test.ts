import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { createTestStudent, createTestAdmin, cleanupTestData, testEmail } from "./helpers";
import { TEST_BANK } from "./setup";

afterAll(async () => {
  await prisma.siteSettings.update({ where: { id: "singleton" }, data: { ...TEST_BANK, allowRegistration: "enable" } });
  await cleanupTestData();
});

describe("public sign-up", () => {
  it("only ever creates students, even when asked for INSTRUCTOR", async () => {
    const email = testEmail("signup-role");
    const res = await request(app).post("/api/auth/signup").send({ name: "Wannabe Tutor", email, password: "longenough1", role: "INSTRUCTOR" });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("STUDENT");
    expect((await prisma.user.findUnique({ where: { email } }))?.role).toBe("STUDENT");
  });
});

describe("general settings and bank transfer", () => {
  it("is admin-only and validates the account number", async () => {
    const { agent: student } = await createTestStudent("general-student");
    expect((await student.get("/api/admin/settings/general")).status).toBe(403);
    expect((await student.patch("/api/admin/settings/general", { bankName: "X" })).status).toBe(403);

    const { agent: admin } = await createTestAdmin("general-admin");
    const bad = await admin.patch("/api/admin/settings/general", { bankAccountNumber: "12345" });
    expect(bad.status).toBe(400);
    const badMode = await admin.patch("/api/admin/settings/general", { allowRegistration: "maybe" });
    expect(badMode.status).toBe(400);

    const ok = await admin.patch("/api/admin/settings/general", {
      bankName: " Zenith Bank ", bankAccountName: "BEMS Institute Ltd", bankAccountNumber: "123 456 7890"
    });
    expect(ok.status).toBe(200);
    expect(ok.body.general).toMatchObject({ bankName: "Zenith Bank", bankAccountNumber: "1234567890" });
    // Integration status says what's set, never the keys themselves.
    expect(ok.body.integrations.paystack).toHaveProperty("secretKeySet");
    expect(JSON.stringify(ok.body.integrations)).not.toMatch(/sk_(test|live)_/);

    const pub = await request(app).get("/api/settings/bank-transfer");
    expect(pub.body.bankTransfer).toEqual({ bankName: "Zenith Bank", accountName: "BEMS Institute Ltd", accountNumber: "1234567890" });
  });

  it("hides bank transfer and refuses bank enrolment until an account is set", async () => {
    await prisma.siteSettings.update({ where: { id: "singleton" }, data: { bankName: "", bankAccountName: "", bankAccountNumber: "" } });
    try {
      expect((await request(app).get("/api/settings/bank-transfer")).body.bankTransfer).toBeNull();
      const { agent, userId } = await createTestStudent("bank-unset");
      const res = await agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: "TRF-1" });
      expect(res.status).toBe(400);
      expect(await prisma.enrollment.count({ where: { userId } })).toBe(0);
    } finally {
      await prisma.siteSettings.update({ where: { id: "singleton" }, data: TEST_BANK });
    }
  });
});
