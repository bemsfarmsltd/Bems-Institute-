"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/components/RequireRole";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { apiFetch } from "@/lib/api-client";
import { ArrowLeft, Plus, Eye, EyeOff, Star, Trash2 } from "lucide-react";

interface EligibleGrad {
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  gradeTitle: string;
}

interface Outcome {
  id: string;
  userId: string;
  courseId: string;
  headline: string;
  company: string | null;
  quote: string | null;
  photoUrl: string | null;
  published: boolean;
  featured: boolean;
  user: { name: string; email: string };
  course: { title: string };
}

function AdminGraduatesContent() {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [eligible, setEligible] = useState<EligibleGrad[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [headline, setHeadline] = useState("");
  const [company, setCompany] = useState("");
  const [quote, setQuote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [outcomesRes, eligibleRes] = await Promise.all([
      apiFetch("/api/graduates/admin"),
      apiFetch("/api/graduates/eligible")
    ]);
    if (outcomesRes.ok) setOutcomes((await outcomesRes.json()).outcomes);
    if (eligibleRes.ok) setEligible((await eligibleRes.json()).eligible);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const [userId, courseId] = selectedKey.split("::");
    if (!userId || !courseId || !headline.trim()) {
      setError("Choose a graduate and enter a headline.");
      return;
    }
    setSubmitting(true);
    const res = await apiFetch("/api/graduates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, courseId, headline, company, quote, photoUrl })
    });
    setSubmitting(false);
    if (!res.ok) {
      setError((await res.json()).error || "Could not create entry.");
      return;
    }
    setHeadline("");
    setCompany("");
    setQuote("");
    setPhotoUrl("");
    setSelectedKey("");
    await load();
  };

  const togglePublished = async (id: string, published: boolean) => {
    await apiFetch(`/api/graduates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published })
    });
    await load();
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    await apiFetch(`/api/graduates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !featured })
    });
    await load();
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/api/graduates/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7928CA] hover:underline mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
          </Link>
          <h1 className="text-2xl font-black text-[#18143D]">Graduate Outcomes — &quot;Where They Are Now&quot;</h1>
          <p className="text-xs text-[#645F80] mt-1">
            Curate the public success-story page. Nothing here is auto-published from a certificate — a name/photo
            going public needs the graduate&apos;s consent, so add and publish entries deliberately.
          </p>
        </div>

        {/* New entry form */}
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-[#E6E1F5] p-6 space-y-4">
          <h2 className="text-sm font-black text-[#18143D] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#7928CA]" /> Add an Outcome
          </h2>

          <div>
            <label className="block text-xs font-bold text-[#18143D] mb-1.5">Certified Graduate</label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1F5] text-xs focus:outline-none focus:ring-2 focus:ring-[#7928CA]/30"
            >
              <option value="">Select a certified graduate…</option>
              {eligible.map((g) => (
                <option key={`${g.userId}::${g.courseId}`} value={`${g.userId}::${g.courseId}`}>
                  {g.userName} — {g.courseTitle} ({g.gradeTitle})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#18143D] mb-1.5">Headline *</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Hired as Frontend Developer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1F5] text-xs focus:outline-none focus:ring-2 focus:ring-[#7928CA]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#18143D] mb-1.5">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. BEMS Group"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1F5] text-xs focus:outline-none focus:ring-2 focus:ring-[#7928CA]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18143D] mb-1.5">Quote</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={2}
              placeholder="A short testimonial in their own words"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1F5] text-xs focus:outline-none focus:ring-2 focus:ring-[#7928CA]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18143D] mb-1.5">Photo URL</label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1F5] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#7928CA]/30"
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-[#7928CA] hover:bg-[#671fb0] text-white text-xs font-bold disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add Draft Entry"}
          </button>
        </form>

        {/* Existing entries */}
        <div className="bg-white rounded-2xl border border-[#E6E1F5] overflow-hidden">
          <div className="p-5 border-b border-[#F0EDF9]">
            <h2 className="text-sm font-black text-[#18143D]">All Entries ({outcomes.length})</h2>
          </div>
          <div className="divide-y divide-[#F0EDF9]">
            {outcomes.length === 0 && (
              <p className="p-5 text-xs text-[#8580A3]">No entries yet — add one above.</p>
            )}
            {outcomes.map((o) => (
              <div key={o.id} className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#18143D] truncate">{o.user.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7928CA] bg-[#F0EDF9] px-2 py-0.5 rounded-full shrink-0">
                      {o.course.title}
                    </span>
                    {o.published ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Published</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Draft</span>
                    )}
                  </div>
                  <p className="text-xs text-[#645F80] mt-1 truncate">{o.headline}{o.company ? ` · ${o.company}` : ""}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleFeatured(o.id, o.featured)}
                    title={o.featured ? "Unfeature" : "Feature"}
                    className={`p-2 rounded-lg border ${o.featured ? "border-amber-300 bg-amber-50 text-amber-600" : "border-[#E6E1F5] text-[#8580A3]"}`}
                  >
                    <Star className="w-3.5 h-3.5" fill={o.featured ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublished(o.id, o.published)}
                    title={o.published ? "Unpublish" : "Publish"}
                    className="p-2 rounded-lg border border-[#E6E1F5] text-[#7928CA]"
                  >
                    {o.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(o.id)}
                    title="Delete"
                    className="p-2 rounded-lg border border-[#E6E1F5] text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AdminGraduatesPage() {
  return (
    <RequireRole allow={["ADMIN"]}>
      <AdminGraduatesContent />
    </RequireRole>
  );
}
