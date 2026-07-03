"use client";
import Link from"next/link";
import { ShoppingBag } from"lucide-react";
import { cartTotal, useAppStore } from"@/store/useAppStore";
import { formatLkr } from"@/lib/utils";

export function MobileCartBar() {
 const cart = useAppStore((s) => s.cart);
 const count = cart.reduce((sum, item) => sum + item.quantity, 0);
 if (!count) return null;
 return <Link href="/checkout" className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between rounded-full bg-ink px-5 py-4 font-bold text-white shadow-2xl shadow-black/25 lg:hidden dark:bg-white dark:text-ink" aria-label="Open checkout">
 <span className="flex items-center gap-2"><ShoppingBag size={18}/>{count} items</span>
 <span>{formatLkr(cartTotal(cart))} →</span>
 </Link>;
}
