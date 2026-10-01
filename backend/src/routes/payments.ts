import { Router } from "express";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { verifyPaystackTransaction, verifyWebhookSignature } from "@/lib/paystack";
import { confirmPaymentTransaction } from "@/lib/payment-ledger";

const router = Router();

// Creates (or reuses) the Enrollment row and opens a new PaymentTransaction
// ledger entry for one Paystack charge, then hands the frontend everything
// it needs to open the Paystack Inline popup. No money has moved yet —
// that only happens once POST /verify or the webhook confirms it.
router.post("/init", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const body = req.body ?? {};
  const courseId = typeof body.courseId === "string" ? body.courseId : "";
  const paymentPlan = body.paymentPlan === "installment" ? "installment" : "full";
  const deliveryMode: "PHYSICAL_LAB" | "VIRTUAL_ZOOM" =
    body.deliveryMode === "VIRTUAL_ZOOM" ? "VIRTUAL_ZOOM" : "PHYSICAL_LAB";
  const source = typeof body.source === "string" && body.source.trim() ? body.source.trim() : "website";

  if (!courseId) {
    return res.status(400).json({ error: "courseId is required." });
  }

  const [course, user] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.user.findUnique({ where: { id: session.id }, select: { email: true } })
  ]);
  if (!course) {
    return res.status(404).json({ error: "Course not found." });
  }
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const totalDue = paymentPlan === "installment" ? course.priceParts : course.priceFull;
  const activeCohort = await prisma.cohort.findFirst({ orderBy: { createdAt: "desc" } });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: session.id, courseId } },
    update: { source, deliveryMode, paymentPlan, totalDue, ...(activeCohort ? { cohortId: activeCohort.id } : {}) },
    create: {
      userId: session.id,
      courseId,
      status: "ACTIVE",
      source,
      deliveryMode,
      paymentPlan,
      totalDue,
      amountPaid: 0,
      paymentStatus: "PENDING",
      ...(activeCohort ? { cohortId: activeCohort.id } : {})
    }
  });

  const remaining = Math.max(enrollment.totalDue - enrollment.amountPaid, 0);
  if (remaining <= 0) {
    return res.status(400).json({ error: "This course is already fully paid for." });
  }

  // On the installment plan, the first charge is just the deposit; once
  // that's paid, any further "init" call (e.g. paying off the balance) goes
  // after the full remaining amount.
  const amount =
    paymentPlan === "installment" && enrollment.amountPaid === 0 ? Math.min(course.deposit, remaining) : remaining;

  const reference = `bems_${crypto.randomUUID().replace(/-/g, "")}`;

  await prisma.paymentTransaction.create({
    data: { reference, userId: session.id, courseId, paymentPlan, amount, status: "PENDING" }
  });

  return res.json({
    reference,
    amount,
    amountKobo: amount * 100,
    email: user.email,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || ""
  });
});

// Called by the frontend right after Paystack's popup reports success —
// re-verifies against Paystack's own API rather than trusting the popup's
// callback payload, then applies the same confirm logic the webhook uses.
router.post("/verify", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const reference = typeof req.body?.reference === "string" ? req.body.reference : "";
  if (!reference) {
    return res.status(400).json({ error: "reference is required." });
  }

  const txn = await prisma.paymentTransaction.findUnique({ where: { reference } });
  if (!txn || txn.userId !== session.id) {
    return res.status(404).json({ error: "Payment reference not found." });
  }

  let verified;
  try {
    verified = await verifyPaystackTransaction(reference);
  } catch (err) {
    console.error("Paystack verify call failed:", err);
    return res.status(502).json({ error: "Could not reach Paystack to verify this payment." });
  }

  const result = await confirmPaymentTransaction(reference, verified);

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.id, courseId: txn.courseId } },
    select: { paymentStatus: true, amountPaid: true, totalDue: true }
  });

  return res.json({
    ok: result.ok,
    reason: result.ok ? undefined : result.reason,
    paymentStatus: enrollment?.paymentStatus ?? "PENDING",
    amountPaid: enrollment?.amountPaid ?? 0,
    totalDue: enrollment?.totalDue ?? 0
  });
});

// The student's own record of what they've paid — their half of the same
// ledger the admin payment-ledger view reads from.
router.get("/history", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const transactions = await prisma.paymentTransaction.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: { course: { select: { title: true, slug: true } } }
  });

  return res.json({
    transactions: transactions.map((t) => ({
      id: t.id,
      reference: t.reference,
      courseTitle: t.course.title,
      courseSlug: t.course.slug,
      paymentPlan: t.paymentPlan,
      amount: t.amount,
      status: t.status,
      channel: t.channel,
      paidAt: t.paidAt ? t.paidAt.toISOString() : null,
      createdAt: t.createdAt.toISOString()
    }))
  });
});

// Paystack's server-to-server notification — the actual source of truth,
// since a student closing the tab right after paying would otherwise never
// trigger POST /verify. Express's json() middleware (see index.ts) stashes
// the raw request bytes on req.rawBody specifically so the HMAC signature
// below can be checked against the exact bytes Paystack signed.
router.post("/webhook", async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

  if (!rawBody || !verifyWebhookSignature(rawBody, typeof signature === "string" ? signature : undefined)) {
    return res.status(401).json({ error: "Invalid signature." });
  }

  const event = req.body;
  if (event?.event === "charge.success" && event.data?.reference) {
    await confirmPaymentTransaction(event.data.reference, event.data).catch((err) => {
      console.error("Webhook payment confirmation failed:", err);
    });
  }

  // Paystack retries on anything but a 2xx — always acknowledge receipt
  // even for events we don't act on.
  return res.status(200).json({ received: true });
});

export default router;
