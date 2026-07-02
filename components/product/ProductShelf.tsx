"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { comparisonRows } from "@/lib/orchestrator";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "./ProductCard";

export function ProductShelf({ loading = false }: { loading?: boolean }) {
  const products = useAppStore((s) => s.products);
  const context = useAppStore((s) => s.context);
  const compareIds = useAppStore((s) => s.compareIds);
  const compared = products.filter((p) => compareIds.includes(p.id));
  const rows = comparisonRows(compared, context);
  if (loading && !products.length) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}</div>;
  if (!products.length) return <EmptyState title="Tell Liya the story first" description="I won’t dump random products. Share who it’s for, budget, occasion, location and delivery date — then I’ll build a proper shelf." />;
  return <section aria-label="Recommended products" className="space-y-5">
    <div className="flex items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-semibold text-liya-700 dark:text-liya-300"><Sparkles size={16}/> Liya’s persistent shelf {loading ? "· refreshing quietly" : ""}</p><h2 className="text-2xl font-black tracking-tight">Recommendations with reasons</h2></div><p className="text-sm text-black/50 dark:text-white/55">{products.length} curated picks</p></div>
    <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><AnimatePresence>{products.map((product, index) => <ProductCard key={product.id} product={product} context={context} featured={index === 0}/>)}</AnimatePresence></motion.div>
    {compared.length >= 2 && <div className="rounded-[2rem] border border-liya-200 bg-liya-50/80 p-5 dark:border-liya-500/20 dark:bg-liya-500/10"><div className="flex items-center justify-between"><h3 className="font-black">Liya’s honest comparison</h3><span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">Best pick highlighted</span></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="text-black/55 dark:text-white/60"><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Delivery</th><th className="p-3">Best for</th><th className="p-3">Tradeoff</th></tr></thead><tbody>{rows.map((row, i) => <tr key={row.name} className={i === 0 ? "rounded-2xl bg-white/90 font-semibold dark:bg-black/25" : "border-t border-black/5 dark:border-white/10"}><td className="p-3">{i === 0 ? "🏆 " : ""}{row.name}</td><td className="p-3">{row.price}</td><td className="p-3">{row.delivery}</td><td className="p-3">{row.bestFor}</td><td className="p-3">{row.tradeoff}</td></tr>)}</tbody></table></div></div>}
  </section>;
}
