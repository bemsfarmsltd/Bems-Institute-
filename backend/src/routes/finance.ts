import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { getReceipt, receiptKind, paymentMethod, ensureReceiptNumber } from "@/lib/receipts";
import { ensureSchedules, viewSchedule, listInstallments, changeDueDate, parseDueDate } from "@/lib/installments";
import { reconcileDay, isIsoDate } from "@/lib/reconcile";
import { verifyPaystackTransaction, paystackConfigured } from "@/lib/paystack";
import { confirmPaymentTransaction } from "@/lib/payment-ledger";
import { audit } from "@/lib/audit";

// Finance: receipts, instalment plans and the daily Paystack check.
// See TASKS.md "Phase 5.2 Finance API".
const router = Router();
const DENIED = { error: "You don't have access to this." };

// A receipt or refund note: the student it belongs to, or finance staff.
router.get("/receipts/:id", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  const receipt = await getReceipt(req.params.id);
  if (!receipt) return res.status(404).json({ error: "No receipt for this payment." });
  if (receipt.userId !== session.id && !can(session, "payments.view")) return res.status(403).json(DENIED);
  const { userId: _userId, ...body } = receipt;
  return res.json({ receipt: body });
});

// The signed-in student's registrations: balance, instalment parts, payments with receipts.
router.get("/my-payments", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  await ensureSchedules({ userId: session.id });
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.id },
    select: {
      id: true, courseId: true, paymentPlan: true, totalDue: true, amountPaid: true, paymentStatus: true, status: true,
      installments: true, course: { select: { id: true, title: true, slug: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  const ledger = await prisma.paymentTransaction.findMany({
    where: { userId: session.id, status: { in: ["SUCCESS", "REFUNDED"] } },
    orderBy: { createdAt: "asc" }
  });
  const out = [];
  for (const e of enrollments) {
    const payments = [];
    for (const t of ledger.filter((t) => t.courseId === e.courseId)) {
      const kind = receiptKind(t);
      if (!kind) continue;
      payments.push({ id: t.id, kind, amount: t.amount, paidAt: (t.paidAt ?? t.createdAt).toISOString(), method: paymentMethod(t), receiptNumber: await ensureReceiptNumber(t.id) });
    }
    out.push({
      enrollmentId: e.id,
      course: e.course,
      plan: e.paymentPlan,
      totalDue: e.totalDue,
      amountPaid: e.amountPaid,
      balance: e.paymentStatus === "PAID_FULL" || e.paymentStatus === "REFUNDED" ? 0 : Math.max(e.totalDue - e.amountPaid, 0),
      paymentStatus: e.paymentStatus,
      installments: viewSchedule(e.installments, e).map(({ lastReminderAt: _l, daysOverdue: _d, ...p }) => p),
      payments
    });
  }
  return res.json({ enrollments: out });
});

router.get("/installments", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session || !can(session, "payments.view")) return res.status(403).json(DENIED);
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const courseId = typeof req.query.courseId === "string" && req.query.courseId ? req.query.courseId : undefined;
  return res.json(await listInstallments({ status, courseId }));
});

router.patch("/installments/:id", async (req, res) => {
  const session = await getSessionUser(req);
  // Finance work (Finance and Admin): view the books and record payments.
  if (!session || !can(session, "payments.view") || !can(session, "payments.record")) return res.status(403).json(DENIED);
  const dueDate = parseDueDate(req.body?.dueDate);
  if (!dueDate) return res.status(400).json({ error: "dueDate must be a date (YYYY-MM-DD)." });
  const updated = await changeDueDate(req.params.id, dueDate, session);
  if (!updated) return res.status(404).json({ error: "Instalment not found." });
  if ("error" in updated) return res.status(409).json({ error: updated.error });
  return res.json({ installment: { id: updated.id, seq: updated.seq, amount: updated.amount, dueDate: updated.dueDate.toISOString() } });
});

router.get("/reconciliation", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session || !can(session, "payments.view")) return res.status(403).json(DENIED);
  const date = req.query.date;
  if (date !== undefined && !isIsoDate(date)) return res.status(400).json({ error: "date must be YYYY-MM-DD." });
  try {
    return res.json(await reconcileDay(date as string | undefined));
  } catch (err) {
    console.error("Reconciliation failed:", err);
    return res.status(502).json({ error: "Could not reach Paystack. Try again in a minute." });
  }
});

// Paid on Paystack but not credited here: ask Paystack again and credit it if real.
router.post("/reconciliation/:reference/recheck", async (req, res) => {
  const session = await getSessionUser(req);
  // Finance work (Finance and Admin): view the books and record payments.
  if (!session || !can(session, "payments.view") || !can(session, "payments.record")) return res.status(403).json(DENIED);
  if (!paystackConfigured()) return res.status(503).json({ error: "Paystack is not configured." });
  const reference = req.params.reference;
  const txn = await prisma.paymentTransaction.findUnique({ where: { reference } });
  if (!txn) return res.status(404).json({ error: "That reference isn't in our ledger, so it wasn't started from this site." });
  let verified;
  try {
    verified = await verifyPaystackTransaction(reference);
  } catch (err) {
    console.error("Paystack verify call failed:", err);
    return res.status(502).json({ error: "Could not reach Paystack. Try again in a minute." });
  }
  const result = await confirmPaymentTransaction(reference, verified);
  await audit({
    actor: session, action: "payment.rechecked", targetType: "payment", targetId: txn.id,
    summary: `Rechecked Paystack payment ${reference}: ${result.ok ? (result.alreadyProcessed ? "already credited" : "credited") : result.reason}`,
    details: { reference, ok: result.ok }
  });
  return res.json({ result });
});

export default router;
