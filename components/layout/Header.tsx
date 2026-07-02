"use client";
import Link from "next/link";
import { Moon, ShoppingBag, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store/useAppStore";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { theme, setTheme } = useTheme();
  const count = useAppStore((s) => s.cart.reduce((sum, item) => sum + item.quantity, 0));
  return <header className="sticky top-0 z-40 border-b border-orange-900/15 bg-orange-50/85 backdrop-blur-2xl shadow-lg shadow-orange-950/[0.04] dark:border-white/10 dark:bg-black/65"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"><Logo /><nav className="hidden items-center gap-2 md:flex"><Link className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10" href="/how-it-works">How Liya Works (Judges)</Link><Link className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10" href="/shop">Shop</Link><Link className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10" href="/track">Track</Link><Link className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10" href="/review">Review</Link></nav><div className="flex items-center gap-2"><Link href="/how-it-works" className="focus-ring hidden rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-black/5 hover:bg-white dark:bg-white/10 dark:text-white dark:ring-white/10 sm:inline-flex">2-min Guide</Link><Button variant="ghost" size="sm" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</Button><Link href="/checkout" className="focus-ring relative grid h-10 w-10 place-items-center rounded-full bg-ink text-white dark:bg-white dark:text-ink" aria-label="Checkout"><ShoppingBag size={18}/>{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-liya-500 px-1 text-xs text-white">{count}</span>}</Link></div></div></header>;
}
