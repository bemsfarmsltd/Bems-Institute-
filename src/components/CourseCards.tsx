"use client";

import Link from "next/link";
import { COURSES } from "@/data/courses";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tilt3DCard } from "./Tilt3DCard";
import {
  Bot,
  Code2,
  Palette,
  ShieldAlert,
  Clock,
  UserCheck,
  Calendar,
  CheckCircle2,
  Award,
  ArrowRight
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "ai-automation": <Bot className="w-6 h-6 text-[#7928CA]" />,
  "web-dev": <Code2 className="w-6 h-6 text-[#2563EB]" />,
  "product-design": <Palette className="w-6 h-6 text-[#DB2777]" />,
  cybersecurity: <ShieldAlert className="w-6 h-6 text-[#059669]" />
};

const glowColorMap: Record<string, string> = {
  "ai-automation": "rgba(121, 40, 202, 0.20)",
  "web-dev": "rgba(37, 99, 235, 0.18)",
  "product-design": "rgba(219, 39, 119, 0.18)",
  cybersecurity: "rgba(5, 150, 105, 0.18)"
};

export function CourseCards() {
  return (
    <section
      id="courses"
      className="relative overflow-hidden py-24 bg-gradient-to-b from-[#FAF8FF] via-white to-[#F4EFFF] border-b border-[#E6E1F5]"
    >
      {/* Subtle 4D Architectural Grid & Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-spatial-grid-light [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-radial from-[#7928CA]/12 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-radial from-[#3B82F6]/12 to-transparent blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="purple" className="mb-3">
            SPECIALIZED 3D TECH TRACKS
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18143D] tracking-tight mb-4">
            Curriculum Built for Employment
          </h2>
          <p className="text-[#645F80] text-base leading-relaxed">
            Every track runs for 3 months, combines in-person labs in Umuahia with live Zoom sessions, and concludes with an employer-proof capstone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 perspective-1500">
          {COURSES.map((course) => (
            <Tilt3DCard
              key={course.id}
              maxTilt={7}
              glowColor={glowColorMap[course.id] || "rgba(121, 40, 202, 0.18)"}
              className="bg-white/90 backdrop-blur-xl border border-[#DFD8F5] rounded-3xl p-8 shadow-md hover:shadow-2xl hover:shadow-[#18143D]/10 transition-shadow duration-300 flex flex-col justify-between"
            >
              <div>
                <div
                  style={{ transform: "translateZ(22px)" }}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF8FF] border border-[#E6E1F5] shadow-2xs flex items-center justify-center">
                      {iconMap[course.id] || <Code2 className="w-6 h-6 text-[#7928CA]" />}
                    </div>
                    <Badge variant="purple">{course.badge}</Badge>
                  </div>
                  <Badge variant="dark" className="gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> {course.duration}
                  </Badge>
                </div>

                <div style={{ transform: "translateZ(16px)" }}>
                  <h3 className="text-2xl font-black text-[#18143D] mb-1">{course.title}</h3>
                  <p className="text-sm text-[#645F80] mb-6">{course.tagline}</p>
                </div>

                {/* Meta details */}
                <div
                  style={{ transform: "translateZ(20px)" }}
                  className="grid grid-cols-2 gap-3 p-3.5 bg-[#FAF8FF]/90 border border-[#E6E1F5] rounded-2xl mb-6 text-xs text-[#18143D]"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#7928CA]" />
                    <span>
                      <strong>Tutor:</strong> {course.tutor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#7928CA]" />
                    <span>{course.schedule}</span>
                  </div>
                </div>

                {/* Modules list */}
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#7928CA] uppercase tracking-wider block mb-2">
                    Core Curriculum:
                  </span>
                  <ul className="space-y-2">
                    {course.modules.slice(0, 4).map((mod, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#1E1B38]">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{mod}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Final project elevated in 3D space */}
                <div
                  style={{ transform: "translateZ(26px)" }}
                  className="bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7]/60 border border-[#FDE68A] rounded-2xl p-3.5 flex items-start gap-3 mb-6 shadow-2xs"
                >
                  <Award className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-[#92400E] block">
                      Employer-Proof Capstone:
                    </strong>
                    <p className="text-xs text-[#78350F] leading-tight">{course.finalProject}</p>
                  </div>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div
                style={{ transform: "translateZ(20px)" }}
                className="pt-6 border-t border-[#E6E1F5]"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#645F80] uppercase block">
                      Pay in Full (12% off)
                    </span>
                    <span className="text-2xl font-black text-[#18143D]">
                      ₦{course.priceFull.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#645F80] uppercase block">
                      Or Pay in Parts
                    </span>
                    <span className="text-xs font-bold text-[#7928CA]">
                      Deposit from ₦{course.deposit.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/courses/${course.id}`} className="w-full">
                    <Button variant="outline" className="w-full bg-white/80">
                      View Syllabus
                    </Button>
                  </Link>
                  <Link href={`/subscriptions?course=${course.id}`} className="w-full">
                    <Button className="w-full gap-1.5 shadow-md shadow-[#7928CA]/20">
                      <span>Enroll Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Tilt3DCard>
          ))}
        </div>
      </div>
    </section>
  );
}
