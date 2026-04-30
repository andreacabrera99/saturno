import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-stone-900 text-white hover:bg-stone-700 focus:ring-stone-900":
              variant === "primary",
            "border border-stone-900 text-stone-900 hover:bg-stone-100 focus:ring-stone-900":
              variant === "secondary",
            "text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:ring-stone-400":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600":
              variant === "danger",
            "px-3 py-1.5 text-sm rounded": size === "sm",
            "px-5 py-2.5 text-sm rounded-md": size === "md",
            "px-6 py-3 text-base rounded-md": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export default Button;
