import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import type { UserRole } from "@prisma/client";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createStaffInvite } from "@/lib/staff-invites";
import { createTestAdmin, cleanupTestData, SessionAgent, TEST_PASSWORD, testEmail } from "./helpers";
import { can, permissionsOf, portalsOf, ROLE_PERMISSIONS } from "@/lib/permissions";

afterAll(cleanupTestData);

async function staff(label: string, role: UserRole, extraRoles: UserRole[] = []) {
  const email = testEmail(label);
  const user = await prisma.user.create({ data: { name: `Vitest ${label}`, email, passwordHash: await hashPassword(TEST_PASSWORD), role, extraRoles } });
  const agent = new SessionAgent();
  const login = await agent.post("/api/auth/login", { email, password: TEST_PASSWORD });
  expect(login.status).toBe(200);
  return { agent, userId: user.id, email };
}

// What each role may open. 200 = allowed, 403 = refused.
const ENDPOINTS: [string, string][] = [
  ["analytics", "/api/admin/analytics"],
  ["ledger", "/api/admin/payment-ledger"],
  ["leads", "/api/admin/leads"],
  ["pending", "/api/admin/enrollments/pending-approval"],
  ["staff", "/api/admin/staff"],
  ["settings", "/api/admin/settings/general"],
  ["campaigns", "/api/admin/qr-campaigns"],
  ["audit", "/api/admin/audit"],
  ["tutorApps", "/api/tutor-applications"],
  ["courseTutors", "/api/instructor/course-tutors"],
  ["graduates", "/api/graduates/admin"]
];
const EXPECT: Record<string, string[]> = {
  FINANCE: ["analytics", "ledger"],
  ADMISSIONS: ["leads", "pending", "campaigns", "tutorApps"],
  MANAGEMENT: ["analytics", "audit"],
  INSTRUCTOR: [],
  STUDENT: []
};

describe("permission rules", () => {
  it("admins can do everything; office roles only their own work", () => {
    expect(permissionsOf({ role: "ADMIN" }).length).toBe(ROLE_PERMISSIONS.ADMIN.size);
    expect(can({ role: "FINANCE" }, "payments.refund")).toBe(true);
    expect(can({ role: "FINANCE" }, "staff.manage")).toBe(false);
    expect(can({ role: "MANAGEMENT" }, "roster.view")).toBe(false);
    expect(can({ role: "MANAGEMENT", roles: ["ADMISSIONS"] }, "admissions.manage")).toBe(true);
    expect(portalsOf({ role: "INSTRUCTOR", roles: ["FINANCE"] }).map((p) => p.path)).toEqual(["/finance", "/tutor"]);
  });
});

describe("each role sees only its own portal's data", () => {
  for (const role of Object.keys(EXPECT) as UserRole[]) {
    it(`${role}`, async () => {
      const { agent } = await staff(`perm-${role.toLowerCase()}`, role);
      const results: Record<string, number> = {};
      for (const [name, path] of ENDPOINTS) results[name] = (await agent.get(path)).status;
      const expected = Object.fromEntries(ENDPOINTS.map(([name]) => [name, EXPECT[role].includes(name) ? 200 : 403]));
      expect(results).toEqual(expected);
    });
  }

  it("admins still open everything", async () => {
    const { agent } = await createTestAdmin("perm-admin");
    for (const [, path] of ENDPOINTS) expect((await agent.get(path)).status).toBe(200);
  });

  it("an extra role adds its permissions (Management + Admissions)", async () => {
    const { agent } = await staff("perm-combo", "MANAGEMENT", ["ADMISSIONS"]);
    expect((await agent.get("/api/admin/leads")).status).toBe(200);
    expect((await agent.get("/api/admin/audit")).status).toBe(200);
    expect((await agent.get("/api/admin/payment-ledger")).status).toBe(403);
    const me = (await agent.get("/api/auth/me")).body.user;
    expect(me.roles).toEqual(["MANAGEMENT", "ADMISSIONS"]);
    expect(me.homePath).toBe("/management");
    expect(me.portals.map((p: { path: string }) => p.path)).toEqual(["/management", "/admissions"]);
  });
});

describe("the student list", () => {
  it("finance sees contact details and money; tutors don't; management can't open it", async () => {
    const fin = await staff("roster-fin", "FINANCE");
    const tutor = await staff("roster-tutor", "INSTRUCTOR");
    const mgmt = await staff("roster-mgmt", "MANAGEMENT");
    expect((await fin.agent.get("/api/admin/roster")).status).toBe(200);
    const tutorRoster = (await tutor.agent.get("/api/admin/roster")).body.roster as { email: string; amountPaid: number }[];
    expect(tutorRoster.every((s) => s.email === "" && s.amountPaid === 0)).toBe(true);
    expect((await mgmt.agent.get("/api/admin/roster")).status).toBe(403);
  });

  it("office roles are not teaching staff: finance cannot grade or see unreleased lessons", async () => {
    const fin = await staff("grade-fin", "FINANCE");
    expect((await fin.agent.post("/api/lms/submissions/nope/grade", { score: 90 })).status).toBe(403);
    const catalog = (await fin.agent.get("/api/lms/catalog")).body;
    const lessons = (catalog.courses ?? catalog).flatMap((c: { modules?: { lessons: { videoUrl?: string | null; isFreePreview?: boolean }[] }[] }) => (c.modules ?? []).flatMap((m) => m.lessons));
    expect(lessons.filter((l: { videoUrl?: string | null; isFreePreview?: boolean }) => !l.isFreePreview && l.videoUrl).length).toBe(0);
  });

  it("office-only role combinations cannot manage teaching attendance or access lesson videos", async () => {
    const officeStaff = [
      await staff("attendance-finance-admissions", "FINANCE", ["ADMISSIONS"]),
      await staff("attendance-admissions", "ADMISSIONS"),
      await staff("attendance-management", "MANAGEMENT")
    ];

    for (const { agent } of officeStaff) {
      const attendance = await Promise.all([
        agent.get("/api/attendance/sessions"),
        agent.patch("/api/attendance/sessions/nope", {}),
        agent.post("/api/attendance/sessions", {}),
        agent.get("/api/attendance/sessions/nope/roster"),
        agent.post("/api/attendance/sessions/nope/mark", {})
      ]);
      expect(attendance.map((response) => response.status)).toEqual(Array(5).fill(403));

      const catalog = (await agent.get("/api/lms/catalog")).body;
      const lessons = (catalog.courses ?? catalog).flatMap(
        (course: { modules?: { lessons: { videoUrl?: string | null; isFreePreview?: boolean }[] }[] }) =>
          (course.modules ?? []).flatMap((module) => module.lessons)
      );
      expect(lessons.filter((lesson: { videoUrl?: string | null; isFreePreview?: boolean }) =>
        !lesson.isFreePreview && lesson.videoUrl
      )).toHaveLength(0);
    }
  });

  it.fails("office roles cannot use the student live-attendance endpoint to see meeting links", async () => {
    const officeStaff = [
      await staff("live-finance", "FINANCE"),
      await staff("live-admissions", "ADMISSIONS"),
      await staff("live-management", "MANAGEMENT")
    ];
    const liveSession = await prisma.liveSession.create({
      data: {
        courseId: "web-dev",
        title: "Roles review attendance gate",
        scheduledAt: new Date(),
        meetingUrl: "https://meet.example.com/private-roles-review"
      }
    });

    try {
      for (const { agent, userId } of officeStaff) {
        await prisma.enrollment.create({
          data: {
            userId,
            courseId: "web-dev",
            status: "ACTIVE",
            paymentStatus: "PAID_FULL",
            amountPaid: 79000,
            totalDue: 79000
          }
        });
        const response = await agent.get("/api/attendance/live");
        expect({
          status: response.status,
          exposesMeetingLink: JSON.stringify(response.body).includes("private-roles-review")
        }).toEqual({ status: 403, exposesMeetingLink: false });
      }
    } finally {
      await prisma.liveSession.delete({ where: { id: liveSession.id } });
    }
  });

  it.fails("office roles cannot write progress, quiz attempts or submissions without enrollment", async () => {
    const finance = await staff("office-learning-write", "FINANCE");
    const quiz = await prisma.quiz.findFirstOrThrow({ where: { courseId: "web-dev" } });
    const progress = await finance.agent.post("/api/lms/progress", { lessonId: "les-1" });
    const attempt = await finance.agent.post("/api/lms/quiz-attempts", { quizId: quiz.id, answers: {} });
    const submission = await finance.agent.post("/api/lms/submissions", {
      assignmentId: "assign-web-dev",
      githubUrl: "https://github.com/vitest/office-role"
    });

    expect([progress.status, attempt.status, submission.status]).toEqual([403, 403, 403]);
  });
});

describe("changing roles", () => {
  it("admins set main and extra roles; it's audited and takes effect at once", async () => {
    const { agent: admin } = await createTestAdmin("roles-admin");
    const target = await staff("roles-target", "FINANCE");
    const r = await admin.post(`/api/admin/staff/${target.userId}/role`, { role: "FINANCE", extraRoles: ["ADMISSIONS"] });
    expect(r.body).toMatchObject({ ok: true, roles: ["FINANCE", "ADMISSIONS"] });
    const ev = await prisma.auditEvent.findFirst({ where: { action: "staff.roles_changed", targetId: target.userId } });
    expect(ev?.summary).toContain("Finance → Finance + Admissions");
    // The role change ended their session.
    expect((await target.agent.get("/api/admin/payment-ledger")).status).toBe(403);

    expect((await admin.post(`/api/admin/staff/${target.userId}/role`, { role: "FINANCE", extraRoles: ["ADMIN"] })).status).toBe(400);
    const staffList = (await admin.get("/api/admin/staff")).body.staff as { id: string; roleLabels: string[] }[];
    expect(staffList.find((s) => s.id === target.userId)?.roleLabels).toEqual(["Finance", "Admissions"]);
  });

  it("removing a role in the database stops access on the next request", async () => {
    const fin = await staff("roles-db", "FINANCE");
    expect((await fin.agent.get("/api/admin/payment-ledger")).status).toBe(200);
    await prisma.user.update({ where: { id: fin.userId }, data: { role: "STUDENT" } }); // tokenVersion unchanged on purpose
    expect((await fin.agent.get("/api/admin/payment-ledger")).status).toBe(403);
  });

  it("an invite for a second role adds it to existing staff; an admin invite makes them admin", async () => {
    const { userId: adminId } = await createTestAdmin("invite-admin");
    const fin = await staff("invite-fin", "FINANCE");
    const { rawToken } = await createStaffInvite(fin.email, "ADMISSIONS", adminId);
    expect((await request(app).post(`/api/staff-invites/${rawToken}/accept`).send({ password: TEST_PASSWORD })).status).toBe(200);
    expect(await prisma.user.findUnique({ where: { id: fin.userId }, select: { role: true, extraRoles: true } })).toEqual({ role: "FINANCE", extraRoles: ["ADMISSIONS"] });

    const second = await createStaffInvite(fin.email, "ADMIN", adminId);
    await request(app).post(`/api/staff-invites/${second.rawToken}/accept`).send({ password: TEST_PASSWORD });
    expect(await prisma.user.findUnique({ where: { id: fin.userId }, select: { role: true, extraRoles: true } })).toEqual({ role: "ADMIN", extraRoles: ["FINANCE", "ADMISSIONS"] });
  });

  it.fails("an invite role change invalidates existing sessions and is audited", async () => {
    const { userId: adminId } = await createTestAdmin("invite-role-audit-admin");
    const finance = await staff("invite-role-audit-target", "FINANCE");
    const { rawToken } = await createStaffInvite(finance.email, "ADMISSIONS", adminId);
    const accepted = await request(app)
      .post(`/api/staff-invites/${rawToken}/accept`)
      .send({ password: TEST_PASSWORD });
    expect(accepted.status).toBe(200);

    const [existingSession, auditEvent] = await Promise.all([
      finance.agent.get("/api/auth/me"),
      prisma.auditEvent.findFirst({
        where: { action: "staff.roles_changed", targetId: finance.userId }
      })
    ]);
    expect({ user: existingSession.body.user, audited: Boolean(auditEvent) }).toEqual({
      user: null,
      audited: true
    });
  });

  it.fails("revoking a staff invite is audited without storing its raw token", async () => {
    const { agent: admin } = await createTestAdmin("invite-revoke-audit-admin");
    const invited = await admin.post("/api/admin/staff/invites", {
      email: testEmail("invite-revoke-audit-target"),
      role: "FINANCE"
    });
    expect(invited.status).toBe(201);
    const rawToken = new URL(invited.body.inviteUrl).pathname.split("/").pop()!;
    const revoked = await admin.post(`/api/admin/staff/invites/${invited.body.invite.id}/revoke`);
    expect(revoked.status).toBe(200);

    const event = await prisma.auditEvent.findFirst({
      where: { action: "staff.invite_revoked", targetId: invited.body.invite.id }
    });
    expect(JSON.stringify(event)).not.toContain(rawToken);
    expect(event).not.toBeNull();
  });

  it("money actions are written to the audit log", async () => {
    const { agent: admin } = await createTestAdmin("audit-admin");
    const student = await prisma.user.create({ data: { name: "Vitest audit student", email: testEmail("audit-student"), passwordHash: "x" } });
    const enr = await prisma.enrollment.create({ data: { userId: student.id, courseId: "web-dev", totalDue: 79000 } });
    expect((await admin.post(`/api/admin/enrollments/${enr.id}/payment`, { status: "PAID_FULL", amountPaid: 79000 })).status).toBe(200);
    const log = (await admin.get(`/api/admin/audit?targetType=enrollment&targetId=${enr.id}`)).body.events;
    expect(log[0]).toMatchObject({ action: "payment.recorded", actorName: "Vitest audit-admin" });
  });
});
