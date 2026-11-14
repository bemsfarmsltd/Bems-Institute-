import { prisma } from "@/lib/prisma";
import { createNotification, notifyStaff } from "@/lib/notifications";
import { sendEmail, adminEmailAddresses, frontendUrl, naira } from "@/lib/email";
import { creditReferralIfEligible } from "@/lib/referrals";
import type { PaystackVerifyData } from "@/lib/paystack";

export type ConfirmResult =
  | { ok: true; alreadyProcessed?: true }
  | { ok: false; reason: "unknown_reference" | "not_successful" | "amount_mismatch" | "no_enrollment" };

class NoEnrollmentError extends Error {}

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

  // Paystack reports in kobo; the ledger stores whole naira. Compare in kobo:
  // rounding to naira first let a charge up to 50 kobo short through.
  if (data.amount !== txn.amount * 100) {
    await prisma.paymentTransaction.update({
      where: { reference },
      data: { status: "FAILED", gatewayResponse: "Amount mismatch — not credited.", rawPayload: data as object }
    });
    return { ok: false, reason: "amount_mismatch" };
  }
  const amountNaira = txn.amount;

  // Claim the reference and credit the enrollment in one transaction.
  // Verify (the student's browser) and the webhook routinely arrive together
  // for the same reference; checking "already SUCCESS?" and then writing let
  // both credit it. And two references for the same course (two checkout
  // tabs) raced on amountPaid, so one payment could be lost.
  let credit;
  try {
    credit = await prisma.$transaction(async (tx) => {
      // Only one caller can move this row off PENDING/FAILED; a concurrent
      // one waits on the row lock, then matches nothing.
      const claimed = await tx.paymentTransaction.updateMany({
        where: { reference, status: { not: "SUCCESS" } },
        data: {
          status: "SUCCESS",
          channel: data.channel ?? undefined,
          gatewayResponse: data.gateway_response ?? undefined,
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
          rawPayload: data as object
        }
      });
      if (claimed.count === 0) return null;

      // Lock the enrollment so concurrent payments on it apply one at a time.
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Enrollment" WHERE "userId" = ${txn.userId} AND "courseId" = ${txn.courseId} FOR UPDATE`;
      if (locked.length === 0) throw new NoEnrollmentError();
      const enrollment = await tx.enrollment.findUniqueOrThrow({ where: { id: locked[0].id } });

      // A stale checkout paid after the registration was refunded: the money
      // came in, but it mustn't re-open the registration. All of it is excess.
      if (enrollment.paymentStatus === "REFUNDED") {
        return {
          enrollment,
          wasFirstPayment: false,
          newAmountPaid: enrollment.amountPaid,
          overpaid: amountNaira,
          awaitingApproval: false
        };
      }

      const wasFirstPayment = enrollment.amountPaid === 0;
      // Money beyond what's owed (e.g. a second checkout tab paid too) is
      // received but not credited: amountPaid never exceeds totalDue, and
      // admins are told to refund the excess (POST /admin/enrollments/:id/refund-excess).
      const uncapped = enrollment.amountPaid + amountNaira;
      const newAmountPaid = Math.min(uncapped, Math.max(enrollment.totalDue, enrollment.amountPaid));
      const overpaid = uncapped - newAmountPaid;
      const newStatus = newAmountPaid >= enrollment.totalDue ? "PAID_FULL" : "PARTIAL";
      // A first payment doesn't unlock the course by itself: the registration
      // waits for an admin to confirm it (POST /admin/enrollments/:id/approve).
      // Later installments on an already-approved enrollment leave status alone.
      const awaitingApproval = wasFirstPayment && enrollment.status !== "COMPLETED";

      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus: newStatus,
          paymentReference: reference,
          ...(awaitingApproval ? { status: "PENDING" as const } : {})
        }
      });
      return { enrollment, wasFirstPayment, newAmountPaid, overpaid, awaitingApproval };
    });
  } catch (err) {
    if (!(err instanceof NoEnrollmentError)) throw err;
    await prisma.paymentTransaction.update({
      where: { reference },
      data: { status: "FAILED", gatewayResponse: "No matching enrollment.", rawPayload: data as object }
    });
    return { ok: false, reason: "no_enrollment" };
  }
  if (!credit) return { ok: true, alreadyProcessed: true };
  const { enrollment, wasFirstPayment, newAmountPaid, overpaid, awaitingApproval } = credit;

  if (wasFirstPayment) {
    await creditReferralIfEligible(txn.userId);
  }

  const [course, student] = await Promise.all([
    prisma.course.findUnique({ where: { id: txn.courseId }, select: { title: true, slug: true } }),
    prisma.user.findUnique({ where: { id: txn.userId }, select: { name: true, email: true, phone: true } })
  ]);
  const courseTitle = course?.title ?? "your course";
  const balance = Math.max(enrollment.totalDue - newAmountPaid, 0);
  const balanceLine = balance > 0 ? `Outstanding balance: ${naira(balance)}.` : "You're fully paid up.";

  await createNotification({
    userId: txn.userId,
    title: `Payment Received: ${courseTitle}`,
    message: awaitingApproval
      ? `We received ${naira(amountNaira)} via Paystack. ${balanceLine} Admissions will confirm your registration shortly — you'll be notified as soon as your classroom is unlocked.`
      : `We received ${naira(amountNaira)} via Paystack. ${balanceLine}`,
    category: "PAYMENT",
    linkUrl: "/dashboard"
  });

  if (student) {
    await sendEmail({
      to: student.email,
      subject: `Payment received — ${courseTitle}`,
      text: [
        `Hello ${student.name},`,
        `We've received your payment of ${naira(amountNaira)} for ${courseTitle}.\n\nReference: ${reference}\n${balanceLine}`,
        awaitingApproval
          ? "What happens next: our admissions team will confirm your registration. You'll get another email as soon as it's confirmed and your classroom and lesson videos are unlocked."
          : `Thank you — your payment has been added to your account.`,
        `Your dashboard: ${frontendUrl("/dashboard")}`,
        "BEMS Admissions"
      ].join("\n\n")
    });
  }

  if (awaitingApproval) {
    const who = student ? `${student.name} (${student.email}${student.phone ? `, ${student.phone}` : ""})` : "A student";
    await notifyStaff({
      title: `Registration awaiting confirmation: ${courseTitle}`,
      message: `${who} paid ${naira(amountNaira)} via Paystack. Confirm their registration to unlock the course.`,
      category: "PAYMENT",
      linkUrl: "/admin/students"
    });
    await sendEmail({
      to: await adminEmailAddresses(),
      subject: `New payment — confirm registration: ${student?.name ?? "student"} · ${courseTitle}`,
      text: [
        `${who} has paid for ${courseTitle}.`,
        `Amount: ${naira(amountNaira)} (${enrollment.paymentPlan === "installment" ? "installment deposit" : "full payment"})\nPaystack reference: ${reference}\n${balanceLine}`,
        `Their course stays locked until an admin confirms the registration:\n${frontendUrl("/admin/students")}`
      ].join("\n\n")
    });
  }

  if (overpaid > 0) {
    const who = student ? `${student.name} (${student.email})` : "A student";
    await notifyStaff({
      title: `Overpayment to refund: ${courseTitle}`,
      message: `${who} paid ${naira(overpaid)} more than they owe (reference ${reference}). Refund it in Paystack, then record it with "Refund excess".`,
      category: "PAYMENT",
      linkUrl: "/admin?tab=earnings"
    });
    await sendEmail({
      to: await adminEmailAddresses(),
      subject: `Overpayment to refund: ${student?.name ?? "student"} · ${courseTitle}`,
      text: [
        `${who} paid ${naira(overpaid)} more than the course balance, usually from paying in two checkout windows.`,
        `Paystack reference: ${reference}`,
        `Refund ${naira(overpaid)} from the Paystack dashboard, then record it in the admin console so the books match.`
      ].join("\n\n")
    });
  }

  return { ok: true };
}
