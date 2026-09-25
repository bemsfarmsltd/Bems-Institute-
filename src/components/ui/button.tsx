import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "purple" | "secondary" | "outline" | "whatsapp" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-gradient-to-r from-[#7928CA] to-[#18143D] text-white shadow-md hover:shadow-lg hover:from-[#8B3FFC] hover:to-[#241E56] hover:-translate-y-0.5",
      purple: "bg-[#7928CA] text-white shadow-md hover:bg-[#681EB3] hover:shadow-lg hover:-translate-y-0.5",
      secondary: "bg-[#FAF8FF] text-[#18143D] border border-[#D1C9EB] hover:bg-[#F0EBFF]",
      outline: "border border-[#E6E1F5] bg-white text-[#18143D] hover:border-[#7928CA] hover:bg-[#FAF8FF] hover:text-[#7928CA]",
      whatsapp: "bg-[#25D366] text-white font-bold shadow-md hover:bg-[#1DA851] hover:shadow-lg hover:-translate-y-0.5",
      ghost: "text-[#18143D] hover:bg-[#FAF8FF] hover:text-[#7928CA]"
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3.5 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
