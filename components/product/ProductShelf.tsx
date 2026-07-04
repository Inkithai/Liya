"use client";
import { useState } from"react";
import { AnimatePresence, motion } from"framer-motion";
import { CheckCircle2, Scale, Sparkles, Trophy, X } from"lucide-react";
import { useAppStore } from"@/store/useAppStore";
import { comparisonRows } from"@/lib/orchestrator";
import { EmptyState } from"@/components/ui/EmptyState";
import { Skeleton } from"@/components/ui/Skeleton";
import { Button } from"@/components/ui/Button";
import { ProductCard } from"./ProductCard";

export function ProductShelf({ loading = false }: { loading?: boolean }) {
 const products = useAppStore((s) => s.products);
 const context = useAppStore((s) => s.context);
 const compareIds = useAppStore((s) => s.compareIds);
 const toggleCompare = useAppStore((s) => s.toggleCompare);
 const compared = products.filter((p) => compareIds.includes(p.id));
 const rows = comparisonRows(compared, context);
 const [activeCompare, setActiveCompare] = useState(0);
 const safeActive = Math.min(activeCompare, Math.max(rows.length - 1, 0));
 const active = rows[safeActive];
 const activeProduct = compared[safeActive];
 if (loading && !products.length) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}</div>;
 if (!products.length) return <EmptyState title="Tell Liya the story first" description="I won’t dump random products. Share who it’s for, budget, occasion, location and delivery date — then I’ll build a proper shelf." />;
 return <section aria-label="Recommended products" className="space-y-5">
 <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4"><div><p className="flex items-center gap-2 text-sm font-semibold text-liya-700 dark:text-liya-300"><Sparkles size={16}/> Liya’s persistent shelf {loading ?"· refreshing quietly" :""}</p><h2 className="text-2xl font-black tracking-tight">Recommendations with reasons</h2></div><p className="text-sm text-foreground/50">{products.length} curated picks</p></div>
 {compared.length > 0 && <motion.div layout className="rounded-[2rem] border border-liya-200 bg-liya-50/85 p-4 shadow-xl shadow-orange-950/[0.04] dark:border-liya-500/20 dark:bg-liya-500/10" aria-label="Interactive product comparison">
 <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
 <div><p className="flex items-center gap-2 text-sm font-black text-liya-700 dark:text-liya-300"><Scale size={16}/> Liya’s honest comparison</p><p className="mt-1 text-sm text-foreground/60">{compared.length < 2 ?"One item selected — tap Compare on one more card to unlock the decision panel." :"Compares only the products you selected. The trophy is the highest-ranked selected product from Liya’s shelf logic."}</p><p className="mt-1 text-xs font-semibold text-foreground/45" title="How comparison works">Method: shelf rank + budget fit + delivery context + stock + emotional/practical fit.</p></div>
 <div className="flex flex-wrap gap-2">{compared.map((product, index) => <button key={product.id} title={`Focus comparison on ${product.name}`} onClick={() => setActiveCompare(index)} className={`focus-ring max-w-[220px] rounded-full px-3 py-1.5 text-xs font-bold transition ${safeActive === index ?"bg-liya-500 text-white shadow-lg" :"bg-card/80 hover:bg-white dark:bg-black/20 dark:hover:bg-white/10"}`}>{index === 0 ?"🏆 " :""}{product.name}</button>)}</div>
 </div>
 {compared.length >= 2 && active && <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
 <div className="rounded-3xl bg-card/85 p-4 shadow-sm dark:bg-black/20"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-300">Liya’s current verdict</p><h3 className="mt-1 line-clamp-2 text-xl font-black">{safeActive === 0 ?"Best pick: " :"Contender: "}{active.name}</h3></div>{safeActive === 0 ? <Trophy className="h-8 w-8 shrink-0 text-amber-500"/> : <Scale className="h-8 w-8 shrink-0 text-liya-500"/>}</div><div className="mt-4 grid gap-2 text-sm"><span className="rounded-2xl bg-black/5 p-3 dark:bg-white/10"><b>Price:</b> {active.price}</span><span className="rounded-2xl bg-black/5 p-3 dark:bg-white/10"><b>Delivery:</b> {active.delivery}</span><span className="rounded-2xl bg-black/5 p-3 dark:bg-white/10"><b>Best for:</b> {active.bestFor}</span></div></div>
 <div className="rounded-3xl bg-card/85 p-4 shadow-sm dark:bg-black/20"><p className="flex items-center gap-2 font-black"><CheckCircle2 className="h-5 w-5 text-green-600"/> Decision notes</p><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div className="rounded-2xl bg-green-600/10 p-3 text-green-800 dark:text-green-200"><b>Why it can win</b><p className="mt-1">{safeActive === 0 ?"Best overall balance across story, price and delivery confidence." : active.bestFor}</p></div><div className="rounded-2xl bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200"><b>Tradeoff</b><p className="mt-1">{active.tradeoff}</p></div></div><div className="mt-3 flex flex-wrap gap-2">{activeProduct && <Button size="sm" title={`Remove ${activeProduct.name} from comparison`} variant="secondary" onClick={() => toggleCompare(activeProduct.id)}><X size={15}/> Remove</Button>}<span className="rounded-full bg-black/5 px-3 py-2 text-xs font-bold dark:bg-white/10" title="Tip: the first compared product is Liya’s strongest ranked choice">Tip: 🏆 means safest overall pick</span></div></div>
 </div>}
 </motion.div>}
 <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><AnimatePresence>{products.map((product, index) => <ProductCard key={product.id} product={product} context={context} featured={index === 0}/>)}</AnimatePresence></motion.div>
 </section>;
}
