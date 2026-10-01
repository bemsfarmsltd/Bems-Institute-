import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { creditReferralIfEligible } from "@/lib/referrals";
import type { PaystackVerifyData } from "@/lib/paystack";

export type ConfirmResult =
  | { ok: true; alreadyProcessed?: true }
  | { ok: false; reason: "unknown_reference" | "not_successful" | "amount_mismatch" | "no_enrollment" };

// The single place that turns a Paystack-confirmed charge into real
// Enrollment state. Called from both POST /payments/verify (the client's
// own callback, for a fast UI response) and POST /payments/webhook (the
// source of truth per Paystack's own recommendation, since a client can
// close the tab before the callback fires). Both can run for the same
// reference — the status !== "SUCCESS" guard below makes a second call a
// no-op instead of double-crediting the amount or the referral bonus.
export async function confirmPaymentTransaction(
  reference: string,
  data: Pick<PaystackVerifyData, "status" | "amount" | "channel" | "paid_at" | "gateway_response">
): Promise<ConfirmResult> {
  const txn = await prisma.paymentTransaction.findUnique({ where: { reference } });
  if (!txn) return { ok: false, reason: "unknown_reference" };
  if (txn.status === "SUCCESS") return { ok: true, alreadyProcessed: true };

  if (data.status !== "success") {
    await prisma.paymentTransaction.update({
      where: { reference },
      data: {
        status: data.status === "abandoned" ? "ABANDONED" : "FAILED",
        gatewayResponse: data.gateway_response ?? undefined,
        rawPayload: data as object
      }
    });
    return { ok: false, reason: "not_successful" };
  }

  // Paystack reports in kobo; our ledger/Enrollment store whole Naira.
  const amountNaira = Math.round(data.amount / 100);
  if (amountNaira !== txn.amount) {
    await prisma.paymentTransaction.update({
      where: { reference },
      data: { status: "FAILED", gatewayResponse: "Amount mismatch — not credited.", rawPayload: data as object }
    });
    return { ok: false, reason: "amount_mismatch" };
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: txn.userId, courseId: txn.courseId } }
  });
  if (!enrollment) {
    await prisma.paymentTransaction.update({
      where: { reference },
      data: { status: "FAILED", gatewayResponse: "No matching enrollment.", rawPayload: data as object }
    });
    return { ok: false, reason: "no_enrollment" };
  }

  const wasFirstPayment = enrollment.amountPaid === 0;
  const newAmountPaid = enrollment.amountPaid + amountNaira;
  const newStatus = newAmountPaid >= enrollment.totalDue ? "PAID_FULL" : "PARTIAL";

  await prisma.$transaction([
    prisma.paymentTransaction.update({
      where: { reference },
      data: {
        status: "SUCCESS",
        channel: data.channel ?? undefined,
        gatewayResponse: data.gateway_response ?? undefined,
        paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        rawPayload: data as object
      }
    }),
    prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { amountPaid: newAmountPaid, paymentStatus: newStatus, paymentReference: reference }
    })
  ]);

  if (wasFirstPayment) {
    await creditReferralIfEligible(txn.userId);
  }

  const course = await prisma.course.findUnique({ where: { id: txn.courseId }, select: { title: true, slug: true } });
  await createNotification({
    userId: txn.userId,
    title: `Payment Confirmed: ${course?.title ?? "Your Course"}`,
    message: `We received ₦${amountNaira.toLocaleString()} via Paystack. ${
      newStatus === "PAID_FULL" ? "You're fully paid up." : "Your classroom access is unlocked."
    }`,
    category: "PAYMENT",
    linkUrl: course?.slug ? `/learn/${course.slug}` : "/dashboard"
  });

  return { ok: true };
}
