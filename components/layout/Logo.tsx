import Link from"next/link";
export function Logo() {
 return <Link href="/" className="focus-ring flex min-w-0 items-center gap-3 rounded-full" aria-label="Liya home"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-liya-400 to-pink-500 text-xl text-white shadow-xl shadow-orange-500/20">ලි</span><span className="min-w-0"><b className="block text-lg leading-5">Liya</b><span className="hidden truncate text-xs text-foreground/50 sm:block">Your Sri Lankan Shopping Friend</span></span></Link>;
}
