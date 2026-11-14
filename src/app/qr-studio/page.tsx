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
  BarChart3,
  Shuffle,
  Plus,
  Trash2,
  Users,
  Palette,
  Check,
  Church,
  Award,
  Layers
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

type CampaignCategory = "church" | "nysc" | "ambassador" | "meetup" | "partner" | "custom";

interface CustomGeneratedQR {
  id: string;
  title: string;
  userName: string;
  category: CampaignCategory;
  targetPath: string;
  color: string;
  dataUrl?: string;
  createdAt: string;
}

const RANDOM_PRESET_POOL = [
  {
    category: "church" as const,
    label: "Assemblies of God Youth Tech Seminar",
    userName: "Pastor Emmanuel",
    slug: "aog_youth_umuahia",
    target: "/subscriptions?course=web-dev",
    color: "#AE54C6"
  },
  {
    category: "church" as const,
    label: "St. Michael's Catholic Youth Tech Summit",
    userName: "Brother Jude (Youth President)",
    slug: "stmichaels_youth",
    target: "/subscriptions?course=ai-automation",
    color: "#303654"
  },
  {
    category: "church" as const,
    label: "Redeemed Christian Fellowship MOUAU Tech Drive",
    userName: "Sis. Chiamaka (RCF Academic Sec)",
    slug: "rcf_mouau_tech",
    target: "/courses",
    color: "#10B981"
  },
  {
    category: "nysc" as const,
    label: "NYSC ICT & Digital CDS Group",
    userName: "Corper Tobi (CDS President)",
    slug: "nysc_ict_umuahia_north",
    target: "/subscriptions?course=cybersecurity",
    color: "#10B981"
  },
  {
    category: "nysc" as const,
    label: "NYSC Skills Acquisition & Tech CDS Umudike",
    userName: "Corper Vivian (CDS Coordinator)",
    slug: "nysc_skills_umudike",
    target: "/subscriptions?course=web-dev",
    color: "#FD7E14"
  },
  {
    category: "ambassador" as const,
    label: "MOUAU Student Ambassador Referral",
    userName: "Ambassador Chinedu (CS Dept)",
    slug: "amb_chinedu_mouau",
    target: "/subscriptions?course=ai-automation",
    color: "#AE54C6"
  },
  {
    category: "ambassador" as const,
    label: "Abia State Poly Campus Referral Link",
    userName: "Ambassador Blessings (Engineering)",
    slug: "amb_blessings_abpoly",
    target: "/subscriptions?course=product-design",
    color: "#D6293E"
  },
  {
    category: "meetup" as const,
    label: "Abia Developers Circle Meetup",
    userName: "Dev Lead Obinna",
    slug: "dev_circle_umuahia",
    target: "/sandbox",
    color: "#303654"
  },
  {
    category: "partner" as const,
    label: "State Youth Empowerment Initiative",
    userName: "Director Kalu (Partner Liaison)",
    slug: "youth_empowerment_initiative",
    target: "/courses",
    color: "#FD7E14"
  }
];

const TARGET_DESTINATIONS = [
  { label: "All Courses Catalog", path: "/courses" },
  { label: "Full-Stack Web Dev", path: "/subscriptions?course=web-dev" },
  { label: "AI & Automation", path: "/subscriptions?course=ai-automation" },
  { label: "Product Design (UI/UX)", path: "/subscriptions?course=product-design" },
  { label: "Cybersecurity Defense", path: "/subscriptions?course=cybersecurity" },
  { label: "Code Sandbox Playground", path: "/sandbox" },
  { label: "Admissions Landing", path: "/" },
  { label: "Custom Link", path: "custom" }
];

const COLOR_PALETTE = [
  { name: "Royal Purple", hex: "#AE54C6" },
  { name: "Deep Navy", hex: "#303654" },
  { name: "Forest Emerald", hex: "#10B981" },
  { name: "Amber Orange", hex: "#FD7E14" },
  { name: "Crimson Red", hex: "#D6293E" }
];

const CATEGORY_META: Record<CampaignCategory, { label: string; badgeVariant: "purple" | "gold" | "dark" | "green"; icon: typeof Church }> = {
  church: { label: "Church Youth Seminar", badgeVariant: "purple", icon: Church },
  nysc: { label: "NYSC CDS Group", badgeVariant: "gold", icon: Award },
  ambassador: { label: "Student Ambassador", badgeVariant: "green", icon: Users },
  meetup: { label: "Tech Meetup", badgeVariant: "dark", icon: Sparkles },
  partner: { label: "Partner NGO", badgeVariant: "gold", icon: Layers },
  custom: { label: "Custom Campaign", badgeVariant: "purple", icon: QrCode }
};

export default function QRStudioPage() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3001");
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Builder State
  const [customLabel, setCustomLabel] = useState("St. Michael's Catholic Youth Tech Summit");
  const [customUserName, setCustomUserName] = useState("Brother Jude (Youth President)");
  const [customCategory, setCustomCategory] = useState<CampaignCategory>("church");
  const [customPath, setCustomPath] = useState("/subscriptions?course=web-dev&utm_source=church_youth_fest&utm_medium=custom_qr&utm_campaign=oct2026");
  const [customColor, setCustomColor] = useState("#AE54C6");
  const [customQrUrl, setCustomQrUrl] = useState<string>("");
  const [savedQRs, setSavedQRs] = useState<CustomGeneratedQR[]>([]);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
      // Load saved custom QR codes from localStorage if present
      try {
        const stored = localStorage.getItem("bems_custom_qrs_v2");
        if (stored) {
          setSavedQRs(JSON.parse(stored));
        } else {
          // Pre-populate with default initial sample cards
          const initialSamples: CustomGeneratedQR[] = [
            {
              id: "sample-church",
              title: "Assemblies of God Youth Tech Seminar",
              userName: "Pastor Emmanuel",
              category: "church",
              targetPath: "/subscriptions?course=web-dev&utm_source=aog_youth_seminar&utm_medium=custom_qr&utm_campaign=oct2026",
              color: "#AE54C6",
              createdAt: "Active Campaign"
            },
            {
              id: "sample-nysc",
              title: "NYSC ICT & Digital CDS Group",
              userName: "Corper Tobi (CDS President)",
              category: "nysc",
              targetPath: "/subscriptions?course=cybersecurity&utm_source=nysc_cds_umuahia&utm_medium=custom_qr&utm_campaign=oct2026",
              color: "#10B981",
              createdAt: "Active Campaign"
            },
            {
              id: "sample-ambassador",
              title: "MOUAU Student Ambassador Referral",
              userName: "Ambassador Chinedu (CS Dept)",
              category: "ambassador",
              targetPath: "/courses?utm_source=amb_chinedu_mouau&utm_medium=custom_qr&utm_campaign=oct2026",
              color: "#303654",
              createdAt: "Active Campaign"
            }
          ];
          setSavedQRs(initialSamples);
        }
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  // Generate preset QR codes
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

  // Generate active custom QR code
  useEffect(() => {
    const fullUrl = customPath.startsWith("http")
      ? customPath
      : `${baseUrl}${customPath.startsWith("/") ? "" : "/"}${customPath}`;
    QRCode.toDataURL(fullUrl, {
      width: 360,
      margin: 2,
      color: { dark: customColor, light: "#FFFFFF" }
    })
      .then(setCustomQrUrl)
      .catch(() => null);
  }, [baseUrl, customPath, customColor]);

  // Render QR data URLs for saved items
  useEffect(() => {
    let active = true;
    async function renderSavedQRs() {
      const updated = await Promise.all(
        savedQRs.map(async (item) => {
          if (item.dataUrl) return item;
          const fullUrl = item.targetPath.startsWith("http")
            ? item.targetPath
            : `${baseUrl}${item.targetPath.startsWith("/") ? "" : "/"}${item.targetPath}`;
          try {
            const dataUrl = await QRCode.toDataURL(fullUrl, {
              width: 360,
              margin: 2,
              color: { dark: item.color || "#303654", light: "#FFFFFF" }
            });
            return { ...item, dataUrl };
          } catch {
            return item;
          }
        })
      );
      if (active) setSavedQRs(updated);
    }
    if (savedQRs.some((s) => !s.dataUrl)) {
      renderSavedQRs();
    }
    return () => {
      active = false;
    };
  }, [baseUrl, savedQRs]);

  const handleCopyLink = (id: string, url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateRandom = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_PRESET_POOL.length);
    const preset = RANDOM_PRESET_POOL[randomIndex];
    const randomToken = Math.random().toString(36).substring(2, 6);
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].hex;

    setCustomCategory(preset.category);
    setCustomLabel(`${preset.label} [${randomToken.toUpperCase()}]`);
    setCustomUserName(preset.userName);
    setCustomColor(preset.color || randomColor);

    const separator = preset.target.includes("?") ? "&" : "?";
    const generatedPath = `${preset.target}${separator}utm_source=${preset.slug}_${randomToken}&utm_medium=custom_qr&utm_campaign=oct2026&ref=${randomToken}`;
    setCustomPath(generatedPath);
  };

  const handleSelectPresetDestination = (baseDestination: string) => {
    if (baseDestination === "custom") {
      setCustomPath("https://");
      return;
    }
    const cleanSlug = customLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "custom";
    const separator = baseDestination.includes("?") ? "&" : "?";
    setCustomPath(`${baseDestination}${separator}utm_source=${cleanSlug}&utm_medium=custom_qr&utm_campaign=oct2026`);
  };

  const handleSaveToGallery = async () => {
    const fullUrl = customPath.startsWith("http")
      ? customPath
      : `${baseUrl}${customPath.startsWith("/") ? "" : "/"}${customPath}`;
    try {
      const dataUrl = await QRCode.toDataURL(fullUrl, {
        width: 360,
        margin: 2,
        color: { dark: customColor, light: "#FFFFFF" }
      });
      const newItem: CustomGeneratedQR = {
        id: `qr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: customLabel.trim() || "Untitled Campaign",
        userName: customUserName.trim() || "Attributed User",
        category: customCategory,
        targetPath: customPath,
        color: customColor,
        dataUrl,
        createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      };
      const nextList = [newItem, ...savedQRs];
      setSavedQRs(nextList);
      try {
        localStorage.setItem("bems_custom_qrs_v2", JSON.stringify(nextList));
      } catch {
        // ignore
      }
      setIsSavedFeedback(true);
      setTimeout(() => setIsSavedFeedback(false), 2200);
    } catch {
      // ignore
    }
  };

  const handleDeleteSavedQR = (id: string) => {
    const filtered = savedQRs.filter((item) => item.id !== id);
    setSavedQRs(filtered);
    try {
      localStorage.setItem("bems_custom_qrs_v2", JSON.stringify(filtered));
    } catch {
      // ignore
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
              className="bg-white text-[#303654] hover:text-[#AE54C6] hover:bg-[#FAF8FF] hover:border-[#AE54C6] font-bold text-xs shadow-xs"
            >
              <Printer className="w-4 h-4 mr-1.5 text-[#AE54C6]" /> Print QR Sheet
            </Button>
            <Link href="/admin?tab=analytics">
              <Button variant="purple" size="sm" className="text-xs font-bold shadow-md">
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

        {/* ================================================================= */}
        {/* DYNAMIC MULTI-USER CAMPAIGN QR BUILDER                            */}
        {/* ================================================================= */}
        <div className="print:hidden bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F1E2F5]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#AE54C6] mb-1">
                <Sparkles className="w-4 h-4" /> Custom Campaign QR Builder
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#303654]">
                Create a Custom Attribution QR Code
              </h2>
              <p className="text-xs text-[#645F80] mt-1 max-w-2xl leading-relaxed">
                Need a special QR code for a church youth seminar, NYSC CDS group, or student ambassador referral link? Enter the label, target path, or randomize below.
              </p>
            </div>

            {/* Quick Random Generator Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateRandom}
                className="gap-2 border-[#AE54C6] text-[#AE54C6] hover:bg-[#FAF8FF] font-extrabold text-xs shadow-xs"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Randomize / New Campaign</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Category Quick Chips */}
              <div>
                <label className="block text-xs font-bold text-[#303654] mb-2">
                  Campaign / Audience Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["church", "nysc", "ambassador", "meetup", "partner", "custom"] as CampaignCategory[]).map((cat) => {
                    const isSelected = customCategory === cat;
                    const meta = CATEGORY_META[cat];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCustomCategory(cat)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#303654] text-white shadow-xs"
                            : "bg-[#FAF8FF] text-[#645F80] border border-[#F1E2F5] hover:border-[#AE54C6]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campaign Label & User/Organizer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1">
                    Campaign Label
                  </label>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="e.g., St. Michael's Youth Tech Summit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] text-xs text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#303654] mb-1">
                    User / Ambassador / Organizer Name
                  </label>
                  <input
                    type="text"
                    value={customUserName}
                    onChange={(e) => setCustomUserName(e.target.value)}
                    placeholder="e.g., Pastor Emmanuel or Corper Tobi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] text-xs text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30 font-medium"
                  />
                </div>
              </div>

              {/* Target Feature / Destination Quick Pickers */}
              <div>
                <label className="block text-xs font-bold text-[#303654] mb-2">
                  Target Website Feature / Course Destination
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {TARGET_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.path}
                      type="button"
                      onClick={() => handleSelectPresetDestination(dest.path)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#FAF8FF] text-[#645F80] border border-[#F1E2F5] hover:bg-white hover:border-[#AE54C6] cursor-pointer"
                    >
                      {dest.label}
                    </button>
                  ))}
                </div>
                <label className="block text-[11px] text-[#645F80] mb-1">
                  Target Path or Full URL (with tracking parameters):
                </label>
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  placeholder="/subscriptions?course=web-dev&utm_source=custom_campaign"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] text-xs font-mono text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30"
                />
              </div>

              {/* QR Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-[#303654] mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#AE54C6]" />
                  <span>QR Theme Color (300 DPI Contrast)</span>
                </label>
                <div className="flex items-center gap-3">
                  {COLOR_PALETTE.map((c) => {
                    const isSelected = customColor === c.hex;
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setCustomColor(c.hex)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? "border-slate-800 bg-slate-50 ring-2 ring-slate-400"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[11px] text-[#303654]">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Live QR Preview Card */}
            <div className="lg:col-span-5 bg-[#FAF8FF] rounded-3xl border border-[#F1E2F5] p-6 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={CATEGORY_META[customCategory].badgeVariant}>
                  {CATEGORY_META[customCategory].label}
                </Badge>
                {customUserName && (
                  <span className="text-[11px] text-[#645F80] font-medium flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#AE54C6]" />
                    {customUserName}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-black text-[#303654] mb-3">
                {customLabel || "Custom Campaign QR"}
              </h3>

              {customQrUrl ? (
                <div className="bg-white p-3.5 rounded-2xl border border-[#F1E2F5] shadow-sm mb-3">
                  <img
                    src={customQrUrl}
                    alt={customLabel}
                    className="w-48 h-48 rounded-xl object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-white border border-[#F1E2F5] flex items-center justify-center text-xs text-[#8580A3] mb-3">
                  Generating custom QR…
                </div>
              )}

              <code className="text-[10px] font-mono text-[#645F80] bg-white px-3 py-1.5 rounded-lg border border-[#F1E2F5] max-w-full truncate mb-4">
                {customPath.startsWith("http") ? customPath : `${baseUrl}${customPath.startsWith("/") ? "" : "/"}${customPath}`}
              </code>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-2 w-full">
                  {customQrUrl && (
                    <a
                      href={customQrUrl}
                      download={`bems-${customLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`}
                      className="flex-1"
                    >
                      <Button variant="purple" size="sm" className="w-full text-xs gap-1.5 shadow-xs">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PNG</span>
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink("custom-active", customPath)}
                    className="text-xs gap-1 px-3"
                  >
                    {copiedId === "custom-active" ? (
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
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToGallery}
                  className="w-full text-xs font-bold gap-1.5 border-[#AE54C6] text-[#AE54C6] hover:bg-[#F7EDF9]"
                >
                  {isSavedFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Added to Campaign Gallery!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save to Campaign Codes Gallery</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* GENERATED CAMPAIGN & AMBASSADOR QR GALLERY                        */}
        {/* ================================================================= */}
        {savedQRs.length > 0 && (
          <div className="print:hidden space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[#303654] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#AE54C6]" />
                  <span>Generated Multi-User Campaign QR Gallery</span>
                </h3>
                <p className="text-xs text-[#645F80]">
                  Saved campaign codes with individualized attribution tags for seminars, NYSC groups, and student ambassadors.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Clear all custom generated campaign QR codes from your local gallery?")) {
                    setSavedQRs([]);
                    try {
                      localStorage.removeItem("bems_custom_qrs_v2");
                    } catch {
                      // ignore
                    }
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Clear Gallery
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedQRs.map((item) => {
                const fullUrl = item.targetPath.startsWith("http")
                  ? item.targetPath
                  : `${baseUrl}${item.targetPath.startsWith("/") ? "" : "/"}${item.targetPath}`;
                const isCopied = copiedId === item.id;
                const meta = CATEGORY_META[item.category] || CATEGORY_META.custom;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-[#F1E2F5] p-5 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                        <span className="text-[10.5px] text-[#8580A3]">{item.createdAt}</span>
                      </div>
                      <h4 className="text-sm font-black text-[#303654]">{item.title}</h4>
                      {item.userName && (
                        <p className="text-xs text-[#AE54C6] font-semibold mt-0.5 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{item.userName}</span>
                        </p>
                      )}
                    </div>

                    <div className="bg-[#FAF8FF] rounded-2xl border border-[#F1E2F5] p-3 flex flex-col items-center justify-center">
                      {item.dataUrl ? (
                        <img
                          src={item.dataUrl}
                          alt={item.title}
                          className="w-36 h-36 rounded-xl bg-white p-2 border border-[#F1E2F5] shadow-xs"
                        />
                      ) : (
                        <div className="w-36 h-36 rounded-xl bg-white flex items-center justify-center text-xs text-[#8580A3]">
                          Rendering…
                        </div>
                      )}
                      <code className="mt-2 text-[9.5px] font-mono text-[#645F80] bg-white px-2 py-0.5 rounded border border-[#F1E2F5] max-w-full truncate">
                        {fullUrl}
                      </code>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {item.dataUrl && (
                        <a
                          href={item.dataUrl}
                          download={`bems-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`}
                          className="flex-1"
                        >
                          <Button variant="purple" size="sm" className="w-full text-xs gap-1">
                            <Download className="w-3 h-3" />
                            <span>PNG</span>
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
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="px-2">
                          <ExternalLink className="w-3 h-3 text-[#AE54C6]" />
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSavedQR(item.id)}
                        className="px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete this QR"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
