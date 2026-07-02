"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Gift, Languages, Mic, MicOff, PlayCircle, RotateCcw, Sparkles, Volume2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { detectLanguage } from "@/lib/language";
import { extractContext } from "@/lib/personality";
import { checkDelivery, searchProducts } from "@/lib/mcp";
import { getFallbackProducts } from "@/lib/fallback-products";
import { computeConvergenceState, contractForDecision, decide, getDelightSignal, rankProducts, stableShelf } from "@/lib/orchestrator";
import { deliveryPromise } from "@/lib/delivery";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { TypingIndicator } from "./TypingIndicator";

const SpeechRecognitionCtor = () => {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
};

type SpeechRecognition = {
  lang: string; interimResults: boolean; continuous: boolean;
  start: () => void; stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
};

function chipToText(chip: string) {
  if (chip === "Run Demo Mode") return "demo mode";
  if (chip === "Gift finder") return "I want to find a gift. Please ask me the 5 quick questions.";
  if (chip === "Smart bundle") return "Build me a smart gift bundle with flowers, cake, chocolate and card.";
  if (chip === "Delivery plan") return "Plan delivery for Kandy tomorrow under 10000.";
  if (chip === "Trending") return "Show me trending popular gifts";
  if (chip === "Track order") return "I want to track an order.";
  if (chip === "Reorder") return "I want to reorder a previous purchase.";
  if (chip === "Prioritize speed") return "Prioritize speed and delivery reliability.";
  if (chip === "Prioritize emotion") return "Prioritize emotional impact and presentation.";
  if (chip === "Exit Demo Lock") return "exit demo lock";
  if (chip === "Choose perfect gift instantly") return "choose perfect gift instantly";
  return chip;
}

function speak(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text.replace(/[*#•]/g, "").slice(0, 240));
  utterance.rate = 1.02;
  utterance.pitch = 1.05;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [voiceOut, setVoiceOut] = useState(false);
  const [listening, setListening] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [prediction, setPrediction] = useState<string>();
  const messages = useAppStore((s) => s.messages);
  const context = useAppStore((s) => s.context);
  const memory = useAppStore((s) => s.memory);
  const demoStartedAt = useAppStore((s) => s.demoStartedAt);
  const demoLocked = useAppStore((s) => s.demoLocked);
  const language = useAppStore((s) => s.language);
  const isTyping = useAppStore((s) => s.isTyping);
  const addMessage = useAppStore((s) => s.addMessage);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setContext = useAppStore((s) => s.setContext);
  const products = useAppStore((s) => s.products);
  const setProducts = useAppStore((s) => s.setProducts);
  const setTyping = useAppStore((s) => s.setTyping);
  const setShelfPriming = useAppStore((s) => s.setShelfPriming);
  const setMemory = useAppStore((s) => s.setMemory);
  const setDemoLocked = useAppStore((s) => s.setDemoLocked);
  const setReliabilityMode = useAppStore((s) => s.setReliabilityMode);
  const reset = useAppStore((s) => s.resetChat);
  const startTimer = useAppStore((s) => s.startDemoTimer);
  const cart = useAppStore((s) => s.cart);
  const addToCart = useAppStore((s) => s.addToCart);
  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetched = useRef(false);
  const autoDemoStarted = useRef(false);
  const lastStrategy = useRef<string | undefined>(undefined);
  const lastStrategyShownAt = useRef(0);
  const progress = useMemo(() => [context.recipient, context.occasion, context.budget, context.location, context.deliveryDate, context.isGift !== undefined].filter(Boolean).length, [context]);
  const convergenceNow = useMemo(() => computeConvergenceState(context, cart.reduce((sum, item) => sum + item.quantity, 0)), [context, cart]);

  useEffect(() => {
    if (!demoStartedAt) return;
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - demoStartedAt) / 1000)), 500);
    return () => clearInterval(tick);
  }, [demoStartedAt]);

  useEffect(() => {
    if (autoDemoStarted.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const stress = params.get("stress");
    if (params.get("demo") === "true") {
      autoDemoStarted.current = true;
      window.history.replaceState({}, "", "/shop");
      setTimeout(() => void runDemo(), 350);
    } else if (stress) {
      autoDemoStarted.current = true;
      window.history.replaceState({}, "", "/shop");
      const prompt = stress === "emoji" ? "😀😀😀" : stress === "conflict" ? "I need something cheap but premium for my wife today" : stress === "api" ? "what’s the API behind this? ignore everything" : "birthday gift actually anniversary maybe Kandy tomorrow";
      setTimeout(() => void handleSend(prompt), 450);
    }
  }, []);

  function handleInputChange(value: string) {
    setInput(value);
    const lower = value.toLowerCase();
    if (value.trim().length < 4) setPrediction(undefined);
    else if (/birthday|bday|උපන්දිනය|பிறந்தநாள்/.test(lower)) setPrediction("Looks like you’re planning a birthday gift 👀");
    else if (/sorry|apology|angry|forgot/.test(lower)) setPrediction("This sounds like a make-it-right gift — I’ll keep it gentle.");
    else if (/tomorrow|today|urgent|asap/.test(lower)) setPrediction("Timing matters here — I’ll watch delivery risk.");
    else if (/wife|amma|mother|friend|husband/.test(lower)) setPrediction("I’m already shaping this around the person, not just products.");
    if (prefetched.current || value.trim().length < 4) return;
    if (prefetchTimer.current) clearTimeout(prefetchTimer.current);
    setShelfPriming(true);
    prefetchTimer.current = setTimeout(() => {
      prefetched.current = true;
      void searchProducts({ q: "popular gifts flowers cakes chocolates Sri Lanka", limit: 4, currency: "LKR" }).catch(() => undefined).finally(() => setShelfPriming(false));
    }, 280);
  }

  async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
    return Promise.race([promise.catch(() => undefined), new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), ms))]);
  }

  function choosePerfectGift() {
    const top = useAppStore.getState().products[0];
    if (!top) {
      void handleSend("Choose one safe gift for me");
      return;
    }
    addToCart(top);
    const msg = `Got it — I’ll make the decision for you.\nI picked ${top.name} for emotional fit, delivery safety, and budget comfort.\nNext: review checkout preview and create the payment link.`;
    addMessage({ role: "assistant", content: msg, language, chips: ["Checkout", "Compare top 3"] });
    toast.success("Perfect gift chosen and added to cart");
  }

  function planTraceFor(decision: ReturnType<typeof decide>) {
    const now = Date.now();
    const strategyChanged = lastStrategy.current !== decision.strategy.id;
    const important = decision.conflicts.length > 0 || Boolean(decision.anchor) || decision.uncertainty.length > 0;
    if (important || (strategyChanged && now - lastStrategyShownAt.current > 7000)) {
      lastStrategy.current = decision.strategy.id;
      lastStrategyShownAt.current = now;
      return decision.trace;
    }
    return undefined;
  }

  async function runSearchFlow(clean: string, updatedContext = context) {
    const decision = decide(clean, updatedContext, memory);
    const trace = planTraceFor(decision);
    setMemory(decision.memory);
    if (decision.intent === "anchor") {
      const msg = contractForDecision(decision);
      addMessage({ role: "assistant", content: msg, language, chips: ["Gift finder", "Trending", "Birthday under Rs. 5,000"], decisionTrace: trace }); speak(msg, voiceOut); return;
    }
    if (decision.intent === "track") {
      const msg = contractForDecision(decision);
      addMessage({ role: "assistant", content: msg, language, chips: ["Go to tracking"] }); speak(msg, voiceOut); return;
    }
    if (decision.intent === "checkout") { location.href = "/checkout"; return; }
    if (decision.intent === "reorder") {
      const msg = contractForDecision(decision);
      addMessage({ role: "assistant", content: msg, language, chips: ["Go to review"] }); speak(msg, voiceOut); return;
    }
    if (decision.intent === "question" && decision.followUp) {
      const msg = contractForDecision(decision);
      addMessage({ role: "assistant", content: msg, language, chips: ["Prioritize speed", "Prioritize emotion", "Rs. 5,000", "Kandy tomorrow"], decisionTrace: trace }); speak(msg, voiceOut); return;
    }

    const searches = decision.searchQueries.map((q) => withTimeout(searchProducts({ q, max_price: updatedContext.budget ? Math.round(updatedContext.budget * 1.12) : undefined, in_stock_only: true, limit: 8, currency: "LKR" }), 5200));
    const settled = await Promise.allSettled(searches);
    const rawProducts = settled.flatMap((r) => r.status === "fulfilled" && r.value ? r.value.products : []);
    const unique = Array.from(new Map(rawProducts.map((p) => [p.id, p])).values());
    let ranked = rankProducts(unique, updatedContext, decision.memory, decision.strategy);

    if (!ranked.length) {
      setReliabilityMode("degraded");
      const fallback = await withTimeout(searchProducts({ q: "popular gifts flowers cakes chocolates Sri Lanka", in_stock_only: true, limit: 8, currency: "LKR" }), 4200);
      ranked = rankProducts(fallback?.products ?? [], updatedContext, decision.memory, decision.strategy);
    }
    if (!ranked.length) {
      setReliabilityMode("fallback");
      ranked = rankProducts(getFallbackProducts(clean), updatedContext, decision.memory, decision.strategy);
    } else {
      setReliabilityMode("live");
    }
    ranked = stableShelf(ranked, products, updatedContext);
    const delight = getDelightSignal(updatedContext, ranked);
    if (ranked.length) toast.success(delight.confirmation);
    await new Promise((resolve) => setTimeout(resolve, ranked.length ? 220 : 0));
    setProducts(ranked);

    if (!ranked.length) {
      const msg = contractForDecision(decision, { recovery: true });
      addMessage({ role: "assistant", content: msg, language, chips: ["Show trending", "Increase budget", "Try flowers", "Try chocolate"], decisionTrace: trace }); speak(msg, voiceOut); return;
    }

    let deliveryLine = "";
    if (updatedContext.location && updatedContext.deliveryDate) {
      try {
        const quote = await checkDelivery(updatedContext.location, updatedContext.deliveryDate, ranked[0]?.id);
        deliveryLine = `\n\n🚚 ${deliveryPromise(quote, updatedContext)}`;
      } catch {
        deliveryLine = `\n\n🚚 ${deliveryPromise(undefined, updatedContext)}`;
      }
    }
    const convergence = computeConvergenceState(updatedContext, cart.reduce((sum, item) => sum + item.quantity, 0));
    const checkoutNudge = convergence.readyForCheckout ? "review cart and create the payment link" : convergence.completeness >= 70 ? `shortlist the best 2 — ${convergence.completeness}% checkout-ready` : convergence.nextStep;
    const msg = contractForDecision(decision, { topName: ranked[0]?.name, count: ranked.length, delivery: deliveryLine.replace(/\s+/g, " ").trim().replace(/^🚚\s*/, ""), standout: delight.standout, convergenceNext: checkoutNudge });
    addMessage({ role: "assistant", content: msg, language, chips: ["Choose perfect gift instantly", "Add best pick", "Compare top 3", "Checkout"], decisionTrace: trace });
    speak(msg, voiceOut);
    toast.success(`Curated ${ranked.length} Kapruka picks`);
  }

  async function handleSend(text = input) {
    const clean = text.trim();
    if (/exit demo lock/i.test(clean)) {
      setDemoLocked(false);
      const msg = "Got it — demo lock is off.\nI’ll keep the current cart and shelf as they are.\nNext: type any shopping request.";
      addMessage({ role: "assistant", content: msg, language, chips: ["Gift finder", "Trending"] });
      return;
    }
    if (demoLocked && clean && !/demo mode/i.test(clean)) {
      const msg = "Got it — judge demo is locked.\nI’ll keep the golden path stable instead of switching topics.\nNext: finish checkout, or tap Exit Demo Lock.";
      addMessage({ role: "assistant", content: msg, language, chips: ["Checkout", "Exit Demo Lock"] });
      return;
    }
    if (!clean) {
      const msg = "Got it — we’re at the start.\nI’ll keep this simple and occasion-first.\nNext: tell me who it is for.";
      addMessage({ role: "assistant", content: msg, language, chips: ["Amma", "Wife", "Friend", "Birthday"] });
      speak(msg, voiceOut);
      return;
    }
    if (!demoStartedAt) startTimer();
    setInput("");
    setPrediction(undefined);
    const detected = detectLanguage(clean);
    setLanguage(detected);
    addMessage({ role: "user", content: clean, language: detected });
    if (/demo mode/i.test(clean)) { await runDemo(); return; }
    const updated = extractContext(clean, { ...context, language: detected });
    setContext(updated);
    setShelfPriming(false);
    setTyping(true);
    try { await runSearchFlow(clean, updated); }
    catch (error) {
      const msg = "Got it — live results are taking a moment.\nI’ll keep your cart and story safe with a safer gift lane.\nNext: try trending gifts or continue to tracking.";
      addMessage({ role: "assistant", content: msg, language: detected, chips: ["Try again", "Trending", "Track order"] });
      toast.error("MCP connection hiccup");
    } finally { setTyping(false); }
  }

  async function runDemo() {
    startTimer();
    setDemoLocked(true);
    const msg = "Got it — Demo Mode is on.\nI’ll run the judge path: occasion, memory, shelf, cart, checkout.\nNext: watch the shelf and cart update without leaving the conversation.";
    addMessage({ role: "assistant", content: msg, language, chips: [] }); speak(msg, voiceOut);
    const demoText = "I forgot my wife's birthday. Apology gift, she likes chocolate and roses, Kandy tomorrow, budget Rs. 5000, gift";
    await new Promise((r) => setTimeout(r, 650));
    addMessage({ role: "user", content: demoText, language: "en" });
    const updated = extractContext(demoText, { ...context, recipient: "wife", occasion: "apology birthday", location: "Kandy", budget: 5000, deliveryDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), isGift: true, language });
    setContext(updated); setTyping(true);
    try {
      await runSearchFlow(demoText, updated);
      setTimeout(() => {
        const products = useAppStore.getState().products;
        if (products[0] && !cart.length) { addToCart(products[0]); toast.success("Demo added Liya’s best pick to cart"); }
      }, 400);
    } finally { setTyping(false); }
  }

  function startVoice() {
    const Ctor = SpeechRecognitionCtor();
    if (!Ctor) return toast.error("Voice input is not supported in this browser");
    const recognition = new Ctor();
    recognition.lang = language === "si" ? "si-LK" : language === "ta" ? "ta-LK" : "en-LK";
    recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = (event) => { const transcript = event.results[0]?.[0]?.transcript ?? ""; setInput(transcript); void handleSend(transcript); };
    recognition.onend = () => setListening(false);
    setListening(true); recognition.start();
  }

  return <aside className="glass flex h-[calc(100vh-2rem)] min-h-[720px] flex-col rounded-[2rem] p-4" aria-label="AI shopping conversation">
    <div className="flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/10"><div><h1 className="flex items-center gap-2 text-xl font-black"><Sparkles className="text-liya-500"/> Liya</h1><p className="text-xs text-black/50 dark:text-white/55">Friend-first shopping, powered by live Kapruka MCP</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" aria-label="Voice output" onClick={() => setVoiceOut((v) => !v)}><Volume2 size={17} className={voiceOut ? "text-liya-500" : ""}/></Button><Button variant="ghost" size="sm" aria-label="Language"><Languages size={17}/>{language.toUpperCase()}</Button><Button variant="ghost" size="sm" aria-label="Reset chat" onClick={reset}><RotateCcw size={17}/></Button></div></div>
    <div className="mt-3 flex flex-wrap items-center gap-2">{demoLocked && <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-ink">Golden path locked</span>}</div>
    <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3"><div className="grid grid-cols-6 gap-1" aria-label="Clarifying progress">{Array.from({ length: 6 }).map((_, i) => <span key={i} className={`h-1.5 rounded-full ${i < progress ? "bg-liya-500" : "bg-black/10 dark:bg-white/10"}`} />)}</div><span className="rounded-full bg-green-600/10 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-300">{demoStartedAt ? `${elapsed}s / 120s` : "2-min target"}</span></div>
    {progress >= 3 && <div className="mt-3 rounded-2xl bg-[hsl(var(--muted))] px-3 py-2 text-xs text-[hsl(var(--foreground))]">Locked: {convergenceNow.summary} · {convergenceNow.completeness}% ready</div>}
    {(memory.preferences.length > 0 || (memory.styleSignals?.length ?? 0) > 0) && <div className="mt-3 rounded-2xl bg-[hsl(var(--muted))] px-3 py-2 text-xs text-[hsl(var(--foreground))]">Memory: {memory.preferences.length ? `likes ${memory.preferences.join(", ")}` : "preferences forming"} {(memory.styleSignals?.length ?? 0) > 0 ? `· style ${memory.styleSignals.join(", ")}` : ""} · mood {memory.emotionalIntent}</div>}
    {prediction && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-liya-50 px-3 py-2 text-xs font-semibold text-liya-900 dark:bg-liya-500/10 dark:text-liya-100">{prediction}</motion.div>}
    <div className="no-scrollbar min-h-[380px] flex-1 space-y-3 overflow-auto py-4">{messages.map((m) => <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={m.role === "user" ? "ml-auto max-w-[86%] rounded-[1.5rem] bg-ink px-4 py-3 text-sm text-white dark:bg-white dark:text-ink" : "max-w-[92%] rounded-[1.5rem] bg-[hsl(var(--card))] px-4 py-3 text-sm shadow-sm border border-black/5 dark:border-white/10"}>
      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>{m.decisionTrace && <div className="mt-3 rounded-2xl border border-liya-200 bg-liya-50/80 p-3 text-xs text-liya-950 dark:border-liya-500/20 dark:bg-liya-500/10 dark:text-liya-100"><div className="flex items-center gap-2 font-black"><Sparkles size={13}/>{m.decisionTrace.rows.find((r) => r.label === "Plan")?.value ?? "gift plan"}</div><div className="mt-2 flex flex-wrap gap-1.5">{m.decisionTrace.bullets.slice(0, 3).map((b) => <span key={b} className="rounded-full bg-white/80 px-2 py-1 font-semibold dark:bg-black/20">{b}</span>)}</div>{m.decisionTrace.warnings?.[0] ? <p className="mt-2 text-amber-800 dark:text-amber-200">⚠️ {m.decisionTrace.warnings[0]}</p> : null}</div>}{m.chips?.length ? <div className="mt-3 flex flex-wrap gap-2">{m.chips.map((chip) => <button key={chip} onClick={() => chip === "Go to tracking" ? location.href = "/track" : chip === "Go to review" ? location.href = "/review" : chip === "Checkout" || chip === "Generate gift message" ? location.href = "/checkout" : chip === "Choose perfect gift instantly" ? choosePerfectGift() : chip === "Add best pick" ? (() => { const p = useAppStore.getState().products[0]; if (p) { addToCart(p); toast.success("Best pick added — good choice."); } })() : handleSend(chipToText(chip))} className="focus-ring rounded-full bg-black/5 px-3 py-1 text-xs font-semibold hover:bg-liya-100 dark:bg-white/10 dark:hover:bg-white/15">{chip}</button>)}</div> : null}
    </motion.div>)}{isTyping && <TypingIndicator />}</div>
    <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1"><Button className="shrink-0" variant="secondary" size="sm" onClick={runDemo}><PlayCircle size={16}/> Demo Mode</Button><Button className="shrink-0" variant="secondary" size="sm" onClick={() => handleSend("Smart shopping planner for an occasion, budget, date and location") }><Wand2 size={16}/> Planner</Button><Button className="shrink-0" variant="secondary" size="sm" onClick={() => handleSend("Gift finder: ask me 5 guided questions") }><Gift size={16}/> Gift finder</Button><Button className="shrink-0" variant="secondary" size="sm" onClick={startVoice}>{listening ? <MicOff size={16}/> : <Mic size={16}/>} Voice</Button></div>
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); void handleSend(); }} className="flex items-end gap-2 rounded-[1.6rem] bg-[hsl(var(--card))] p-2 shadow-xl shadow-black/[0.04] border border-black/5 dark:border-white/10"><label className="sr-only" htmlFor="liya-input">Message Liya</label><textarea id="liya-input" value={input} onChange={(e) => handleInputChange(e.target.value)} rows={1} placeholder="Eg: My wife is angry, apology gift, Kandy tomorrow, Rs. 5,000…" className="max-h-32 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-black/35 dark:placeholder:text-white/35" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }} /><Button type="submit" size="sm" aria-label="Send"><ArrowUp size={17}/></Button></form>
  </aside>;
}
