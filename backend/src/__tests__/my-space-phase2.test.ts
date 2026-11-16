import { describe, it, expect, afterAll, afterEach } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { createTestStudent, createTestAdmin, cleanupTestData } from "./helpers";
import { dayStreak, lagosDateKey, weeksOnTarget, tutorContextFor } from "@/lib/my-space";
import { recapWeekStart } from "@/lib/weekly-recap";

const ORIGINAL_SECRET = process.env.CRON_SECRET;
const SECRET = "test-cron-secret-0123456789abcdef0123456789";

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = ORIGINAL_SECRET;
});
afterAll(async () => {
  await prisma.certificate.deleteMany({ where: { certNumber: { startsWith: "VITEST-" } } });
  await cleanupTestData();
});

async function confirmedStudent(label: string) {
  const s = await createTestStudent(label);
  expect((await s.agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: `TRF-${label}` })).status).toBe(200);
  const row = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: s.userId, courseId: "web-dev" } } });
  const { agent: admin } = await createTestAdmin(`${label}-admin`);
  expect((await admin.post(`/api/admin/enrollments/${row.id}/payment`, { status: "PAID_FULL", amountPaid: 79000 })).status).toBe(200);
  return { ...s, admin };
}

describe("streak helpers (Lagos days)", () => {
  const now = new Date("2026-11-18T10:00:00Z"); // Wednesday, Lagos
  it("counts consecutive days, keeping yesterday's streak alive before today's study", () => {
    expect(dayStreak(new Set(["2026-11-16", "2026-11-17", "2026-11-18"]), now)).toBe(3);
    expect(dayStreak(new Set(["2026-11-16", "2026-11-17"]), now)).toBe(2);
    expect(dayStreak(new Set(["2026-11-15", "2026-11-17"]), now)).toBe(1);
    expect(dayStreak(new Set(["2026-11-15"]), now)).toBe(0);
  });
  it("uses the Lagos calendar day", () => {
    expect(lagosDateKey(new Date("2026-11-16T23:30:00Z"))).toBe("2026-11-17");
  });
  it("keeps streaks continuous across Lagos Sunday/Monday midnight and breaks after a missed day", () => {
    const sundayLate = new Date("2026-11-22T22:59:59Z"); // Sunday 23:59:59 Lagos
    const mondayMidnight = new Date("2026-11-22T23:00:00Z"); // Monday 00:00 Lagos
    const sundayAndMonday = new Set(["2026-11-22", "2026-11-23"]);
    expect(lagosDateKey(sundayLate)).toBe("2026-11-22");
    expect(lagosDateKey(mondayMidnight)).toBe("2026-11-23");
    expect(dayStreak(sundayAndMonday, mondayMidnight)).toBe(2);
    expect(dayStreak(new Set(["2026-11-22"]), mondayMidnight)).toBe(1); // yesterday remains alive
    expect(dayStreak(new Set(["2026-11-21"]), mondayMidnight)).toBe(0); // a full missed day breaks it
  });
  it("counts weeks in a row on target", () => {
    const lesson = (iso: string, mins: number) => ({ completedAt: new Date(iso), lesson: { duration: `${mins}:00` } });
    const done = [lesson("2026-11-03T10:00:00Z", 60), lesson("2026-11-10T10:00:00Z", 60), lesson("2026-11-17T10:00:00Z", 30)];
    expect(weeksOnTarget(done, 60, now)).toBe(2); // last two full weeks; this week not met yet
    expect(weeksOnTarget([...done, lesson("2026-11-18T09:00:00Z", 30)], 60, now)).toBe(3);
    expect(weeksOnTarget(done, null, now)).toBe(0);
  });
  it("recaps the week ending today on a Sunday, otherwise last week", () => {
    expect(recapWeekStart(new Date("2026-11-22T17:00:00Z")).toISOString()).toBe("2026-11-15T23:00:00.000Z"); // Sunday 18:00 Lagos
    expect(recapWeekStart(new Date("2026-11-22T22:59:59Z")).toISOString()).toBe("2026-11-15T23:00:00.000Z"); // Sunday 23:59:59 Lagos
    expect(recapWeekStart(new Date("2026-11-22T23:00:00Z")).toISOString()).toBe("2026-11-15T23:00:00.000Z"); // Monday 00:00 Lagos: same completed week
    expect(recapWeekStart(new Date("2026-11-23T01:00:00Z")).toISOString()).toBe("2026-11-15T23:00:00.000Z"); // Monday 02:00 Lagos, late run
    expect(recapWeekStart(new Date("2026-11-18T10:00:00Z")).toISOString()).toBe("2026-11-08T23:00:00.000Z"); // Wednesday
  });
});

describe("My Space roadmap and activity", () => {
  it("lights up finished modules, projects and the certificate", async () => {
    const { agent, userId } = await confirmedStudent("p2-roadmap");
    for (const id of ["les-1", "les-2", "les-3"]) expect((await agent.post("/api/lms/progress", { lessonId: id })).status).toBe(200);

    let space = (await agent.get("/api/lms/my-space")).body;
    let road = space.courses[0].roadmap;
    expect(road.modules[0]).toMatchObject({ status: "DONE", completed: 3, total: 3 });
    expect(road.modules[1].status).toBe("CURRENT");
    expect(road.modules[2].status).toBe("UPCOMING");
    const capstone = road.projects.find((p: { id: string }) => p.id === "assign-web-dev");
    expect(capstone).toMatchObject({ status: "NOT_SUBMITTED", score: null, href: "/learn/web-dev/assignment" });
    expect(road.certificate).toBeNull();

    expect(space.week.days).toHaveLength(7);
    expect(space.week.days.find((d: { isToday: boolean }) => d.isToday).active).toBe(true);
    expect(space.streaks).toMatchObject({ studiedToday: true });
    expect(space.streaks.days).toBeGreaterThanOrEqual(1);
    expect(space.streak).toBe(space.streaks.days);

    await prisma.submission.create({ data: { assignmentId: "assign-web-dev", userId, githubUrl: "https://github.com/x/y", status: "GRADED", score: 91, gradedAt: new Date() } });
    await prisma.certificate.create({ data: { certNumber: `VITEST-${Date.now()}`, userId, courseId: "web-dev", finalScore: 91, qrVerifyUrl: "/verify/x" } });
    space = (await agent.get("/api/lms/my-space")).body;
    road = space.courses[0].roadmap;
    expect(road.projects.find((p: { id: string }) => p.id === "assign-web-dev")).toMatchObject({ status: "GRADED", score: 91 });
    expect(road.certificate.href).toMatch(/^\/certificate\/VITEST-/);
  });

  it("lets the student turn the weekly email off", async () => {
    const { agent } = await createTestStudent("p2-recap-toggle");
    expect((await agent.patch("/api/lms/my-space/profile", { weeklyRecapEmail: "no" })).status).toBe(400);
    const res = await agent.patch("/api/lms/my-space/profile", { weeklyRecapEmail: false });
    expect(res.status).toBe(200);
    expect(res.body.profile.weeklyRecapEmail).toBe(false);
  });
});

describe("AI tutor context", () => {
  it("knows the student's name, goal, level and lesson, but not their private reason", async () => {
    const { agent, userId } = await confirmedStudent("p2-tutor");
    const privateEmail = `PRIVATE-${userId}@example.test`;
    await prisma.user.update({ where: { id: userId }, data: { email: privateEmail, phone: `PHONE-${userId}` } });
    await prisma.enrollment.update({ where: { userId_courseId: { userId, courseId: "web-dev" } }, data: { paymentReference: "PAYMENT-REFERENCE-SENTINEL" } });
    await agent.patch("/api/lms/my-space/profile", { goalType: "FREELANCE", goal: "Sites for shops", experienceLevel: "BEGINNER", weeklyHours: 5, motivation: "SECRET-REASON" });
    await agent.post("/api/lms/progress", { lessonId: "les-1" });
    const ctx = (await tutorContextFor(userId, "web-dev"))!;
    expect(ctx).toContain("Vitest");
    expect(ctx).toContain("freelance");
    expect(ctx).toContain("Sites for shops");
    expect(ctx).toContain("beginner");
    expect(ctx).toContain("1 of 12 lessons");
    expect(ctx).not.toContain("SECRET-REASON");
    expect(ctx).not.toContain(privateEmail);
    expect(ctx).not.toContain(`PHONE-${userId}`);
    expect(ctx).not.toContain("PAYMENT-REFERENCE-SENTINEL");
  });

  it("leaves out course details before confirmation, and is off for staff", async () => {
    const s = await createTestStudent("p2-tutor-pending");
    await s.agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: "TRF-p2-pending" });
    expect(await tutorContextFor(s.userId, "web-dev")).not.toContain("lessons done");
    const admin = await createTestAdmin("p2-tutor-admin");
    expect(await tutorContextFor(admin.userId, "web-dev")).toBeNull();
  });
});

describe("weekly recap job", () => {
  it("needs the cron secret", async () => {
    delete process.env.CRON_SECRET;
    expect((await request(app).post("/api/jobs/weekly-recap")).status).toBe(503);
    process.env.CRON_SECRET = SECRET;
    expect((await request(app).post("/api/jobs/weekly-recap")).status).toBe(401);
    expect((await request(app).post("/api/jobs/weekly-recap").set("Authorization", "Bearer wrong")).status).toBe(401);
  });

  it("rejects a configured but too-short cron secret", async () => {
    process.env.CRON_SECRET = "short";
    expect((await request(app).post("/api/jobs/weekly-recap").set("Authorization", "Bearer short")).status).toBe(401);
  });

  it("sends each confirmed student one recap a week, and skips unconfirmed ones", async () => {
    process.env.CRON_SECRET = SECRET;
    const active = await confirmedStudent("p2-recap-active");
    const optedOut = await confirmedStudent("p2-recap-optout");
    await optedOut.agent.patch("/api/lms/my-space/profile", { weeklyRecapEmail: false });
    const pending = await createTestStudent("p2-recap-pending");
    await pending.agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: "TRF-p2-recap-pending" });

    const run = () => request(app).post("/api/jobs/weekly-recap").set("Authorization", `Bearer ${SECRET}`);
    const first = await run();
    expect(first.status).toBe(200);
    expect(first.body.sent).toBeGreaterThanOrEqual(2);
    const count = (userId: string) => prisma.notification.count({ where: { userId, title: "Your week at BEMS" } });
    expect(await count(active.userId)).toBe(1);
    expect(await count(optedOut.userId)).toBe(1); // in-app recap still shown; only the email is off
    expect(await count(pending.userId)).toBe(0);

    await run();
    expect(await count(active.userId)).toBe(1);

    // Admin fallback button: same rule, nothing new to send.
    const { agent: student } = await createTestStudent("p2-recap-not-admin");
    expect((await student.post("/api/admin/recaps/send")).status).toBe(403);
    expect((await active.admin.post("/api/admin/recaps/send")).status).toBe(200);
    expect(await count(active.userId)).toBe(1);
  });

  it("claims a student's week once when two authorized jobs run concurrently", async () => {
    process.env.CRON_SECRET = SECRET;
    const student = await confirmedStudent("p2-recap-race");
    // Ensure the profile exists before the two workers reach the atomic claim.
    await prisma.learningProfile.upsert({ where: { userId: student.userId }, update: {}, create: { userId: student.userId } });
    const run = () => request(app).post("/api/jobs/weekly-recap").set("Authorization", `Bearer ${SECRET}`);
    const responses = await Promise.all([run(), run()]);
    expect(responses.map((r) => r.status)).toEqual([200, 200]);
    expect(await prisma.notification.count({ where: { userId: student.userId, title: "Your week at BEMS" } })).toBe(1);
  });
});
