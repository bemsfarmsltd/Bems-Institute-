import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "purple" | "gold" | "green" | "dark";
}

export function Badge({ className, variant = "purple", ...props }: BadgeProps) {
  const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide";
  
  const variants = {
    purple: "bg-[#FBF6FC] text-[#AE54C6] border border-[#AE54C6]/20",
    gold: "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]",
    green: "bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]",
    dark: "bg-[#303654] text-white"
  };

  return <div className={cn(base, variants[variant], className)} {...props} />;
}
