"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { InstructorConceptInsights } from "@/components/InstructorConceptInsights";
import {
  LayoutGrid,
  ShoppingBasket,
  HelpCircle,
  BarChart3,
  Users,
  Folder,
  Star,
  Edit3,
  Wallet,
  Settings,
  Trash2,
  LogOut,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUp,
  CheckCircle2,
  Award,
  Clock,
  Sparkles,
} from "lucide-react";

type InstructorSidebarTab =
  | "dashboard"
  | "courses"
  | "quiz"
  | "earnings"
  | "students"
  | "orders"
  | "reviews"
  | "profile"
  | "payouts"
  | "settings"
  | "delete-profile";

interface SellingCourseRow {
  id: string;
  title: string;
  selling: number;
  amount: string;
  period: string;
  thumbType: "sketch" | "bootstrap" | "ps" | "invision" | "angular";
}

const INITIAL_SELLING_COURSES: SellingCourseRow[] = [
  {
    id: "sc-1",
    title: "Building Scalable APIs with GraphQL",
    selling: 34,
    amount: "$125478",
    period: "9 months",
    thumbType: "sketch",
  },
  {
    id: "sc-2",
    title: "Bootstrap 5 From Scratch",
    selling: 45,
    amount: "$285478",
    period: "6 months",
    thumbType: "bootstrap",
  },
  {
    id: "sc-3",
    title: "Graphic Design Masterclass",
    selling: 21,
    amount: "$85478",
    period: "4 months",
    thumbType: "ps",
  },
  {
    id: "sc-4",
    title: "Learn Invision",
    selling: 28,
    amount: "$98478",
    period: "8 months",
    thumbType: "invision",
  },
  {
    id: "sc-5",
    title: "Angular – The Complete Guider",
    selling: 38,
    amount: "$102478",
    period: "1 year",
    thumbType: "angular",
  },
];

function SellingCourseThumb({ type }: { type: SellingCourseRow["thumbType"] }) {
  if (type === "sketch") {
    return (
      <div className="relative w-15 h-11 rounded-md bg-gradient-to-br from-[#FCD690] via-[#F7B765] to-[#F39F49] flex items-center justify-center overflow-hidden shrink-0">
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-25"
          viewBox="0 0 80 56"
          fill="none"
        >
          <path
            d="M0 44 L22 26 L44 38 L66 18 L80 34"
            stroke="#B45309"
            strokeWidth="1.2"
          />
        </svg>
        <svg className="w-5 h-5 relative z-10" viewBox="0 0 64 64" fill="none">
          <polygon points="32,8 54,22 32,56 10,22" fill="#FDB300" />
          <polygon points="18,22 46,22 32,8" fill="#FDD231" />
          <polygon points="10,22 32,56 20,22" fill="#EA6C00" />
          <polygon points="54,22 32,56 44,22" fill="#EA6C00" />
        </svg>
      </div>
    );
  }

  if (type === "bootstrap") {
    return (
      <div className="relative w-15 h-11 rounded-md bg-gradient-to-br from-[#C8B6FF] via-[#B49BF8] to-[#9E7CF0] flex items-center justify-center overflow-hidden shrink-0">
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-25"
          viewBox="0 0 80 56"
          fill="none"
        >
          <path
            d="M0 44 L22 26 L44 38 L66 18 L80 34"
            stroke="#5B21B6"
            strokeWidth="1.2"
          />
        </svg>
        <div className="w-5 h-5 rounded-xs bg-[#7952B3] text-white font-extrabold text-[11px] flex items-center justify-center relative z-10 shadow-2xs">
          B
        </div>
      </div>
    );
  }

  if (type === "ps") {
    return (
      <div className="relative w-15 h-11 rounded-md bg-gradient-to-br from-[#355C7D] via-[#1E3C58] to-[#11253A] flex items-center justify-center overflow-hidden shrink-0">
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-25"
          viewBox="0 0 80 56"
          fill="none"
        >
          <path
            d="M0 44 L22 26 L44 38 L66 18 L80 34"
            stroke="#38BDF8"
            strokeWidth="1.2"
          />
        </svg>
        <div className="w-5 h-5 rounded-xs bg-[#001E36] border border-[#31A8FF] flex items-center justify-center relative z-10">
          <span className="text-[10px] font-extrabold text-[#31A8FF]">Ps</span>
        </div>
      </div>
    );
  }

  if (type === "invision") {
    return (
      <div className="relative w-15 h-11 rounded-md bg-gradient-to-br from-[#E295B2] via-[#CC5F87] to-[#B03966] flex items-center justify-center overflow-hidden shrink-0">
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-25"
          viewBox="0 0 80 56"
          fill="none"
        >
          <path
            d="M0 44 L22 26 L44 38 L66 18 L80 34"
            stroke="#FFFFFF"
            strokeWidth="1.2"
          />
        </svg>
        <div className="w-5 h-5 rounded-xs bg-[#FF3366] text-white font-extrabold text-[10px] flex items-center justify-center relative z-10">
          in
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-15 h-11 rounded-md bg-gradient-to-br from-[#F87171] via-[#EF4444] to-[#DC2626] flex items-center justify-center overflow-hidden shrink-0">
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-25"
        viewBox="0 0 80 56"
        fill="none"
      >
        <path
          d="M0 44 L22 26 L44 38 L66 18 L80 34"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
      </svg>
      <div className="w-5 h-5 rounded-full bg-[#DD0031] border border-white/40 text-white font-extrabold text-[10px] flex items-center justify-center relative z-10">
        A
      </div>
    </div>
  );
}

const EARNINGS_POINTS = [
  { month: "Jan", value: 2909, x: 52, y: 118 },
  { month: "Feb", value: 1259, x: 112, y: 208 },
  { month: "Mar", value: 950, x: 172, y: 224 },
  { month: "Apr", value: 1563, x: 232, y: 190 },
  { month: "Jun", value: 1825, x: 292, y: 176 },
  { month: "Jul", value: 2526, x: 352, y: 138 },
  { month: "Aug", value: 2010, x: 412, y: 166 },
  { month: "Sep", value: 3260, x: 472, y: 98 },
  { month: "Oct", value: 3005, x: 532, y: 112 },
  { month: "Nov", value: 3860, x: 592, y: 66 },
  { month: "Dec", value: 4039, x: 652, y: 56 },
];

function InstructorEarningsChart() {
  const linePath =
    "M 52 118 C 76 118, 88 208, 112 208 C 136 208, 148 224, 172 224 C 196 224, 208 190, 232 190 C 256 190, 268 176, 292 176 C 316 176, 328 138, 352 138 C 376 138, 388 166, 412 166 C 436 166, 448 98, 472 98 C 496 98, 508 112, 532 112 C 556 112, 568 66, 592 66 C 616 66, 628 56, 652 56";
  const areaPath = `${linePath} L 652 268 L 52 268 Z`;

  const yLabels = [
    { label: "4800", y: 18 },
    { label: "4000", y: 60 },
    { label: "3200", y: 102 },
    { label: "2400", y: 144 },
    { label: "1600", y: 186 },
    { label: "800", y: 228 },
    { label: "0", y: 268 },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 690 305"
        className="w-full min-w-[560px] h-auto select-none"
        fill="none"
      >
        <defs>
          <linearGradient id="instEarningsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#066AC9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#066AC9" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines & Y-axis labels */}
        {yLabels.map((item) => (
          <g key={item.label}>
            <text
              x="38"
              y={item.y + 4}
              textAnchor="end"
              className="fill-[#9A9EA4] text-[10px] font-medium"
            >
              {item.label}
            </text>
            <line
              x1="48"
              y1={item.y}
              x2="660"
              y2={item.y}
              stroke="#F1F5F9"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Area Fill */}
        <path d={areaPath} fill="url(#instEarningsArea)" />

        {/* Smooth Line */}
        <path
          d={linePath}
          stroke="#066AC9"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels & Blue Data Callout Pills */}
        {EARNINGS_POINTS.map((pt) => {
          const pillWidth = pt.value >= 1000 ? 32 : 26;
          return (
            <g key={pt.month}>
              <text
                x={pt.x}
                y="290"
                textAnchor="middle"
                className="fill-[#9A9EA4] text-[11px] font-medium"
              >
                {pt.month}
              </text>
              <rect
                x={pt.x - pillWidth / 2}
                y={pt.y - 9}
                width={pillWidth}
                height="16"
                rx="3"
                fill="#066AC9"
              />
              <text
                x={pt.x}
                y={pt.y + 2.5}
                textAnchor="middle"
                className="fill-white text-[9.5px] font-bold"
              >
                {pt.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function InstructorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminStudents, submissions, adminCourses, addCourse, logout } =
    useLMS();

  const [activeTab, setActiveTab] = useState<InstructorSidebarTab>("dashboard");
  const [sellingCourses, setSellingCourses] = useState<SellingCourseRow[]>(
    INITIAL_SELLING_COURSES
  );
  const [currentPage, setCurrentPage] = useState<number>(2);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Course Modal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState(79000);
  const [newPeriod, setNewPeriod] = useState("6 months");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      if (tab === "create-course") {
        setShowCreateModal(true);
      } else if (
        [
          "dashboard",
          "courses",
          "quiz",
          "earnings",
          "students",
          "orders",
          "reviews",
          "profile",
          "payouts",
          "settings",
          "delete-profile",
        ].includes(tab)
      ) {
        setActiveTab(tab as InstructorSidebarTab);
      }
    }
  }, [searchParams]);

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await addCourse({
      slug: slug || `course-${Date.now()}`,
      title: newTitle.trim(),
      badge: "Newly Added Track",
      tutor: "Lori Stevens",
      tutorRole: "Lead Instructor",
      priceFull: newPrice,
      priceParts: newPrice + 11000,
      deposit: Math.round(newPrice * 0.45),
      delivery: "Physical Lab (Umuahia) + Live Zoom",
      schedule: "3x a week · Flexible Batches",
    });

    setSellingCourses((prev) => [
      {
        id: `sc-${Date.now()}`,
        title: newTitle.trim(),
        selling: 1,
        amount: `$${newPrice.toLocaleString()}`,
        period: newPeriod,
        thumbType: "sketch",
      },
      ...prev,
    ]);

    setShowCreateModal(false);
    setNewTitle("");
    setNotice(`Course "${newTitle.trim()}" published successfully.`);
  };

  const sidebarItems: Array<{
    key: InstructorSidebarTab;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: "dashboard", label: "Dashboard", Icon: LayoutGrid },
    { key: "courses", label: "My Courses", Icon: ShoppingBasket },
    { key: "quiz", label: "Quiz", Icon: HelpCircle },
    { key: "earnings", label: "Earnings", Icon: BarChart3 },
    { key: "students", label: "Students", Icon: Users },
    { key: "orders", label: "Orders", Icon: Folder },
    { key: "reviews", label: "Reviews", Icon: Star },
    { key: "profile", label: "Edit Profile", Icon: Edit3 },
    { key: "payouts", label: "Payouts", Icon: Wallet },
    { key: "settings", label: "Settings", Icon: Settings },
    { key: "delete-profile", label: "Delete Profile", Icon: Trash2 },
  ];

  const pendingSubmissions = submissions.filter((s) => s.status === "SUBMITTED");

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#24292D]">
      <Navbar />

      {/* 1. Eduport Deep-Slate Geometric Pattern Banner (Image 1) */}
      <div className="relative h-40 sm:h-48 w-full bg-[#1D3B53] overflow-hidden">
        {/* Left Geometric Arcs & Polka-Dot Circle */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-full w-80 text-white/6"
          viewBox="0 0 320 200"
          fill="currentColor"
        >
          <path d="M0 0 H180 A180 180 0 0 1 0 180 Z" />
          <circle cx="95" cy="95" r="55" fill="#162D40" />
        </svg>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 left-12 w-28 h-28 rounded-full opacity-15"
          style={{
            backgroundImage: "radial-gradient(#ffffff 2px, transparent 2px)",
            backgroundSize: "10px 10px",
          }}
        />
        {/* Right Geometric Circles & Arcs */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-full w-96 text-white/6"
          viewBox="0 0 400 200"
          fill="currentColor"
        >
          <circle cx="330" cy="135" r="75" />
          <path
            d="M250 0 Q330 90 400 35"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* 2. Overlapping Instructor Avatar, Name, Verified Badge, Stats & "Create a course" Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Overlapping Circular Photo of Lori Stevens */}
            <div className="relative -mt-14 sm:-mt-16 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md overflow-hidden shrink-0 bg-[#E6007E]">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=320&q=80"
                alt="Lori Stevens"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Instructor Name + Cyan Verified Badge + Inline Stats */}
            <div className="pt-1 sm:pb-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="font-display text-2xl sm:text-[30px] font-extrabold text-[#24292D] tracking-tight leading-tight">
                  Lori Stevens
                </h1>
                {/* Scalloped Cyan Verified Badge */}
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#17A2B8] text-white shadow-2xs shrink-0"
                  title="Verified Instructor"
                >
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-[14px] text-[#747579]">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#F7C32E] fill-[#F7C32E]" />
                  <strong className="text-[#24292D] font-semibold">
                    4.5/5.0
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#FD7E14]" />
                  <span>
                    <strong className="text-[#24292D] font-semibold">
                      12k
                    </strong>{" "}
                    Enrolled Students
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#6F42C1]" />
                  <span>
                    <strong className="text-[#24292D] font-semibold">25</strong>{" "}
                    Courses
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Solid Green "Create a course" Button */}
          <div className="sm:pb-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center rounded-lg bg-[#0CBC87] hover:bg-[#0aa374] text-white font-bold text-xs sm:text-[14px] px-5 py-2.5 transition-colors cursor-pointer shadow-2xs"
            >
              Create a course
            </button>
          </div>
        </div>
      </div>

      {/* Optional Toast Notice */}
      {notice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#E6F8F3] border border-[#0CBC87]/30 text-[#0CBC87] text-xs sm:text-sm font-semibold">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-[#0CBC87] hover:opacity-75 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main 2-Column Eduport Instructor Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (3 cols): Dark Charcoal Sidebar Menu (Images 1 & 2) */}
          <aside className="lg:col-span-3 bg-[#24292D] text-white rounded-xl p-4 shadow-sm">
            <nav className="space-y-1">
              {sidebarItems.map(({ key, label, Icon }) => {
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-[14px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-white text-[#24292D] font-bold shadow-2xs"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-[14px] font-semibold text-[#D6293E] hover:bg-[#D6293E]/15 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Right Column (9 cols) */}
          <div className="lg:col-span-9 space-y-8">
            {activeTab === "dashboard" && (
              <>
                {/* Row 1: 3 Pastel KPI Counter Cards (Image 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Card 1: 25 Total Courses (#FEF6E0) */}
                  <div className="bg-[#FEF6E0] rounded-xl p-6 flex items-center gap-5">
                    <div className="text-[#F7C32E] shrink-0">
                      <svg
                        className="w-13 h-13"
                        viewBox="0 0 64 64"
                        fill="none"
                        stroke="currentColor"
                      >
                        <rect
                          x="6"
                          y="10"
                          width="52"
                          height="36"
                          rx="4"
                          strokeWidth="4"
                        />
                        <line
                          x1="6"
                          y1="38"
                          x2="58"
                          y2="38"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M20 54H44"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-display text-2xl sm:text-[26px] font-extrabold text-[#24292D] leading-tight">
                        25
                      </div>
                      <div className="text-[14px] text-[#24292D]/85 font-medium mt-0.5">
                        Total Courses
                      </div>
                    </div>
                  </div>

                  {/* Card 2: 25K+ Total Students (#EFEBF9) */}
                  <div className="bg-[#EFEBF9] rounded-xl p-6 flex items-center gap-5">
                    <div className="text-[#6F42C1] shrink-0">
                      <svg
                        className="w-13 h-13"
                        viewBox="0 0 64 64"
                        fill="currentColor"
                      >
                        <path d="M32 8L6 20L32 32L52 22.8V36H56V20L32 8Z" />
                        <circle cx="32" cy="34" r="8" />
                        <path d="M16 56C16 47.2 23.2 42 32 42C40.8 42 48 47.2 48 56H16Z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-display text-2xl sm:text-[26px] font-extrabold text-[#24292D] leading-tight">
                        25K+
                      </div>
                      <div className="text-[14px] text-[#24292D]/85 font-medium mt-0.5">
                        Total Students
                      </div>
                    </div>
                  </div>

                  {/* Card 3: 12K Enrolled Students (#E7F6F8) */}
                  <div className="bg-[#E7F6F8] rounded-xl p-6 flex items-center gap-5">
                    <div className="text-[#17A2B8] shrink-0">
                      <svg
                        className="w-13 h-13"
                        viewBox="0 0 64 64"
                        fill="currentColor"
                      >
                        <path d="M16 12H48L58 26L32 56L6 26L16 12ZM21 18L15 26H49L43 18H21Z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-display text-2xl sm:text-[26px] font-extrabold text-[#24292D] leading-tight">
                        12K
                      </div>
                      <div className="text-[14px] text-[#24292D]/85 font-medium mt-0.5">
                        Enrolled Students
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Earnings Comparison + Smooth Area Line Chart Card (Images 1 & 2) */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-[0_2px_18px_rgba(0,0,0,0.03)]">
                  <div className="flex flex-wrap items-start gap-12 sm:gap-20 mb-6">
                    {/* Current Month */}
                    <div>
                      <span className="inline-block bg-[#24292D] text-white text-[11px] font-bold px-2.5 py-1 rounded-md mb-2">
                        Current Month
                      </span>
                      <div className="font-display text-2xl sm:text-[28px] font-extrabold text-[#066AC9] leading-tight">
                        $35000
                      </div>
                      <p className="text-[13.5px] text-[#747579] mt-1">
                        <span className="text-[#0CBC87] font-medium">
                          0.20% &uarr;
                        </span>{" "}
                        vs last month
                      </p>
                    </div>

                    {/* Last Month */}
                    <div>
                      <span className="inline-block bg-[#24292D] text-white text-[11px] font-bold px-2.5 py-1 rounded-md mb-2">
                        Last Month
                      </span>
                      <div className="font-display text-2xl sm:text-[28px] font-extrabold text-[#24292D] leading-tight">
                        $28000
                      </div>
                      <p className="text-[13.5px] text-[#747579] mt-1">
                        <span className="text-[#D6293E] font-medium">
                          0.10% &darr;
                        </span>{" "}
                        Then last month
                      </p>
                    </div>
                  </div>

                  {/* Smooth Area Chart */}
                  <InstructorEarningsChart />
                </div>

                {/* Row 3: Most Selling Courses Card (Images 2 & 3) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.03)] overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-display text-xl sm:text-[26px] font-extrabold text-[#24292D]">
                      Most Selling Courses
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab("courses")}
                      className="px-3.5 py-2 rounded-lg bg-[#E8F1FA] hover:bg-[#066AC9] text-[#066AC9] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead>
                          <tr className="bg-[#24292D] text-white text-[13.5px] font-bold">
                            <th className="py-3.5 px-4 rounded-l-lg">
                              Course Name
                            </th>
                            <th className="py-3.5 px-4">Selling</th>
                            <th className="py-3.5 px-4">Amount</th>
                            <th className="py-3.5 px-4">Period</th>
                            <th className="py-3.5 px-4 rounded-r-lg">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 text-[14px]">
                          {sellingCourses.map((course) => (
                            <tr
                              key={course.id}
                              className="hover:bg-slate-50/60 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3.5">
                                  <SellingCourseThumb type={course.thumbType} />
                                  <span className="font-display font-bold text-[#24292D] text-[14.5px]">
                                    {course.title}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-[#747579]">
                                {course.selling}
                              </td>
                              <td className="py-4 px-4 text-[#747579]">
                                {course.amount}
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-block px-2.5 py-1 rounded-md bg-[#E8F1FA] text-[#066AC9] text-[12px] font-semibold">
                                  {course.period}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setNotice(`Editing "${course.title}"...`)
                                    }
                                    className="w-8 h-8 rounded-full bg-[#E6F8F3] text-[#0CBC87] hover:bg-[#0CBC87] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                    title="Edit Course"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSellingCourses((prev) =>
                                        prev.filter((c) => c.id !== course.id)
                                      );
                                      setNotice(
                                        `Removed "${course.title}" from selling list.`
                                      );
                                    }}
                                    className="w-8 h-8 rounded-full bg-[#FBE9EB] text-[#D6293E] hover:bg-[#D6293E] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                    title="Remove Course"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer (Image 3) */}
                    <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-[13.5px] text-[#747579]">
                        Showing 1 to 8 of 20 entries
                      </p>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          className="w-8 h-8 rounded-md bg-[#E8F1FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Previous Page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[1, 2, 3].map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                              currentPage === page
                                ? "bg-[#066AC9] text-white"
                                : "bg-[#E8F1FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(3, p + 1))
                          }
                          className="w-8 h-8 rounded-md bg-[#E8F1FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Next Page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Additional Interactive Sidebar Views */}
            {activeTab !== "dashboard" && (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="font-display text-xl sm:text-[24px] font-extrabold text-[#24292D] capitalize">
                    {activeTab === "courses"
                      ? "My Courses"
                      : activeTab === "delete-profile"
                        ? "Delete Profile"
                        : activeTab}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/instructor/grading"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#066AC9] hover:bg-[#0556A5] text-white text-xs font-bold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        Open Grading Studio ({pendingSubmissions.length} pending)
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveTab("dashboard")}
                      className="px-3.5 py-2 rounded-lg bg-[#E8F1FA] text-[#066AC9] text-xs font-bold hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {activeTab === "students" ? (
                    <>
                      <InstructorConceptInsights courseId="web-dev" />
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[620px]">
                          <thead>
                            <tr className="bg-[#24292D] text-white text-[13px] font-bold">
                              <th className="py-3.5 px-4 rounded-l-lg">
                                Student
                              </th>
                              <th className="py-3.5 px-4">Course</th>
                              <th className="py-3.5 px-4">Progress</th>
                              <th className="py-3.5 px-4">Capstone</th>
                              <th className="py-3.5 px-4 rounded-r-lg">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/70 text-[13.5px]">
                            {adminStudents.map((stu) => (
                              <tr key={stu.id}>
                                <td className="py-3.5 px-4 font-bold text-[#24292D]">
                                  {stu.name}
                                  <div className="text-xs text-[#747579] font-normal">
                                    {stu.email}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-[#747579]">
                                  {stu.courseTitle}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-[#066AC9]"
                                        style={{
                                          width: `${stu.progressPercent}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-bold">
                                      {stu.progressPercent}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  {stu.capstoneStatus === "GRADED" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E6F8F3] text-[#0CBC87] text-xs font-bold">
                                      <Award className="w-3 h-3" /> Certified
                                    </span>
                                  ) : stu.capstoneStatus === "SUBMITTED" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FEF6E0] text-[#F7C32E] text-xs font-bold">
                                      <Clock className="w-3 h-3" /> Needs
                                      Grading
                                    </span>
                                  ) : (
                                    <span className="text-xs text-[#747579]">
                                      In progress
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4">
                                  <Link
                                    href="/instructor/grading"
                                    className="px-3 py-1.5 rounded-md bg-[#E8F1FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white text-xs font-bold transition-colors"
                                  >
                                    Review
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-[#747579]">
                        Manage your{" "}
                        <strong className="text-[#24292D]">{activeTab}</strong>{" "}
                        records and BEMS Institute of Technology curriculum
                        tracks below.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {adminCourses.map((c) => (
                          <div
                            key={c.id}
                            className="p-4 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4"
                          >
                            <div>
                              <h4 className="font-display font-bold text-[#24292D] text-sm">
                                {c.title}
                              </h4>
                              <p className="text-xs text-[#747579] mt-0.5">
                                {c.tutor} &middot; ₦
                                {c.priceFull.toLocaleString()}
                              </p>
                            </div>
                            <Link
                              href={`/courses/${c.slug}`}
                              className="px-3 py-1.5 rounded-lg bg-[#E8F1FA] text-[#066AC9] text-xs font-bold hover:bg-[#066AC9] hover:text-white transition-colors"
                            >
                              View Track
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-extrabold text-[#24292D]">
                Create a New Course
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#747579] hover:text-[#24292D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#747579] mb-1.5">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Full-Stack GraphQL Architecture"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#066AC9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#747579] mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#066AC9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#747579] mb-1.5">
                    Period
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#066AC9]"
                  >
                    <option value="4 months">4 months</option>
                    <option value="6 months">6 months</option>
                    <option value="8 months">8 months</option>
                    <option value="9 months">9 months</option>
                    <option value="1 year">1 year</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-bold text-[#747579] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0CBC87] hover:bg-[#0aa374] text-white text-xs font-bold cursor-pointer"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Eduport Compact Dark Footer Bar (Image 3) */}
      <footer className="relative bg-[#24292D] text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-white text-[#24292D] font-black text-sm flex items-center justify-center">
              <span className="text-[#FD7E14] mr-0.5">&#9679;</span>e
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Eduport
            </span>
          </Link>

          <p className="text-xs sm:text-[13.5px] text-white/85 text-center">
            Copyrights &copy;2026 Eduport. Build by StackBros.
          </p>

          <div className="flex items-center gap-4 text-sm text-white/90">
            <a
              href="#top"
              aria-label="Facebook"
              className="hover:text-white transition-colors font-bold"
            >
              f
            </a>
            <a
              href="#top"
              aria-label="Instagram"
              className="hover:text-white transition-colors font-bold"
            >
              ig
            </a>
            <a
              href="#top"
              aria-label="LinkedIn"
              className="hover:text-white transition-colors font-bold"
            >
              in
            </a>
            <a
              href="#top"
              aria-label="Twitter"
              className="hover:text-white transition-colors font-bold"
            >
              &#120143;
            </a>
          </div>
        </div>

        {/* Scroll to top button (Image 3 bottom right) */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-lg bg-[#DCE9F8] hover:bg-[#066AC9] text-[#066AC9] hover:text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}

export default function InstructorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-sm text-[#747579]">
          Loading Instructor Dashboard...
        </div>
      }
    >
      <InstructorDashboardContent />
    </Suspense>
  );
}
