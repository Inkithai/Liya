"use client";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { FloatingCart } from "@/components/cart/FloatingCart";
import { MobileCartBar } from "@/components/cart/MobileCartBar";
import { ProductShelf } from "@/components/product/ProductShelf";
import { ReliabilityBar } from "@/components/product/ReliabilityBar";
import { useAppStore } from "@/store/useAppStore";

export default function ShoppingPage() {
  const loading = useAppStore((s) => s.isTyping || s.shelfPriming);
  return <main className="min-h-screen p-3 pb-24 md:p-5"><div className="grid gap-5 lg:grid-cols-[390px_minmax(0,1fr)_320px]"><ChatPanel /><section className="min-h-[calc(100vh-2rem)] rounded-[2rem] bg-white/40 p-4 dark:bg-white/[0.03]"><ReliabilityBar /><ProductShelf loading={loading} /></section><FloatingCart /><MobileCartBar /></div></main>;
}
