"use client";
import Link from"next/link";
import { useState } from"react";
import { z } from"zod";
import { zodResolver } from"@hookform/resolvers/zod";
import { useForm } from"react-hook-form";
import { CalendarDays, CheckCircle2, CreditCard, MapPin, MessageSquare, RefreshCcw, Truck } from"lucide-react";
import { toast } from"sonner";
import { Header } from"@/components/layout/Header";
import { Button } from"@/components/ui/Button";
import { Card } from"@/components/ui/Card";
import { cartTotal, useAppStore } from"@/store/useAppStore";
import { checkDelivery, createOrder } from"@/lib/mcp";
import { formatLkr } from"@/lib/utils";

const schema = z.object({
 recipientName: z.string().min(2), recipientPhone: z.string().min(7), address: z.string().min(8), city: z.string().min(2),
 deliveryDate: z.string().min(4), instructions: z.string().optional(), senderName: z.string().min(2), senderEmail: z.string().email(), senderPhone: z.string().min(7), giftMessage: z.string().max(300).optional()
});
type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
 const cart = useAppStore((s) => s.cart);
 const setLastOrder = useAppStore((s) => s.setLastOrder);
 const [delivery, setDelivery] = useState<string>();
 const [paymentUrl, setPaymentUrl] = useState<string>();
 const [orderPrepared, setOrderPrepared] = useState(false);
 const [loading, setLoading] = useState(false);
 const [confetti, setConfetti] = useState(false);
 const memory = useAppStore((s) => s.memory);
 const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { city:"Kandy", deliveryDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10) } });

 async function quote() {
 const city = watch("city"); const date = watch("deliveryDate");
 if (!city || !date) return toast.error("Add city and date first");
 try { const q = await checkDelivery(city, date, cart[0]?.product.id); setDelivery(`${q.available ?"Available" :"Limited"} for ${q.city} on ${q.date}${q.fee ? ` · ${formatLkr(q.fee)}` :""}${q.warning ? ` · ${q.warning}` :""}`); toast.success("Delivery checked via MCP"); } catch (e) { toast.error(e instanceof Error ? e.message :"Delivery check failed"); }
 }

 function generateGiftMessage() {
 if (!cart.length) return toast.error("Add a gift first to generate a message");
  const recipient = watch("recipientName") ||"you";
 const top = cart[0]?.product.name ??"this little surprise";
 const pref = memory.preferences.length ? ` I remembered how much you like ${memory.preferences[0]}.` :"";
 const tone = memory.emotionalIntent ==="apology" ?"I’m sorry, and I hope this brings a small smile today." : memory.emotionalIntent ==="romantic" ?"You make ordinary days feel special." :"Wishing you a beautiful day filled with love and smiles.";
 setValue("giftMessage", `Dear ${recipient}, ${tone}${pref} With love.`);
 toast.success(`Gift message generated for ${top}`);
 }

 async function onSubmit(values: FormValues) {
 if (!cart.length) return toast.error("Your cart is empty");
 setLoading(true);
 try {
 if (cart.some((item) => item.product.trust ==="fallback")) {
 const result = { orderNumber:"DEMO-SAFE-MODE", status:"Offline-safe demo prepared" };
 setLastOrder(result); setOrderPrepared(true); setConfetti(true); setTimeout(() => setConfetti(false), 2200); toast.success("Offline-safe demo order prepared — live payment requires MCP products");
 return;
 }
 const result = await createOrder({
 recipient: { name: values.recipientName, phone: values.recipientPhone, address: values.address, city: values.city },
 sender: { name: values.senderName, email: values.senderEmail, phone: values.senderPhone },
 delivery: { date: values.deliveryDate, city: values.city, instructions: values.instructions },
 giftMessage: values.giftMessage, currency:"LKR"
 }, cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity, note: item.note })));
 setLastOrder(result); setPaymentUrl(result.paymentUrl); setOrderPrepared(true); setConfetti(true); setTimeout(() => setConfetti(false), 2200); toast.success("Order created — payment link ready");
 } catch (e) { toast.error(e instanceof Error ? e.message :"Order creation failed"); }
 finally { setLoading(false); }
 }

 return <main className="min-h-screen">{confetti && <div aria-hidden="true">{Array.from({ length: 28 }).map((_, i) => <span key={i} className="confetti-piece" style={{ left: `${(i * 37) % 100}%`, background: ["#f97316","#ec4899","#22c55e","#facc15"][i % 4], animationDelay: `${(i % 7) * 0.08}s` }} />)}</div>}<Header /><div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]"><form onSubmit={handleSubmit(onSubmit)} className="space-y-5"><div><p className="text-sm font-semibold text-liya-700 dark:text-liya-300">~2 minute conversational checkout</p><h1 className="text-4xl font-black tracking-tight">Almost done — no seven-minute forms.</h1></div><Card><h2 className="mb-4 flex items-center gap-2 font-black"><MapPin size={18}/> Recipient & delivery</h2><div className="grid gap-3 md:grid-cols-2">{[["recipientName","Recipient name"],["recipientPhone","Recipient phone"],["city","City"],["deliveryDate","Delivery date"]].map(([name,label]) => <label key={name} className="text-sm font-semibold">{label}<input type={name ==="deliveryDate" ?"date" :"text"} className="mt-1 w-full rounded-2xl border border-foreground/10 bg-card/70 px-4 py-3 outline-none focus:border-liya-500 dark:bg-foreground/10" {...register(name as keyof FormValues)} />{errors[name as keyof FormValues] && <span className="text-xs text-red-600">Required</span>}</label>)}<label className="md:col-span-2 text-sm font-semibold">Address<textarea className="mt-1 w-full rounded-2xl border border-foreground/10 bg-card/70 px-4 py-3 outline-none focus:border-liya-500 dark:bg-foreground/10" {...register("address")} /></label><label className="md:col-span-2 text-sm font-semibold">Delivery instructions<textarea className="mt-1 w-full rounded-2xl border border-foreground/10 bg-card/70 px-4 py-3 outline-none focus:border-liya-500 dark:bg-foreground/10" {...register("instructions")} /></label></div><Button type="button" variant="secondary" className="mt-4" onClick={quote}><Truck size={16}/> Check delivery</Button>{delivery && <p className="mt-3 rounded-2xl bg-liya-50 p-3 text-sm text-liya-900 dark:bg-liya-500/10 dark:text-liya-100">{delivery}</p>}</Card><Card><h2 className="mb-4 flex items-center gap-2 font-black"><MessageSquare size={18}/> Sender & gift message</h2><div className="grid gap-3 md:grid-cols-2"><label className="text-sm font-semibold">Your name<input className="mt-1 w-full rounded-2xl border border-foreground/10 bg-card/70 px-4 py-3 outline-none focus:border-liya-500 dark:bg-foreground/10" {...register("senderName")} /></label><label className="text-sm font-semibold">Email<input className="mt-1 w-full rounded-2xl border border-foreground/10 bg-card/70 px-4 py-3 outline-none focus:border-liya-500 dark:bg-foreground/10" {...register("senderEmail")} /></label><label className="text-sm font-semibold md:col-span-2">Phone<input className="mt-1 w-full rounded-2xl border border-foreground/10 bg-card/70 px-4 py-3 outline-none focus:border-liya-500 dark:bg-foreground/10" {...register("senderPhone")} /></label><label className="text-sm font-semibold md:col-span-2">Gift message<textarea placeholder="Liya tip: short, warm, personal wins." className="mt-1 w-full rounded-2xl border border-foreground/10 bg-card/70 px-4 py-3 outline-none focus:border-liya-500 dark:bg-foreground/10" {...register("giftMessage")} /></label><div className="md:col-span-2"><Button type="button" variant="secondary" size="sm" onClick={generateGiftMessage}>Generate with Liya memory</Button></div></div></Card><Button disabled={loading || !cart.length} size="lg"><CreditCard size={18}/>{loading ?"Creating payment link…" :"Create payment link"}</Button>{paymentUrl && <a href={paymentUrl} target="_blank" rel="noreferrer" className="ml-3 inline-flex rounded-full bg-green-600 px-6 py-4 font-bold text-white">Pay securely</a>}{orderPrepared && <Card className="border-green-200 bg-green-50/80 dark:border-green-500/20 dark:bg-green-500/10"><CheckCircle2 className="mb-3 h-8 w-8 text-green-600"/><h2 className="text-2xl font-black">Gift successfully prepared</h2><p className="mt-2 text-sm text-foreground/65">That’s a really solid choice. Liya optimized for delivery confidence, gift message warmth, budget fit, and a real Kapruka payment link.</p><div className="mt-4 rounded-3xl bg-card/80 p-4 text-sm dark:bg-black/20"><b>What just happened in 2 minutes</b><ul className="mt-2 list-inside list-disc space-y-1 text-foreground/65"><li>Understood emotional intent</li><li>Chose an optimal gift strategy</li><li>Ranked live Kapruka products or safe fallback picks</li><li>Resolved delivery and checkout constraints</li><li>Prepared a payment-ready checkout flow</li></ul><p className="mt-3 font-bold text-green-700 dark:text-green-300">Result: gift successfully selected in one guided flow.</p><p className="mt-2 italic text-foreground/60">Liya has prepared something meaningful — you’re all set for the next step 🎁</p></div><div className="mt-4 grid gap-2 text-sm sm:grid-cols-3"><span className="rounded-2xl bg-card/80 p-3 font-bold dark:bg-black/20">Delivery confidence: High</span><span className="rounded-2xl bg-card/80 p-3 font-bold dark:bg-black/20">Payment link: {paymentUrl ?"Ready" :"Live MCP required"}</span><span className="rounded-2xl bg-card/80 p-3 font-bold dark:bg-black/20">Tracking: Next step</span></div><div className="mt-4 flex flex-wrap gap-2"><Link href="/track"><Button type="button" size="sm">Track after payment</Button></Link><Link href="/demo"><Button type="button" variant="secondary" size="sm"><RefreshCcw size={15}/> Replay journey</Button></Link></div></Card>}</form><aside className="space-y-4"><Card><h2 className="font-black">Order summary</h2><div className="mt-4 space-y-3">{cart.map((item) => <div key={item.product.id} className="flex justify-between gap-3 text-sm"><span>{item.quantity} × {item.product.name}</span><b>{formatLkr((item.product.price ?? 0) * item.quantity, item.product.currency)}</b></div>)}{!cart.length && <p className="text-sm text-foreground/55">Cart is empty. Liya can help fill it.</p>}</div><div className="mt-4 flex justify-between border-t border-foreground/10 pt-4 text-lg font-black"><span>Total</span><span>{formatLkr(cartTotal(cart))}</span></div><Link href="/shop" className="mt-4 block text-sm font-semibold text-liya-700 dark:text-liya-300">Need to adjust? Ask Liya</Link></Card><Card><CalendarDays className="mb-3 text-liya-500"/><h3 className="font-black">Delivery timeline visualizer</h3><ol className="mt-3 space-y-3 text-sm"><li>1. Delivery eligibility checked via MCP</li><li>2. Order created and prices locked for 60 min</li><li>3. Pay using Kapruka secure link</li><li>4. Track fulfillment from confirmation</li></ol></Card></aside></div></main>;
}
