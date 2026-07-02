"use client";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Gift, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cartTotal, useAppStore } from "@/store/useAppStore";
import { formatLkr } from "@/lib/utils";

export default function ReviewPage() {
  const cart = useAppStore((s) => s.cart);
  const lastOrder = useAppStore((s) => s.lastOrder);
  const addToCart = useAppStore((s) => s.addToCart);
  const recent = useAppStore((s) => s.recentlyViewed);
  return <main className="min-h-screen"><Header /><div className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-4xl font-black tracking-tight">Order review</h1><p className="mt-2 text-black/55 dark:text-white/60">A clear Notion-style summary before you pay or reorder.</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"><Card><h2 className="mb-4 flex items-center gap-2 font-black"><Gift size={18}/> Current cart</h2><div className="space-y-3">{cart.map((item) => <div key={item.product.id} className="flex items-center justify-between rounded-3xl bg-black/5 p-4 dark:bg-white/10"><div><b>{item.product.name}</b><p className="text-sm text-black/55 dark:text-white/60">Quantity {item.quantity}</p></div><b>{formatLkr((item.product.price ?? 0) * item.quantity, item.product.currency)}</b></div>)}{!cart.length && <p className="rounded-3xl bg-black/5 p-5 text-sm dark:bg-white/10">No items yet. Ask Liya to build a shelf.</p>}</div><div className="mt-5 flex justify-between border-t border-black/10 pt-4 text-xl font-black dark:border-white/10"><span>Total</span><span>{formatLkr(cartTotal(cart))}</span></div><div className="mt-5 flex gap-3"><Link href="/checkout"><Button>Continue checkout</Button></Link><Link href="/shop"><Button variant="secondary">Ask Liya</Button></Link></div></Card><div className="space-y-5"><Card><CheckCircle2 className="mb-3 text-green-600"/><h3 className="font-black">Last order</h3>{lastOrder ? <div className="mt-3 text-sm"><p>Order: <b>{lastOrder.orderNumber ?? "Created"}</b></p><p>Status: {lastOrder.status ?? "Payment pending"}</p>{lastOrder.paymentUrl && <a className="mt-3 inline-flex items-center gap-2 font-bold text-liya-700 dark:text-liya-300" href={lastOrder.paymentUrl} target="_blank" rel="noreferrer">Open payment link <ExternalLink size={14}/></a>}</div> : <p className="mt-2 text-sm text-black/55 dark:text-white/60">No created order yet.</p>}</Card><Card><RotateCcw className="mb-3 text-liya-500"/><h3 className="font-black">Reorder previous purchase</h3><p className="mt-2 text-sm text-black/55 dark:text-white/60">Recently viewed products are one tap away.</p><div className="mt-3 space-y-2">{recent.slice(0,3).map((p) => <button key={p.id} onClick={() => addToCart(p)} className="w-full rounded-2xl bg-black/5 p-3 text-left text-sm font-semibold hover:bg-liya-100 dark:bg-white/10 dark:hover:bg-white/15">Add again: {p.name}</button>)}</div></Card></div></div></div></main>;
}
