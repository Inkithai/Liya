"use client";

import { ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function ReliabilityBar() {
  const mode = useAppStore((s) => s.reliabilityMode);
  const last = useAppStore((s) => s.lastProductUpdate);
  const context = useAppStore((s) => s.context);
  const seconds = last ? Math.max(0, Math.round((Date.now() - last) / 1000)) : undefined;
  const decisionConfidence = mode === "live" ? 92 : mode === "degraded" ? 78 : 67;
  const deliveryConfidence = context.location && context.deliveryDate ? "High" : context.location || context.deliveryDate ? "Medium" : "Needs city/date";
  const config = mode === "live"
    ? { icon: Wifi, label: "Live MCP healthy", fallback: "Fallback: not active", cls: "bg-green-600/10 text-green-700 dark:text-green-300" }
    : mode === "degraded"
      ? { icon: ShieldCheck, label: "MCP slow · partial results", fallback: "Fallback: standing by", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-200" }
      : { icon: WifiOff, label: "Safe fallback active", fallback: "Demo continues smoothly", cls: "bg-blue-600/10 text-blue-700 dark:text-blue-300" };
  const Icon = config.icon;
  return <div className={`mb-4 rounded-2xl px-4 py-3 text-xs font-bold ${config.cls}`}>
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2"><Icon size={15}/>{config.label}</span><span>{seconds !== undefined ? `Products updated ${seconds}s ago` : "Ready for live search"}</span></div>
    <div className="mt-2 flex flex-wrap gap-2 text-[11px]"><span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-[hsl(var(--foreground))] dark:bg-black/20">Decision Confidence: {decisionConfidence}%</span><span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-[hsl(var(--foreground))] dark:bg-black/20">Delivery Confidence: {deliveryConfidence}</span><span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-[hsl(var(--foreground))] dark:bg-black/20">{config.fallback}</span></div>
  </div>;
}
