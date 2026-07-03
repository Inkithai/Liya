import { HTMLAttributes } from"react";
import { cn } from"@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
 return <div className={cn("rounded-[2rem] border border-orange-900/15 bg-orange-50/90 p-5 shadow-2xl shadow-orange-950/[0.08] backdrop-blur-xl dark:bg-white/[0.08] dark:shadow-black/30", className)} {...props} />;
}
