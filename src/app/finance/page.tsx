"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PortalGuard } from "@/components/PortalGuard";
import { FinanceInstallmentsTab } from "@/components/finance/FinanceInstallmentsTab";
import { FinanceDailyCheckTab } from "@/components/finance/FinanceDailyCheckTab";
import { API_BASE_URL, apiFetch } from "@/lib/api-client";
import { CountUp } from "@/components/CountUp";
import type { AnalyticsSummary } from "@/types/lms";
import {
  CreditCard,
  DollarSign,
  Download,
  FileText,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface LedgerItem {
  id: string;
  transactionId?: string;
  receiptNumber?: string | null;
  hasReceipt?: boolean;
  reference: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  paymentPlan: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED" | "REFUNDED";
  channel: string;
  paidAt: string | null;
  createdAt: string;
}

interface RosterStudent {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  paymentPlan: string;
  paymentStatus: string;
  amountPaid: number;
  totalDue: number;
  status: string;
}

type FinanceTab = "ledger" | "installments" | "daily" | "balances" | "revenue";

function FinancePortalContent() {
  const [tab, setTab] = useState<FinanceTab>("ledger");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [anRes, ledRes, rosRes] = await Promise.all([
        apiFetch("/api/admin/analytics"),
        apiFetch("/api/admin/payment-ledger"),
        apiFetch("/api/admin/roster")
      ]);
      if (anRes.ok) {
        const d = await anRes.json();
        setAnalytics(d.analytics || d);
      }
      if (ledRes.ok) {
        const d = await ledRes.json();
        setLedger(
          Array.isArray(d.transactions)
            ? d.transactions
            : Array.isArray(d.entries)
              ? d.entries
              : Array.isArray(d.ledger)
                ? d.ledger
                : []
        );
      }
      if (rosRes.ok) {
        const d = await rosRes.json();
        // GET /admin/roster: { roster: [{ id, name, email, courseTitle, paymentPlan, paymentStatus, amountPaid, totalDue, enrollmentStatus, ... }] }
        const rows: Array<{ id: string; name?: string; email?: string; courseTitle?: string; paymentPlan?: string; paymentStatus?: string; amountPaid?: number; totalDue?: number; enrollmentStatus?: string }> =
          Array.isArray(d.roster) ? d.roster : [];
        setRoster(
          rows.map((e) => ({
            id: e.id,
            studentName: e.name ?? "",
            studentEmail: e.email ?? "",
            courseTitle: e.courseTitle ?? "",
            paymentPlan: e.paymentPlan ?? "",
            paymentStatus: e.paymentStatus ?? "",
            amountPaid: e.amountPaid ?? 0,
            totalDue: e.totalDue ?? 0,
            status: e.enrollmentStatus ?? ""
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFinanceData();
  }, [loadFinanceData]);

  const handleRecordPayment = async (student: RosterStudent) => {
    const remaining = Math.max(0, student.totalDue - student.amountPaid);
    setBusyId(student.id);
    setNotice(null);
    try {
      const res = await apiFetch(`/api/admin/enrollments/${encodeURIComponent(student.id)}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: remaining > 0 ? "PAID_FULL" : student.paymentStatus,
          amountPaid: student.totalDue
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data?.error || "Could not record payment.");
      } else {
        setNotice(`Recorded payment for ${student.studentName}.`);
        await loadFinanceData();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleRefund = async (student: RosterStudent, excessOnly: boolean) => {
    setBusyId(student.id);
    setNotice(null);
    try {
      const path = excessOnly
        ? `/api/admin/enrollments/${encodeURIComponent(student.id)}/refund-excess`
        : `/api/admin/enrollments/${encodeURIComponent(student.id)}/refund`;
      const res = await apiFetch(path, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data?.error || "Could not process refund.");
      } else {
        setNotice(
          excessOnly
            ? `Refunded excess ₦${Number(data.refunded || 0).toLocaleString()} for ${student.studentName}.`
            : `Refunded enrollment for ${student.studentName}.`
        );
        await loadFinanceData();
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#AE54C6]">
              Finance Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#303654]">
              Tuition Ledger &amp; Revenue
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`${API_BASE_URL}/api/admin/payment-ledger/export`}
              className="m-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#303654] hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" /> Export Ledger CSV
            </a>
            <button
              type="button"
              onClick={() => void loadFinanceData()}
              className="m-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#AE54C6] text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3.5 rounded-xl bg-white border border-[#E5C8ED] text-xs font-bold text-[#303654] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#AE54C6] shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5">
              <div className="text-xs font-bold text-[#645F80]">Total Revenue</div>
              <div className="text-2xl font-black text-[#303654] mt-1">
                ₦<CountUp value={analytics.totalRevenue || 0} />
              </div>
            </div>
            <div className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5">
              <div className="text-xs font-bold text-[#645F80]">Outstanding Balance</div>
              <div className="text-2xl font-black text-amber-700 mt-1">
                ₦<CountUp value={analytics.outstandingBalance || 0} />
              </div>
            </div>
            <div className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5">
              <div className="text-xs font-bold text-[#645F80]">Refunded Total</div>
              <div className="text-2xl font-black text-rose-700 mt-1">
                ₦<CountUp value={analytics.refundedTotal || 0} />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {[
            { id: "ledger", label: `Payment Ledger (${ledger.length})` },
            { id: "installments", label: "Instalments" },
            { id: "daily", label: "Daily check" },
            { id: "balances", label: `Student Balances & Refunds (${roster.length})` },
            { id: "revenue", label: "Monthly Revenue" }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as FinanceTab)}
              className={`m-press px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                tab === item.id
                  ? "bg-[#303654] text-white"
                  : "bg-white border border-[#F1E2F5] text-[#303654]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "installments" ? (
          <FinanceInstallmentsTab onNotice={setNotice} />
        ) : tab === "daily" ? (
          <FinanceDailyCheckTab onNotice={setNotice} onAfterRecheck={loadFinanceData} />
        ) : loading ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 text-sm text-[#645F80]">
            Loading finance records…
          </div>
        ) : tab === "ledger" ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-[#303654] text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">Student</th>
                    <th className="px-4 py-3 font-bold">Course</th>
                    <th className="px-4 py-3 font-bold">Amount</th>
                    <th className="px-4 py-3 font-bold">Channel</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Reference</th>
                    <th className="px-4 py-3 font-bold">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7EDF9]">
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-[#645F80]">
                        No ledger entries yet.
                      </td>
                    </tr>
                  ) : (
                    ledger.map((item) => {
                      const receiptHrefId = item.transactionId || item.id;
                      const showReceipt = Boolean(item.receiptNumber || item.hasReceipt);
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="font-bold text-[#303654]">{item.studentName}</div>
                            <div className="text-[11px] text-[#645F80]">{item.studentEmail}</div>
                          </td>
                          <td className="px-4 py-3 text-[#4A4568]">{item.courseTitle}</td>
                          <td className="px-4 py-3 font-bold text-[#303654]">
                            ₦{item.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-[#645F80]">{item.channel}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-[#F7EDF9] text-[#AE54C6] text-[10.5px] font-bold">
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-[#645F80]">
                            {item.reference}
                          </td>
                          <td className="px-4 py-3">
                            {showReceipt ? (
                              <Link
                                href={`/receipts/${encodeURIComponent(receiptHrefId)}`}
                                className="m-press inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7EDF9] text-[#AE54C6] hover:bg-[#E5C8ED] text-[11px] font-bold"
                              >
                                <FileText className="w-3 h-3" />
                                {item.receiptNumber || "Receipt"}
                              </Link>
                            ) : (
                              <span className="text-[11px] text-[#645F80]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === "balances" ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] divide-y divide-[#F7EDF9] shadow-xs">
            {roster.length === 0 ? (
              <div className="p-6 text-sm text-[#645F80]">No student enrollments found.</div>
            ) : (
              roster.map((st) => {
                const excess = st.amountPaid > st.totalDue;
                return (
                  <div
                    key={st.id}
                    className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-extrabold text-[#303654]">
                        {st.studentName}{" "}
                        <span className="text-xs font-bold text-[#AE54C6]">
                          · {st.courseTitle}
                        </span>
                      </div>
                      <div className="text-xs text-[#645F80] mt-0.5">
                        Paid ₦{st.amountPaid.toLocaleString()} of ₦{st.totalDue.toLocaleString()} ·{" "}
                        {st.paymentStatus}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {st.amountPaid < st.totalDue && st.paymentStatus !== "REFUNDED" && (
                        <button
                          type="button"
                          disabled={busyId === st.id}
                          onClick={() => void handleRecordPayment(st)}
                          className="m-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Record Full Payment
                        </button>
                      )}
                      {excess && (
                        <button
                          type="button"
                          disabled={busyId === st.id}
                          onClick={() => void handleRefund(st, true)}
                          className="m-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold cursor-pointer disabled:opacity-60"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Refund excess
                        </button>
                      )}
                      {st.amountPaid > 0 && st.paymentStatus !== "REFUNDED" && (
                        <button
                          type="button"
                          disabled={busyId === st.id}
                          onClick={() => void handleRefund(st, false)}
                          className="m-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-bold cursor-pointer disabled:opacity-60"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Refund
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[#303654] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#AE54C6]" /> Revenue by Month
            </h2>
            {!analytics?.revenueByMonth?.length ? (
              <p className="text-sm text-[#645F80]">No monthly revenue records yet.</p>
            ) : (
              <div className="space-y-2.5">
                {analytics.revenueByMonth.map((row) => (
                  <div key={row.month} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#303654]">{row.month}</span>
                    <span className="font-extrabold text-[#AE54C6]">
                      ₦{row.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function FinancePortalPage() {
  return (
    <PortalGuard requiredRole="FINANCE">
      <FinancePortalContent />
    </PortalGuard>
  );
}
