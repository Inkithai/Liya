import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[2rem] border border-black/5 bg-white/78 p-5 shadow-2xl shadow-black/[0.04] backdrop-blur-xl dark:border-white/10 dark:bg-[hsl(var(--card))]", className)} {...props} />;
}
