"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { apiFetch, API_BASE_URL } from "@/lib/api-client";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  Home,
  ShoppingBasket,
  GraduationCap,
  UserCheck,
  MessageSquare,
  BarChart3,
  Briefcase,
  ClipboardList,
  UserCog,
  Lock,
  Settings,
  Globe,
  Power,
  Search,
  Bell,
  ChevronDown,
  ChevronUp,
  Monitor,
  User as UserIcon,
  Clock,
  BookOpen,
  Star,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Calendar,
  Mail,
  Ban,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlusCircle,
  Menu,
  X,
  Edit3,
  Trash2,
} from "lucide-react";

interface EduportStudentCard {
  id: string;
  name: string;
  location: string;
  avatar: string;
  payments: string;
  totalCourse: number;
  progress: number;
  joinDate: string;
  email?: string;
  enrollmentId?: string;
  paymentStatus?: "PAID_FULL" | "PARTIAL" | "PENDING" | "REFUNDED";
  coursePrice?: number;
  amountPaidRaw?: number;
  paymentReference?: string | null;
  enrollmentStatus?: "PENDING" | "ACTIVE" | "COMPLETED" | "DROPPED" | "WITHDRAWN";
  secondChanceUsed?: boolean;
}

interface EduportInstructorCard {
  id: string;
  name: string;
  role: string;
  avatar: string;
  totalStudents: number;
  totalCourses: number;
  rating: number;
  verified?: boolean;
}

const EDUPORT_STUDENTS: EduportStudentCard[] = [
  {
    id: "stu-1",
    name: "Blessing Adeyemi",
    location: "Mumbai",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Blessing%20Adeyemi&backgroundColor=18143D&textColor=ffffff",
    payments: "$6205",
    totalCourse: 21,
    progress: 85,
    joinDate: "29 Aug 2021",
  },
  {
    id: "stu-2",
    name: "Tunde Bakare",
    location: "Delhi",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Tunde%20Bakare&backgroundColor=671FB0&textColor=ffffff",
    payments: "$1256",
    totalCourse: 16,
    progress: 60,
    joinDate: "15 July 2021",
  },
  {
    id: "stu-3",
    name: "Emeka Nwosu",
    location: "New York",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Emeka%20Nwosu&backgroundColor=7928CA&textColor=ffffff",
    payments: "$9256",
    totalCourse: 38,
    progress: 74,
    joinDate: "22 June 2021",
  },
  {
    id: "stu-4",
    name: "Ngozi Eze",
    location: "California",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Ngozi%20Eze&backgroundColor=18143D&textColor=ffffff",
    payments: "$10688",
    totalCourse: 7,
    progress: 45,
    joinDate: "18 April 2021",
  },
  {
    id: "stu-5",
    name: "Chiamaka Nnamdi",
    location: "Chennai",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Chiamaka%20Nnamdi&backgroundColor=671FB0&textColor=ffffff",
    payments: "$856",
    totalCourse: 5,
    progress: 90,
    joinDate: "05 Aug 2021",
  },
  {
    id: "stu-6",
    name: "Ifeanyi Okafor",
    location: "Canada",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Ifeanyi%20Okafor&backgroundColor=7928CA&textColor=ffffff",
    payments: "$3578",
    totalCourse: 14,
    progress: 30,
    joinDate: "18 Jan 2021",
  },
];

const EDUPORT_INSTRUCTORS: EduportInstructorCard[] = [
  {
    id: "inst-1",
    name: "Ngozi Eze",
    role: "Web Designer",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Ngozi%20Eze&backgroundColor=18143D&textColor=ffffff",
    totalStudents: 5354,
    totalCourses: 15,
    rating: 4.5,
    verified: true,
  },
  {
    id: "inst-2",
    name: "Blessing Adeyemi",
    role: "Web Developer",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Blessing%20Adeyemi&backgroundColor=671FB0&textColor=ffffff",
    totalStudents: 15523,
    totalCourses: 10,
    rating: 4.5,
    verified: false,
  },
  {
    id: "inst-3",
    name: "Emeka Nwosu",
    role: "Developer and Instructor",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Emeka%20Nwosu&backgroundColor=7928CA&textColor=ffffff",
    totalStudents: 2546,
    totalCourses: 9,
    rating: 4.5,
    verified: false,
  },
  {
    id: "inst-4",
    name: "Tunde Bakare",
    role: "Full Stack Web Developer",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Tunde%20Bakare&backgroundColor=18143D&textColor=ffffff",
    totalStudents: 12786,
    totalCourses: 7,
    rating: 4.5,
    verified: false,
  },
  {
    id: "inst-5",
    name: "Chiamaka Nnamdi",
    role: "Engineering Architect",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Chiamaka%20Nnamdi&backgroundColor=671FB0&textColor=ffffff",
    totalStudents: 21245,
    totalCourses: 5,
    rating: 4.8,
    verified: true,
  },
  {
    id: "inst-6",
    name: "Amarachi Chukwu",
    role: "Medical Science",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Amarachi%20Chukwu&backgroundColor=7928CA&textColor=ffffff",
    totalStudents: 8546,
    totalCourses: 6,
    rating: 4.5,
    verified: true,
  },
];

const TOP_INSTRUCTORS_LIST = [
  {
    name: "Ngozi Eze",
    courses: 25,
    rating: "4.5/5.0",
    verified: true,
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Ngozi%20Eze&backgroundColor=18143D&textColor=ffffff",
  },
  {
    name: "Emeka Nwosu",
    courses: 18,
    rating: "4.5/5.0",
    verified: false,
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Emeka%20Nwosu&backgroundColor=671FB0&textColor=ffffff",
  },
  {
    name: "Chiamaka Nnamdi",
    courses: 21,
    rating: "4.8/5.0",
    verified: true,
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Blessing%20Adeyemi&backgroundColor=7928CA&textColor=ffffff",
  },
  {
    name: "Tunde Bakare",
    courses: 15,
    rating: "4.5/5.0",
    verified: false,
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Tunde%20Bakare&backgroundColor=18143D&textColor=ffffff",
  },
  {
    name: "Amarachi Chukwu",
    courses: 29,
    rating: "4.5/5.0",
    verified: true,
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Chiamaka%20Nnamdi&backgroundColor=671FB0&textColor=ffffff",
  },
];

const SUPPORT_REQUESTS = [
  {
    id: "req-1",
    name: "Ngozi Eze",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Ngozi%20Eze&backgroundColor=7928CA&textColor=ffffff",
    initials: null,
    badgeBg: "",
    badgeText: "",
    message: "New ticket #759 from Ngozi Eze for General Enquiry",
    boldPart: null,
    time: "8 hour ago",
  },
  {
    id: "req-2",
    name: "Emeka Nwosu",
    avatar: null,
    initials: "DB",
    badgeBg: "bg-[#F6ECF9]",
    badgeText: "text-[#A16EBD]",
    message: "Comment from Tunde Bakare on ticket #659",
    boldPart: null,
    time: "8 hour ago",
  },
  {
    id: "req-3",
    name: "Emeka Nwosu",
    avatar: null,
    initials: "WB",
    badgeBg: "bg-[#FFF2E2]",
    badgeText: "text-[#FD7E14]",
    message: "assign you a new ticket for Cohort Onboarding",
    boldPrefix: "Admissions Desk",
    boldSuffix: "Cohort Onboarding",
    time: "5 hour ago",
  },
  {
    id: "req-4",
    name: "Emeka Nwosu",
    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Tunde%20Bakare&backgroundColor=18143D&textColor=ffffff",
    initials: null,
    badgeBg: "",
    badgeText: "",
    message: "Thanks for contact us with your issues.",
    boldPart: null,
    time: "9 hour ago",
  },
];

const EARNINGS_POINTS = [
  { month: "Jan", value: 2909, x: 52, y: 118 },
  { month: "Feb", value: 1259, x: 108, y: 208 },
  { month: "Mar", value: 950, x: 164, y: 224 },
  { month: "Apr", value: 1563, x: 220, y: 190 },
  { month: "Jun", value: 1825, x: 276, y: 176 },
  { month: "Jul", value: 2526, x: 332, y: 138 },
  { month: "Aug", value: 2010, x: 388, y: 166 },
  { month: "Sep", value: 3260, x: 444, y: 98 },
  { month: "Oct", value: 3005, x: 500, y: 112 },
  { month: "Nov", value: 3860, x: 556, y: 66 },
  { month: "Dec", value: 4039, x: 612, y: 56 },
];

function EarningsLineChart() {
  // Smooth cubic bezier path through EARNINGS_POINTS
  const linePath =
    "M 52 118 C 75 118, 86 208, 108 208 C 130 208, 142 224, 164 224 C 186 224, 198 190, 220 190 C 242 190, 254 176, 276 176 C 298 176, 310 138, 332 138 C 354 138, 366 166, 388 166 C 410 166, 422 98, 444 98 C 466 98, 478 112, 500 112 C 522 112, 534 66, 556 66 C 578 66, 590 56, 612 56";
  const areaPath = `${linePath} L 612 268 L 52 268 Z`;

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
        viewBox="0 0 650 305"
        className="w-full min-w-[540px] h-auto select-none"
        fill="none"
      >
        <defs>
          <linearGradient id="eduportEarningsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#AE54C6" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#AE54C6" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Horizontal Y Grid Lines & Labels */}
        {yLabels.map((row) => (
          <g key={row.label}>
            <text
              x="36"
              y={row.y + 4}
              textAnchor="end"
              fill="#9A9EA4"
              fontSize="10.5"
              fontFamily="sans-serif"
            >
              {row.label}
            </text>
            <line
              x1="48"
              y1={row.y}
              x2="625"
              y2={row.y}
              stroke="#F0F2F5"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Shaded Area */}
        <path d={areaPath} fill="url(#eduportEarningsGrad)" />

        {/* Smooth Blue Line */}
        <path
          d={linePath}
          stroke="#AE54C6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Month Labels & Data Callout Pills */}
        {EARNINGS_POINTS.map((pt) => (
          <g key={pt.month}>
            <text
              x={pt.x}
              y="292"
              textAnchor="middle"
              fill="#9A9EA4"
              fontSize="11"
              fontFamily="sans-serif"
            >
              {pt.month}
            </text>

            {/* Blue pill */}
            <rect
              x={pt.x - 18}
              y={pt.y - 9}
              width="36"
              height="17"
              rx="3.5"
              fill="#AE54C6"
              stroke="#FFFFFF"
              strokeWidth="1.2"
            />
            <text
              x={pt.x}
              y={pt.y + 2.5}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="9.5"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              {pt.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function TrafficSourcesDonutChart() {
  // Circumference for r=60 is 2 * pi * 60 = 376.99
  const r = 60;
  const c = 2 * Math.PI * r;
  // Segments: Blue (62%), Green (16%), Yellow (14%), Red (8%)
  const segments = [
    { color: "#AE54C6", pct: 0.62, offset: 0 },
    { color: "#AE54C6", pct: 0.16, offset: 0.62 },
    { color: "#F7C32E", pct: 0.14, offset: 0.78 },
    { color: "#D6293E", pct: 0.08, offset: 0.92 },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 my-2">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const dash = Math.max(0, seg.pct * c - 4);
            const gap = c - dash;
            const strokeDashoffset = -seg.offset * c;
            return (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={r}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="24"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
      </div>

      <div className="w-full space-y-3 mt-4">
        <div className="flex items-start gap-2.5 text-[13.5px] text-[#747579]">
          <span className="w-3 h-3 rounded-full bg-[#AE54C6] shrink-0 mt-1" />
          <span>Create a Design System in Figma</span>
        </div>
        <div className="flex items-start gap-2.5 text-[13.5px] text-[#747579]">
          <span className="w-3 h-3 rounded-full bg-[#AE54C6] shrink-0 mt-1" />
          <span>The Complete Digital Marketing Course - 12 Courses in 1</span>
        </div>
        <div className="flex items-start gap-2.5 text-[13.5px] text-[#747579]">
          <span className="w-3 h-3 rounded-full bg-[#F7C32E] shrink-0 mt-1" />
          <span>Google Ads Training: Become a PPC Expert</span>
        </div>
        <div className="flex items-start gap-2.5 text-[13.5px] text-[#747579]">
          <span className="w-3 h-3 rounded-full bg-[#D6293E] shrink-0 mt-1" />
          <span>Microsoft Excel - Excel from Beginner to Advanced</span>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab") || "dashboard";
  const normalizedInitialTab = rawTab === "overview" ? "dashboard" : rawTab;

  const {
    user,
    logout,
    courses,
    adminStudents,
    adminCourses,
    analytics,
    refreshAdminData,
    addCourse,
    updateCourseStatus,
    updateStudentPayment,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<string>(normalizedInitialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coursesMenuOpen, setCoursesMenuOpen] = useState(false);
  const [instructorsMenuOpen, setInstructorsMenuOpen] = useState(
    normalizedInitialTab.startsWith("instructor")
  );
  const [authMenuOpen, setAuthMenuOpen] = useState(false);

  const [globalSearch, setGlobalSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentViewMode, setStudentViewMode] = useState<"grid" | "list">("grid");
  const [studentPage, setStudentPage] = useState(2);

  const [instructorSearch, setInstructorSearch] = useState("");
  const [instructorViewMode, setInstructorViewMode] = useState<"grid" | "list">("grid");

  // Instructor Requests state (Image 3)
  const [requestSearch, setRequestSearch] = useState("");
  const [requestSort, setRequestSort] = useState("default");
  const [instructorRequests, setInstructorRequests] = useState([
    {
      id: "ireq-1",
      name: "Ngozi Eze",
      subject: "HTML, CSS, Bootstrap",
      requestedDate: "22 Oct 2021",
      status: "PENDING" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Ngozi%20Eze&backgroundColor=671FB0&textColor=ffffff",
    },
    {
      id: "ireq-2",
      name: "Blessing Adeyemi",
      subject: "Photoshop, Figma, Adobe XD",
      requestedDate: "06 Sep 2021",
      status: "PENDING" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Blessing%20Adeyemi&backgroundColor=7928CA&textColor=ffffff",
    },
    {
      id: "ireq-3",
      name: "Emeka Nwosu",
      subject: "JavaScript, Java",
      requestedDate: "21 Jan 2021",
      status: "ACCEPTED" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Emeka%20Nwosu&backgroundColor=18143D&textColor=ffffff",
    },
    {
      id: "ireq-4",
      name: "Tunde Bakare",
      subject: "Maths, Chemistry",
      requestedDate: "25 Dec 2020",
      status: "REJECTED" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Tunde%20Bakare&backgroundColor=671FB0&textColor=ffffff",
    },
    {
      id: "ireq-5",
      name: "Chiamaka Nnamdi",
      subject: "Python, Angular, React Native",
      requestedDate: "05 June 2020",
      status: "ACCEPTED" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Chiamaka%20Nnamdi&backgroundColor=7928CA&textColor=ffffff",
    },
    {
      id: "ireq-6",
      name: "Amarachi Chukwu",
      subject: "After Effects, Premiere Pro",
      requestedDate: "14 Feb 2020",
      status: "ACCEPTED" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Amarachi%20Chukwu&backgroundColor=18143D&textColor=ffffff",
    },
  ]);

  // Reviews state (Image 5)
  const [reviewsList, setReviewsList] = useState([
    {
      id: "01",
      studentName: "Ngozi Eze",
      courseName: "Web Development",
      rating: 5,
      visible: false,
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Ngozi%20Eze&backgroundColor=671FB0&textColor=ffffff",
    },
    {
      id: "02",
      studentName: "Blessing Adeyemi",
      courseName: "Product Design (UI/UX)",
      rating: 5,
      visible: false,
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Blessing%20Adeyemi&backgroundColor=7928CA&textColor=ffffff",
    },
    {
      id: "03",
      studentName: "Emeka Nwosu",
      courseName: "Web Development",
      rating: 4,
      visible: false,
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Emeka%20Nwosu&backgroundColor=18143D&textColor=ffffff",
    },
    {
      id: "04",
      studentName: "Tunde Bakare",
      courseName: "Cybersecurity",
      rating: 4,
      visible: false,
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Tunde%20Bakare&backgroundColor=671FB0&textColor=ffffff",
    },
    {
      id: "05",
      studentName: "Chiamaka Nnamdi",
      courseName: "AI & Automation",
      rating: 4,
      visible: false,
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Chiamaka%20Nnamdi&backgroundColor=7928CA&textColor=ffffff",
    },
    {
      id: "06",
      studentName: "Amarachi Chukwu",
      courseName: "Mobile App Engineering",
      rating: 4,
      visible: false,
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Amarachi%20Chukwu&backgroundColor=18143D&textColor=ffffff",
    },
    {
      id: "07",
      studentName: "Ifeanyi Okafor",
      courseName: "AI & Automation",
      rating: 4,
      visible: false,
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=Ifeanyi%20Okafor&backgroundColor=671FB0&textColor=ffffff",
    },
  ]);

  // Admin Settings state — Website Settings and Notification Settings are
  // real, persisted via /api/admin/settings; the other sub-tabs don't tie
  // to any real integration in this app (see those sub-tabs' content).
  const [settingsSubTab, setSettingsSubTab] = useState<
    "website" | "general" | "notification" | "account" | "social" | "email"
  >("website");
  const [siteSettingsForm, setSiteSettingsForm] = useState({
    siteName: "",
    copyrightText: "",
    siteEmail: "",
    description: "",
    contactPhone: "",
    supportEmail: "",
    contactAddress: "",
    allowRegistration: "enable" as "enable" | "disable" | "request"
  });
  const [notifyCategories, setNotifyCategories] = useState<string[]>([
    "CLASS", "GRADING", "PAYMENT", "GAMIFICATION", "ATTENDANCE"
  ]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingSiteSettings, setSavingSiteSettings] = useState(false);
  const [savingNotifyPrefs, setSavingNotifyPrefs] = useState(false);

  interface LedgerEntry {
    id: string;
    reference: string;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    paymentPlan: string;
    amount: number;
    status: "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED";
    channel: string | null;
    gatewayResponse: string | null;
    paidAt: string | null;
    createdAt: string;
  }
  const [paymentLedger, setPaymentLedger] = useState<LedgerEntry[]>([]);
  const [ledgerLoaded, setLedgerLoaded] = useState(false);
  const ledgerLoading = (activeTab === "earnings" || activeTab === "analytics") && !ledgerLoaded;

  useEffect(() => {
    if (!(activeTab === "earnings" || activeTab === "analytics") || ledgerLoaded) return;
    apiFetch("/api/admin/payment-ledger")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPaymentLedger(data.transactions || []);
        setLedgerLoaded(true);
      })
      .catch(() => setLedgerLoaded(true));
  }, [activeTab, ledgerLoaded]);

  interface Placement {
    id: string;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    status: "SEEKING" | "INTRODUCED" | "HIRED";
    placementType: "BEMS_INTERNAL" | "PARTNER" | null;
    employerName: string | null;
    hiredAt: string | null;
    feeAmount: number | null;
    feeStatus: "NONE" | "INVOICED" | "PAID";
    payRate: number | null;
    notes: string | null;
    createdAt: string;
  }
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [placementsLoaded, setPlacementsLoaded] = useState(false);
  const placementsLoading =
    (activeTab === "placements" || activeTab === "earnings" || activeTab === "analytics") && !placementsLoaded;
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);
  const [savingPlacement, setSavingPlacement] = useState(false);
  const [placementForm, setPlacementForm] = useState({
    status: "SEEKING" as Placement["status"],
    placementType: "" as "" | "BEMS_INTERNAL" | "PARTNER",
    employerName: "",
    hiredAt: "",
    feeAmount: "",
    feeStatus: "NONE" as Placement["feeStatus"],
    payRate: "",
    notes: ""
  });
  const openEditPlacement = (p: Placement) => {
    setEditingPlacement(p);
    setPlacementForm({
      status: p.status,
      placementType: p.placementType || "",
      employerName: p.employerName || "",
      hiredAt: p.hiredAt ? p.hiredAt.slice(0, 10) : "",
      feeAmount: p.feeAmount !== null ? String(p.feeAmount) : "",
      feeStatus: p.feeStatus,
      payRate: p.payRate !== null ? String(p.payRate) : "",
      notes: p.notes || ""
    });
  };

  const promoteToInstructor = async (placementId: string, studentName: string) => {
    const res = await apiFetch(`/api/admin/placements/${placementId}/promote-to-instructor`, {
      method: "POST"
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setAdminNotice(`${studentName} promoted to Instructor — welcome to the teaching team!`);
    } else {
      setAdminNotice(data.error || "Could not promote to instructor.");
    }
  };

  useEffect(() => {
    if (!(activeTab === "placements" || activeTab === "earnings" || activeTab === "analytics") || placementsLoaded)
      return;
    apiFetch("/api/admin/placements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPlacements(data.placements || []);
        setPlacementsLoaded(true);
      })
      .catch(() => setPlacementsLoaded(true));
  }, [activeTab, placementsLoaded]);

  const savePlacement = async () => {
    if (!editingPlacement) return;
    setSavingPlacement(true);
    try {
      const res = await apiFetch(`/api/admin/placements/${editingPlacement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: placementForm.status,
          placementType: placementForm.placementType || null,
          employerName: placementForm.employerName.trim() || null,
          hiredAt: placementForm.hiredAt || null,
          feeAmount: placementForm.feeAmount.trim() === "" ? null : Number(placementForm.feeAmount),
          feeStatus: placementForm.feeStatus,
          payRate: placementForm.payRate.trim() === "" ? null : Number(placementForm.payRate),
          notes: placementForm.notes.trim() || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPlacements((prev) => prev.map((p) => (p.id === data.placement.id ? { ...p, ...data.placement } : p)));
        setAdminNotice(`Updated placement for ${editingPlacement.studentName}.`);
        setEditingPlacement(null);
      }
    } finally {
      setSavingPlacement(false);
    }
  };

  const [editingCohortTargets, setEditingCohortTargets] = useState(false);
  const [cohortForm, setCohortForm] = useState({ estimatedAdViews: "", targetStudents: "", targetRevenue: "" });
  const [savingCohort, setSavingCohort] = useState(false);
  const openEditCohortTargets = () => {
    setCohortForm({
      estimatedAdViews: String(analytics.estimatedAdViews),
      targetStudents: String(analytics.targetStudents),
      targetRevenue: String(analytics.targetRevenue)
    });
    setEditingCohortTargets(true);
  };
  const saveCohortTargets = async () => {
    setSavingCohort(true);
    try {
      const res = await apiFetch("/api/admin/cohort", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimatedAdViews: Number(cohortForm.estimatedAdViews),
          targetStudents: Number(cohortForm.targetStudents),
          targetRevenue: Number(cohortForm.targetRevenue)
        })
      });
      if (res.ok) {
        await refreshAdminData();
        setAdminNotice("Cohort targets updated.");
        setEditingCohortTargets(false);
      }
    } finally {
      setSavingCohort(false);
    }
  };

  // PRD §9 "Plan the next group" — previously only possible by hand in the
  // database. Loaded alongside the cohort targets since both live in the
  // Earnings tab's Marketing Funnel area.
  interface CohortRow {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    targetStudents: number;
    targetRevenue: number;
    estimatedAdViews: number;
    enrolledCount: number;
    createdAt: string;
  }
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [cohortsLoaded, setCohortsLoaded] = useState(false);
  const cohortsLoading =
    (activeTab === "earnings" || activeTab === "analytics" || activeTab === "students") && !cohortsLoaded;
  const [creatingCohort, setCreatingCohort] = useState(false);
  const [newCohortForm, setNewCohortForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    targetStudents: "80",
    targetRevenue: "6800000"
  });
  const [savingNewCohort, setSavingNewCohort] = useState(false);

  useEffect(() => {
    if (!(activeTab === "earnings" || activeTab === "analytics" || activeTab === "students") || cohortsLoaded) return;
    apiFetch("/api/admin/cohorts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setCohorts(data.cohorts || []);
        setCohortsLoaded(true);
      })
      .catch(() => setCohortsLoaded(true));
  }, [activeTab, cohortsLoaded]);

  const saveNewCohort = async () => {
    setSavingNewCohort(true);
    try {
      const res = await apiFetch("/api/admin/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCohortForm.name.trim(),
          startDate: newCohortForm.startDate,
          endDate: newCohortForm.endDate,
          targetStudents: Number(newCohortForm.targetStudents),
          targetRevenue: Number(newCohortForm.targetRevenue)
        })
      });
      if (res.ok) {
        setCohortsLoaded(false);
        await refreshAdminData();
        setAdminNotice(`Cohort "${newCohortForm.name}" created — new enrollments will attach to it.`);
        setCreatingCohort(false);
        setNewCohortForm({ name: "", startDate: "", endDate: "", targetStudents: "80", targetRevenue: "6800000" });
      } else {
        const data = await res.json().catch(() => ({}));
        setAdminNotice(data.error || "Could not create cohort.");
      }
    } finally {
      setSavingNewCohort(false);
    }
  };

  // PRD §4.2: "A second chance: a student who falls behind can rejoin
  // those weeks in the next group for free, once." Requires the enrollment
  // to be marked DROPPED first and picking which (newer) cohort to rejoin.
  const [secondChanceEnrollmentId, setSecondChanceEnrollmentId] = useState<string | null>(null);
  const [secondChanceTargetCohort, setSecondChanceTargetCohort] = useState("");
  const [savingSecondChance, setSavingSecondChance] = useState(false);

  const toggleDropped = async (enrollmentId: string, name: string, nextStatus: "DROPPED" | "ACTIVE") => {
    const res = await apiFetch(`/api/admin/enrollments/${enrollmentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) {
      await refreshAdminData();
      setAdminNotice(
        nextStatus === "DROPPED" ? `Marked ${name} as dropped.` : `Reactivated ${name}'s enrollment.`
      );
    }
  };

  const openSecondChance = (enrollmentId: string) => {
    const newestOtherCohort = cohorts[0]?.id || "";
    setSecondChanceTargetCohort(newestOtherCohort);
    setSecondChanceEnrollmentId(enrollmentId);
  };

  const confirmSecondChance = async () => {
    if (!secondChanceEnrollmentId || !secondChanceTargetCohort) return;
    setSavingSecondChance(true);
    try {
      const res = await apiFetch(`/api/admin/enrollments/${secondChanceEnrollmentId}/second-chance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCohortId: secondChanceTargetCohort })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refreshAdminData();
        setAdminNotice(
          `Second chance activated${data.waivedAmount ? ` — ₦${data.waivedAmount.toLocaleString()} waived` : ""}.`
        );
        setSecondChanceEnrollmentId(null);
      } else {
        setAdminNotice(data.error || "Could not activate second chance.");
      }
    } finally {
      setSavingSecondChance(false);
    }
  };

  // Bookkeeping-only refund — same convention as a manually-confirmed bank
  // transfer. Withdraws course access and writes a real ledger entry.
  const [refundingEnrollment, setRefundingEnrollment] = useState<{ id: string; name: string; amountPaid: number } | null>(
    null
  );
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [savingRefund, setSavingRefund] = useState(false);

  const openRefund = (id: string, name: string, amountPaid: number) => {
    setRefundAmount(String(amountPaid));
    setRefundReason("");
    setRefundingEnrollment({ id, name, amountPaid });
  };

  const confirmRefund = async () => {
    if (!refundingEnrollment) return;
    setSavingRefund(true);
    try {
      const res = await apiFetch(`/api/admin/enrollments/${refundingEnrollment.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(refundAmount), reason: refundReason.trim() || undefined })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refreshAdminData();
        setAdminNotice(`Refunded ₦${Number(refundAmount).toLocaleString()} to ${refundingEnrollment.name}.`);
        setRefundingEnrollment(null);
      } else {
        setAdminNotice(data.error || "Could not process refund.");
      }
    } finally {
      setSavingRefund(false);
    }
  };

  interface Lead {
    id: string;
    name: string;
    phone: string;
    courseTitle: string | null;
    source: string | null;
    status: "NEW" | "CONTACTED" | "CONVERTED" | "DROPPED";
    notes: string | null;
    createdAt: string;
  }
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoaded, setLeadsLoaded] = useState(false);
  const leadsLoading = activeTab === "admissions" && !leadsLoaded;

  interface WelcomeCallEnrollment {
    id: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string | null;
    courseTitle: string;
    welcomeCallStatus: "NOT_SCHEDULED" | "SCHEDULED" | "COMPLETED" | "NO_SHOW";
    welcomeCallAt: string | null;
    enrolledAt: string;
  }
  const [welcomeCalls, setWelcomeCalls] = useState<WelcomeCallEnrollment[]>([]);
  const [welcomeCallsLoaded, setWelcomeCallsLoaded] = useState(false);
  const welcomeCallsLoading = activeTab === "admissions" && !welcomeCallsLoaded;

  useEffect(() => {
    if (activeTab !== "admissions") return;
    if (!leadsLoaded) {
      apiFetch("/api/admin/leads")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setLeads(data.leads || []);
          setLeadsLoaded(true);
        })
        .catch(() => setLeadsLoaded(true));
    }
    if (!welcomeCallsLoaded) {
      apiFetch("/api/admin/welcome-calls")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setWelcomeCalls(data.enrollments || []);
          setWelcomeCallsLoaded(true);
        })
        .catch(() => setWelcomeCallsLoaded(true));
    }
  }, [activeTab, leadsLoaded, welcomeCallsLoaded]);

  const updateLeadStatus = async (leadId: string, status: Lead["status"]) => {
    const res = await apiFetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    }
  };

  const [editingWelcomeCall, setEditingWelcomeCall] = useState<WelcomeCallEnrollment | null>(null);
  const [welcomeCallForm, setWelcomeCallForm] = useState({ status: "SCHEDULED" as WelcomeCallEnrollment["welcomeCallStatus"], scheduledAt: "" });
  const [savingWelcomeCall, setSavingWelcomeCall] = useState(false);
  const openEditWelcomeCall = (e: WelcomeCallEnrollment) => {
    setEditingWelcomeCall(e);
    setWelcomeCallForm({
      status: e.welcomeCallStatus === "NOT_SCHEDULED" ? "SCHEDULED" : e.welcomeCallStatus,
      scheduledAt: e.welcomeCallAt ? e.welcomeCallAt.slice(0, 16) : ""
    });
  };
  const saveWelcomeCall = async () => {
    if (!editingWelcomeCall) return;
    setSavingWelcomeCall(true);
    try {
      const res = await apiFetch(`/api/admin/enrollments/${editingWelcomeCall.id}/welcome-call`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          welcomeCallStatus: welcomeCallForm.status,
          welcomeCallAt: welcomeCallForm.scheduledAt || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setWelcomeCalls((prev) =>
          prev.map((w) =>
            w.id === editingWelcomeCall.id
              ? { ...w, welcomeCallStatus: welcomeCallForm.status, welcomeCallAt: welcomeCallForm.scheduledAt || null }
              : w
          )
        );
        setAdminNotice(
          welcomeCallForm.status === "NO_SHOW"
            ? data.whatsappSent
              ? `Welcome call marked No Show — WhatsApp check-in sent to ${editingWelcomeCall.studentName}.`
              : `Welcome call marked No Show for ${editingWelcomeCall.studentName} — WhatsApp couldn't be sent automatically (use the WhatsApp button on their row instead).`
            : `Welcome call updated for ${editingWelcomeCall.studentName}.`
        );
        setEditingWelcomeCall(null);
      }
    } finally {
      setSavingWelcomeCall(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "settings" || settingsLoaded) return;
    apiFetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setSiteSettingsForm({
          siteName: data.settings.siteName || "",
          copyrightText: data.settings.copyrightText || "",
          siteEmail: data.settings.siteEmail || "",
          description: data.settings.description || "",
          contactPhone: data.settings.contactPhone || "",
          supportEmail: data.settings.supportEmail || "",
          contactAddress: data.settings.contactAddress || "",
          allowRegistration: data.settings.allowRegistration || "enable"
        });
        setNotifyCategories(data.notifyCategories || []);
        setSettingsLoaded(true);
      })
      .catch(() => {});
  }, [activeTab, settingsLoaded]);

  const saveSiteSettings = async () => {
    setSavingSiteSettings(true);
    const res = await apiFetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteSettingsForm)
    });
    setSavingSiteSettings(false);
    if (res.ok) setAdminNotice("Website settings updated successfully.");
  };

  const toggleNotifyCategory = async (category: string) => {
    const next = notifyCategories.includes(category)
      ? notifyCategories.filter((c) => c !== category)
      : [...notifyCategories, category];
    setNotifyCategories(next);
    setSavingNotifyPrefs(true);
    await apiFetch("/api/admin/settings/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: next })
    }).catch(() => {});
    setSavingNotifyPrefs(false);
  };

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newTutor, setNewTutor] = useState("Mr. Victor");
  const [newTutorRole, setNewTutorRole] = useState("Senior Technical Instructor");
  const [newPriceFull, setNewPriceFull] = useState(79000);
  const [newPriceParts, setNewPriceParts] = useState(90000);
  const [newDeposit, setNewDeposit] = useState(35000);
  const [newDelivery, setNewDelivery] = useState("Physical Lab (Umuahia) + Live Zoom");
  const [newSchedule, setNewSchedule] = useState("3x a week · Flexible Batches");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const mapped = tabParam === "overview" ? "dashboard" : tabParam;
      setActiveTab(mapped);
      if (mapped.startsWith("instructor")) {
        setInstructorsMenuOpen(true);
      }
      if (mapped.startsWith("course")) {
        setCoursesMenuOpen(true);
      }
    }
  }, [searchParams]);

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
    router.push(`/admin?tab=${tabId}`);
  };

  // Combine demo student cards with live BEMS database students
  const liveBemsStudentCards: EduportStudentCard[] = adminStudents.map((stu, idx) => ({
    id: stu.id,
    name: stu.name,
    location:
      stu.deliveryMode === "Physical Lab (Umuahia)" ? "MOUAU Campus" : "Live Virtual",
    avatar:
      EDUPORT_STUDENTS[idx % EDUPORT_STUDENTS.length]?.avatar ||
      "https://api.dicebear.com/7.x/initials/svg?seed=Blessing%20Adeyemi&backgroundColor=7928CA&textColor=ffffff",
    payments: `₦${stu.amountPaid.toLocaleString()}`,
    totalCourse: 4,
    progress: stu.progressPercent,
    joinDate: stu.enrolledAt,
    email: stu.email,
    enrollmentId: stu.id,
    paymentStatus: stu.paymentStatus,
    coursePrice: stu.totalDue,
    amountPaidRaw: stu.amountPaid,
    paymentReference: stu.paymentReference,
    enrollmentStatus: stu.enrollmentStatus,
    secondChanceUsed: stu.secondChanceUsed,
  }));

  const combinedStudents: EduportStudentCard[] = [
    ...EDUPORT_STUDENTS,
    ...liveBemsStudentCards,
  ].filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.location.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredInstructors = EDUPORT_INSTRUCTORS.filter(
    (inst) =>
      inst.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
      inst.role.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) return;

    const createdTitle = newTitle.trim();
    await addCourse({
      title: createdTitle,
      slug: newSlug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      badge: "Newly Added Track",
      tutor: newTutor,
      tutorRole: newTutorRole,
      priceFull: Number(newPriceFull),
      priceParts: Number(newPriceParts),
      deposit: Number(newDeposit),
      delivery: newDelivery,
      schedule: newSchedule,
    });
    setShowAddCourseModal(false);
    setNewTitle("");
    setNewSlug("");
    setAdminNotice(`Course "${createdTitle}" has been added to the catalog.`);
  };

  return (
    <div className="min-h-screen flex bg-white text-[#1D2026] font-sans">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* ==================== LEFT DARK SIDEBAR (#24292D) ==================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] shrink-0 bg-[#24292D] text-white flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Brand + Navigation */}
        <div className="overflow-y-auto flex-1 px-4 pt-6 pb-4">
          {/* BEMS Logo */}
          <div className="flex items-center justify-between px-2 mb-7">
            <Link href="/" className="flex items-center gap-2.5 group min-w-0">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 shadow-xs">
                <Image src="/images/bems-logo.jpg" alt="BEMS Logo" fill sizes="36px" className="object-contain" />
              </div>
              <span className="font-display font-extrabold text-[17px] leading-tight tracking-tight text-white truncate">
                BEMS INSTITUTE
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dashboard Link */}
          <button
            type="button"
            onClick={() => switchTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
              activeTab === "dashboard"
                ? "text-[#AE54C6]"
                : "text-white/90 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          {/* Section Label: Pages */}
          <div className="px-3.5 pt-5 pb-2 text-[12px] font-medium text-[#747579]">
            Pages
          </div>

          <nav className="space-y-1">
            {/* Courses Accordion */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setCoursesMenuOpen((prev) => !prev);
                  switchTab("courses");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                  activeTab === "courses"
                    ? "bg-[#1B2228] text-[#AE54C6]"
                    : "text-white/90 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-3">
                  <ShoppingBasket className="w-4 h-4 shrink-0" />
                  <span>Courses</span>
                </span>
                {coursesMenuOpen ? (
                  <ChevronUp className="w-4 h-4 opacity-75" />
                ) : (
                  <ChevronDown className="w-4 h-4 opacity-75" />
                )}
              </button>

              {coursesMenuOpen && (
                <div className="mt-1 ml-2 pl-7 pr-2 py-1.5 space-y-1.5 text-[13.5px]">
                  <button
                    type="button"
                    onClick={() => switchTab("courses")}
                    className={`w-full text-left py-1.5 font-medium transition-colors cursor-pointer ${
                      activeTab === "courses"
                        ? "text-[#AE54C6]"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    All Courses
                  </button>
                  <Link
                    href="/courses"
                    className="block py-1.5 text-white/80 hover:text-white font-medium transition-colors"
                  >
                    Course Category
                  </Link>
                  <Link
                    href="/courses/web-dev"
                    className="block py-1.5 text-white/80 hover:text-white font-medium transition-colors"
                  >
                    Course Detail
                  </Link>
                </div>
              )}
            </div>

            {/* Students */}
            <button
              type="button"
              onClick={() => switchTab("students")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                activeTab === "students"
                  ? "text-[#AE54C6]"
                  : "text-white/90 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Students</span>
            </button>

            {/* Graduate Outcomes */}
            <Link
              href="/admin/graduates"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold text-white/90 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Star className="w-4 h-4 shrink-0" />
              <span>Graduate Outcomes</span>
            </Link>

            {/* Instructors Accordion (Matches Image 5) */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setInstructorsMenuOpen((prev) => !prev);
                  if (!activeTab.startsWith("instructor")) {
                    switchTab("instructors");
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                  activeTab.startsWith("instructor")
                    ? "bg-[#1B2228] text-[#AE54C6]"
                    : "text-white/90 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Instructors</span>
                </span>
                {instructorsMenuOpen ? (
                  <ChevronUp className="w-4 h-4 opacity-75" />
                ) : (
                  <ChevronDown className="w-4 h-4 opacity-75" />
                )}
              </button>

              {instructorsMenuOpen && (
                <div className="mt-1 ml-2 pl-6 pr-2 py-2 space-y-2.5 text-[13.5px]">
                  <button
                    type="button"
                    onClick={() => switchTab("instructors")}
                    className={`w-full text-left font-medium transition-colors cursor-pointer ${
                      activeTab === "instructors"
                        ? "text-[#AE54C6]"
                        : "text-white/85 hover:text-white"
                    }`}
                  >
                    Instructors
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab("instructor-detail")}
                    className={`w-full text-left font-medium transition-colors cursor-pointer ${
                      activeTab === "instructor-detail"
                        ? "text-[#AE54C6]"
                        : "text-white/85 hover:text-white"
                    }`}
                  >
                    Instructor Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab("instructor-requests")}
                    className={`w-full flex items-center justify-between font-medium transition-colors cursor-pointer ${
                      activeTab === "instructor-requests"
                        ? "text-[#AE54C6]"
                        : "text-white/85 hover:text-white"
                    }`}
                  >
                    <span>Instructor requests</span>
                    <span className="w-5 h-5 rounded-full bg-[#AE54C6] text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Reviews */}
            <button
              type="button"
              onClick={() => switchTab("reviews")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                activeTab === "reviews"
                  ? "text-[#AE54C6]"
                  : "text-white/90 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Reviews</span>
            </button>

            {/* Admissions */}
            <button
              type="button"
              onClick={() => switchTab("admissions")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                activeTab === "admissions"
                  ? "text-[#AE54C6]"
                  : "text-white/90 hover:text-white hover:bg-white/5"
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Admissions</span>
            </button>

            {/* Placements */}
            <button
              type="button"
              onClick={() => switchTab("placements")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                activeTab === "placements"
                  ? "text-[#AE54C6]"
                  : "text-white/90 hover:text-white hover:bg-white/5"
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>Placements</span>
            </button>

            {/* Earnings */}
            <button
              type="button"
              onClick={() => switchTab("earnings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                activeTab === "earnings" || activeTab === "analytics"
                  ? "text-[#AE54C6]"
                  : "text-white/90 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Earnings</span>
            </button>

            {/* Admin Settings */}
            <button
              type="button"
              onClick={() => switchTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                activeTab === "settings"
                  ? "text-[#AE54C6]"
                  : "text-white/90 hover:text-white hover:bg-white/5"
              }`}
            >
              <UserCog className="w-4 h-4 shrink-0" />
              <span>Admin Settings</span>
            </button>

            {/* Authentication Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setAuthMenuOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[14px] font-semibold text-white/90 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Authentication</span>
                </span>
                {authMenuOpen ? (
                  <ChevronUp className="w-4 h-4 opacity-75" />
                ) : (
                  <ChevronDown className="w-4 h-4 opacity-75" />
                )}
              </button>

              {authMenuOpen && (
                <div className="mt-1 ml-2 pl-6 pr-2 py-2 space-y-2 text-[13.5px]">
                  <Link
                    href="/login"
                    className="block text-white/80 hover:text-white font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    className="block text-white/80 hover:text-white font-medium"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/forgot-password"
                    className="block text-white/80 hover:text-white font-medium"
                  >
                    Forgot Password
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Sidebar Footer Bar (Settings, Globe, Power) */}
        <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between text-[#8C939A]">
          <button
            type="button"
            onClick={() => switchTab("settings")}
            title="Admin Settings"
            className="hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
          <Link
            href="/"
            title="Public Website"
            className="hover:text-white transition-colors"
          >
            <Globe className="w-[18px] h-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            title="Sign Out"
            className="hover:text-[#D6293E] transition-colors cursor-pointer"
          >
            <Power className="w-[18px] h-[18px]" />
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top White Header Bar */}
        <header className="h-[72px] bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#24292D] hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-56 sm:w-72">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search"
                className="w-full bg-[#F5F7F9] rounded-lg pl-4 pr-10 py-2 text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:ring-1 focus:ring-[#AE54C6]"
              />
              <Search className="w-4 h-4 text-[#AE54C6] absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => switchTab("dashboard")}
              className="relative w-10 h-10 rounded-full bg-[#F5F7F9] hover:bg-slate-200/70 flex items-center justify-center text-[#24292D] transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#D6293E] ring-2 ring-white" />
            </button>

            <button
              type="button"
              onClick={() => switchTab("settings")}
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-100 shrink-0 cursor-pointer"
              title={user?.name || "Admin Profile"}
            >
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "Admin")}&backgroundColor=7928CA&textColor=ffffff`}
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-5 sm:p-8 max-w-[1440px] w-full mx-auto">
          {adminNotice && (
            <div className="mb-6 rounded-xl border border-[#065F46]/30 bg-[#D1FAE5] px-5 py-3.5 text-[13.5px] font-semibold text-[#065F46] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                {adminNotice}
              </span>
              <button
                type="button"
                onClick={() => setAdminNotice(null)}
                className="text-[#065F46] hover:underline text-xs font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 1: DASHBOARD OVERVIEW (Matches Images 1 & 2)         */}
          {/* ========================================================= */}
          {activeTab === "dashboard" && (
            <div>
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight mb-6">
                Dashboard
              </h1>

              {/* 4 Pastel Counter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-7">
                {/* 1. Completed Courses */}
                <div className="bg-[#FEF6E0] rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <div className="font-display text-[32px] font-extrabold text-[#1D2026] leading-none mb-2">
                      1958
                    </div>
                    <div className="text-[14px] font-medium text-[#475569]">
                      Completed Courses
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#F7C32E] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Monitor className="w-6 h-6" />
                  </div>
                </div>

                {/* 2. Enrolled Courses */}
                <div className="bg-[#F6ECF9] rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <div className="font-display text-[32px] font-extrabold text-[#1D2026] leading-none mb-2">
                      1600
                    </div>
                    <div className="text-[14px] font-medium text-[#475569]">
                      Enrolled Courses
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#A16EBD] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <UserIcon className="w-6 h-6" />
                  </div>
                </div>

                {/* 3. Course In Progress */}
                <div className="bg-[#F7EDF9] rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <div className="font-display text-[32px] font-extrabold text-[#1D2026] leading-none mb-2">
                      1235
                    </div>
                    <div className="text-[14px] font-medium text-[#475569]">
                      Course In Progress
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#AE54C6] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>

                {/* 4. Total Watch Time */}
                <div className="bg-[#F7EDF9] rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <div className="font-display text-[32px] font-extrabold text-[#1D2026] leading-none mb-2">
                      845 hrs
                    </div>
                    <div className="text-[14px] font-medium text-[#475569]">
                      Total Watch Time
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#AE54C6] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Middle Row: Earnings Chart (8 cols) + Support Requests (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-7">
                {/* Earnings Card */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] p-6">
                  <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                      Earnings
                    </h2>
                  </div>
                  <EarningsLineChart />
                </div>

                {/* Support Requests Card */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] p-6 flex flex-col">
                  <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                      Support Requests
                    </h2>
                    <button
                      type="button"
                      onClick={() => switchTab("reviews")}
                      className="text-[13px] font-semibold text-[#AE54C6] hover:underline cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 flex-1">
                    {SUPPORT_REQUESTS.map((item) => (
                      <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-11 h-11 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-11 h-11 rounded-full ${item.badgeBg} ${item.badgeText} font-bold text-[13px] flex items-center justify-center shrink-0`}
                          >
                            {item.initials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[14.5px] font-bold text-[#1D2026] hover:text-[#AE54C6] transition-colors cursor-pointer">
                            {item.name}
                          </h3>
                          {item.boldPrefix ? (
                            <p className="text-[13px] text-[#747579] leading-snug mt-0.5">
                              <span className="font-bold text-[#475569]">{item.boldPrefix}</span>{" "}
                              assign you a new ticket for{" "}
                              <span className="font-bold text-[#475569]">{item.boldSuffix}</span>
                            </p>
                          ) : (
                            <p className="text-[13px] text-[#747579] leading-snug mt-0.5">
                              {item.message}
                            </p>
                          )}
                          <span className="text-[11.5px] text-[#9A9EA4] block mt-1">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom 3-Column Row: Top Instructors + Notice board + Traffic Sources */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Top Instructors */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] p-6">
                  <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                      Top Instructors
                    </h2>
                    <button
                      type="button"
                      onClick={() => switchTab("instructors")}
                      className="text-[13px] font-semibold text-[#AE54C6] hover:underline cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {TOP_INSTRUCTORS_LIST.map((inst) => (
                      <div
                        key={inst.name}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={inst.avatar}
                            alt={inst.name}
                            className="w-11 h-11 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[14.5px] font-bold text-[#1D2026] truncate">
                                {inst.name}
                              </span>
                              {inst.verified && (
                                <span
                                  className="w-4 h-4 rounded-full bg-[#17A2B8] text-white text-[10px] flex items-center justify-center shrink-0"
                                  title="Verified Instructor"
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[12px] text-[#747579] mt-0.5">
                              <span className="inline-flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-[#A16EBD]" />
                                {inst.courses} Courses
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-[#F7C32E] fill-[#F7C32E]" />
                                {inst.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => switchTab("instructors")}
                          className="px-3.5 py-1.5 rounded-lg bg-[#F5F7F9] hover:bg-[#AE54C6] text-[#24292D] hover:text-white text-[12.5px] font-semibold transition-colors shrink-0 cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Notice board */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between">
                  <div>
                    <div className="pb-4 mb-4 border-b border-slate-100">
                      <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                        Notice board
                      </h2>
                    </div>

                    <div className="relative pr-3 divide-y divide-slate-100">
                      {/* Decorative Scrollbar Track matching Image 2 */}
                      <div className="absolute right-0 top-12 bottom-2 w-1.5 rounded-full bg-slate-200">
                        <div className="w-1.5 h-36 rounded-full bg-[#747579]" />
                      </div>

                      <div className="py-3.5 first:pt-0 flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-lg bg-[#FFF2E2] text-[#FD7E14] flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-[14.5px] font-bold text-[#1D2026]">
                            Join New Instructor
                          </h3>
                          <p className="text-[13px] text-[#747579] leading-snug mt-0.5">
                            Arrived Fat weddings believed prospect
                          </p>
                          <span className="text-[11.5px] text-[#9A9EA4] block mt-1">
                            4 hour ago
                          </span>
                        </div>
                      </div>

                      <div className="py-3.5 flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-lg bg-[#E5F6F8] text-[#17A2B8] flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-[14.5px] font-bold text-[#1D2026]">
                            Update Syllabus
                          </h3>
                          <p className="text-[13px] text-[#747579] leading-snug mt-0.5">
                            Arrived Fat weddings believed prospect
                          </p>
                          <span className="text-[11.5px] text-[#9A9EA4] block mt-1">
                            2 days ago
                          </span>
                        </div>
                      </div>

                      <div className="py-3.5 last:pb-0 flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-lg bg-[#FBE9EB] text-[#D6293E] flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-[14.5px] font-bold text-[#1D2026]">
                            Update New Feature
                          </h3>
                          <p className="text-[13px] text-[#747579] leading-snug mt-0.5">
                            Arrived Fat weddings believed prospect
                          </p>
                          <span className="text-[11.5px] text-[#9A9EA4] block mt-1">
                            3 days ago
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Mint Banner */}
                  <div className="mt-6 rounded-lg bg-[#F7EDF9] border border-[#AE54C6]/35 px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-[#AE54C6]">
                      45 more notices listed
                    </span>
                    <button
                      type="button"
                      onClick={() => switchTab("reviews")}
                      className="px-3 py-1.5 rounded-md bg-[#F1E2F5] hover:bg-[#AE54C6] text-[#AE54C6] hover:text-white text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      View all
                    </button>
                  </div>
                </div>

                {/* 3. Traffic Sources */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] p-6">
                  <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                      Traffic Sources
                    </h2>
                    <button
                      type="button"
                      onClick={() => switchTab("earnings")}
                      className="text-[13px] font-semibold text-[#AE54C6] hover:underline cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <TrafficSourcesDonutChart />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: STUDENTS (Matches Images 3 & 4)                   */}
          {/* ========================================================= */}
          {activeTab === "students" && (
            <div>
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight mb-6">
                Students
              </h1>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] p-6">
                {/* Search & View Toggle Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
                  <div className="relative w-full sm:max-w-[540px]">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-[14px] text-[#24292D] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#AE54C6]"
                    />
                    <Search className="w-4 h-4 text-[#747579] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {user?.role === "ADMIN" && (
                      <a
                        href={`${API_BASE_URL}/api/admin/roster/export`}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-[#475569] text-xs font-semibold hover:bg-slate-50"
                      >
                        Export CSV
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setStudentViewMode("grid")}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        studentViewMode === "grid"
                          ? "bg-[#24292D] text-white"
                          : "bg-[#F5F7F9] text-[#24292D] hover:bg-slate-200"
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentViewMode("list")}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        studentViewMode === "list"
                          ? "bg-[#24292D] text-white"
                          : "bg-[#F5F7F9] text-[#24292D] hover:bg-slate-200"
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {studentViewMode === "grid" ? (
                  /* 3-Column Student Cards Grid (Matches Images 3 & 4) */
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {combinedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] p-5 flex flex-col justify-between"
                      >
                        {/* Card Header: Avatar + Name + Location + Menu */}
                        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-13 h-13 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <h3 className="font-display text-[17px] font-extrabold text-[#1D2026] truncate">
                                {student.name}
                              </h3>
                              <p className="text-[12.5px] text-[#747579] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-[#747579] shrink-0" />
                                <span className="truncate">{student.location}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                student.enrollmentId &&
                                (student.paymentStatus === "PARTIAL" || student.paymentStatus === "PENDING") &&
                                student.coursePrice
                              ) {
                                updateStudentPayment(
                                  student.enrollmentId,
                                  "PAID_FULL",
                                  student.coursePrice
                                );
                                setAdminNotice(`Marked ${student.name} as PAID FULL.`);
                              }
                            }}
                            className="w-9 h-9 rounded-full bg-[#F5F7F9] hover:bg-slate-200 flex items-center justify-center text-[#24292D] shrink-0 cursor-pointer"
                            title="Student options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Metrics Body */}
                        <div className="py-4 space-y-3.5">
                          {/* Payments Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                              </div>
                              <span className="text-[14px] text-[#475569] font-medium">
                                Payments
                              </span>
                            </div>
                            <span className="text-[15px] font-bold text-[#475569]">
                              {student.payments}
                            </span>
                          </div>

                          {/* Total Course Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#F6ECF9] text-[#A16EBD] flex items-center justify-center">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <span className="text-[14px] text-[#475569] font-medium">
                                Total Course
                              </span>
                            </div>
                            <span className="text-[15px] font-bold text-[#475569]">
                              {student.totalCourse}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="pt-1">
                            <div className="text-[12.5px] font-extrabold text-[#1D2026] mb-1.5">
                              {student.progress}%
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#F7EDF9] overflow-hidden">
                              <div
                                style={{ width: `${student.progress}%` }}
                                className="h-full rounded-full bg-[#AE54C6]"
                              />
                            </div>
                          </div>

                          {student.paymentStatus === "PENDING" && student.paymentReference && (
                            <div className="pt-1 text-[11.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                              Claimed bank transfer ref:{" "}
                              <code className="font-mono font-bold">{student.paymentReference}</code>
                              {" "}— match against the bank statement before confirming.
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-[13px] text-[#747579]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#FD7E14]" />
                            <span>
                              Join at:{" "}
                              <strong className="text-[#1D2026] font-bold">
                                {student.joinDate}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-[#747579]">
                            <button
                              type="button"
                              className="hover:text-[#AE54C6] transition-colors cursor-pointer"
                              title="Message student"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="hover:text-[#D6293E] transition-colors cursor-pointer"
                              title="Suspend student"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List View Table with Live Payment Status Actions */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[12px] font-bold uppercase text-[#747579]">
                          <th className="py-3.5 px-4">Student</th>
                          <th className="py-3.5 px-4">Location</th>
                          <th className="py-3.5 px-4">Payments</th>
                          <th className="py-3.5 px-4">Courses</th>
                          <th className="py-3.5 px-4">Progress</th>
                          <th className="py-3.5 px-4">Join Date</th>
                          <th className="py-3.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[14px]">
                        {combinedStudents.map((stu) => (
                          <tr key={stu.id} className="hover:bg-slate-50/80">
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <img
                                src={stu.avatar}
                                alt={stu.name}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              <div>
                                <span className="font-bold text-[#1D2026] flex items-center gap-1.5">
                                  {stu.name}
                                  {stu.enrollmentStatus === "DROPPED" && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-[#FBE9EB] text-[#D6293E] text-[9.5px] font-bold uppercase">
                                      Dropped
                                    </span>
                                  )}
                                </span>
                                {stu.paymentStatus === "PENDING" && stu.paymentReference && (
                                  <span className="text-[11px] text-amber-700 block">
                                    Ref: <code className="font-mono font-bold">{stu.paymentReference}</code>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-[#747579]">{stu.location}</td>
                            <td className="py-3.5 px-4 font-bold text-[#AE54C6]">
                              {stu.payments}
                            </td>
                            <td className="py-3.5 px-4 text-[#475569]">{stu.totalCourse}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full bg-[#F7EDF9] overflow-hidden">
                                  <div
                                    style={{ width: `${stu.progress}%` }}
                                    className="h-full bg-[#AE54C6]"
                                  />
                                </div>
                                <span className="text-xs font-bold">{stu.progress}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-[#747579]">{stu.joinDate}</td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                {stu.enrollmentId &&
                                (stu.paymentStatus === "PARTIAL" || stu.paymentStatus === "PENDING") &&
                                stu.coursePrice ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateStudentPayment(
                                        stu.enrollmentId!,
                                        "PAID_FULL",
                                        stu.coursePrice!
                                      );
                                      setAdminNotice(`Marked ${stu.name} as PAID FULL.`);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-[#AE54C6] text-white text-xs font-semibold hover:bg-[#A03BBC] cursor-pointer"
                                  >
                                    Mark Paid Full
                                  </button>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-xs font-bold">
                                    Verified
                                  </span>
                                )}

                                {/* PRD §4.2 one-time "second chance" rejoin */}
                                {stu.enrollmentId && stu.enrollmentStatus === "ACTIVE" && (
                                  <button
                                    type="button"
                                    onClick={() => toggleDropped(stu.enrollmentId!, stu.name, "DROPPED")}
                                    className="px-2.5 py-1 rounded-md border border-slate-200 text-[#747579] text-[11px] font-semibold hover:bg-slate-50 cursor-pointer"
                                  >
                                    Mark Dropped
                                  </button>
                                )}
                                {stu.enrollmentId && stu.enrollmentStatus === "DROPPED" && !stu.secondChanceUsed && (
                                  <button
                                    type="button"
                                    onClick={() => openSecondChance(stu.enrollmentId!)}
                                    className="px-2.5 py-1 rounded-md border border-[#AE54C6] text-[#AE54C6] text-[11px] font-bold hover:bg-[#F7EDF9] cursor-pointer"
                                  >
                                    Second Chance →
                                  </button>
                                )}
                                {stu.enrollmentId && stu.enrollmentStatus === "DROPPED" && stu.secondChanceUsed && (
                                  <span className="text-[10.5px] text-[#8580A3]">Second chance already used</span>
                                )}

                                {user?.role === "ADMIN" &&
                                  stu.enrollmentId &&
                                  (stu.amountPaidRaw || 0) > 0 &&
                                  stu.paymentStatus !== "REFUNDED" && (
                                    <button
                                      type="button"
                                      onClick={() => openRefund(stu.enrollmentId!, stu.name, stu.amountPaidRaw || 0)}
                                      className="px-2.5 py-1 rounded-md border border-[#D6293E] text-[#D6293E] text-[11px] font-semibold hover:bg-[#FBE9EB] cursor-pointer"
                                    >
                                      Refund
                                    </button>
                                  )}
                                {stu.paymentStatus === "REFUNDED" && (
                                  <span className="px-2.5 py-1 rounded-md bg-[#FBE9EB] text-[#D6293E] text-[11px] font-bold">
                                    Refunded
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Footer matching Image 4 */}
                <div className="mt-8 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13.5px] text-[#747579]">
                  <div>Showing 1 to 8 of 20 entries</div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[1, 2, 3].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setStudentPage(p)}
                        className={`w-8 h-8 rounded-md text-[13px] font-bold flex items-center justify-center transition-colors cursor-pointer ${
                          studentPage === p
                            ? "bg-[#AE54C6] text-white"
                            : "bg-[#F7EDF9] text-[#AE54C6] hover:bg-[#AE54C6] hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setStudentPage((p) => Math.min(3, p + 1))}
                      className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3A: INSTRUCTORS GRID (activeTab === "instructors")   */}
          {/* ========================================================= */}
          {activeTab === "instructors" && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight">
                  Instructors
                </h1>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] p-6">
                {/* Search & View Toggle Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
                  <div className="relative w-full sm:max-w-[540px]">
                    <input
                      type="text"
                      value={instructorSearch}
                      onChange={(e) => setInstructorSearch(e.target.value)}
                      placeholder="Search"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-[14px] text-[#24292D] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#AE54C6]"
                    />
                    <Search className="w-4 h-4 text-[#747579] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setInstructorViewMode("grid")}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        instructorViewMode === "grid"
                          ? "bg-[#24292D] text-white"
                          : "bg-[#F5F7F9] text-[#24292D] hover:bg-slate-200"
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstructorViewMode("list")}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        instructorViewMode === "list"
                          ? "bg-[#24292D] text-white"
                          : "bg-[#F5F7F9] text-[#24292D] hover:bg-slate-200"
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3-Column Instructor Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredInstructors.map((inst) => (
                    <div
                      key={inst.id}
                      className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] p-5 flex flex-col justify-between"
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={inst.avatar}
                            alt={inst.name}
                            className="w-13 h-13 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => switchTab("instructor-detail")}
                              className="font-display text-[17px] font-extrabold text-[#1D2026] hover:text-[#AE54C6] transition-colors truncate block text-left cursor-pointer"
                            >
                              {inst.name}
                            </button>
                            <p className="text-[12.5px] text-[#747579] truncate mt-0.5">
                              {inst.role}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => switchTab("instructor-detail")}
                          className="w-9 h-9 rounded-full bg-[#F5F7F9] hover:bg-slate-200 flex items-center justify-center text-[#24292D] shrink-0 cursor-pointer"
                          title="View Instructor Detail"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Middle Stats */}
                      <div className="py-4 space-y-3.5">
                        {/* Total Students */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FFF2E2] text-[#FD7E14] flex items-center justify-center">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <span className="text-[14px] text-[#475569] font-medium">
                              Total Students
                            </span>
                          </div>
                          <span className="text-[15px] font-bold text-[#475569]">
                            {inst.totalStudents}
                          </span>
                        </div>

                        {/* Total Courses */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F6ECF9] text-[#A16EBD] flex items-center justify-center">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <span className="text-[14px] text-[#475569] font-medium">
                              Total Courses
                            </span>
                          </div>
                          <span className="text-[15px] font-bold text-[#475569]">
                            {inst.totalCourses}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Footer: Stars + Envelope */}
                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-4 h-4 ${
                                starIdx <= 4
                                  ? "text-[#F7C32E] fill-[#F7C32E]"
                                  : "text-[#F7C32E]"
                              }`}
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => switchTab("instructor-detail")}
                          className="text-[#747579] hover:text-[#AE54C6] transition-colors cursor-pointer"
                          title="Contact Instructor"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3B: INSTRUCTOR DETAIL (Matches Images 4, 2, & 1)     */}
          {/* ========================================================= */}
          {activeTab === "instructor-detail" && (
            <div className="space-y-7">
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight">
                Instructor detail
              </h1>

              {/* Top Row: Personal Information (7 cols) + Active Students & New Enrollment (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Personal Information Card */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                    <h2 className="font-display text-[19px] font-extrabold text-[#1D2026]">
                      Personal Information
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <img
                        src="https://api.dicebear.com/7.x/initials/svg?seed=Emeka%20Nwosu&backgroundColor=18143D&textColor=ffffff"
                        alt="Louis Ferguson"
                        className="w-20 h-20 rounded-full object-cover shadow-md"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-[14px]">
                      <div>
                        <span className="text-[#747579]">Title: </span>
                        <strong className="text-[#1D2026] font-bold">Mr.</strong>
                      </div>
                      <div>
                        <span className="text-[#747579]">Email ID: </span>
                        <strong className="text-[#1D2026] font-bold">example@gmail.com</strong>
                      </div>
                      <div>
                        <span className="text-[#747579]">Full Name: </span>
                        <strong className="text-[#1D2026] font-bold">Louis Ferguson</strong>
                      </div>
                      <div>
                        <span className="text-[#747579]">Location: </span>
                        <strong className="text-[#1D2026] font-bold">California</strong>
                      </div>
                      <div>
                        <span className="text-[#747579]">User Name: </span>
                        <strong className="text-[#1D2026] font-bold">Lousifer</strong>
                      </div>
                      <div>
                        <span className="text-[#747579]">Joining Date: </span>
                        <strong className="text-[#1D2026] font-bold">29 Aug 2019</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[#747579]">Mobile Number: </span>
                        <strong className="text-[#1D2026] font-bold">+123 456 789 10</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[#747579]">Education: </span>
                        <strong className="text-[#1D2026] font-bold">
                          Bachelor in Computer Graphics, Masters in Computer Graphics
                        </strong>
                      </div>
                      <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-start gap-2">
                        <span className="text-[#747579] shrink-0">Description:</span>
                        <p className="text-[#1D2026] font-bold leading-relaxed text-[13.5px]">
                          As it so contrasted oh estimating instrument. Size like body someone had. Are conduct viewing boy minutes warrant the expense Tolerably behavior may admit daughters offending her ask own. Praise effect wishes change way and any wanted. Lively use looked latter regard had. Do he it part more last in
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Stacked Sparkline Cards */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Active Students Card */}
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden flex-1 flex flex-col justify-between">
                    <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                      <h2 className="font-display text-[19px] font-extrabold text-[#1D2026]">
                        Active Students
                      </h2>
                    </div>

                    <div className="px-6 pt-5 pb-2 flex items-center justify-between">
                      <span className="font-display text-[28px] font-extrabold text-[#1D3B53]">
                        984
                      </span>
                      <div className="text-[13px]">
                        <span className="text-[#AE54C6] font-semibold">0.20% ↑</span>{" "}
                        <span className="text-[#747579]">vs last Week</span>
                      </div>
                    </div>

                    <div className="w-full pt-2">
                      <svg viewBox="0 0 400 115" className="w-full h-28 block" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="activeStudentsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#AE54C6" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#AE54C6" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 95 C 40 85, 65 78, 95 52 C 125 32, 160 40, 205 42 C 245 44, 270 72, 300 68 C 335 64, 365 25, 400 20 L 400 115 L 0 115 Z"
                          fill="url(#activeStudentsGrad)"
                        />
                        <path
                          d="M 0 95 C 40 85, 65 78, 95 52 C 125 32, 160 40, 205 42 C 245 44, 270 72, 300 68 C 335 64, 365 25, 400 20"
                          fill="none"
                          stroke="#AE54C6"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* New Enrollment Card */}
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden flex-1 flex flex-col justify-between">
                    <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                      <h2 className="font-display text-[19px] font-extrabold text-[#1D2026]">
                        New Enrollment
                      </h2>
                    </div>

                    <div className="px-6 pt-5 pb-2 flex items-center justify-between">
                      <span className="font-display text-[28px] font-extrabold text-[#1D3B53]">
                        140
                      </span>
                      <div className="text-[13px]">
                        <span className="text-[#AE54C6] font-semibold">0.35% ↑</span>{" "}
                        <span className="text-[#747579]">vs last Week</span>
                      </div>
                    </div>

                    <div className="w-full pt-2">
                      <svg viewBox="0 0 400 115" className="w-full h-28 block" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="newEnrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A16EBD" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#A16EBD" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 102 C 45 92, 95 92, 140 65 C 175 45, 210 28, 235 32 C 260 36, 275 82, 305 78 C 340 74, 370 18, 400 18 L 400 115 L 0 115 Z"
                          fill="url(#newEnrollmentGrad)"
                        />
                        <path
                          d="M 0 102 C 45 92, 95 92, 140 65 C 175 45, 210 28, 235 32 C 260 36, 275 82, 305 78 C 340 74, 370 18, 400 18"
                          fill="none"
                          stroke="#A16EBD"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Card: Courses List (Matches Image 2) */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                  <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                    Courses List
                  </h2>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                      <thead>
                        <tr className="bg-[#24292D] text-white text-[13.5px] font-bold">
                          <th className="py-3.5 px-5 rounded-l-lg">Course Name</th>
                          <th className="py-3.5 px-4">Enrolled</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-5 rounded-r-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[14px]">
                        {[
                          {
                            title: "Building Scalable APIs with GraphQL",
                            enrolled: 412,
                            status: "Live",
                            statusStyle: "bg-[#F7EDF9] text-[#AE54C6]",
                            thumbBg: "bg-[#FDEBC8]",
                            thumbText: "💎",
                          },
                          {
                            title: "Graphic Design Masterclass",
                            enrolled: 254,
                            status: "Live",
                            statusStyle: "bg-[#F7EDF9] text-[#AE54C6]",
                            thumbBg: "bg-[#1D3B53] text-[#38BDF8]",
                            thumbText: "Ps",
                          },
                          {
                            title: "Learn Invision",
                            enrolled: 0,
                            status: "Pending",
                            statusStyle: "bg-[#FEF6E0] text-[#F7C32E]",
                            thumbBg: "bg-[#D6293E] text-white",
                            thumbText: "in",
                          },
                          {
                            title: "Deep Learning with React-Native",
                            enrolled: 98,
                            status: "Live",
                            statusStyle: "bg-[#F7EDF9] text-[#AE54C6]",
                            thumbBg: "bg-[#E0F7FA] text-[#00BCD4]",
                            thumbText: "⚛",
                          },
                          {
                            title: "Bootstrap 5 From Scratch",
                            enrolled: 58,
                            status: "Cancel",
                            statusStyle: "bg-[#FBE9EB] text-[#D6293E]",
                            thumbBg: "bg-[#ECD7F2] text-[#A16EBD]",
                            thumbText: "B",
                          },
                        ].map((item) => (
                          <tr key={item.title} className="hover:bg-slate-50/70">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3.5">
                                <div
                                  className={`w-14 h-10 rounded-md ${item.thumbBg} font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                                >
                                  {item.thumbText}
                                </div>
                                <span className="font-bold text-[#1D2026]">
                                  {item.title}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-[#747579]">{item.enrolled}</td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold ${item.statusStyle}`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <Link
                                href="/courses"
                                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-md bg-[#E5F6F8] hover:bg-[#17A2B8] text-[#17A2B8] hover:text-white text-[12.5px] font-bold transition-colors"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="mt-6 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13.5px] text-[#747579]">
                    <div>Showing 1 to 8 of 20 entries</div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-[13px] font-bold flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#AE54C6] text-white text-[13px] font-bold flex items-center justify-center cursor-pointer"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-[13px] font-bold flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                      >
                        3
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card: All Reviews (Matches Image 1) */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                  <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                    All Reviews
                  </h2>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                      <thead>
                        <tr className="bg-[#24292D] text-white text-[13.5px] font-bold">
                          <th className="py-3.5 px-5 rounded-l-lg">Student Name</th>
                          <th className="py-3.5 px-4">Course Name</th>
                          <th className="py-3.5 px-4">Rating</th>
                          <th className="py-3.5 px-5 rounded-r-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[14px]">
                        {[
                          {
                            name: "Ngozi Eze",
                            course: "Building Scalable APIs with GraphQL",
                            stars: 5,
                            activeRow: true,
                            avatar:
                              "https://api.dicebear.com/7.x/initials/svg?seed=Ngozi%20Eze&backgroundColor=671FB0&textColor=ffffff",
                          },
                          {
                            name: "Blessing Adeyemi",
                            course: "Graphic Design Masterclass",
                            stars: 5,
                            activeRow: false,
                            avatar:
                              "https://api.dicebear.com/7.x/initials/svg?seed=Blessing%20Adeyemi&backgroundColor=7928CA&textColor=ffffff",
                          },
                          {
                            name: "Emeka Nwosu",
                            course: "Deep Learning with React-Native",
                            stars: 4,
                            activeRow: false,
                            avatar:
                              "https://api.dicebear.com/7.x/initials/svg?seed=Emeka%20Nwosu&backgroundColor=18143D&textColor=ffffff",
                          },
                          {
                            name: "Tunde Bakare",
                            course: "Bootstrap 5 From Scratch",
                            stars: 4,
                            activeRow: false,
                            avatar:
                              "https://api.dicebear.com/7.x/initials/svg?seed=Tunde%20Bakare&backgroundColor=671FB0&textColor=ffffff",
                          },
                          {
                            name: "Chiamaka Nnamdi",
                            course: "Learn Invision",
                            stars: 4,
                            activeRow: false,
                            avatar:
                              "https://api.dicebear.com/7.x/initials/svg?seed=Chiamaka%20Nnamdi&backgroundColor=7928CA&textColor=ffffff",
                          },
                        ].map((rev) => (
                          <tr
                            key={rev.name}
                            className={rev.activeRow ? "bg-[#F2F4F6]" : "hover:bg-slate-50/70"}
                          >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={rev.avatar}
                                  alt={rev.name}
                                  className="w-10 h-10 rounded-full object-cover shrink-0"
                                />
                                <span className="font-bold text-[#1D2026]">
                                  {rev.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-bold text-[#1D2026]">
                              {rev.course}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-4 h-4 ${
                                      s <= rev.stars
                                        ? "text-[#F7C32E] fill-[#F7C32E]"
                                        : "text-[#F7C32E]"
                                    }`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <button
                                type="button"
                                onClick={() => switchTab("reviews")}
                                className={`px-3.5 py-1.5 rounded-md text-[12.5px] font-bold transition-colors cursor-pointer ${
                                  rev.activeRow
                                    ? "bg-[#17A2B8] text-white"
                                    : "bg-[#E5F6F8] text-[#17A2B8] hover:bg-[#17A2B8] hover:text-white"
                                }`}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="mt-6 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13.5px] text-[#747579]">
                    <div>Showing 1 to 8 of 20 entries</div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-[13px] font-bold flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#AE54C6] text-white text-[13px] font-bold flex items-center justify-center cursor-pointer"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-[13px] font-bold flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                      >
                        3
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3C: INSTRUCTOR REQUESTS (Matches Image 3)            */}
          {/* ========================================================= */}
          {activeTab === "instructor-requests" && (
            <div>
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight mb-6">
                Instructor Requests
              </h1>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Top Filter Bar */}
                <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative w-full sm:max-w-[540px]">
                    <input
                      type="text"
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      placeholder="Search"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-[14px] text-[#24292D] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#AE54C6]"
                    />
                    <Search className="w-4 h-4 text-[#747579] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <select
                    value={requestSort}
                    onChange={(e) => setRequestSort(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full sm:w-56 text-[13.5px] text-[#747579] focus:outline-none focus:border-[#AE54C6]"
                  >
                    <option value="default">Sort by</option>
                    <option value="newest">Newest Requested</option>
                    <option value="pending">Pending First</option>
                    <option value="accepted">Accepted First</option>
                  </select>
                </div>

                {/* Requests Table */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-[#24292D] text-white text-[13.5px] font-bold">
                          <th className="py-3.5 px-5 rounded-l-lg">Instructor name</th>
                          <th className="py-3.5 px-4">Subject</th>
                          <th className="py-3.5 px-4">Requested Date</th>
                          <th className="py-3.5 px-5 rounded-r-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[14px]">
                        {instructorRequests
                          .filter(
                            (req) =>
                              req.name
                                .toLowerCase()
                                .includes(requestSearch.toLowerCase()) ||
                              req.subject
                                .toLowerCase()
                                .includes(requestSearch.toLowerCase())
                          )
                          .map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50/70">
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={req.avatar}
                                    alt={req.name}
                                    className="w-10 h-10 rounded-full object-cover shrink-0"
                                  />
                                  <span className="font-bold text-[#1D2026]">
                                    {req.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 font-bold text-[#1D2026]">
                                {req.subject}
                              </td>
                              <td className="py-4 px-4 text-[#747579]">
                                {req.requestedDate}
                              </td>
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2">
                                  {req.status === "PENDING" && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInstructorRequests((prev) =>
                                            prev.map((r) =>
                                              r.id === req.id
                                                ? { ...r, status: "ACCEPTED" }
                                                : r
                                            )
                                          );
                                          setAdminNotice(
                                            `Accepted ${req.name}'s instructor application.`
                                          );
                                        }}
                                        className="px-3.5 py-1.5 rounded-md bg-[#F7EDF9] hover:bg-[#AE54C6] text-[#AE54C6] hover:text-white text-[12.5px] font-bold transition-colors cursor-pointer"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInstructorRequests((prev) =>
                                            prev.map((r) =>
                                              r.id === req.id
                                                ? { ...r, status: "REJECTED" }
                                                : r
                                            )
                                          );
                                          setAdminNotice(
                                            `Rejected ${req.name}'s instructor application.`
                                          );
                                        }}
                                        className="px-3.5 py-1.5 rounded-md bg-[#F2F4F6] hover:bg-slate-300 text-[#747579] text-[12.5px] font-bold transition-colors cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {req.status === "ACCEPTED" && (
                                    <span className="px-3.5 py-1.5 rounded-md bg-[#53D1A8] text-white text-[12.5px] font-bold">
                                      Accepted
                                    </span>
                                  )}

                                  {req.status === "REJECTED" && (
                                    <span className="px-3.5 py-1.5 rounded-md bg-[#B0B5BA] text-white text-[12.5px] font-bold">
                                      Rejected
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => switchTab("instructor-detail")}
                                    className="px-3.5 py-1.5 rounded-md bg-[#F7EDF9] hover:bg-[#AE54C6] text-[#AE54C6] hover:text-white text-[12.5px] font-bold transition-colors cursor-pointer"
                                  >
                                    View App
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: COURSES MANAGEMENT                                */}
          {/* ========================================================= */}
          {activeTab === "courses" && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight">
                  Courses
                </h1>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#AE54C6] hover:bg-[#A03BBC] text-white text-[14px] font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Course</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(adminCourses.length > 0
                  ? adminCourses
                  : courses.map((c) => ({
                      id: c.id,
                      title: c.title,
                      slug: c.slug,
                      badge: c.badge,
                      tutor: c.tutor,
                      tutorRole: c.tutorRole,
                      priceFull: c.priceFull,
                      priceParts: c.priceParts,
                      deposit: c.deposit,
                      enrolledCount: 24,
                      modulesCount: c.modules.length,
                      status: "ACTIVE" as const,
                      delivery: c.delivery,
                      schedule: c.schedule,
                    }))
                ).map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-xs font-bold">
                          {course.badge}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-xs font-bold">
                          {course.status}
                        </span>
                      </div>
                      <h3 className="font-display text-[19px] font-extrabold text-[#1D2026] mb-1">
                        {course.title}
                      </h3>
                      <p className="text-[13px] text-[#747579] mb-4">
                        Instructor: <strong className="text-[#1D2026]">{course.tutor}</strong> ({course.tutorRole})
                      </p>

                      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-[#F5F7F9] mb-4">
                        <div>
                          <div className="text-[11px] text-[#747579] uppercase font-bold">Full Fee</div>
                          <div className="text-[15px] font-extrabold text-[#1D2026]">
                            ₦{course.priceFull.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#747579] uppercase font-bold">Installment</div>
                          <div className="text-[15px] font-extrabold text-[#AE54C6]">
                            ₦{course.priceParts.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#747579] uppercase font-bold">Enrolled</div>
                          <div className="text-[15px] font-extrabold text-[#AE54C6]">
                            {course.enrolledCount} Students
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-[13px] font-semibold text-[#AE54C6] hover:underline"
                      >
                        View Course Page →
                      </Link>
                      {adminCourses.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateCourseStatus(
                              course.id,
                              course.status === "ACTIVE" ? "UPCOMING" : "ACTIVE"
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#F5F7F9] hover:bg-slate-200 text-xs font-bold text-[#24292D] cursor-pointer"
                        >
                          Toggle Status
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: REVIEWS (Matches Image 5 + Image 3 Bottom Row)    */}
          {/* ========================================================= */}
          {activeTab === "reviews" && (
            <div className="space-y-7">
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight">
                Reviews
              </h1>

              {/* Top Reviews Table Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[740px]">
                    <thead>
                      <tr className="bg-[#24292D] text-white text-[13.5px] font-bold">
                        <th className="py-3.5 px-4 rounded-l-lg">#</th>
                        <th className="py-3.5 px-4">Student Name</th>
                        <th className="py-3.5 px-4">Course Name</th>
                        <th className="py-3.5 px-4">Rating</th>
                        <th className="py-3.5 px-4">Hide/Show</th>
                        <th className="py-3.5 px-4 rounded-r-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[14px]">
                      {reviewsList.map((rev) => (
                        <tr key={rev.id} className="hover:bg-slate-50/70">
                          <td className="py-4 px-4 text-[#747579] font-medium">
                            {rev.id}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={rev.avatar}
                                alt={rev.studentName}
                                className="w-10 h-10 rounded-full object-cover shrink-0"
                              />
                              <span className="font-bold text-[#1D2026]">
                                {rev.studentName}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#1D2026]">
                            {rev.courseName}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-4 h-4 ${
                                    s <= rev.rating
                                      ? "text-[#F7C32E] fill-[#F7C32E]"
                                      : "text-[#F7C32E]"
                                  }`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={rev.visible}
                              onClick={() =>
                                setReviewsList((prev) =>
                                  prev.map((item) =>
                                    item.id === rev.id
                                      ? { ...item, visible: !item.visible }
                                      : item
                                  )
                                )
                              }
                              className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                                rev.visible
                                  ? "bg-[#AE54C6] justify-end"
                                  : "bg-[#E2E8F0] justify-start"
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full bg-white shadow-2xs block" />
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setAdminNotice(
                                    `Opened review editor for ${rev.studentName}.`
                                  )
                                }
                                className="w-8 h-8 rounded-full bg-[#F7EDF9] hover:bg-[#AE54C6] text-[#AE54C6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Edit Review"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewsList((prev) =>
                                    prev.filter((item) => item.id !== rev.id)
                                  );
                                  setAdminNotice(
                                    `Deleted review #${rev.id} from ${rev.studentName}.`
                                  );
                                }}
                                className="w-8 h-8 rounded-full bg-[#FBE9EB] hover:bg-[#D6293E] text-[#D6293E] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Delete Review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => switchTab("instructor-detail")}
                                className="px-3.5 py-1.5 rounded-md bg-[#E5F6F8] hover:bg-[#17A2B8] text-[#17A2B8] hover:text-white text-[12.5px] font-bold transition-colors cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className="mt-6 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13.5px] text-[#747579]">
                  <div>Showing 1 to 8 of 20 entries</div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-[13px] font-bold flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                    >
                      1
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md bg-[#AE54C6] text-white text-[13px] font-bold flex items-center justify-center cursor-pointer"
                    >
                      2
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-[13px] font-bold flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                    >
                      3
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom 2-Column Row: Top Rated Courses (7 cols) + Reviews Analytics (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Top Rated Courses */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                    <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                      Top Rated Courses
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[540px]">
                        <thead>
                          <tr className="bg-[#24292D] text-white text-[13.5px] font-bold">
                            <th className="py-3.5 px-4 rounded-l-lg">Course Name</th>
                            <th className="py-3.5 px-3">Enrolled</th>
                            <th className="py-3.5 px-3">Rating</th>
                            <th className="py-3.5 px-4 rounded-r-lg">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[14px]">
                          {[
                            {
                              title: "AI & Automation",
                              enrolled: 22,
                              stars: 5,
                              thumbBg: "bg-[#F7EDF9] text-[#AE54C6]",
                              thumbText: "🤖",
                            },
                            {
                              title: "Web Development",
                              enrolled: 31,
                              stars: 5,
                              thumbBg: "bg-[#303654] text-white",
                              thumbText: "</>",
                            },
                            {
                              title: "Product Design (UI/UX)",
                              enrolled: 18,
                              stars: 5,
                              thumbBg: "bg-[#F7EDF9] text-[#AE54C6]",
                              thumbText: "🎨",
                            },
                            {
                              title: "Cybersecurity",
                              enrolled: 15,
                              stars: 4,
                              thumbBg: "bg-[#303654] text-white",
                              thumbText: "🔒",
                            },
                            {
                              title: "Mobile App Engineering",
                              enrolled: 12,
                              stars: 4,
                              thumbBg: "bg-[#F7EDF9] text-[#AE54C6]",
                              thumbText: "📱",
                            },
                          ].map((course) => (
                            <tr key={course.title} className="hover:bg-slate-50/70">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-13 h-10 rounded-md ${course.thumbBg} font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                                  >
                                    {course.thumbText}
                                  </div>
                                  <span className="font-bold text-[#1D2026] leading-snug">
                                    {course.title}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-3 text-[#747579]">
                                {course.enrolled}
                              </td>
                              <td className="py-4 px-3">
                                <div className="flex flex-wrap items-center gap-0.5 max-w-[76px]">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3.5 h-3.5 ${
                                        s <= course.stars
                                          ? "text-[#F7C32E] fill-[#F7C32E]"
                                          : "text-[#F7C32E]"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-col items-start gap-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      className="w-8 h-8 rounded-full bg-[#F7EDF9] hover:bg-[#AE54C6] text-[#AE54C6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                      title="Edit"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      className="w-8 h-8 rounded-full bg-[#FBE9EB] hover:bg-[#D6293E] text-[#D6293E] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <Link
                                    href="/courses"
                                    className="px-3.5 py-1 rounded-md bg-[#E5F6F8] hover:bg-[#17A2B8] text-[#17A2B8] hover:text-white text-[12px] font-bold transition-colors"
                                  >
                                    View
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="mt-6 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13.5px] text-[#747579]">
                      <div>Showing 1 to 8 of 20 entries</div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-[13px] font-bold flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                        >
                          1
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-md bg-[#AE54C6] text-white text-[13px] font-bold flex items-center justify-center cursor-pointer"
                        >
                          2
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] text-[13px] font-bold flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                        >
                          3
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-md bg-[#F7EDF9] text-[#AE54C6] flex items-center justify-center hover:bg-[#AE54C6] hover:text-white transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Reviews Analytics */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                  <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                    <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                      Reviews Analytics
                    </h2>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#F7EDF9] rounded-lg p-4">
                        <div className="text-[13px] text-[#747579] mb-1">
                          Total Positive Review
                        </div>
                        <div className="font-display text-[22px] font-extrabold text-[#1D2026]">
                          85%
                        </div>
                      </div>
                      <div className="bg-[#FBE9EB] rounded-lg p-4">
                        <div className="text-[13px] text-[#747579] mb-1">
                          Total Negative Review
                        </div>
                        <div className="font-display text-[22px] font-extrabold text-[#1D2026]">
                          15%
                        </div>
                      </div>
                    </div>

                    {/* 2-Segment Green/Red Donut Chart */}
                    <div className="my-auto py-8 flex items-center justify-center">
                      <div className="w-56 h-56 relative">
                        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                          {/* Green 73% visual arc */}
                          <circle
                            cx="80"
                            cy="80"
                            r="60"
                            fill="transparent"
                            stroke="#AE54C6"
                            strokeWidth="26"
                            strokeDasharray="273 377"
                            strokeDashoffset="0"
                          />
                          {/* Red 27% visual arc */}
                          <circle
                            cx="80"
                            cy="80"
                            r="60"
                            fill="transparent"
                            stroke="#D6293E"
                            strokeWidth="26"
                            strokeDasharray="100 377"
                            strokeDashoffset="-275"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ADMISSIONS — PRD "register interest" + "welcome call"      */}
          {/* ========================================================= */}
          {activeTab === "admissions" && (
            <div>
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight mb-2">
                Admissions
              </h1>
              <p className="text-[13.5px] text-[#747579] mb-6 max-w-2xl">
                Leads come from the course pages&apos; &quot;register your interest&quot; form. Welcome
                calls are owed to every enrolled student before class starts — mark a no-show and
                send them a one-tap WhatsApp check-in.
              </p>

              {/* Leads */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden mb-7">
                <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                  <h2 className="font-display text-[18px] font-extrabold text-[#1D2026]">Leads</h2>
                </div>
                <div className="p-6">
                  {leadsLoading ? (
                    <div className="py-8 text-center text-[13.5px] text-[#747579]">Loading leads…</div>
                  ) : leads.length === 0 ? (
                    <div className="py-8 text-center text-[13.5px] text-[#747579]">
                      No leads registered yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[760px]">
                        <thead>
                          <tr className="text-[#8580A3] text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-2 pr-4">Name</th>
                            <th className="py-2 pr-4">Phone</th>
                            <th className="py-2 pr-4">Course</th>
                            <th className="py-2 pr-4">Source</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[13.5px]">
                          {leads.map((l) => {
                            const waLink = l.phone
                              ? buildWhatsAppLink(
                                  l.phone,
                                  `Hi ${l.name.split(" ")[0]}, this is BEMS Admissions following up on your interest${l.courseTitle ? ` in ${l.courseTitle}` : ""}!`
                                )
                              : null;
                            return (
                              <tr key={l.id}>
                                <td className="py-2.5 pr-4 font-bold text-[#1D2026]">{l.name}</td>
                                <td className="py-2.5 pr-4 text-[#475569]">
                                  {waLink ? (
                                    <a href={waLink} target="_blank" rel="noreferrer" className="text-[#25D366] font-semibold hover:underline">
                                      {l.phone}
                                    </a>
                                  ) : (
                                    l.phone
                                  )}
                                </td>
                                <td className="py-2.5 pr-4 text-[#475569]">{l.courseTitle || "—"}</td>
                                <td className="py-2.5 pr-4 text-[#475569]">{l.source || "—"}</td>
                                <td className="py-2.5 pr-4">
                                  <select
                                    value={l.status}
                                    onChange={(e) => updateLeadStatus(l.id, e.target.value as Lead["status"])}
                                    className="px-2 py-1 rounded-md border border-slate-200 text-[12px] font-semibold cursor-pointer"
                                  >
                                    <option value="NEW">New</option>
                                    <option value="CONTACTED">Contacted</option>
                                    <option value="CONVERTED">Converted</option>
                                    <option value="DROPPED">Dropped</option>
                                  </select>
                                </td>
                                <td className="py-2.5 pr-4 text-[#8580A3] text-[12px]">
                                  {new Date(l.createdAt).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Welcome Calls */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                  <h2 className="font-display text-[18px] font-extrabold text-[#1D2026]">Welcome Calls</h2>
                </div>
                <div className="p-6">
                  {welcomeCallsLoading ? (
                    <div className="py-8 text-center text-[13.5px] text-[#747579]">Loading…</div>
                  ) : welcomeCalls.length === 0 ? (
                    <div className="py-8 text-center text-[13.5px] text-[#747579]">
                      Every enrolled student has had their welcome call completed.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[820px]">
                        <thead>
                          <tr className="text-[#8580A3] text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-2 pr-4">Student</th>
                            <th className="py-2 pr-4">Course</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Scheduled</th>
                            <th className="py-2 pr-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[13.5px]">
                          {welcomeCalls.map((w) => {
                            const statusClass =
                              w.welcomeCallStatus === "SCHEDULED"
                                ? "bg-[#F6ECF9] text-[#A16EBD]"
                                : w.welcomeCallStatus === "NO_SHOW"
                                ? "bg-[#FBE9EB] text-[#D6293E]"
                                : "bg-slate-100 text-slate-600";
                            const noShowWaLink = w.studentPhone
                              ? buildWhatsAppLink(
                                  w.studentPhone,
                                  `Hi ${w.studentName.split(" ")[0]}, we noticed you missed your welcome call for ${w.courseTitle}. We're here to help you catch up — when's a good time to reschedule?`
                                )
                              : null;
                            return (
                              <tr key={w.id}>
                                <td className="py-2.5 pr-4">
                                  <div className="font-bold text-[#1D2026]">{w.studentName}</div>
                                  <div className="text-[12px] text-[#747579]">{w.studentEmail}</div>
                                </td>
                                <td className="py-2.5 pr-4 text-[#475569]">{w.courseTitle}</td>
                                <td className="py-2.5 pr-4">
                                  <span className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold ${statusClass}`}>
                                    {w.welcomeCallStatus.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="py-2.5 pr-4 text-[#8580A3] text-[12px]">
                                  {w.welcomeCallAt
                                    ? new Date(w.welcomeCallAt).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })
                                    : "—"}
                                </td>
                                <td className="py-2.5 pr-4 text-right space-x-2 whitespace-nowrap">
                                  {w.welcomeCallStatus === "NO_SHOW" && noShowWaLink && (
                                    <a
                                      href={noShowWaLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-block px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20bd5a]"
                                    >
                                      WhatsApp
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openEditWelcomeCall(w)}
                                    className="px-3 py-1.5 rounded-lg bg-[#AE54C6] text-white text-xs font-semibold hover:bg-[#A03BBC] cursor-pointer"
                                  >
                                    Manage
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Welcome Call Edit Modal */}
          {editingWelcomeCall && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-[#1D2026]">
                    Welcome Call — {editingWelcomeCall.studentName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingWelcomeCall(null)}
                    className="text-[#8580A3] hover:text-[#1D2026] text-lg font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Status</label>
                  <select
                    value={welcomeCallForm.status}
                    onChange={(e) =>
                      setWelcomeCallForm((f) => ({ ...f, status: e.target.value as WelcomeCallEnrollment["welcomeCallStatus"] }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="NOT_SCHEDULED">Not Scheduled</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="NO_SHOW">No Show</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={welcomeCallForm.scheduledAt}
                    onChange={(e) => setWelcomeCallForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={saveWelcomeCall}
                  disabled={savingWelcomeCall}
                  className="w-full py-2.5 rounded-lg bg-[#AE54C6] text-white text-sm font-bold hover:bg-[#A03BBC] disabled:opacity-60 cursor-pointer"
                >
                  {savingWelcomeCall ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PLACEMENTS — PRD "finished -> help into a job" pipeline    */}
          {/* ========================================================= */}
          {activeTab === "placements" && (
            <div>
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight mb-2">
                Placements
              </h1>
              <p className="text-[13.5px] text-[#747579] mb-6 max-w-2xl">
                Every student who earns a certificate lands here automatically as{" "}
                <strong>Seeking</strong>. Move them forward as BEMS introduces them to a role —
                either hired internally by BEMS Group, or placed with a partner company (who may
                owe BEMS an introduction fee).
              </p>

              {/* PRD §4.1 step 9's actual target metric: "Get a job/earn
                  within 90 days" (40% of finishers). createdAt on a
                  placement is the moment the certificate was issued — i.e.
                  "finished" — so hiredAt minus createdAt is real days-to-hire,
                  not an estimate. */}
              {placements.length > 0 &&
                (() => {
                  const totalFinishers = placements.length;
                  const hiredWithin90 = placements.filter((p) => {
                    if (p.status !== "HIRED" || !p.hiredAt) return false;
                    const days = (new Date(p.hiredAt).getTime() - new Date(p.createdAt).getTime()) / 86400000;
                    return days >= 0 && days <= 90;
                  }).length;
                  const pct = Math.round((hiredWithin90 / totalFinishers) * 100);
                  return (
                    <div className="bg-[#F7EDF9] rounded-xl p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="text-[13px] font-bold text-[#1D2026]">
                          Hired Within 90 Days
                        </div>
                        <div className="text-[11.5px] text-[#747579] mt-0.5">
                          PRD target: 40% of finishers — measured from certificate issuance to hire date
                        </div>
                      </div>
                      <div className="font-display text-[28px] font-extrabold text-[#AE54C6]">
                        {hiredWithin90} / {totalFinishers}{" "}
                        <span className="text-[16px] text-[#A16EBD]">({pct}%)</span>
                      </div>
                    </div>
                  );
                })()}

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-6">
                  {placementsLoading ? (
                    <div className="py-10 text-center text-[13.5px] text-[#747579]">
                      Loading placements…
                    </div>
                  ) : placements.length === 0 ? (
                    <div className="py-10 text-center text-[13.5px] text-[#747579]">
                      No graduates yet — a placement is created automatically the first time a
                      student earns a certificate.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-[#24292D] text-white text-[13.5px] font-bold">
                            <th className="py-3.5 px-4 rounded-l-lg">Student</th>
                            <th className="py-3.5 px-4">Course</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Employer</th>
                            <th className="py-3.5 px-4">Hired</th>
                            <th className="py-3.5 px-4">Fee</th>
                            <th className="py-3.5 px-4 rounded-r-lg text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[14px]">
                          {placements.map((p) => {
                            const statusClass =
                              p.status === "HIRED"
                                ? "bg-[#F7EDF9] text-[#AE54C6]"
                                : p.status === "INTRODUCED"
                                ? "bg-[#FFF2E2] text-[#FD7E14]"
                                : "bg-slate-100 text-slate-600";
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/70">
                                <td className="py-4 px-4">
                                  <div className="font-bold text-[#1D2026]">{p.studentName}</div>
                                  <div className="text-[12px] text-[#747579]">{p.studentEmail}</div>
                                </td>
                                <td className="py-4 px-4 text-[#475569]">{p.courseTitle}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold ${statusClass}`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-[#475569]">
                                  {p.employerName ? (
                                    <>
                                      {p.employerName}
                                      {p.placementType && (
                                        <span className="text-[11px] text-[#8580A3] block">
                                          {p.placementType === "BEMS_INTERNAL" ? "BEMS Group" : "Partner"}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className="py-4 px-4 text-[#747579] text-[12.5px]">
                                  {p.hiredAt
                                    ? new Date(p.hiredAt).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric"
                                      })
                                    : "—"}
                                </td>
                                <td className="py-4 px-4 text-[#475569]">
                                  {p.feeAmount ? (
                                    <>
                                      ₦{p.feeAmount.toLocaleString()}
                                      <span className="text-[11px] text-[#8580A3] block">{p.feeStatus}</span>
                                    </>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => openEditPlacement(p)}
                                    className="px-3 py-1.5 rounded-lg bg-[#AE54C6] text-white text-xs font-semibold hover:bg-[#A03BBC] cursor-pointer"
                                  >
                                    Manage
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Placement Edit Modal */}
          {editingPlacement && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-[#1D2026]">
                    Manage Placement — {editingPlacement.studentName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingPlacement(null)}
                    className="text-[#8580A3] hover:text-[#1D2026] text-lg font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Status</label>
                  <select
                    value={placementForm.status}
                    onChange={(e) =>
                      setPlacementForm((f) => ({ ...f, status: e.target.value as Placement["status"] }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="SEEKING">Seeking</option>
                    <option value="INTRODUCED">Introduced</option>
                    <option value="HIRED">Hired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Employer Type</label>
                  <select
                    value={placementForm.placementType}
                    onChange={(e) =>
                      setPlacementForm((f) => ({ ...f, placementType: e.target.value as typeof f.placementType }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="">Not set</option>
                    <option value="BEMS_INTERNAL">BEMS Group (internal hire)</option>
                    <option value="PARTNER">Partner company</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Employer Name</label>
                  <input
                    type="text"
                    value={placementForm.employerName}
                    onChange={(e) => setPlacementForm((f) => ({ ...f, employerName: e.target.value }))}
                    placeholder="e.g. BEMS Group, or a partner company's name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Hired Date</label>
                  <input
                    type="date"
                    value={placementForm.hiredAt}
                    onChange={(e) => setPlacementForm((f) => ({ ...f, hiredAt: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>

                {placementForm.placementType === "PARTNER" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#645F80] mb-1.5">
                        Introduction Fee (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={placementForm.feeAmount}
                        onChange={(e) => setPlacementForm((f) => ({ ...f, feeAmount: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#645F80] mb-1.5">Fee Status</label>
                      <select
                        value={placementForm.feeStatus}
                        onChange={(e) =>
                          setPlacementForm((f) => ({ ...f, feeStatus: e.target.value as Placement["feeStatus"] }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      >
                        <option value="NONE">None</option>
                        <option value="INVOICED">Invoiced</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                  </div>
                )}

                {placementForm.placementType === "BEMS_INTERNAL" && (
                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">
                      Pay Rate (₦/month, for BEMS&apos;s own records)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={placementForm.payRate}
                      onChange={(e) => setPlacementForm((f) => ({ ...f, payRate: e.target.value }))}
                      placeholder="e.g. 80000 — not real payroll, just a bookkeeping note"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Notes</label>
                  <textarea
                    value={placementForm.notes}
                    onChange={(e) => setPlacementForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={savePlacement}
                  disabled={savingPlacement}
                  className="w-full py-2.5 rounded-lg bg-[#AE54C6] text-white text-sm font-bold hover:bg-[#A03BBC] disabled:opacity-60 cursor-pointer"
                >
                  {savingPlacement ? "Saving…" : "Save Placement"}
                </button>

                {editingPlacement.status === "HIRED" && editingPlacement.placementType === "BEMS_INTERNAL" && (
                  <button
                    type="button"
                    onClick={() => promoteToInstructor(editingPlacement.id, editingPlacement.studentName)}
                    className="w-full py-2.5 rounded-lg border border-[#AE54C6] text-[#AE54C6] text-sm font-bold hover:bg-[#F7EDF9] cursor-pointer"
                  >
                    Promote to Instructor (Teaching Assistant)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cohort Targets Edit Modal */}
          {editingCohortTargets && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-[#1D2026]">Edit Cohort Targets</h3>
                  <button
                    type="button"
                    onClick={() => setEditingCohortTargets(false)}
                    className="text-[#8580A3] hover:text-[#1D2026] text-lg font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">
                    Estimated Ad Views
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cohortForm.estimatedAdViews}
                    onChange={(e) => setCohortForm((f) => ({ ...f, estimatedAdViews: e.target.value }))}
                    placeholder="e.g. banner/flier print-run × expected foot traffic"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Target Students</label>
                  <input
                    type="number"
                    min="0"
                    value={cohortForm.targetStudents}
                    onChange={(e) => setCohortForm((f) => ({ ...f, targetStudents: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Target Revenue (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={cohortForm.targetRevenue}
                    onChange={(e) => setCohortForm((f) => ({ ...f, targetRevenue: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={saveCohortTargets}
                  disabled={savingCohort}
                  className="w-full py-2.5 rounded-lg bg-[#AE54C6] text-white text-sm font-bold hover:bg-[#A03BBC] disabled:opacity-60 cursor-pointer"
                >
                  {savingCohort ? "Saving…" : "Save Targets"}
                </button>
              </div>
            </div>
          )}

          {/* New Cohort Modal — PRD §9 "Plan the next group." */}
          {creatingCohort && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-[#1D2026]">New Cohort</h3>
                  <button
                    type="button"
                    onClick={() => setCreatingCohort(false)}
                    className="text-[#8580A3] hover:text-[#1D2026] text-lg font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
                <p className="text-[12px] text-[#747579]">
                  New enrollments attach to whichever cohort is newest — creating one here starts the next intake round.
                </p>
                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Name</label>
                  <input
                    type="text"
                    value={newCohortForm.name}
                    onChange={(e) => setNewCohortForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. February 2027 (Second Group)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={newCohortForm.startDate}
                      onChange={(e) => setNewCohortForm((f) => ({ ...f, startDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={newCohortForm.endDate}
                      onChange={(e) => setNewCohortForm((f) => ({ ...f, endDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">Target Students</label>
                    <input
                      type="number"
                      min="0"
                      value={newCohortForm.targetStudents}
                      onChange={(e) => setNewCohortForm((f) => ({ ...f, targetStudents: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#645F80] mb-1.5">Target Revenue (₦)</label>
                    <input
                      type="number"
                      min="0"
                      value={newCohortForm.targetRevenue}
                      onChange={(e) => setNewCohortForm((f) => ({ ...f, targetRevenue: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={saveNewCohort}
                  disabled={savingNewCohort || !newCohortForm.name || !newCohortForm.startDate || !newCohortForm.endDate}
                  className="w-full py-2.5 rounded-lg bg-[#AE54C6] text-white text-sm font-bold hover:bg-[#A03BBC] disabled:opacity-60 cursor-pointer"
                >
                  {savingNewCohort ? "Creating…" : "Create Cohort"}
                </button>
              </div>
            </div>
          )}

          {/* Second Chance Modal — PRD §4.2's one-time free rejoin. */}
          {secondChanceEnrollmentId && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-[#1D2026]">Activate Second Chance</h3>
                  <button
                    type="button"
                    onClick={() => setSecondChanceEnrollmentId(null)}
                    className="text-[#8580A3] hover:text-[#1D2026] text-lg font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
                <p className="text-[12px] text-[#747579]">
                  Rejoins this student into the chosen cohort, waives any remaining balance, and keeps their lesson
                  progress. This is a lifetime one-time perk — it cannot be used again for this student.
                </p>
                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Rejoin Into Cohort</label>
                  <select
                    value={secondChanceTargetCohort}
                    onChange={(e) => setSecondChanceTargetCohort(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm cursor-pointer"
                  >
                    <option value="">Select a cohort…</option>
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={confirmSecondChance}
                  disabled={savingSecondChance || !secondChanceTargetCohort}
                  className="w-full py-2.5 rounded-lg bg-[#AE54C6] text-white text-sm font-bold hover:bg-[#A03BBC] disabled:opacity-60 cursor-pointer"
                >
                  {savingSecondChance ? "Activating…" : "Activate Second Chance"}
                </button>
              </div>
            </div>
          )}

          {/* Refund Modal — bookkeeping only, same convention as a
              manually-confirmed bank transfer. */}
          {refundingEnrollment && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-[#1D2026]">
                    Refund {refundingEnrollment.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setRefundingEnrollment(null)}
                    className="text-[#8580A3] hover:text-[#1D2026] text-lg font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
                <p className="text-[12px] text-[#747579]">
                  Records that this amount was given back to the student outside the app (however it was actually
                  sent) and withdraws their access to this course.
                </p>
                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">
                    Amount (₦, max ₦{refundingEnrollment.amountPaid.toLocaleString()})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={refundingEnrollment.amountPaid}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#645F80] mb-1.5">Reason (optional)</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={confirmRefund}
                  disabled={savingRefund || !refundAmount || Number(refundAmount) <= 0}
                  className="w-full py-2.5 rounded-lg bg-[#D6293E] text-white text-sm font-bold hover:bg-[#B91C2E] disabled:opacity-60 cursor-pointer"
                >
                  {savingRefund ? "Processing…" : "Confirm Refund"}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 6: EARNINGS (Matches Images 1 & 4)                   */}
          {/* ========================================================= */}
          {(activeTab === "earnings" || activeTab === "analytics") && (
            <div>
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight mb-6">
                Earnings
              </h1>

              {/* 3 Real Summary Cards — computed from the actual payment
                  ledger/roster, not placeholder figures. */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-7">
                <div className="bg-[#F7EDF9] rounded-xl p-6">
                  <div className="text-[14px] font-bold text-[#1D2026] mb-2">
                    Total Collected
                  </div>
                  <div className="font-display text-[32px] sm:text-[36px] font-extrabold text-[#AE54C6] leading-tight">
                    ₦{analytics.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[12px] text-[#747579] mt-1">
                    Across {analytics.totalStudents} enrolled student{analytics.totalStudents === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="bg-[#F6ECF9] rounded-xl p-6">
                  <div className="text-[14px] font-bold text-[#1D2026] mb-2 flex items-center gap-1.5">
                    <span>Outstanding Balance</span>
                  </div>
                  <div className="font-display text-[32px] sm:text-[36px] font-extrabold text-[#A16EBD] leading-tight">
                    ₦{adminStudents.reduce((sum, s) => sum + Math.max(s.totalDue - s.amountPaid, 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[12px] text-[#747579] mt-1">
                    Still due across every enrollment on record
                  </div>
                </div>

                <div className="bg-[#FFF2E2] rounded-xl p-6">
                  <div className="text-[14px] font-bold text-[#1D2026] mb-2">
                    Target Revenue
                  </div>
                  <div className="font-display text-[32px] sm:text-[36px] font-extrabold text-[#FD7E14] leading-tight">
                    ₦{analytics.targetRevenue.toLocaleString()}
                  </div>
                  <div className="text-[12px] text-[#747579] mt-1">
                    {analytics.targetRevenue > 0
                      ? `${Math.round((analytics.totalRevenue / analytics.targetRevenue) * 100)}% reached this cohort`
                      : "No cohort revenue target set"}
                  </div>
                </div>

                <div className="bg-[#E9F7EF] rounded-xl p-6">
                  <div className="text-[14px] font-bold text-[#1D2026] mb-2">
                    Placement Fees Collected
                  </div>
                  <div className="font-display text-[32px] sm:text-[36px] font-extrabold text-emerald-700 leading-tight">
                    ₦
                    {placements
                      .filter((p) => p.feeStatus === "PAID")
                      .reduce((sum, p) => sum + (p.feeAmount || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-[12px] text-[#747579] mt-1">
                    {placements.filter((p) => p.status === "HIRED").length} graduate
                    {placements.filter((p) => p.status === "HIRED").length === 1 ? "" : "s"} hired &middot; the
                    PRD&apos;s second revenue stream
                  </div>
                </div>
              </div>

              {/* Marketing Funnel — PRD §4.1 steps 1-2. Ad views can't be
                  measured online (outdoor banners/fliers), so that number is
                  a manual staff estimate; page visits are real, deduped
                  counts (see PageView model). */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden mb-7">
                <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                      Marketing Funnel
                    </h2>
                    <p className="text-[12.5px] text-[#747579] mt-0.5">
                      PRD &sect;4.1 — &quot;See our advert&quot; &rarr; &quot;Visit the sign-up page&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCreatingCohort(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#AE54C6] text-white text-xs font-semibold hover:bg-[#A03BBC] cursor-pointer"
                    >
                      + New Cohort
                    </button>
                    <button
                      type="button"
                      onClick={openEditCohortTargets}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#475569] text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Edit Targets
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#FFF2E2] rounded-xl p-5">
                      <div className="text-[13px] font-bold text-[#1D2026] mb-1.5">
                        Estimated Ad Views
                      </div>
                      <div className="font-display text-[26px] font-extrabold text-[#FD7E14] leading-tight">
                        {analytics.estimatedAdViews.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#747579] mt-1">
                        Manual estimate — banner/flier impressions aren&apos;t measurable online
                      </div>
                    </div>
                    <div className="bg-[#F6ECF9] rounded-xl p-5">
                      <div className="text-[13px] font-bold text-[#1D2026] mb-1.5">
                        Homepage Visits
                      </div>
                      <div className="font-display text-[26px] font-extrabold text-[#A16EBD] leading-tight">
                        {analytics.homePageViews.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#747579] mt-1">
                        Real, deduped per visitor per day
                      </div>
                    </div>
                    <div className="bg-[#F7EDF9] rounded-xl p-5">
                      <div className="text-[13px] font-bold text-[#1D2026] mb-1.5">
                        Signup Page Visits
                      </div>
                      <div className="font-display text-[26px] font-extrabold text-[#AE54C6] leading-tight">
                        {analytics.signupPageViews.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#747579] mt-1">
                        /subscriptions — PRD&apos;s step 2 target
                      </div>
                    </div>
                  </div>

                  {/* Banner Channel Yield — already computed server-side,
                      never had anywhere to actually render until now. */}
                  <div>
                    <h3 className="text-[13.5px] font-extrabold text-[#1D2026] mb-3">
                      Banner / QR Source Yield
                    </h3>
                    {analytics.bannerChannelYield.length === 0 ? (
                      <div className="text-[13px] text-[#747579] py-4">
                        No banner/QR scans logged yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="text-[#8580A3] text-[11px] font-bold uppercase tracking-wider">
                              <th className="py-2 pr-4">Source</th>
                              <th className="py-2 pr-4">Scans</th>
                              <th className="py-2 pr-4">Registrations</th>
                              <th className="py-2 pr-4">Conversion</th>
                              <th className="py-2 pr-4">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[13.5px]">
                            {analytics.bannerChannelYield.map((b) => (
                              <tr key={b.source}>
                                <td className="py-2.5 pr-4 font-bold text-[#1D2026]">{b.source}</td>
                                <td className="py-2.5 pr-4 text-[#475569]">{b.scans}</td>
                                <td className="py-2.5 pr-4 text-[#475569]">{b.registrations}</td>
                                <td className="py-2.5 pr-4 text-[#475569]">{b.conversionRate}%</td>
                                <td className="py-2.5 pr-4 text-[#475569]">₦{b.revenue.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cohort History — PRD §9 "Plan the next group." New
                  enrollments always attach to whichever cohort is newest
                  (createdAt desc), so creating one here is what actually
                  starts the next intake round. */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden mb-7">
                <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                  <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">Cohorts</h2>
                </div>
                <div className="p-6">
                  {cohortsLoading ? (
                    <div className="py-6 text-center text-[13.5px] text-[#747579]">Loading cohorts…</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[760px]">
                        <thead>
                          <tr className="text-[#8580A3] text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-2 pr-4">Name</th>
                            <th className="py-2 pr-4">Dates</th>
                            <th className="py-2 pr-4">Enrolled</th>
                            <th className="py-2 pr-4">Target Students</th>
                            <th className="py-2 pr-4">Target Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[13.5px]">
                          {cohorts.map((c, idx) => (
                            <tr key={c.id}>
                              <td className="py-2.5 pr-4 font-bold text-[#1D2026]">
                                {c.name} {idx === 0 && <span className="text-[10px] text-[#AE54C6]">(current)</span>}
                              </td>
                              <td className="py-2.5 pr-4 text-[#475569]">
                                {new Date(c.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                {" – "}
                                {new Date(c.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                              </td>
                              <td className="py-2.5 pr-4 text-[#475569]">{c.enrolledCount}</td>
                              <td className="py-2.5 pr-4 text-[#475569]">{c.targetStudents}</td>
                              <td className="py-2.5 pr-4 text-[#475569]">₦{c.targetRevenue.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Ledger — every real PaymentTransaction row (Paystack
                  or staff-confirmed bank transfer), the actual "who has paid"
                  record rather than a derived running total. */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
                  <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                    Payment Ledger
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[12.5px] text-[#747579]">
                      {paymentLedger.length} transaction{paymentLedger.length === 1 ? "" : "s"}
                    </span>
                    {user?.role === "ADMIN" && (
                      <a
                        href={`${API_BASE_URL}/api/admin/payment-ledger/export`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#475569] text-xs font-semibold hover:bg-slate-50"
                      >
                        Export CSV
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {ledgerLoading ? (
                    <div className="py-10 text-center text-[13.5px] text-[#747579]">
                      Loading payment ledger…
                    </div>
                  ) : paymentLedger.length === 0 ? (
                    <div className="py-10 text-center text-[13.5px] text-[#747579]">
                      No payment transactions recorded yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[860px]">
                        <thead>
                          <tr className="bg-[#24292D] text-white text-[13.5px] font-bold">
                            <th className="py-3.5 px-4 rounded-l-lg">Reference</th>
                            <th className="py-3.5 px-4">Student</th>
                            <th className="py-3.5 px-4">Course</th>
                            <th className="py-3.5 px-4">Plan</th>
                            <th className="py-3.5 px-4">Amount</th>
                            <th className="py-3.5 px-4">Channel</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 rounded-r-lg">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[14px]">
                          {paymentLedger.map((txn) => {
                            const statusClass =
                              txn.status === "SUCCESS"
                                ? "bg-[#F7EDF9] text-[#AE54C6]"
                                : txn.status === "PENDING"
                                ? "bg-[#FFF2E2] text-[#FD7E14]"
                                : "bg-[#FBE9EB] text-[#D6293E]";
                            return (
                              <tr key={txn.id} className="hover:bg-slate-50/70">
                                <td className="py-4 px-4 text-[#747579] font-mono text-[12px]">
                                  {txn.reference}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="font-bold text-[#1D2026]">{txn.studentName}</div>
                                  <div className="text-[12px] text-[#747579]">{txn.studentEmail}</div>
                                </td>
                                <td className="py-4 px-4 text-[#475569]">{txn.courseTitle}</td>
                                <td className="py-4 px-4 text-[#475569] capitalize">{txn.paymentPlan}</td>
                                <td className="py-4 px-4 font-medium text-[#475569]">
                                  ₦{txn.amount.toLocaleString()}
                                </td>
                                <td className="py-4 px-4 text-[#475569] capitalize">{txn.channel || "—"}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold ${statusClass}`}>
                                    {txn.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-[#747579] text-[12.5px]">
                                  {new Date(txn.createdAt).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 7: ADMIN SETTINGS (Matches Images 2 & 5)             */}
          {/* ========================================================= */}
          {activeTab === "settings" && (
            <div>
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight mb-6">
                Admin Settings
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Dark Sub-Sidebar */}
                <div className="lg:col-span-3 bg-[#24292D] rounded-xl p-4 space-y-1.5">
                  {[
                    { id: "website", label: "Website Settings", icon: Globe },
                    { id: "general", label: "General Settings", icon: Settings },
                    { id: "notification", label: "Notification Settings", icon: Bell },
                    { id: "account", label: "Account Settings", icon: UserIcon },
                    { id: "social", label: "Social Settings", icon: BarChart3 },
                    { id: "email", label: "Email Settings", icon: Mail },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSubActive = settingsSubTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setSettingsSubTab(
                            item.id as
                              | "website"
                              | "general"
                              | "notification"
                              | "account"
                              | "social"
                              | "email"
                          )
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                          isSubActive
                            ? "bg-white text-[#1D2026] shadow-xs"
                            : "text-white/90 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Settings Content Column */}
                <div className="lg:col-span-9">
                  {settingsSubTab === "website" && (
                    /* Sub-Tab 1: Website Settings */
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                          Website Settings
                        </h2>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveSiteSettings();
                        }}
                        className="p-6 space-y-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div>
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                              Site Name
                            </label>
                            <input
                              type="text"
                              placeholder="Site Name"
                              value={siteSettingsForm.siteName}
                              onChange={(e) => setSiteSettingsForm((prev) => ({ ...prev, siteName: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#AE54C6]"
                            />
                            <p className="text-[11.5px] text-[#9A9EA4] mt-1.5 leading-snug">
                              Enter Website Name. It Display in Website and Email.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                              Site Copyrights
                            </label>
                            <input
                              type="text"
                              placeholder="Site Copyrights"
                              value={siteSettingsForm.copyrightText}
                              onChange={(e) => setSiteSettingsForm((prev) => ({ ...prev, copyrightText: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#AE54C6]"
                            />
                            <p className="text-[11.5px] text-[#9A9EA4] mt-1.5 leading-snug">
                              For the copyright text shown in the site footer.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                              Site Email
                            </label>
                            <input
                              type="email"
                              placeholder="Site Email"
                              value={siteSettingsForm.siteEmail}
                              onChange={(e) => setSiteSettingsForm((prev) => ({ ...prev, siteEmail: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#AE54C6]"
                            />
                            <p className="text-[11.5px] text-[#9A9EA4] mt-1.5 leading-snug">
                              Using for contact and outbound email.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                            Site Description
                          </label>
                          <textarea
                            rows={4}
                            value={siteSettingsForm.description}
                            onChange={(e) => setSiteSettingsForm((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] focus:outline-none focus:border-[#AE54C6]"
                          />
                          <p className="text-[11.5px] text-[#9A9EA4] mt-1.5">
                            For write brief description of your organization, or a Website.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                              Contact Phone
                            </label>
                            <input
                              type="text"
                              placeholder="Contact Phone"
                              value={siteSettingsForm.contactPhone}
                              onChange={(e) => setSiteSettingsForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#AE54C6]"
                            />
                            <p className="text-[11.5px] text-[#9A9EA4] mt-1.5">
                              Using for Contact and Support.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                              Support Email
                            </label>
                            <input
                              type="email"
                              placeholder="Support Email"
                              value={siteSettingsForm.supportEmail}
                              onChange={(e) => setSiteSettingsForm((prev) => ({ ...prev, supportEmail: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#AE54C6]"
                            />
                            <p className="text-[11.5px] text-[#9A9EA4] mt-1.5">
                              For Support Email.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[13.5px] font-medium text-[#747579] mb-2.5">
                            Allow Registration
                          </label>
                          <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#747579]">
                            {[
                              { id: "enable", label: "Enable" },
                              { id: "disable", label: "Disable" },
                              { id: "request", label: "On Request" },
                            ].map((opt) => (
                              <label
                                key={opt.id}
                                className="inline-flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name="allowRegistration"
                                  checked={siteSettingsForm.allowRegistration === opt.id}
                                  onChange={() =>
                                    setSiteSettingsForm((prev) => ({
                                      ...prev,
                                      allowRegistration: opt.id as "enable" | "disable" | "request"
                                    }))
                                  }
                                  className="w-4 h-4 accent-[#AE54C6]"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                          <p className="text-[11.5px] text-[#9A9EA4] mt-2 leading-snug">
                            Enforced live on signup — Disable blocks new accounts, On Request shows an admissions
                            contact message instead of letting the account get created.
                          </p>
                        </div>

                        <div>
                          <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                            Contact Address
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Contact Address"
                            value={siteSettingsForm.contactAddress}
                            onChange={(e) => setSiteSettingsForm((prev) => ({ ...prev, contactAddress: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#AE54C6]"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={savingSiteSettings}
                            className="px-5 py-2.5 rounded-lg bg-[#AE54C6] hover:bg-[#A03BBC] text-white text-[14px] font-bold transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {savingSiteSettings ? "Saving…" : "Update"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {settingsSubTab === "general" && (
                    /* Sub-Tab 2: General Settings — not configurable yet, see note below */
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                          General Settings
                        </h2>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="rounded-lg bg-[#F8F9FA] border border-slate-200/80 p-5 text-[14px] text-[#747579] leading-relaxed">
                          These aren&apos;t configurable from the admin console yet:
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Site URL — set via the <code className="text-[13px]">FRONTEND_URL</code> environment variable, not the UI.</li>
                            <li>Currency — BEMS prices everything in Naira (₦) only; multi-currency isn&apos;t built.</li>
                            <li>Language — the site is English-only; no translations exist.</li>
                            <li>Maintenance mode — there&apos;s no site-wide offline gate implemented.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubTab === "notification" && (
                    /* Sub-Tab 3: Notification Settings — real per-admin category prefs */
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                          Notifications Settings
                        </h2>
                      </div>

                      <div className="p-6 space-y-4">
                        <h3 className="font-display text-[17px] font-extrabold text-[#1D2026]">
                          Which staff-wide alerts should you receive?
                        </h3>
                        <p className="text-[13.5px] text-[#747579] -mt-2">
                          Controls the notification bell for these event types. Your own actions (grading a
                          submission, etc.) always notify the affected student regardless of this setting.
                        </p>
                        <div className="space-y-3">
                          {(
                            [
                              { key: "CLASS", label: "Live class & attendance check-ins" },
                              { key: "GRADING", label: "Capstone submissions awaiting grading" },
                              { key: "PAYMENT", label: "Enrollment & payment confirmations" },
                              { key: "GAMIFICATION", label: "Referral credit & gamification events" },
                              { key: "ATTENDANCE", label: "Students flagged for missed classes" },
                            ] as const
                          ).map((item) => {
                            const checked = notifyCategories.includes(item.key);
                            return (
                              <div key={item.key} className="flex items-center gap-3">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={checked}
                                  disabled={savingNotifyPrefs}
                                  onClick={() => toggleNotifyCategory(item.key)}
                                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ${
                                    checked
                                      ? "bg-[#AE54C6] justify-end"
                                      : "bg-[#EEF0F3] border border-slate-300 justify-start"
                                  }`}
                                >
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full block ${
                                      checked ? "bg-white" : "bg-[#8C939A]"
                                    }`}
                                  />
                                </button>
                                <span className="text-[14px] text-[#747579]">{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubTab === "account" && (
                    /* Sub-Tab 4: Account Settings — password change is real, the rest is honest about not existing yet */
                    <div className="space-y-6">
                      {/* Card: Change Password (reuses the real forgot-password flow) */}
                      <div className="bg-[#F8F9FA] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                            Change Password
                          </h3>
                          <p className="text-[14px] text-[#747579] mt-1">
                            Sends a real password-reset link to your account email ({user?.email}).
                          </p>
                        </div>
                        <div className="sm:text-right shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!user?.email) return;
                              const res = await apiFetch("/api/auth/request-reset", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: user.email })
                              });
                              setAdminNotice(
                                res.ok
                                  ? "Password reset link sent — check the server log (email delivery is simulated)."
                                  : "Could not send reset link. Try again."
                              );
                            }}
                            className="px-5 py-2.5 rounded-lg bg-[#AE54C6] hover:bg-[#A03BBC] text-white text-[14px] font-bold transition-colors cursor-pointer"
                          >
                            Send Reset Link
                          </button>
                        </div>
                      </div>

                      {/* Honest note on what isn't built */}
                      <div className="rounded-lg bg-[#F8F9FA] border border-slate-200/80 p-5 text-[14px] text-[#747579] leading-relaxed">
                        Not available yet:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>2-Step Verification — no TOTP/SMS code infrastructure exists.</li>
                          <li>Session activity logs — sign-ins aren&apos;t tracked with browser/IP metadata, so there&apos;s nothing real to show or revoke here.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {settingsSubTab === "social" && (
                    /* Sub-Tab 5: Social Media Settings — no OAuth login exists in this app */
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                          Social Media Settings
                        </h2>
                      </div>
                      <div className="p-6">
                        <div className="rounded-lg bg-[#F8F9FA] border border-slate-200/80 p-5 text-[14px] text-[#747579] leading-relaxed">
                          Not configurable — BEMS sign-in is email &amp; password only. Google/Facebook OAuth login
                          isn&apos;t built, so there&apos;s nothing real for these fields to control yet.
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubTab === "email" && (
                    /* Sub-Tab 6: Email Settings — no SMTP provider is connected; delivery is simulated */
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                          Email Settings
                        </h2>
                      </div>
                      <div className="p-6">
                        <div className="rounded-lg bg-[#F8F9FA] border border-slate-200/80 p-5 text-[14px] text-[#747579] leading-relaxed">
                          Not configurable — no SMTP or transactional-email provider is connected yet. Password
                          reset links and other system emails are currently logged server-side instead of actually
                          sent (search the Render logs for the outgoing link/message).
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Add Course Modal */}
        {showAddCourseModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                  Create New Course Track
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="text-[#747579] hover:text-[#1D2026]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }}
                    placeholder="e.g., Cloud & DevOps Engineering"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F7F9] text-sm focus:outline-none focus:ring-1 focus:ring-[#AE54C6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">
                      Lead Instructor
                    </label>
                    <input
                      type="text"
                      value={newTutor}
                      onChange={(e) => setNewTutor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F7F9] text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">
                      Full Tuition (₦)
                    </label>
                    <input
                      type="number"
                      value={newPriceFull}
                      onChange={(e) => setNewPriceFull(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F7F9] text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCourseModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#F5F7F9] text-sm font-semibold text-[#475569]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#AE54C6] text-white text-sm font-semibold hover:bg-[#A03BBC]"
                  >
                    Publish Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-sm text-[#747579]">
          Loading Admin Dashboard...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
