import { describe, it, expect, afterAll } from "vitest";
import { createTestStudent, cleanupTestData, SessionAgent, testEmail, TEST_PASSWORD } from "./helpers";

describe("auth", () => {
  afterAll(cleanupTestData);

  // The only two tests in this whole suite that go through the real,
  // per-IP-rate-limited /signup endpoint directly — every other test
  // creates its fixture users via createTestStudent (Prisma + /login)
  // specifically to avoid tripping that limiter on a single test run.
  it("signs up a new student through the real endpoint and returns a session", async () => {
    const agent = new SessionAgent();
    const res = await agent.post("/api/auth/signup", {
      name: "Vitest Real Signup",
      email: testEmail("real-signup"),
      password: TEST_PASSWORD,
      role: "STUDENT"
    });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("STUDENT");

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.user.id).toBe(res.body.user.id);
  });

  it("rejects a signup with an already-registered email", async () => {
    const { email } = await createTestStudent("dup-signup");
    const agent = new SessionAgent();
    const res = await agent.post("/api/auth/signup", {
      name: "Duplicate",
      email,
      password: TEST_PASSWORD,
      role: "STUDENT"
    });
    expect(res.status).toBe(409);
  });

  it("rejects login with the wrong password", async () => {
    const { email } = await createTestStudent("wrongpass");
    const agent = new SessionAgent();
    const res = await agent.post("/api/auth/login", { email, password: "definitely-not-it" });
    expect(res.status).toBe(401);
  });

  it("rejects login for an email that was never signed up", async () => {
    const agent = new SessionAgent();
    const res = await agent.post("/api/auth/login", {
      email: testEmail("never-existed"),
      password: "whatever123"
    });
    expect(res.status).toBe(401);
  });

  it("returns null from /me when not logged in", async () => {
    const agent = new SessionAgent();
    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });
});
