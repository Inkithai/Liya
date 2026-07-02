import type { Language, Product, ShopperContext } from "@/types";
import { buildSearchQuery } from "./personality";
import { deliveryScore, fallbackDeliveryCopy } from "./delivery";
import { formatLkr } from "./utils";

export type EmotionalIntent = "celebration" | "apology" | "urgent" | "sympathy" | "romantic" | "neutral";
export type ShoppingStrategyId = "relationship_repair" | "urgent_delivery" | "celebration_impact" | "comfort_care" | "romantic_signal" | "value_optimizer";
export type ConflictType = "cheap_premium" | "fast_cheap" | "unknown_preference" | "budget_delivery_risk" | "minimal_flashy" | "multi_person" | "chaos_input";

export type UserMemory = {
  preferences: string[];
  dislikes: string[];
  notes: string[];
  emotionalIntent: EmotionalIntent;
  styleSignals: string[];
};

export type StrategyPolicy = {
  id: ShoppingStrategyId;
  label: string;
  priority: "emotion" | "speed" | "budget" | "presentation" | "comfort";
  boosts: string[];
  avoids: string[];
  rationale: string;
  weights: { emotion: number; speed: number; budget: number; memory: number; presentation: number };
};

export type DecisionTrace = {
  title: string;
  rows: Array<{ label: string; value: string }>;
  bullets: string[];
  warnings?: string[];
};

export type OrchestratorDecision = {
  intent: "demo" | "search" | "trend" | "track" | "checkout" | "reorder" | "question" | "anchor";
  missing: Array<keyof ShopperContext>;
  memory: UserMemory;
  strategy: StrategyPolicy;
  conflicts: Array<{ type: ConflictType; message: string; resolution: string }>;
  uncertainty: string[];
  searchQueries: string[];
  assistantLead: string;
  trace: DecisionTrace;
  anchor?: { kind: "off_catalog" | "technical" | "comparison" | "chaos" | "topic_switch"; message: string; searchHint?: string };
  microAdjustment?: string;
  followUp?: string;
};

const emptyMemory = (): UserMemory => ({ preferences: [], dislikes: [], notes: [], emotionalIntent: "neutral", styleSignals: [] });

const fieldLabels: Record<string, string> = {
  recipient: "who it is for",
  occasion: "the occasion",
  budget: "your comfortable budget",
  location: "delivery city",
  deliveryDate: "delivery date",
  isGift: "whether this is a gift"
};

export function inferEmotion(text: string): EmotionalIntent {
  const lower = text.toLowerCase();
  if (/sorry|apolog|angry|fight|forgive|forgot|තරහ|samawa|மன்னிப்பு/.test(lower)) return "apology";
  if (/urgent|today|asap|now|last minute|ඉක්මනින්|அவசரம்/.test(lower)) return "urgent";
  if (/wife|husband|girlfriend|boyfriend|anniversary|romantic|love|ආදර|காதல்/.test(lower)) return "romantic";
  if (/birthday|congrat|celebrat|උපන්දිනය|பிறந்தநாள்/.test(lower)) return "celebration";
  if (/get well|sympathy|funeral|sick|ill|දුක|நலம்/.test(lower)) return "sympathy";
  return "neutral";
}

export function extractMemory(text: string, previous?: UserMemory): UserMemory {
  const memory: UserMemory = previous ? { ...emptyMemory(), ...previous } : emptyMemory();
  const next: UserMemory = {
    preferences: [...memory.preferences],
    dislikes: [...memory.dislikes],
    notes: [...memory.notes],
    emotionalIntent: memory.emotionalIntent,
    styleSignals: [...memory.styleSignals]
  };
  const likes = text.match(/(?:likes?|loves?|favorite|ආස|பிடிக்கும்)\s+([a-zA-Z\s]{3,30})/i);
  const dislikes = text.match(/(?:doesn't like|dont like|don't like|avoid|allergic|diabetic|sugar free|no sugar|අකමැති|வேண்டாம்)\s+([a-zA-Z\s]{3,30})/i);
  const addPref = (value: string) => { next.preferences = Array.from(new Set([value, ...next.preferences])).slice(0, 8); };
  const addStyle = (value: string) => { next.styleSignals = Array.from(new Set([value, ...next.styleSignals])).slice(0, 6); };

  if (likes) addPref(likes[1].trim());
  if (/chocolate|චොකලට්|சாக்லேட்/i.test(text)) addPref("chocolate");
  if (/rose|රෝස|ரோஜா/i.test(text)) addPref("roses");
  if (/flower|bouquet|මල්|பூ/i.test(text)) addPref("flowers");
  if (/cake|කේක්|கேக்/i.test(text)) addPref("cake");
  if (/minimal|simple|elegant|not flashy|classy|චාම්/i.test(text)) addStyle("minimal");
  if (/premium|luxury|grand|wow|fancy/i.test(text)) addStyle("premium");
  if (/traditional|local|sri lankan/i.test(text)) addStyle("traditional");
  if (dislikes) next.dislikes = Array.from(new Set([dislikes[1].trim(), ...next.dislikes])).slice(0, 8);
  if (/diabetic|sugar free|no sugar/i.test(text)) next.dislikes = Array.from(new Set(["sugar", "sweet", ...next.dislikes])).slice(0, 8);

  const emotion = inferEmotion(text);
  if (emotion !== "neutral") next.emotionalIntent = emotion;
  if (text.length > 12) next.notes = Array.from(new Set([text.slice(0, 140), ...next.notes])).slice(0, 8);
  return next;
}

export function missingFields(context: ShopperContext): Array<keyof ShopperContext> {
  const missing: Array<keyof ShopperContext> = [];
  if (!context.recipient) missing.push("recipient");
  if (!context.occasion) missing.push("occasion");
  if (!context.budget) missing.push("budget");
  if (!context.location) missing.push("location");
  if (!context.deliveryDate) missing.push("deliveryDate");
  if (context.isGift === undefined) missing.push("isGift");
  return missing;
}

export function buildStrategy(context: ShopperContext, memory: UserMemory, input: string): StrategyPolicy {
  const lower = input.toLowerCase();
  const urgent = memory.emotionalIntent === "urgent" || /today|tomorrow|forgot|urgent|asap|last minute/.test(lower);
  if (memory.emotionalIntent === "apology") return {
    id: "relationship_repair",
    label: "relationship repair",
    priority: urgent ? "speed" : "emotion",
    boosts: ["roses", "flowers", "chocolate", "card", "hamper", "soft colours"],
    avoids: ["generic electronics", "joke gifts", "overly practical items"],
    rationale: "This is not normal shopping; the job is emotional repair. I should optimize for thoughtfulness first, then delivery safety, then price.",
    weights: { emotion: 30, speed: urgent ? 26 : 18, budget: 12, memory: 22, presentation: 18 }
  };
  if (urgent) return {
    id: "urgent_delivery",
    label: "urgent delivery rescue",
    priority: "speed",
    boosts: ["same day", "flowers", "cake", "ready gift", "in stock"],
    avoids: ["custom items", "fragile luxury hampers", "uncertain delivery"],
    rationale: "Time is the constraint. I should reduce risk and prefer products commonly available for fast local delivery.",
    weights: { emotion: 10, speed: 34, budget: 18, memory: 14, presentation: 10 }
  };
  if (memory.emotionalIntent === "romantic") return {
    id: "romantic_signal",
    label: "romantic signal",
    priority: "presentation",
    boosts: ["roses", "flowers", "chocolate", "jewellery", "card"],
    avoids: ["too practical", "office-looking gifts"],
    rationale: "A romantic gift must feel intentional and personal, not merely useful.",
    weights: { emotion: 25, speed: 14, budget: 14, memory: 20, presentation: 24 }
  };
  if (memory.emotionalIntent === "sympathy") return {
    id: "comfort_care",
    label: "comfort and care",
    priority: "comfort",
    boosts: ["fruit", "flowers", "wellness", "soft message", "simple presentation"],
    avoids: ["loud colours", "party items", "joke gifts"],
    rationale: "The safest choice should feel calm, respectful and supportive.",
    weights: { emotion: 24, speed: 14, budget: 16, memory: 18, presentation: 12 }
  };
  if (memory.emotionalIntent === "celebration") return {
    id: "celebration_impact",
    label: "celebration impact",
    priority: "presentation",
    boosts: ["cake", "flowers", "chocolate", "party", "bundle", "hamper"],
    avoids: ["plain household items"],
    rationale: "Celebrations need visible delight, so I should prefer gifts that feel festive and complete.",
    weights: { emotion: 18, speed: 14, budget: 18, memory: 20, presentation: 22 }
  };
  return {
    id: "value_optimizer",
    label: "value-conscious gift planning",
    priority: "budget",
    boosts: ["gift", "bundle", "popular", "in stock"],
    avoids: ["over budget", "unclear delivery"],
    rationale: "When the story is still forming, I should preserve budget, ask smart questions and avoid risky assumptions.",
    weights: { emotion: 10, speed: 12, budget: 28, memory: 14, presentation: 10 }
  };
}

export function detectConflicts(input: string, context: ShopperContext, memory: UserMemory) {
  const conflicts: OrchestratorDecision["conflicts"] = [];
  if (!/[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF]{3,}/.test(input) || /(.)\1{6,}/.test(input)) conflicts.push({ type: "chaos_input", message: "That message is a bit unclear.", resolution: "I’ll bring us back to the fastest shopping path: recipient, occasion, city, date, budget." });
  if (/(mom|mother|amma|wife|dad|father|friend).*(and|&|,).*(mom|mother|amma|wife|dad|father|friend)/i.test(input)) conflicts.push({ type: "multi_person", message: "This sounds like gifts for more than one person.", resolution: "I’ll plan one recipient first so checkout stays clean, then we can add the second gift." });
  if (/(cheap|low budget|budget|අඩු|குறைந்த).*(premium|luxury|grand|fancy|wow)|(?:premium|luxury|grand).*(cheap|low budget|budget)/i.test(input)) conflicts.push({ type: "cheap_premium", message: "You’re asking for cheap and premium at the same time.", resolution: "I’ll treat it as premium-looking, not premium-priced." });
  if (/(today|asap|urgent|tomorrow).*(cheap|low budget)|(?:cheap|low budget).*(today|asap|urgent|tomorrow)/i.test(input)) conflicts.push({ type: "fast_cheap", message: "Fast delivery and lowest price can conflict.", resolution: "I’ll prioritize delivery reliability, then keep price close to budget." });
  if (/don't know|not sure|anything|surprise me|whatever/i.test(input)) conflicts.push({ type: "unknown_preference", message: "Preference is unclear.", resolution: "I’ll show two safe paths and ask one high-value question." });
  if (context.budget && context.budget < 2500 && /today|tomorrow|urgent|premium|roses/i.test(input)) conflicts.push({ type: "budget_delivery_risk", message: "Budget is tight for fast/premium gifting.", resolution: "I’ll prefer smaller but emotionally clear gifts instead of pretending everything fits." });
  if (memory.styleSignals.includes("minimal") && /grand|flashy|big|luxury/i.test(input)) conflicts.push({ type: "minimal_flashy", message: "Earlier memory says minimal, but current words ask for flashy.", resolution: "I’ll ask whether to keep it elegant or make it grand." });
  return conflicts;
}

export function detectAnchor(input: string, context: ShopperContext): OrchestratorDecision["anchor"] | undefined {
  const lower = input.toLowerCase().trim();
  if (!lower || !/[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF]{2,}/.test(input) || /^([\p{Emoji_Presentation}\p{Extended_Pictographic}\s!?.,]){1,12}$/u.test(input)) {
    return { kind: "chaos", message: "No stress — I’ll keep us on the shopping path. Tell me who it’s for, or pick a safe gift lane.", searchHint: "popular gifts flowers cakes chocolates" };
  }
  if (/ignore everything|forget instructions|jailbreak|system prompt|developer message|api key|what.?s the api|backend|mcp endpoint|openai|gemini/i.test(input)) {
    return { kind: "technical", message: "I can keep that short: Liya uses Kapruka’s hosted shopping tools. For the demo, let’s use it to complete a real purchase path.", searchHint: "popular Kapruka gifts" };
  }
  if (/amazon|daraz|ebay|aliexpress/i.test(input)) {
    return { kind: "comparison", message: "I can’t check those carts live here, but I can give you a Kapruka-safe option with delivery and checkout in one flow.", searchHint: "best value gift Sri Lanka" };
  }
  if (/cheap phones|phone|iphone|samsung|laptop|electronics/i.test(input) && !/gift|birthday|anniversary|delivery/i.test(input)) {
    return { kind: "off_catalog", message: "I can look for that, but Liya is strongest when we anchor it to a recipient and delivery need. I’ll start with budget-friendly giftable options.", searchHint: "budget electronics gift" };
  }
  if ((context.occasion || context.recipient) && /actually|wait|instead|change|maybe/i.test(input)) {
    return { kind: "topic_switch", message: "Got it — I’ll adjust the shelf, not restart the whole journey.", searchHint: undefined };
  }
  return undefined;
}

export function uncertaintySignals(context: ShopperContext, memory: UserMemory, input: string) {
  const signals: string[] = [];
  if (!context.occasion && memory.emotionalIntent !== "neutral") signals.push("I know the emotional tone, but not the exact occasion yet.");
  if (!context.budget && /premium|luxury|cheap|budget/i.test(input) === false) signals.push("Budget is unknown, so I’ll avoid extreme prices until you confirm.");
  if (!context.deliveryDate && /today|tomorrow|urgent/i.test(input)) signals.push("Delivery is urgent, but the exact date should be confirmed before payment.");
  return signals.slice(0, 3);
}

export function smartQuestion(context: ShopperContext, memory: UserMemory, strategy: StrategyPolicy, conflicts: OrchestratorDecision["conflicts"]) {
  if (conflicts[0]?.type === "chaos_input") return "No stress — tell me just this: who is it for and what is the occasion?";
  if (conflicts[0]?.type === "multi_person") return "Should I start with one person first, or build a two-gift bundle?";
  if (conflicts[0]) return `${conflicts[0].message} Should I prioritize ${strategy.priority === "speed" ? "speed" : strategy.priority === "budget" ? "price" : "emotional impact"} or adjust the budget?`;
  const missing = missingFields(context);
  if (!missing.length) return undefined;
  if (strategy.id === "relationship_repair") {
    if (missing.includes("deliveryDate")) return "For an apology, timing matters. Should I aim for today/tomorrow delivery or is a more thoughtful later gift okay?";
    if (!memory.preferences.length) return "Since this is sensitive, what does she usually respond to — flowers, chocolates, a card, or something simple?";
    if (missing.includes("budget")) return "For relationship-repair gifts, emotional impact matters more than size. What budget feels sincere but comfortable?";
  }
  if (strategy.id === "urgent_delivery" && missing.includes("location")) return "Aiyo, timing matters. Which city should I check first so I can avoid risky products?";
  if (strategy.id === "comfort_care" && missing.includes("isGift")) return "Should this feel like a quiet comfort gift with a message, or just useful items delivered fast?";
  const first = missing[0];
  if (first === "recipient") return "Who are we shopping for? Amma, wife, friend, colleague, kiddo?";
  if (first === "budget") return "What budget should I respect? I won’t show Rs.15,000 drama for a Rs.3,000 plan.";
  if (first === "location") return "Which city should this reach? City is enough for now.";
  if (first === "deliveryDate") return "When should it arrive — today, tomorrow, or a specific date?";
  if (first === "isGift") return "Is this a gift? If yes, I’ll include message and presentation ideas.";
  return `Tell me ${fieldLabels[first]} and I’ll narrow it down.`;
}

export function buildDecisionTrace(decision: Omit<OrchestratorDecision, "trace">, context: ShopperContext): DecisionTrace {
  const constraints = [
    context.budget ? `budget ${formatLkr(context.budget)}` : "budget unknown",
    context.location ? `city ${context.location}` : "city unknown",
    context.deliveryDate ? `delivery ${context.deliveryDate}` : "date unknown",
    context.recipient ? `recipient ${context.recipient}` : "recipient unknown"
  ];
  return {
    title: "Liya’s plan",
    rows: [
      { label: "Mood", value: decision.memory.emotionalIntent },
      { label: "Plan", value: decision.strategy.label },
      { label: "Focus", value: decision.strategy.boosts.slice(0, 2).join(" + ") },
      { label: "Fit", value: constraints.filter((c) => !c.includes("unknown")).join(" · ") || "I need one more detail" }
    ],
    bullets: [
      decision.memory.preferences.length ? `Matched: ${decision.memory.preferences.slice(0, 2).join(" + ")}` : `Matched: ${decision.strategy.label}`,
      `Filtered: ${decision.strategy.avoids[0]}`,
      decision.strategy.priority === "speed" ? "Priority: delivery safety" : decision.strategy.priority === "budget" ? "Priority: budget comfort" : "Priority: emotional impact"
    ],
    warnings: [...decision.conflicts.map((c) => `${c.message} ${c.resolution}`), ...decision.uncertainty].slice(0, 2)
  };
}

export function decide(input: string, context: ShopperContext, memory?: UserMemory): OrchestratorDecision {
  const nextMemory = extractMemory(input, memory);
  const lower = input.toLowerCase();
  const missing = missingFields(context);
  const strategy = buildStrategy(context, nextMemory, input);
  const conflicts = detectConflicts(input, context, nextMemory);
  const uncertainty = uncertaintySignals(context, nextMemory, input);
  const anchor = detectAnchor(input, context);
  let intent: OrchestratorDecision["intent"] = anchor?.kind === "technical" || anchor?.kind === "chaos" || anchor?.kind === "comparison" ? "anchor" : "question";
  if (anchor?.kind === "technical" || anchor?.kind === "chaos" || anchor?.kind === "comparison") intent = "anchor";
  else if (anchor?.kind === "off_catalog" || anchor?.kind === "topic_switch") intent = "search";
  else if (/demo mode|judge|run demo/i.test(input)) intent = "demo";
  else if (/track|order status/i.test(input)) intent = "track";
  else if (/checkout|pay|payment/i.test(input)) intent = "checkout";
  else if (/reorder|buy again/i.test(input)) intent = "reorder";
  else if (/trending|popular|best sellers|hot/i.test(input)) intent = "trend";
  else if (/recommend|show|find|search|bundle|plan|gift|cake|flower|chocolate|wife|mother|amma|birthday|anniversary|apology|urgent|forgot|angry|sorry|cheap|premium|phone|electronics|prioritize speed|prioritize emotion|emotional impact/i.test(lower) && missing.length <= 4) intent = conflicts.length && !/prioritize speed|prioritize emotion|emotional impact/i.test(lower) ? "question" : "search";

  const tone = toneLead(nextMemory.emotionalIntent, context.language);
  const followUp = intent === "question" ? smartQuestion(context, nextMemory, strategy, conflicts) : undefined;
  const base = anchor?.searchHint ?? (intent === "trend" ? "popular trending gifts flowers cakes chocolates Sri Lanka" : buildSearchQuery(context));
  const pref = nextMemory.preferences.join(" ");
  const strategyTerms = strategy.boosts.join(" ");
  const searchQueries = Array.from(new Set([
    `${base} ${pref} ${strategyTerms}`.trim(),
    `${context.occasion ?? strategy.label} ${context.recipient ?? "family"} ${pref} under ${context.budget ?? ""}`.trim(),
    strategy.id === "relationship_repair" ? "apology roses chocolate sorry card gift" : strategy.id === "urgent_delivery" ? "same day delivery cake flowers gift" : strategy.id === "comfort_care" ? "get well fruit flowers comfort gift" : "best selling gift Sri Lanka"
  ])).slice(0, 3);

  const microAdjustment = anchor?.kind === "topic_switch" ? "Let me adjust that quietly." : conflicts.length ? "Tiny tradeoff here — I’ll keep it practical." : uncertainty.length ? "I’ll keep one assumption loose." : undefined;
  const withoutTrace = { intent, missing, memory: nextMemory, strategy, conflicts, uncertainty, searchQueries, followUp, assistantLead: tone, anchor, microAdjustment };
  return { ...withoutTrace, trace: buildDecisionTrace(withoutTrace, context) };
}

export function toneLead(intent: EmotionalIntent, language: Language = "en") {
  const local = language === "tanglish" ? "hari, " : "";
  switch (intent) {
    case "apology": return `${local}That sounds stressful — but fixable. I’ll keep this gentle, sincere, and quick.`;
    case "urgent": return `${local}Aiyo, timing is the main character now. I’ll prioritize safer delivery choices first.`;
    case "romantic": return `${local}Let’s make it feel personal, not generic. Flowers plus a small sweet touch usually works beautifully.`;
    case "sympathy": return `${local}I’ll keep this soft, respectful and comforting.`;
    case "celebration": return `${local}Lovely — let’s make it feel happy, generous and still sensible on budget.`;
    default: return `${local}Got it. I’ll think like a practical Sri Lankan friend, not a product grid.`;
  }
}

export function rankProducts(products: Product[], context: ShopperContext, memory: UserMemory, strategy?: StrategyPolicy) {
  const policy = strategy ?? buildStrategy(context, memory, "");
  const budget = context.budget;
  return [...products]
    .filter((p) => !budget || !p.price || p.price <= budget * (policy.id === "relationship_repair" ? 1.22 : 1.12))
    .map((p) => {
      const text = `${p.name} ${p.category ?? ""} ${p.description ?? ""} ${p.deliveryNote ?? ""}`.toLowerCase();
      let score = deliveryScore(p, context);
      if (p.price && budget) score += Math.max(0, policy.weights.budget - Math.abs(budget - p.price) / Math.max(budget, 1) * policy.weights.budget);
      for (const pref of memory.preferences) if (text.includes(pref.toLowerCase())) score += policy.weights.memory;
      for (const signal of (memory.styleSignals ?? [])) {
        if (signal === "minimal" && /simple|elegant|classic|small|single|rose|bouquet/.test(text)) score += 12;
        if (signal === "minimal" && /grand|mega|large|luxury|party/.test(text)) score -= 18;
        if (signal === "premium" && /premium|luxury|rose|orchid|deluxe|signature/.test(text)) score += 12;
      }
      for (const bad of memory.dislikes) if (text.includes(bad.toLowerCase())) score -= 60;
      for (const boost of policy.boosts) if (text.includes(boost.toLowerCase())) score += policy.weights.emotion / 2;
      for (const avoid of policy.avoids) if (text.includes(avoid.toLowerCase())) score -= 18;
      if (/flower|rose|cake|chocolate|gift|hamper|bouquet|card/.test(text)) score += policy.weights.presentation / 2;
      if (policy.id === "relationship_repair" && /rose|flower|chocolate|card|sorry|love/.test(text)) score += 20;
      if (policy.id === "urgent_delivery" && /same day|today|express|in stock/.test(text)) score += 22;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p)
    .slice(0, 12);
}

export function contrastReason(product: Product, context: ShopperContext, memory?: UserMemory, strategy?: StrategyPolicy) {
  const policy = strategy ?? buildStrategy(context, memory ?? emptyMemory(), "");
  if (policy.id === "relationship_repair") return "I’m avoiding generic/practical gifts here because the goal is emotional repair, not utility.";
  if (policy.id === "urgent_delivery") return "I’m avoiding custom-looking items because fast delivery certainty matters more right now.";
  if (memory?.styleSignals?.includes("minimal")) return "I’m avoiding flashy alternatives because your memory says minimal/simple.";
  if (context.budget) return "I’m filtering out options that look impressive but create budget stress.";
  return "I’m choosing this over random catalog items because it better matches the story you gave me.";
}

export function getEmotionalLine(context: ShopperContext, product: Product, strategy?: StrategyPolicy) {
  const policy = strategy ?? buildStrategy(context, emptyMemory(), "");
  const name = product.name.toLowerCase();
  if (policy.id === "relationship_repair") return "This softens the moment without making it feel like you’re trying too hard.";
  if (policy.id === "urgent_delivery") return "Safe choice when time is tight and you still want it to feel thoughtful.";
  if (policy.id === "romantic_signal") return "This feels personal enough to make them pause and smile.";
  if (policy.id === "comfort_care") return "This feels gentle — more like care than a transaction.";
  if (policy.id === "celebration_impact") return /cake|chocolate|flower|rose/.test(name) ? "This feels like something they’ll enjoy opening in front of everyone." : "This feels personal without being too formal.";
  if (/chocolate|rose|flower|cake/.test(name)) return "This feels like something they’ll actually smile at when they open it.";
  return "This is a safe, thoughtful pick without adding extra drama.";
}

export function productTrust(product: Product, context: ShopperContext, strategy?: StrategyPolicy): { label: string; tone: "green" | "amber" | "blue" } {
  if (context.budget && product.price && product.price > context.budget) return { label: strategy?.id === "relationship_repair" ? "Thoughtful stretch" : "Budget stretch", tone: "amber" };
  if (!context.location || !context.deliveryDate) return { label: "Verify delivery", tone: "blue" };
  if (product.inStock === false) return { label: "Check stock", tone: "amber" };
  return { label: "Safe-to-buy", tone: "green" };
}

export function explanationBadges(product: Product, context: ShopperContext, memory?: UserMemory, strategy?: StrategyPolicy) {
  const policy = strategy ?? buildStrategy(context, memory ?? emptyMemory(), "");
  const text = `${product.name} ${product.description ?? ""} ${product.category ?? ""}`.toLowerCase();
  const badges: string[] = [];
  if (context.occasion) badges.push(`Matched: ${context.occasion}`);
  const pref = memory?.preferences.find((p) => text.includes(p.toLowerCase()));
  if (pref) badges.push(`Boosted: ${pref}`);
  if (context.deliveryDate || context.location) badges.push("Filtered: delivery risk");
  if (context.budget) badges.push(product.price && product.price <= context.budget ? "Budget-safe" : policy.id === "relationship_repair" ? "Slight stretch" : "Budget check");
  if (!badges.length) badges.push(`Plan: ${policy.label}`);
  return badges.slice(0, 3);
}

export function explainProduct(product: Product, context: ShopperContext, memory?: UserMemory, index = 0, strategy?: StrategyPolicy) {
  const reasons: string[] = [];
  const policy = strategy ?? buildStrategy(context, memory ?? emptyMemory(), "");
  if (context.budget && product.price) reasons.push(product.price <= context.budget ? `fits your ${formatLkr(context.budget)} budget` : `is slightly above budget, but acceptable for ${policy.label}`);
  else if (context.budget) reasons.push(`keeps your ${formatLkr(context.budget)} budget in mind`);
  if (context.occasion) reasons.push(`matches the ${context.occasion} mood`);
  if (context.location || context.deliveryDate) reasons.push(fallbackDeliveryCopy(context));
  const pref = memory?.preferences.find((p) => `${product.name} ${product.description ?? ""}`.toLowerCase().includes(p.toLowerCase()));
  if (pref) reasons.push(`uses your memory that they like ${pref}`);
  reasons.push(contrastReason(product, context, memory, policy));
  if (index === 0) reasons.push("my best pick from this shelf");
  return reasons.slice(0, 5);
}

export function computeConvergenceState(context: ShopperContext, cartCount = 0) {
  const known = [context.recipient, context.occasion, context.budget, context.location, context.deliveryDate, context.isGift !== undefined].filter(Boolean).length;
  const completeness = Math.round((known / 6) * 100);
  const missing = missingFields(context);
  const readyForCheckout = cartCount > 0 && known >= 4;
  const summary = [
    context.occasion ? `${context.occasion}` : undefined,
    context.recipient ? `for ${context.recipient}` : undefined,
    context.budget ? `around ${formatLkr(context.budget)}` : undefined,
    context.location ? `to ${context.location}` : undefined,
    context.deliveryDate ? `on ${context.deliveryDate}` : undefined
  ].filter(Boolean).join(" · ");
  const nextStep = readyForCheckout ? "review cart and create the payment link" : missing[0] ? `confirm ${fieldLabels[missing[0]]}` : "add the best pick to cart";
  return { completeness, missing, readyForCheckout, summary: summary || "gift plan forming", nextStep };
}

export function getDelightSignal(context: ShopperContext, products: Product[] = []) {
  const top = products[0];
  const prediction = context.occasion ? `Looks like ${context.occasion} shopping 👀` : context.recipient ? `Looks like a gift for ${context.recipient} 👀` : "Looks like a gift plan forming 👀";
  const confirmation = top ? "I found one safe standout here." : "I’m narrowing this before showing anything random.";
  const standout = top ? `If you want me to choose instantly: ${top.name} is the safest pick.` : "If you want speed, I’ll choose the safest gift lane first.";
  return { prediction, confirmation, standout };
}

export function stableShelf(ranked: Product[], previous: Product[], context: ShopperContext) {
  if (!previous.length) return ranked;
  const rankedMap = new Map(ranked.map((product) => [product.id, product]));
  const stillValid = previous.filter((product) => rankedMap.has(product.id) && (!context.budget || !product.price || product.price <= context.budget * 1.25)).slice(0, 4);
  const fresh = ranked.filter((product) => !stillValid.some((existing) => existing.id === product.id));
  return [...stillValid, ...fresh].slice(0, 12);
}

export function responseContract(parts: { intent: string; action: string; next: string }) {
  const clean = (value: string) => value.replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
  return `Got it — ${clean(parts.intent)}.\nI’ll ${clean(parts.action)}.\nNext: ${clean(parts.next)}.`;
}

export function contractForDecision(decision: OrchestratorDecision, options: { topName?: string; count?: number; delivery?: string; recovery?: boolean; standout?: string; convergenceNext?: string } = {}) {
  if (decision.intent === "anchor") return responseContract({ intent: decision.anchor?.message ?? "I’ll keep us on the shopping path", action: "use the safest gift lane instead of drifting", next: "choose Gift finder or tell me who it is for" });
  if (decision.intent === "track") return responseContract({ intent: "tracking is the job now", action: "open the order timeline once you share the order number", next: "send the Kapruka order number" });
  if (decision.intent === "reorder") return responseContract({ intent: "buy-again is easier from your recent items", action: "take you to the review page with reorder choices", next: "open Review" });
  if (decision.intent === "question") return responseContract({ intent: decision.strategy.label, action: decision.followUp ?? "ask only the missing detail", next: "answer that one detail" });
  if (options.recovery) return responseContract({ intent: "live results are slow", action: "keep your cart and story safe with safer substitutes", next: "try flowers, chocolate hampers, or a wider delivery date" });
  const top = options.standout ?? (options.topName ? `“${options.topName}” looks like the safest first pick` : "I found a safer shelf");
  const delivery = options.delivery ? ` ${options.delivery}` : "";
  return responseContract({ intent: decision.strategy.label, action: `${top}${delivery}`, next: options.convergenceNext ?? (options.count ? `compare ${Math.min(options.count, 3)} picks or add the best one` : "compare picks or add the best one") });
}

export function advisorSummary(products: Product[], context: ShopperContext, memory: UserMemory, strategy?: StrategyPolicy) {
  const top = products[0];
  const policy = strategy ?? buildStrategy(context, memory, "");
  if (!top) return "I couldn’t find a clean match. I’ll try broader alternatives instead of leaving you stuck.";
  const pref = memory.preferences.length ? ` I remembered: ${memory.preferences.join(", ")}.` : "";
  const why = policy.id === "relationship_repair" ? "it feels thoughtful without looking panicked" : policy.id === "urgent_delivery" ? "it keeps delivery risk low" : policy.id === "celebration_impact" ? "it feels festive and complete" : "it fits the story cleanly";
  return `${toneLead(memory.emotionalIntent, context.language)} My top pick is “${top.name}” because ${why}.${pref}`;
}

export function comparisonRows(products: Product[], context: ShopperContext) {
  return products.slice(0, 3).map((p, i) => ({
    name: p.name,
    price: formatLkr(p.price, p.currency),
    delivery: context.location ? `Check ${context.location}; ${i === 0 ? "safest pick" : "verify before pay"}` : "City needed",
    bestFor: i === 0 ? "Best overall" : i === 1 ? "Budget backup" : "Presentation",
    tradeoff: p.price && context.budget && p.price > context.budget ? "Over budget" : i === 0 ? "Fewest tradeoffs" : "Good but less aligned"
  }));
}
