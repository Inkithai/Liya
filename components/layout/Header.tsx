"use client";
import { useEffect, useState } from"react";
import Link from"next/link";
import { Menu, Moon, ShoppingBag, Sun, X } from"lucide-react";
import { useTheme } from"next-themes";
import { useAppStore } from"@/store/useAppStore";
import { Logo } from"./Logo";
import { Button } from"@/components/ui/Button";

const navLinks = [
 { href:"/how-it-works", label:"How Liya Works" },
 { href:"/shop", label:"Shop" },
 { href:"/track", label:"Track" },
 { href:"/review", label:"Review" }
];

export function Header() {
 const { theme, setTheme } = useTheme();
 const [mounted, setMounted] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const count = useAppStore((s) => s.cart.reduce((sum, item) => sum + item.quantity, 0));

 useEffect(() => {
 setMounted(true);
 }, []);

 return <header className="sticky top-0 z-40 border-b border-orange-900/15 bg-orange-50/85 backdrop-blur-2xl shadow-lg shadow-orange-950/[0.04] dark:bg-black/65">
 <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
 <Logo />
 <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
 {navLinks.map((link) => <Link key={link.href} className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-card/10" href={link.href}>{link.label}</Link>)}
 </nav>
 <div className="flex items-center gap-2">
 <Link href="/how-it-works" className="focus-ring hidden rounded-full bg-card/80 px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-black/5 hover:bg-white dark:bg-foreground/10 dark:text-white dark:ring-white/10 sm:inline-flex">2-min Guide</Link>
 <Button variant="ghost" size="sm" aria-label="Toggle theme" title="Toggle dark/light mode" onClick={() => setTheme(theme ==="dark" ?"light" :"dark")}>{mounted && (theme ==="dark" ? <Sun size={18}/> : <Moon size={18}/>)}</Button>
 <Link href="/checkout" className="focus-ring relative grid h-10 w-10 place-items-center rounded-full bg-ink text-white dark:bg-white dark:text-gray-900" aria-label="Checkout" title="Open checkout"><ShoppingBag size={18}/>{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-liya-500 px-1 text-xs text-white">{count}</span>}</Link>
 <Button variant="ghost" size="sm" className="md:hidden" aria-label={mobileOpen ?"Close menu" :"Open menu"} title={mobileOpen ?"Close menu" :"Open menu"} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X size={18}/> : <Menu size={18}/>}</Button>
 </div>
 </div>
 {mobileOpen && <nav className="mx-auto grid max-w-7xl gap-2 px-4 pb-4 md:hidden" aria-label="Mobile navigation">
 {navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="focus-ring rounded-2xl bg-card/80 px-4 py-3 text-sm font-bold shadow-sm dark:bg-white/[0.08]">{link.label}</Link>)}
 </nav>}
 </header>;
}
