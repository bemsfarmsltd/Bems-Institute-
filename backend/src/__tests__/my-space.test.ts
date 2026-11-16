import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { createTestStudent, createTestAdmin, cleanupTestData, SessionAgent, TEST_PASSWORD } from "./helpers";
import { lagosWeekStart, lagosGreeting, durationMinutes } from "@/lib/my-space";

const liveSessionIds: string[] = [];
const MEETING = "https://zoom.us/j/1234567890";

afterAll(async () => {
  await prisma.liveSession.deleteMany({ where: { id: { in: liveSessionIds } } });
  await cleanupTestData();
});

async function registered(label: string, confirmed: boolean) {
  const s = await createTestStudent(label);
  expect((await s.agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: `TRF-${label}`, deliveryMode: "VIRTUAL_ZOOM" })).status).toBe(200);
  const row = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: s.userId, courseId: "web-dev" } } });
  if (confirmed) {
    const { agent: admin } = await createTestAdmin(`${label}-admin`);
    expect((await admin.post(`/api/admin/enrollments/${row.id}/payment`, { status: "PAID_FULL", amountPaid: 79000 })).status).toBe(200);
  }
  return s;
}

describe("Lagos time helpers", () => {
  it("starts the week on Monday 00:00 Lagos time", () => {
    // Sunday 23:30 UTC is already Monday 00:30 in Lagos.
    expect(lagosWeekStart(new Date("2026-11-15T23:30:00Z")).toISOString()).toBe("2026-11-15T23:00:00.000Z");
    // Sunday 22:30 UTC is still Sunday in Lagos: the week began the Monday before.
    expect(lagosWeekStart(new Date("2026-11-15T22:30:00Z")).toISOString()).toBe("2026-11-08T23:00:00.000Z");
    // The boundary itself belongs to the new week, including a month/year rollover.
    expect(lagosWeekStart(new Date("2026-11-15T22:59:59.999Z")).toISOString()).toBe("2026-11-08T23:00:00.000Z");
    expect(lagosWeekStart(new Date("2026-11-15T23:00:00.000Z")).toISOString()).toBe("2026-11-15T23:00:00.000Z");
  });
  it("greets by Lagos hour", () => {
    expect(lagosGreeting(new Date("2026-11-16T07:00:00Z"))).toBe("Good morning");
    expect(lagosGreeting(new Date("2026-11-16T12:00:00Z"))).toBe("Good afternoon");
    expect(lagosGreeting(new Date("2026-11-16T17:30:00Z"))).toBe("Good evening");
    expect(lagosGreeting(new Date("2026-11-16T10:59:59.999Z"))).toBe("Good morning");
    expect(lagosGreeting(new Date("2026-11-16T11:00:00Z"))).toBe("Good afternoon");
    expect(lagosGreeting(new Date("2026-11-16T15:59:59.999Z"))).toBe("Good afternoon");
    expect(lagosGreeting(new Date("2026-11-16T16:00:00Z"))).toBe("Good evening");
  });
  it("parses lesson durations", () => {
    expect(durationMinutes("15:00")).toBe(15);
    expect(durationMinutes("1:30:00")).toBe(90);
    expect(durationMinutes("soon")).toBe(0);
  });
});

describe("GET /api/lms/my-space", () => {
  it("requires sign-in", async () => {
    expect((await request(app).get("/api/lms/my-space")).status).toBe(401);
  });

  it("asks a new student for the welcome setup", async () => {
    const { agent } = await createTestStudent("space-new");
    const res = await agent.get("/api/lms/my-space");
    expect(res.status).toBe(200);
    expect(res.body.onboarded).toBe(false);
    expect(res.body.profile).toBeNull();
    expect(res.body.firstName).toBe("Vitest");
    expect(res.body.courses).toEqual([]);
    expect(res.body.communityUrl).toBeNull();
  });

  it("doesn't ask staff for the welcome setup", async () => {
    const { agent } = await createTestAdmin("space-staff");
    expect((await agent.get("/api/lms/my-space")).body.onboarded).toBe(true);
  });

  it("doesn't ask instructors for the student welcome setup", async () => {
    const { userId, email } = await createTestStudent("space-instructor");
    await prisma.user.update({ where: { id: userId }, data: { role: "INSTRUCTOR", tokenVersion: { increment: 1 } } });
    const instructor = new SessionAgent();
    expect((await instructor.post("/api/auth/login", { email, password: TEST_PASSWORD })).status).toBe(200);
    const space = (await instructor.get("/api/lms/my-space")).body;
    expect(space.onboarded).toBe(true);
    expect(space.courses).toEqual([]);
  });

  it("shows an unpaid registration without lesson or class links", async () => {
    const { agent } = await registered("space-pending", false);
    const live = await prisma.liveSession.create({ data: { courseId: "web-dev", title: "Space pending test", scheduledAt: new Date(Date.now() + 86400000), meetingUrl: MEETING } });
    liveSessionIds.push(live.id);
    const [course] = (await agent.get("/api/lms/my-space")).body.courses;
    expect(course).toMatchObject({ courseId: "web-dev", tutor: "Mr. Victor", deliveryMode: "VIRTUAL_ZOOM", hasAccess: false, nextLesson: null, nextLiveSession: null });
    // The live-classes list used to hand out meeting links to any registration.
    const mine = (await agent.get("/api/attendance/live")).body.sessions;
    expect(mine).toEqual([]);
  });

  it("gives a confirmed student their next lesson, class, week and feedback", async () => {
    const { agent, userId } = await registered("space-active", true);
    expect((await agent.patch("/api/lms/my-space/profile", { goalType: "JOB", experienceLevel: "BEGINNER", weeklyHours: 2 })).status).toBe(200);
    const live = await prisma.liveSession.create({ data: { courseId: "web-dev", title: "Space active test", scheduledAt: new Date(Date.now() + 3600000), meetingUrl: MEETING } });
    liveSessionIds.push(live.id);

    let space = (await agent.get("/api/lms/my-space")).body;
    let course = space.courses[0];
    expect(course.hasAccess).toBe(true);
    expect(course.nextLesson).toMatchObject({ id: "les-1", href: "/learn/web-dev/les-1" });
    expect(course.nextLiveSession).toMatchObject({ meetingUrl: MEETING });
    expect(space.week).toMatchObject({ lessonsCompleted: 0, minutesStudied: 0, goalMinutes: 120, percentOfGoal: 0 });

    expect((await agent.post("/api/lms/progress", { lessonId: "les-1" })).status).toBe(200);
    await prisma.submission.create({
      data: { assignmentId: "assign-web-dev", userId, githubUrl: "https://github.com/x/y", status: "GRADED", score: 88, feedback: "Clean layout.", gradedBy: "Mr. Victor", gradedAt: new Date() }
    });

    space = (await agent.get("/api/lms/my-space")).body;
    course = space.courses[0];
    expect(course.nextLesson.id).toBe("les-2");
    expect(course.progress.completed).toBe(1);
    expect(space.week.lessonsCompleted).toBe(1);
    expect(space.week.minutesStudied).toBeGreaterThan(0);
    expect(course.latestFeedback).toMatchObject({ score: 88, feedback: "Clean layout.", gradedBy: "Mr. Victor" });
    expect(space.streak).toBeGreaterThanOrEqual(1);
  });
});

describe("PATCH /api/lms/my-space/profile", () => {
  it("validates the answers", async () => {
    const { agent } = await createTestStudent("space-validate");
    expect((await agent.patch("/api/lms/my-space/profile", { goalType: "ASTRONAUT" })).status).toBe(400);
    expect((await agent.patch("/api/lms/my-space/profile", { weeklyHours: 0 })).status).toBe(400);
    expect((await agent.patch("/api/lms/my-space/profile", { weeklyHours: 2.5 })).status).toBe(400);
    expect((await agent.patch("/api/lms/my-space/profile", { weeklyHours: true })).status).toBe(400);
    expect((await agent.patch("/api/lms/my-space/profile", { experienceLevel: "GURU" })).status).toBe(400);
    expect((await agent.patch("/api/lms/my-space/profile", { motivation: "x".repeat(281) })).status).toBe(400);
    expect((await agent.patch("/api/lms/my-space/profile", { goal: { $ne: 1 } })).status).toBe(400);
  });

  it("counts as onboarded only once goal, experience and hours are all set", async () => {
    const { agent } = await createTestStudent("space-onboard");
    let res = await agent.patch("/api/lms/my-space/profile", { goalType: "FREELANCE", motivation: "  I want\u0000 to\n\nfreelance  " });
    expect(res.status).toBe(200);
    expect(res.body.profile.motivation).toBe("I want to freelance");
    expect((await agent.get("/api/lms/my-space")).body.onboarded).toBe(false);

    res = await agent.patch("/api/lms/my-space/profile", { experienceLevel: "INTERMEDIATE", weeklyHours: 10, goal: "Build sites for shops in Umuahia" });
    const space = (await agent.get("/api/lms/my-space")).body;
    expect(space.onboarded).toBe(true);
    expect(space.profile).toMatchObject({ goalType: "FREELANCE", experienceLevel: "INTERMEDIATE", weeklyHours: 10, goal: "Build sites for shops in Umuahia" });
  });

  it("doesn't treat the schema's default BEGINNER as an answer the student gave", async () => {
    const { agent } = await createTestStudent("space-default-experience");
    expect((await agent.patch("/api/lms/my-space/profile", { goalType: "JOB", weeklyHours: 5 })).status).toBe(200);
    expect((await agent.get("/api/lms/my-space")).body.onboarded).toBe(false);

    // Any later partial edit currently sees the DB default and marks setup complete.
    await agent.patch("/api/lms/my-space/profile", { motivation: "I want to build useful apps." });
    expect((await agent.get("/api/lms/my-space")).body.onboarded).toBe(false);
  });

  it("keeps each student's answers to themselves", async () => {
    const a = await createTestStudent("space-private-a");
    const b = await createTestStudent("space-private-b");
    await a.agent.patch("/api/lms/my-space/profile", { motivation: "A's private reason" });
    expect((await b.agent.get(`/api/lms/my-space?userId=${a.userId}`)).body.profile).toBeNull();
    await b.agent.patch("/api/lms/my-space/profile", { userId: a.userId, motivation: "B tried to edit A's answer" });
    expect((await a.agent.get("/api/lms/my-space")).body.profile.motivation).toBe("A's private reason");
    expect(JSON.stringify((await b.agent.get("/api/lms/class-goals")).body)).not.toContain("A's private reason");
  });
});
