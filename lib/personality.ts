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

const fieldOrder: Array<keyof ShopperContext> = ["recipient","occasion","budget","location","deliveryDate","isGift"];

function firstMissing(context: ShopperContext) {
 return fieldOrder.find((field) => field ==="isGift" ? context.isGift === undefined : !context[field]);
}

function cleanAnswer(input: string) {
 return input
 .replace(/^(it'?s|it is|for|to|in|at|around|about|under|please|pls)\s+/i,"")
 .replace(/[.!?]+$/g,"")
 .trim();
}

function titleCase(value: string) {
 return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseBudget(input: string) {
 const k = input.match(/(?:rs\.?|lkr|රු|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*k\b/i);
 if (k) return Math.round(Number(k[1]) * 1000);
 const budget = input.match(/(?:rs\.?|lkr|රු|₹)?\s*([0-9]{3,7})/i);
 return budget ? Number(budget[1]) : undefined;
}

function parseDeliveryDate(input: string) {
 if (/day after tomorrow|අනිද්දා/i.test(input)) {
 const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().slice(0, 10);
 }
 if (/today|අද|இன்று/i.test(input)) return new Date().toISOString().slice(0, 10);
 if (/tomorrow|හෙට|நாளை/i.test(input)) {
 const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10);
 }
 const iso = input.match(/\b(202[6-9]-\d{2}-\d{2})\b/);
 if (iso) return iso[1];
 const slash = input.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](202[6-9]))?\b/);
 if (slash) {
 const year = slash[3] ? Number(slash[3]) : new Date().getFullYear();
 const day = Number(slash[1]);
 const month = Number(slash[2]);
 if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
 }
 return undefined;
}

function parseGiftFlag(input: string, expected?: keyof ShopperContext) {
 const exact = cleanAnswer(input).toLowerCase();
 if (/\b(not a gift|no gift|self|for me|myself|මට|எனக்கு)\b/i.test(input)) return false;
 if (/\b(gift|surprise|present|තෑග්ග|பரிசு)\b/i.test(input)) return true;
 if (expected ==="isGift") {
 if (/^(yes|yep|yeah|ya|sure|ok|okay|please|gift)$/i.test(exact)) return true;
 if (/^(no|nope|nah|not really)$/i.test(exact)) return false;
 }
 return undefined;
}

function parseLocation(input: string, expected?: keyof ShopperContext) {
 const cities = [
 "Colombo","Kandy","Galle","Jaffna","Negombo","Kurunegala","Matara","Nugegoda","Battaramulla","Dehiwala","Dambulla","Anuradhapura","Polonnaruwa","Trincomalee","Batticaloa","Ratnapura","Badulla","Nuwara Eliya","Panadura","Kalutara","Moratuwa","Maharagama","Kotte","Gampaha","Kegalle","Matale","Wattala","Ja-Ela","Avissawella","Hambantota","Vavuniya","Mannar","Kilinochchi","Puttalam","Chilaw","Kalmunai","Ampara","Ella","Hikkaduwa","Weligama","Mirissa","Katunayake","Peradeniya","Kadawatha","Homagama","Piliyandala","Boralesgamuwa"
 ];
 const city = cities.find((c) => new RegExp(`\\b${c.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")}\\b`,"i").test(input));
 if (city) return city;
 const routed = input.match(/\b(?:deliver(?:y)?\s*(?:to)?|send\s*(?:to)?|ship\s*(?:to)?|to|in|at)\s+([a-zA-Z][a-zA-Z\s-]{2,35})\b/i);
 if (routed) return titleCase(routed[1].replace(/\b(today|tomorrow|day after tomorrow|under|budget|gift)\b.*$/i,"").trim());
 const answer = cleanAnswer(input);
 if (expected ==="location" && /^[a-zA-Z][a-zA-Z\s-]{2,35}$/.test(answer) && !/(birthday|anniversary|gift|wife|mother|friend|today|tomorrow|yes|no)/i.test(answer)) return titleCase(answer);
 return undefined;
}

function parseRecipient(input: string, expected?: keyof ShopperContext) {
 const recipientMatch = input.match(/\b(?:my\s+)?(amma|mother|mom|mum|father|dad|thaththa|wife|husband|girlfriend|boyfriend|partner|fiancee?|friend|best friend|boss|colleague|coworker|teacher|kid|child|daughter|son|sister|brother|aunt|uncle|cousin|grandmother|grandfather|ආච්චි|අම්මා|තාත්තා|அம்மா)\b/i);
 if (recipientMatch) return recipientMatch[0].trim();
 const answer = cleanAnswer(input);
 if (expected ==="recipient" && /^[a-zA-Z][a-zA-Z\s'-]{1,40}$/.test(answer) && !/(birthday|anniversary|wedding|thank|sorry|apology|get well|graduation|today|tomorrow|yes|no|gift)/i.test(answer)) return answer;
 return undefined;
}

function parseOccasion(input: string, expected?: keyof ShopperContext) {
 const lower = input.toLowerCase();
 const occasions = ["birthday","anniversary","wedding","thank you","thanks","sorry","apology","get well","new year","avurudu","valentine","congratulations","graduation","engagement","housewarming","new baby","sympathy","romantic","just because","උපන්දිනය","பிறந்தநாள்"];
 const found = occasions.filter((occasion) => lower.includes(occasion.toLowerCase()));
 if (found.length) return found.slice(0, 2).join(" ");
 const answer = cleanAnswer(input);
 if (expected ==="occasion" && /^[a-zA-Z][a-zA-Z\s'-]{2,50}$/.test(answer) && !/(wife|husband|mother|friend|sister|brother|today|tomorrow|yes|no)/i.test(answer)) return answer;
 return undefined;
}

export function extractContext(input: string, previous: ShopperContext): ShopperContext {
 const next = { ...previous };
 const expected = firstMissing(previous);

 const budget = parseBudget(input);
 if (budget !== undefined) next.budget = budget;

 const deliveryDate = parseDeliveryDate(input);
 if (deliveryDate) next.deliveryDate = deliveryDate;

 const giftFlag = parseGiftFlag(input, expected);
 if (giftFlag !== undefined) next.isGift = giftFlag;

 const location = parseLocation(input, expected);
 if (location) next.location = location;

 const isCorrection = /\b(actually|wait|instead|change|make it|maybe|no,|නෑ|இல்லை)\b/i.test(input);
 const recipient = parseRecipient(input, expected);
 if (recipient && (!next.recipient || isCorrection || expected ==="recipient")) next.recipient = recipient;

 const occasion = parseOccasion(input, expected);
 if (occasion && (!next.occasion || isCorrection || expected ==="occasion")) next.occasion = occasion;

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
