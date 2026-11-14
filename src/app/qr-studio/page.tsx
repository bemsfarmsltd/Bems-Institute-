"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { useLMS } from "@/context/LMSContext";
import { apiFetch } from "@/lib/api-client";
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
  BarChart3,
  Plus,
  Edit3,
  Power,
  AlertCircle,
  Check,
  Loader2,
  X,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Users,
  CreditCard
} from "lucide-react";

interface CampaignQR {
  id: string;
  title: string;
  placement: string;
  badge: string;
  path: string;
  description: string;
}

export interface QrCampaignItem {
  id: string;
  code: string;
  label: string;
  target: string;
  active: boolean;
  source: string;
  shortUrl: string;
  scans: number;
  registrations: number;
  paidRegistrations: number;
  createdAt: string;
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

const DESTINATION_QUICK_PICKERS = [
  { label: "All Courses Catalog", path: "/courses" },
  { label: "Full-Stack Web Dev", path: "/subscriptions?course=web-dev" },
  { label: "AI & Automation", path: "/subscriptions?course=ai-automation" },
  { label: "Product Design", path: "/subscriptions?course=product-design" },
  { label: "Cybersecurity Defense", path: "/subscriptions?course=cybersecurity" },
  { label: "Admissions Checkout", path: "/subscriptions" },
  { label: "Code Sandbox Playground", path: "/sandbox" },
  { label: "Homepage", path: "/" }
];

const COLOR_PALETTE = [
  { name: "Royal Purple", hex: "#AE54C6" },
  { name: "Deep Navy", hex: "#303654" },
  { name: "Forest Emerald", hex: "#10B981" },
  { name: "Crimson Red", hex: "#D6293E" },
  { name: "BEMS Gold", hex: "#FD7E14" }
];

export default function QRStudioPage() {
  const { user, isHydrated } = useLMS();
  const isAdmin = isHydrated && user?.role === "ADMIN";

  const [baseUrl, setBaseUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  );
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin Saved Campaigns State
  const [savedCampaigns, setSavedCampaigns] = useState<QrCampaignItem[]>([]);
  const [campaignQrUrls, setCampaignQrUrls] = useState<Record<string, string>>({});
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Custom Builder Form State
  const [newLabel, setNewLabel] = useState("");
  const [newTarget, setNewTarget] = useState("/subscriptions?course=web-dev");
  const [selectedColor, setSelectedColor] = useState("#AE54C6");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [livePreviewQr, setLivePreviewQr] = useState<string>("");

  // Edit Target Inline State
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [editTargetValue, setEditTargetValue] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Toggle Active State
  const [togglingActiveId, setTogglingActiveId] = useState<string | null>(null);

  // Single QR Card Print Modal Overlay
  const [printingCard, setPrintingCard] = useState<{
    title: string;
    shortUrl: string;
    dataUrl?: string;
    target?: string;
  } | null>(null);

  // 1. Generate Preset QR Codes
  useEffect(() => {
    let active = true;
    async function generateAllPresets() {
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
    generateAllPresets();
    return () => {
      active = false;
    };
  }, [baseUrl]);

  // 2. Fetch Saved Campaigns (Admin-only)
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    apiFetch("/api/admin/qr-campaigns")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (active && Array.isArray(data.campaigns)) {
          setSavedCampaigns(data.campaigns);
        }
      })
      .catch(() => {
        // handled
      });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  // 3. Generate QR for Saved Campaigns (Encoding shortUrl strictly)
  useEffect(() => {
    let active = true;
    async function generateSavedCampaignQrs() {
      const nextMap: Record<string, string> = {};
      for (const c of savedCampaigns) {
        const urlToEncode = c.shortUrl || `${baseUrl}/q/${c.code}`;
        try {
          nextMap[c.id] = await QRCode.toDataURL(urlToEncode, {
            width: 360,
            margin: 2,
            color: { dark: selectedColor || "#303654", light: "#FFFFFF" }
          });
        } catch {
          // ignore
        }
      }
      if (active) setCampaignQrUrls(nextMap);
    }
    if (savedCampaigns.length > 0) {
      generateSavedCampaignQrs();
    }
    return () => {
      active = false;
    };
  }, [savedCampaigns, baseUrl, selectedColor]);

  // 4. Live Preview QR for Builder Box
  useEffect(() => {
    let active = true;
    const samplePreviewUrl = `${baseUrl}/q/demo-qr`;
    QRCode.toDataURL(samplePreviewUrl, {
      width: 360,
      margin: 2,
      color: { dark: selectedColor, light: "#FFFFFF" }
    })
      .then((url) => {
        if (active) setLivePreviewQr(url);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, [baseUrl, selectedColor]);

  // Handlers
  const handleCopyLink = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefreshCampaigns = async () => {
    if (!isAdmin) return;
    setLoadingCampaigns(true);
    try {
      const res = await apiFetch("/api/admin/qr-campaigns");
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.campaigns)) {
        setSavedCampaigns(data.campaigns);
      }
    } catch {
      // handled
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmedLabel = newLabel.trim();
    const trimmedTarget = newTarget.trim();

    if (!trimmedLabel) {
      setFormError("Please enter a campaign label (e.g. 'Youth seminar, March').");
      return;
    }
    if (!trimmedTarget) {
      setFormError("Please enter a target path or full URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/qr-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: trimmedLabel, target: trimmedTarget })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.campaign) {
        setSavedCampaigns((prev) => [data.campaign, ...prev]);
        setFormSuccess(`Campaign "${data.campaign.label}" created! Generated short URL: /q/${data.campaign.code}`);
        setNewLabel("");
      } else {
        // Show 400 error message as is per spec
        setFormError(data.error || "Failed to create campaign.");
      }
    } catch {
      setFormError("Network error while creating campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (campaign: QrCampaignItem) => {
    setEditingCampaignId(campaign.id);
    setEditTargetValue(campaign.target);
    setEditError(null);
  };

  const handleSaveEdit = async (campaignId: string) => {
    setEditError(null);
    setIsSavingEdit(true);
    try {
      const res = await apiFetch(`/api/admin/qr-campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: editTargetValue.trim() })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.campaign) {
        setSavedCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, target: data.campaign.target } : c))
        );
        setEditingCampaignId(null);
      } else {
        setEditError(data.error || "Failed to update target.");
      }
    } catch {
      setEditError("Network error while updating target.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActive = async (campaign: QrCampaignItem) => {
    const nextState = !campaign.active;
    setTogglingActiveId(campaign.id);
    try {
      const res = await apiFetch(`/api/admin/qr-campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextState })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.campaign) {
        setSavedCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? { ...c, active: data.campaign.active } : c))
        );
      }
    } catch {
      // ignore
    } finally {
      setTogglingActiveId(null);
    }
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
              className="bg-white text-[#303654] hover:text-[#AE54C6] hover:bg-[#FAF8FF] hover:border-[#AE54C6] font-bold text-xs shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-1.5 text-[#AE54C6]" /> Print QR Sheet
            </Button>
            <Link href="/admin?tab=analytics">
              <Button variant="purple" size="sm" className="text-xs font-bold shadow-md cursor-pointer">
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
              className="text-xs shrink-0 cursor-pointer"
            >
              Use Production URL
            </Button>
          </div>
        </div>

        {/* Preset Campaign QR Grid (Official PRD Presets) */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-black text-[#303654] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#AE54C6]" />
              <span>Official Campus &amp; City Flex Banners</span>
            </h2>
            <p className="text-xs text-[#645F80]">
              Permanent attribution checkpoints across MOUAU Gate, Umuahia Town Center, and department noticeboards.
            </p>
          </div>

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
                      /* eslint-disable-next-line @next/next/no-img-element */
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
                        <Button variant="purple" size="sm" className="w-full text-xs gap-1.5 cursor-pointer">
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PNG</span>
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(item.id, fullUrl)}
                      className="text-xs gap-1 cursor-pointer"
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPrintingCard({
                          title: item.title,
                          shortUrl: fullUrl,
                          dataUrl
                        })
                      }
                      className="px-2.5 cursor-pointer"
                      title="Print single QR card"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#303654]" />
                    </Button>
                    <Link href={item.path} title="Test destination route">
                      <Button variant="outline" size="sm" className="px-2.5 cursor-pointer">
                        <ExternalLink className="w-3.5 h-3.5 text-[#AE54C6]" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* ADMIN-ONLY SECTION: CUSTOM RE-POINTABLE CAMPAIGN QR BUILDER & LIST */}
        {/* ================================================================= */}
        {isAdmin ? (
          <div className="space-y-10">
            {/* Custom Campaign QR Generator Card */}
            <div className="print:hidden bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#AE54C6] mb-1">
                      <Sparkles className="w-4 h-4" /> Custom Campaign QR Builder
                    </div>
                    <h2 className="text-xl font-black text-[#303654]">
                      Create a Dynamic, Re-pointable Attribution QR Code
                    </h2>
                    <p className="text-xs text-[#645F80] leading-relaxed mt-1">
                      Need a special QR code for a youth seminar, NYSC CDS project, or campus ambassador? Each campaign generates a dynamic short link (<code className="font-mono text-[#AE54C6]">/q/&lt;code&gt;</code>) that counts scans and registrations, allowing you to re-point or switch off printed banners at any time.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleCreateCampaign} className="space-y-4">
                    {formError && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>{formError}</span>
                      </div>
                    )}
                    {formSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>{formSuccess}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#303654] mb-1">
                          Campaign Label
                        </label>
                        <input
                          type="text"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="e.g. Youth seminar, March"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] text-xs text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#303654] mb-1">
                          Target Path or Full URL
                        </label>
                        <input
                          type="text"
                          value={newTarget}
                          onChange={(e) => setNewTarget(e.target.value)}
                          placeholder="/subscriptions?course=web-dev"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] text-xs font-mono text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30 bg-white"
                        />
                      </div>
                    </div>

                    {/* Destination Quick-Pickers */}
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#645F80] mb-1.5">
                        Destination Quick-Pickers
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {DESTINATION_QUICK_PICKERS.map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => setNewTarget(chip.path)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                              newTarget === chip.path
                                ? "bg-[#AE54C6] text-white border-[#AE54C6]"
                                : "bg-[#FAF8FF] text-[#645F80] border-[#F1E2F5] hover:bg-[#F1E2F5] hover:text-[#303654]"
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colour Palette Swatches */}
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#645F80] mb-1.5">
                        QR Code Colour Palette
                      </span>
                      <div className="flex items-center gap-3">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => setSelectedColor(color.hex)}
                            title={color.name}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                              selectedColor === color.hex ? "scale-115 ring-2 ring-offset-2 ring-[#AE54C6]" : "hover:scale-105"
                            }`}
                            style={{ backgroundColor: color.hex }}
                          >
                            {selectedColor === color.hex && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        ))}
                        <span className="text-xs text-[#8580A3] font-medium ml-1">
                          {COLOR_PALETTE.find((c) => c.hex === selectedColor)?.name}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="purple"
                        disabled={isSubmitting}
                        className="text-xs font-bold gap-1.5 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating Campaign…</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Generate &amp; Save Campaign QR</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Live Preview Box */}
                <div className="lg:col-span-5 bg-[#FAF8FF] rounded-2xl border border-[#F1E2F5] p-6 flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase text-[#AE54C6] mb-2">
                    <Eye className="w-3.5 h-3.5" /> Live QR Preview
                  </div>
                  <span className="text-sm font-black text-[#303654] mb-3">
                    {newLabel.trim() || "Youth seminar, March"}
                  </span>

                  {livePreviewQr ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={livePreviewQr}
                      alt="Campaign QR Live Preview"
                      className="w-44 h-44 rounded-xl bg-white p-2 border border-[#F1E2F5] shadow-xs mb-3"
                    />
                  ) : (
                    <div className="w-44 h-44 rounded-xl bg-white flex items-center justify-center text-xs text-[#8580A3] mb-3">
                      Loading Preview…
                    </div>
                  )}

                  <div className="w-full bg-white rounded-xl border border-[#F1E2F5] p-3 text-left space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#8580A3] block">Target Destination</span>
                    <p className="text-xs font-mono text-[#303654] truncate">{newTarget || "/"}</p>
                    <span className="text-[10px] text-[#AE54C6] font-semibold block pt-1">
                      Dynamic Shortlink: {baseUrl}/q/&lt;8-char-code&gt;
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Campaigns Gallery */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#303654] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#AE54C6]" />
                    <span>Saved Custom Campaigns</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#AE54C6]/10 text-[#AE54C6]">
                      {savedCampaigns.length}
                    </span>
                  </h2>
                  <p className="text-xs text-[#645F80]">
                    Live re-pointable campaign codes with real-time scan, signup, and tuition payment tracking.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshCampaigns}
                  disabled={loadingCampaigns}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCampaigns ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
              </div>

              {savedCampaigns.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#F1E2F5] p-10 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] flex items-center justify-center text-[#AE54C6]">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#303654]">No custom campaigns created yet</h3>
                  <p className="text-xs text-[#645F80] max-w-md">
                    Enter a label (e.g. &ldquo;Youth seminar, March&rdquo;) and target destination in the builder above to generate your first re-pointable attribution QR code.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedCampaigns.map((camp) => {
                    const qrUrl = campaignQrUrls[camp.id];
                    const isCopied = copiedId === camp.id;
                    const isEditing = editingCampaignId === camp.id;
                    const encodedUrl = camp.shortUrl || `${baseUrl}/q/${camp.code}`;

                    return (
                      <div
                        key={camp.id}
                        className={`bg-white rounded-3xl border transition-shadow p-6 shadow-xs flex flex-col justify-between gap-5 ${
                          camp.active ? "border-[#F1E2F5]" : "border-slate-200 opacity-80"
                        }`}
                      >
                        <div>
                          {/* Status and Code Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <Badge variant={camp.active ? "green" : "dark"}>
                              {camp.active ? "Active" : "Switched Off"}
                            </Badge>
                            <span className="font-mono text-xs font-bold text-[#AE54C6] bg-[#FAF8FF] px-2 py-0.5 rounded-md border border-[#F1E2F5]">
                              {camp.code}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-[#303654]">{camp.label}</h3>

                          {/* Target destination with inline editor */}
                          <div className="mt-2 text-xs">
                            {isEditing ? (
                              <div className="space-y-2 bg-[#FAF8FF] p-3 rounded-xl border border-[#F1E2F5]">
                                <span className="font-bold text-[#303654] text-[11px] block">
                                  Update Target Destination:
                                </span>
                                <input
                                  type="text"
                                  value={editTargetValue}
                                  onChange={(e) => setEditTargetValue(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                                />
                                {editError && (
                                  <p className="text-[11px] font-bold text-red-600">{editError}</p>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="purple"
                                    onClick={() => handleSaveEdit(camp.id)}
                                    disabled={isSavingEdit}
                                    className="text-xs h-7 px-2.5 cursor-pointer"
                                  >
                                    {isSavingEdit ? "Saving…" : "Save Target"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingCampaignId(null)}
                                    className="text-xs h-7 px-2 cursor-pointer"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2 text-[#645F80]">
                                <span className="truncate font-mono" title={camp.target}>
                                  Target: {camp.target}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(camp)}
                                  className="text-[11px] font-bold text-[#AE54C6] hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" /> Edit
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Metrics row */}
                          <div className="grid grid-cols-3 gap-2 mt-4 bg-[#FAF8FF] p-2.5 rounded-xl border border-[#F1E2F5] text-center">
                            <div>
                              <span className="text-[10px] text-[#8580A3] font-bold block flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3" /> Scans
                              </span>
                              <span className="text-sm font-black text-[#303654]">{camp.scans || 0}</span>
                            </div>
                            <div className="border-x border-[#F1E2F5]">
                              <span className="text-[10px] text-[#8580A3] font-bold block flex items-center justify-center gap-1">
                                <Users className="w-3 h-3" /> Signups
                              </span>
                              <span className="text-sm font-black text-[#303654]">{camp.registrations || 0}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#8580A3] font-bold block flex items-center justify-center gap-1">
                                <CreditCard className="w-3 h-3" /> Paid
                              </span>
                              <span className="text-sm font-black text-emerald-600">
                                {camp.paidRegistrations || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* QR Preview Canvas (encodes shortUrl strictly) */}
                        <div className="bg-[#FAF8FF] rounded-2xl border border-[#F1E2F5] p-4 flex flex-col items-center justify-center">
                          {qrUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={qrUrl}
                              alt={camp.label}
                              className="w-44 h-44 rounded-xl bg-white p-2 border border-[#F1E2F5] shadow-xs"
                            />
                          ) : (
                            <div className="w-44 h-44 rounded-xl bg-white flex items-center justify-center text-xs text-[#8580A3]">
                              Generating QR…
                            </div>
                          )}
                          <code className="mt-3 text-[10px] font-mono text-[#AE54C6] bg-white px-2.5 py-1 rounded-lg border border-[#F1E2F5] max-w-full truncate">
                            {encodedUrl}
                          </code>
                        </div>

                        {/* Actions */}
                        <div className="print:hidden space-y-2">
                          <div className="flex items-center gap-2">
                            {qrUrl && (
                              <a
                                href={qrUrl}
                                download={`bems-campaign-${camp.code}-qr.png`}
                                className="flex-1"
                              >
                                <Button variant="purple" size="sm" className="w-full text-xs gap-1.5 cursor-pointer">
                                  <Download className="w-3.5 h-3.5" />
                                  <span>PNG</span>
                                </Button>
                              </a>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(camp.id, encodedUrl)}
                              className="text-xs gap-1 cursor-pointer"
                            >
                              {isCopied ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setPrintingCard({
                                  title: camp.label,
                                  shortUrl: encodedUrl,
                                  dataUrl: qrUrl,
                                  target: camp.target
                                })
                              }
                              className="px-2.5 cursor-pointer"
                              title="Print single QR card"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#303654]" />
                            </Button>
                          </div>

                          {/* Switch Off / Activate Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(camp)}
                            disabled={togglingActiveId === camp.id}
                            className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                              camp.active
                                ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>
                              {togglingActiveId === camp.id
                                ? "Updating…"
                                : camp.active
                                ? "Switch off campaign"
                                : "Reactivate campaign"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Public Visitor Information for Custom Codes */
          <div className="print:hidden bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#AE54C6] mb-1">
                <Sparkles className="w-4 h-4" /> Ambassador &amp; Community QR Codes
              </div>
              <h3 className="text-lg font-black text-[#303654]">
                Need a Custom Seminar or Referral QR Code?
              </h3>
              <p className="text-xs text-[#645F80] max-w-xl">
                BEMS campus ambassadors, church leaders, and NYSC CDS coordinators can request custom-tracked physical banner codes through our admissions office.
              </p>
            </div>
            <Link href="/login?returnUrl=/qr-studio">
              <Button variant="outline" size="sm" className="text-xs font-bold shrink-0 cursor-pointer">
                <span>Staff Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#AE54C6]" />
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* SINGLE QR CARD PRINT MODAL OVERLAY                                */}
      {/* ================================================================= */}
      {printingCard && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-black uppercase text-[#AE54C6]">Print Preview</span>
              <button
                type="button"
                onClick={() => setPrintingCard(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-black text-[#303654] mb-1">{printingCard.title}</h3>
            {printingCard.target && (
              <p className="text-xs text-[#645F80] mb-3 break-all">Target: {printingCard.target}</p>
            )}

            {printingCard.dataUrl && (
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={printingCard.dataUrl}
                  alt={printingCard.title}
                  className="w-52 h-52 object-contain"
                />
              </div>
            )}

            <code className="text-xs font-mono text-[#303654] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 mb-5 break-all">
              {printingCard.shortUrl}
            </code>

            <div className="w-full flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrintingCard(null)}
                className="flex-1 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="purple"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 text-xs gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
