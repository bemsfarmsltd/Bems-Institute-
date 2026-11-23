"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type {
  BookmarkItem,
  PortfolioSettings,
  RemindersSettings,
  StudyNoteItem
} from "@/types/lms";
import {
  Bell,
  Bookmark,
  Copy,
  ExternalLink,
  Globe,
  Plus,
  Share2,
  StickyNote,
  Trash2
} from "lucide-react";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PublicPortfolioCard({ accentHex }: { accentHex: string }) {
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [handle, setHandle] = useState("");
  const [headline, setHeadline] = useState("");
  const [showScores, setShowScores] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadPortfolio = useCallback(async () => {
    try {
      const res = await apiFetch("/api/lms/my-space/portfolio");
      if (!res.ok) return;
      const data: PortfolioSettings = await res.json();
      setSettings(data);
      setHandle(data.handle || data.suggestedHandle || "");
      setHeadline(data.headline || "");
      setShowScores(Boolean(data.showScores));
      setEnabled(Boolean(data.enabled));
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  if (!settings) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      const res = await apiFetch("/api/lms/my-space/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: handle.trim().toLowerCase(),
          headline: headline.trim(),
          showScores,
          enabled
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Could not save your public page.");
        return;
      }
      await loadPortfolio();
      setSavedMsg("Public page saved.");
    } catch {
      setError("Network error while saving your public page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      data-reveal
      className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 sm:p-7 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F7EDF9]">
        <div className="flex items-start gap-2.5">
          <Globe className="w-5 h-5 mt-0.5 shrink-0" style={{ color: accentHex }} />
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#303654]">
              Your public page
            </h2>
            <p className="text-xs text-[#645F80] mt-0.5">
              Only your name, headline, badges, graded projects and certificates are shown. Your email, phone, goals and feedback never are.
            </p>
          </div>
        </div>

        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none shrink-0">
          <span className="text-xs font-bold text-[#303654]">Public page</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={!settings.canEnable}
            onClick={() => setEnabled((v) => !v)}
            className={`m-press relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              !settings.canEnable ? "opacity-50 cursor-not-allowed bg-slate-200" : "cursor-pointer"
            }`}
            style={settings.canEnable && enabled ? { backgroundColor: accentHex } : undefined}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </div>

      {!settings.canEnable && (
        <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
          Your public page opens once your registration is confirmed
        </p>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}
      {savedMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          {savedMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#645F80] mb-1.5">
            Portfolio address
          </label>
          <div className="flex items-center rounded-xl border border-[#F1E2F5] bg-[#FAF8FF] overflow-hidden focus-within:border-[#AE54C6]">
            <span className="px-3 py-2.5 text-xs font-semibold text-[#645F80] border-r border-[#F1E2F5] shrink-0">
              www.bemsinstitute.com/u/
            </span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              placeholder={settings.suggestedHandle || "ada-obi"}
              className="w-full px-3 py-2.5 bg-white text-sm font-mono text-[#303654] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#645F80] mb-1.5">
            Headline (max 120 characters)
          </label>
          <input
            type="text"
            maxLength={120}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Full-stack web developer building tools for local businesses"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] bg-white text-sm text-[#303654]"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={showScores}
            onClick={() => setShowScores((v) => !v)}
            className={`m-press relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
              showScores ? "" : "bg-slate-300"
            }`}
            style={showScores ? { backgroundColor: accentHex } : undefined}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                showScores ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-xs font-bold text-[#303654]">Show my project scores</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="m-press self-start sm:self-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: accentHex }}
        >
          {saving ? "Saving…" : "Save public page"}
        </button>
      </div>

      {settings.enabled && settings.url && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-emerald-900 truncate">{settings.url}</div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(settings.url!);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="m-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 text-xs font-bold cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(settings.url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="m-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold"
            >
              <Share2 className="w-3.5 h-3.5" /> Share to WhatsApp
            </a>
            <Link
              href={`/u/${settings.handle || handle}`}
              target="_blank"
              className="m-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#303654] text-white text-xs font-bold"
            >
              Open <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Preview summary */}
      <div className="rounded-xl bg-[#FAF8FF] border border-[#F1E2F5] p-4 space-y-2">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#645F80]">
          Preview of what visitors see
        </div>
        <div className="text-sm font-black text-[#303654]">
          {settings.preview.name}
          {(headline || settings.preview.headline) && (
            <span className="font-normal text-[#645F80]">
              {" "}
              — {headline || settings.preview.headline}
            </span>
          )}
        </div>
        <div className="text-xs text-[#645F80]">
          {settings.preview.tracks.length} track(s) · {settings.preview.badges.length} earned badge(s) ·{" "}
          {settings.preview.projects.length} graded project(s) ·{" "}
          {settings.preview.certificates.length} certificate(s)
        </div>
      </div>
    </form>
  );
}

export function NotesAndSavedCard({ accentHex }: { accentHex: string }) {
  const [tab, setTab] = useState<"notes" | "bookmarks">("notes");
  const [notes, setNotes] = useState<StudyNoteItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [addingLink, setAddingLink] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [notesRes, bookmarksRes] = await Promise.all([
        apiFetch("/api/lms/notes"),
        apiFetch("/api/lms/bookmarks")
      ]);
      if (notesRes.ok) {
        const data = await notesRes.json();
        setNotes(Array.isArray(data?.notes) ? data.notes : []);
      }
      if (bookmarksRes.ok) {
        const data = await bookmarksRes.json();
        setBookmarks(Array.isArray(data?.bookmarks) ? data.bookmarks : []);
      }
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    setAddingLink(true);
    try {
      const res = await apiFetch("/api/lms/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl.trim(), title: linkTitle.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLinkError(data?.error || "Could not save link.");
        return;
      }
      setLinkTitle("");
      setLinkUrl("");
      await loadData();
    } catch {
      setLinkError("Network error while saving link.");
    } finally {
      setAddingLink(false);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    const res = await apiFetch(`/api/lms/bookmarks/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    if (res.ok) {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const groupedNotes = notes.reduce<Record<string, StudyNoteItem[]>>((acc, note) => {
    const key = note.courseTitle || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  return (
    <div
      data-reveal
      className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 sm:p-7 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F7EDF9]">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#303654]">Notes &amp; saved</h2>
          <p className="text-xs text-[#645F80] mt-0.5">
            Your private lesson notes and saved study links.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("notes")}
            className={`m-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
              tab === "notes"
                ? "text-white"
                : "bg-[#FAF8FF] border border-[#F1E2F5] text-[#303654]"
            }`}
            style={tab === "notes" ? { backgroundColor: accentHex } : undefined}
          >
            <StickyNote className="w-3.5 h-3.5" /> Notes ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("bookmarks")}
            className={`m-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
              tab === "bookmarks"
                ? "text-white"
                : "bg-[#FAF8FF] border border-[#F1E2F5] text-[#303654]"
            }`}
            style={tab === "bookmarks" ? { backgroundColor: accentHex } : undefined}
          >
            <Bookmark className="w-3.5 h-3.5" /> Bookmarks ({bookmarks.length})
          </button>
        </div>
      </div>

      {tab === "notes" ? (
        notes.length === 0 ? (
          <p className="text-xs sm:text-sm text-[#645F80]">
            No lesson notes yet — open any lesson and write notes in &ldquo;My notes&rdquo;.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedNotes).map(([courseTitle, items]) => (
              <div key={courseTitle} className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#645F80]">
                  {courseTitle}
                </h3>
                <div className="space-y-2">
                  {items.map((n) => (
                    <div
                      key={n.lessonId}
                      className="p-3.5 rounded-xl bg-[#FAF8FF] border border-[#F1E2F5] space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {n.href ? (
                          <Link
                            href={n.href}
                            className="text-xs font-extrabold hover:underline"
                            style={{ color: accentHex }}
                          >
                            {n.moduleTitle} · {n.lessonTitle}
                          </Link>
                        ) : (
                          <span className="text-xs font-extrabold text-[#303654]">
                            {n.moduleTitle} · {n.lessonTitle}
                          </span>
                        )}
                        <span className="text-[11px] text-[#8580A3] shrink-0">
                          {new Date(n.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A4568] whitespace-pre-line line-clamp-3">
                        {n.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleAddLink} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <input
              type="text"
              required
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="Link title (e.g. MDN Flexbox guide)"
              className="sm:col-span-4 px-3 py-2 rounded-xl border border-[#F1E2F5] text-xs text-[#303654]"
            />
            <input
              type="url"
              required
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="sm:col-span-6 px-3 py-2 rounded-xl border border-[#F1E2F5] text-xs text-[#303654]"
            />
            <button
              type="submit"
              disabled={addingLink}
              className="m-press sm:col-span-2 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: accentHex }}
            >
              <Plus className="w-3.5 h-3.5" /> Add a link
            </button>
          </form>
          {linkError && <p className="text-xs font-semibold text-rose-600">{linkError}</p>}

          {bookmarks.length === 0 ? (
            <p className="text-xs sm:text-sm text-[#645F80]">
              No bookmarks yet — tap the bookmark icon on any lesson or add a study link above.
            </p>
          ) : (
            <div className="divide-y divide-[#F7EDF9]">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    {bm.kind === "LESSON" && bm.href ? (
                      <Link
                        href={bm.href}
                        className="font-bold text-[#303654] hover:underline block truncate"
                      >
                        {bm.lessonTitle || bm.title}
                      </Link>
                    ) : bm.url ? (
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold hover:underline inline-flex items-center gap-1 truncate"
                        style={{ color: accentHex }}
                      >
                        {bm.title} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="font-bold text-[#303654] truncate block">{bm.title}</span>
                    )}
                    {bm.courseTitle && (
                      <span className="text-[11px] text-[#8580A3]">{bm.courseTitle}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Remove bookmark"
                    onClick={() => void handleDeleteBookmark(bm.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RemindersCard({ accentHex }: { accentHex: string }) {
  const [settings, setSettings] = useState<RemindersSettings | null>(null);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIosSafari, setIsIosSafari] = useState(false);

  const loadReminders = useCallback(async () => {
    try {
      const res = await apiFetch("/api/lms/reminders");
      if (!res.ok) return;
      const data: RemindersSettings = await res.json();
      setSettings(data);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    void loadReminders();
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent || "";
      const ios = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
      const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
      setIsIosSafari(Boolean(ios && !standalone));

      if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker.ready
          .then((reg) => reg.pushManager.getSubscription())
          .then((sub) => setPushSubscribed(Boolean(sub)))
          .catch(() => {});
      }
    }
  }, [loadReminders]);

  if (!settings) return null;

  const toggleField = async (key: "classes" | "goal" | "streak" | "whatsapp") => {
    setError(null);
    const nextVal = !settings[key];
    setSettings((prev) => (prev ? { ...prev, [key]: nextVal } : prev));
    try {
      const res = await apiFetch("/api/lms/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: nextVal })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSettings((prev) => (prev ? { ...prev, [key]: !nextVal } : prev));
        setError(data?.error || "Could not update reminder setting.");
      }
    } catch {
      setSettings((prev) => (prev ? { ...prev, [key]: !nextVal } : prev));
      setError("Network error while updating reminder setting.");
    }
  };

  const handleEnablePush = async () => {
    if (!settings.push.publicKey || !("serviceWorker" in navigator)) return;
    setPushBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(settings.push.publicKey)
      });
      const res = await apiFetch("/api/lms/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON())
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Could not enable push notifications.");
      } else {
        setPushSubscribed(true);
        await loadReminders();
      }
    } catch {
      setError("Notification permission was not granted on this browser.");
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    if (!("serviceWorker" in navigator)) return;
    setPushBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await apiFetch("/api/lms/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint })
        });
      }
      setPushSubscribed(false);
      await loadReminders();
    } catch {
      setError("Could not turn off notifications on this device.");
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <div
      data-reveal
      className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 sm:p-7 shadow-xs space-y-4"
    >
      <div className="flex items-start gap-2.5 pb-3 border-b border-[#F7EDF9]">
        <Bell className="w-5 h-5 mt-0.5 shrink-0" style={{ color: accentHex }} />
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#303654]">Reminders</h2>
          <p className="text-xs text-[#645F80] mt-0.5">
            Choose which study nudges you want to receive.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {(
          [
            { key: "classes", label: "Class reminders (1 hour before live class)" },
            { key: "goal", label: "Weekly goal nudge (Thu–Sun evenings)" },
            { key: "streak", label: "Streak nudge (evening if not studied today)" }
          ] as const
        ).map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-[#303654]">{item.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings[item.key]}
              onClick={() => void toggleField(item.key)}
              className={`m-press relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                settings[item.key] ? "" : "bg-slate-300"
              }`}
              style={settings[item.key] ? { backgroundColor: accentHex } : undefined}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings[item.key] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}

        {settings.whatsappAvailable && (
          <div className="pt-2 border-t border-[#F7EDF9] space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-semibold text-[#303654]">
                WhatsApp reminders (class &amp; goal)
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.whatsapp}
                disabled={!settings.phoneOnFile}
                onClick={() => void toggleField("whatsapp")}
                className={`m-press relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  !settings.phoneOnFile
                    ? "opacity-50 cursor-not-allowed bg-slate-200"
                    : "cursor-pointer"
                } ${settings.whatsapp && settings.phoneOnFile ? "" : "bg-slate-300"}`}
                style={
                  settings.whatsapp && settings.phoneOnFile
                    ? { backgroundColor: accentHex }
                    : undefined
                }
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.whatsapp ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {!settings.phoneOnFile && (
              <p className="text-[11px] text-amber-800 font-semibold">
                Add your phone number in your account settings first.
              </p>
            )}
          </div>
        )}
      </div>

      {settings.push.publicKey && (
        <div className="pt-3 border-t border-[#F7EDF9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#645F80]">
            <strong className="text-[#303654]">Browser push notifications:</strong>{" "}
            {pushSubscribed ? "Enabled on this device" : "Not enabled on this device"}
            {isIosSafari && (
              <span className="block text-[11px] text-amber-800 mt-0.5">
                On iPhone, push works only after &ldquo;Add to Home Screen&rdquo;.
              </span>
            )}
          </div>
          {pushSubscribed ? (
            <button
              type="button"
              disabled={pushBusy}
              onClick={() => void handleDisablePush()}
              className="m-press self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#303654] hover:bg-slate-50 cursor-pointer disabled:opacity-60"
            >
              {pushBusy ? "Updating…" : "Turn off on this device"}
            </button>
          ) : (
            <button
              type="button"
              disabled={pushBusy}
              onClick={() => void handleEnablePush()}
              className="m-press self-start sm:self-auto px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: accentHex }}
            >
              {pushBusy ? "Enabling…" : "Allow notifications"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
