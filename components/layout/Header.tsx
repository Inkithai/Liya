"use client";
import { useEffect, useState } from"react";
import Link from"next/link";
import { Menu, Moon, ShoppingBag, Sun, X } from"lucide-react";
import { useTheme } from"next-themes";
import { useAppStore } from"@/store/useAppStore";
import { Logo } from"./Logo";
import { Button } from"@/components/ui/Button";

export function Header() {
 const { theme, setTheme } = useTheme();
 const [mounted, setMounted] = useState(false);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const count = useAppStore((s) => s.cart.reduce((sum, item) => sum + item.quantity, 0));

 useEffect(() => {
 setMounted(true);
 }, []);

 return <header className="sticky top-0 z-40 border-b border-orange-900/15 bg-orange-50/85 backdrop-blur-2xl shadow-lg shadow-orange-950/[0.04] dark:bg-black/65"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"><Logo /><nav className="hidden items-center gap-2 md:flex"><Link className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-card/10" href="/how-it-works">How Liya Works (Judges)</Link><Link className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-card/10" href="/shop">Shop</Link><Link className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-card/10" href="/track">Track</Link><Link className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-card/10" href="/review">Review</Link></nav><div className="flex items-center gap-2"><Link href="/how-it-works" className="focus-ring hidden rounded-full bg-card/80 px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-black/5 hover:bg-white dark:bg-foreground/10 dark:text-white dark:ring-white/10 sm:inline-flex">2-min Guide</Link><Button variant="ghost" size="sm" aria-label="Toggle theme" onClick={() => setTheme(theme ==="dark" ?"light" :"dark")}>{mounted && (theme ==="dark" ? <Sun size={18}/> : <Moon size={18}/>)}</Button><Link href="/checkout" className="focus-ring relative grid h-10 w-10 place-items-center rounded-full bg-ink text-white dark:bg-white dark:text-gray-900" aria-label="Checkout"><ShoppingBag size={18}/>{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-liya-500 px-1 text-xs text-white">{count}</span>}</Link><Button variant="ghost" size="sm" aria-label="Toggle mobile menu" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}</Button></div></div>{mobileMenuOpen && <nav className="md:hidden border-t border-orange-900/10 bg-orange-50/95 px-4 py-4 dark:bg-black/80"><div className="flex flex-col gap-2"><Link className="rounded-full px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-card/10" href="/how-it-works" onClick={() => setMobileMenuOpen(false)}>How Liya Works (Judges)</Link><Link className="rounded-full px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-card/10" href="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link><Link className="rounded-full px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-card/10" href="/track" onClick={() => setMobileMenuOpen(false)}>Track</Link><Link className="rounded-full px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-card/10" href="/review" onClick={() => setMobileMenuOpen(false)}>Review</Link><Link className="mt-2 rounded-full bg-card/80 px-4 py-3 text-sm font-bold text-ink shadow-sm ring-1 ring-black/5 hover:bg-white dark:bg-foreground/10 dark:text-white dark:ring-white/10" href="/how-it-works" onClick={() => setMobileMenuOpen(false)}>2-min Guide</Link></div></nav>}</header>;
}
