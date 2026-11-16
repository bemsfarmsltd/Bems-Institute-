import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { createTestStudent, createTestAdmin, cleanupTestData } from "./helpers";
import { longestDayStreak, goalWeekHistory } from "@/lib/my-space";
import { awardBadges, BADGES, type BadgeStats } from "@/lib/badges";

afterAll(async () => {
  await prisma.certificate.deleteMany({ where: { certNumber: { startsWith: "VITEST-P3-" } } });
  await cleanupTestData();
});

async function confirmedStudent(label: string) {
  const s = await createTestStudent(label);
  expect((await s.agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: `TRF-${label}` })).status).toBe(200);
  const row = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: s.userId, courseId: "web-dev" } } });
  const { agent: admin } = await createTestAdmin(`${label}-admin`);
  expect((await admin.post(`/api/admin/enrollments/${row.id}/payment`, { status: "PAID_FULL", amountPaid: 79000 })).status).toBe(200);
  return s;
}
const badge = (space: { badges: { id: string; earned: boolean; isNew: boolean }[] }, id: string) => space.badges.find((b) => b.id === id)!;
const badgeNotes = (userId: string, title: string) => prisma.notification.count({ where: { userId, title: `Badge earned: ${title}` } });

describe("appearance", () => {
  it("defaults to the BEMS look and accepts only the presets", async () => {
    const { agent } = await createTestStudent("p3-look");
    expect((await agent.get("/api/lms/my-space")).body.appearance).toEqual({ accentColor: "purple", accentHex: "#9C3FB5", banner: "aurora" });
    expect((await agent.patch("/api/lms/my-space/profile", { accentColor: "#ff0000" })).status).toBe(400);
    expect((await agent.patch("/api/lms/my-space/profile", { banner: "javascript:alert(1)" })).status).toBe(400);
    expect((await agent.patch("/api/lms/my-space/profile", { accentColor: "teal", banner: "lagoon" })).status).toBe(200);
    expect((await agent.get("/api/lms/my-space")).body.appearance).toEqual({ accentColor: "teal", accentHex: "#0B7F75", banner: "lagoon" });
    await agent.patch("/api/lms/my-space/profile", { accentColor: null });
    expect((await agent.get("/api/lms/my-space")).body.appearance.accentColor).toBe("purple");
  });
});

describe("badge helpers", () => {
  it("finds the longest run of study days", () => {
    expect(longestDayStreak(new Set(["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-05", "2026-11-06"]))).toBe(3);
    expect(longestDayStreak(new Set(["2026-10-31", "2026-11-01"]))).toBe(2); // across a month end
    expect(longestDayStreak(new Set())).toBe(0);
  });
  it("counts weeks at the weekly goal and the best run", () => {
    const l = (iso: string, m: number) => ({ completedAt: new Date(iso), lesson: { duration: `${m}:00` } });
    const done = [l("2026-10-20T10:00:00Z", 60), l("2026-10-27T10:00:00Z", 60), l("2026-11-03T10:00:00Z", 60), l("2026-11-17T10:00:00Z", 60)];
    expect(goalWeekHistory(done, 60)).toEqual({ weeksOnGoal: 4, bestRun: 3 });
    expect(goalWeekHistory(done, null)).toEqual({ weeksOnGoal: 0, bestRun: 0 });
  });
});

describe("milestone badges", () => {
  it("lists every badge locked for a new student, none for staff", async () => {
    const { agent } = await createTestStudent("p3-new");
    const space = (await agent.get("/api/lms/my-space")).body;
    expect(space.badges).toHaveLength(BADGES.length);
    expect(space.badges.every((b: { earned: boolean; description: string }) => !b.earned && b.description)).toBe(true);
    const { agent: admin } = await createTestAdmin("p3-staff");
    expect((await admin.get("/api/lms/my-space")).body.badges).toEqual([]);
  });

  it("awards from real activity, announces each once, and can be marked seen", async () => {
    const { agent, userId } = await confirmedStudent("p3-earn");
    await agent.post("/api/lms/progress", { lessonId: "les-1" });
    let space = (await agent.get("/api/lms/my-space")).body;
    expect(badge(space, "first-lesson")).toMatchObject({ earned: true, isNew: true });
    expect(badge(space, "module-complete").earned).toBe(false);
    expect(await badgeNotes(userId, "First Step")).toBe(1);

    for (const id of ["les-2", "les-3"]) await agent.post("/api/lms/progress", { lessonId: id });
    await agent.get("/api/lms/my-space");
    space = (await agent.get("/api/lms/my-space")).body;
    expect(badge(space, "module-complete").earned).toBe(true);
    expect(await badgeNotes(userId, "First Step")).toBe(1);
    expect(await badgeNotes(userId, "Module Master")).toBe(1);

    // Undoing a lesson doesn't take a badge back.
    await agent.post("/api/lms/progress", { lessonId: "les-1" });
    expect(badge((await agent.get("/api/lms/my-space")).body, "first-lesson").earned).toBe(true);

    expect((await agent.post("/api/lms/my-space/badges/seen")).body.seen).toBeGreaterThanOrEqual(2);
    space = (await agent.get("/api/lms/my-space")).body;
    expect(space.badges.some((b: { isNew: boolean }) => b.isNew)).toBe(false);
  });

  it("awards quiz, project and certificate badges", async () => {
    const { agent, userId } = await confirmedStudent("p3-more");
    const quiz = await prisma.quiz.findFirstOrThrow({ where: { courseId: "web-dev" } });
    await prisma.quizAttempt.create({ data: { userId, quizId: quiz.id, score: 100, passed: true, answers: {} } });
    await prisma.submission.create({ data: { assignmentId: "assign-web-dev", userId, githubUrl: "https://github.com/x/y", status: "GRADED", score: 90, gradedAt: new Date() } });
    await prisma.certificate.create({ data: { certNumber: `VITEST-P3-${Date.now()}`, userId, courseId: "web-dev", finalScore: 90, qrVerifyUrl: "/verify/x" } });
    const space = (await agent.get("/api/lms/my-space")).body;
    for (const id of ["quiz-ace", "first-project", "high-score", "certified"]) expect(badge(space, id).earned).toBe(true);
    expect(badge(space, "streak-7").earned).toBe(false);
  });

  it("announces a badge once even when two requests award it at the same moment", async () => {
    const { userId } = await createTestStudent("p3-race");
    const stats: BadgeStats = { lessonsCompleted: 1, modulesCompleted: 0, bestCoursePercent: 0, coursesCompleted: 0, longestDayStreak: 0, weeksOnGoal: 0, bestWeeklyRun: 0, projectsSubmitted: 0, bestProjectScore: null, bestQuizScore: null, certificates: 0 };
    const [a, b] = await Promise.all([awardBadges(userId, stats), awardBadges(userId, stats)]);
    expect([...a, ...b]).toEqual(["first-lesson"]);
    expect(await prisma.userBadge.count({ where: { userId } })).toBe(1);
    expect(await badgeNotes(userId, "First Step")).toBe(1);
  });

  it("marking seen only touches the caller's own badges", async () => {
    const a = await confirmedStudent("p3-seen-a");
    const b = await createTestStudent("p3-seen-b");
    await a.agent.post("/api/lms/progress", { lessonId: "les-1" });
    await a.agent.get("/api/lms/my-space");
    const bSpace = (await b.agent.get(`/api/lms/my-space?userId=${a.userId}`)).body;
    expect(bSpace.badges.every((entry: { earned: boolean; isNew: boolean }) => !entry.earned && !entry.isNew)).toBe(true);
    await b.agent.post("/api/lms/my-space/badges/seen");
    expect(badge((await a.agent.get("/api/lms/my-space")).body, "first-lesson").isNew).toBe(true);
  });
});
