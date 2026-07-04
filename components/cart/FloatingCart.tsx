"use client";
import Link from"next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from"lucide-react";
import { motion } from"framer-motion";
import { cartTotal, useAppStore } from"@/store/useAppStore";
import { formatLkr } from"@/lib/utils";
import { Button } from"@/components/ui/Button";

export function FloatingCart() {
 const cart = useAppStore((s) => s.cart);
 const updateQty = useAppStore((s) => s.updateQty);
 const remove = useAppStore((s) => s.removeFromCart);
 return <motion.aside initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="glass sticky top-24 hidden max-h-[calc(100vh-7rem)] w-80 overflow-hidden rounded-[2rem] p-4 lg:block" aria-label="Cart">
 <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-black"><ShoppingBag size={18}/> Cart</h2><span className="rounded-full bg-black/5 px-3 py-1 text-xs dark:bg-foreground/10">{cart.length} items</span></div>
 <div className="no-scrollbar mt-4 max-h-[48vh] space-y-3 overflow-auto pr-1">{cart.length === 0 ? <p className="rounded-3xl bg-black/5 p-5 text-sm text-foreground/55 dark:bg-foreground/10 dark:text-white/60">Your cart is waiting patiently. Add an item when you’re ready.</p> : cart.map((item) => <div key={item.product.id} className="rounded-3xl bg-card/78 p-3 shadow-sm dark:bg-foreground/10"><div className="flex justify-between gap-3"><b className="line-clamp-2 text-sm">{item.product.name}</b><button aria-label="Remove item" onClick={() => remove(item.product.id)}><Trash2 size={15}/></button></div><div className="mt-3 flex items-center justify-between"><span className="text-sm font-bold text-liya-700 dark:text-liya-300">{formatLkr(item.product.price, item.product.currency)}</span><div className="flex items-center gap-2"><button className="grid h-7 w-7 place-items-center rounded-full bg-foreground/5" onClick={() => updateQty(item.product.id, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={14}/></button><span className="w-5 text-center text-sm">{item.quantity}</span><button className="grid h-7 w-7 place-items-center rounded-full bg-foreground/5" onClick={() => updateQty(item.product.id, item.quantity + 1)} aria-label="Increase quantity"><Plus size={14}/></button></div></div></div>)}</div>
 <div className="mt-4 border-t border-foreground/5 pt-4"><div className="flex justify-between font-black"><span>Total</span><span>{formatLkr(cartTotal(cart))}</span></div><p className="mt-1 text-xs text-foreground/50">Delivery confirmed during checkout via Kapruka MCP.</p><Button className="mt-4 w-full" disabled={!cart.length} onClick={() => { location.href ="/checkout" }}>Checkout in ~2 min</Button><Link href="/review" className="mt-2 block text-center text-xs font-semibold text-liya-700 dark:text-liya-300">Review order</Link></div>
 </motion.aside>;
}
