import type { DeliveryQuote, Product, ShopperContext } from "@/types";
import { formatLkr } from "./utils";

const windows = ["9 AM–1 PM", "10 AM–2 PM", "2 PM–6 PM"];

export function deliveryPromise(quote?: DeliveryQuote, context?: ShopperContext) {
  const city = quote?.city ?? context?.location ?? "the selected city";
  const date = quote?.date ?? context?.deliveryDate ?? "your selected date";
  if (!quote) return `Delivery can be verified for ${city} before payment.`;
  if (!quote.available) return `Delivery is uncertain for ${city} on ${date}. I’ll suggest safer alternatives before checkout.`;
  const fee = quote.fee ? ` Delivery fee: ${formatLkr(quote.fee)}.` : "";
  const cutoff = quote.cutoff ? ` Order before ${quote.cutoff}.` : " Order soon to keep the safest slot.";
  return `Likely arrival ${date}, ${windows[1]} in ${city}.${fee}${cutoff}`;
}

export function deliveryScore(product: Product, context: ShopperContext) {
  let score = 0;
  const text = `${product.name} ${product.category ?? ""} ${product.deliveryNote ?? ""}`.toLowerCase();
  if (context.location) score += 10;
  if (context.deliveryDate) score += 10;
  if (/same day|today|express|flowers|cake/.test(text)) score += 8;
  if (product.inStock !== false) score += 8;
  return score;
}

export function fallbackDeliveryCopy(context: ShopperContext) {
  const city = context.location ?? "your city";
  const date = context.deliveryDate ?? "your date";
  return `I’ll treat delivery as a promise, not a footnote: first I check ${city} for ${date}, then I avoid risky perishables if the slot looks tight.`;
}
