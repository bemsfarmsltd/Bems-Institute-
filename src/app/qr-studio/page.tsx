"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { COURSES } from "@/data/courses";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy, Check, ExternalLink } from "lucide-react";

const PRESET_SOURCES = [
  "MOUAU Campus Banner",
  "BEMS Hub Banner",
  "LGA Secretariat Banner",
  "Campus Handbill Flyer",
  "Digital Social Ad",
  "Direct Referral"
];

export default function QRStudioPage() {
  const [courseId, setCourseId] = useState<string>("all");
  const [source, setSource] = useState<string>(PRESET_SOURCES[0]);
  const [customSource, setCustomSource] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [origin, setOrigin] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const effectiveSource = source === "CUSTOM" ? customSource.trim() : source;

  const targetUrl = (() => {
    const params = new URLSearchParams();
    if (courseId !== "all") params.set("course", courseId);
    if (effectiveSource) params.set("source", effectiveSource);
    const query = params.toString();
    return `${origin || ""}/subscriptions${query ? `?${query}` : ""}`;
  })();

  useEffect(() => {
    if (!origin) return;
    let cancelled = false;

    QRCode.toDataURL(targetUrl, {
      width: 480,
      margin: 2,
      color: { dark: "#18143D", light: "#FFFFFF" }
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl("");
      });

    return () => {
      cancelled = true;
    };
  }, [targetUrl, origin]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  };

  const fileLabel = `bems-qr-${courseId}-${effectiveSource || "general"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <div className="bg-gradient-to-r from-[#18143D] via-[#241E56] to-[#18143D] text-white py-12 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="purple" className="mb-4">
            <QrCode className="w-3.5 h-3.5" /> BANNER QR STUDIO
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Generate Enrollment QR Codes
          </h1>
          <p className="text-sm text-[#A5A0C8] max-w-2xl">
            Create a trackable QR code for any roll-up banner, handbill, or campus flyer. Each
            code links straight to the tuition & enrollment page, tagged with the course and
            source so admissions can see which banner brought in each registration.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Config */}
          <div className="bg-white border border-[#E6E1F5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                Program / Track
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white font-medium"
              >
                <option value="all">All Programs (General Landing)</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                Banner / Placement Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white font-medium"
              >
                {PRESET_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="CUSTOM">Custom source…</option>
              </select>
            </div>

            {source === "CUSTOM" && (
              <div>
                <label className="block text-xs font-bold text-[#18143D] mb-1.5">
                  Custom Source Label
                </label>
                <input
                  type="text"
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  placeholder="e.g. Umuahia Tech Meetup Banner"
                  className="w-full px-4 py-3 rounded-xl border border-[#D1C9EB] focus:border-[#7928CA] focus:outline-hidden text-sm text-[#18143D] bg-white"
                />
              </div>
            )}

            <div className="pt-4 border-t border-[#F0EDF9]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#645F80] block mb-1.5">
                Destination Link
              </span>
              <div className="flex items-center gap-2 bg-[#FAF8FF] border border-[#E6E1F5] rounded-xl px-3 py-2.5">
                <ExternalLink className="w-3.5 h-3.5 text-[#7928CA] shrink-0" />
                <span className="text-xs font-mono text-[#18143D] break-all">
                  {targetUrl || "Loading…"}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="mt-2 w-full gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white border border-[#E6E1F5] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#645F80] mb-4">
              Live Preview
            </span>

            <div className="w-full max-w-[280px] aspect-square rounded-2xl border-2 border-dashed border-[#E6E1F5] bg-[#FAF8FF] flex items-center justify-center overflow-hidden">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Enrollment QR code" className="w-full h-full object-contain p-3" />
              ) : (
                <QrCode className="w-16 h-16 text-[#D1C9EB]" />
              )}
            </div>

            <p className="text-xs text-[#645F80] mt-4 max-w-xs">
              Print this code onto your roll-up banner or handbill. Anyone who scans it lands
              directly on the enrollment page for{" "}
              <strong className="text-[#18143D]">
                {courseId === "all" ? "all BEMS programs" : COURSES.find((c) => c.id === courseId)?.title}
              </strong>
              , tagged as <strong className="text-[#18143D]">{effectiveSource || "untagged"}</strong>.
            </p>

            <a
              href={qrDataUrl}
              download={`${fileLabel}.png`}
              className={`mt-6 w-full ${qrDataUrl ? "" : "pointer-events-none opacity-50"}`}
            >
              <Button variant="purple" className="w-full gap-1.5">
                <Download className="w-4 h-4" /> Download PNG
              </Button>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
