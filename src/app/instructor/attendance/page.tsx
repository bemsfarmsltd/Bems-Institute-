"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireRole } from "@/components/RequireRole";
import { apiFetch } from "@/lib/api-client";
import { ArrowLeft, CalendarPlus, CheckCircle2, UserCheck, UserX } from "lucide-react";

interface LiveSessionRow {
  id: string;
  title: string;
  scheduledAt: string;
  courseId: string;
}

interface RosterEntry {
  userId: string;
  name: string;
  email: string;
  present: boolean | null;
}

function InstructorAttendanceContent() {
  const { adminCourses } = useLMS();

  const [courseId, setCourseId] = useState<string>("");
  const [sessions, setSessions] = useState<LiveSessionRow[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [marks, setMarks] = useState<Record<string, boolean>>({});

  const [newTitle, setNewTitle] = useState("");
  const [newScheduledAt, setNewScheduledAt] = useState("");
  const [newMeetingUrl, setNewMeetingUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId && adminCourses.length > 0) {
      setCourseId(adminCourses[0].id);
    }
  }, [adminCourses, courseId]);

  const loadSessions = async (cid: string) => {
    if (!cid) return;
    const res = await apiFetch(`/api/attendance/sessions?courseId=${cid}`);
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions || []);
    }
  };

  useEffect(() => {
    setSelectedSessionId("");
    setRoster([]);
    loadSessions(courseId);
  }, [courseId]);

  const loadRoster = async (sessionId: string) => {
    if (!sessionId) return;
    const res = await apiFetch(`/api/attendance/sessions/${sessionId}/roster`);
    if (res.ok) {
      const data = await res.json();
      setRoster(data.roster || []);
      const initialMarks: Record<string, boolean> = {};
      (data.roster || []).forEach((r: RosterEntry) => {
        initialMarks[r.userId] = r.present ?? false;
      });
      setMarks(initialMarks);
    }
  };

  useEffect(() => {
    if (selectedSessionId) loadRoster(selectedSessionId);
  }, [selectedSessionId]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!courseId || !newTitle.trim() || !newScheduledAt) {
      setError("Fill in a title and date/time for the session.");
      return;
    }
    setCreating(true);
    const res = await apiFetch("/api/attendance/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        title: newTitle,
        scheduledAt: new Date(newScheduledAt).toISOString(),
        meetingUrl: newMeetingUrl.trim() || undefined
      })
    });
    setCreating(false);
    if (!res.ok) {
      setError((await res.json()).error || "Could not create session.");
      return;
    }
    setNewTitle("");
    setNewScheduledAt("");
    setNewMeetingUrl("");
    await loadSessions(courseId);
  };

  const handleSaveRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId) return;
    setSaving(true);
    setError(null);
    const records = roster.map((r) => ({ userId: r.userId, present: !!marks[r.userId] }));
    const res = await apiFetch(`/api/attendance/sessions/${selectedSessionId}/mark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records })
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error || "Could not save attendance.");
      return;
    }
    setNotice("Attendance saved. Students who missed two sessions in a row are automatically notified.");
    setTimeout(() => setNotice(null), 4000);
    await loadRoster(selectedSessionId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="bg-[#18143D] text-white py-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple">LIVE CLASSES</Badge>
              <Badge variant="gold">FACULTY PORTAL</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Attendance Tracking</h1>
            <p className="text-xs sm:text-sm text-[#A5A0C8]">
              Create live sessions and mark who showed up. Students who miss two sessions in a row are
              automatically flagged with an in-app check-in reminder.
            </p>
          </div>

          <Link href="/instructor">
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Instructor Studio
            </Button>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        {notice && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {notice}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#18143D] uppercase tracking-wider mb-1.5">Course</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full sm:w-96 px-4 py-2.5 rounded-xl border border-[#E6E1F5] text-sm font-semibold text-[#18143D] focus:outline-none focus:border-[#7928CA]"
          >
            {adminCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: sessions list + create form */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleCreateSession} className="bg-white border border-[#E6E1F5] rounded-2xl p-5 space-y-3">
              <h3 className="font-extrabold text-[#18143D] text-sm flex items-center gap-1.5">
                <CalendarPlus className="w-4 h-4 text-[#7928CA]" /> New Live Session
              </h3>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Week 4 — Live Q&A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1F5] text-xs focus:outline-none focus:border-[#7928CA]"
              />
              <input
                type="datetime-local"
                value={newScheduledAt}
                onChange={(e) => setNewScheduledAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1F5] text-xs focus:outline-none focus:border-[#7928CA]"
              />
              <input
                type="url"
                value={newMeetingUrl}
                onChange={(e) => setNewMeetingUrl(e.target.value)}
                placeholder="Meeting link (Zoom/Meet) — optional"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1F5] text-xs focus:outline-none focus:border-[#7928CA]"
              />
              <Button type="submit" size="sm" disabled={creating} className="w-full">
                {creating ? "Creating…" : "Create Session"}
              </Button>
            </form>

            <div className="space-y-2">
              <h3 className="font-extrabold text-[#18143D] text-sm px-1">Sessions ({sessions.length})</h3>
              {sessions.length === 0 && (
                <p className="text-xs text-[#645F80] px-1">No sessions yet for this course.</p>
              )}
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedSessionId === s.id
                      ? "bg-white border-[#7928CA] shadow-md ring-2 ring-[#7928CA]/20"
                      : "bg-white border-[#E6E1F5] hover:border-[#7928CA]/40"
                  }`}
                >
                  <p className="text-xs font-bold text-[#18143D]">{s.title}</p>
                  <p className="text-[11px] text-[#645F80]">{new Date(s.scheduledAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: roster marking */}
          <div className="lg:col-span-7">
            {selectedSessionId ? (
              <form onSubmit={handleSaveRoster} className="bg-white border border-[#E6E1F5] rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
                <h2 className="text-lg font-black text-[#18143D]">Mark Attendance ({roster.length} enrolled)</h2>

                {roster.length === 0 && (
                  <p className="text-xs text-[#645F80]">No enrolled students for this course yet.</p>
                )}

                <div className="divide-y divide-[#F0EDF9]">
                  {roster.map((r) => (
                    <div key={r.userId} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#18143D] truncate">{r.name}</p>
                        <p className="text-[11px] text-[#645F80] truncate">{r.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setMarks((m) => ({ ...m, [r.userId]: true }))}
                          className={`p-2 rounded-lg border flex items-center gap-1 text-[11px] font-bold ${
                            marks[r.userId]
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                              : "border-[#E6E1F5] text-[#8580A3]"
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setMarks((m) => ({ ...m, [r.userId]: false }))}
                          className={`p-2 rounded-lg border flex items-center gap-1 text-[11px] font-bold ${
                            !marks[r.userId]
                              ? "border-red-300 bg-red-50 text-red-600"
                              : "border-[#E6E1F5] text-[#8580A3]"
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" /> Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" disabled={saving || roster.length === 0} className="w-full">
                  {saving ? "Saving…" : "Save Attendance"}
                </Button>
              </form>
            ) : (
              <div className="bg-white border border-[#E6E1F5] rounded-3xl p-12 text-center text-[#645F80] text-xs">
                Select or create a session on the left to mark attendance.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function InstructorAttendancePage() {
  return (
    <RequireRole allow={["INSTRUCTOR", "ADMIN"]}>
      <InstructorAttendanceContent />
    </RequireRole>
  );
}
