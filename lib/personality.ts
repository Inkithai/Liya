import type { Language, ShopperContext, Product } from"@/types";
import { formatLkr } from"./utils";

export const guidedQuestions = [
 { key:"recipient", question:"Who is it for? Amma, partner, friend, office, kiddo?" },
 { key:"occasion", question:"What’s the occasion — birthday, anniversary, thank you, get well soon, or just because?" },
 { key:"budget", question:"What budget feels comfortable? I’ll keep it sensible, promise." },
 { key:"location", question:"Where should it go? City is enough for now." },
 { key:"deliveryDate", question:"When do you need it delivered? Today, tomorrow, or a specific date?" },
 { key:"isGift", question:"Is this a gift? If yes, I’ll think about message, presentation and surprise factor." }
] as const;

export function nextQuestion(context: ShopperContext) {
 if (!context.recipient) return guidedQuestions[0];
 if (!context.occasion) return guidedQuestions[1];
 if (!context.budget) return guidedQuestions[2];
 if (!context.location) return guidedQuestions[3];
 if (!context.deliveryDate) return guidedQuestions[4];
 if (context.isGift === undefined) return guidedQuestions[5];
 return null;
}

export function extractContext(input: string, previous: ShopperContext): ShopperContext {
 const next = { ...previous };
 const budget = input.match(/(?:rs\.?|lkr|රු|₹)?\s*([0-9]{3,7})/i);
 if (budget) next.budget = Number(budget[1]);
 if (/today|අද|இன்று/i.test(input)) next.deliveryDate = new Date().toISOString().slice(0, 10);
 if (/tomorrow|හෙට|நாளை/i.test(input)) {
 const d = new Date(); d.setDate(d.getDate() + 1); next.deliveryDate = d.toISOString().slice(0, 10);
 }
 const date = input.match(/\b(202[6-9]-\d{2}-\d{2})\b/);
 if (date) next.deliveryDate = date[1];
 if (/gift|තෑග්ග|பரிசு|surprise|present/i.test(input)) next.isGift = true;
 if (/not a gift|no gift|self|මට|எனக்கு/i.test(input)) next.isGift = false;
 const cities = ["Colombo","Kandy","Galle","Jaffna","Negombo","Kurunegala","Matara","Nugegoda","Battaramulla","Dehiwala"];
 const city = cities.find((c) => new RegExp(`\\b${c}\\b`,"i").test(input));
 if (city) next.location = city;
 const isCorrection = /\b(actually|wait|instead|change|make it|maybe|no,|නෑ|இல்லை)\b/i.test(input);
 if ((!next.recipient || isCorrection) && /(amma|mother|තාත්තා|thaththa|father|wife|husband|girlfriend|boyfriend|friend|boss|kid|daughter|son|teacher|අම්මා|அம்மா)/i.test(input)) next.recipient = input.slice(0, 60);
 if ((!next.occasion || isCorrection) && /(birthday|anniversary|wedding|thank|sorry|apology|get well|new year|avurudu|valentine|congrat|උපන්දිනය|பிறந்தநாள்)/i.test(input)) next.occasion = input.slice(0, 60);
 return next;
}

export function buildSearchQuery(context: ShopperContext) {
 const occasion = context.occasion ??"gift";
 const recipient = context.recipient ??"Sri Lanka";
 if (/birthday/i.test(occasion)) return `${recipient} birthday cake flowers chocolate gift`;
 if (/anniversary|valentine/i.test(occasion)) return"romantic flowers cake chocolate gift";
 if (/get well/i.test(occasion)) return"fruit basket flowers get well soon";
 return `${occasion} ${recipient} gift flowers cake chocolate`;
}

export function recommendationWhy(product: Product, context: ShopperContext) {
 const price = product.price ? `fits around ${formatLkr(product.price, product.currency)}` :"has clear Kapruka details";
 const delivery = context.location ? `can be checked for ${context.location}` :"delivery can be verified before checkout";
 const occasion = context.occasion ? `matches the ${context.occasion} mood` :"works as a thoughtful Sri Lankan gift";
 return `I picked this because it ${price}, ${occasion}, and ${delivery}. Not too much drama — just a nice, safe choice.`;
}

export function bundleIdea(context: ShopperContext) {
 const budget = context.budget ? `under about ${formatLkr(context.budget)}` :"within your budget";
 return `Smart bundle idea: one hero item + flowers + chocolates + a short handwritten-style card, ${budget}. It feels complete without looking like you panicked at the last minute 😄`;
}

export function systemPromptTone(language: Language) {
 if (language ==="si") return"Warm Sinhala/Singlish tone, short and kind.";
 if (language ==="ta") return"Warm Tamil/Tanglish tone, short and kind.";
 if (language ==="tanglish") return"Sri Lankan Tanglish/Singlish, friendly and slightly playful.";
 return"Warm Sri Lankan English, friendly and emotionally aware.";
}
