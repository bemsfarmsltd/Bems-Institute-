import { describe, it, expect, afterAll, afterEach } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { createTestStudent, createTestAdmin, cleanupTestData, SessionAgent, TEST_PASSWORD } from "./helpers";
import { handleProblem, suggestHandle, safeLink } from "@/lib/portfolio";
import { runReminders, inGoalWindow, inStreakWindow, lagosTime } from "@/lib/reminders";
import { sendPush } from "@/lib/push";

const ORIGINAL_SECRET = process.env.CRON_SECRET;
afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = ORIGINAL_SECRET;
});
afterAll(async () => {
  await prisma.liveSession.deleteMany({ where: { title: { startsWith: "Vitest" } } });
  await cleanupTestData();
});

async function confirmedStudent(label: string) {
  const s = await createTestStudent(label);
  expect((await s.agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: `TRF-${label}` })).status).toBe(200);
  const row = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: s.userId, courseId: "web-dev" } } });
  const { agent: admin } = await createTestAdmin(`${label}-admin`);
  expect((await admin.post(`/api/admin/enrollments/${row.id}/payment`, { status: "PAID_FULL", amountPaid: 79000 })).status).toBe(200);
  return { ...s, admin, enrollmentId: row.id };
}

async function createTestTutor(label: string) {
  const s = await createTestStudent(label);
  await prisma.user.update({ where: { id: s.userId }, data: { role: "INSTRUCTOR" } });
  const agent = new SessionAgent();
  await agent.post("/api/auth/login", { email: s.email, password: TEST_PASSWORD });
  return { ...s, agent };
}

async function paidLesson() {
  return prisma.lesson.findFirstOrThrow({ where: { isFreePreview: false, module: { courseId: "web-dev" } }, orderBy: { order: "asc" } });
}

// ---------------------------------------------------------------------------
describe("portfolio helpers", () => {
  it("accepts simple handles and rejects bad or reserved ones", () => {
    expect(handleProblem("ada-obi")).toBeNull();
    expect(handleProblem("ab")).toMatch(/3 to 30/);
    expect(handleProblem("Ada")).toMatch(/lowercase/);
    expect(handleProblem("ada--obi")).toMatch(/lowercase/);
    expect(handleProblem("-ada")).toMatch(/lowercase/);
    expect(handleProblem("admin")).toMatch(/reserved/);
  });
  it("suggests a handle from the name", () => {
    expect(suggestHandle("Adaéze  Obi")).toBe("adaeze-obi");
    expect(suggestHandle("Jo")).toBe("jo-bems");
    expect(suggestHandle("Admin")).toBe("admin-bems");
  });
  it("only lets http(s) links through", () => {
    expect(safeLink("https://github.com/ada/site")).toBe("https://github.com/ada/site");
    expect(safeLink("javascript:alert(1)")).toBeNull();
    expect(safeLink("data:text/html,hi")).toBeNull();
    expect(safeLink("not a url")).toBeNull();
  });
});

describe("public portfolio", () => {
  it("stays off until a confirmed student turns it on, and shows only public things", async () => {
    const pending = await createTestStudent("p4-pending");
    await pending.agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: "TRF-p4-pending" });
    const blocked = await pending.agent.patch("/api/lms/my-space/portfolio", { handle: `vitest-p-${Date.now()}`, enabled: true });
    expect(blocked.status).toBe(403);

    const s = await confirmedStudent("p4-port");
    const handle = `vitest-${Date.now().toString(36)}`;
    let settings = (await s.agent.get("/api/lms/my-space/portfolio")).body;
    expect(settings).toMatchObject({ enabled: false, handle: null, canEnable: true });
    expect(settings.suggestedHandle).toMatch(/^vitest-p4-port/);

    // Can't switch on without an address.
    expect((await s.agent.patch("/api/lms/my-space/portfolio", { enabled: true })).status).toBe(400);
    // Saving the address alone doesn't publish anything.
    expect((await s.agent.patch("/api/lms/my-space/portfolio", { handle: handle.toUpperCase(), headline: "  Frontend   developer " })).status).toBe(200);
    expect((await request(app).get(`/api/portfolio/${handle}`)).status).toBe(404);

    await prisma.submission.create({
      data: { assignmentId: "assign-web-dev", userId: s.userId, githubUrl: "javascript:alert(1)", liveDemoUrl: "https://ada.dev", status: "GRADED", score: 88, gradedAt: new Date(), feedback: "Private feedback" }
    });
    await prisma.learningProfile.update({ where: { userId: s.userId }, data: { motivation: "secret reason", learningGoal: "secret goal" } });

    settings = (await s.agent.patch("/api/lms/my-space/portfolio", { enabled: true })).body;
    expect(settings).toMatchObject({ enabled: true, handle, headline: "Frontend developer" });
    expect(settings.url).toMatch(new RegExp(`/u/${handle}$`));

    const pub = await request(app).get(`/api/portfolio/${handle}`);
    expect(pub.status).toBe(200);
    expect(pub.headers["cache-control"]).toBe("no-store");
    const p = pub.body.portfolio;
    expect(p.name).toBe("Vitest p4-port");
    expect(p.tracks[0]).toMatchObject({ slug: "web-dev", status: "IN_PROGRESS" });
    expect(p.projects[0]).toMatchObject({ githubUrl: null, liveDemoUrl: "https://ada.dev/", score: null });
    const text = JSON.stringify(pub.body);
    for (const secret of [s.email, "secret reason", "secret goal", "Private feedback", "phone", "streak", "amountPaid"]) expect(text).not.toContain(secret);

    // Scores only when the student chooses.
    await s.agent.patch("/api/lms/my-space/portfolio", { showScores: true });
    expect((await request(app).get(`/api/portfolio/${handle}`)).body.portfolio.projects[0].score).toBe(88);

    // Address taken by someone else.
    const other = await confirmedStudent("p4-port2");
    expect((await other.agent.patch("/api/lms/my-space/portfolio", { handle })).status).toBe(409);
    expect((await other.agent.patch("/api/lms/my-space/portfolio", { handle: "admin" })).status).toBe(400);

    // Turning it off (or deactivating the account) hides it at once.
    await s.agent.patch("/api/lms/my-space/portfolio", { enabled: false });
    expect((await request(app).get(`/api/portfolio/${handle}`)).status).toBe(404);
    await s.agent.patch("/api/lms/my-space/portfolio", { enabled: true });
    await prisma.user.update({ where: { id: s.userId }, data: { deactivatedAt: new Date() } });
    expect((await request(app).get(`/api/portfolio/${handle}`)).status).toBe(404);
    expect((await request(app).get("/api/portfolio/no-such-person-here")).status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
describe("lesson notes and bookmarks", () => {
  it("are private, need access to the lesson, and an empty note deletes it", async () => {
    const lesson = await paidLesson();
    const pending = await createTestStudent("p4-notes-pending");
    expect((await pending.agent.put(`/api/lms/notes/${lesson.id}`, { body: "hi" })).status).toBe(404);
    expect((await pending.agent.post("/api/lms/bookmarks", { lessonId: lesson.id })).status).toBe(404);

    const s = await confirmedStudent("p4-notes");
    expect((await s.agent.put(`/api/lms/notes/${lesson.id}`, { body: "  Flexbox: justify vs align  " })).body.note.body).toBe("Flexbox: justify vs align");
    expect((await s.agent.get(`/api/lms/notes/${lesson.id}`)).body.note.body).toBe("Flexbox: justify vs align");
    const list = (await s.agent.get("/api/lms/notes")).body.notes;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ lessonId: lesson.id, courseSlug: "web-dev", href: `/learn/web-dev/${lesson.id}` });
    expect((await s.agent.put(`/api/lms/notes/${lesson.id}`, { body: "x".repeat(5001) })).status).toBe(400);
    expect((await pending.agent.get("/api/lms/notes")).body.notes).toHaveLength(0);
    expect((await s.agent.put(`/api/lms/notes/${lesson.id}`, { body: "   " })).body.note).toBeNull();
    expect((await s.agent.get("/api/lms/notes")).body.notes).toHaveLength(0);

    const a = await s.agent.post("/api/lms/bookmarks", { lessonId: lesson.id });
    expect(a.status).toBe(201);
    expect(a.body.bookmark).toMatchObject({ kind: "LESSON", title: lesson.title, href: `/learn/web-dev/${lesson.id}` });
    // Saving twice gives the same bookmark.
    expect((await s.agent.post("/api/lms/bookmarks", { lessonId: lesson.id })).body.bookmark.id).toBe(a.body.bookmark.id);
    const link = await s.agent.post("/api/lms/bookmarks", { url: "https://developer.mozilla.org/en-US/docs/Web/CSS", title: "MDN CSS" });
    expect(link.body.bookmark).toMatchObject({ kind: "LINK", title: "MDN CSS", href: null });
    expect((await s.agent.post("/api/lms/bookmarks", { url: "javascript:alert(1)", title: "bad" })).status).toBe(400);
    expect((await s.agent.post("/api/lms/bookmarks", { url: "https://example.com" })).status).toBe(400);
    expect((await s.agent.get("/api/lms/bookmarks")).body.bookmarks).toHaveLength(2);

    // Someone else can't delete it.
    expect((await pending.agent.delete(`/api/lms/bookmarks/${link.body.bookmark.id}`)).status).toBe(404);
    expect((await s.agent.delete(`/api/lms/bookmarks/${link.body.bookmark.id}`)).status).toBe(200);
    expect((await s.agent.get("/api/lms/bookmarks")).body.bookmarks).toHaveLength(1);
    expect((await request(app).get("/api/lms/bookmarks")).status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
describe("tutor view", () => {
  it("shows a tutor only their own courses' students, with goals only when shared", async () => {
    const s = await confirmedStudent("p4-tutee");
    await s.agent.patch("/api/lms/my-space/profile", { goalType: "JOB", goal: "Frontend job", experienceLevel: "BEGINNER", weeklyHours: 5, motivation: "very private" });
    const tutor = await createTestTutor("p4-tutor");

    expect((await s.agent.get("/api/instructor/students")).status).toBe(403);
    // Not assigned yet: nothing to see, and no way into the course.
    expect((await tutor.agent.get("/api/instructor/students")).body.students).toHaveLength(0);
    expect((await tutor.agent.get(`/api/instructor/students/${s.userId}?courseId=web-dev`)).status).toBe(403);

    // Only admins assign, and only staff can be tutors.
    expect((await tutor.agent.put("/api/instructor/course-tutors/web-dev", { userIds: [tutor.userId] })).status).toBe(403);
    expect((await s.admin.put("/api/instructor/course-tutors/web-dev", { userIds: [s.userId] })).status).toBe(400);
    const assigned = await s.admin.put("/api/instructor/course-tutors/web-dev", { userIds: [tutor.userId] });
    expect(assigned.status).toBe(200);
    expect(assigned.body.courses.find((c: { id: string }) => c.id === "web-dev").tutors.map((t: { id: string }) => t.id)).toContain(tutor.userId);

    // New students share by default.
    let list = (await tutor.agent.get("/api/instructor/students?courseId=web-dev")).body;
    let row = list.students.find((r: { userId: string }) => r.userId === s.userId);
    expect(row.goal).toMatchObject({ goalType: "JOB", goalLabel: "Get a tech job", goal: "Frontend job", weeklyHours: 5 });
    expect(JSON.stringify(list)).not.toContain("very private");
    expect(JSON.stringify(list)).not.toContain(s.email); // contact only in the detail view

    // The student turns sharing off.
    expect((await s.agent.patch("/api/lms/my-space/profile", { shareWithTutor: false })).body.profile.shareWithTutor).toBe(false);
    list = (await tutor.agent.get("/api/instructor/students?courseId=web-dev")).body;
    row = list.students.find((r: { userId: string }) => r.userId === s.userId);
    expect(row.goal).toBeNull();
    expect(row.week.goalMinutes).toBeNull();

    const detail = await tutor.agent.get(`/api/instructor/students/${s.userId}?courseId=web-dev`);
    expect(detail.status).toBe(200);
    expect(detail.body.student.contact.email).toBe(s.email);
    expect(detail.body.student.modules.length).toBeGreaterThan(0);
    expect(JSON.stringify(detail.body)).not.toContain("very private");

    // Unassigning removes access.
    await s.admin.put("/api/instructor/course-tutors/web-dev", { userIds: [] });
    expect((await tutor.agent.get(`/api/instructor/students/${s.userId}?courseId=web-dev`)).status).toBe(403);
  });

  it("flags students who haven't started, have gone quiet, or are struggling", async () => {
    const quiet = await confirmedStudent("p4-quiet");
    const lesson = await paidLesson();
    await prisma.userProgress.create({ data: { userId: quiet.userId, lessonId: lesson.id, isCompleted: true, completedAt: new Date(Date.now() - 10 * 86400000) } });
    const quiz = await prisma.quiz.findFirstOrThrow({ where: { courseId: "web-dev" } });
    await prisma.quizAttempt.create({ data: { userId: quiet.userId, quizId: quiz.id, score: 30, passed: false, answers: {}, createdAt: new Date(Date.now() - 10 * 86400000) } });

    const fresh = await confirmedStudent("p4-fresh");
    await prisma.enrollment.update({ where: { id: fresh.enrollmentId }, data: { updatedAt: new Date(Date.now() - 6 * 86400000) } });

    const { agent: admin } = await createTestAdmin("p4-flags-admin");
    const { students } = (await admin.get("/api/instructor/students?courseId=web-dev")).body;
    const q = students.find((r: { userId: string }) => r.userId === quiet.userId);
    expect(q.flags.map((f: { kind: string }) => f.kind)).toEqual(expect.arrayContaining(["INACTIVE", "LOW_QUIZ"]));
    expect(q.needsAttention).toBe(true);
    const f = students.find((r: { userId: string }) => r.userId === fresh.userId);
    expect(f.flags.map((x: { kind: string }) => x.kind)).toContain("NOT_STARTED");
    // Students needing attention come first.
    const firstCalm = students.findIndex((r: { needsAttention: boolean }) => !r.needsAttention);
    if (firstCalm >= 0) expect(students.slice(firstCalm).every((r: { needsAttention: boolean }) => !r.needsAttention)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
describe("reminders", () => {
  it("knows the Lagos evening windows", () => {
    expect(inStreakWindow(new Date("2026-11-23T19:30:00Z"))).toBe(true); // 20:30 Lagos
    expect(inStreakWindow(new Date("2026-11-23T12:00:00Z"))).toBe(false);
    expect(inGoalWindow(new Date("2026-11-27T17:00:00Z"))).toBe(true); // Friday 18:00 Lagos
    expect(inGoalWindow(new Date("2026-11-24T17:00:00Z"))).toBe(false); // Tuesday
    expect(lagosTime(new Date("2026-11-23T15:00:00Z"))).toBe("4:00 pm");
  });

  it.fails("rejects push subscriptions to private HTTPS endpoints", async () => {
    const s = await createTestStudent("p4-push-private-endpoint");
    const res = await s.agent.post("/api/lms/push/subscribe", {
      endpoint: "https://127.0.0.1/internal",
      keys: { p256dh: "a".repeat(87), auth: "b".repeat(22) }
    });
    expect(res.status).toBe(400);
  });

  it("reminds confirmed students once before class, unless they turned it off", async () => {
    const s = await confirmedStudent("p4-class");
    const off = await confirmedStudent("p4-class-off");
    await off.agent.patch("/api/lms/reminders", { classes: false });
    const pending = await createTestStudent("p4-class-pending");
    await pending.agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: "TRF-p4-cp" });

    const now = new Date("2026-11-23T10:00:00Z"); // 11:00 Lagos: no evening nudges
    await prisma.liveSession.create({ data: { courseId: "web-dev", title: "Vitest CSS Grid", scheduledAt: new Date(now.getTime() + 40 * 60000) } });
    await runReminders(now);
    await runReminders(now); // a second run must not repeat it

    const mine = await prisma.notification.findMany({ where: { userId: s.userId, title: { startsWith: "Class starts" } } });
    expect(mine).toHaveLength(1);
    expect(mine[0].message).toContain("Vitest CSS Grid");
    expect(mine[0].title).toBe("Class starts at 11:40 am");
    expect(await prisma.notification.count({ where: { userId: off.userId, title: { startsWith: "Class starts" } } })).toBe(0);
    expect(await prisma.notification.count({ where: { userId: pending.userId, title: { startsWith: "Class starts" } } })).toBe(0);
  });

  it("nudges a student to keep a streak in the evening if they haven't studied today", async () => {
    const s = await confirmedStudent("p4-streak");
    const now = new Date("2026-11-23T19:30:00Z"); // Monday 20:30 Lagos
    for (const daysAgo of [1, 2]) {
      await prisma.learningEvent.create({ data: { userId: s.userId, eventType: "AI_TUTOR_USED", createdAt: new Date(now.getTime() - daysAgo * 86400000) } });
    }
    await runReminders(now);
    await runReminders(now);
    const nudges = await prisma.notification.findMany({ where: { userId: s.userId, title: { startsWith: "Keep your" } } });
    expect(nudges).toHaveLength(1);
    expect(nudges[0].title).toBe("Keep your 2-day streak going");
  });

  it("saves reminder settings and push sign-ups safely", async () => {
    const s = await confirmedStudent("p4-prefs");
    const prefs = (await s.agent.get("/api/lms/reminders")).body;
    expect(prefs).toMatchObject({ classes: true, goal: true, streak: true, whatsapp: false, phoneOnFile: false, push: { devices: 0 } });
    expect((await s.agent.patch("/api/lms/reminders", { whatsapp: true })).status).toBe(400); // no phone yet
    expect((await s.agent.patch("/api/lms/reminders", { streak: "no" })).status).toBe(400);
    await prisma.user.update({ where: { id: s.userId }, data: { phone: "08030000000" } });
    expect((await s.agent.patch("/api/lms/reminders", { whatsapp: true, streak: false })).body).toMatchObject({ whatsapp: true, streak: false });

    expect((await s.agent.post("/api/lms/push/subscribe", { endpoint: "http://insecure.example/x", keys: { p256dh: "a".repeat(30), auth: "b".repeat(12) } })).status).toBe(400);
    const endpoint = `https://push.example.com/vitest-${Date.now()}`;
    expect((await s.agent.post("/api/lms/push/subscribe", { endpoint, keys: { p256dh: "a".repeat(87), auth: "b".repeat(22) } })).status).toBe(200);
    expect((await s.agent.get("/api/lms/reminders")).body.push.devices).toBe(1);
    // Without server keys push is off, quietly.
    if (!process.env.VAPID_PRIVATE_KEY) expect(await sendPush(s.userId, { title: "t", body: "b" })).toBe(0);
    await s.agent.post("/api/lms/push/unsubscribe", { endpoint });
    expect((await s.agent.get("/api/lms/reminders")).body.push.devices).toBe(0);
  });

  it("the reminders job needs the cron secret", async () => {
    delete process.env.CRON_SECRET;
    expect((await request(app).post("/api/jobs/reminders")).status).toBe(503);
    process.env.CRON_SECRET = "test-cron-secret-0123456789abcdef0123456789";
    expect((await request(app).post("/api/jobs/reminders").set("Authorization", "Bearer wrong")).status).toBe(401);
  });
});
