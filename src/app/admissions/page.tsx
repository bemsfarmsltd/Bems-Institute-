"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PortalGuard } from "@/components/PortalGuard";
import { API_BASE_URL, apiFetch } from "@/lib/api-client";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  CheckCircle2,
  Download,
  Mail,
  MessageCircle,
  RefreshCw,
  UserCheck
} from "lucide-react";

interface PendingApprovalItem {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amountPaid: number;
  totalDue: number;
  deliveryMode: string;
  createdAt: string;
}

interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseTitle?: string;
  createdAt: string;
}

interface TutorAppItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  trackTitle: string;
  teachingModeLabel: string;
  status: string;
  createdAt: string;
}

interface RosterStudent {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  status: string;
  paymentStatus: string;
}

function AdmissionsPortalContent() {
  const [tab, setTab] = useState<"approvals" | "leads" | "roster" | "tutors">("approvals");
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [welcomeCalls, setWelcomeCalls] = useState<Array<{ id: string; name: string; phone: string; courseTitle?: string }>>([]);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [tutorApps, setTutorApps] = useState<TutorAppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAdmissionsData = useCallback(async () => {
    setLoading(true);
    try {
      const [appRes, leadRes, wcRes, rosRes, tutRes] = await Promise.all([
        apiFetch("/api/admin/enrollments/pending-approval"),
        apiFetch("/api/admin/leads"),
        apiFetch("/api/admin/welcome-calls"),
        apiFetch("/api/admin/roster"),
        apiFetch("/api/tutor-applications")
      ]);
      if (appRes.ok) {
        const d = await appRes.json();
        setApprovals(Array.isArray(d.enrollments) ? d.enrollments : Array.isArray(d.pending) ? d.pending : []);
      }
      if (leadRes.ok) {
        const d = await leadRes.json();
        setLeads(Array.isArray(d.leads) ? d.leads : []);
      }
      if (wcRes.ok) {
        const d = await wcRes.json();
        setWelcomeCalls(Array.isArray(d.calls) ? d.calls : Array.isArray(d.students) ? d.students : []);
      }
      if (rosRes.ok) {
        const d = await rosRes.json();
        setRoster(Array.isArray(d.roster) ? d.roster : Array.isArray(d.students) ? d.students : []);
      }
      if (tutRes.ok) {
        const d = await tutRes.json();
        setTutorApps(Array.isArray(d.applications) ? d.applications : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmissionsData();
  }, [loadAdmissionsData]);

  const handleApprove = async (item: PendingApprovalItem) => {
    setBusyId(item.id);
    setNotice(null);
    try {
      const res = await apiFetch(`/api/admin/enrollments/${encodeURIComponent(item.id)}/approve`, {
        method: "POST"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data?.error || "Could not approve registration.");
      } else {
        setNotice(`Confirmed ${item.studentName} for ${item.courseTitle}.`);
        await loadAdmissionsData();
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
              Admissions Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#303654]">
              Registrations, Leads &amp; Roster
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`${API_BASE_URL}/api/admin/roster/export`}
              className="m-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#303654] hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" /> Export Roster CSV
            </a>
            <button
              type="button"
              onClick={() => void loadAdmissionsData()}
              className="m-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#AE54C6] text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
            {notice}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {[
            { id: "approvals", label: `Pending Approvals (${approvals.length})` },
            { id: "leads", label: `Leads & Welcome Calls (${leads.length + welcomeCalls.length})` },
            { id: "roster", label: `Student Roster (${roster.length})` },
            { id: "tutors", label: `Tutor Applications (${tutorApps.length})` }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as "approvals" | "leads" | "roster" | "tutors")}
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

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 text-sm text-[#645F80]">
            Loading admissions records…
          </div>
        ) : tab === "approvals" ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] divide-y divide-[#F7EDF9] shadow-xs">
            {approvals.length === 0 ? (
              <div className="p-6 text-sm text-[#645F80]">
                No registrations waiting for approval.
              </div>
            ) : (
              approvals.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-extrabold text-[#303654]">
                      {item.studentName}{" "}
                      <span className="text-xs font-bold text-[#AE54C6]">· {item.courseTitle}</span>
                    </div>
                    <div className="text-xs text-[#645F80] mt-0.5">
                      {item.studentEmail} · Paid ₦{item.amountPaid.toLocaleString()} ·{" "}
                      {item.deliveryMode === "VIRTUAL_ZOOM" ? "Virtual" : "Physical"}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void handleApprove(item)}
                    className="m-press self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Seat
                  </button>
                </div>
              ))
            )}
          </div>
        ) : tab === "leads" ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#F1E2F5] divide-y divide-[#F7EDF9] shadow-xs">
              <div className="px-5 py-3.5 font-extrabold text-sm text-[#303654]">
                Course Interest Leads ({leads.length})
              </div>
              {leads.length === 0 ? (
                <div className="p-5 text-xs text-[#645F80]">No leads yet.</div>
              ) : (
                leads.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#303654]">{l.name}</div>
                      <div className="text-[#645F80]">
                        {l.email} · {l.phone} {l.courseTitle ? `· ${l.courseTitle}` : ""}
                      </div>
                    </div>
                    {l.phone && (
                      <a
                        href={buildWhatsAppLink(l.phone, `Hello ${l.name}, following up from BEMS Admissions.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="m-press self-start sm:self-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : tab === "roster" ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] divide-y divide-[#F7EDF9] shadow-xs">
            {roster.length === 0 ? (
              <div className="p-6 text-sm text-[#645F80]">No students in roster yet.</div>
            ) : (
              roster.map((st) => (
                <div key={st.id} className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-extrabold text-[#303654] text-sm">{st.studentName}</div>
                    <div className="text-[#645F80]">
                      {st.studentEmail} · {st.courseTitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F7EDF9] text-[#AE54C6] font-bold">
                      {st.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#475569] font-bold">
                      {st.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] divide-y divide-[#F7EDF9] shadow-xs">
            {tutorApps.length === 0 ? (
              <div className="p-6 text-sm text-[#645F80]">No tutor applications yet.</div>
            ) : (
              tutorApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="text-sm font-extrabold text-[#303654]">
                      {app.name} <span className="text-xs text-[#AE54C6]">· {app.trackTitle}</span>
                    </div>
                    <div className="text-[#645F80]">
                      {app.teachingModeLabel} · {app.status} · {app.email}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${encodeURIComponent(app.email)}`}
                      className="m-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-[#303654]"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                    <a
                      href={buildWhatsAppLink(app.phone, `Hi ${app.name}, regarding your BEMS tutor application.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="m-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-bold"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function AdmissionsPortalPage() {
  return (
    <PortalGuard requiredRole="ADMISSIONS">
      <AdmissionsPortalContent />
    </PortalGuard>
  );
}
