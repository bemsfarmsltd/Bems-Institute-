import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

// A fixed, obviously-test-only prefix so cleanup can find (and so a real
// student can never accidentally collide with) every row these tests
// create — same convention used for manual verification throughout this
// project's development.
export const TEST_EMAIL_PREFIX = "vitest-";

export function testEmail(label: string): string {
  return `${TEST_EMAIL_PREFIX}${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

/** supertest doesn't persist cookies across requests like a browser — this wraps it so it does. */
export class SessionAgent {
  private cookie = "";

  private capture(res: request.Response) {
    const setCookie = res.headers["set-cookie"];
    if (setCookie && setCookie.length > 0) {
      this.cookie = setCookie[0].split(";")[0];
    }
  }

  async post(path: string, body?: Record<string, unknown>) {
    const req = request(app).post(path);
    if (this.cookie) req.set("Cookie", this.cookie);
    const res = body !== undefined ? await req.send(body) : await req.send();
    this.capture(res);
    return res;
  }

  async patch(path: string, body?: Record<string, unknown>) {
    const req = request(app).patch(path);
    if (this.cookie) req.set("Cookie", this.cookie);
    const res = body !== undefined ? await req.send(body) : await req.send();
    this.capture(res);
    return res;
  }

  async get(path: string) {
    const req = request(app).get(path);
    if (this.cookie) req.set("Cookie", this.cookie);
    const res = await req.send();
    this.capture(res);
    return res;
  }
}

/** Signs up a fresh student and returns a session already logged in as them, plus their user id. */
export const TEST_PASSWORD = "TestPass123!";

// Creates the row directly via Prisma and logs in through the real /login
// route, rather than going through the real /signup route — signup is
// rate-limited per-IP (8/hour), and every supertest request shares the
// same loopback IP, so a full test run creating a dozen fixture users
// would trip that limiter on its own. Login is rate-limited per-email
// instead, so it doesn't have this problem, and auth.test.ts separately
// exercises the real signup endpoint directly to verify it works.
export async function createTestStudent(label: string): Promise<{ agent: SessionAgent; userId: string; email: string }> {
  const email = testEmail(label);
  const user = await prisma.user.create({
    data: {
      name: `Vitest ${label}`,
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      role: "STUDENT"
    }
  });
  const agent = new SessionAgent();
  await agent.post("/api/auth/login", { email, password: TEST_PASSWORD });
  return { agent, userId: user.id, email };
}

/** Same as createTestStudent, but promotes the account to ADMIN and re-logs-in so the session cookie reflects it. */
export async function createTestAdmin(label: string): Promise<{ agent: SessionAgent; userId: string; email: string }> {
  const { userId, email } = await createTestStudent(label);
  await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
  const agent = new SessionAgent();
  await agent.post("/api/auth/login", { email, password: TEST_PASSWORD });
  return { agent, userId, email };
}

/** Deletes every row these tests could have created, by email prefix — call from an afterAll. */
export async function cleanupTestData(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_EMAIL_PREFIX } } });
}
