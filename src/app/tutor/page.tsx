"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RequireRole } from "@/components/RequireRole";
import { UserAvatar } from "@/components/UserAvatar";
import { apiFetch } from "@/lib/api-client";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type {
  TutorCourseSummary,
  TutorStudentDetail,
  TutorStudentRow
} from "@/types/lms";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Flame,
  Mail,
  MessageCircle,
  Users,
  X
} from "lucide-react";

function formatRelativeDate(iso: string | null): string {
  if (!iso) return "No activity yet";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function TutorDashboardContent() {
  const [courses, setCourses] = useState<TutorCourseSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [students, setStudents] = useState<TutorStudentRow[]>([]);
  const [summary, setSummary] = useState<{ total: number; needsAttention: number }>({
    total: 0,
    needsAttention: 0
  });
  const [filterTab, setFilterTab] = useState<"attention" | "all">("attention");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<TutorStudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadStudents = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
      const res = await apiFetch(`/api/instructor/students${qs}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Could not load your students.");
        setLoading(false);
        return;
      }
      setCourses(Array.isArray(data.courses) ? data.courses : []);
      setStudents(Array.isArray(data.students) ? data.students : []);
      setSummary(data.summary || { total: 0, needsAttention: 0 });
    } catch {
      setError("Network error while loading tutor view.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents(selectedCourseId);
  }, [loadStudents, selectedCourseId]);

  const openStudentDetail = async (row: TutorStudentRow) => {
    setDetailLoading(true);
    try {
      const res = await apiFetch(
        `/api/instructor/students/${encodeURIComponent(row.userId)}?courseId=${encodeURIComponent(
          row.courseId
        )}`
      );
      const data = await res.json().catch(() => null);
      if (res.ok && data?.student) {
        setSelectedStudent(data.student);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const visibleStudents =
    filterTab === "attention"
      ? students.filter((s) => s.needsAttention)
      : students;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AE54C6] hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-[#303654]">Tutor View</h1>
            <p className="text-xs sm:text-sm text-[#645F80]">
              Track student progress, goals, and who needs a check-in.
            </p>
          </div>

          {courses.length > 0 && (
            <select
              aria-label="Filter by course"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[#E5C8ED] bg-white text-sm font-bold text-[#303654]"
            >
              <option value="">All assigned courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && courses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#F1E2F5] p-8 text-center space-y-2 shadow-xs">
            <Users className="w-9 h-9 text-[#AE54C6] mx-auto" />
            <h2 className="text-base font-black text-[#303654]">
              An admin hasn&apos;t assigned you a course yet.
            </h2>
            <p className="text-xs sm:text-sm text-[#645F80]">
              Ask an admin to assign you under Admin Settings &rarr; Course tutors.
            </p>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterTab("attention")}
                className={`m-press px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                  filterTab === "attention"
                    ? "bg-[#AE54C6] text-white"
                    : "bg-white border border-[#F1E2F5] text-[#303654]"
                }`}
              >
                Needs attention ({summary.needsAttention})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`m-press px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                  filterTab === "all"
                    ? "bg-[#303654] text-white"
                    : "bg-white border border-[#F1E2F5] text-[#303654]"
                }`}
              >
                All ({summary.total})
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 text-sm text-[#645F80]">
                Loading students…
              </div>
            ) : visibleStudents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#F1E2F5] p-8 text-center text-sm text-[#645F80]">
                {filterTab === "attention"
                  ? "No students currently flagged as needing attention."
                  : "No confirmed students in this course yet."}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {visibleStudents.map((s) => (
                  <button
                    key={`${s.userId}-${s.courseId}`}
                    type="button"
                    onClick={() => void openStudentDetail(s)}
                    className="m-lift w-full text-left bg-white rounded-2xl border border-[#F1E2F5] hover:border-[#AE54C6] p-4 sm:p-5 shadow-xs space-y-3 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          user={{ name: s.name, avatarUrl: s.avatarUrl }}
                          size={44}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm sm:text-base font-extrabold text-[#303654] truncate">
                              {s.name}
                            </span>
                            <span className="text-[11px] font-bold text-[#AE54C6]">
                              {s.courseTitle}
                            </span>
                            {s.streakDays > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10.5px] font-bold">
                                <Flame className="w-3 h-3" /> {s.streakDays}d
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#645F80] mt-0.5">
                            Goal:{" "}
                            {s.goal
                              ? s.goal.goal || s.goal.goalLabel || "Shared"
                              : "Not shared"}{" "}
                            · Active {formatRelativeDate(s.lastActiveAt)}
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-44 shrink-0 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-[#645F80]">
                          <span>
                            {s.progress.completed}/{s.progress.total} lessons
                          </span>
                          <span className="text-[#AE54C6]">{s.progress.percent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#F7EDF9] overflow-hidden">
                          <div
                            className="h-full bg-[#AE54C6]"
                            style={{ width: `${s.progress.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {s.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {s.flags.map((f) => (
                          <span
                            key={f.kind}
                            className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold"
                          >
                            {f.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Student Detail Modal / Drawer */}
      {(selectedStudent || detailLoading) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5">
            {detailLoading || !selectedStudent ? (
              <div className="py-10 text-center text-sm text-[#645F80]">
                Loading student details…
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F7EDF9]">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      user={{
                        name: selectedStudent.name,
                        avatarUrl: selectedStudent.avatarUrl
                      }}
                      size={48}
                    />
                    <div>
                      <h2 className="text-lg font-black text-[#303654]">
                        {selectedStudent.name}
                      </h2>
                      <p className="text-xs text-[#645F80]">
                        {selectedStudent.courseTitle} ·{" "}
                        {selectedStudent.deliveryMode === "VIRTUAL_ZOOM"
                          ? "Virtual"
                          : "Physical"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close student details"
                    onClick={() => setSelectedStudent(null)}
                    className="p-1.5 rounded-lg text-[#645F80] hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contact Actions */}
                <div className="flex flex-wrap gap-2.5">
                  {selectedStudent.contact.phone && (
                    <a
                      href={buildWhatsAppLink(
                        selectedStudent.contact.phone,
                        `Hi ${selectedStudent.name.split(" ")[0]}, checking in on your ${selectedStudent.courseTitle} progress at BEMS.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="m-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                  <a
                    href={`mailto:${encodeURIComponent(selectedStudent.contact.email)}`}
                    className="m-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#303654] hover:bg-slate-50"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                </div>

                {/* Modules Journey */}
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#AE54C6]">
                    Module Progress
                  </h3>
                  <div className="space-y-2">
                    {selectedStudent.modules.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8FF] border border-[#F1E2F5] text-xs"
                      >
                        <div className="flex items-center gap-2 font-bold text-[#303654]">
                          {m.status === "DONE" && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          <span>{m.title}</span>
                        </div>
                        <span className="font-bold text-[#645F80]">
                          {m.completed}/{m.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submissions */}
                {selectedStudent.submissions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#AE54C6]">
                      Project Submissions
                    </h3>
                    <div className="space-y-2">
                      {selectedStudent.submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-xl border border-[#F1E2F5] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-[#303654]">{sub.title}</div>
                            <div className="text-[#645F80]">
                              {sub.status}
                              {sub.score !== null ? ` · ${sub.score}/100` : ""}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {sub.githubUrl && (
                              <a
                                href={sub.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#AE54C6] font-bold hover:underline"
                              >
                                GitHub <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {sub.liveDemoUrl && (
                              <a
                                href={sub.liveDemoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                              >
                                Demo <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {selectedStudent.recentActivity.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#AE54C6]">
                      Recent Activity
                    </h3>
                    <div className="space-y-1.5 text-xs text-[#4A4568]">
                      {selectedStudent.recentActivity.slice(0, 6).map((act, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            {act.label}
                            {act.lessonTitle ? ` — ${act.lessonTitle}` : ""}
                          </span>
                          <span className="text-[#8580A3] shrink-0">
                            {new Date(act.at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function TutorPage() {
  return (
    <RequireRole allow={["INSTRUCTOR", "ADMIN"]}>
      <TutorDashboardContent />
    </RequireRole>
  );
}
