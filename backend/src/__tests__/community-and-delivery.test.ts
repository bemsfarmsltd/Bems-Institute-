import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { createTestStudent, createTestAdmin, cleanupTestData } from "./helpers";

const LINK = "https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrStUv";

afterAll(async () => {
  await prisma.siteSettings.update({ where: { id: "singleton" }, data: { whatsappCommunityUrl: "" } });
  await cleanupTestData();
});

async function bankEnroll(label: string, extra: Record<string, unknown> = {}) {
  const s = await createTestStudent(label);
  const res = await s.agent.post("/api/lms/enroll", { courseId: "web-dev", paymentMethod: "bank", bankReference: `TRF-${label}`, ...extra });
  expect(res.status).toBe(200);
  const row = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: s.userId, courseId: "web-dev" } } });
  return { ...s, enrollmentId: row.id };
}

describe("WhatsApp community link", () => {
  it("only accepts a real WhatsApp invite link, admin-only", async () => {
    const { agent: student } = await createTestStudent("community-student");
    expect((await student.patch("/api/admin/settings/general", { whatsappCommunityUrl: LINK })).status).toBe(403);
    const { agent: admin } = await createTestAdmin("community-admin");
    expect((await admin.patch("/api/admin/settings/general", { whatsappCommunityUrl: "https://evil.example/join" })).status).toBe(400);
    const ok = await admin.patch("/api/admin/settings/general", { whatsappCommunityUrl: LINK });
    expect(ok.status).toBe(200);
    expect(ok.body.general.whatsappCommunityUrl).toBe(LINK);
  });

  it("is sent once when the registration is confirmed, and only then shown", async () => {
    const { agent: admin } = await createTestAdmin("community-admin-2");
    await admin.patch("/api/admin/settings/general", { whatsappCommunityUrl: LINK });
    const { agent: student, userId, enrollmentId } = await bankEnroll("community-flow");

    // Registered, not paid: no link.
    expect((await student.get("/api/lms/me")).body.communityUrl).toBeNull();

    // For a bank transfer, the admin recording the payment is also the
    // confirmation (status leaves PENDING): the link goes out then.
    expect((await admin.post(`/api/admin/enrollments/${enrollmentId}/payment`, { status: "PAID_FULL", amountPaid: 79000 })).status).toBe(200);
    const row = await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } });
    expect(row.status).not.toBe("PENDING");
    expect(row.communityInviteSentAt).not.toBeNull();
    expect(await prisma.notification.count({ where: { userId, title: "Join the BEMS WhatsApp community" } })).toBe(1);
    expect((await student.get("/api/lms/me")).body.communityUrl).toBe(LINK);

    // Approving afterwards doesn't send it twice.
    await admin.post(`/api/admin/enrollments/${enrollmentId}/approve`);
    expect(await prisma.notification.count({ where: { userId, title: "Join the BEMS WhatsApp community" } })).toBe(1);
  });

  it("is sent when admissions approves a card-paid registration", async () => {
    const { agent: admin } = await createTestAdmin("community-admin-card");
    await admin.patch("/api/admin/settings/general", { whatsappCommunityUrl: LINK });
    const { userId } = await createTestStudent("community-card");
    // A Paystack-paid registration awaiting admissions (status PENDING).
    const e = await prisma.enrollment.create({
      data: { userId, courseId: "web-dev", status: "PENDING", paymentStatus: "PAID_FULL", paymentPlan: "full", amountPaid: 79000, totalDue: 79000 }
    });
    expect((await admin.post(`/api/admin/enrollments/${e.id}/approve`)).status).toBe(200);
    expect((await prisma.enrollment.findUniqueOrThrow({ where: { id: e.id } })).communityInviteSentAt).not.toBeNull();
    expect(await prisma.notification.count({ where: { userId, title: "Join the BEMS WhatsApp community" } })).toBe(1);
  });

  it("can be sent to students confirmed before the link was set", async () => {
    const { agent: admin } = await createTestAdmin("community-admin-3");
    await admin.patch("/api/admin/settings/general", { whatsappCommunityUrl: "" });
    const { enrollmentId } = await bankEnroll("community-backlog");
    await admin.post(`/api/admin/enrollments/${enrollmentId}/payment`, { status: "PAID_FULL", amountPaid: 79000 });
    await admin.post(`/api/admin/enrollments/${enrollmentId}/approve`);
    expect((await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } })).communityInviteSentAt).toBeNull();

    expect((await admin.post("/api/admin/settings/community/send-pending")).status).toBe(400);
    await admin.patch("/api/admin/settings/general", { whatsappCommunityUrl: LINK });
    const res = await admin.post("/api/admin/settings/community/send-pending");
    expect(res.status).toBe(200);
    expect(res.body.sent).toBeGreaterThanOrEqual(1);
    expect((await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } })).communityInviteSentAt).not.toBeNull();
  });
});

describe("WhatsApp community link for staff", () => {
  it("is shown to instructors and admins without an enrollment", async () => {
    const { agent: admin } = await createTestAdmin("community-staff-admin");
    await admin.patch("/api/admin/settings/general", { whatsappCommunityUrl: LINK });
    expect((await admin.get("/api/lms/me")).body.communityUrl).toBe(LINK);
    const { agent: browsing } = await createTestStudent("community-no-enrollment");
    expect((await browsing.get("/api/lms/me")).body.communityUrl).toBeNull();
  });
});

describe("virtual or physical class", () => {
  it("stores the student's choice and shows it back", async () => {
    const virtual = await bankEnroll("delivery-virtual", { deliveryMode: "VIRTUAL_ZOOM" });
    const physical = await bankEnroll("delivery-physical", { deliveryMode: "PHYSICAL_LAB" });
    expect((await prisma.enrollment.findUniqueOrThrow({ where: { id: virtual.enrollmentId } })).deliveryMode).toBe("VIRTUAL_ZOOM");
    expect((await prisma.enrollment.findUniqueOrThrow({ where: { id: physical.enrollmentId } })).deliveryMode).toBe("PHYSICAL_LAB");
    const me = await virtual.agent.get("/api/lms/me");
    expect(me.body.enrollments[0].deliveryMode).toBe("VIRTUAL_ZOOM");
  });
});
