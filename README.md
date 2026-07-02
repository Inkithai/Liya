# Liya — Your Sri Lankan Shopping Friend

Competition-ready frontend for **Kapruka Agent Challenge 2026**.

Liya is a full-screen AI shopping experience on top of the hosted Kapruka MCP server. It is intentionally **not** a backend, not an MCP server, and not a fork of Kapruka infrastructure.

## Folder structure

```txt
app/
  page.tsx                 # occasion-first landing page
  shop/page.tsx            # main full-screen AI shopping experience
  checkout/page.tsx        # checkout + delivery + payment link flow
  review/page.tsx          # order summary + reorder surface
  track/page.tsx           # order tracking timeline
  not-found.tsx            # polished 404
components/
  cart/FloatingCart.tsx
  chat/ChatPanel.tsx
  chat/TypingIndicator.tsx
  layout/Header.tsx
  layout/Logo.tsx
  product/ProductCard.tsx
  product/ProductShelf.tsx
  ui/Button.tsx
  ui/Card.tsx
  ui/EmptyState.tsx
  ui/Skeleton.tsx
hooks/
lib/
  language.ts              # Sinhala/Tamil/Tanglish detection helpers
  mcp.ts                   # isolated Kapruka MCP client
  personality.ts           # Liya guided flow + recommendation reasons
  utils.ts
store/
  useAppStore.ts           # Zustand cart/chat/products/session/preferences
styles/
types/
  index.ts
```

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## MCP endpoint configuration

Runtime uses only the hosted Kapruka MCP endpoint:

```txt
https://mcp.kapruka.com/mcp
```

You can override it for environments without changing code:

```bash
NEXT_PUBLIC_KAPRUKA_MCP_ENDPOINT=https://mcp.kapruka.com/mcp
```

Do not point this app at a forked MCP server for the challenge.

## How MCP integration works

All MCP logic is isolated in `lib/mcp.ts`.

Implemented requirements:

- Streamable HTTP JSON-RPC client
- session initialization via `initialize`
- session reuse with `mcp-session-id`
- initialized notification
- tool discovery through `tools/list`
- tool execution through `tools/call`
- timeout handling with `AbortController`
- exponential retry
- request deduplication for identical in-flight tool calls
- safe response parsing for JSON and SSE responses
- safe tool-result unwrapping from MCP `content` / `structuredContent`
- normalized frontend types for products, delivery, orders and tracking
- error normalization with `McpError`

Exposed functions:

- `searchProducts()` → `kapruka_search_products`
- `getProduct()` → `kapruka_get_product`
- `listCategories()` → `kapruka_list_categories`
- `checkDelivery()` → `kapruka_check_delivery`
- `createOrder()` → `kapruka_create_order`
- `trackOrder()` → `kapruka_track_order`

The frontend treats MCP as a black-box commerce intelligence layer and never reimplements Kapruka backend logic.

## Key architecture

```txt
Browser UI (Liya)
  ↓
Next.js 15 App Router frontend
  ↓
lib/mcp.ts MCP client
  ↓
https://mcp.kapruka.com/mcp
  ↓
Kapruka backend
```

## Product experience

- Landing page is occasion-first, not catalog-first.
- Shopping page uses desktop tri-pane layout:
  - left: Liya conversation
  - center: persistent visual product shelf
  - right: floating cart
- **Demo Mode** provides a forced judge story path: emotional occasion → budget → city/date → parallel MCP search → recommendations → cart → checkout.
- Liya asks smart follow-up questions before recommending:
  - who it is for
  - budget
  - occasion
  - location
  - delivery date
  - gift or not
- **Orchestrator brain** in `lib/orchestrator.ts` decides intent, missing fields, memory, emotional tone, parallel search queries, ranking and response formatting.
- **Strategy transformation layer** turns classification into policy: apology becomes relationship-repair, urgency becomes delivery-rescue, celebration becomes impact planning.
- **Compact Plan UI** makes Liya’s thinking visible without feeling overbuilt: mood, plan, focus and 2–3 visual chips only.
- **Guaranteed response contract** keeps every recovery/search response in the same 3-line shape: intent handling, action, next step.
- **Flow anchoring** handles judge chaos such as API questions, Amazon comparisons, cheap phones, emoji spam and rapid topic switching, while gently returning to a shopping state.
- **Strategy throttling** prevents over-reactive personality shifts; Liya only surfaces plan changes when they matter.
- **Ranking stability** preserves overlapping shelf items during budget/occasion edits, so the UI feels confident instead of jumpy.
- **Conflict handling** catches requests like “cheap but premium”, “fast but low budget”, chaos input and multi-person gifts, then gently guides back to the occasion path.
- Product reasoning is short and visual: “Matched”, “Boosted”, “Filtered”, “Budget-safe” instead of long analytical paragraphs.
- **Emotional product translation** adds one human-life line per product, e.g. “This softens the moment without making it feel like you’re trying too hard.”
- **Micro-delight signals** predict intent while typing, celebrate a safe result when MCP returns, and name one standout safest pick.
- **Checkout convergence gravity** tracks readiness, locks known details silently, and nudges toward shortlist/cart/payment without feeling pushy.
- **Trust semantics** mark products as “Safe-to-buy”, “Verify delivery”, or “Budget stretch” so results feel reliable without extra reading.
- **Soft state evolution** lets users change birthday → anniversary → apology without hard resets; Liya adjusts the shelf quietly.
- Delivery promises are formatted in human language through `lib/delivery.ts` instead of raw availability text.
- Conversation memory remembers preferences such as “mom likes chocolate” and uses them later.
- Emotional intent detection adapts tone for apology, urgency, romance, sympathy and celebration.
- Voice input and voice output are available in supporting browsers.
- First-keystroke shelf priming and skeletons create an instantness illusion while MCP warms up.
- Slow MCP calls degrade gracefully: Liya uses partial results, retries a safer trending shelf, and never fakes checkout-only products.
- Speed timer makes the two-minute checkout goal visible during demo.
- Cart supports multiple products, mobile cart bar and quantity control.
- Checkout creates a Kapruka guest order and payment link through MCP, then shows a confetti moment.
- Checkout can generate a gift message using Liya memory.
- Tracking page turns order status into a timeline.

## Multilingual behavior

`lib/language.ts` auto-detects:

- English
- Sinhala script
- Tamil script
- conversational Tanglish/Singlish words

Liya changes tone for local conversation and includes Sri Lankan warmth without becoming robotic.

## Vercel deployment

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Framework preset: **Next.js**.
4. Node version: **20.x or newer**.
5. Add environment variable if desired:

```txt
NEXT_PUBLIC_KAPRUKA_MCP_ENDPOINT=https://mcp.kapruka.com/mcp
```

6. Deploy.

Because the app is a pure frontend consumer of the hosted MCP endpoint, no database, vector store, RAG pipeline, queue or custom backend service is required.

## Demo script for judges

Fastest winning path:

1. Open `/shop`.
2. Click **Demo Mode**.
3. Liya runs the judge story automatically:

```txt
I forgot my wife's birthday. Apology gift, she likes chocolate and roses, Kandy tomorrow, budget Rs. 5000, gift
```

4. Watch Liya:
   - detect emotional intent
   - transform the strategy into relationship-repair mode
   - show a visible decision trace
   - remember chocolate / roses
   - run parallel Kapruka MCP searches
   - rank products by budget, memory, strategy and delivery risk
   - keep the shelf persistent
   - add the best pick to cart
   - show speed timer
5. Compare the top products.
6. Go to checkout.
7. Click **Generate with Liya memory** for a gift message.
8. Check delivery.
9. Create payment link.
10. Open tracking and enter an order number.

Manual demo prompt:

```txt
Amma birthday, she likes chocolate, Kandy tomorrow, under Rs. 8000, gift
```

