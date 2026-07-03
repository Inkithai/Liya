import Link from"next/link";
import { Compass } from"lucide-react";
import { Button } from"@/components/ui/Button";
export default function NotFound() { return <main className="grid min-h-screen place-items-center p-6 text-center"><div><Compass className="mx-auto mb-5 h-14 w-14 text-liya-500"/><h1 className="text-5xl font-black">Aiyo, page not found</h1><p className="mt-3 text-foreground/55">Liya looked in the cart, under the cake box, everywhere.</p><Link href="/shop" className="mt-6 inline-block"><Button>Back to shopping</Button></Link></div></main>; }
