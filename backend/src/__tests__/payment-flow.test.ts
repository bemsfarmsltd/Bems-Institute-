import crypto from "crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@/lib/prisma";
import { app } from "@/app";
import { confirmPaymentTransaction } from "@/lib/payment-ledger";
import { cleanupTestData, createTestStudent } from "./helpers";

const TEST_SECRET = "sk_test_vitest_only_not_a_real_key";
const sign = (body: string) => crypto.createHmac("sha512", TEST_SECRET).update(body).digest("hex");

describe("Paystack payment flow edge cases", () => {
  beforeAll(() => {
    process.env.PAYSTACK_SECRET_KEY = TEST_SECRET;
  });

  afterAll(cleanupTestData);

  it.each([
    ["failed", "FAILED"],
    ["abandoned", "ABANDONED"]
  ] as const)("records a %s Paystack result without crediting the enrollment", async (status, ledgerStatus) => {
    const { agent, userId } = await createTestStudent(`payment-${status}`);
    const init = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });
    expect(init.status).toBe(200);

    const result = await confirmPaymentTransaction(init.body.reference, {
      status,
      amount: init.body.amountKobo,
      channel: "card",
      paid_at: null,
      gateway_response: `Paystack ${status}`
    });

    expect(result).toEqual({ ok: false, reason: "not_successful" });
    const [transaction, enrollment] = await Promise.all([
      prisma.paymentTransaction.findUniqueOrThrow({ where: { reference: init.body.reference } }),
      prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId, courseId: "web-dev" } } })
    ]);
    expect(transaction.status).toBe(ledgerStatus);
    expect(enrollment.amountPaid).toBe(0);
    expect(enrollment.paymentStatus).toBe("PENDING");
  });

  it("rejects a Paystack amount that does not match the checkout amount", async () => {
    const { agent, userId } = await createTestStudent("payment-amount-mismatch");
    const init = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });
    expect(init.status).toBe(200);

    const result = await confirmPaymentTransaction(init.body.reference, {
      status: "success",
      amount: init.body.amountKobo - 100,
      channel: "card",
      paid_at: null,
      gateway_response: "Approved"
    });

    expect(result).toEqual({ ok: false, reason: "amount_mismatch" });
    const [transaction, enrollment] = await Promise.all([
      prisma.paymentTransaction.findUniqueOrThrow({ where: { reference: init.body.reference } }),
      prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId, courseId: "web-dev" } } })
    ]);
    expect(transaction.status).toBe("FAILED");
    expect(enrollment.amountPaid).toBe(0);
    expect(enrollment.paymentStatus).toBe("PENDING");
  });

  it("processes duplicate success webhooks once", async () => {
    const { agent, userId } = await createTestStudent("payment-duplicate-webhook");
    const init = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "full" });
    expect(init.status).toBe(200);
    const body = JSON.stringify({
      event: "charge.success",
      data: {
        reference: init.body.reference,
        status: "success",
        amount: init.body.amountKobo,
        channel: "card",
        paid_at: new Date().toISOString(),
        gateway_response: "Approved"
      }
    });

    const deliverWebhook = () => request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("x-paystack-signature", sign(body))
      .send(body);
    const first = await deliverWebhook();
    const duplicate = await deliverWebhook();

    expect(first.status).toBe(200);
    expect(duplicate.status).toBe(200);
    const [transaction, enrollment] = await Promise.all([
      prisma.paymentTransaction.findUniqueOrThrow({ where: { reference: init.body.reference } }),
      prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId, courseId: "web-dev" } } })
    ]);
    expect(transaction.status).toBe("SUCCESS");
    expect(enrollment.amountPaid).toBe(init.body.amount);
  });

  it("applies an installment deposit followed by the remaining balance", async () => {
    const { agent, userId } = await createTestStudent("payment-installment-to-full");
    const deposit = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "installment" });
    expect(deposit.status).toBe(200);
    const firstPayment = await confirmPaymentTransaction(deposit.body.reference, {
      status: "success",
      amount: deposit.body.amountKobo,
      channel: "card",
      paid_at: new Date().toISOString(),
      gateway_response: "Approved"
    });
    expect(firstPayment.ok).toBe(true);

    const balance = await agent.post("/api/payments/init", { courseId: "web-dev", paymentPlan: "installment" });
    expect(balance.status).toBe(200);
    expect(balance.body.amount).toBeGreaterThan(0);
    const secondPayment = await confirmPaymentTransaction(balance.body.reference, {
      status: "success",
      amount: balance.body.amountKobo,
      channel: "card",
      paid_at: new Date().toISOString(),
      gateway_response: "Approved"
    });
    expect(secondPayment.ok).toBe(true);

    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId: "web-dev" } }
    });
    expect(enrollment.amountPaid).toBe(enrollment.totalDue);
    expect(enrollment.paymentStatus).toBe("PAID_FULL");
    const successfulCharges = await prisma.paymentTransaction.findMany({
      where: { userId, courseId: "web-dev", status: "SUCCESS" }
    });
    expect(successfulCharges).toHaveLength(2);
    expect(successfulCharges.reduce((sum, txn) => sum + txn.amount, 0)).toBe(enrollment.totalDue);
  });
});
