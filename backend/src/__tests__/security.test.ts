import crypto from "crypto";
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { verifyWebhookSignature } from "@/lib/paystack";

const TEST_SECRET = "sk_test_vitest_only_not_a_real_key";
const sign = (body: string) => crypto.createHmac("sha512", TEST_SECRET).update(body).digest("hex");

describe("Paystack webhook signature", () => {
  beforeAll(() => {
    process.env.PAYSTACK_SECRET_KEY = TEST_SECRET;
  });

  const body = JSON.stringify({ event: "charge.success", data: { reference: "ref-vitest" } });

  it("accepts the exact signature Paystack would send", () => {
    expect(verifyWebhookSignature(Buffer.from(body), sign(body))).toBe(true);
  });

  it("rejects a missing, truncated, wrong-length or tampered signature", () => {
    const good = sign(body);
    expect(verifyWebhookSignature(Buffer.from(body), undefined)).toBe(false);
    expect(verifyWebhookSignature(Buffer.from(body), "")).toBe(false);
    expect(verifyWebhookSignature(Buffer.from(body), good.slice(0, 64))).toBe(false);
    expect(verifyWebhookSignature(Buffer.from(body), good + "00")).toBe(false);
    const flipped = (good[0] === "a" ? "b" : "a") + good.slice(1);
    expect(verifyWebhookSignature(Buffer.from(body), flipped)).toBe(false);
  });

  it("rejects a body that was changed after signing", () => {
    const tampered = body.replace("ref-vitest", "ref-attacker");
    expect(verifyWebhookSignature(Buffer.from(tampered), sign(body))).toBe(false);
  });

  it("returns 401 from the webhook endpoint for a forged signature", async () => {
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("x-paystack-signature", "0".repeat(128))
      .send(body);
    expect(res.status).toBe(401);
  });
});

describe("API security headers", () => {
  it("sends baseline security headers and hides X-Powered-By", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(res.headers["referrer-policy"]).toBe("no-referrer");
  });
});
