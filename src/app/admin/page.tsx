"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import {
  Home,
  ShoppingBasket,
  GraduationCap,
  UserCheck,
  MessageSquare,
  BarChart3,
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
  paymentStatus?: "PAID_FULL" | "PARTIAL" | "PENDING";
  coursePrice?: number;
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
    name: "Carolyn Ortiz",
    location: "Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
    payments: "$6205",
    totalCourse: 21,
    progress: 85,
    joinDate: "29 Aug 2021",
  },
  {
    id: "stu-2",
    name: "Billy Vasquez",
    location: "Delhi",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
    payments: "$1256",
    totalCourse: 16,
    progress: 60,
    joinDate: "15 July 2021",
  },
  {
    id: "stu-3",
    name: "Dennis Barrett",
    location: "New York",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    payments: "$9256",
    totalCourse: 38,
    progress: 74,
    joinDate: "22 June 2021",
  },
  {
    id: "stu-4",
    name: "Lori Stevens",
    location: "California",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
    payments: "$10688",
    totalCourse: 7,
    progress: 45,
    joinDate: "18 April 2021",
  },
  {
    id: "stu-5",
    name: "Jacqueline Miller",
    location: "Chennai",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80",
    payments: "$856",
    totalCourse: 5,
    progress: 90,
    joinDate: "05 Aug 2021",
  },
  {
    id: "stu-6",
    name: "Samuel Bishop",
    location: "Canada",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80",
    payments: "$3578",
    totalCourse: 14,
    progress: 30,
    joinDate: "18 Jan 2021",
  },
];

const EDUPORT_INSTRUCTORS: EduportInstructorCard[] = [
  {
    id: "inst-1",
    name: "Lori Stevens",
    role: "Web Designer",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
    totalStudents: 5354,
    totalCourses: 15,
    rating: 4.5,
    verified: true,
  },
  {
    id: "inst-2",
    name: "Carolyn Ortiz",
    role: "Web Developer",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
    totalStudents: 15523,
    totalCourses: 10,
    rating: 4.5,
    verified: false,
  },
  {
    id: "inst-3",
    name: "Dennis Barrett",
    role: "Developer and Instructor",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    totalStudents: 2546,
    totalCourses: 9,
    rating: 4.5,
    verified: false,
  },
  {
    id: "inst-4",
    name: "Billy Vasquez",
    role: "Full Stack Web Developer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
    totalStudents: 12786,
    totalCourses: 7,
    rating: 4.5,
    verified: false,
  },
  {
    id: "inst-5",
    name: "Jacqueline Miller",
    role: "Engineering Architect",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80",
    totalStudents: 21245,
    totalCourses: 5,
    rating: 4.8,
    verified: true,
  },
  {
    id: "inst-6",
    name: "Amanda Reed",
    role: "Medical Science",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    totalStudents: 8546,
    totalCourses: 6,
    rating: 4.5,
    verified: true,
  },
];

const TOP_INSTRUCTORS_LIST = [
  {
    name: "Lori Stevens",
    courses: 25,
    rating: "4.5/5.0",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Dennis Barrett",
    courses: 18,
    rating: "4.5/5.0",
    verified: false,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Jacqueline Miller",
    courses: 21,
    rating: "4.8/5.0",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Billy Vasquez",
    courses: 15,
    rating: "4.5/5.0",
    verified: false,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Amanda Reed",
    courses: 29,
    rating: "4.5/5.0",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
];

const SUPPORT_REQUESTS = [
  {
    id: "req-1",
    name: "Lori Stevens",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
    initials: null,
    badgeBg: "",
    badgeText: "",
    message: "New ticket #759 from Lori Stevens for General Enquiry",
    boldPart: null,
    time: "8 hour ago",
  },
  {
    id: "req-2",
    name: "Dennis Barrett",
    avatar: null,
    initials: "DB",
    badgeBg: "bg-[#EFEBF9]",
    badgeText: "text-[#6F42C1]",
    message: "Comment from Billy Vasquez on ticket #659",
    boldPart: null,
    time: "8 hour ago",
  },
  {
    id: "req-3",
    name: "Dennis Barrett",
    avatar: null,
    initials: "WB",
    badgeBg: "bg-[#FFF2E2]",
    badgeText: "text-[#FD7E14]",
    message: "assign you a new ticket for Eduport theme",
    boldPrefix: "StackBros",
    boldSuffix: "Eduport theme",
    time: "5 hour ago",
  },
  {
    id: "req-4",
    name: "Dennis Barrett",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
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
            <stop offset="0%" stopColor="#066AC9" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#066AC9" stopOpacity="0.03" />
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
          stroke="#066AC9"
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
              fill="#066AC9"
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
    { color: "#066AC9", pct: 0.62, offset: 0 },
    { color: "#0CBC87", pct: 0.16, offset: 0.62 },
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
          <span className="w-3 h-3 rounded-full bg-[#066AC9] shrink-0 mt-1" />
          <span>Create a Design System in Figma</span>
        </div>
        <div className="flex items-start gap-2.5 text-[13.5px] text-[#747579]">
          <span className="w-3 h-3 rounded-full bg-[#0CBC87] shrink-0 mt-1" />
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
      name: "Lori Stevens",
      subject: "HTML, CSS, Bootstrap",
      requestedDate: "22 Oct 2021",
      status: "PENDING" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "ireq-2",
      name: "Carolyn Ortiz",
      subject: "Photoshop, Figma, Adobe XD",
      requestedDate: "06 Sep 2021",
      status: "PENDING" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "ireq-3",
      name: "Dennis Barrett",
      subject: "JavaScript, Java",
      requestedDate: "21 Jan 2021",
      status: "ACCEPTED" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "ireq-4",
      name: "Billy Vasquez",
      subject: "Maths, Chemistry",
      requestedDate: "25 Dec 2020",
      status: "REJECTED" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "ireq-5",
      name: "Jacqueline Miller",
      subject: "Python, Angular, React Native",
      requestedDate: "05 June 2020",
      status: "ACCEPTED" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "ireq-6",
      name: "Amanda Reed",
      subject: "After Effects, Premiere Pro",
      requestedDate: "14 Feb 2020",
      status: "ACCEPTED" as "PENDING" | "ACCEPTED" | "REJECTED",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
  ]);

  // Reviews state (Image 5)
  const [reviewsList, setReviewsList] = useState([
    {
      id: "01",
      studentName: "Lori Stevens",
      courseName: "Building Scalable APIs with GraphQL",
      rating: 5,
      visible: false,
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "02",
      studentName: "Carolyn Ortiz",
      courseName: "Graphic Design Masterclass",
      rating: 5,
      visible: false,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "03",
      studentName: "Dennis Barrett",
      courseName: "JavaScript: Full Understanding",
      rating: 4,
      visible: false,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "04",
      studentName: "Billy Vasquez",
      courseName: "Time Management Mastery: Do More, Stress Less",
      rating: 4,
      visible: false,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "05",
      studentName: "Jacqueline Miller",
      courseName: "The complete Digital Marketing Course - 8 Course in 1",
      rating: 4,
      visible: false,
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "06",
      studentName: "Amanda Reed",
      courseName: "Microsoft Excel - Excel from Beginner to Advanced",
      rating: 4,
      visible: false,
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "07",
      studentName: "Samuel Bishop",
      courseName: "Behavior, Psychology and Care Training",
      rating: 4,
      visible: false,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    },
  ]);

  // Admin Settings state (Images 2 & 5)
  const [settingsSubTab, setSettingsSubTab] = useState<
    "website" | "general" | "notification" | "account" | "social" | "email"
  >("website");
  const [allowRegistration, setAllowRegistration] = useState<
    "enable" | "disable" | "request"
  >("enable");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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

  // Combine Eduport template student cards with live BEMS database students
  const liveBemsStudentCards: EduportStudentCard[] = adminStudents.map((stu, idx) => ({
    id: stu.id,
    name: stu.name,
    location:
      stu.deliveryMode === "Physical Lab (Umuahia)" ? "MOUAU Campus" : "Live Virtual",
    avatar:
      EDUPORT_STUDENTS[idx % EDUPORT_STUDENTS.length]?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
    payments: `₦${stu.amountPaid.toLocaleString()}`,
    totalCourse: 4,
    progress: stu.progressPercent,
    joinDate: stu.enrolledAt,
    email: stu.email,
    enrollmentId: stu.id,
    paymentStatus: stu.paymentStatus,
    coursePrice: stu.totalDue,
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
          {/* Eduport / BEMS Logo */}
          <div className="flex items-center justify-between px-2 mb-7">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs">
                <span className="font-display font-black text-[#24292D] text-[22px] leading-none -rotate-12 select-none">
                  e
                </span>
              </div>
              <span className="font-display font-extrabold text-[23px] tracking-tight text-white">
                Eduport
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
                ? "text-[#066AC9]"
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
                    ? "bg-[#1B2228] text-[#066AC9]"
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
                        ? "text-[#066AC9]"
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
                  ? "text-[#066AC9]"
                  : "text-white/90 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Students</span>
            </button>

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
                    ? "bg-[#1B2228] text-[#066AC9]"
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
                        ? "text-[#066AC9]"
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
                        ? "text-[#066AC9]"
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
                        ? "text-[#066AC9]"
                        : "text-white/85 hover:text-white"
                    }`}
                  >
                    <span>Instructor requests</span>
                    <span className="w-5 h-5 rounded-full bg-[#0CBC87] text-white text-[11px] font-bold flex items-center justify-center">
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
                  ? "text-[#066AC9]"
                  : "text-white/90 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Reviews</span>
            </button>

            {/* Earnings */}
            <button
              type="button"
              onClick={() => switchTab("earnings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer ${
                activeTab === "earnings" || activeTab === "analytics"
                  ? "text-[#066AC9]"
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
                  ? "text-[#066AC9]"
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
                className="w-full bg-[#F5F7F9] rounded-lg pl-4 pr-10 py-2 text-[14px] text-[#24292D] placeholder:text-[#8C939A] focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
              />
              <Search className="w-4 h-4 text-[#066AC9] absolute right-3.5 top-1/2 -translate-y-1/2" />
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
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-5 sm:p-8 max-w-[1440px] w-full mx-auto">
          {adminNotice && (
            <div className="mb-6 rounded-xl border border-[#0CBC87]/30 bg-[#E6F8F3] px-5 py-3.5 text-[13.5px] font-semibold text-[#0F6E56] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0CBC87] shrink-0" />
                {adminNotice}
              </span>
              <button
                type="button"
                onClick={() => setAdminNotice(null)}
                className="text-[#0F6E56] hover:underline text-xs font-bold cursor-pointer"
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
                <div className="bg-[#EFEBF9] rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <div className="font-display text-[32px] font-extrabold text-[#1D2026] leading-none mb-2">
                      1600
                    </div>
                    <div className="text-[14px] font-medium text-[#475569]">
                      Enrolled Courses
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#6F42C1] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <UserIcon className="w-6 h-6" />
                  </div>
                </div>

                {/* 3. Course In Progress */}
                <div className="bg-[#E7F0FA] rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <div className="font-display text-[32px] font-extrabold text-[#1D2026] leading-none mb-2">
                      1235
                    </div>
                    <div className="text-[14px] font-medium text-[#475569]">
                      Course In Progress
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#066AC9] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>

                {/* 4. Total Watch Time */}
                <div className="bg-[#E6F8F3] rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <div className="font-display text-[32px] font-extrabold text-[#1D2026] leading-none mb-2">
                      845 hrs
                    </div>
                    <div className="text-[14px] font-medium text-[#475569]">
                      Total Watch Time
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#0CBC87] text-white flex items-center justify-center shrink-0 shadow-xs">
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
                      className="text-[13px] font-semibold text-[#066AC9] hover:underline cursor-pointer"
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
                          <h3 className="text-[14.5px] font-bold text-[#1D2026] hover:text-[#066AC9] transition-colors cursor-pointer">
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
                      className="text-[13px] font-semibold text-[#066AC9] hover:underline cursor-pointer"
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
                                <BookOpen className="w-3.5 h-3.5 text-[#6F42C1]" />
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
                          className="px-3.5 py-1.5 rounded-lg bg-[#F5F7F9] hover:bg-[#066AC9] text-[#24292D] hover:text-white text-[12.5px] font-semibold transition-colors shrink-0 cursor-pointer"
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
                  <div className="mt-6 rounded-lg bg-[#D1F3E8] border border-[#0CBC87]/35 px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-[#0F6E56]">
                      45 more notices listed
                    </span>
                    <button
                      type="button"
                      onClick={() => switchTab("reviews")}
                      className="px-3 py-1.5 rounded-md bg-[#BCECE0] hover:bg-[#0CBC87] text-[#0F6E56] hover:text-white text-[12px] font-bold transition-colors cursor-pointer"
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
                      className="text-[13px] font-semibold text-[#066AC9] hover:underline cursor-pointer"
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
                      className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-[14px] text-[#24292D] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
                    />
                    <Search className="w-4 h-4 text-[#747579] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
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
                                student.paymentStatus === "PARTIAL" &&
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
                              <div className="w-10 h-10 rounded-full bg-[#E6F8F3] text-[#0CBC87] flex items-center justify-center">
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
                              <div className="w-10 h-10 rounded-full bg-[#EFEBF9] text-[#6F42C1] flex items-center justify-center">
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
                            <div className="w-full h-1.5 rounded-full bg-[#E7F0FA] overflow-hidden">
                              <div
                                style={{ width: `${student.progress}%` }}
                                className="h-full rounded-full bg-[#066AC9]"
                              />
                            </div>
                          </div>
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
                              className="hover:text-[#066AC9] transition-colors cursor-pointer"
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
                              <span className="font-bold text-[#1D2026]">{stu.name}</span>
                            </td>
                            <td className="py-3.5 px-4 text-[#747579]">{stu.location}</td>
                            <td className="py-3.5 px-4 font-bold text-[#0CBC87]">
                              {stu.payments}
                            </td>
                            <td className="py-3.5 px-4 text-[#475569]">{stu.totalCourse}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full bg-[#E7F0FA] overflow-hidden">
                                  <div
                                    style={{ width: `${stu.progress}%` }}
                                    className="h-full bg-[#066AC9]"
                                  />
                                </div>
                                <span className="text-xs font-bold">{stu.progress}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-[#747579]">{stu.joinDate}</td>
                            <td className="py-3.5 px-4 text-right">
                              {stu.enrollmentId && stu.paymentStatus === "PARTIAL" && stu.coursePrice ? (
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
                                  className="px-3 py-1.5 rounded-lg bg-[#066AC9] text-white text-xs font-semibold hover:bg-[#0556A5] cursor-pointer"
                                >
                                  Mark Paid Full
                                </button>
                              ) : (
                                <span className="px-2.5 py-1 rounded-md bg-[#E6F8F3] text-[#0CBC87] text-xs font-bold">
                                  Verified
                                </span>
                              )}
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
                      className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
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
                            ? "bg-[#066AC9] text-white"
                            : "bg-[#E7F0FA] text-[#066AC9] hover:bg-[#066AC9] hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setStudentPage((p) => Math.min(3, p + 1))}
                      className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
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
                      className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-[14px] text-[#24292D] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
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
                              className="font-display text-[17px] font-extrabold text-[#1D2026] hover:text-[#066AC9] transition-colors truncate block text-left cursor-pointer"
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
                            <div className="w-10 h-10 rounded-full bg-[#EFEBF9] text-[#6F42C1] flex items-center justify-center">
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
                          className="text-[#747579] hover:text-[#066AC9] transition-colors cursor-pointer"
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
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80"
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
                        <span className="text-[#0CBC87] font-semibold">0.20% ↑</span>{" "}
                        <span className="text-[#747579]">vs last Week</span>
                      </div>
                    </div>

                    <div className="w-full pt-2">
                      <svg viewBox="0 0 400 115" className="w-full h-28 block" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="activeStudentsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0CBC87" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#0CBC87" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 95 C 40 85, 65 78, 95 52 C 125 32, 160 40, 205 42 C 245 44, 270 72, 300 68 C 335 64, 365 25, 400 20 L 400 115 L 0 115 Z"
                          fill="url(#activeStudentsGrad)"
                        />
                        <path
                          d="M 0 95 C 40 85, 65 78, 95 52 C 125 32, 160 40, 205 42 C 245 44, 270 72, 300 68 C 335 64, 365 25, 400 20"
                          fill="none"
                          stroke="#0CBC87"
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
                        <span className="text-[#0CBC87] font-semibold">0.35% ↑</span>{" "}
                        <span className="text-[#747579]">vs last Week</span>
                      </div>
                    </div>

                    <div className="w-full pt-2">
                      <svg viewBox="0 0 400 115" className="w-full h-28 block" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="newEnrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6F42C1" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#6F42C1" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 102 C 45 92, 95 92, 140 65 C 175 45, 210 28, 235 32 C 260 36, 275 82, 305 78 C 340 74, 370 18, 400 18 L 400 115 L 0 115 Z"
                          fill="url(#newEnrollmentGrad)"
                        />
                        <path
                          d="M 0 102 C 45 92, 95 92, 140 65 C 175 45, 210 28, 235 32 C 260 36, 275 82, 305 78 C 340 74, 370 18, 400 18"
                          fill="none"
                          stroke="#6F42C1"
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
                            statusStyle: "bg-[#E6F8F3] text-[#0CBC87]",
                            thumbBg: "bg-[#FDEBC8]",
                            thumbText: "💎",
                          },
                          {
                            title: "Graphic Design Masterclass",
                            enrolled: 254,
                            status: "Live",
                            statusStyle: "bg-[#E6F8F3] text-[#0CBC87]",
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
                            statusStyle: "bg-[#E6F8F3] text-[#0CBC87]",
                            thumbBg: "bg-[#E0F7FA] text-[#00BCD4]",
                            thumbText: "⚛",
                          },
                          {
                            title: "Bootstrap 5 From Scratch",
                            enrolled: 58,
                            status: "Cancel",
                            statusStyle: "bg-[#FBE9EB] text-[#D6293E]",
                            thumbBg: "bg-[#D8C6F7] text-[#6F42C1]",
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
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#066AC9] text-white text-[13px] font-bold flex items-center justify-center cursor-pointer"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                      >
                        3
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
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
                            name: "Lori Stevens",
                            course: "Building Scalable APIs with GraphQL",
                            stars: 5,
                            activeRow: true,
                            avatar:
                              "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
                          },
                          {
                            name: "Carolyn Ortiz",
                            course: "Graphic Design Masterclass",
                            stars: 5,
                            activeRow: false,
                            avatar:
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                          },
                          {
                            name: "Dennis Barrett",
                            course: "Deep Learning with React-Native",
                            stars: 4,
                            activeRow: false,
                            avatar:
                              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
                          },
                          {
                            name: "Billy Vasquez",
                            course: "Bootstrap 5 From Scratch",
                            stars: 4,
                            activeRow: false,
                            avatar:
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                          },
                          {
                            name: "Jacqueline Miller",
                            course: "Learn Invision",
                            stars: 4,
                            activeRow: false,
                            avatar:
                              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
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
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#066AC9] text-white text-[13px] font-bold flex items-center justify-center cursor-pointer"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                      >
                        3
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
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
                      className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-[14px] text-[#24292D] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
                    />
                    <Search className="w-4 h-4 text-[#747579] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <select
                    value={requestSort}
                    onChange={(e) => setRequestSort(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-full sm:w-56 text-[13.5px] text-[#747579] focus:outline-none focus:border-[#066AC9]"
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
                                        className="px-3.5 py-1.5 rounded-md bg-[#E6F8F3] hover:bg-[#0CBC87] text-[#0CBC87] hover:text-white text-[12.5px] font-bold transition-colors cursor-pointer"
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
                                    className="px-3.5 py-1.5 rounded-md bg-[#E7F0FA] hover:bg-[#066AC9] text-[#066AC9] hover:text-white text-[12.5px] font-bold transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#066AC9] hover:bg-[#0556A5] text-white text-[14px] font-semibold shadow-xs transition-colors cursor-pointer"
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
                        <span className="px-2.5 py-1 rounded-md bg-[#E7F0FA] text-[#066AC9] text-xs font-bold">
                          {course.badge}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#E6F8F3] text-[#0CBC87] text-xs font-bold">
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
                          <div className="text-[15px] font-extrabold text-[#066AC9]">
                            ₦{course.priceParts.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#747579] uppercase font-bold">Enrolled</div>
                          <div className="text-[15px] font-extrabold text-[#0CBC87]">
                            {course.enrolledCount} Students
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-[13px] font-semibold text-[#066AC9] hover:underline"
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
                                  ? "bg-[#066AC9] justify-end"
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
                                className="w-8 h-8 rounded-full bg-[#E6F8F3] hover:bg-[#0CBC87] text-[#0CBC87] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                      className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                    >
                      1
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md bg-[#066AC9] text-white text-[13px] font-bold flex items-center justify-center cursor-pointer"
                    >
                      2
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                    >
                      3
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
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
                              title: "Building Scalable APIs with GraphQL",
                              enrolled: 2568,
                              stars: 5,
                              thumbBg: "bg-[#FDEBC8]",
                              thumbText: "💎",
                            },
                            {
                              title: "Graphic Design Masterclass",
                              enrolled: 1858,
                              stars: 5,
                              thumbBg: "bg-[#1D3B53] text-[#38BDF8]",
                              thumbText: "Ps",
                            },
                            {
                              title: "Learn Invision",
                              enrolled: 6845,
                              stars: 5,
                              thumbBg: "bg-[#D6293E] text-white",
                              thumbText: "in",
                            },
                            {
                              title: "Deep Learning with React-Native",
                              enrolled: 3845,
                              stars: 4,
                              thumbBg: "bg-[#E0F7FA] text-[#00BCD4]",
                              thumbText: "⚛",
                            },
                            {
                              title: "Bootstrap 5 From Scratch",
                              enrolled: 1458,
                              stars: 4,
                              thumbBg: "bg-[#D8C6F7] text-[#6F42C1]",
                              thumbText: "B",
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
                                      className="w-8 h-8 rounded-full bg-[#E6F8F3] hover:bg-[#0CBC87] text-[#0CBC87] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                          className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                        >
                          1
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-md bg-[#066AC9] text-white text-[13px] font-bold flex items-center justify-center cursor-pointer"
                        >
                          2
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                        >
                          3
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
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
                      <div className="bg-[#E6F8F3] rounded-lg p-4">
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
                            stroke="#0CBC87"
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
          {/* VIEW 6: EARNINGS (Matches Images 1 & 4)                   */}
          {/* ========================================================= */}
          {(activeTab === "earnings" || activeTab === "analytics") && (
            <div>
              <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold text-[#1D2026] tracking-tight mb-6">
                Earnings
              </h1>

              {/* 3 Pastel Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
                {/* Sales this month */}
                <div className="bg-[#E7F0FA] rounded-xl p-6">
                  <div className="text-[14px] font-bold text-[#1D2026] mb-2">
                    Sales this month
                  </div>
                  <div className="font-display text-[36px] sm:text-[42px] font-extrabold text-[#066AC9] leading-tight">
                    $899.95
                  </div>
                </div>

                {/* To be paid */}
                <div className="bg-[#EFEBF9] rounded-xl p-6">
                  <div className="text-[14px] font-bold text-[#1D2026] mb-2 flex items-center gap-1.5">
                    <span>To be paid</span>
                    <span className="w-4 h-4 rounded-full bg-[#1D2026] text-white text-[10px] font-black inline-flex items-center justify-center">
                      i
                    </span>
                  </div>
                  <div className="font-display text-[36px] sm:text-[42px] font-extrabold text-[#6F42C1] leading-tight">
                    $750.35
                  </div>
                </div>

                {/* Lifetime Earnings */}
                <div className="bg-[#FFF2E2] rounded-xl p-6">
                  <div className="text-[14px] font-bold text-[#1D2026] mb-2">
                    Lifetime Earnings
                  </div>
                  <div className="font-display text-[36px] sm:text-[42px] font-extrabold text-[#FD7E14] leading-tight">
                    $4882.65
                  </div>
                </div>
              </div>

              {/* Invoice History Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-200/80">
                  <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                    Invoice History
                  </h2>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[780px]">
                      <thead>
                        <tr className="bg-[#24292D] text-white text-[13.5px] font-bold">
                          <th className="py-3.5 px-4 rounded-l-lg">Invoice ID</th>
                          <th className="py-3.5 px-4">Course Name</th>
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4">Payment Method</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 rounded-r-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[14px]">
                        {[
                          {
                            id: "#254684",
                            course: "Create a Design System in Figma",
                            date: "29 Aug 2021",
                            method: "mastercard",
                            amount: "$3999",
                            status: "Paid",
                            statusClass: "bg-[#E6F8F3] text-[#0CBC87]",
                            highlight: false,
                          },
                          {
                            id: "#125464",
                            course: "Sketch from A to Z: for app designer",
                            date: "26 Aug 2021",
                            method: "paypal",
                            amount: "$4201",
                            status: "Paid",
                            statusClass: "bg-[#E6F8F3] text-[#0CBC87]",
                            highlight: false,
                          },
                          {
                            id: "#123546",
                            course: "The Complete Web Development in python",
                            date: "18 July 2021",
                            method: "paypal",
                            amount: "$1032",
                            status: "Pending",
                            statusClass: "bg-[#FFF2E2] text-[#FD7E14]",
                            highlight: false,
                          },
                          {
                            id: "#1235698",
                            course: "Deep Learning with React-Native",
                            date: "09 July 2021",
                            method: "mastercard",
                            amount: "$6548",
                            status: "Paid",
                            statusClass: "bg-[#E6F8F3] text-[#0CBC87]",
                            highlight: false,
                          },
                          {
                            id: "#132456",
                            course: "Microsoft Excel - Excel from Beginner to Advanced",
                            date: "21 June 2021",
                            method: "paypal",
                            amount: "$2546",
                            status: "Pending",
                            statusClass: "bg-[#FFF2E2] text-[#FD7E14]",
                            highlight: false,
                          },
                          {
                            id: "#145623",
                            course: "Twitter Marketing & Twitter Ads For Beginners",
                            date: "05 June 2021",
                            method: "mastercard",
                            amount: "$4258",
                            status: "Cancel",
                            statusClass: "bg-[#FBE9EB] text-[#D6293E]",
                            highlight: false,
                          },
                          {
                            id: "#154632",
                            course: "The Complete Digital Marketing Course - 12 Courses in 1",
                            date: "15 April 2021",
                            method: "paypal",
                            amount: "$854",
                            status: "Pending",
                            statusClass: "bg-[#FFF2E2] text-[#FD7E14]",
                            highlight: false,
                          },
                          {
                            id: "#165423",
                            course: "Create a Design System in Figma",
                            date: "02 Jan 2021",
                            method: "mastercard",
                            amount: "$965",
                            status: "Paid",
                            statusClass: "bg-[#E6F8F3] text-[#0CBC87]",
                            highlight: true,
                          },
                        ].map((inv) => (
                          <tr
                            key={inv.id}
                            className={inv.highlight ? "bg-[#F2F4F6]" : "hover:bg-slate-50/70"}
                          >
                            <td
                              className={`py-4 px-4 ${
                                inv.highlight
                                  ? "text-[#1D2026] font-semibold"
                                  : "text-[#747579]"
                              }`}
                            >
                              {inv.id}
                            </td>
                            <td className="py-4 px-4 font-bold text-[#1D2026]">
                              {inv.course}
                            </td>
                            <td
                              className={`py-4 px-4 ${
                                inv.highlight
                                  ? "text-[#1D2026] font-medium"
                                  : "text-[#747579]"
                              }`}
                            >
                              {inv.date}
                            </td>
                            <td className="py-4 px-4">
                              {inv.method === "mastercard" ? (
                                <div className="inline-flex items-center relative h-6">
                                  <span className="w-6 h-6 rounded-full bg-[#EB001B] inline-block" />
                                  <span className="w-6 h-6 rounded-full bg-[#F79E1B]/90 -ml-2.5 inline-block" />
                                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-extrabold text-white tracking-tighter">
                                    mastercard
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 font-display font-black italic text-[15px]">
                                  <span className="text-[#003087]">P</span>
                                  <span className="text-[#003087]">Pay</span>
                                  <span className="text-[#0079C1] -ml-1">Pal</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="inline-flex items-center gap-1.5 font-medium text-[#475569]">
                                <span>{inv.amount}</span>
                                <span className="w-4 h-4 rounded-full bg-[#1D2026] text-white text-[9.5px] font-black inline-flex items-center justify-center">
                                  i
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold ${inv.statusClass}`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setAdminNotice(`Downloaded invoice ${inv.id}.`)
                                }
                                className="w-9 h-9 rounded-full bg-[#E7F0FA] hover:bg-[#066AC9] text-[#066AC9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Download Invoice"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                  />
                                </svg>
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
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#066AC9] text-white text-[13px] font-bold flex items-center justify-center cursor-pointer"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] text-[13px] font-bold flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
                      >
                        3
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md bg-[#E7F0FA] text-[#066AC9] flex items-center justify-center hover:bg-[#066AC9] hover:text-white transition-colors cursor-pointer"
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

                {/* Right Settings Content Card */}
                <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
                  {settingsSubTab === "website" && (
                    /* Sub-Tab 1: Website Settings (Matches Image 2) */
                    <div>
                      <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-display text-[20px] font-extrabold text-[#1D2026]">
                          Website Settings
                        </h2>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setAdminNotice("Website settings updated successfully.");
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
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
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
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
                            />
                            <p className="text-[11.5px] text-[#9A9EA4] mt-1.5 leading-snug">
                              Using for Contact and Send Email.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                              Site Email
                            </label>
                            <input
                              type="email"
                              placeholder="Site Email"
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
                            />
                            <p className="text-[11.5px] text-[#9A9EA4] mt-1.5 leading-snug">
                              For Copyrights Text.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                            Site Description
                          </label>
                          <textarea
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] focus:outline-none focus:border-[#066AC9]"
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
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
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
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
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
                                  checked={allowRegistration === opt.id}
                                  onChange={() =>
                                    setAllowRegistration(
                                      opt.id as "enable" | "disable" | "request"
                                    )
                                  }
                                  className="w-4 h-4 accent-[#066AC9]"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                            Contact Address
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Contact Address"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-lg bg-[#066AC9] hover:bg-[#0556A5] text-white text-[14px] font-bold transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {settingsSubTab !== "website" && (
                    /* Sub-Tab 2+: General Settings (Matches Image 5) */
                    <div>
                      <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-display text-[20px] font-extrabold text-[#1D2026] capitalize">
                          {settingsSubTab} Settings
                        </h2>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setAdminNotice("General settings updated successfully.");
                        }}
                        className="p-6 space-y-6"
                      >
                        <div>
                          <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                            Main Site URL
                          </label>
                          <input
                            type="text"
                            placeholder="Site URL"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] placeholder:text-[#9A9EA4] focus:outline-none focus:border-[#066AC9]"
                          />
                          <p className="text-[11.5px] text-[#9A9EA4] mt-1.5">
                            Set your main website url.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                              Select Currency
                            </label>
                            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#747579] bg-white focus:outline-none focus:border-[#066AC9]">
                              <option>Select Currency</option>
                              <option value="USD">USD ($)</option>
                              <option value="NGN">NGN (₦)</option>
                              <option value="EUR">EUR (€)</option>
                            </select>
                            <p className="text-[11.5px] text-[#9A9EA4] mt-1.5">
                              Select currency as per Country.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                              Select Language
                            </label>
                            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#747579] bg-white focus:outline-none focus:border-[#066AC9]">
                              <option>Select Language</option>
                              <option value="en">English</option>
                              <option value="fr">French</option>
                              <option value="es">Spanish</option>
                            </select>
                            <p className="text-[11.5px] text-[#9A9EA4] mt-1.5">
                              Select language as per Country.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                          <div className="md:col-span-4">
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2.5">
                              Maintainance mode
                            </label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={maintenanceMode}
                                onClick={() => setMaintenanceMode((prev) => !prev)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                                  maintenanceMode
                                    ? "bg-[#066AC9] justify-end"
                                    : "bg-[#EEF0F3] border border-slate-300 justify-start"
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full block ${
                                    maintenanceMode ? "bg-white" : "bg-[#8C939A]"
                                  }`}
                                />
                              </button>
                              <span className="text-[14px] text-[#747579]">
                                Make Site Offline
                              </span>
                            </div>
                          </div>

                          <div className="md:col-span-8">
                            <label className="block text-[13.5px] font-medium text-[#747579] mb-2">
                              Maintainance Text
                            </label>
                            <textarea
                              rows={3}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-[14px] text-[#1D2026] focus:outline-none focus:border-[#066AC9]"
                            />
                            <p className="text-[12px] text-[#9A9EA4] mt-1.5">
                              Admin login on maintenance mode:{" "}
                              <Link
                                href="/login"
                                className="text-[#066AC9] hover:underline ml-1"
                              >
                                http://example.xyz/admin/login
                              </Link>
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-lg bg-[#066AC9] hover:bg-[#0556A5] text-white text-[14px] font-bold transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                      </form>
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F7F9] text-sm focus:outline-none focus:ring-1 focus:ring-[#066AC9]"
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
                    className="px-5 py-2 rounded-lg bg-[#066AC9] text-white text-sm font-semibold hover:bg-[#0556A5]"
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
