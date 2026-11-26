// Receipts and refund notes for the payment ledger.
//
// Every confirmed Paystack charge (reference bems_…) or staff-confirmed bank
// transfer (bank_…) gets a receipt; every refund row (refund_…,
// refund_excess_…) gets a refund note. A second-chance waiver (waiver_…) is
// not money received, so it has neither. Numbers are given the first time a
// receipt is shown or emailed, from a Postgres sequence, so they're unique
// and roughly in order without touching every place that writes the ledger.

import { prisma } from "@/lib/prisma";
import { frontendUrl } from "@/lib/email";

export type ReceiptKind = "PAYMENT" | "REFUND";

export function receiptKind(txn: { reference: string; status: string }): ReceiptKind | null {
  if (txn.status === "SUCCESS" && (txn.reference.startsWith("bems_") || txn.reference.startsWith("bank_"))) return "PAYMENT";
  if (txn.status === "REFUNDED" && txn.reference.startsWith("refund_")) return "REFUND";
  return null;
}

export function receiptUrl(transactionId: string): string {
  return frontendUrl(`/receipts/${transactionId}`);
}

const METHODS: Record<string, string> = {
  card: "Card (Paystack)",
  bank_transfer: "Bank transfer (Paystack)",
  ussd: "USSD (Paystack)",
  qr: "QR (Paystack)",
  mobile_money: "Mobile money (Paystack)",
  bank: "Bank transfer"
};

export function paymentMethod(txn: { reference: string; channel: string | null }): string {
  if (txn.reference.startsWith("refund_excess_")) return "Overpayment refund";
  if (txn.reference.startsWith("refund_")) return "Refund";
  if (txn.reference.startsWith("bank_")) return "Bank transfer";
  return (txn.channel && METHODS[txn.channel]) || (txn.channel ? `${txn.channel} (Paystack)` : "Paystack");
}

/** Gives the transaction a receipt number if it doesn't have one yet. Safe to call concurrently. */
export async function ensureReceiptNumber(transactionId: string): Promise<string | null> {
  const txn = await prisma.paymentTransaction.findUnique({ where: { id: transactionId }, select: { receiptNumber: true, reference: true, status: true, paidAt: true, createdAt: true } });
  if (!txn || !receiptKind(txn)) return null;
  if (txn.receiptNumber) return txn.receiptNumber;
  const [{ n }] = await prisma.$queryRaw<{ n: bigint }[]>`SELECT nextval('receipt_number_seq') AS n`;
  const year = (txn.paidAt ?? txn.createdAt).getUTCFullYear();
  const number = `BEMS-${year}-${String(n).padStart(6, "0")}`;
  // Only the first caller's number sticks; a racing caller re-reads it.
  await prisma.paymentTransaction.updateMany({ where: { id: transactionId, receiptNumber: null }, data: { receiptNumber: number } });
  return (await prisma.paymentTransaction.findUniqueOrThrow({ where: { id: transactionId }, select: { receiptNumber: true } })).receiptNumber;
}

export interface Receipt {
  transactionId: string;
  receiptNumber: string;
  kind: ReceiptKind;
  issuedAt: string;
  student: { name: string; email: string };
  course: { title: string };
  plan: string;
  amount: number;
  method: string;
  reference: string;
  totalDue: number;
  paidToDate: number;
  balance: number;
}

/** The receipt, or null if this transaction has none (waiver, failed or pending charge). */
export async function getReceipt(transactionId: string): Promise<(Receipt & { userId: string }) | null> {
  const txn = await prisma.paymentTransaction.findUnique({
    where: { id: transactionId },
    include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } }
  });
  if (!txn) return null;
  const kind = receiptKind(txn);
  if (!kind) return null;
  const receiptNumber = await ensureReceiptNumber(txn.id);
  if (!receiptNumber) return null;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: txn.userId, courseId: txn.courseId } },
    select: { totalDue: true }
  });
  // Paid to date as of this receipt: money in (payments and waivers) minus
  // refunds, up to and including this transaction.
  const issuedAt = txn.paidAt ?? txn.createdAt;
  const ledger = await prisma.paymentTransaction.findMany({
    where: { userId: txn.userId, courseId: txn.courseId, status: { in: ["SUCCESS", "REFUNDED"] } },
    select: { id: true, amount: true, status: true, paidAt: true, createdAt: true }
  });
  const paidToDate = ledger
    .filter((t) => t.id === txn.id || (t.paidAt ?? t.createdAt) <= issuedAt)
    .reduce((sum, t) => sum + (t.status === "REFUNDED" ? -t.amount : t.amount), 0);
  const totalDue = enrollment?.totalDue ?? 0;

  return {
    userId: txn.userId,
    transactionId: txn.id,
    receiptNumber,
    kind,
    issuedAt: issuedAt.toISOString(),
    student: { name: txn.user.name, email: txn.user.email },
    course: { title: txn.course.title },
    plan: txn.paymentPlan,
    amount: txn.amount,
    method: paymentMethod(txn),
    reference: txn.reference,
    totalDue,
    paidToDate: Math.max(paidToDate, 0),
    balance: Math.max(totalDue - Math.max(paidToDate, 0), 0)
  };
}
