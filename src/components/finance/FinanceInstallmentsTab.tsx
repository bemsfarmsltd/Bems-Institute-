"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { formatLagosDate, formatLagosDateTime, toLagosInputDate } from "@/lib/lagos-time";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type {
  FinanceInstallmentRow,
  FinanceInstallmentsResponse,
  InstallmentPartStatus
} from "@/types/lms";
import { Calendar, Mail, MessageCircle, Save, AlertTriangle } from "lucide-react";

type StatusFilter = "overdue" | "due_soon" | "upcoming" | "all";

const FILTER_CHIPS: { id: StatusFilter; label: string }[] = [
  { id: "overdue", label: "Overdue" },
  { id: "due_soon", label: "Due soon" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" }
];

function statusChipClass(status: InstallmentPartStatus): string {
  switch (status) {
    case "OVERDUE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "DUE_SOON":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CANCELLED":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-[#F7EDF9] text-[#AE54C6] border-[#E5C8ED]";
  }
}

export function FinanceInstallmentsTab({
  onNotice
}: {
  onNotice: (msg: string | null) => void;
}) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [data, setData] = useState<FinanceInstallmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [draftDates, setDraftDates] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadInstallments = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/finance/installments?status=${encodeURIComponent(status)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) {
        onNotice(json?.error || "Could not load instalments.");
        return;
      }
      setData(json);
      const nextDrafts: Record<string, string> = {};
      for (const item of json.installments as FinanceInstallmentRow[]) {
        nextDrafts[item.id] = toLagosInputDate(item.dueDate);
      }
      setDraftDates(nextDrafts);
    } finally {
      setLoading(false);
    }
  }, [onNotice]);

  useEffect(() => {
    void loadInstallments(filter);
  }, [filter, loadInstallments]);

  const handleSaveDueDate = async (row: FinanceInstallmentRow) => {
    const dueDate = draftDates[row.id];
    if (!dueDate) return;
    setSavingId(row.id);
    onNotice(null);
    try {
      const res = await apiFetch(`/api/finance/installments/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        onNotice(json?.error || "Could not update due date.");
        return;
      }
      onNotice(
        `Updated part ${row.seq} due date for ${row.student.name} to ${dueDate}.`
      );
      await loadInstallments(filter);
    } finally {
      setSavingId(null);
    }
  };

  const totals = data?.totals;
  const rows = data?.installments || [];

  return (
    <div className="space-y-4">
      {/* Totals */}
      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-rose-200 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-700">Overdue</div>
              <div className="text-xl font-black text-[#303654] mt-0.5">
                ₦{totals.overdueAmount.toLocaleString()}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-extrabold">
              {totals.overdueCount} {totals.overdueCount === 1 ? "part" : "parts"}
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-amber-200 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-800">Due soon (next 3 days)</div>
              <div className="text-xl font-black text-[#303654] mt-0.5">
                ₦{totals.dueSoonAmount.toLocaleString()}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-extrabold">
              {totals.dueSoonCount} {totals.dueSoonCount === 1 ? "part" : "parts"}
            </span>
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setFilter(chip.id)}
            className={`m-press px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-colors ${
              filter === chip.id
                ? "bg-[#303654] text-white border-[#303654]"
                : "bg-white text-[#303654] border-[#F1E2F5] hover:bg-[#FAF8FF]"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 text-sm text-[#645F80]">
          Loading instalment schedules…
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 text-sm text-[#645F80]">
          No instalment parts match this filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F1E2F5] divide-y divide-[#F7EDF9] shadow-xs">
          {rows.map((row) => {
            const currentInput = draftDates[row.id] ?? toLagosInputDate(row.dueDate);
            const changed = currentInput !== toLagosInputDate(row.dueDate);
            const waText = `Hi ${row.student.name}, a quick reminder from BEMS Finance about part ${row.seq} of 3 for ${row.course.title} (₦${row.outstanding.toLocaleString()} due ${formatLagosDate(row.dueDate)}).`;
            const mailSubject = `BEMS Tuition Reminder — ${row.course.title} (Part ${row.seq} of 3)`;

            return (
              <div
                key={row.id}
                className="p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-[#303654]">
                      {row.student.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10.5px] font-extrabold ${statusChipClass(
                        row.status
                      )}`}
                    >
                      {row.status.replace("_", " ")}
                    </span>
                    {row.daysOverdue > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                        <AlertTriangle className="w-3 h-3" /> {row.daysOverdue}d late
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#645F80]">
                    {row.course.title} · <span className="font-bold text-[#303654]">Part {row.seq} of 3</span> ·
                    Outstanding:{" "}
                    <span className="font-extrabold text-[#303654]">
                      ₦{row.outstanding.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#645F80]">
                    Last reminder:{" "}
                    {row.lastReminderAt ? formatLagosDateTime(row.lastReminderAt) : "None yet"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#645F80] bg-[#FAF8FF] border border-[#E5C8ED] rounded-lg px-2.5 py-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#AE54C6]" />
                    <input
                      type="date"
                      aria-label={`Due date for ${row.student.name} part ${row.seq}`}
                      value={currentInput}
                      onChange={(e) =>
                        setDraftDates((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                      className="bg-transparent text-xs font-bold text-[#303654] focus:outline-none"
                    />
                  </label>

                  {changed && (
                    <button
                      type="button"
                      disabled={savingId === row.id}
                      onClick={() => void handleSaveDueDate(row)}
                      className="m-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#AE54C6] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingId === row.id ? "Saving…" : "Save"}
                    </button>
                  )}

                  <a
                    href={`mailto:${encodeURIComponent(row.student.email)}?subject=${encodeURIComponent(
                      mailSubject
                    )}&body=${encodeURIComponent(waText)}`}
                    className="m-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#303654] hover:bg-slate-50"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>

                  {row.student.phone && (
                    <a
                      href={buildWhatsAppLink(row.student.phone, waText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="m-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebe5d]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
