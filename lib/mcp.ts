import type { CheckoutInput, Currency, DeliveryQuote, OrderResult, Product, TrackingResult } from"@/types";
import { compact, sleep } from"./utils";

const MCP_ENDPOINT = typeof window !=="undefined" ?"/api/mcp" : (process.env.KAPRUKA_MCP_ENDPOINT ||"https://mcp.kapruka.com/mcp");
const PROTOCOL_VERSION ="2024-11-05";

type JsonRpcRequest = { jsonrpc:"2.0"; id?: number; method: string; params?: unknown };
type JsonRpcResponse<T = unknown> = { jsonrpc:"2.0"; id?: number; result?: T; error?: { code: number; message: string; data?: unknown } };
type ToolContent = { type?: string; text?: string; json?: unknown; [key: string]: unknown };
type ToolResult = { content?: ToolContent[]; structuredContent?: unknown; isError?: boolean; [key: string]: unknown };

type McpClientOptions = { endpoint?: string; timeoutMs?: number; retries?: number };

class McpError extends Error {
 code?: number;
 data?: unknown;
 constructor(message: string, code?: number, data?: unknown) {
 super(message);
 this.name ="McpError";
 this.code = code;
 this.data = data;
 }
}

function stableKey(value: unknown): string {
 if (value === null || typeof value !=="object") return JSON.stringify(value);
 if (Array.isArray(value)) return `[${value.map(stableKey).join(",")}]`;
 return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stableKey(v)}`).join(",")}}`;
}

function parseSse(text: string): unknown {
 const data = text.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
 if (!data) return undefined;
 return JSON.parse(data);
}

async function parseResponse<T>(response: Response): Promise<JsonRpcResponse<T> | undefined> {
 const contentType = response.headers.get("content-type") ||"";
 const body = await response.text();
 if (!body.trim()) return undefined;
 if (contentType.includes("text/event-stream") || body.startsWith("event:")) return parseSse(body) as JsonRpcResponse<T>;
 return JSON.parse(body) as JsonRpcResponse<T>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
 return Boolean(value && typeof value ==="object" && !Array.isArray(value));
}

function toNumber(value: unknown): number | undefined {
 if (typeof value ==="number") return Number.isFinite(value) ? value : undefined;
 if (typeof value ==="string") {
 const cleaned = value.replace(/[^0-9.]/g,"");
 if (!cleaned) return undefined;
 const parsed = Number(cleaned);
 return Number.isFinite(parsed) ? parsed : undefined;
 }
 return undefined;
}

function parsePrice(raw: unknown): number | undefined {
 const direct = toNumber(raw);
 if (direct !== undefined) return direct;
 if (isRecord(raw)) {
 for (const key of ["amount","value","price","sale_price","lkr_price","LKR","lkr"]) {
 const parsed = parsePrice(raw[key]);
 if (parsed !== undefined) return parsed;
 }
 }
 return undefined;
}

function parseCurrency(item: Record<string, unknown>, fallback: Currency | string ="LKR") {
 if (typeof item.currency ==="string") return item.currency as Currency | string;
 const price = item.price;
 if (isRecord(price) && typeof price.currency ==="string") return price.currency as Currency | string;
 return fallback;
}

function parseCategory(value: unknown): string | undefined {
 if (typeof value ==="string") return value;
 if (isRecord(value)) return String(value.name ?? value.title ?? value.slug ?? value.id ??"") || undefined;
 return undefined;
}

function normalizeVariant(raw: unknown): { id: string; name: string; price?: number } | undefined {
 if (!isRecord(raw)) return undefined;
 const id = String(raw.id ?? raw.sku ?? raw.code ?? raw.name ?? crypto.randomUUID());
 return {
 id,
 name: String(raw.name ?? raw.title ?? id),
 price: parsePrice(raw.price ?? raw.sale_price ?? raw.amount ?? raw.lkr_price)
 };
}

function normalizeProduct(raw: unknown): Product {
 const item = isRecord(raw) ? raw : {};
 const id = String(item.id ?? item.product_id ?? item.productId ?? item.code ?? item.sku ?? item.url ?? crypto.randomUUID());
 const images = [item.image, item.image_url, item.thumbnail, item.photo, ...(Array.isArray(item.images) ? item.images : [])].filter(Boolean).map(String);
 const price = parsePrice(item.price ?? item.sale_price ?? item.amount ?? item.lkr_price);
 const category = parseCategory(item.category);
 return {
 id,
 name: String(item.name ?? item.title ?? item.product_name ??"Kapruka product"),
 price: Number.isFinite(price ?? NaN) ? price : undefined,
 currency: parseCurrency(item),
 image: images[0],
 images,
 url: item.url ? String(item.url) : item.product_url ? String(item.product_url) : undefined,
 category,
 description: item.description ? String(item.description) : item.summary ? String(item.summary) : undefined,
 inStock: typeof item.in_stock ==="boolean" ? item.in_stock : typeof item.inStock ==="boolean" ? item.inStock : undefined,
 rating: typeof item.rating ==="number" ? item.rating : undefined,
 deliveryNote: item.delivery_note ? String(item.delivery_note) : item.ships_internationally ?"Ships internationally" : undefined,
 variants: Array.isArray(item.variants) ? item.variants.map(normalizeVariant).filter((v): v is { id: string; name: string; price?: number } => Boolean(v)) : undefined,
 raw
 };
}

function extractJsonFromText(text: string): unknown {
 const trimmed = text.trim();
 if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
 try { return JSON.parse(trimmed); } catch { return text; }
 }
 const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
 if (fenced) {
 try { return JSON.parse(fenced[1]); } catch { return text; }
 }
 return text;
}

function unwrapToolResult(result: ToolResult | unknown): unknown {
 const tool = result as ToolResult;
 const content = tool?.content;
 if (tool?.isError) {
 const message = Array.isArray(content) ? content.map((entry) => entry.text ?? JSON.stringify(entry.json ?? entry)).join("\n") : "Kapruka MCP tool returned an error";
 throw new McpError(message);
 }
 if (tool?.structuredContent) return tool.structuredContent;
 if (!Array.isArray(content)) return result;
 const parsed = content.map((entry) => entry.json ?? (entry.text ? extractJsonFromText(entry.text) : entry));
 return parsed.length === 1 ? parsed[0] : parsed;
}

function unwrapResultField(result: unknown): unknown {
 const root = unwrapToolResult(result);
 if (isRecord(root) && "result" in root && Object.keys(root).length === 1) {
 const value = root.result;
 return typeof value ==="string" ? extractJsonFromText(value) : value;
 }
 return root;
}

function productFromDetailMarkdown(markdown: string): Product | undefined {
 const title = markdown.match(/^##\s+(.+)$/m);
 const id = markdown.match(/\*\*ID\*\*:\s*`([^`]+)`/i);
 const price = markdown.match(/\*\*Price\*\*:\s*(?:LKR|Rs\.?|රු)\s*([0-9,]+(?:\.\d+)?)/i);
 const stock = markdown.match(/\*\*Stock\*\*:\s*([^\n]+)/i);
 const category = markdown.match(/\*\*Category\*\*:\s*([^\n]+)/i);
 const image = markdown.match(/\*\*Image\*\*:\s*(https?:\/\/\S+)/i);
 const url = markdown.match(/\[View on Kapruka\]\((https?:\/\/[^)]+)\)/i);
 if (!title || !id) return undefined;
 return {
 id: id[1],
 name: title[1].trim(),
 price: price ? Number(price[1].replace(/,/g,"")) : undefined,
 currency:"LKR",
 image: image?.[1],
 images: image?.[1] ? [image[1]] : undefined,
 url: url?.[1],
 category: category?.[1]?.trim(),
 inStock: stock ? /in stock/i.test(stock[1]) : undefined,
 deliveryNote: /international shipping\*\*:\s*yes/i.test(markdown) ?"Ships internationally" : undefined,
 description: markdown.split(/\n\n/).slice(1).join("\n\n").replace(/\*\*Image\*\*:[\s\S]*$/i,"").replace(/\s+/g," ").trim().slice(0, 260),
 raw: markdown
 };
}

function productsFromMarkdown(markdown: string): Product[] {
 const products: Product[] = [];
 const blocks = markdown.split(/\n\n(?=\*\*\d+\.)/g);
 for (const block of blocks) {
 const title = block.match(/\*\*\d+\.\s+(.+?)\*\*/);
 const id = block.match(/ID:\s*`([^`]+)`/i);
 const price = block.match(/(?:LKR|Rs\.?|රු)\s*([0-9,]+(?:\.\d+)?)/i);
 const url = block.match(/\[View product\]\((https?:\/\/[^)]+)\)/i);
 if (!title || !id) continue;
 products.push({
 id: id[1],
 name: title[1].trim(),
 price: price ? Number(price[1].replace(/,/g,"")) : undefined,
 currency:"LKR",
 url: url?.[1],
 category:"Kapruka",
 inStock: /in stock/i.test(block),
 deliveryNote: /ships internationally/i.test(block) ?"Ships internationally" : undefined,
 description: block.replace(/\s+/g," ").trim().slice(0, 220),
 raw: block
 });
 }
 const detail = products.length ? undefined : productFromDetailMarkdown(markdown);
 return detail ? [detail] : products;
}

function extractProducts(data: unknown): Product[] {
 const root = unwrapResultField(data);
 const candidates: unknown[] = [];
 const read = (value: unknown): void => {
 if (typeof value ==="string") {
 const parsed = extractJsonFromText(value);
 if (parsed !== value) return read(parsed);
 candidates.push(...productsFromMarkdown(value));
 return;
 }
 if (Array.isArray(value)) {
 candidates.push(...value);
 return;
 }
 if (isRecord(value)) {
 for (const key of ["products","items","results","data"]) if (Array.isArray(value[key])) candidates.push(...(value[key] as unknown[]));
 for (const key of ["product","item"]) if (isRecord(value[key])) candidates.push(value[key]);
 for (const key of ["result","markdown","text"]) if (value[key] !== undefined) read(value[key]);
 const looksLikeProduct = value.id || value.product_id || value.productId || value.sku || value.url;
 if (looksLikeProduct && (value.name || value.title || value.product_name)) candidates.push(value);
 }
 };
 read(root);
 return Array.from(new Map(candidates.filter((x) => x && typeof x ==="object").map((x) => {
 const product = normalizeProduct(x);
 return [product.id, product] as const;
 })).values());
}

function extractProduct(data: unknown): Product {
 const products = extractProducts(data);
 if (products[0]) return products[0];
 return normalizeProduct(unwrapResultField(data));
}

export class KaprukaMcpClient {
 private endpoint: string;
 private timeoutMs: number;
 private retries: number;
 private sessionId?: string;
 private initPromise?: Promise<void>;
 private id = 1;
 private inFlight = new Map<string, Promise<unknown>>();
 private cache = new Map<string, { expires: number; value: unknown }>();
 private tools?: string[];

 constructor(options: McpClientOptions = {}) {
 this.endpoint = options.endpoint ?? MCP_ENDPOINT;
 this.timeoutMs = options.timeoutMs ?? 12000;
 this.retries = options.retries ?? 2;
 }

 async initialize() {
 if (this.sessionId) return;
 if (this.initPromise) return this.initPromise;
 this.initPromise = (async () => {
 const result = await this.request("initialize", {
 protocolVersion: PROTOCOL_VERSION,
 capabilities: {},
 clientInfo: { name:"Liya Kapruka Agent", version:"1.0.0" }
 }, false);
 void result;
 await this.notifyInitialized();
 })().finally(() => { this.initPromise = undefined; });
 return this.initPromise;
 }

 private async notifyInitialized() {
 try { await this.rawFetch({ jsonrpc:"2.0", method:"notifications/initialized", params: {} }); } catch { /* non-fatal */ }
 }

 private async rawFetch<T>(payload: JsonRpcRequest, attempt = 0): Promise<JsonRpcResponse<T> | undefined> {
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), this.timeoutMs);
 try {
 const response = await fetch(this.endpoint, {
 method:"POST",
 headers: compact({
"content-type":"application/json",
"accept":"application/json, text/event-stream",
"mcp-session-id": this.sessionId
 }) as HeadersInit,
 body: JSON.stringify(payload),
 signal: controller.signal,
 cache:"no-store"
 });
 const session = response.headers.get("mcp-session-id");
 if (session) this.sessionId = session;
 if (!response.ok) throw new McpError(`MCP ${response.status}: ${await response.text()}`, response.status);
 return await parseResponse<T>(response);
 } catch (error) {
 if (attempt < this.retries) {
 await sleep(350 * Math.pow(2, attempt));
 return this.rawFetch<T>(payload, attempt + 1);
 }
 if (error instanceof McpError) throw error;
 throw new McpError(error instanceof Error ? error.message :"Unknown MCP network error");
 } finally {
 clearTimeout(timer);
 }
 }

 private async request<T = unknown>(method: string, params?: unknown, ensureSession = true): Promise<T> {
 if (ensureSession) await this.initialize();
 const payload: JsonRpcRequest = { jsonrpc:"2.0", id: this.id++, method, params };
 const response = await this.rawFetch<T>(payload);
 if (!response) return undefined as T;
 if (response.error) throw new McpError(response.error.message, response.error.code, response.error.data);
 return response.result as T;
 }

 async listTools(): Promise<string[]> {
 await this.initialize();
 if (this.tools) return this.tools;
 const result = await this.request<{ tools?: Array<{ name: string }> }>("tools/list", {});
 this.tools = result.tools?.map((tool) => tool.name) ?? [];
 return this.tools;
 }

 async callTool<T = unknown>(name: string, args: Record<string, unknown> = {}): Promise<T> {
 await this.initialize();
 const key = stableKey({ name, args });
 const cacheable = !/create_order/i.test(name);
 const cached = cacheable ? this.cache.get(key) : undefined;
 if (cached && cached.expires > Date.now()) return cached.value as T;
 const existing = this.inFlight.get(key);
 if (existing) return existing as Promise<T>;
 const promise = this.request<ToolResult>("tools/call", { name, arguments: { params: args } }).then((r) => {
 const value = unwrapToolResult(r) as T;
 if (cacheable) {
 const ttl = /list_categories|list_delivery_cities/i.test(name) ? 30 * 60_000 : /track_order|check_delivery/i.test(name) ? 60_000 : 5 * 60_000;
 this.cache.set(key, { value, expires: Date.now() + ttl });
 }
 return value;
 }).finally(() => this.inFlight.delete(key));
 this.inFlight.set(key, promise);
 return promise;
 }

 async searchProducts(args: { q: string; category?: string; min_price?: number; max_price?: number; in_stock_only?: boolean; sort?: string; limit?: number; cursor?: string; currency?: Currency | string }) {
 const params = compact({ limit: 12, currency:"LKR", response_format:"json", ...args });
 const data = await this.callTool("kapruka_search_products", params);
 const products = await this.hydrateProductsWithMissingPrices(extractProducts(data), String(params.currency ??"LKR"));
 return { products, raw: data };
 }

 async getProduct(product_id: string, currency: Currency | string ="LKR") {
 const data = await this.callTool("kapruka_get_product", { product_id, currency, response_format:"json" });
 return { product: extractProduct(data), raw: data };
 }

 private async hydrateProductsWithMissingPrices(products: Product[], currency: Currency | string) {
 const needsPrice = products.filter((product) => !Number.isFinite(product.price ?? NaN) || (product.price ?? 0) <= 0).slice(0, 12);
 if (!needsPrice.length) return products;
 const details = await Promise.allSettled(needsPrice.map((product) => this.getProduct(product.id, currency)));
 const byId = new Map<string, Product>();
 details.forEach((result, index) => {
 if (result.status !=="fulfilled") return;
 const original = needsPrice[index];
 const detailed = result.value.product;
 if (Number.isFinite(detailed.price ?? NaN) && (detailed.price ?? 0) > 0) byId.set(original.id, detailed);
 });
 return products.map((product) => {
 const detailed = byId.get(product.id);
 if (!detailed) return product.price === 0 ? { ...product, price: undefined } : product;
 return {
 ...product,
 ...detailed,
 id: product.id,
 name: detailed.name || product.name,
 image: detailed.image || product.image,
 images: detailed.images?.length ? detailed.images : product.images,
 url: detailed.url || product.url,
 raw: { search: product.raw, detail: detailed.raw }
 };
 });
 }

 async listCategories(depth = 1) {
 const data = await this.callTool("kapruka_list_categories", { depth, response_format:"json" });
 const root = unwrapResultField(data);
 if (Array.isArray(root)) return root.map((x) => typeof x ==="string" ? x : String((x as Record<string, unknown>).name ?? (x as Record<string, unknown>).title ??"Category"));
 if (isRecord(root) && Array.isArray(root.categories)) return (root.categories as unknown[]).map((x) => typeof x ==="string" ? x : String((x as Record<string, unknown>).name ?? (x as Record<string, unknown>).title ??"Category"));
 return [];
 }

 async checkDelivery(city: string, delivery_date: string, product_id?: string): Promise<DeliveryQuote> {
 const data = await this.callTool("kapruka_check_delivery", compact({ city, delivery_date, product_id, response_format:"json" }));
 const root = unwrapResultField(data);
 const r = isRecord(root) ? root : {};
 return {
 available: Boolean(r.available ?? r.can_deliver ?? r.deliverable ?? true),
 city: String(r.city ?? city),
 date: String(r.delivery_date ?? r.checked_date ?? delivery_date),
 fee: typeof r.rate ==="number" ? r.rate : typeof r.fee ==="number" ? r.fee : undefined,
 warning: r.warning ? String(r.warning) : r.perishable_warning ? String(r.perishable_warning) : undefined,
 cutoff: r.cutoff ? String(r.cutoff) : undefined,
 raw: root
 };
 }

 async createOrder(input: CheckoutInput, cart: Array<{ product_id: string; quantity: number; note?: string }>): Promise<OrderResult> {
 const data = await this.callTool("kapruka_create_order", {
 cart: cart.map((item) => compact({ product_id: item.product_id, quantity: item.quantity, icing_text: item.note })),
 recipient: { name: input.recipient.name, phone: input.recipient.phone },
 delivery: compact({ address: input.recipient.address, city: input.delivery.city || input.recipient.city, date: input.delivery.date, instructions: input.delivery.instructions, location_type:"house" }),
 sender: { name: input.sender.name },
 gift_message: input.giftMessage,
 currency: input.currency,
 response_format:"json"
 });
 const root = unwrapResultField(data);
 const r = isRecord(root) ? root : {};
 return {
 orderNumber: r.order_number ? String(r.order_number) : r.orderNumber ? String(r.orderNumber) : r.order_ref ? String(r.order_ref) : undefined,
 paymentUrl: r.payment_url ? String(r.payment_url) : r.paymentUrl ? String(r.paymentUrl) : r.pay_url ? String(r.pay_url) : r.checkout_url ? String(r.checkout_url) : undefined,
 status: r.status ? String(r.status) : undefined,
 expiresAt: r.expires_at ? String(r.expires_at) : undefined,
 raw: root
 };
 }

 async trackOrder(order_number: string): Promise<TrackingResult> {
 const data = await this.callTool("kapruka_track_order", { order_number, response_format:"json" });
 const root = unwrapResultField(data);
 const r = isRecord(root) ? root : {};
 const rawStages = Array.isArray(r.timeline) ? r.timeline : Array.isArray(r.stages) ? r.stages : [];
 return {
 orderNumber: String(r.order_number ?? r.orderNumber ?? order_number),
 status: String(r.status ??"Processing"),
 recipient: r.recipient ? String(r.recipient) : undefined,
 items: Array.isArray(r.items) ? r.items as TrackingResult["items"] : undefined,
 stages: rawStages.length ? rawStages.map((s) => ({
 label: String((s as Record<string, unknown>).label ?? (s as Record<string, unknown>).status ??"Update"),
 at: (s as Record<string, unknown>).at ? String((s as Record<string, unknown>).at) : undefined,
 status:"done" as const,
 note: (s as Record<string, unknown>).note ? String((s as Record<string, unknown>).note) : undefined
 })) : [
 { label:"Order received", status:"done" },
 { label: String(r.status ??"Processing"), status:"current" },
 { label:"Out for delivery", status:"upcoming" },
 { label:"Delivered", status:"upcoming" }
 ],
 raw: root
 };
 }
}

let singleton: KaprukaMcpClient | undefined;
export function getMcpClient() {
 singleton ??= new KaprukaMcpClient();
 return singleton;
}

export const searchProducts = (args: Parameters<KaprukaMcpClient["searchProducts"]>[0]) => getMcpClient().searchProducts(args);
export const getProduct = (productId: string, currency?: Currency | string) => getMcpClient().getProduct(productId, currency);
export const listCategories = (depth?: number) => getMcpClient().listCategories(depth);
export const checkDelivery = (city: string, deliveryDate: string, productId?: string) => getMcpClient().checkDelivery(city, deliveryDate, productId);
export const createOrder = (input: CheckoutInput, cart: Array<{ product_id: string; quantity: number; note?: string }>) => getMcpClient().createOrder(input, cart);
export const trackOrder = (orderNumber: string) => getMcpClient().trackOrder(orderNumber);
