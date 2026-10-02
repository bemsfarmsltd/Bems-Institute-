"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Download,
  Copy,
  CheckCircle2,
  Printer,
  Sparkles,
  ExternalLink,
  MapPin,
  BarChart3
} from "lucide-react";

interface CampaignQR {
  id: string;
  title: string;
  placement: string;
  badge: string;
  path: string;
  description: string;
}

const CAMPAIGN_PRESETS: CampaignQR[] = [
  {
    id: "banner-a",
    title: "Banner A — MOUAU Main Gate",
    placement: "Michael Okpara University Gate, Umudike",
    badge: "Outdoor Flex Banner",
    path: "/?utm_source=banner_a&utm_medium=outdoor_qr&utm_campaign=oct2026",
    description: "Tracks student scans from the MOUAU main gate billboard directly into the October 2026 cohort funnel."
  },
  {
    id: "banner-b",
    title: "Banner B — Umuahia Town Center",
    placement: "Isi Gate / Bank Road Roundabout, Umuahia",
    badge: "Outdoor Street Banner",
    path: "/?utm_source=banner_b&utm_medium=outdoor_qr&utm_campaign=oct2026",
    description: "Tracks town-center commuter and NYSC corps member scans into the main accelerator landing page."
  },
  {
    id: "banner-c",
    title: "Banner C — LGA Secretariat",
    placement: "Umuahia LGA Secretariat, Government Layout",
    badge: "Outdoor Flex Banner",
    path: "/?utm_source=banner_c&utm_medium=outdoor_qr&utm_campaign=oct2026",
    description: "Tracks scans from the LGA Secretariat banner — the third of the PRD's three named physical locations (BEMS Hub, LGA Secretariat, MOUAU)."
  },
  {
    id: "track-web",
    title: "Full-Stack Web Development Flyer",
    placement: "Campus Handbills & Lab Posters",
    badge: "Direct Track QR",
    path: "/subscriptions?course=web-dev&utm_source=qr_flyer",
    description: "Deep-links directly to the Full-Stack Web Development enrollment checkout with Mr. Victor."
  },
  {
    id: "track-ai",
    title: "AI & Automation Direct Flyer",
    placement: "Tech Meetup & Department Noticeboards",
    badge: "Direct Track QR",
    path: "/subscriptions?course=ai-automation&utm_source=qr_flyer",
    description: "Deep-links directly to the AI & Workflow Automation enrollment checkout with Timi."
  },
  {
    id: "track-design",
    title: "Product Design (UI/UX) Direct Flyer",
    placement: "Creative Studio & Campus Noticeboards",
    badge: "Direct Track QR",
    path: "/subscriptions?course=product-design&utm_source=qr_flyer",
    description: "Deep-links directly to the Product Design (UI/UX) enrollment checkout with Temi."
  },
  {
    id: "track-cyber",
    title: "Cybersecurity & Ethical Hacking Flyer",
    placement: "Engineering & CS Faculty Boards",
    badge: "Direct Track QR",
    path: "/subscriptions?course=cybersecurity&utm_source=qr_flyer",
    description: "Deep-links directly to the Cybersecurity & Network Defense enrollment checkout."
  }
];

export default function QRStudioPage() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3001");
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customPath, setCustomPath] = useState("/subscriptions?course=web-dev&utm_source=custom_banner");
  const [customLabel, setCustomLabel] = useState("Custom Campus Campaign");
  const [customQrUrl, setCustomQrUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function generateAll() {
      const nextMap: Record<string, string> = {};
      for (const item of CAMPAIGN_PRESETS) {
        const fullUrl = `${baseUrl}${item.path}`;
        try {
          nextMap[item.id] = await QRCode.toDataURL(fullUrl, {
            width: 360,
            margin: 2,
            color: { dark: "#303654", light: "#FFFFFF" }
          });
        } catch {
          // ignore
        }
      }
      if (active) setQrDataUrls(nextMap);
    }
    generateAll();
    return () => {
      active = false;
    };
  }, [baseUrl]);

  useEffect(() => {
    const fullUrl = customPath.startsWith("http")
      ? customPath
      : `${baseUrl}${customPath.startsWith("/") ? "" : "/"}${customPath}`;
    QRCode.toDataURL(fullUrl, {
      width: 360,
      margin: 2,
      color: { dark: "#303654", light: "#FFFFFF" }
    })
      .then(setCustomQrUrl)
      .catch(() => null);
  }, [baseUrl, customPath]);

  const handleCopyLink = (id: string, fullUrl: string) => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Header */}
      <div className="print:hidden bg-gradient-to-r from-[#303654] via-[#3E4569] to-[#303654] text-white py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple">GROWTH &amp; ATTRIBUTION</Badge>
              <Badge variant="gold">PRINT-READY 300 DPI</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2.5">
              <QrCode className="w-8 h-8 text-[#F4E0FA]" />
              <span>BEMS Banner &amp; Flyer QR Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#C6BDD3] mt-1 max-w-2xl">
              Generate high-contrast, UTM-tagged QR codes for physical flex banners across Umuahia &amp; MOUAU. Every scan attributes directly into the Admin Analytics Yield dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="border-white/20 text-white hover:bg-white/10 text-xs"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print QR Sheet
            </Button>
            <Link href="/admin?tab=analytics">
              <Button variant="purple" size="sm" className="text-xs shadow-md">
                <BarChart3 className="w-4 h-4 mr-1.5" /> View Scan Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* Base Domain Control */}
        <div className="print:hidden bg-white rounded-2xl border border-[#F1E2F5] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#AE54C6] block">
              Target Base Domain for Generated QR Codes
            </span>
            <p className="text-xs text-[#645F80]">
              Switch to your production domain before exporting PNGs for the print shop.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value.replace(/\/$/, ""))}
              className="w-full sm:w-72 px-3.5 py-2 rounded-xl border border-[#F1E2F5] text-xs font-mono text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBaseUrl("https://bemsinstitute.ng")}
              className="text-xs shrink-0"
            >
              Use Production URL
            </Button>
          </div>
        </div>

        {/* Preset Campaign QR Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAMPAIGN_PRESETS.map((item) => {
            const fullUrl = `${baseUrl}${item.path}`;
            const dataUrl = qrDataUrls[item.id];
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#F1E2F5] p-6 shadow-xs flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="purple">{item.badge}</Badge>
                    <span className="text-[11px] text-[#645F80] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#AE54C6]" />
                      {item.placement.split(",")[0]}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#303654]">{item.title}</h3>
                  <p className="text-xs text-[#645F80] mt-1 leading-relaxed">{item.description}</p>
                </div>

                {/* QR Preview Canvas */}
                <div className="bg-[#FAF8FF] rounded-2xl border border-[#F1E2F5] p-4 flex flex-col items-center justify-center">
                  {dataUrl ? (
                    <img
                      src={dataUrl}
                      alt={item.title}
                      className="w-44 h-44 rounded-xl bg-white p-2 border border-[#F1E2F5] shadow-xs"
                    />
                  ) : (
                    <div className="w-44 h-44 rounded-xl bg-white flex items-center justify-center text-xs text-[#8580A3]">
                      Generating QR…
                    </div>
                  )}
                  <code className="mt-3 text-[10px] font-mono text-[#645F80] bg-white px-2.5 py-1 rounded-lg border border-[#F1E2F5] max-w-full truncate">
                    {fullUrl}
                  </code>
                </div>

                {/* Actions */}
                <div className="print:hidden flex items-center gap-2">
                  {dataUrl && (
                    <a
                      href={dataUrl}
                      download={`bems-${item.id}-qr.png`}
                      className="flex-1"
                    >
                      <Button variant="purple" size="sm" className="w-full text-xs gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PNG</span>
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(item.id, fullUrl)}
                    className="text-xs gap-1"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>
                  <Link href={item.path} title="Test destination route">
                    <Button variant="outline" size="sm" className="px-2.5">
                      <ExternalLink className="w-3.5 h-3.5 text-[#AE54C6]" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Campaign QR Generator */}
        <div className="print:hidden bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#AE54C6]">
                <Sparkles className="w-4 h-4" /> Custom Campaign QR Builder
              </div>
              <h2 className="text-xl font-black text-[#303654]">
                Create a Custom Attribution QR Code
              </h2>
              <p className="text-xs text-[#645F80] leading-relaxed">
                Need a special QR code for a church youth seminar, NYSC CDS group, or student ambassador referral link? Enter the label and target path below.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1">
                    Campaign Label
                  </label>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] text-xs focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1">
                    Target Path or Full URL
                  </label>
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FAF8FF] rounded-2xl border border-[#F1E2F5] p-5 flex flex-col items-center text-center">
              <span className="text-xs font-extrabold text-[#303654] mb-2">{customLabel}</span>
              {customQrUrl && (
                <img
                  src={customQrUrl}
                  alt={customLabel}
                  className="w-40 h-40 rounded-xl bg-white p-2 border border-[#F1E2F5] shadow-xs mb-3"
                />
              )}
              {customQrUrl && (
                <a href={customQrUrl} download="bems-custom-campaign-qr.png">
                  <Button variant="purple" size="sm" className="text-xs gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download Custom QR PNG
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
