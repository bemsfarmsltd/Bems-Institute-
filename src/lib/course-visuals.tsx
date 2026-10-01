import React from "react";
import { Bot, Code2, Palette, ShieldCheck, Smartphone, GraduationCap } from "lucide-react";

// Per-course icon + color, keyed by slug. Neutral Lucide icons rather than
// third-party brand logos (an earlier audit found cards showing e.g. the
// React.js logo on the Cybersecurity course — not BEMS-branded or
// contextually correct). Shared between CourseCards and the student
// dashboard's course table so a new course only needs updating in one place.
export interface CourseVisual {
  icon: React.ReactNode;
  solid: string;
  gradient: string;
  waveStroke: string;
}

export const COURSE_VISUALS: Record<string, CourseVisual> = {
  "ai-automation": {
    icon: <Bot className="w-16 h-16 text-white drop-shadow-md" />,
    solid: "#F69D56",
    gradient: "from-[#F8B179] via-[#F69D56] to-[#F48842]",
    waveStroke: "#D96B27"
  },
  "web-dev": {
    icon: <Code2 className="w-16 h-16 text-white drop-shadow-md" />,
    solid: "#1D3B53",
    gradient: "from-[#2D5571] via-[#1D3B53] to-[#0F2338]",
    waveStroke: "#3898EC"
  },
  "product-design": {
    icon: <Palette className="w-16 h-16 text-white drop-shadow-md" />,
    solid: "#F7B2B9",
    gradient: "from-[#FAD0D4] via-[#F7B2B9] to-[#F497A0]",
    waveStroke: "#E45C6E"
  },
  cybersecurity: {
    icon: <ShieldCheck className="w-16 h-16 text-[#0F2338] drop-shadow-md" />,
    solid: "#B4F1FF",
    gradient: "from-[#DFFBFF] via-[#B4F1FF] to-[#7CE0FA]",
    waveStroke: "#1AA3C8"
  },
  "mobile-dev": {
    icon: <Smartphone className="w-16 h-16 text-[#0F2338] drop-shadow-md" />,
    solid: "#EFE074",
    gradient: "from-[#F5EDA8] via-[#EFE074] to-[#E6CE3D]",
    waveStroke: "#A38A10"
  }
};

export const DEFAULT_COURSE_VISUAL: CourseVisual = {
  icon: <GraduationCap className="w-16 h-16 text-[#303654] drop-shadow-md" />,
  solid: "#F1E2F5",
  gradient: "from-[#F7EDF9] via-[#F1E2F5] to-[#E9D1F0]",
  waveStroke: "#AE54C6"
};

export function getCourseVisual(slug: string): CourseVisual {
  return COURSE_VISUALS[slug] || DEFAULT_COURSE_VISUAL;
}
