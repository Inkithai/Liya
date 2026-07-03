import { cn } from"@/lib/utils";
export function Skeleton({ className }: { className?: string }) {
 return <div className={cn("animate-pulse rounded-3xl bg-foreground/5", className)} />;
}
