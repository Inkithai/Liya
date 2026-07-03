import Link from"next/link";
export function Logo() {
 return <Link href="/" className="focus-ring flex items-center gap-3 rounded-full" aria-label="Liya home"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-liya-400 to-pink-500 text-xl shadow-xl shadow-orange-500/20">ලි</span><span><b className="block text-lg leading-5">Liya</b><span className="text-xs text-foreground/50">Your Sri Lankan Shopping Friend</span></span></Link>;
}
