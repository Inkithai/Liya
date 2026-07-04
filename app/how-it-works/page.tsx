"use client";

import Link from"next/link";
import Image from"next/image";
import { useState } from"react";
import { motion } from"framer-motion";
import { AlertTriangle, ArrowRight, Brain, CheckCircle2, Clock3, Gift, Languages, Mic, PackageCheck, RefreshCcw, Search, ShieldCheck, ShoppingCart, Sparkles, Truck, Zap, Globe, Info, Server, Bolt, Lock } from"lucide-react";
import { Header } from"@/components/layout/Header";
import { Button } from"@/components/ui/Button";
import { Card } from"@/components/ui/Card";

const flow = [
 {
 title:"Intent",
 subtitle:"The shopper says the story",
 icon: Gift,
 line:"“I forgot my wife’s birthday. Kandy tomorrow. Rs. 5,000.”",
 screenshot:"01 — Conversation start"
 },
 {
 title:"Understanding",
 subtitle:"Liya turns chaos into a gift plan",
 icon: Brain,
 line:"Detects apology, urgency, budget, recipient, city and gift tone.",
 screenshot:"02 — Plan + memory"
 },
 {
 title:"Live MCP search",
 subtitle:"Real Kapruka products, not mock data",
 icon: Search,
 line:"Calls the hosted Kapruka MCP endpoint and searches in parallel.",
 screenshot:"03 — Live product shelf"
 },
 {
 title:"Smart ranking",
 subtitle:"Best pick, not random browsing",
 icon: Sparkles,
 line:"Ranks by occasion, delivery risk, budget, memory and emotional fit.",
 screenshot:"04 — Why this gift"
 },
 {
 title:"Cart",
 subtitle:"Multi-item gift bundle",
 icon: ShoppingCart,
 line:"Add cake, flowers, chocolates and a card without leaving the flow.",
 screenshot:"05 — Floating cart"
 },
 {
 title:"Checkout",
 subtitle:"2 minute promise",
 icon: Clock3,
 line:"Delivery check → guest order → real payment link → tracking.",
 screenshot:"06 — Payment link"
 }
];

const features = [
 { icon: Brain, title:"Emotion AI", text:"Apology, urgency, romance and celebration change the shopping strategy." },
 { icon: Languages, title:"Sinhala / Tamil / Tanglish", text:"Local-language signals shape Liya’s tone and shopping flow." },
 { icon: Zap, title:"Live MCP search", text:"Uses the hosted Kapruka MCP endpoint for real product discovery and checkout." },
 { icon: Sparkles, title:"Memory ranking", text:"Preferences like chocolate, roses or minimal style influence ranking." },
 { icon: Mic, title:"Voice", text:"Browser voice input and output for a more natural assistant feel." },
 { icon: RefreshCcw, title:"Reorder", text:"Recently viewed products become quick buy‑again choices." },
 { icon: Truck, title:"Delivery-aware filtering", text:"City, date and delivery risk shape product trust and checkout readiness." },
 { icon: ShieldCheck, title:"Security & Privacy", text:"Hosted MCP boundary, no secret keys in the browser, and only session-local shopping memory." },
 { icon: AlertTriangle, title:"Accessibility", text:"ARIA‑compliant UI with high contrast mode for inclusive experience." },
 { icon: Clock3, title:"Fast Checkout", text:"Optimized 2‑minute payment flow with pre‑filled details and instant link." },
 { icon: Lock, title:"No Login Required", text:"Guest checkout flow without needing a user account." },
 { icon: Server, title:"Hosted MCP Only", text:"All product data comes from the hosted Kapruka MCP – no custom backend." },
 { icon: Bolt, title:"Performance", text:"Fast response times with lightweight client and parallel API calls." },
 { icon: Globe, title:"Scalability", text:"Handles many concurrent shoppers with low overhead." },
 { icon: Info, title:"Conversion signals", text:"Readiness bars, trust labels and next-step nudges make the 7-minute-to-2-minute improvement visible." }
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
 { label:"Emoji chaos", href:"/shop?stress=emoji", text:"😀😀😀" },
 { label:"Cheap + premium conflict", href:"/shop?stress=conflict", text:"cheap but premium today" },
 { label:"API question mid-flow", href:"/shop?stress=api", text:"what’s the API?" },
 { label:"Rapid topic switch", href:"/shop?stress=switch", text:"birthday → anniversary" }
];

const replayScenarios = [
 { label:"Apology gift", href:"/demo", before:"I forgot my wife’s birthday", after:"Best repair gift + checkout path" },
 { label:"Urgent birthday", href:"/shop?stress=switch", before:"Birthday, tomorrow, not sure", after:"Delivery-safe shortlist" },
 { label:"Cheap but premium", href:"/shop?stress=conflict", before:"cheap but premium", after:"Tradeoff resolved calmly" }
];

const labScenarios = [
 {
 label:"Forgot birthday",
 prompt:"I forgot my wife’s birthday. Kandy tomorrow. Rs. 5,000.",
 detected:["apology", "wife", "Kandy", "tomorrow", "Rs. 5,000"],
 strategy:"Relationship repair → roses + chocolate + safer delivery",
 search:"apology roses chocolate sorry card gift",
 trust:"Safe-to-buy if city/date verified",
 next:"Choose one standout or compare top 3",
 href:"/demo"
 },
 {
 label:"Not sure what to buy",
 prompt:"Need a gift for my sister in Dambulla under 8k, maybe tomorrow.",
 detected:["sister", "Dambulla", "budget", "tomorrow", "uncertain preference"],
 strategy:"Value optimizer → ask one high-value question, keep shelf flexible",
 search:"gift flowers cake chocolate sister under 8000",
 trust:"Verify delivery before payment",
 next:"Confirm occasion, then shortlist",
 href:"/shop"
 },
 {
 label:"Fast delivery rescue",
 prompt:"Need something today for a colleague, Colombo, around Rs. 4,000.",
 detected:["urgent", "colleague", "Colombo", "today", "Rs. 4,000"],
 strategy:"Urgent delivery → in-stock, less custom, low risk",
 search:"same day delivery cake flowers gift",
 trust:"Prioritize stock + delivery confidence",
 next:"Add safest pick, then checkout",
 href:"/shop?stress=conflict"
 }
];

function StepPreview({ active }: { active: number }) {
 const frames = [
 {
 tag:"Conversation start",
 title:"Messy human request",
 body:"I messed up. Wife is angry. Kandy tomorrow. Rs. 5,000.",
 chips:["apology", "wife", "Kandy", "tomorrow"],
 footer:"Liya asks less, understands more",
 image:"/how-it-works/step-1-conversation.svg"
 },
 {
 tag:"Plan + memory",
 title:"Intent translated into constraints",
 body:"Relationship repair strategy: sincere, not flashy. Remember: roses + chocolate.",
 chips:["mood: apology", "budget lock", "delivery risk"],
 footer:"Visible decision trace",
 image:"/how-it-works/step-2-plan.svg"
 },
 {
 tag:"Live MCP shelf",
 title:"Real products from Kapruka MCP",
 body:"6 Red Rose Bouquet, chocolate hamper, cake combo — ranked by fit and delivery.",
 chips:["live price", "image URL", "stock"],
 footer:"No fake catalog",
 image:"/how-it-works/step-3-shelf.svg"
 },
 {
 tag:"Why this pick",
 title:"Not just search results",
 body:"Best pick wins because it balances apology tone, price comfort, and delivery confidence.",
 chips:["best overall", "tradeoff", "trust label"],
 footer:"Honest comparison",
 image:"/how-it-works/step-4-comparison.svg"
 },
 {
 tag:"Cart + bundle",
 title:"Persistent cart beside chat",
 body:"Add hero item, adjust quantity, keep conversation and shelf alive.",
 chips:["cart total", "review", "reorder"],
 footer:"No page-hopping",
 image:"/how-it-works/step-5-cart.svg"
 },
 {
 tag:"Checkout link",
 title:"From 7 minutes to about 2",
 body:"Delivery check, guest details, gift/order message, payment link, tracking.",
 chips:["delivery", "payment", "tracking"],
 footer:"Friction removed",
 image:"/how-it-works/step-6-checkout.svg"
 }
 ];
 const frame = frames[active] ?? frames[0];
 return <div className="rounded-[2rem] border border-foreground/10 bg-card/60 p-4 dark:bg-white/[0.04]">
 <div className="overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-liya-100 via-pink-100 to-white p-2 shadow-xl dark:from-liya-500/15 dark:via-pink-500/10 dark:to-white/5">
 <Image src={frame.image} alt={`${frame.tag}: ${frame.title}`} width={1200} height={900} className="aspect-[4/3] w-full rounded-[1.2rem] object-cover" />
 </div>
 <div className="mt-4 flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-xs font-black text-liya-700 dark:text-liya-300"><PackageCheck size={15}/>{frame.tag}</span><span className="rounded-full bg-green-600/10 px-2 py-1 text-[10px] font-black text-green-700 dark:text-green-300">CUSTOM IMAGE</span></div>
 <h4 className="mt-2 text-xl font-black tracking-tight">{frame.title}</h4>
 <p className="mt-1 text-sm leading-6 text-foreground/65">{frame.body}</p>
 <div className="mt-3 flex flex-wrap gap-2">{frame.chips.map((chip) => <span key={chip} className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-bold dark:bg-white/10">{chip}</span>)}</div>
 <div className="mt-4 space-y-2"><div className="h-2 rounded-full bg-black/10 dark:bg-white/10"><div className="h-2 rounded-full bg-liya-500" style={{ width: `${58 + active * 7}%` }} /></div><div className="flex justify-between text-[11px] font-bold text-foreground/55"><span>{frame.footer}</span><span>{active + 1}/6</span></div></div>
 </div>;
}

export default function HowItWorksPage() {
 const [active, setActive] = useState(0);
 const [lab, setLab] = useState(0);
 const ActiveIcon = flow[active].icon;
 const selectedLab = labScenarios[lab];
 const readiness = 72 + lab * 7;

 return <main className="min-h-screen soft-grid"><Header />
 <section className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
 <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
 <div>
 <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm font-bold shadow-lg shadow-black/[0.04] dark:bg-foreground/10"><Sparkles size={16} className="text-liya-500"/> Judge guide</p>
 <h1 className="text-5xl font-black tracking-[-0.05em] sm:text-6xl">How Liya works</h1>
 <p className="mt-5 max-w-2xl text-xl leading-8 text-foreground/65">Liya is an AI shopping assistant for Sri Lanka that turns a human gift story into a live Kapruka cart, checkout link and tracking flow.</p><p className="mt-3 max-w-2xl text-sm font-semibold text-foreground/55">Unlike e-commerce sites that show products, Liya decides what to buy and completes checkout in one guided conversation.</p><p className="mt-3 max-w-2xl rounded-2xl bg-green-600/10 px-4 py-3 text-sm font-bold text-green-700 dark:text-green-300">Everything shown here is live from the same system powering the demo — not a separate slide deck.</p>
 <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/demo"><Button size="lg">Start Judge Demo <ArrowRight size={18}/></Button></Link><Link href="/shop"><Button variant="secondary" size="lg">Explore manually</Button></Link></div>
 <div className="mt-6 flex flex-wrap gap-2 text-sm text-foreground/55"><span className="rounded-full bg-card/75 px-3 py-1 dark:bg-foreground/10">2-minute checkout promise</span><span className="rounded-full bg-card/75 px-3 py-1 dark:bg-foreground/10">Hosted MCP only</span><span className="rounded-full bg-card/75 px-3 py-1 dark:bg-foreground/10">Zero login</span></div>
 </div>

 <Card className="overflow-hidden p-0">
 <div className="bg-gradient-to-br from-liya-100 via-pink-50 to-white p-5 dark:from-liya-500/15 dark:via-pink-500/10 dark:to-white/5">
 <div className="rounded-[2rem] bg-card/85 p-5 shadow-2xl dark:bg-black/30">
 <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-liya-400 to-pink-500 text-xl">ලි</span><div><b>Liya</b><p className="text-sm text-foreground/55">“Tell me the situation. I’ll handle the shopping.”</p></div></div>
 <div className="mt-5 grid gap-3">
 <div className="rounded-3xl bg-black/5 p-4 text-sm dark:bg-foreground/10">Intent → understanding → live search → ranked shelf → cart → checkout</div>
 <div className="rounded-3xl bg-liya-50 p-4 text-sm font-semibold text-liya-900 dark:bg-liya-500/10 dark:text-liya-100">If you trust me on one pick, I’ll choose the safest gift and get you to payment fast.</div>
 </div>
 </div>
 </div>
 </Card>
 </div>
 </section>

 <section className="mx-auto max-w-7xl px-4 pb-12">
 <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Interactive flow</p><h2 className="text-3xl font-black tracking-tight">From messy request to real checkout</h2></div><p className="hidden text-sm text-foreground/50 md:block">Click each step</p></div>
 <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
 <div className="space-y-3">{flow.map((step, index) => {
 const Icon = step.icon;
 return <button key={step.title} onClick={() => setActive(index)} className={`focus-ring w-full rounded-[1.6rem] border p-4 text-left transition ${active === index ?"border-liya-300 bg-white shadow-xl shadow-black/[0.05] dark:border-liya-500/30 dark:bg-foreground/10" :"border-foreground/5 bg-card/55 hover:bg-white dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"}`}>
 <div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${active === index ?"bg-liya-500 text-white" :"bg-foreground/5"}`}><Icon size={18}/></span><div><b>{index + 1}. {step.title}</b><p className="text-sm text-foreground/55">{step.subtitle}</p></div></div>
 </button>;
 })}</div>
 <Card className="min-h-[430px] overflow-hidden">
 <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }} className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
 <div><div className="grid h-16 w-16 place-items-center rounded-3xl bg-liya-500 text-white shadow-xl shadow-liya-500/20"><ActiveIcon size={28}/></div><p className="mt-5 text-sm font-bold text-liya-700 dark:text-liya-300">Step {active + 1} of 6</p><h3 className="mt-1 text-3xl font-black">{flow[active].title}</h3><p className="mt-3 text-lg leading-8 text-foreground/65">{flow[active].line}</p><div className="mt-6 flex items-center gap-2 rounded-2xl bg-green-600/10 p-3 text-sm font-semibold text-green-700 dark:text-green-300"><CheckCircle2 size={17}/> Judge-visible result in the product UI</div></div>
 <StepPreview active={active} />
 </motion.div>
 </Card>
 </div>
 </section>

 <section className="mx-auto max-w-7xl px-4 pb-12">
 <Card><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Proof of intelligence</p><h2 className="mt-1 text-3xl font-black tracking-tight">Before vs after Liya</h2><p className="mt-3 max-w-2xl text-foreground/60">One messy sentence becomes a decision, shortlist, cart and checkout path.</p></div><Link href="/demo"><Button>Replay magic gift decision <ArrowRight size={17}/></Button></Link></div><div className="mt-5 grid gap-3 md:grid-cols-3">{replayScenarios.map((scenario) => <Link key={scenario.label} href={scenario.href} className="focus-ring rounded-3xl bg-black/5 p-4 transition hover:bg-liya-50 dark:bg-foreground/10 dark:hover:bg-card/15"><b>{scenario.label}</b><div className="mt-3 text-sm text-foreground/55"><p>Before: {scenario.before}</p><p className="mt-1 font-bold text-liya-700 dark:text-liya-300">After: {scenario.after}</p></div></Link>)}</div></Card>
 </section>

 <section className="mx-auto max-w-7xl px-4 pb-12">
 <Card className="overflow-hidden p-0">
 <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
 <div className="border-b border-foreground/10 p-5 lg:border-b-0 lg:border-r">
 <p className="text-sm font-bold text-liya-700 dark:text-liya-300">Interactive judge lab</p>
 <h2 className="mt-1 text-3xl font-black tracking-tight">Tap a scenario and watch Liya’s reasoning</h2>
 <p className="mt-3 text-sm leading-6 text-foreground/60">This mini-console makes small but competition-visible features explicit: intent extraction, strategy selection, MCP query shaping, trust labels, and next-step nudges.</p>
 <div className="mt-5 grid gap-2">{labScenarios.map((scenario, index) => <button key={scenario.label} onClick={() => setLab(index)} className={`focus-ring rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${lab === index ?"border-liya-300 bg-liya-50 text-liya-950 shadow-lg dark:border-liya-500/30 dark:bg-liya-500/15 dark:text-white" :"border-foreground/10 bg-black/5 hover:bg-liya-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"}`}>{scenario.label}</button>)}</div>
 </div>
 <motion.div key={selectedLab.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5">
 <div className="rounded-3xl bg-black/5 p-4 text-sm font-semibold dark:bg-foreground/10">Shopper says: “{selectedLab.prompt}”</div>
 <div className="mt-4 grid gap-3 md:grid-cols-2">
 <div className="rounded-3xl bg-card/80 p-4 shadow-sm dark:bg-white/[0.05]"><b>Detected context</b><div className="mt-3 flex flex-wrap gap-2">{selectedLab.detected.map((item) => <span key={item} className="rounded-full bg-green-600/10 px-3 py-1 text-xs font-black text-green-700 dark:text-green-300">{item}</span>)}</div></div>
 <div className="rounded-3xl bg-card/80 p-4 shadow-sm dark:bg-white/[0.05]"><b>Strategy</b><p className="mt-2 text-sm leading-6 text-foreground/60">{selectedLab.strategy}</p></div>
 <div className="rounded-3xl bg-card/80 p-4 shadow-sm dark:bg-white/[0.05]"><b>MCP query shaped by Liya</b><code className="mt-2 block break-words rounded-2xl bg-black/5 p-3 text-xs dark:bg-black/30">{selectedLab.search}</code></div>
 <div className="rounded-3xl bg-card/80 p-4 shadow-sm dark:bg-white/[0.05]"><b>Trust + next action</b><p className="mt-2 text-sm leading-6 text-foreground/60">{selectedLab.trust}. Next: {selectedLab.next}.</p></div>
 </div>
 <div className="mt-5 rounded-3xl border border-liya-200 bg-liya-50/80 p-4 dark:border-liya-500/20 dark:bg-liya-500/10">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-liya-700 dark:text-liya-300">Checkout readiness</p><div className="mt-2 h-2 rounded-full bg-black/10 dark:bg-white/10"><div className="h-2 rounded-full bg-liya-500" style={{ width: `${readiness}%` }} /></div></div><span className="text-2xl font-black">{readiness}%</span></div>
 <div className="mt-4 flex flex-wrap gap-2"><Link href={selectedLab.href}><Button size="sm">Run this path <ArrowRight size={15}/></Button></Link><Link href="/shop"><Button size="sm" variant="secondary">Try your own prompt</Button></Link></div>
 </div>
 </motion.div>
 </div>
 </Card>
 </section>

 <section className="mx-auto max-w-7xl px-4 pb-12">
 <div className="mb-5"><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Feature map</p><h2 className="text-3xl font-black tracking-tight">What judges should notice</h2></div>
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{features.slice(0, 8).map(({ icon: Icon, title, text }) => <Card key={title} className="min-h-44"><Icon className="mb-4 h-7 w-7 text-liya-500"/><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-foreground/55">{text}</p></Card>)}</div><div className="mt-4 flex flex-wrap gap-2">{features.slice(8).map(({ title }) => <span key={title} className="rounded-full bg-card/80 px-3 py-1.5 text-xs font-bold text-foreground/60 shadow-sm dark:bg-white/[0.06]">+ {title}</span>)}</div>
 </section>

 <section className="mx-auto max-w-7xl px-4 pb-12">
 <Card className="grid gap-4 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Local voice + language</p><h2 className="mt-1 text-3xl font-black tracking-tight">Built for how Sri Lankans actually ask</h2><p className="mt-3 leading-7 text-foreground/60">Sinhala, Tamil, Singlish/Tanglish and browser voice are shown as part of the shopping flow — not buried as a settings feature.</p></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-3xl bg-black/5 p-4 dark:bg-foreground/10"><Mic className="mb-2 h-5 w-5 text-liya-500"/><b>Dictate</b><p className="mt-1 text-xs text-foreground/55">Tap Voice, speak, edit, send.</p></div><div className="rounded-3xl bg-black/5 p-4 dark:bg-foreground/10"><Languages className="mb-2 h-5 w-5 text-liya-500"/><b>Detect</b><p className="mt-1 text-xs text-foreground/55">Scripts + local words adjust tone.</p></div><div className="rounded-3xl bg-black/5 p-4 dark:bg-foreground/10"><Sparkles className="mb-2 h-5 w-5 text-liya-500"/><b>Reply</b><p className="mt-1 text-xs text-foreground/55">Warm local assistant style.</p></div></div></Card>
 </section>

 <section className="mx-auto max-w-7xl px-4 pb-12">
 <Card className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-sm font-bold text-liya-700 dark:text-liya-300">What makes it different</p><h2 className="mt-1 text-4xl font-black tracking-tight">Liya is a decision assistant, not a browsing system.</h2><p className="mt-4 leading-7 text-foreground/60">A normal shop asks users to filter. Liya asks for the human situation, chooses a safe path, and moves gently toward checkout.</p></div><div className="grid gap-3">{differences.map((item) => <div key={item} className="flex items-start gap-3 rounded-3xl bg-black/5 p-4 text-sm font-semibold dark:bg-foreground/10"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600"/>{item}</div>)}</div></Card>
 </section>

 <section className="mx-auto max-w-7xl px-4 pb-12">
 <div className="grid gap-5 lg:grid-cols-2">
 <Card><p className="text-sm font-bold text-liya-700 dark:text-liya-300">What Liya is not</p><h2 className="mt-1 text-3xl font-black tracking-tight">Misclassification guardrail</h2><div className="mt-5 grid gap-3">{notDoing.map((item) => <div key={item} className="flex gap-3 rounded-3xl bg-black/5 p-4 text-sm font-semibold dark:bg-foreground/10"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-500"/>{item}</div>)}</div></Card>
 <Card><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Architecture truth</p><h2 className="mt-1 text-3xl font-black tracking-tight">Why this architecture wins</h2><div className="mt-5 rounded-3xl bg-black/5 p-4 text-center text-sm font-black dark:bg-foreground/10">Browser UI → Next.js frontend → isolated MCP client → hosted Kapruka MCP → Kapruka backend</div><ul className="mt-5 space-y-3 text-sm text-foreground/65"><li>• MCP is the commerce backbone.</li><li>• The frontend orchestrates intent, memory, ranking and checkout UX.</li><li>• No backend fork, no MCP server, no extra database.</li><li>• Deterministic fallback keeps demos safe if live search is slow.</li><li>• Real checkout links still come from Kapruka MCP.</li></ul></Card>
 </div>
 </section>

 <section className="mx-auto max-w-7xl px-4 pb-12">
 <Card><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><p className="text-sm font-bold text-liya-700 dark:text-liya-300">Proof of resilience</p><h2 className="mt-1 text-3xl font-black tracking-tight">Break Liya — Judge Mode</h2><p className="mt-3 max-w-2xl text-foreground/60">These buttons run predefined chaos prompts. Liya should stay calm, anchor the flow, and continue shopping.</p></div><ShieldCheck className="hidden h-14 w-14 text-green-600 lg:block"/></div><div className="mt-5 grid gap-3 md:grid-cols-4">{stressTests.map((test) => <Link key={test.label} href={test.href} className="focus-ring rounded-3xl bg-black/5 p-4 transition hover:bg-liya-50 dark:bg-foreground/10 dark:hover:bg-card/15"><b>{test.label}</b><p className="mt-2 text-xs text-foreground/55">{test.text}</p></Link>)}</div></Card>
 </section>

 <section className="mx-auto max-w-7xl px-4 pb-16">
 <div className="rounded-[2rem] bg-ink p-6 text-white shadow-2xl shadow-black/15 dark:bg-white dark:text-gray-900"><div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"><div><h3 className="text-2xl font-black">Ready for the 2-minute judge path?</h3><p className="mt-1 text-white/65 dark:text-gray-600">Runs the apology/birthday/Kandy/payment-link story with live MCP search and fallback safety.</p></div><Link href="/demo"><Button size="lg" className="bg-white text-ink hover:bg-card/90 dark:bg-ink dark:text-white">Start Judge Demo <ArrowRight size={18}/></Button></Link></div></div>
 </section>
 </main>;
}
