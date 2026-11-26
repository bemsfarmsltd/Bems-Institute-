"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { AuditEvent } from "@/types/lms";
import { History, RefreshCw } from "lucide-react";

const AUDIT_ACTIONS = [
  "",
  "payment.recorded",
  "payment.refunded",
  "payment.refunded_excess",
  "enrollment.approved",
  "enrollment.status_changed",
  "enrollment.second_chance",
  "course.created",
  "course.status_changed",
  "settings.changed",
  "staff.invited",
  "staff.roles_changed",
  "staff.deactivated",
  "staff.reactivated",
  "staff.2fa_reset"
];

export function AuditLogPanel() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [actionFilter, setActionFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(
    async (before?: string) => {
      if (before) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("limit", "50");
        if (actionFilter) params.set("action", actionFilter);
        if (targetTypeFilter.trim()) params.set("targetType", targetTypeFilter.trim());
        if (before) params.set("before", before);

        const res = await apiFetch(`/api/admin/audit?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || "Could not load audit log.");
          return;
        }
        const incoming: AuditEvent[] = Array.isArray(data.events) ? data.events : [];
        setEvents((prev) => (before ? [...prev, ...incoming] : incoming));
        setHasMore(Boolean(data.hasMore));
      } catch {
        setError("Network error while loading audit log.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [actionFilter, targetTypeFilter]
  );

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-[#AE54C6]" />
          <div>
            <h2 className="font-display text-[19px] sm:text-[20px] font-extrabold text-[#1D2026]">
              Audit log
            </h2>
            <p className="text-[12.5px] text-[#747579] mt-0.5">
              Record of money, registration, staff, and settings changes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchEvents()}
          className="m-press self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12.5px] font-semibold text-[#1D2026] hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="px-5 sm:px-6 py-3 bg-[#F8F9FA] border-b border-slate-100 flex flex-col sm:flex-row gap-2.5">
        <select
          aria-label="Filter by action"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-[#1D2026]"
        >
          <option value="">All actions</option>
          {AUDIT_ACTIONS.filter(Boolean).map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={targetTypeFilter}
          onChange={(e) => setTargetTypeFilter(e.target.value)}
          placeholder="Target type (e.g. Enrollment, User)"
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-[#1D2026] sm:w-64"
        />
      </div>

      {error && (
        <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {loading && events.length === 0 ? (
          <div className="p-6 text-[13.5px] text-[#747579]">Loading audit events…</div>
        ) : events.length === 0 ? (
          <div className="p-6 text-[13.5px] text-[#747579]">No audit events match this filter.</div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#F7EDF9] text-[#AE54C6] text-[11px] font-bold font-mono">
                    {ev.action}
                  </span>
                  <span className="text-[13px] font-bold text-[#1D2026]">{ev.actorName}</span>
                </div>
                <p className="text-[13px] text-[#475569]">{ev.summary}</p>
              </div>
              <span className="text-[12px] text-[#747579] shrink-0">
                {new Date(ev.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      {hasMore && events.length > 0 && (
        <div className="p-4 border-t border-slate-100 text-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void fetchEvents(events[events.length - 1].createdAt)}
            className="m-press px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-[#1D2026] hover:bg-slate-50 cursor-pointer disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
