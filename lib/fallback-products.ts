import type { Product } from"@/types";

export const fallbackProducts: Product[] = [
 {
 id:"fallback-rose-choco-bundle",
 name:"Liya Safe Pick: Roses + Chocolate Gift Bundle",
 price: 4950,
 currency:"LKR",
 category:"Offline-safe gift bundle",
 description:"Demo-safe fallback bundle for apology, birthday or romantic gifting when live MCP is unavailable.",
 image: undefined,
 inStock: true,
 deliveryNote:"Verify live delivery in checkout when MCP reconnects",
 trust:"fallback"
 },
 {
 id:"fallback-birthday-cake-flowers",
 name:"Birthday Rescue: Cake + Mixed Flowers",
 price: 6850,
 currency:"LKR",
 category:"Offline-safe birthday",
 description:"A balanced celebration choice when the shopper needs a complete birthday gift fast.",
 image: undefined,
 inStock: true,
 deliveryNote:"Fallback display only; live checkout still uses Kapruka MCP",
 trust:"fallback"
 },
 {
 id:"fallback-fruit-flowers-care",
 name:"Care Gift: Fruit Basket + Soft Flowers",
 price: 5750,
 currency:"LKR",
 category:"Offline-safe care gift",
 description:"Gentle fallback option for sympathy, get-well or respectful gifting.",
 image: undefined,
 inStock: true,
 deliveryNote:"Verify city/date when live MCP is available",
 trust:"fallback"
 },
 {
 id:"fallback-chocolate-hamper",
 name:"Chocolate Hamper with Message Card",
 price: 3500,
 currency:"LKR",
 category:"Offline-safe hamper",
 description:"Budget-friendly fallback for shoppers who mention chocolate or a simple thoughtful gift.",
 image: undefined,
 inStock: true,
 deliveryNote:"Fallback product for demo resilience",
 trust:"fallback"
 }
];

export function getFallbackProducts(query ="") {
 const lower = query.toLowerCase();
 const sorted = [...fallbackProducts].sort((a, b) => {
 const aText = `${a.name} ${a.description}`.toLowerCase();
 const bText = `${b.name} ${b.description}`.toLowerCase();
 const aScore = ["apology","sorry","wife","chocolate","rose","birthday","cake","care"].filter((term) => lower.includes(term) && aText.includes(term)).length;
 const bScore = ["apology","sorry","wife","chocolate","rose","birthday","cake","care"].filter((term) => lower.includes(term) && bText.includes(term)).length;
 return bScore - aScore;
 });
 return sorted;
}
