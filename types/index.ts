export type Language = "en" | "si" | "ta" | "tanglish";
export type Currency = "LKR" | "USD" | "AUD" | "GBP" | "EUR";

export type ProductTrust = "safe" | "verify" | "fallback" | "stretch";
export type ReliabilityMode = "live" | "degraded" | "fallback";

export type Product = {
  id: string;
  name: string;
  price?: number;
  currency?: Currency | string;
  image?: string;
  images?: string[];
  url?: string;
  category?: string;
  description?: string;
  inStock?: boolean;
  rating?: number;
  deliveryNote?: string;
  trust?: ProductTrust;
  variants?: Array<{ id: string; name: string; price?: number }>;
  raw?: unknown;
};

export type CartItem = {
  product: Product;
  quantity: number;
  note?: string;
};

export type ChatRole = "assistant" | "user" | "system";
export type DecisionTrace = {
  title: string;
  rows: Array<{ label: string; value: string }>;
  bullets: string[];
  warnings?: string[];
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  language?: Language;
  chips?: string[];
  decisionTrace?: DecisionTrace;
};

export type ShopperContext = {
  recipient?: string;
  occasion?: string;
  budget?: number;
  location?: string;
  deliveryDate?: string;
  isGift?: boolean;
  language: Language;
};

export type DeliveryQuote = {
  available: boolean;
  city?: string;
  date?: string;
  fee?: number;
  warning?: string;
  cutoff?: string;
  raw?: unknown;
};

export type CheckoutInput = {
  recipient: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  sender: {
    name: string;
    email: string;
    phone: string;
  };
  delivery: {
    date: string;
    city: string;
    instructions?: string;
  };
  giftMessage?: string;
  currency: Currency;
};

export type OrderResult = {
  orderNumber?: string;
  paymentUrl?: string;
  status?: string;
  expiresAt?: string;
  raw?: unknown;
};

export type TrackingStage = {
  label: string;
  at?: string;
  status: "done" | "current" | "upcoming";
  note?: string;
};

export type TrackingResult = {
  orderNumber: string;
  status: string;
  recipient?: string;
  items?: Array<{ name: string; quantity: number }>;
  stages: TrackingStage[];
  raw?: unknown;
};
