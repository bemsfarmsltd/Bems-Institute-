import type React from "react";
import type { MySpaceAccentColor, MySpaceBanner } from "@/types/lms";

export const MY_SPACE_ACCENTS: Array<{
  id: MySpaceAccentColor;
  name: string;
  hex: string;
}> = [
  { id: "purple", name: "BEMS Purple", hex: "#9C3FB5" },
  { id: "indigo", name: "Indigo", hex: "#4F46E5" },
  { id: "blue", name: "Ocean Blue", hex: "#2563EB" },
  { id: "teal", name: "Teal", hex: "#0B7F75" },
  { id: "green", name: "Forest Green", hex: "#23803F" },
  { id: "amber", name: "Warm Amber", hex: "#A85F00" },
  { id: "rose", name: "Rose", hex: "#C2185B" }
];

export const MY_SPACE_BANNERS: Array<{
  id: MySpaceBanner;
  name: string;
  isLight?: boolean;
  style: React.CSSProperties;
}> = [
  {
    id: "aurora",
    name: "Aurora",
    style: {
      backgroundImage:
        "radial-gradient(circle at 20% 25%, rgba(174, 84, 198, 0.55), transparent 55%), radial-gradient(circle at 80% 70%, rgba(45, 212, 191, 0.4), transparent 50%), linear-gradient(135deg, #272248 0%, #3E2A64 50%, #1F3A5F 100%)"
    }
  },
  {
    id: "circuit",
    name: "Circuit",
    style: {
      backgroundColor: "#1E243B",
      backgroundImage:
        "linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(135deg, #1E243B 0%, #2E355A 100%)",
      backgroundSize: "24px 24px, 24px 24px, 100% 100%"
    }
  },
  {
    id: "sunrise",
    name: "Sunrise",
    style: {
      backgroundImage:
        "radial-gradient(circle at 75% 20%, rgba(251, 191, 36, 0.45), transparent 50%), linear-gradient(135deg, #5B2158 0%, #9D3A6D 55%, #D97736 100%)"
    }
  },
  {
    id: "midnight",
    name: "Midnight",
    style: {
      backgroundImage:
        "radial-gradient(rgba(255, 255, 255, 0.16) 1.5px, transparent 1.5px), linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #312E81 100%)",
      backgroundSize: "18px 18px, 100% 100%"
    }
  },
  {
    id: "lagoon",
    name: "Lagoon",
    style: {
      backgroundImage:
        "radial-gradient(circle at 15% 80%, rgba(56, 189, 248, 0.35), transparent 55%), linear-gradient(135deg, #0F3D3E 0%, #115E59 50%, #1D4ED8 100%)"
    }
  },
  {
    id: "plain",
    name: "Plain Slate",
    style: {
      backgroundImage: "linear-gradient(135deg, #303654 0%, #3E4569 100%)"
    }
  }
];

export function getAccentHex(accentColor?: MySpaceAccentColor | null): string {
  return MY_SPACE_ACCENTS.find((a) => a.id === accentColor)?.hex ?? "#9C3FB5";
}

export function getBannerConfig(banner?: MySpaceBanner | null) {
  return MY_SPACE_BANNERS.find((b) => b.id === banner) ?? MY_SPACE_BANNERS[0];
}
