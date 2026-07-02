"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function DemoEntryPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => setReady(true), 850);
    const routeTimer = window.setTimeout(() => router.replace("/shop?demo=true"), 1450);
    return () => { window.clearTimeout(readyTimer); window.clearTimeout(routeTimer); };
  }, [router]);

  return <main className="grid min-h-screen place-items-center soft-grid p-6">
    <section className="w-full max-w-lg rounded-[2rem] border border-black/5 bg-white/78 p-8 text-center shadow-2xl shadow-black/[0.06] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-liya-400 to-pink-500 text-white shadow-xl shadow-liya-500/20"><Sparkles size={28}/></div>
      <h1 className="mt-6 text-3xl font-black tracking-tight">Setting up your guided experience…</h1>
      <p className="mt-3 text-black/60 dark:text-white/65">Liya is preparing the judge path: story, live search, shelf, cart and checkout.</p><p className="mt-2 text-sm font-semibold text-liya-700 dark:text-liya-300">Unlike a product grid, Liya chooses and completes the gift flow with you.</p>
      <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-liya-50 p-4 text-sm font-bold text-liya-900 dark:bg-liya-500/10 dark:text-liya-100">
        {ready ? <CheckCircle2 size={18} className="text-green-600"/> : <Loader2 size={18} className="animate-spin"/>}
        {ready ? "Liya is ready." : "Warming the shopping flow."}
      </div>
    </section>
  </main>;
}
