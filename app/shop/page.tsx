"use client";
import { useEffect, useState } from"react";
import { Home, Moon, Sun } from"lucide-react";
import { useTheme } from"next-themes";
import { ChatPanel } from"@/components/chat/ChatPanel";
import { FloatingCart } from"@/components/cart/FloatingCart";
import { MobileCartBar } from"@/components/cart/MobileCartBar";
import { ProductShelf } from"@/components/product/ProductShelf";
import { ReliabilityBar } from"@/components/product/ReliabilityBar";
import { useAppStore } from"@/store/useAppStore";
import { useRouter } from"next/navigation";
import { Button } from"@/components/ui/Button";

export default function ShoppingPage() {
 const router = useRouter();
 const { theme, setTheme } = useTheme();
 const [mounted, setMounted] = useState(false);
 const loading = useAppStore((s) => s.isTyping || s.shelfPriming);
 useEffect(() => setMounted(true), []);
 return (
 <main className="relative min-h-screen p-3 pb-24 md:p-5 lg:h-screen lg:min-h-0 lg:overflow-hidden">
 <div className="absolute right-3 top-3 z-30 md:right-5 md:top-5">
 <div className="glass flex items-center gap-2 rounded-full p-1.5 shadow-xl">
 <Button variant="ghost" size="sm" aria-label="Toggle theme" title="Toggle dark/light mode" onClick={() => setTheme(theme ==="dark" ?"light" :"dark")}>{mounted && (theme ==="dark" ? <Sun size={17}/> : <Moon size={17}/>)}</Button>
 <Button variant="ghost" size="sm" onClick={() => router.push('/')} title="Go home"><Home size={17}/> <span className="hidden sm:inline">Home</span></Button>
 </div>
 </div>
 <div className="grid gap-5 lg:h-full lg:grid-cols-[390px_minmax(0,1fr)_320px]">
 <ChatPanel />
 <section className="min-h-[calc(100vh-2rem)] rounded-[2rem] bg-card/40 p-4 dark:bg-white/[0.03] lg:h-full lg:min-h-0 lg:overflow-auto">
 <ReliabilityBar />
 <ProductShelf loading={loading} />
 </section>
 <FloatingCart />
 <MobileCartBar />
 </div>
 </main>
 );
}
