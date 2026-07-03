import Link from"next/link";
import { ArrowRight, BookOpen, CheckCircle2, PlayCircle, Sparkles } from"lucide-react";
import { Header } from"@/components/layout/Header";
import { LandingJudgeCue } from"@/components/layout/LandingJudgeCue";
import { Button } from"@/components/ui/Button";
import { Card } from"@/components/ui/Card";

export default function LandingPage() {
 return <main className="min-h-screen soft-grid"><Header /><LandingJudgeCue />
 <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1.04fr_.96fr] lg:py-20">
 <div className="flex flex-col justify-center">
 <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm font-semibold shadow-lg shadow-black/[0.04] dark:bg-foreground/10"><Sparkles size={16} className="text-liya-500"/> Kapruka Agent Challenge 2026</p>
 <h1 className="max-w-4xl text-5xl font-black tracking-[-0.05em] sm:text-7xl">Liya is your Sri Lankan shopping friend.</h1>
 <p className="mt-6 max-w-2xl text-xl leading-8 text-foreground/65">Tell Liya the occasion. She finds real Kapruka products, builds a cart, creates a payment link, and gets you to checkout in about 2 minutes.</p><p className="mt-3 max-w-2xl text-lg font-bold text-liya-700 dark:text-liya-300">From “I don’t know what to buy” to a ready gift in under 2 minutes.</p><p className="mt-2 max-w-2xl text-sm font-semibold text-foreground/55">Unlike e-commerce sites that show products, Liya decides what to buy and completes checkout in one guided conversation.</p>
 <div className="mt-8 flex flex-col gap-3 sm:flex-row">
 <Link href="/demo"><Button size="lg" className="h-16 px-8 text-lg shadow-2xl shadow-liya-500/20 ring-4 ring-liya-500/10"><PlayCircle size={21}/> Start Demo <ArrowRight size={19}/></Button></Link>
 <Link href="/how-it-works"><Button variant="secondary" size="lg"><BookOpen size={18}/> See 2-min demo guide</Button></Link>
 </div>
 <p className="mt-3 text-sm font-black text-liya-700 dark:text-liya-300">Recommended — this runs the full experience in about 2 minutes.</p>
 <div className="mt-8 flex flex-wrap gap-2 text-sm text-foreground/55">
 <span className="rounded-full bg-card/70 px-3 py-1 dark:bg-foreground/10">Live Kapruka MCP</span>
 <span className="rounded-full bg-card/70 px-3 py-1 dark:bg-foreground/10">Zero login checkout</span>
 <span className="rounded-full bg-card/70 px-3 py-1 dark:bg-foreground/10">Sinhala · Tamil · Tanglish</span>
 </div>
 </div>

 <Card className="relative overflow-hidden p-0">
 <div className="absolute inset-0 bg-gradient-to-br from-liya-200/60 via-pink-100/50 to-white/20 dark:from-liya-500/20 dark:via-pink-500/10" />
 <div className="relative p-6">
 <div className="rounded-[2rem] bg-card/82 p-5 shadow-2xl dark:bg-black/30">
 <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-liya-400 to-pink-500 text-xl">ලි</span><div><b>Liya</b><p className="text-sm text-foreground/55">“Aiyo, don’t scroll 300 products. Tell me the story.”</p></div></div>
 <div className="mt-5 space-y-3">
 <div className="rounded-3xl bg-black/5 p-4 text-sm dark:bg-foreground/10">I forgot my wife’s birthday. Kandy tomorrow. Rs. 5,000.</div>
 <div className="rounded-3xl bg-liya-50 p-4 text-sm text-liya-950 dark:bg-liya-500/15 dark:text-liya-100">Got it — make-it-right gift. I’ll pick something sincere, delivery-safe, and not overdone.</div>
 <div className="rounded-3xl bg-card/75 p-4 text-sm shadow-sm dark:bg-foreground/10"><b>If you trust me on one pick:</b><br/>this is the safest gift to send.</div>
 </div>
 </div>
 <div className="mt-5 grid gap-3 sm:grid-cols-3">
 {['Intent', 'Live search', 'Checkout'].map((item) => <div key={item} className="flex items-center gap-2 rounded-3xl bg-card/78 p-4 font-bold shadow-lg shadow-black/[0.03] dark:bg-foreground/10"><CheckCircle2 size={17} className="text-green-600"/>{item}</div>)}
 </div>
 </div>
 </Card>
 </section>
 </main>;
}
