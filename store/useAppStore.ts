"use client";

import { create } from"zustand";
import { persist, createJSONStorage } from"zustand/middleware";
import type { CartItem, ChatMessage, Language, Product, ShopperContext, OrderResult, ReliabilityMode } from"@/types";
import { liyaGreeting } from"@/lib/language";
import type { UserMemory } from"@/lib/orchestrator";

const id = () => {
 if (typeof crypto !== 'undefined' && crypto.randomUUID) {
 return crypto.randomUUID();
 }
 return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
 const r = Math.random() * 16 | 0;
 const v = c === 'x' ? r : (r & 0x3 | 0x8);
 return v.toString(16);
 });
};

type AppState = {
 sessionId: string;
 language: Language;
 context: ShopperContext;
 messages: ChatMessage[];
 products: Product[];
 compareIds: string[];
 wishlist: Product[];
 recentlyViewed: Product[];
 cart: CartItem[];
 lastOrder?: OrderResult;
 memory: UserMemory;
 demoStartedAt?: number;
 demoLocked: boolean;
 reliabilityMode: ReliabilityMode;
 lastProductUpdate?: number;
 isTyping: boolean;
 shelfPriming: boolean;
 setLanguage: (language: Language) => void;
 setContext: (context: Partial<ShopperContext>) => void;
 addMessage: (message: Omit<ChatMessage,"id" |"createdAt">) => void;
 resetChat: () => void;
 setTyping: (typing: boolean) => void;
 setShelfPriming: (priming: boolean) => void;
 setProducts: (products: Product[]) => void;
 toggleCompare: (id: string) => void;
 toggleWishlist: (product: Product) => void;
 addRecentlyViewed: (product: Product) => void;
 addToCart: (product: Product, quantity?: number) => void;
 updateQty: (productId: string, quantity: number) => void;
 removeFromCart: (productId: string) => void;
 clearCart: () => void;
 setLastOrder: (order: OrderResult) => void;
 setMemory: (memory: UserMemory) => void;
 startDemoTimer: () => void;
 stopDemoTimer: () => void;
 setDemoLocked: (locked: boolean) => void;
 setReliabilityMode: (mode: ReliabilityMode) => void;
};

export const useAppStore = create<AppState>()(persist((set) => ({
 sessionId: id(),
 language:"en",
 context: { language:"en" },
 messages: [{ id: id(), role:"assistant", content: liyaGreeting("en"), createdAt: Date.now(), language:"en", chips: ["Run Demo Mode","Gift finder","Find onions","Essentials","Trending","Track order","Reorder"] }],
 products: [],
 compareIds: [],
 wishlist: [],
 recentlyViewed: [],
 cart: [],
 memory: { preferences: [], dislikes: [], notes: [], emotionalIntent:"neutral", styleSignals: [] },
 demoLocked: false,
 reliabilityMode:"live",
 isTyping: false,
 shelfPriming: false,
 setLanguage: (language) => set((state) => ({ language, context: { ...state.context, language } })),
 setContext: (context) => set((state) => ({ context: { ...state.context, ...context } })),
 addMessage: (message) => set((state) => ({ messages: [...state.messages, { ...message, id: id(), createdAt: Date.now() }] })),
 resetChat: () => set((state) => ({ context: { language: state.language }, products: [], compareIds: [], memory: { preferences: [], dislikes: [], notes: [], emotionalIntent:"neutral", styleSignals: [] }, demoStartedAt: undefined, demoLocked: false, reliabilityMode:"live", isTyping: false, shelfPriming: false, lastProductUpdate: undefined, messages: [{ id: id(), role:"assistant", content: liyaGreeting(state.language), createdAt: Date.now(), language: state.language, chips: ["Run Demo Mode","Gift finder","Find onions","Essentials","Trending"] }] })),
 setTyping: (isTyping) => set({ isTyping }),
 setShelfPriming: (shelfPriming) => set({ shelfPriming }),
 setProducts: (products) => set({ products, lastProductUpdate: Date.now() }),
 toggleCompare: (productId) => set((state) => ({ compareIds: state.compareIds.includes(productId) ? state.compareIds.filter((id) => id !== productId) : state.compareIds.length >= 3 ? [...state.compareIds.slice(1), productId] : [...state.compareIds, productId] })),
 toggleWishlist: (product) => set((state) => ({ wishlist: state.wishlist.some((p) => p.id === product.id) ? state.wishlist.filter((p) => p.id !== product.id) : [product, ...state.wishlist].slice(0, 40) })),
 addRecentlyViewed: (product) => set((state) => ({ recentlyViewed: [product, ...state.recentlyViewed.filter((p) => p.id !== product.id)].slice(0, 12) })),
 addToCart: (product, quantity = 1) => set((state) => {
 const exists = state.cart.find((item) => item.product.id === product.id);
 return { cart: exists ? state.cart.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...state.cart, { product, quantity }] };
 }),
 updateQty: (productId, quantity) => set((state) => ({ cart: quantity <= 0 ? state.cart.filter((item) => item.product.id !== productId) : state.cart.map((item) => item.product.id === productId ? { ...item, quantity } : item) })),
 removeFromCart: (productId) => set((state) => ({ cart: state.cart.filter((item) => item.product.id !== productId) })),
 clearCart: () => set({ cart: [] }),
 setLastOrder: (lastOrder) => set({ lastOrder }),
 setMemory: (memory) => set({ memory }),
 startDemoTimer: () => set({ demoStartedAt: Date.now() }),
 stopDemoTimer: () => set({ demoStartedAt: undefined }),
 setDemoLocked: (demoLocked) => set({ demoLocked }),
 setReliabilityMode: (reliabilityMode) => set({ reliabilityMode })
}), {
 name:"liya-store",
 storage: createJSONStorage(() => localStorage),
 partialize: (state) => ({ sessionId: state.sessionId, language: state.language, cart: state.cart, wishlist: state.wishlist, recentlyViewed: state.recentlyViewed, lastOrder: state.lastOrder })
}));

export const cartTotal = (cart: CartItem[]) => cart.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0);
