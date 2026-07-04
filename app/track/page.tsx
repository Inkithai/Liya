"use client";
import { FormEvent, useState } from"react";
import { PackageCheck, Search, Truck } from"lucide-react";
import { toast } from"sonner";
import { Header } from"@/components/layout/Header";
import { Button } from"@/components/ui/Button";
import { Card } from"@/components/ui/Card";
import { trackOrder } from"@/lib/mcp";
import type { TrackingResult } from"@/types";

export default function TrackPage() {
 const [order, setOrder] = useState("");
 const [result, setResult] = useState<TrackingResult>();
 const [loading, setLoading] = useState(false);
 async function submit(e: FormEvent) { e.preventDefault(); if (!order.trim()) return; setLoading(true); try { const r = await trackOrder(order.trim()); setResult(r); toast.success("Tracking loaded via MCP"); } catch (err) { toast.error(err instanceof Error ? err.message :"Tracking failed"); } finally { setLoading(false); } }
 return <main className="min-h-screen"><Header /><div className="mx-auto max-w-4xl px-4 py-12"><p className="text-sm font-semibold text-liya-700 dark:text-liya-300">Post-purchase experience</p><h1 className="text-5xl font-black tracking-tight">Track your Kapruka order</h1><p className="mt-3 text-foreground/55">Paste the Kapruka order number from the confirmation email or payment page — not a delivery code. Liya turns it into a simple timeline.</p><Card className="mt-6"><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="order">Order number</label><input id="order" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="Eg: VIMP34456CB2" className="min-h-14 flex-1 rounded-full border border-foreground/10 bg-card/70 px-5 outline-none focus:border-liya-500 dark:bg-foreground/10"/><Button disabled={loading}><Search size={18}/>{loading ?"Checking…" :"Track"}</Button></form></Card>{result && <Card className="mt-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-black">{result.orderNumber}</h2><p className="text-foreground/55">{result.status}</p></div><PackageCheck className="h-10 w-10 text-liya-500"/></div><ol className="mt-8 space-y-5">{result.stages.map((stage, i) => <li key={`${stage.label}-${i}`} className="flex gap-4"><span className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full ${stage.status ==="done" ?"bg-green-600 text-white" : stage.status ==="current" ?"bg-liya-500 text-white" :"bg-black/10 dark:bg-foreground/10"}`}>{stage.status ==="upcoming" ? i + 1 : <Truck size={15}/>}</span><div><b>{stage.label}</b>{stage.at && <p className="text-sm text-foreground/50">{stage.at}</p>}{stage.note && <p className="text-sm text-foreground/55">{stage.note}</p>}</div></li>)}</ol></Card>}</div></main>;
}
