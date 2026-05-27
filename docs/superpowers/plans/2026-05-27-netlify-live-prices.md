# Netlify Live Prices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the trading journal deployable on Netlify and refresh holdings with free quote data using a resilient cached fallback.

**Architecture:** Add a small market-data layer that maps app symbols to Yahoo Finance symbols, fetches quotes through a Netlify function when available, falls back to direct Yahoo requests, and caches successful prices in localStorage. The React app keeps portfolio editing local, refreshes only held symbols, and labels each price as live, cached, or fallback.

**Tech Stack:** React, TypeScript, Vite, Vitest, Netlify static hosting, Netlify Functions.

---

### Task 1: Market Data Helpers

**Files:**
- Create: `src/lib/marketData.ts`
- Test: `src/lib/marketData.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
expect(toYahooSymbol("pttgc", "Thai")).toBe("PTTGC.BK");
expect(toYahooSymbol("BRK.B", "US")).toBe("BRK-B");
expect(parseYahooChartQuote(payload, "AAPL")?.price).toBe(261.74);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node node_modules/vitest/vitest.mjs run src/lib/marketData.test.ts`

- [ ] **Step 3: Implement helpers**

Implement `toYahooSymbol`, `parseYahooChartQuote`, quote cache load/save, and a `refreshPositionPrices` function that updates current prices with `live`, `cached`, or `fallback` status.

- [ ] **Step 4: Run tests**

Run: `node node_modules/vitest/vitest.mjs run src/lib/marketData.test.ts`

### Task 2: App Integration

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/HoldingsTable.tsx`
- Modify: `src/types.ts`
- Modify: `src/lib/positionsStorage.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Wire refresh lifecycle**

Call `refreshPositionPrices` when holdings symbols change and expose a manual refresh action.

- [ ] **Step 2: Label quote quality**

Show price status beside current price as `Live`, `Cached`, or `Fallback`.

- [ ] **Step 3: Keep storage backwards compatible**

Allow older saved holdings without price metadata to load normally.

### Task 3: Netlify Deployment

**Files:**
- Create: `netlify.toml`
- Create: `netlify/functions/quote.cjs`
- Modify: `vite.config.ts`

- [ ] **Step 1: Add Netlify config**

Publish `dist`, run `npm run build`, and redirect SPA routes to `index.html`.

- [ ] **Step 2: Add quote proxy function**

Fetch Yahoo chart data server-side and return only the normalized JSON fields the app needs.

- [ ] **Step 3: Verify**

Run tests and build. Start preview locally and inspect the app.
