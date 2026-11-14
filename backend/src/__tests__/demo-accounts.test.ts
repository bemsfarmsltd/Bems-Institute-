import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { SessionAgent } from "./helpers";

// The seeded demo instructor's password is public, so in production it must
// not sign in, and a session opened before the block must stop working.
const DEMO_EMAIL = "victor.lead@bemsinstitute.ng";
const original = process.env.ALLOW_DEMO_ACCOUNTS;
let createdHere = false;

afterAll(async () => {
  if (original === undefined) delete process.env.ALLOW_DEMO_ACCOUNTS;
  else process.env.ALLOW_DEMO_ACCOUNTS = original;
  await prisma.authAttempt.deleteMany({ where: { key: `login:${DEMO_EMAIL}` } });
  if (createdHere) await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });
});

describe("demo accounts", () => {
  it("are refused at sign-in and lose open sessions when not allowed", async () => {
    const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!existing) {
      createdHere = true;
      await prisma.user.create({
        data: { name: "Victor (demo)", email: DEMO_EMAIL, passwordHash: await hashPassword("demo1234"), role: "INSTRUCTOR" }
      });
    } else {
      await prisma.user.update({ where: { email: DEMO_EMAIL }, data: { passwordHash: await hashPassword("demo1234") } });
    }
    await prisma.authAttempt.deleteMany({ where: { key: `login:${DEMO_EMAIL}` } });

    // Allowed (local development): signs in normally.
    process.env.ALLOW_DEMO_ACCOUNTS = "true";
    const agent = new SessionAgent();
    const ok = await agent.post("/api/auth/login", { email: DEMO_EMAIL, password: "demo1234" });
    expect(ok.status).toBe(200);
    expect((await agent.get("/api/auth/me")).body.user?.email).toBe(DEMO_EMAIL);

    // Blocked (production default): the open session is dead...
    process.env.ALLOW_DEMO_ACCOUNTS = "false";
    expect((await agent.get("/api/auth/me")).body.user).toBeNull();
    expect((await agent.get("/api/instructor/concept-analytics")).status).toBeGreaterThanOrEqual(401);

    // ...and signing in looks exactly like a wrong password.
    const blocked = await new SessionAgent().post("/api/auth/login", { email: DEMO_EMAIL, password: "demo1234" });
    expect(blocked.status).toBe(401);
    expect(blocked.body.error).toBe("Invalid email or password.");
  });
});
