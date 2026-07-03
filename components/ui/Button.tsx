"use client";
import { ButtonHTMLAttributes, forwardRef } from"react";
import { cn } from"@/lib/utils";

type Variant ="primary" |"secondary" |"ghost" |"danger";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?:"sm" |"md" |"lg" };

export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant ="primary", size ="md", ...props }, ref) => (
 <button
 ref={ref}
 className={cn(
"focus-ring inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all disabled:pointer-events-none disabled:opacity-50",
"active:scale-[.98]",
 variant ==="primary" &&"bg-primary shadow-xl hover:-translate-y-0.5",
 variant ==="secondary" &&"bg-secondary shadow-lg",
 variant ==="ghost" &&"bg-ghost",
 variant ==="danger" &&"bg-danger",
 size ==="sm" &&"h-9 px-4 text-sm",
 size ==="md" &&"h-11 px-5 text-sm",
 size ==="lg" &&"h-14 px-7 text-base",
 className
 )}
 {...props}
 />
));
Button.displayName ="Button";
