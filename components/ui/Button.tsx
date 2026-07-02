"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" };

export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all disabled:pointer-events-none disabled:opacity-50",
      "active:scale-[.98]",
      variant === "primary" && "bg-ink text-white shadow-xl shadow-orange-500/10 hover:-translate-y-0.5 hover:bg-black dark:bg-white dark:text-ink",
      variant === "secondary" && "bg-white/80 text-ink shadow-lg shadow-black/5 ring-1 ring-black/5 hover:bg-white dark:bg-white/10 dark:text-white dark:ring-white/10",
      variant === "ghost" && "text-ink hover:bg-black/5 dark:text-white dark:hover:bg-white/10",
      variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
      size === "sm" && "h-9 px-4 text-sm",
      size === "md" && "h-11 px-5 text-sm",
      size === "lg" && "h-14 px-7 text-base",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
