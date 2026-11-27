"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { formatLagosDateTime, todayLagosIsoDate } from "@/lib/lagos-time";
import type { ReconciliationResponse, ReconciliationRow } from "@/types/lms";
import {
  AlertTriangle,
  Calendar,
  Landmark,
  RefreshCw
} from "lucide-react";

function SectionRows({
  title,
  subtitle,
  rows,
  tone,
  actionLabel,
  busyRef,
  onAction
}: {
  title: string;
  subtitle: string;
  rows: ReconciliationRow[];
  tone: "green" | "amber" | "red";
  actionLabel?: string;
  busyRef?: string | null;
  onAction?: (row: ReconciliationRow) => void;
}) {
  const toneStyles =
    tone === "green"
      ? {
          border: "border-emerald-200",
          header: "bg-emerald-50 text-emerald-900",
          badge: "bg-emerald-100 text-emerald-800"
        }
      : tone === "amber"
        ? {
            border: "border-amber-200",
            header: "bg-amber-50 text-amber-900",
            badge: "bg-amber-100 text-amber-800"
          }
        : {
            border: "border-rose-200",
            header: "bg-rose-50 text-rose-900",
            badge: "bg-rose-100 text-rose-800"
          };

  return (
    <section className={`bg-white rounded-2xl border ${toneStyles.border} overflow-hidden shadow-xs`}>
      <div className={`px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 ${toneStyles.header}`}>
        <div>
          <h3 className="text-sm font-black">{title}</h3>
          <p className="text-xs opacity-80">{subtitle}</p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${toneStyles.badge}`}>
          {rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 sm:px-6 py-4 text-xs text-[#645F80]">None for this day.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <div
              key={`${row.reference}-${row.transactionId || "ext"}`}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="text-sm font-bold text-[#303654]">
                  {row.studentName || row.email || "Unknown student"}{" "}
                  {row.courseTitle && (
                    <span className="text-xs font-semibold text-[#645F80]">
                      · {row.courseTitle}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#645F80] font-mono break-all">
                  {row.reference}
                  {row.paidAt ? ` · ${formatLagosDateTime(row.paidAt)}` : ""}
                </div>
                {row.paystackAmount !== null && row.paystackAmount !== row.amount && (
                  <div className="text-xs font-bold text-rose-700">
                    Ledger: ₦{row.amount.toLocaleString()} · Paystack: ₦
                    {row.paystackAmount.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-black text-[#303654]">
                  ₦{row.amount.toLocaleString()}
                </span>
                {actionLabel && onAction && (
                  <button
                    type="button"
                    disabled={busyRef === row.reference}
                    onClick={() => onAction(row)}
                    className="m-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#AE54C6] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {busyRef === row.reference ? "Checking…" : actionLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function FinanceDailyCheckTab({
  onNotice,
  onAfterRecheck
}: {
  onNotice: (msg: string | null) => void;
  onAfterRecheck?: () => Promise<void> | void;
}) {
  const [date, setDate] = useState<string>(() => todayLagosIsoDate());
  const [data, setData] = useState<ReconciliationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyRef, setBusyRef] = useState<string | null>(null);

  const loadRecon = useCallback(async (isoDate: string) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/finance/reconciliation?date=${encodeURIComponent(isoDate)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) {
        onNotice(json?.error || "Could not load daily check.");
        return;
      }
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [onNotice]);

  useEffect(() => {
    void loadRecon(date);
  }, [date, loadRecon]);

  const handleRecheck = async (row: ReconciliationRow) => {
    setBusyRef(row.reference);
    onNotice(null);
    try {
      const res = await apiFetch(
        `/api/finance/reconciliation/${encodeURIComponent(row.reference)}/recheck`,
        { method: "POST" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        onNotice(json?.error || "Could not recheck Paystack payment.");
        return;
      }
      const result = json?.result;
      if (result?.ok) {
        onNotice(
          result.alreadyProcessed
            ? `Payment ${row.reference} was already credited.`
            : `Payment ${row.reference} verified and credited.`
        );
      } else {
        onNotice(result?.reason || `Paystack status: ${row.paystackStatus || "not confirmed"}.`);
      }
      await loadRecon(date);
      if (onAfterRecheck) await onAfterRecheck();
    } finally {
      setBusyRef(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#F1E2F5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-[#303654]">Daily Paystack &amp; Bank Check</h2>
          <p className="text-xs text-[#645F80]">
            Compares Paystack settlements against BEMS ledger entries for one Lagos day.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF8FF] border border-[#E5C8ED] text-xs font-bold text-[#303654] self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-[#AE54C6]" />
          <input
            type="date"
            aria-label="Daily check date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#303654] focus:outline-none"
          />
        </label>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 text-sm text-[#645F80]">
          Running daily check…
        </div>
      ) : data ? (
        <>
          {!data.paystackConfigured && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Paystack is not configured on this server, so only staff-confirmed bank transfers
                are shown for {data.date}.
              </span>
            </div>
          )}

          {/* 4 Totals */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl border border-[#F1E2F5] p-4">
              <div className="text-xs font-bold text-[#645F80]">Paystack Total</div>
              <div className="text-lg sm:text-xl font-black text-[#303654] mt-1">
                ₦{data.totals.paystack.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#F1E2F5] p-4">
              <div className="text-xs font-bold text-[#645F80]">Ledger (Paystack)</div>
              <div className="text-lg sm:text-xl font-black text-emerald-700 mt-1">
                ₦{data.totals.ledgerPaystack.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-amber-200 p-4">
              <div className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" /> Bank Transfers
              </div>
              <div className="text-lg sm:text-xl font-black text-[#303654] mt-1">
                ₦{data.totals.bank.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-rose-200 p-4">
              <div className="text-xs font-bold text-rose-700">Refunds</div>
              <div className="text-lg sm:text-xl font-black text-rose-700 mt-1">
                ₦{data.totals.refunds.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Red sections */}
          {data.paystackConfigured && (
            <>
              <SectionRows
                title="Paid on Paystack, not credited here"
                subtitle="Recheck with Paystack to credit confirmed payments."
                rows={data.paystackOnly}
                tone="red"
                actionLabel="Recheck"
                busyRef={busyRef}
                onAction={(row) => void handleRecheck(row)}
              />
              <SectionRows
                title="Credited in ledger, not confirmed on Paystack"
                subtitle="Warning for Finance to investigate."
                rows={data.ledgerOnly}
                tone="red"
              />
              <SectionRows
                title="Amount mismatches"
                subtitle="Paystack amount differs from ledger amount."
                rows={data.amountMismatch}
                tone="red"
              />
            </>
          )}

          {/* Amber: Bank transfers */}
          <SectionRows
            title="Staff-confirmed bank transfers"
            subtitle="Tick these off against the bank statement."
            rows={data.bankTransfers}
            tone="amber"
          />

          {/* Green: Matched */}
          {data.paystackConfigured && (
            <SectionRows
              title="Matched Paystack payments"
              subtitle="Paystack and BEMS ledger agree."
              rows={data.matched}
              tone="green"
            />
          )}
        </>
      ) : null}
    </div>
  );
}
