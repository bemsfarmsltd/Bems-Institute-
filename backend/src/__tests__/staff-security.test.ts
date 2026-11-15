import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { base32Encode, currentStep, totpAt } from "@/lib/totp";
import { createPasswordResetToken } from "@/lib/password-reset";
import { SessionAgent, TEST_PASSWORD, TEST_EMAIL_PREFIX, createTestStudent, createTestAdmin, cleanupTestData, testEmail } from "./helpers";

afterAll(async () => {
  await prisma.staffInvite.deleteMany({ where: { email: { startsWith: TEST_EMAIL_PREFIX } } });
  await cleanupTestData();
});

// A code the server will accept that's newer than any used so far.
const nextCode = (secret: string) => totpAt(secret, currentStep() + 1);

async function turnOn2fa(agent: SessionAgent) {
  const setup = await agent.post("/api/account/2fa/setup", { password: TEST_PASSWORD });
  expect(setup.status).toBe(200);
  expect(setup.body.otpauthUrl).toMatch(/^otpauth:\/\/totp\/BEMS%20Institute/);
  const secret: string = setup.body.secret;
  const enable = await agent.post("/api/account/2fa/enable", { code: totpAt(secret, currentStep()) });
  expect(enable.status).toBe(200);
  return { secret, recoveryCodes: enable.body.recoveryCodes as string[] };
}

describe("TOTP", () => {
  it("matches the RFC 6238 test vectors", () => {
    const secret = base32Encode(Buffer.from("12345678901234567890"));
    expect(secret).toBe("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
    expect(totpAt(secret, Math.floor(59 / 30))).toBe("287082");
    expect(totpAt(secret, Math.floor(1111111109 / 30))).toBe("081804");
    expect(totpAt(secret, Math.floor(2000000000 / 30))).toBe("279037");
  });
});

describe("2-step verification", () => {
  it("needs the password to start, and a working code to turn on", async () => {
    const { agent } = await createTestStudent("2fa-setup");
    expect((await agent.post("/api/account/2fa/setup", { password: "wrong" })).status).toBe(401);
    const setup = await agent.post("/api/account/2fa/setup", { password: TEST_PASSWORD });
    expect((await agent.post("/api/account/2fa/enable", { code: "000000" })).status).toBe(400);
    const ok = await agent.post("/api/account/2fa/enable", { code: totpAt(setup.body.secret, currentStep()) });
    expect(ok.body.recoveryCodes).toHaveLength(8);
    // The secret is stored encrypted, never as the plain base32 string.
    const row = await prisma.user.findFirst({ where: { email: { startsWith: `${TEST_EMAIL_PREFIX}2fa-setup` } } });
    expect(row?.totpSecret).toBeTruthy();
    expect(row?.totpSecret).not.toContain(setup.body.secret);
  });

  it("makes sign-in a two-step process, with no replays", async () => {
    const { agent, email } = await createTestStudent("2fa-login");
    const { secret, recoveryCodes } = await turnOn2fa(agent);

    const fresh = new SessionAgent();
    const step1 = await fresh.post("/api/auth/login", { email, password: TEST_PASSWORD });
    expect(step1.status).toBe(200);
    expect(step1.body.twoFactorRequired).toBe(true);
    expect(step1.headers["set-cookie"]).toBeUndefined();
    expect((await fresh.get("/api/auth/me")).body.user).toBeNull();

    expect((await fresh.post("/api/auth/login/2fa", { challenge: step1.body.challenge, code: "123456" })).status).toBe(401);
    expect((await fresh.post("/api/auth/login/2fa", { challenge: "forged.token", code: nextCode(secret) })).status).toBe(401);

    const code = nextCode(secret);
    const step2 = await fresh.post("/api/auth/login/2fa", { challenge: step1.body.challenge, code });
    expect(step2.status).toBe(200);
    expect((await fresh.get("/api/auth/me")).body.user?.email).toBe(email);

    // The same code can't be used again, even with a new challenge.
    const again = await new SessionAgent().post("/api/auth/login", { email, password: TEST_PASSWORD });
    expect((await new SessionAgent().post("/api/auth/login/2fa", { challenge: again.body.challenge, code })).status).toBe(401);

    // A recovery code works exactly once.
    const viaRecovery = await new SessionAgent().post("/api/auth/login/2fa", { challenge: again.body.challenge, code: recoveryCodes[0] });
    expect(viaRecovery.status).toBe(200);
    expect(viaRecovery.body.recoveryCodesLeft).toBe(7);
    const third = await new SessionAgent().post("/api/auth/login", { email, password: TEST_PASSWORD });
    expect((await new SessionAgent().post("/api/auth/login/2fa", { challenge: third.body.challenge, code: recoveryCodes[0] })).status).toBe(401);

    const security = await fresh.get("/api/account/security");
    expect(security.body.twoFactor).toMatchObject({ enabled: true, recoveryCodesLeft: 7 });
    expect(security.body.recentSignIns.map((s: { method: string }) => s.method)).toEqual(
      expect.arrayContaining(["password+2fa", "password+recovery-code"])
    );
  });

  it("rate-limits repeated guesses against a valid 2-step challenge", async () => {
    const { agent, email, userId } = await createTestStudent("2fa-rate-limit");
    await turnOn2fa(agent);
    const key = `2fa:${userId}`;
    await prisma.authAttempt.deleteMany({ where: { key } });

    const challenge = await new SessionAgent().post("/api/auth/login", { email, password: TEST_PASSWORD });
    expect(challenge.body.twoFactorRequired).toBe(true);
    const guesses = await Promise.all(Array.from({ length: 50 }, () =>
      new SessionAgent().post("/api/auth/login/2fa", { challenge: challenge.body.challenge, code: "000000" })
    ));
    expect(guesses.filter((res) => res.status === 401).length).toBeLessThanOrEqual(5);
    expect(guesses.some((res) => res.status === 429)).toBe(true);
  });

  it("can't be skipped with a password-reset link", async () => {
    const { agent, userId, email } = await createTestStudent("2fa-reset");
    await turnOn2fa(agent);
    const token = await createPasswordResetToken(userId);
    const res = await request(app).post("/api/auth/reset-password").send({ token, password: "BrandNew123!" });
    expect(res.status).toBe(200);
    expect(res.body.signInRequired).toBe(true);
    expect(res.headers["set-cookie"]).toBeUndefined();
    expect((await new SessionAgent().post("/api/auth/login", { email, password: "BrandNew123!" })).body.twoFactorRequired).toBe(true);
  });

  it("needs the password and a code to turn off", async () => {
    const { agent } = await createTestStudent("2fa-off");
    const { secret } = await turnOn2fa(agent);
    expect((await agent.post("/api/account/2fa/disable", { password: TEST_PASSWORD, code: "000000" })).status).toBe(401);
    expect((await agent.post("/api/account/2fa/disable", { password: "wrong", code: nextCode(secret) })).status).toBe(401);
    expect((await agent.post("/api/account/2fa/disable", { password: TEST_PASSWORD, code: nextCode(secret) })).status).toBe(200);
    expect((await agent.get("/api/account/security")).body.twoFactor.enabled).toBe(false);
  });
});

describe("sign out everywhere", () => {
  it("ends other sessions but keeps this one", async () => {
    const { agent, email } = await createTestStudent("signout-all");
    const other = new SessionAgent();
    await other.post("/api/auth/login", { email, password: TEST_PASSWORD });
    expect((await agent.post("/api/account/sign-out-everywhere")).status).toBe(200);
    expect((await other.get("/api/auth/me")).body.user).toBeNull();
    expect((await agent.get("/api/auth/me")).body.user?.email).toBe(email);
  });
});

describe("staff invites", () => {
  it("only admins can invite", async () => {
    const { agent } = await createTestStudent("invite-student");
    expect((await agent.post("/api/admin/staff/invites", { email: testEmail("x"), role: "ADMIN" })).status).toBe(403);
  });

  it("creates a new instructor account from a one-time link", async () => {
    const { agent: admin } = await createTestAdmin("invite-admin");
    const email = testEmail("new-tutor");
    expect((await admin.post("/api/admin/staff/invites", { email, role: "STUDENT" })).status).toBe(400);
    const created = await admin.post("/api/admin/staff/invites", { email, role: "INSTRUCTOR" });
    expect(created.status).toBe(201);
    const token = new URL(created.body.inviteUrl).pathname.split("/").pop()!;
    // Only the hash is stored.
    expect(await prisma.staffInvite.count({ where: { tokenHash: token } })).toBe(0);

    const info = await request(app).get(`/api/staff-invites/${token}`);
    expect(info.body.invite).toMatchObject({ email, role: "INSTRUCTOR", accountExists: false });

    const tutor = new SessionAgent();
    const accepted = await tutor.post(`/api/staff-invites/${token}/accept`, { name: "New Tutor", password: "TutorPass123!" });
    expect(accepted.status).toBe(200);
    expect(accepted.body.user.role).toBe("INSTRUCTOR");
    expect((await tutor.get("/api/auth/me")).body.user?.role).toBe("INSTRUCTOR");

    expect((await request(app).post(`/api/staff-invites/${token}/accept`).send({ name: "Again", password: "TutorPass123!" })).status).toBe(410);
    const list = await admin.get("/api/admin/staff/invites");
    expect(list.body.invites.find((i: { email: string }) => i.email === email)?.status).toBe("accepted");
  });

  it("upgrades an existing account only with that account's password", async () => {
    const { agent: admin } = await createTestAdmin("invite-admin-2");
    const { agent: student, email } = await createTestStudent("grad-to-tutor");
    const { body } = await admin.post("/api/admin/staff/invites", { email, role: "INSTRUCTOR" });
    const token = new URL(body.inviteUrl).pathname.split("/").pop()!;

    const wrong = await request(app).post(`/api/staff-invites/${token}/accept`).send({ password: "not-theirs" });
    expect(wrong.status).toBe(401);
    // A wrong password doesn't burn the invite.
    const right = await new SessionAgent().post(`/api/staff-invites/${token}/accept`, { password: TEST_PASSWORD });
    expect(right.body.user.role).toBe("INSTRUCTOR");
    // Their old student session carried the old role, so it ends.
    expect((await student.get("/api/auth/me")).body.user).toBeNull();
  });

  it("revoked and replaced links stop working", async () => {
    const { agent: admin } = await createTestAdmin("invite-admin-3");
    const email = testEmail("revoked");
    const first = await admin.post("/api/admin/staff/invites", { email, role: "ADMIN" });
    const second = await admin.post("/api/admin/staff/invites", { email, role: "ADMIN" });
    const t1 = new URL(first.body.inviteUrl).pathname.split("/").pop()!;
    const t2 = new URL(second.body.inviteUrl).pathname.split("/").pop()!;
    expect((await request(app).get(`/api/staff-invites/${t1}`)).status).toBe(410);
    expect((await admin.post(`/api/admin/staff/invites/${second.body.invite.id}/revoke`)).status).toBe(200);
    expect((await request(app).get(`/api/staff-invites/${t2}`)).status).toBe(410);
  });

  it("retires the shared staff code once an admin exists", async () => {
    await createTestAdmin("invite-admin-4");
    const prev = process.env.ADMIN_ACCESS_CODE;
    process.env.ADMIN_ACCESS_CODE = "test-only-code";
    try {
      const res = await request(app).post("/api/admin-auth").send({ code: "test-only-code", name: "Sneaky", email: testEmail("code"), password: "LongEnough1!" });
      expect(res.status).toBe(403);
    } finally {
      if (prev === undefined) delete process.env.ADMIN_ACCESS_CODE;
      else process.env.ADMIN_ACCESS_CODE = prev;
    }
  });
});

describe("staff roles and 2FA reset", () => {
  it("changes roles, ending the person's sessions; can't change your own", async () => {
    const { agent: admin, userId: adminId } = await createTestAdmin("role-admin");
    const { agent: tutor, userId } = await createTestStudent("role-target");
    expect((await admin.post(`/api/admin/staff/${adminId}/role`, { role: "STUDENT" })).status).toBe(400);
    expect((await admin.post(`/api/admin/staff/${userId}/role`, { role: "INSTRUCTOR" })).status).toBe(200);
    expect((await tutor.get("/api/auth/me")).body.user).toBeNull();
    expect((await prisma.user.findUnique({ where: { id: userId } }))?.role).toBe("INSTRUCTOR");
  });

  it("an admin can reset someone's 2-step verification", async () => {
    const { agent: admin } = await createTestAdmin("reset2fa-admin");
    const { agent: tutor, userId, email } = await createTestStudent("reset2fa-target");
    await turnOn2fa(tutor);
    expect((await admin.post(`/api/admin/staff/${userId}/reset-2fa`)).status).toBe(200);
    // Reset revokes already-issued sessions as well as disabling future challenges.
    expect((await tutor.get("/api/auth/me")).body.user).toBeNull();
    const login = await new SessionAgent().post("/api/auth/login", { email, password: TEST_PASSWORD });
    expect(login.body.twoFactorRequired).toBeUndefined();
    expect(login.body.user?.email).toBe(email);
  });
});
