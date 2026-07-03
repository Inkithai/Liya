"use client";
import Image from "next/image";
import { Eye, ExternalLink, Heart, Plus, Scale, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Product, ShopperContext } from "@/types";
import { formatLkr } from "@/lib/utils";
import { recommendationWhy } from "@/lib/personality";
import { explainProduct, explanationBadges, getEmotionalLine, productTrust } from "@/lib/orchestrator";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

const fallbackSvg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#fed7aa'/><stop offset='1' stop-color='#f9a8d4'/></linearGradient></defs><rect width='600' height='450' rx='42' fill='url(#g)'/><circle cx='300' cy='180' r='70' fill='rgba(255,255,255,.55)'/><text x='300' y='315' text-anchor='middle' font-family='Arial' font-size='38' font-weight='700' fill='#7c2d12'>Kapruka Gift</text></svg>`);
const fallback = `data:image/svg+xml,${fallbackSvg}`;

export function ProductCard({ product, context, featured = false }: { product: Product; context: ShopperContext; featured?: boolean }) {
  const addToCart = useAppStore((s) => s.addToCart);
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const addRecentlyViewed = useAppStore((s) => s.addRecentlyViewed);
  const wishlist = useAppStore((s) => s.wishlist.some((p) => p.id === product.id));
  const compareIds = useAppStore((s) => s.compareIds);
  const memory = useAppStore((s) => s.memory);
  const reasons = explainProduct(product, context, memory, featured ? 0 : 1);
  const badges = explanationBadges(product, context, memory);
  const trust = product.trust === "fallback" ? { label: "Demo fallback", tone: "blue" as const } : productTrust(product, context);
  const emotionalLine = getEmotionalLine(context, product);
  const explainDecision = () => {
    const boosted = badges.find((badge) => badge.startsWith("Boosted")) ?? `Boosted: ${context.occasion ?? "gift fit"}`;
    const matched = badges.find((badge) => badge.startsWith("Matched")) ?? "Matched: shopper story";
    const filtered = badges.find((badge) => badge.startsWith("Filtered")) ?? "Filtered: weak emotional fit";
    toast("Why Liya chose this", {
      description: `${matched} · ${boosted} · ${filtered} · avoided options that felt less personal.`,
      action: product.url ? { label: "Open", onClick: () => window.open(product.url, "_blank") } : undefined
    });
  };
  const handleCompare = () => {
    toggleCompare(product.id);
    const isAdded = !compareIds.includes(product.id);
    toast(isAdded ? "Added to comparison, See Below." : "Removed from comparison");
  };
  return <motion.article layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="group overflow-hidden rounded-[2rem] border border-black/5 bg-white/85 shadow-xl shadow-black/[0.04] dark:border-white/10 dark:bg-white/[0.06]">
    <div className="relative aspect-[4/3] overflow-hidden bg-liya-100/50">
      <Image src={product.image || fallback} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes={featured ? "(min-width: 1024px) 35vw, 90vw" : "(min-width: 1024px) 22vw, 90vw"} />
      <div title={`Category: ${product.category ?? "Kapruka"}`} className="absolute left-3 top-3 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold shadow-lg backdrop-blur">{product.category ?? "Kapruka"}</div>
      <div title={`Trust: ${trust.label}`} className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-black shadow-lg backdrop-blur ${trust.tone === "green" ? "bg-green-600 text-white" : trust.tone === "amber" ? "bg-amber-500 text-white" : "bg-white/90 text-ink"}`}>{trust.label}</div>
      <button title={wishlist ? "Remove from wishlist" : "Add to wishlist"} aria-label="Wishlist" onClick={() => { toggleWishlist(product); toast.success(wishlist ? "Removed from wishlist" : "Saved for later") }} className="focus-ring absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/88 shadow-lg backdrop-blur"><Heart size={18} className={wishlist ? "fill-pink-500 text-pink-500" : ""}/></button>
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-3"><h3 title={product.name} className="line-clamp-2 font-bold leading-snug">{product.name}</h3><p title={`Price: ${formatLkr(product.price, product.currency)}`} className="shrink-0 font-black text-liya-700 dark:text-liya-300">{formatLkr(product.price, product.currency)}</p></div>
      <p title={`Why this gift: ${emotionalLine}`} className="mt-3 rounded-2xl bg-white/70 p-3 text-sm italic leading-5 text-black/65 dark:bg-white/10 dark:text-white/70">&quot;{emotionalLine}&quot;</p>
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Recommendation reasons">{badges.map((badge) => <span key={badge} title={`Reason: ${badge}`} className="rounded-full bg-liya-50 px-2.5 py-1 text-[11px] font-bold text-liya-800 dark:bg-liya-500/10 dark:text-liya-200"><Sparkles className="mr-1 inline h-3 w-3" />{badge}</span>)}</div>
      <div className="mt-4 flex flex-wrap gap-2"><Button title="Add to cart" className="flex-1 min-w-[80px]" size="sm" onClick={() => { addToCart(product); toast.success("Added to cart — nice choice!") }}><Plus size={16}/> Add</Button><Button title="See why Liya chose this" variant="secondary" size="sm" aria-label="Why this product" onClick={explainDecision}>Why?</Button><Button title="Quick view details" variant="secondary" size="sm" aria-label="Quick view" onClick={() => { addRecentlyViewed(product); toast(product.name, { description: reasons[0] ?? product.description ?? recommendationWhy(product, context), action: product.url ? { label: "Open", onClick: () => window.open(product.url, "_blank") } : undefined }); }}><Eye size={16}/></Button><Button title="Compare with other products" variant="secondary" size="sm" aria-label="Compare" onClick={handleCompare}><Scale size={16}/></Button>{product.url && <Button title="Open product page" variant="secondary" size="sm" aria-label="Open product" onClick={() => window.open(product.url, "_blank")}><ExternalLink size={16}/></Button>}</div>
    </div>
  </motion.article>;
}
