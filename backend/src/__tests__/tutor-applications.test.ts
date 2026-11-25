import { describe, it, expect, afterAll, beforeAll } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { createTestStudent, createTestAdmin, cleanupTestData } from "./helpers";

const EMAIL = (label: string) => `vitest-tutorapp-${label}-${Date.now()}@example.com`;
// The hourly per-IP limit counts across runs; every test request shares one IP.
const clearQuota = () => prisma.authAttempt.deleteMany({ where: { key: { startsWith: "tutor-application:" } } });
beforeAll(clearQuota);
afterAll(async () => {
  await clearQuota();
  await prisma.tutorApplication.deleteMany({ where: { email: { startsWith: "vitest-tutorapp-" } } });
  await cleanupTestData();
});

const valid = (label: string) => ({
  name: "Ngozi Eze",
  email: EMAIL(label),
  phone: "0803 000 0000",
  track: "cybersecurity",
  teachingMode: "EITHER",
  experience: "Five years as a SOC analyst; I run CTF workshops for university students in Aba.",
  portfolioUrl: "https://www.linkedin.com/in/example"
});

describe("tutor applications", () => {
  it("saves a valid application and lets admins review it", async () => {
    const res = await request(app).post("/api/tutor-applications").send(valid("ok"));
    expect(res.status).toBe(201);
    const row = await prisma.tutorApplication.findUniqueOrThrow({ where: { id: res.body.id } });
    expect(row).toMatchObject({ name: "Ngozi Eze", track: "cybersecurity", teachingMode: "EITHER", status: "NEW" });

    const { agent: admin, userId: adminId } = await createTestAdmin("tutorapp-admin");
    // The admin who exists at submit time is notified; this one was created after, so check listing instead.
    const list = await admin.get("/api/tutor-applications");
    expect(list.status).toBe(200);
    const mine = list.body.applications.find((a: { id: string }) => a.id === res.body.id);
    expect(mine).toMatchObject({ trackTitle: expect.any(String), teachingModeLabel: "In person or online" });
    expect(list.body.counts.NEW).toBeGreaterThanOrEqual(1);
    expect(adminId).toBeTruthy();

    const upd = await admin.patch(`/api/tutor-applications/${res.body.id}`, { status: "INTERVIEW", staffNotes: "Call Friday" });
    expect(upd.body.application).toMatchObject({ status: "INTERVIEW", staffNotes: "Call Friday" });
    expect((await admin.patch(`/api/tutor-applications/${res.body.id}`, { status: "MAYBE" })).status).toBe(400);
    expect((await admin.patch("/api/tutor-applications/nope", { status: "HIRED" })).status).toBe(404);
  });

  it("notifies admins in the app", async () => {
    const { userId } = await createTestAdmin("tutorapp-notify");
    await request(app).post("/api/tutor-applications").send(valid("notify"));
    expect(await prisma.notification.count({ where: { userId, title: "New tutor application" } })).toBe(1);
  });

  it("rejects bad input with a message people can act on", async () => {
    const bad = async (patch: Record<string, unknown>) => (await request(app).post("/api/tutor-applications").send({ ...valid("bad"), ...patch })).body.error;
    expect(await bad({ email: "nope" })).toMatch(/valid email/);
    expect(await bad({ phone: "12" })).toMatch(/phone/);
    expect(await bad({ teachingMode: "SOMETIMES" })).toMatch(/how you'd like to teach/);
    expect(await bad({ experience: "short" })).toMatch(/a little more/);
    expect(await bad({ portfolioUrl: "javascript:alert(1)" })).toMatch(/https/);
    expect(await bad({ track: "basket-weaving" })).toMatch(/course/);
    expect((await request(app).post("/api/tutor-applications").send({ ...valid("other"), track: "other" })).status).toBe(201);
  });

  it("quietly drops bot submissions (hidden field filled)", async () => {
    const data = valid("bot");
    const res = await request(app).post("/api/tutor-applications").send({ ...data, website: "http://spam.example" });
    expect(res.status).toBe(201);
    expect(await prisma.tutorApplication.count({ where: { email: data.email } })).toBe(0);
  });

  it("keeps the list and updates for admins only", async () => {
    expect((await request(app).get("/api/tutor-applications")).status).toBe(403);
    const { agent } = await createTestStudent("tutorapp-student");
    expect((await agent.get("/api/tutor-applications")).status).toBe(403);
    expect((await agent.patch("/api/tutor-applications/x", { status: "HIRED" })).status).toBe(403);
  });
});
