"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLMS } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminGate } from "@/components/AdminGate";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  PlusCircle,
  QrCode,
  Search,
  Filter,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Eye,
  Edit3
} from "lucide-react";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "overview";

  const {
    adminStudents,
    adminCourses,
    analytics,
    addCourse,
    updateCourseStatus,
    updateStudentPayment
  } = useLMS();

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Student filter & search state
  const [studentSearch, setStudentSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // New course modal state
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newTutor, setNewTutor] = useState("Mr. Victor");
  const [newTutorRole, setNewTutorRole] = useState("Senior Technical Instructor");
  const [newPriceFull, setNewPriceFull] = useState(79000);
  const [newPriceParts, setNewPriceParts] = useState(90000);
  const [newDeposit, setNewDeposit] = useState(35000);
  const [newDelivery, setNewDelivery] = useState("Physical Lab (Umuahia) + Live Zoom");
  const [newSchedule, setNewSchedule] = useState("3x a week · Flexible Batches");

  const filteredStudents = adminStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.phone.includes(studentSearch);
    const matchesCourse = courseFilter === "all" || student.courseId === courseFilter;
    const matchesPayment =
      paymentFilter === "all" || student.paymentStatus === paymentFilter;
    return matchesSearch && matchesCourse && matchesPayment;
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) return;

    await addCourse({
      title: newTitle,
      slug: newSlug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      badge: "Newly Added Track",
      tutor: newTutor,
      tutorRole: newTutorRole,
      priceFull: Number(newPriceFull),
      priceParts: Number(newPriceParts),
      deposit: Number(newDeposit),
      delivery: newDelivery,
      schedule: newSchedule
    });
    setShowAddCourseModal(false);
    setNewTitle("");
    setNewSlug("");
    alert(`Course "${newTitle}" successfully added to the BEMS portal catalog!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Admin Executive Header */}
      <div className="bg-[#18143D] text-white py-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="gold">PHASE 3 EXECUTIVE CONSOLE</Badge>
                <Badge variant="purple">OCTOBER 2026 COHORT</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                BEMS Institute Master Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-[#A5A0C8] mt-1">
                Enterprise control center for course catalog, student roster, revenue yield, and marketing banners.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/qr-studio"
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 text-xs"
                >
                  <QrCode className="w-4 h-4 mr-1.5" /> Banner QR Studio
                </Button>
              </a>

              <Link href="/instructor">
                <Button variant="purple" className="shadow-md text-xs">
                  <GraduationCap className="w-4 h-4 mr-1.5" /> Instructor Studio
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto border-b border-white/10 pb-px">
            {[
              { id: "overview", label: "Executive Overview", icon: TrendingUp },
              { id: "courses", label: "Course Management", icon: BookOpen },
              { id: "students", label: "Student Management", icon: Users },
              { id: "analytics", label: "Analytics & Banner Yield", icon: QrCode }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(`/admin?tab=${tab.id}`);
                  }}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[#18143D] shadow-sm"
                      : "text-[#A5A0C8] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: EXECUTIVE OVERVIEW                                 */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645F80]">
                    Total Registered Students
                  </span>
                  <Users className="w-5 h-5 text-[#7928CA]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#18143D]">
                    {analytics.totalStudents}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {Math.round((analytics.totalStudents / analytics.targetStudents) * 100)}% of Goal
                  </span>
                </div>
                <p className="text-xs text-[#8580A3] mt-2">
                  Target: 80 students across 4 tracks
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645F80]">
                    Tuition Revenue
                  </span>
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-700">
                    ₦{(analytics.totalRevenue / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Goal: ₦6.8M
                  </span>
                </div>
                <p className="text-xs text-[#8580A3] mt-2">
                  Full payments & upfront deposits collected
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645F80]">
                    Average Completion
                  </span>
                  <TrendingUp className="w-5 h-5 text-[#7928CA]" />
                </div>
                <div className="text-3xl font-black text-[#18143D]">
                  {analytics.completionRate}%
                </div>
                <p className="text-xs text-[#8580A3] mt-2">
                  Across 4 active curriculum tracks
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#645F80]">
                    Certificates Issued
                  </span>
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-purple-900">
                  {analytics.certificatesIssued}
                </div>
                <p className="text-xs text-[#8580A3] mt-2">
                  Cryptographically verified credentials
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Roster Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E6E1F5] p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#F0EDF9] mb-4">
                  <div>
                    <h3 className="text-lg font-black text-[#18143D]">
                      Recent Student Enrolments
                    </h3>
                    <p className="text-xs text-[#645F80]">
                      Live student admissions from physical QR banners and web portal.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("students")}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    View All {adminStudents.length} Students &rarr;
                  </Button>
                </div>

                <div className="divide-y divide-[#F0EDF9]">
                  {adminStudents.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#18143D]">
                          {student.name}
                        </div>
                        <div className="text-[#8580A3]">
                          {student.courseTitle} &middot; {student.deliveryMode}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            student.paymentStatus === "PAID_FULL"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {student.paymentStatus === "PAID_FULL"
                            ? "Paid in Full (₦79k-84k)"
                            : `Installment (₦${student.amountPaid.toLocaleString()} paid)`}
                        </span>
                        <div className="text-[10px] text-[#8580A3] mt-0.5">
                          via {student.qrSource}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operations Control Box */}
              <div className="bg-gradient-to-br from-[#18143D] to-[#2E1065] rounded-2xl p-6 text-white shadow-lg space-y-6 flex flex-col justify-between">
                <div>
                  <Badge variant="gold" className="mb-2">PHYSICAL LOGISTICS</Badge>
                  <h3 className="text-xl font-bold mb-2">
                    Umuahia Lab Infrastructure
                  </h3>
                  <p className="text-xs text-[#C4BDE7] leading-relaxed mb-4">
                    Inaugural cohort runs at BEMS Hub Labs (Umuahia) and live broadcast over Zoom. Workstations are fully provisioned with VS Code, Git, Figma, and high-speed fibre internet.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/10">
                      <span>Lab Seat Occupancy:</span>
                      <strong className="text-emerald-400">57 / 60 Seats (95%)</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/10">
                      <span>Live Zoom Participants:</span>
                      <strong className="text-purple-300">31 Students</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/10">
                  <Button
                    onClick={() => setShowAddCourseModal(true)}
                    variant="purple"
                    className="w-full text-xs"
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" /> Add New Course / Workshop
                  </Button>
                  <Button
                    onClick={() => setActiveTab("analytics")}
                    variant="outline"
                    className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 text-xs"
                  >
                    Inspect Marketing Yield &rarr;
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COURSE MANAGEMENT                                  */}
        {/* ========================================================= */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#18143D]">
                  Course & Track Management
                </h2>
                <p className="text-xs text-[#645F80]">
                  Configure curriculum tracks, lead tutors, tuition tiers, and publishing statuses.
                </p>
              </div>

              <Button
                onClick={() => setShowAddCourseModal(true)}
                variant="purple"
                className="shadow-sm"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Create New Course
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-[#E6E1F5] p-6 shadow-xs flex flex-col justify-between hover:border-[#7928CA]/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          course.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {course.status}
                      </span>
                      <Badge variant="purple">{course.badge}</Badge>
                    </div>

                    <h3 className="text-lg font-black text-[#18143D] mb-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#645F80] mb-4">
                      Lead: <strong className="text-[#18143D]">{course.tutor}</strong> ({course.tutorRole})
                    </p>

                    <div className="space-y-2 p-3 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5] text-xs mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[#645F80]">Pay in Full:</span>
                        <strong className="text-emerald-700">
                          ₦{course.priceFull.toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#645F80]">Installment Total:</span>
                        <strong className="text-[#18143D]">
                          ₦{course.priceParts.toLocaleString()} (₦{course.deposit.toLocaleString()} deposit)
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#645F80]">Enrolled Students:</span>
                        <strong className="text-[#7928CA]">
                          {course.enrolledCount} Students
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F0EDF9] flex items-center justify-between gap-2">
                    <Button
                      onClick={() =>
                        updateCourseStatus(
                          course.id,
                          course.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE"
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {course.status === "ACTIVE" ? "Archive" : "Activate"}
                    </Button>

                    <Link href={`/courses/${course.slug}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-[#7928CA]">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Syllabus
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: STUDENT MANAGEMENT                                 */}
        {/* ========================================================= */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#18143D]">
                  Student Enrolment Roster ({filteredStudents.length} Students)
                </h2>
                <p className="text-xs text-[#645F80]">
                  Manage admissions, verify tuition receipts, and monitor progress across all cohorts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    const csvContent =
                      "Name,Email,Phone,Course,Delivery,PaymentStatus,AmountPaid\n" +
                      filteredStudents
                        .map(
                          (s) =>
                            `"${s.name}","${s.email}","${s.phone}","${s.courseTitle}","${s.deliveryMode}","${s.paymentStatus}","${s.amountPaid}"`
                        )
                        .join("\n");
                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `BEMS_Students_${Date.now()}.csv`;
                    a.click();
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Export CSV Roster
                </Button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-[#E6E1F5] shadow-xs flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#8580A3] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or phone..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D1C9EB] text-xs text-[#18143D] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D1C9EB] text-xs font-bold text-[#18143D] bg-white focus:outline-hidden"
                >
                  <option value="all">All Courses</option>
                  <option value="web-dev">Web Development</option>
                  <option value="ai-automation">AI & Automation</option>
                  <option value="product-design">Product Design</option>
                  <option value="cybersecurity">Cybersecurity</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D1C9EB] text-xs font-bold text-[#18143D] bg-white focus:outline-hidden"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="PAID_FULL">Paid in Full</option>
                  <option value="PARTIAL">Installment Active</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-2xl border border-[#E6E1F5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8FF] text-[#645F80] font-bold uppercase tracking-wider border-b border-[#E6E1F5]">
                    <tr>
                      <th className="py-3.5 px-6">Student</th>
                      <th className="py-3.5 px-4">Track</th>
                      <th className="py-3.5 px-4">Delivery Mode</th>
                      <th className="py-3.5 px-4">Payment Plan</th>
                      <th className="py-3.5 px-4">Marketing Source</th>
                      <th className="py-3.5 px-4">Progress</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDF9] text-[#18143D]">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-[#FAF8FF]/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-sm text-[#18143D]">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-[#8580A3]">
                            {student.email} &middot; {student.phone}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-[#7928CA]">
                          {student.courseTitle}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              student.deliveryMode.includes("Physical")
                                ? "bg-purple-100 text-purple-900"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {student.deliveryMode}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold">
                            ₦{student.amountPaid.toLocaleString()} / ₦{student.totalDue.toLocaleString()}
                          </div>
                          <span
                            className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              student.paymentStatus === "PAID_FULL"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {student.paymentStatus === "PAID_FULL"
                              ? "Paid Full"
                              : "Installment"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-[#8580A3]">
                          <span className="flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-[#7928CA]" />
                            {student.qrSource}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-[#E6E1F5] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#7928CA] h-full"
                                style={{ width: `${student.progressPercent}%` }}
                              />
                            </div>
                            <span className="font-bold text-[11px]">
                              {student.progressPercent}%
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {student.paymentStatus !== "PAID_FULL" && (
                              <button
                                onClick={() =>
                                  updateStudentPayment(
                                    student.id,
                                    "PAID_FULL",
                                    student.totalDue
                                  )
                                }
                                title="Mark Tuition Balance Paid"
                                className="px-2 py-1 rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-[11px]"
                              >
                                Mark Full
                              </button>
                            )}

                            <a
                              href={`https://wa.me/234${student.phone.replace(/[^0-9]/g, "").slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-[#25D366] hover:bg-emerald-50"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ANALYTICS & BANNER YIELD                           */}
        {/* ========================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#18143D]">
                  Enrollment Analytics & Physical Banner Yield
                </h2>
                <p className="text-xs text-[#645F80]">
                  Conversion data from physical roll-up banners deployed across Umuahia locations.
                </p>
              </div>

              <a
                href="/qr-studio"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="purple" size="sm">
                  <QrCode className="w-4 h-4 mr-1.5" /> Banner QR Studio
                </Button>
              </a>
            </div>

            {/* Banner Marketing Yield Table */}
            <div className="bg-white rounded-2xl border border-[#E6E1F5] p-6 shadow-xs">
              <h3 className="text-lg font-black text-[#18143D] mb-1">
                Physical Spot QR Performance Breakdown
              </h3>
              <p className="text-xs text-[#645F80] mb-6">
                Tracks foot-traffic scans and converted paid enrollments for each outdoor banner.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {analytics.bannerChannelYield.map((channel) => (
                  <div
                    key={channel.source}
                    className="p-5 rounded-2xl bg-[#FAF8FF] border border-[#E6E1F5] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <QrCode className="w-5 h-5 text-[#7928CA]" />
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {channel.conversionRate}% Conv
                        </span>
                      </div>

                      <h4 className="font-black text-[#18143D] text-sm mb-0.5">
                        {channel.source}
                      </h4>
                      <p className="text-[11px] text-[#8580A3] mb-3">
                        {channel.location}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E6E1F5] space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#645F80]">Scans:</span>
                        <strong>{channel.scans}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#645F80]">Enrolled:</span>
                        <strong className="text-[#7928CA]">{channel.registrations} students</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#645F80]">Revenue:</span>
                        <strong className="text-emerald-700">
                          ₦{(channel.revenue / 1000000).toFixed(2)}M
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution Charts & Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Track Distribution */}
              <div className="bg-white rounded-2xl border border-[#E6E1F5] p-6 shadow-xs">
                <h3 className="text-base font-black text-[#18143D] mb-4">
                  Student Distribution by Technical Track
                </h3>
                <div className="space-y-4">
                  {analytics.trackDistribution.map((track) => (
                    <div key={track.track} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#18143D]">{track.track}</span>
                        <span className="text-[#645F80]">
                          {track.count} students &middot; ₦{(track.revenue / 1000000).toFixed(2)}M
                        </span>
                      </div>
                      <div className="w-full bg-[#E6E1F5] rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(track.count / analytics.totalStudents) * 100}%`,
                            backgroundColor: track.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Mode Distribution */}
              <div className="bg-white rounded-2xl border border-[#E6E1F5] p-6 shadow-xs">
                <h3 className="text-base font-black text-[#18143D] mb-4">
                  Delivery Mode (Physical Labs vs. Virtual Live Zoom)
                </h3>
                <div className="space-y-6">
                  {analytics.deliveryDistribution.map((item) => (
                    <div key={item.mode} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#18143D]">{item.mode}</span>
                        <span className="font-extrabold text-[#7928CA]">
                          {item.count} students ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#E6E1F5] rounded-full h-4 overflow-hidden p-0.5">
                        <div
                          className="bg-[#7928CA] h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="p-4 rounded-xl bg-[#FAF8FF] border border-[#E6E1F5] text-xs text-[#645F80] flex items-center justify-between">
                    <div>
                      <strong className="text-[#18143D]">Lab Capacity Status: </strong>
                      Physical lab seats in Umuahia are 95% full. Zoom cohort has open capacity.
                    </div>
                    <Badge variant="purple">95% Physical Fill</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E6E1F5] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EDF9]">
              <h3 className="text-lg font-black text-[#18143D]">
                Add New Course or Masterclass
              </h3>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="text-[#8580A3] hover:text-[#18143D] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#18143D] mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud DevOps Engineering"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#D1C9EB] focus:outline-hidden text-[#18143D]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#18143D] mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. devops-engineering"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D1C9EB] focus:outline-hidden text-[#18143D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#18143D] mb-1">
                    Lead Tutor
                  </label>
                  <input
                    type="text"
                    required
                    value={newTutor}
                    onChange={(e) => setNewTutor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1C9EB] focus:outline-hidden text-[#18143D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#18143D] mb-1">
                    Tutor Role
                  </label>
                  <input
                    type="text"
                    required
                    value={newTutorRole}
                    onChange={(e) => setNewTutorRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1C9EB] focus:outline-hidden text-[#18143D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-[#18143D] mb-1">
                    Full Price (₦)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPriceFull}
                    onChange={(e) => setNewPriceFull(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1C9EB] focus:outline-hidden text-[#18143D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#18143D] mb-1">
                    Parts Total (₦)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPriceParts}
                    onChange={(e) => setNewPriceParts(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1C9EB] focus:outline-hidden text-[#18143D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#18143D] mb-1">
                    Deposit (₦)
                  </label>
                  <input
                    type="number"
                    required
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1C9EB] focus:outline-hidden text-[#18143D]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F0EDF9]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCourseModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="purple" size="sm">
                  Publish to LMS Catalog
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGate>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Master Admin Console...</div>}>
        <AdminDashboardContent />
      </Suspense>
    </AdminGate>
  );
}
