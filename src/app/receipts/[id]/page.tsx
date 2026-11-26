"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { apiFetch } from "@/lib/api-client";
import { formatLagosDateTime } from "@/lib/lagos-time";
import type { FinanceReceipt } from "@/types/lms";
import { ArrowLeft, Download, Lock, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";

export default function ReceiptPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [receipt, setReceipt] = useState<FinanceReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setStatusCode(404);
      setErrorMsg("Receipt not found.");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await apiFetch(`/api/finance/receipts/${encodeURIComponent(id)}`);
        if (cancelled) return;
        setStatusCode(res.status);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErrorMsg(
            data?.error ||
              (res.status === 401
                ? "Please sign in to view this receipt."
                : res.status === 403
                  ? "You don't have access to this receipt."
                  : "No receipt found for this payment.")
          );
          setReceipt(null);
        } else {
          setReceipt(data.receipt || null);
        }
      } catch {
        if (!cancelled) {
          setErrorMsg("Could not load this receipt. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isRefund = receipt?.kind === "REFUND";
  const planLabel =
    receipt?.plan === "installment"
      ? "3-part instalment"
      : receipt?.plan === "full"
        ? "Full payment"
        : receipt?.plan || "Standard";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] print:bg-white">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }
          body {
            background: #ffffff !important;
          }
        }
      `}</style>

      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 print:p-0 print:max-w-none">
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 mb-5">
          <Link
            href="/dashboard"
            className="m-press inline-flex items-center gap-1.5 text-xs font-bold text-[#645F80] hover:text-[#303654]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          {receipt && (
            <button
              type="button"
              onClick={() => window.print()}
              className="m-press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#AE54C6] hover:bg-[#933EB0] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] p-8 text-center text-sm text-[#645F80]">
            Loading receipt…
          </div>
        ) : statusCode === 401 ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-[#303654]">Sign in required</h1>
            <p className="text-sm text-[#645F80] max-w-md mx-auto">
              {errorMsg || "Please sign in with your BEMS account to view or download this receipt."}
            </p>
            <Link
              href={`/login?redirect=${encodeURIComponent(`/receipts/${id}`)}`}
              className="m-press inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#AE54C6] text-white text-sm font-bold"
            >
              Sign in to view receipt
            </Link>
          </div>
        ) : !receipt ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-[#303654]">
              {statusCode === 403 ? "Access denied" : "Receipt unavailable"}
            </h1>
            <p className="text-sm text-[#645F80] max-w-md mx-auto">
              {errorMsg || "We couldn't find a receipt for this transaction."}
            </p>
          </div>
        ) : (
          <article className="bg-white rounded-2xl border border-[#F1E2F5] p-6 sm:p-10 shadow-xs print:border-0 print:rounded-none print:shadow-none print:p-0 space-y-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src="/images/bems-logo.jpg"
                    alt="BEMS Institute of Technology"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-[#303654]">
                    BEMS Institute of Technology
                  </div>
                  <div className="text-xs text-[#645F80]">
                    Umuahia, Abia State · admissions@bemsinstitute.ng
                  </div>
                </div>
              </div>

              <div className="sm:text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    isRefund
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {isRefund ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {isRefund ? "Refund note" : "Receipt"}
                </span>
                <div className="mt-2 font-mono text-sm font-extrabold text-[#303654]">
                  {receipt.receiptNumber}
                </div>
                <div className="text-xs text-[#645F80] mt-0.5">
                  {formatLagosDateTime(receipt.issuedAt)} (WAT)
                </div>
              </div>
            </header>

            {/* Student & Course */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-xl bg-[#FAF8FF] print:bg-slate-50 border border-[#F1E2F5] print:border-slate-200 p-4 space-y-1">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#645F80]">
                  {isRefund ? "Refunded To" : "Received From"}
                </div>
                <div className="text-sm font-black text-[#303654]">{receipt.student.name}</div>
                <div className="text-xs text-[#645F80] break-all">{receipt.student.email}</div>
              </div>

              <div className="rounded-xl bg-[#FAF8FF] print:bg-slate-50 border border-[#F1E2F5] print:border-slate-200 p-4 space-y-1">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#645F80]">
                  Programme &amp; Plan
                </div>
                <div className="text-sm font-black text-[#303654]">{receipt.course.title}</div>
                <div className="text-xs text-[#645F80]">Plan: {planLabel}</div>
              </div>
            </section>

            {/* Amount Highlight */}
            <section
              className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isRefund
                  ? "bg-rose-50/60 border-rose-200"
                  : "bg-[#F7EDF9]/60 border-[#E5C8ED]"
              }`}
            >
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#645F80]">
                  {isRefund ? "Amount Refunded" : "Amount Paid"}
                </div>
                <div className="text-xs text-[#645F80] mt-0.5">
                  Method: <span className="font-bold text-[#303654]">{receipt.method}</span>
                </div>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black ${
                  isRefund ? "text-rose-700" : "text-[#303654]"
                }`}
              >
                ₦{receipt.amount.toLocaleString()}
              </div>
            </section>

            {/* Details Table */}
            <section className="border border-slate-200 rounded-xl overflow-hidden">
              <dl className="divide-y divide-slate-200 text-xs sm:text-sm">
                <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#645F80] font-semibold">Payment reference</dt>
                  <dd className="font-mono font-bold text-[#303654] break-all">
                    {receipt.reference}
                  </dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <dt className="text-[#645F80] font-semibold">Total tuition</dt>
                  <dd className="font-bold text-[#303654]">
                    ₦{receipt.totalDue.toLocaleString()}
                  </dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <dt className="text-[#645F80] font-semibold">Paid to date</dt>
                  <dd className="font-bold text-emerald-700">
                    ₦{receipt.paidToDate.toLocaleString()}
                  </dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-3 bg-slate-50">
                  <dt className="text-[#303654] font-extrabold">Remaining balance</dt>
                  <dd className="font-black text-[#303654]">
                    ₦{receipt.balance.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </section>

            <footer className="pt-4 border-t border-slate-200 text-[11px] text-[#645F80] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Issued electronically by BEMS Institute of Technology.</span>
              <span className="font-mono">{receipt.receiptNumber}</span>
            </footer>
          </article>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
