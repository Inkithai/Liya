"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Brain, CheckCircle2, Clock3, Gift, Languages, Mic, PackageCheck, RefreshCcw, Search, ShieldCheck, ShoppingCart, Sparkles, Truck, Zap, Globe, Info, Server, Bolt, Lock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const flow = [
  {
    title: "Intent",
    subtitle: "The shopper says the story",
    icon: Gift,
    line: "“I forgot my wife’s birthday. Kandy tomorrow. Rs. 5,000.”",
    screenshot: "01 — Conversation start"
  },
  {
    title: "Understanding",
    subtitle: "Liya turns chaos into a gift plan",
    icon: Brain,
    line: "Detects apology, urgency, budget, recipient, city and gift tone.",
    screenshot: "02 — Plan + memory"
  },
  {
    title: "Live MCP search",
    subtitle: "Real Kapruka products, not mock data",
    icon: Search,
    line: "Calls the hosted Kapruka MCP endpoint and searches in parallel.",
    screenshot: "03 — Live product shelf"
  },
  {
    title: "Smart ranking",
    subtitle: "Best pick, not random browsing",
    icon: Sparkles,
    line: "Ranks by occasion, delivery risk, budget, memory and emotional fit.",
    screenshot: "04 — Why this gift"
  },
  {
    title: "Cart",
    subtitle: "Multi-item gift bundle",
    icon: ShoppingCart,
    line: "Add cake, flowers, chocolates and a card without leaving the flow.",
    screenshot: "05 — Floating cart"
  },
  {
    title: "Checkout",
    subtitle: "2 minute promise",
    icon: Clock3,
    line: "Delivery check → guest order → real payment link → tracking.",
    screenshot: "06 — Payment link"
  }
];

const features = [
  { icon: Brain, title: "Emotion AI", text: "Apology, urgency, romance and celebration change the shopping strategy." },
  { icon: Languages, title: "Sinhala / Tamil / Tanglish", text: "Local-language signals shape Liya’s tone and shopping flow." },
  { icon: Zap, title: "Live MCP search", text: "Uses the hosted Kapruka MCP endpoint for real product discovery and checkout." },
  { icon: Sparkles, title: "Memory ranking", text: "Preferences like chocolate, roses or minimal style influence ranking." },
  { icon: Mic, title: "Voice", text: "Browser voice input and output for a more natural assistant feel." },
  { icon: RefreshCcw, title: "Reorder", text: "Recently viewed products become quick buy‑again choices." },
  { icon: Truck, title: "Delivery-aware filtering", text: "City, date and delivery risk shape product trust and checkout readiness." },
  { icon: ShieldCheck, title: "Security & Privacy", text: "End‑to‑end encryption and no data storage beyond session ensures safety." },
  { icon: AlertTriangle, title: "Accessibility", text: "ARIA‑compliant UI with high contrast mode for inclusive experience." },
  { icon: Clock3, title: "Fast Checkout", text: "Optimized 2‑minute payment flow with pre‑filled details and instant link." },
  { icon: Lock, title: "No Login Required", text: "Guest checkout flow without needing a user account." },
  { icon: Server, title: "Hosted MCP Only", text: "All product data comes from the hosted Kapruka MCP – no custom backend." },
  { icon: Bolt, title: "Performance", text: "Fast response times with lightweight client and parallel API calls." },
  { icon: Globe, title: "Scalability", text: "Handles many concurrent shoppers with low overhead." },
  { icon: Info, title: "Analytics", text: "Tracks conversion and engagement metrics for continuous improvement." }
];

const differences = [
  "Liya starts with the occasion, not a search bar.",
  "Liya recommends one safest pick instead of dumping a catalog.",
  "Liya keeps the shelf, cart and conversation alive together.",
  "Liya completes checkout with a Kapruka payment link — no login needed."
];

const notDoing = [
  "Not a chatbot widget added beside the website.",
  "Not a fake catalog or mock checkout flow.",
  "Not a new MCP server or Kapruka backend fork.",
  "Not a generic LLM wrapper — the frontend orchestrates a shopping journey."
];

const stressTests = [
  { label: "Emoji chaos", href: "/shop?stress=emoji", text: "😀😀😀" },
  { label: "Cheap + premium conflict", href: "/shop?stress=conflict", text: "cheap but premium today" },
  { label: "API question mid-flow", href: "/shop?stress=api", text: "what’s the API?" },
  { label: "Rapid topic switch", href: "/shop?stress=switch", text: "birthday → anniversary" }
];

const replayScenarios = [
  { label: "Apology gift", href: "/demo", before: "I forgot my wife’s birthday", after: "Best repair gift + checkout path" },
  { label: "Urgent birthday", href: "/shop?stress=switch", before: "Birthday, tomorrow, not sure", after: "Delivery-safe shortlist" },
  { label: "Cheap but premium", href: "/shop?stress=conflict", before: "cheap but premium", after: "Tradeoff resolved calmly" }
];

export default function HowItWorksPage() {
  const [active, setActive] = useState(0);
  const ActiveIcon = flow[active].icon;

  return <main className="min-h-screen soft-grid"><Header />
    <section className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold shadow-lg shadow-black/[0.04] dark:bg-white/10"><Sparkles size={16} className="text-liya-500"/> Judge guide</p>
          <h1 className="text-5xl font-black tracking-[-0.05em] sm:text-6xl">How Liya works</h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-black/65 dark:text-white/65">Liya is an AI shopping assistant for Sri Lanka that turns a human gift story into a live Kapruka cart, checkout link and tracking flow.</p><p className="mt-3 max-w-2xl text-sm font-semibold text-black/55 dark:text-white/60">Unlike e-commerce sites that show products, Liya decides what to buy and completes checkout in one guided conversation.</p><p className="mt-3 max-w-2xl rounded-2xl bg-green-600/10 px-4 py-3 text-sm font-bold text-green-700 dark:text-green-300">Everything shown here is live from the same system powering the demo — not a separate slide deck.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/demo"><Button size="lg">Start Judge Demo <ArrowRight size={18}/></Button></Link><Link href="/shop"><Button variant="secondary" size="lg">Explore manually</Button></Link></div>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-black/55 dark:text-white/60"><span className="rounded-full bg-white/75 px-3 py-1 dark:bg-white/10">2-minute checkout promise</span><span className="rounded-full bg-white/75 px-3 py-1 dark:bg-white/10">Hosted MCP only</span><span className="rounded-full bg-white/75 px-3 py-1 dark:bg-white/10">Zero login</span></div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-liya-100 via-pink-50 to-white p-5 dark:from-liya-500/15 dark:via-pink-500/10 dark:to-white/5">
            <div className="rounded-[2rem] bg-white/85 p-5 shadow-2xl dark:bg-black/30">
              <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-liya-400 to-pink-500 text-xl">ලි</span><div><b>Liya</b><p className="text-sm text-black/55 dark:text-white/60">“Tell me the situation. I’ll handle the shopping.”</p></div></div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-3xl bg-black/5 p-4 text-sm dark:bg-white/10">Intent → understanding → live search → ranked shelf → cart → checkout</div>
                <div className="rounded-3xl bg-liya-50 p-4 text-sm font-semibold text-liya-900 dark:bg-liya-500/10 dark:text-liya-100">If you trust me on one pick, I’ll choose the safest gift and get you to payment fast.</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Interactive flow</p><h2 className="text-3xl font-black tracking-tight">From messy request to real checkout</h2></div><p className="hidden text-sm text-black/50 dark:text-white/55 md:block">Click each step</p></div>
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">{flow.map((step, index) => {
          const Icon = step.icon;
          return <button key={step.title} onClick={() => setActive(index)} className={`focus-ring w-full rounded-[1.6rem] border p-4 text-left transition ${active === index ? "border-liya-300 bg-white shadow-xl shadow-black/[0.05] dark:border-liya-500/30 dark:bg-white/10" : "border-black/5 bg-white/55 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"}`}>
            <div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${active === index ? "bg-liya-500 text-white" : "bg-black/5 dark:bg-white/10"}`}><Icon size={18}/></span><div><b>{index + 1}. {step.title}</b><p className="text-sm text-black/55 dark:text-white/60">{step.subtitle}</p></div></div>
          </button>;
        })}</div>
        <Card className="min-h-[430px] overflow-hidden">
          <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }} className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            <div><div className="grid h-16 w-16 place-items-center rounded-3xl bg-liya-500 text-white shadow-xl shadow-liya-500/20"><ActiveIcon size={28}/></div><p className="mt-5 text-sm font-bold text-liya-700 dark:text-liya-300">Step {active + 1} of 6</p><h3 className="mt-1 text-3xl font-black">{flow[active].title}</h3><p className="mt-3 text-lg leading-8 text-black/65 dark:text-white/65">{flow[active].line}</p><div className="mt-6 flex items-center gap-2 rounded-2xl bg-green-600/10 p-3 text-sm font-semibold text-green-700 dark:text-green-300"><CheckCircle2 size={17}/> Judge-visible result in the product UI</div></div>
            <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/60 p-5 dark:border-white/15 dark:bg-white/[0.04]"><div className="grid aspect-[4/3] place-items-center rounded-[1.6rem] bg-gradient-to-br from-liya-100 to-pink-100 text-center dark:from-liya-500/15 dark:to-pink-500/10"><div><PackageCheck className="mx-auto mb-3 h-10 w-10 text-liya-500"/><b>{flow[active].screenshot}</b><p className="mt-2 max-w-xs text-sm text-black/55 dark:text-white/60">Screenshot placeholder — add your final demo image here.</p></div></div></div>
          </motion.div>
        </Card>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-12">
      <Card><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Proof of intelligence</p><h2 className="mt-1 text-3xl font-black tracking-tight">Before vs after Liya</h2><p className="mt-3 max-w-2xl text-black/60 dark:text-white/65">One messy sentence becomes a decision, shortlist, cart and checkout path.</p></div><Link href="/demo"><Button>Replay magic gift decision <ArrowRight size={17}/></Button></Link></div><div className="mt-5 grid gap-3 md:grid-cols-3">{replayScenarios.map((scenario) => <Link key={scenario.label} href={scenario.href} className="focus-ring rounded-3xl bg-black/5 p-4 transition hover:bg-liya-50 dark:bg-white/10 dark:hover:bg-white/15"><b>{scenario.label}</b><div className="mt-3 text-sm text-black/55 dark:text-white/60"><p>Before: {scenario.before}</p><p className="mt-1 font-bold text-liya-700 dark:text-liya-300">After: {scenario.after}</p></div></Link>)}</div></Card>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="mb-5"><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Feature map</p><h2 className="text-3xl font-black tracking-tight">What judges should notice</h2></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }) => <Card key={title} className="min-h-44"><Icon className="mb-4 h-7 w-7 text-liya-500"/><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/60">{text}</p></Card>)}</div>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-12">
      <Card className="bg-white/90 dark:bg-black/70 shadow-xl">
        <h2 className="text-3xl font-black tracking-tight mb-4">Voice Features</h2>
        <p className="text-sm text-black/65 dark:text-white/65 mb-4">
          Liya supports browser-based voice input and output for a more natural shopping experience. Built on Web Speech API with no external dependencies.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/10">
            <div className="flex items-center gap-2 mb-2"><Mic className="h-5 w-5 text-liya-500"/><h3 className="font-black">Voice Input</h3></div>
            <ul className="text-sm text-black/55 dark:text-white/55 space-y-1">
              <li>• Uses SpeechRecognition API (Chrome/Safari)</li>
              <li>• Auto-detects language: si-LK, ta-LK, en-LK</li>
              <li>• Single-shot capture, fills input field</li>
              <li>• Graceful fallback if not supported</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/10">
            <div className="flex items-center gap-2 mb-2"><Languages className="h-5 w-5 text-liya-500"/><h3 className="font-black">Language Detection</h3></div>
            <ul className="text-sm text-black/55 dark:text-white/55 space-y-1">
              <li>• Sinhala: Unicode range 0D80-0DFF</li>
              <li>• Tamil: Unicode range 0B80-0BFF</li>
              <li>• Tanglish: Word patterns (akka, aiya, machan...)</li>
              <li>• Auto-updates tone and shopping flow</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/10">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-liya-500"/><h3 className="font-black">Voice Output</h3></div>
            <ul className="text-sm text-black/55 dark:text-white/55 space-y-1">
              <li>• Uses speechSynthesis API</li>
              <li>• Reads assistant responses aloud</li>
              <li>• Rate: 1.02, Pitch: 1.05 for natural sound</li>
              <li>• Toggle on/off with speaker icon</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/10">
            <div className="flex items-center gap-2 mb-2"><ShieldCheck className="h-5 w-5 text-liya-500"/><h3 className="font-black">Browser Support</h3></div>
            <ul className="text-sm text-black/55 dark:text-white/55 space-y-1">
              <li>• Voice Output: Chrome, Safari, Edge ✅</li>
              <li>• Voice Input: Chrome, Safari (limited) ⚠️</li>
              <li>• Language Detection: All browsers ✅</li>
              <li>• No external APIs, runs locally</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-12">
      <Card className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-sm font-bold text-liya-700 dark:text-liya-300">What makes it different</p><h2 className="mt-1 text-4xl font-black tracking-tight">Liya is a decision assistant, not a browsing system.</h2><p className="mt-4 leading-7 text-black/60 dark:text-white/65">A normal shop asks users to filter. Liya asks for the human situation, chooses a safe path, and moves gently toward checkout.</p></div><div className="grid gap-3">{differences.map((item) => <div key={item} className="flex items-start gap-3 rounded-3xl bg-black/5 p-4 text-sm font-semibold dark:bg-white/10"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600"/>{item}</div>)}</div></Card>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card><p className="text-sm font-bold text-liya-700 dark:text-liya-300">What Liya is not</p><h2 className="mt-1 text-3xl font-black tracking-tight">Misclassification guardrail</h2><div className="mt-5 grid gap-3">{notDoing.map((item) => <div key={item} className="flex gap-3 rounded-3xl bg-black/5 p-4 text-sm font-semibold dark:bg-white/10"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-500"/>{item}</div>)}</div></Card>
        <Card><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Architecture truth</p><h2 className="mt-1 text-3xl font-black tracking-tight">Why this architecture wins</h2><div className="mt-5 rounded-3xl bg-black/5 p-4 text-center text-sm font-black dark:bg-white/10">Browser UI → Next.js frontend → isolated MCP client → hosted Kapruka MCP → Kapruka backend</div><ul className="mt-5 space-y-3 text-sm text-black/65 dark:text-white/65"><li>• MCP is the commerce backbone.</li><li>• The frontend orchestrates intent, memory, ranking and checkout UX.</li><li>• No backend fork, no MCP server, no extra database.</li><li>• Deterministic fallback keeps demos safe if live search is slow.</li><li>• Real checkout links still come from Kapruka MCP.</li></ul></Card>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-12">
      <Card><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Proof of resilience</p><h2 className="mt-1 text-3xl font-black tracking-tight">Break Liya — Judge Mode</h2><p className="mt-3 max-w-2xl text-black/60 dark:text-white/65">These buttons run predefined chaos prompts. Liya should stay calm, anchor the flow, and continue shopping.</p></div><ShieldCheck className="hidden h-14 w-14 text-green-600 lg:block"/></div><div className="mt-5 grid gap-3 md:grid-cols-4">{stressTests.map((test) => <Link key={test.label} href={test.href} className="focus-ring rounded-3xl bg-black/5 p-4 transition hover:bg-liya-50 dark:bg-white/10 dark:hover:bg-white/15"><b>{test.label}</b><p className="mt-2 text-xs text-black/55 dark:text-white/60">{test.text}</p></Link>)}</div></Card>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-16">
      <div className="rounded-[2rem] bg-ink p-6 text-white shadow-2xl shadow-black/15 dark:bg-white dark:text-ink"><div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"><div><h3 className="text-2xl font-black">Ready for the 2-minute judge path?</h3><p className="mt-1 text-white/65 dark:text-black/60">Runs the apology/birthday/Kandy/payment-link story with live MCP search and fallback safety.</p></div><Link href="/demo"><Button size="lg" className="bg-white text-ink hover:bg-white/90 dark:bg-ink dark:text-white">Start Judge Demo <ArrowRight size={18}/></Button></Link></div></div>
    </section>
  </main>;
}
