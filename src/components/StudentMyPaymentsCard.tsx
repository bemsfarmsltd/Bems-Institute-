"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { apiFetch } from "@/lib/api-client";
import { formatLagosDate } from "@/lib/lagos-time";
import type {
  InstallmentPartStatus,
  MyPaymentEnrollment,
  MyPaymentInstallment
} from "@/types/lms";
import { CreditCard, FileText, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";

function partBadgeClass(status: InstallmentPartStatus): string {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "OVERDUE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "DUE_SOON":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "CANCELLED":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-[#F7EDF9] text-[#AE54C6] border-[#E5C8ED]";
  }
}

function nextPayablePart(installments: MyPaymentInstallment[]): MyPaymentInstallment | undefined {
  return [...installments]
    .sort((a, b) => a.seq - b.seq)
    .find((p) => !p.paid && p.outstanding > 0 && p.status !== "CANCELLED");
}

export function StudentMyPaymentsCard({
  accentHex,
  onPaymentComplete
}: {
  accentHex?: string;
  onPaymentComplete?: () => Promise<void> | void;
}) {
  const [enrollments, setEnrollments] = useState<MyPaymentEnrollment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [payingCourseId, setPayingCourseId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadMyPayments = useCallback(async () => {
    try {
      const res = await apiFetch("/api/finance/my-payments");
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.enrollments)) {
        setEnrollments(data.enrollments);
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadMyPayments();
  }, [loadMyPayments]);

  const relevant = enrollments.filter(
    (e) => e.plan === "installment" || e.balance > 0
  );

  if (!loaded || relevant.length === 0) {
    return null;
  }

  const handlePayNext = async (enr: MyPaymentEnrollment) => {
    setMessage(null);
    setPayingCourseId(enr.course.id);
    try {
      const initRes = await apiFetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: enr.course.id,
          paymentPlan: "installment",
          payWhat: "next"
        })
      });
      const initData = await initRes.json().catch(() => ({}));
      if (!initRes.ok) {
        setMessage({
          type: "err",
          text: initData?.error || "Could not start payment. Please try again."
        });
        setPayingCourseId(null);
        return;
      }

      if (!window.PaystackPop) {
        setMessage({
          type: "err",
          text: "Payment system is still loading — please try again in a moment."
        });
        setPayingCourseId(null);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: initData.publicKey,
        email: initData.email,
        amount: initData.amountKobo,
        ref: initData.reference,
        currency: "NGN",
        onClose: () => setPayingCourseId(null),
        callback: (response) => {
          void (async () => {
            try {
              const verRes = await apiFetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: response.reference })
              });
              const verData = await verRes.json().catch(() => ({}));
              if (!verRes.ok) {
                setMessage({
                  type: "err",
                  text: verData?.error || "Payment could not be verified yet."
                });
              } else {
                setMessage({
                  type: "ok",
                  text: `Payment confirmed for ${enr.course.title}. Your receipt is ready below.`
                });
                await loadMyPayments();
                if (onPaymentComplete) await onPaymentComplete();
              }
            } finally {
              setPayingCourseId(null);
            }
          })();
        }
      });
      handler.openIframe();
    } catch {
      setMessage({
        type: "err",
        text: "Could not start payment. Please try again."
      });
      setPayingCourseId(null);
    }
  };

  return (
    <section
      data-reveal
      className="bg-white rounded-2xl border border-[#F1E2F5] p-5 sm:p-6 shadow-xs space-y-5"
    >
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: accentHex || "#AE54C6" }}
          >
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#303654]">My payments</h2>
            <p className="text-xs text-[#645F80]">
              Instalment schedule, remaining balance, and downloadable receipts.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            message.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-5">
        {relevant.map((enr) => {
          const nextPart = nextPayablePart(enr.installments);
          const nextAmount = nextPart ? nextPart.outstanding : enr.balance;

          return (
            <div
              key={enr.enrollmentId}
              className="rounded-2xl border border-[#F1E2F5] bg-[#FAF8FF] p-4 sm:p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#303654]">
                    {enr.course.title}
                  </h3>
                  <div className="text-xs text-[#645F80] mt-0.5">
                    Paid{" "}
                    <span className="font-bold text-[#303654]">
                      ₦{enr.amountPaid.toLocaleString()}
                    </span>{" "}
                    of ₦{enr.totalDue.toLocaleString()} · Balance:{" "}
                    <span className="font-extrabold text-[#303654]">
                      ₦{enr.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {enr.balance > 0 && nextAmount > 0 && (
                  <button
                    type="button"
                    disabled={payingCourseId === enr.course.id}
                    onClick={() => void handlePayNext(enr)}
                    className="m-press inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
                    style={{ backgroundColor: accentHex || "#AE54C6" }}
                  >
                    <CreditCard className="w-4 h-4" />
                    {payingCourseId === enr.course.id
                      ? "Opening Paystack…"
                      : `Pay next instalment (₦${nextAmount.toLocaleString()})`}
                  </button>
                )}
              </div>

              {enr.installments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {enr.installments.map((part) => (
                    <div
                      key={part.id}
                      className="rounded-xl bg-white border border-[#F1E2F5] p-3 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-[#303654]">
                          Part {part.seq} of {enr.installments.length}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${partBadgeClass(
                            part.status
                          )}`}
                        >
                          {part.status.replace("_", " ")}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#303654]">
                          ₦{part.amount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-[#645F80]">
                          Due {formatLagosDate(part.dueDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {enr.payments.length > 0 && (
                <div className="pt-2 border-t border-[#E5C8ED]/70 space-y-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#645F80]">
                    Receipts
                  </div>
                  <div className="space-y-1.5">
                    {enr.payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white rounded-xl border border-[#F1E2F5] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-[#303654]">
                            ₦{p.amount.toLocaleString()}
                          </span>{" "}
                          <span className="text-[#645F80]">
                            · {p.method} · {formatLagosDate(p.paidAt)}
                          </span>
                        </div>
                        <Link
                          href={`/receipts/${encodeURIComponent(p.id)}`}
                          className="m-press inline-flex items-center gap-1 font-bold text-[#AE54C6] hover:underline shrink-0"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {p.receiptNumber || (p.kind === "REFUND" ? "Refund note" : "Receipt")}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
