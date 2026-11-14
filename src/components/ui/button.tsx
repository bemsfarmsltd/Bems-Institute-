import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "purple" | "secondary" | "outline" | "whatsapp" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    // m-press (src/app/motion.css): springy lift on hover, squash on press or tap.
    const base = "m-press inline-flex items-center justify-center font-medium rounded-xl cursor-pointer disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-gradient-to-r from-[#AE54C6] to-[#303654] text-white shadow-md hover:shadow-lg hover:from-[#C779EA] hover:to-[#3E4569]",
      purple: "bg-[#AE54C6] text-white shadow-md hover:bg-[#A23ABF] hover:shadow-lg",
      secondary: "bg-[#FAF8FF] text-[#303654] border border-[#E5C8ED] hover:bg-[#F9F3FB]",
      outline: "border border-[#F1E2F5] bg-white text-[#303654] hover:border-[#AE54C6] hover:bg-[#FAF8FF] hover:text-[#AE54C6]",
      whatsapp: "bg-[#25D366] text-white font-bold shadow-md hover:bg-[#1DA851] hover:shadow-lg",
      ghost: "text-[#303654] hover:bg-[#FAF8FF] hover:text-[#AE54C6]"
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
