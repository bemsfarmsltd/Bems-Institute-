import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { confirmPaymentTransaction } from "@/lib/payment-ledger";
import { CODE_PATTERN, normalizeTarget } from "@/lib/qr-campaigns";
import { createTestStudent, createTestAdmin, cleanupTestData } from "./helpers";

const campaignIds: string[] = [];
afterAll(async () => {
  const campaigns = await prisma.qrCampaign.findMany({ where: { id: { in: campaignIds } }, select: { code: true } });
  await prisma.qrScan.deleteMany({ where: { source: { in: campaigns.map((c) => `c-${c.code}`) } } });
  await prisma.qrCampaign.deleteMany({ where: { id: { in: campaignIds } } });
  await cleanupTestData();
});

describe("campaign QR codes", () => {
  it("gives every campaign its own random code and short link", async () => {
    const { agent: admin } = await createTestAdmin("qr-admin-create");
    const a = await admin.post("/api/admin/qr-campaigns", { label: "Church youth seminar", target: "/subscriptions?course=web-dev" });
    const b = await admin.post("/api/admin/qr-campaigns", { label: "NYSC CDS group", target: "/" });
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    campaignIds.push(a.body.campaign.id, b.body.campaign.id);

    expect(a.body.campaign.code).toMatch(CODE_PATTERN);
    expect(a.body.campaign.code).not.toBe(b.body.campaign.code);
    expect(a.body.campaign.shortUrl.endsWith(`/q/${a.body.campaign.code}`)).toBe(true);
    expect(a.body.campaign.source).toBe(`c-${a.body.campaign.code}`);

    const list = await admin.get("/api/admin/qr-campaigns");
    expect(list.body.campaigns.map((c: { id: string }) => c.id)).toEqual(
      expect.arrayContaining([a.body.campaign.id, b.body.campaign.id])
    );
  });

  it("refuses targets that would send scans somewhere unsafe", () => {
    const site = "https://bems-institute.vercel.app/";
    for (const bad of ["", "//evil.example", "/\\evil.example", "http://example.com", "javascript:alert(1)", "/q/abc", "https://u:p@example.com"]) {
      expect(normalizeTarget(bad, site).ok, bad).toBe(false);
    }
    expect(normalizeTarget("https://partner.example/page", site)).toEqual({ ok: true, target: "https://partner.example/page" });
    // A full link to this site is stored as a path, so it's tracked.
    expect(normalizeTarget("https://bems-institute.vercel.app/courses?x=1", site)).toEqual({ ok: true, target: "/courses?x=1" });
  });

  it("is admin-only", async () => {
    const { agent } = await createTestStudent("qr-student");
    expect((await agent.get("/api/admin/qr-campaigns")).status).toBe(403);
    expect((await agent.post("/api/admin/qr-campaigns", { label: "x", target: "/" })).status).toBe(403);
  });

  it("a scan is counted, tagged and sent to the target; a switched-off code stops working", async () => {
    const { agent: admin } = await createTestAdmin("qr-admin-scan");
    const created = await admin.post("/api/admin/qr-campaigns", {
      label: "Ambassador: Ada",
      target: "/subscriptions?course=web-dev"
    });
    const { id, code } = created.body.campaign;
    campaignIds.push(id);

    const scan = await request(app).get(`/api/qr/${code}`);
    expect(scan.status).toBe(200);
    const target = new URL(scan.body.target, "https://site.invalid");
    expect(target.pathname).toBe("/subscriptions");
    expect(target.searchParams.get("course")).toBe("web-dev");
    expect(target.searchParams.get("utm_source")).toBe(`c-${code}`);
    expect(target.searchParams.get("qr")).toBe("1");

    // Re-pointed after printing: the same code now goes somewhere else.
    await admin.patch(`/api/admin/qr-campaigns/${id}`, { target: "https://partner.example/event" });
    const external = await request(app).get(`/api/qr/${code}`);
    expect(external.body).toEqual({ target: "https://partner.example/event", external: true });

    const stats = (await admin.get("/api/admin/qr-campaigns")).body.campaigns.find((c: { id: string }) => c.id === id);
    expect(stats.scans).toBe(2);

    await admin.patch(`/api/admin/qr-campaigns/${id}`, { active: false });
    expect((await request(app).get(`/api/qr/${code}`)).status).toBe(404);
    expect((await request(app).get("/api/qr/not-a-code")).status).toBe(404);
  });

  it("credits registrations and payments to the campaign, by name on the dashboard", async () => {
    const { agent: admin } = await createTestAdmin("qr-admin-reg");
    const created = await admin.post("/api/admin/qr-campaigns", { label: "Vitest seminar", target: "/" });
    const { id, source } = created.body.campaign;
    campaignIds.push(id);
    await request(app).get(`/api/qr/${created.body.campaign.code}`);

    const { agent } = await createTestStudent("qr-registrant");
    const init = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full", source });
    await confirmPaymentTransaction(init.body.reference, {
      status: "success",
      amount: init.body.amountKobo,
      channel: "card",
      paid_at: new Date().toISOString(),
      gateway_response: "Approved"
    });

    const stats = (await admin.get("/api/admin/qr-campaigns")).body.campaigns.find((c: { id: string }) => c.id === id);
    expect(stats).toMatchObject({ scans: 1, registrations: 1, paidRegistrations: 1 });

    const analytics = (await admin.get("/api/admin/analytics")).body;
    const row = analytics.bannerChannelYield.find((r: { source: string }) => r.source === source);
    expect(row.location).toBe("Vitest seminar");
  });
});
