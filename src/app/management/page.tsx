"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PortalGuard } from "@/components/PortalGuard";
import { AuditLogPanel } from "@/components/AuditLogPanel";
import { apiFetch } from "@/lib/api-client";
import { CountUp } from "@/components/CountUp";
import type { AnalyticsSummary } from "@/types/lms";
import { BarChart3, RefreshCw, Star } from "lucide-react";

function ManagementPortalContent() {
  const [tab, setTab] = useState<"analytics" | "placements" | "audit">("analytics");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [graduates, setGraduates] = useState<
    Array<{ id: string; name: string; courseTitle?: string; roleTitle?: string; company?: string }>
  >([]);
  const [reviews, setReviews] = useState<
    Array<{ id: string; studentName?: string; courseTitle?: string; rating: number; comment: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  const loadManagementData = useCallback(async () => {
    setLoading(true);
    try {
      const [anRes, gradRes, revRes] = await Promise.all([
        apiFetch("/api/admin/analytics"),
        apiFetch("/api/graduates"),
        apiFetch("/api/admin/reviews")
      ]);
      if (anRes.ok) {
        const d = await anRes.json();
        setAnalytics(d.analytics || d);
      }
      if (gradRes.ok) {
        const d = await gradRes.json();
        setGraduates(Array.isArray(d.graduates) ? d.graduates : []);
      }
      if (revRes.ok) {
        const d = await revRes.json();
        setReviews(Array.isArray(d.reviews) ? d.reviews : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadManagementData();
  }, [loadManagementData]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#AE54C6]">
              Management Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#303654]">
              Analytics, Outcomes &amp; Audit
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void loadManagementData()}
            className="m-press self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#AE54C6] text-white text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "analytics", label: "Analytics" },
            { id: "placements", label: `Placements & Reviews (${graduates.length + reviews.length})` },
            { id: "audit", label: "Audit Log" }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as "analytics" | "placements" | "audit")}
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

        {tab === "audit" ? (
          <AuditLogPanel />
        ) : loading ? (
          <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 text-sm text-[#645F80]">
            Loading management overview…
          </div>
        ) : tab === "analytics" ? (
          analytics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5">
                  <div className="text-xs font-bold text-[#645F80]">Total Revenue</div>
                  <div className="text-2xl font-black text-[#303654] mt-1">
                    ₦<CountUp value={analytics.totalRevenue || 0} />
                  </div>
                </div>
                <div className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5">
                  <div className="text-xs font-bold text-[#645F80]">In-Progress Enrollments</div>
                  <div className="text-2xl font-black text-[#AE54C6] mt-1">
                    <CountUp value={analytics.inProgressEnrollments || 0} />
                  </div>
                </div>
                <div className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5">
                  <div className="text-xs font-bold text-[#645F80]">Completed Enrollments</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    <CountUp value={analytics.completedEnrollments || 0} />
                  </div>
                </div>
                <div className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5">
                  <div className="text-xs font-bold text-[#645F80]">Lessons Completed</div>
                  <div className="text-2xl font-black text-[#303654] mt-1">
                    <CountUp value={analytics.lessonsCompleted || 0} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 shadow-xs space-y-3">
                <h2 className="text-base font-extrabold text-[#303654] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#AE54C6]" /> Banner / QR Source Yield
                </h2>
                {!analytics.bannerChannelYield?.length ? (
                  <p className="text-xs text-[#645F80]">No banner or QR scan yield recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[520px]">
                      <thead>
                        <tr className="text-[#8580A3] uppercase text-[10px] font-bold">
                          <th className="py-2 pr-4">Source</th>
                          <th className="py-2 pr-4">Scans</th>
                          <th className="py-2 pr-4">Registrations</th>
                          <th className="py-2 pr-4">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F7EDF9]">
                        {analytics.bannerChannelYield.map((b) => (
                          <tr key={b.source}>
                            <td className="py-2.5 pr-4 font-bold text-[#303654]">{b.source}</td>
                            <td className="py-2.5 pr-4 text-[#645F80]">{b.scans}</td>
                            <td className="py-2.5 pr-4 text-[#645F80]">{b.registrations}</td>
                            <td className="py-2.5 pr-4 font-bold text-[#303654]">
                              ₦{b.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#F1E2F5] p-6 text-sm text-[#645F80]">
              Analytics unavailable.
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#F1E2F5] p-5 shadow-xs space-y-3">
              <h2 className="text-base font-extrabold text-[#303654]">
                Graduate Placements (Read-only)
              </h2>
              {graduates.length === 0 ? (
                <p className="text-xs text-[#645F80]">No graduate placements published yet.</p>
              ) : (
                <div className="divide-y divide-[#F7EDF9]">
                  {graduates.map((g) => (
                    <div key={g.id} className="py-2.5 text-xs">
                      <div className="font-bold text-[#303654]">{g.name}</div>
                      <div className="text-[#645F80]">
                        {g.roleTitle || g.courseTitle} {g.company ? `· ${g.company}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#F1E2F5] p-5 shadow-xs space-y-3">
              <h2 className="text-base font-extrabold text-[#303654]">
                Student Reviews (Read-only)
              </h2>
              {reviews.length === 0 ? (
                <p className="text-xs text-[#645F80]">No student reviews yet.</p>
              ) : (
                <div className="divide-y divide-[#F7EDF9]">
                  {reviews.map((r) => (
                    <div key={r.id} className="py-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#303654]">
                          {r.studentName || "Student"} {r.courseTitle ? `· ${r.courseTitle}` : ""}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-current" /> {r.rating}
                        </span>
                      </div>
                      <p className="text-[#645F80]">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ManagementPortalPage() {
  return (
    <PortalGuard requiredRole="MANAGEMENT">
      <ManagementPortalContent />
    </PortalGuard>
  );
}
