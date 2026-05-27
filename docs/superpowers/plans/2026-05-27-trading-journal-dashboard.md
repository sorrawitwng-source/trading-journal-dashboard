# Trading Journal Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only trading journal dashboard where users add Thai or US stock positions by symbol and buy price, compare mock performance with benchmarks, and see ranked stock recommendations.

**Architecture:** Use a Vite React TypeScript app with isolated domain logic in `src/lib`, mock data in `src/data`, and presentational components in `src/components`. Keep portfolio calculations, validation, scoring, and benchmark helpers deterministic so they can be tested before wiring them into the UI.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, lucide-react, CSS modules or plain CSS, SVG-free chart built with semantic HTML/CSS.

---

## File Structure

- Create `package.json`: scripts and dependencies.
- Create `index.html`: Vite app shell.
- Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`: TypeScript and test config.
- Create `src/main.tsx`: React entrypoint.
- Create `src/App.tsx`: page composition and state wiring.
- Create `src/styles.css`: global layout, theme tokens, responsive dashboard styling.
- Create `src/types.ts`: shared domain types.
- Create `src/data/stocks.ts`: Thai and US mock stock universe.
- Create `src/data/benchmarks.ts`: mock benchmark series.
- Create `src/lib/validation.ts`: form validation.
- Create `src/lib/scoring.ts`: recommendation score and explanations.
- Create `src/lib/portfolio.ts`: position creation, P/L, and summary calculations.
- Create `src/lib/benchmarks.ts`: normalize chart series and derive portfolio performance.
- Create `src/components/TopBar.tsx`: app title, market filter, theme toggle.
- Create `src/components/PositionForm.tsx`: symbol and buy price form.
- Create `src/components/SummaryStrip.tsx`: portfolio metrics.
- Create `src/components/PerformanceChart.tsx`: mock comparison chart.
- Create `src/components/Recommendations.tsx`: ranked stock list.
- Create `src/components/HoldingsTable.tsx`: portfolio table and empty state.
- Create `src/lib/*.test.ts`: unit tests for validation, portfolio, scoring, benchmarks, and theme behavior.

## Tasks

### Task 1: Scaffold the Vite React App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create project metadata and scripts**

Add `package.json`:

```json
{
  "name": "trading-journal-dashboard",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview --host 127.0.0.1"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^latest",
    "vite": "^latest",
    "typescript": "^latest",
    "react": "^latest",
    "react-dom": "^latest",
    "lucide-react": "^latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^latest",
    "@testing-library/react": "^latest",
    "@types/react": "^latest",
    "@types/react-dom": "^latest",
    "jsdom": "^latest",
    "vitest": "^latest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: exit code `0`, `package-lock.json` created.

- [ ] **Step 3: Create Vite config**

Add `vite.config.ts`:

```ts
/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
});
```

- [ ] **Step 4: Create TypeScript config**

Add `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Add `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create minimal app shell**

Add `index.html`, `src/main.tsx`, `src/App.tsx`, and `src/styles.css` with a minimal page that renders `Trading Journal`.

- [ ] **Step 6: Verify scaffold**

Run: `npm run build`

Expected: exit code `0`, `dist/` created.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts src
git commit -m "chore: scaffold trading dashboard app"
```

### Task 2: Add Domain Types and Mock Data

**Files:**
- Create: `src/types.ts`
- Create: `src/data/stocks.ts`
- Create: `src/data/benchmarks.ts`

- [ ] **Step 1: Define domain types**

Add `src/types.ts`:

```ts
export type Market = "Thai" | "US" | "Custom";
export type MarketFilter = "All" | "Thai" | "US";
export type RiskLevel = "Low" | "Medium" | "High";

export interface StockMetrics {
  momentum: number;
  valuation: number;
  volatility: number;
  dividend: number;
  risk: number;
}

export interface StockProfile extends StockMetrics {
  symbol: string;
  name: string;
  market: Market;
  sector: string;
  currentPrice: number;
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  market: Market;
  sector: string;
  buyPrice: number;
  currentPrice: number;
  score: number | null;
  riskLevel: RiskLevel;
  isCustom: boolean;
}

export interface BenchmarkSeries {
  symbol: string;
  label: string;
  values: number[];
}
```

- [ ] **Step 2: Add mock stock universe**

Add at least 12 stocks to `src/data/stocks.ts`: `AAPL`, `MSFT`, `NVDA`, `AMZN`, `GOOGL`, `TSLA`, `PTT`, `CPALL`, `AOT`, `ADVANC`, `BDMS`, `KBANK`. Metrics are numbers from `0` to `100`.

- [ ] **Step 3: Add mock benchmark series**

Add `SPY`, `QQQ`, `VTI`, and `SET50` to `src/data/benchmarks.ts`, each with 12 normalized percentage values.

- [ ] **Step 4: Verify types**

Run: `npm run build`

Expected: exit code `0`.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/types.ts src/data
git commit -m "feat: add mock market data"
```

### Task 3: Test and Implement Validation

**Files:**
- Create: `src/lib/validation.ts`
- Create: `src/lib/validation.test.ts`

- [ ] **Step 1: Write failing validation tests**

Add `src/lib/validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { validatePositionInput } from "./validation";

describe("validatePositionInput", () => {
  it("requires a symbol", () => {
    expect(validatePositionInput("", "120")).toEqual({
      valid: false,
      errors: { symbol: "Enter a stock symbol." },
    });
  });

  it("requires a buy price", () => {
    expect(validatePositionInput("AAPL", "")).toEqual({
      valid: false,
      errors: { buyPrice: "Enter a buy price." },
    });
  });

  it("rejects a non-numeric buy price", () => {
    expect(validatePositionInput("AAPL", "abc")).toEqual({
      valid: false,
      errors: { buyPrice: "Buy price must be a number." },
    });
  });

  it("rejects a buy price less than or equal to zero", () => {
    expect(validatePositionInput("AAPL", "0")).toEqual({
      valid: false,
      errors: { buyPrice: "Buy price must be greater than 0." },
    });
  });

  it("normalizes valid input", () => {
    expect(validatePositionInput(" aapl ", " 120.5 ")).toEqual({
      valid: true,
      value: { symbol: "AAPL", buyPrice: 120.5 },
      errors: {},
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/validation.test.ts`

Expected: FAIL because `src/lib/validation.ts` does not exist.

- [ ] **Step 3: Implement validation**

Add `src/lib/validation.ts`:

```ts
export type PositionInputResult =
  | {
      valid: true;
      value: { symbol: string; buyPrice: number };
      errors: Record<string, never>;
    }
  | {
      valid: false;
      errors: { symbol?: string; buyPrice?: string };
    };

export function validatePositionInput(
  rawSymbol: string,
  rawBuyPrice: string,
): PositionInputResult {
  const symbol = rawSymbol.trim().toUpperCase();
  const priceText = rawBuyPrice.trim();
  const errors: { symbol?: string; buyPrice?: string } = {};

  if (!symbol) {
    errors.symbol = "Enter a stock symbol.";
  }

  if (!priceText) {
    errors.buyPrice = "Enter a buy price.";
  } else {
    const buyPrice = Number(priceText);
    if (Number.isNaN(buyPrice)) {
      errors.buyPrice = "Buy price must be a number.";
    } else if (buyPrice <= 0) {
      errors.buyPrice = "Buy price must be greater than 0.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: { symbol, buyPrice: Number(priceText) },
    errors: {},
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/validation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/validation.ts src/lib/validation.test.ts
git commit -m "feat: add position input validation"
```

### Task 4: Test and Implement Scoring

**Files:**
- Create: `src/lib/scoring.ts`
- Create: `src/lib/scoring.test.ts`

- [ ] **Step 1: Write failing scoring tests**

Add tests asserting:

```ts
import { describe, expect, it } from "vitest";
import { buildRecommendation, rankRecommendations, scoreStock } from "./scoring";
import type { StockProfile } from "../types";

const stock = (overrides: Partial<StockProfile>): StockProfile => ({
  symbol: "TEST",
  name: "Test Inc.",
  market: "US",
  sector: "Technology",
  currentPrice: 100,
  momentum: 80,
  valuation: 70,
  volatility: 30,
  dividend: 40,
  risk: 25,
  ...overrides,
});

describe("scoreStock", () => {
  it("rewards high momentum and low risk", () => {
    expect(scoreStock(stock({ momentum: 90, risk: 10 }))).toBeGreaterThan(
      scoreStock(stock({ momentum: 40, risk: 80 })),
    );
  });

  it("returns a rounded score from 0 to 100", () => {
    expect(scoreStock(stock({}))).toBe(67);
  });
});

describe("buildRecommendation", () => {
  it("creates a short explanation from strongest metrics", () => {
    expect(buildRecommendation(stock({ momentum: 92, dividend: 75 })).reason).toContain("momentum");
  });
});

describe("rankRecommendations", () => {
  it("sorts highest score first and filters by market", () => {
    const ranked = rankRecommendations([
      stock({ symbol: "LOW", market: "US", momentum: 20, risk: 90 }),
      stock({ symbol: "HIGH", market: "Thai", momentum: 95, risk: 15 }),
    ], "Thai");

    expect(ranked.map((item) => item.symbol)).toEqual(["HIGH"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/scoring.test.ts`

Expected: FAIL because `src/lib/scoring.ts` does not exist.

- [ ] **Step 3: Implement scoring**

Create `scoreStock`, `riskLabel`, `buildRecommendation`, and `rankRecommendations`. Use weights: momentum `0.3`, valuation `0.25`, inverse volatility `0.15`, dividend `0.1`, inverse risk `0.2`. Return rounded scores.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/scoring.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/scoring.ts src/lib/scoring.test.ts
git commit -m "feat: add recommendation scoring"
```

### Task 5: Test and Implement Portfolio Helpers

**Files:**
- Create: `src/lib/portfolio.ts`
- Create: `src/lib/portfolio.test.ts`

- [ ] **Step 1: Write failing portfolio tests**

Test these behaviors:

```ts
import { describe, expect, it } from "vitest";
import { createPosition, summarizePortfolio, unrealizedProfitLoss } from "./portfolio";
import { stockUniverse } from "../data/stocks";

describe("createPosition", () => {
  it("creates an enriched position for a known stock", () => {
    const position = createPosition("AAPL", 150, stockUniverse);

    expect(position).toMatchObject({
      symbol: "AAPL",
      name: "Apple Inc.",
      market: "US",
      isCustom: false,
    });
    expect(position.score).not.toBeNull();
  });

  it("creates a custom position for an unknown stock", () => {
    const position = createPosition("XYZ", 10, stockUniverse);

    expect(position).toMatchObject({
      symbol: "XYZ",
      name: "XYZ",
      market: "Custom",
      sector: "Unclassified",
      currentPrice: 10,
      score: null,
      riskLevel: "Medium",
      isCustom: true,
    });
  });
});

describe("unrealizedProfitLoss", () => {
  it("calculates absolute and percentage P/L", () => {
    expect(unrealizedProfitLoss(100, 125)).toEqual({
      amount: 25,
      percent: 25,
    });
  });
});

describe("summarizePortfolio", () => {
  it("summarizes totals and average score", () => {
    const positions = [
      createPosition("AAPL", 150, stockUniverse),
      createPosition("PTT", 30, stockUniverse),
    ];

    const summary = summarizePortfolio(positions);

    expect(summary.totalCost).toBe(180);
    expect(summary.totalValue).toBeGreaterThan(0);
    expect(summary.averageScore).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/portfolio.test.ts`

Expected: FAIL because `src/lib/portfolio.ts` does not exist.

- [ ] **Step 3: Implement portfolio helpers**

Implement `createPosition`, `unrealizedProfitLoss`, and `summarizePortfolio` using the scoring helpers.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/portfolio.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/portfolio.ts src/lib/portfolio.test.ts
git commit -m "feat: add portfolio calculations"
```

### Task 6: Test and Implement Benchmark Helpers

**Files:**
- Create: `src/lib/benchmarks.ts`
- Create: `src/lib/benchmarks.test.ts`

- [ ] **Step 1: Write failing benchmark tests**

Test that portfolio performance returns a 12-point series, starts at `0`, and increases when current value is above cost.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/benchmarks.test.ts`

Expected: FAIL because `src/lib/benchmarks.ts` does not exist.

- [ ] **Step 3: Implement benchmark helpers**

Implement `portfolioPerformanceSeries(positions)` and `combinedChartSeries(positions, benchmarks)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/benchmarks.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/benchmarks.ts src/lib/benchmarks.test.ts
git commit -m "feat: add benchmark comparison helpers"
```

### Task 7: Build UI Components

**Files:**
- Create: `src/components/TopBar.tsx`
- Create: `src/components/PositionForm.tsx`
- Create: `src/components/SummaryStrip.tsx`
- Create: `src/components/PerformanceChart.tsx`
- Create: `src/components/Recommendations.tsx`
- Create: `src/components/HoldingsTable.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create component props and static markup**

Create each component with typed props. Components should render static data passed from `App.tsx`; no component should import mock data directly except `App.tsx`.

- [ ] **Step 2: Wire app state**

In `App.tsx`, keep state for:

```ts
const [theme, setTheme] = useState<"dark" | "light">("dark");
const [marketFilter, setMarketFilter] = useState<MarketFilter>("All");
const [positions, setPositions] = useState<PortfolioPosition[]>([]);
const [formErrors, setFormErrors] = useState<{ symbol?: string; buyPrice?: string }>({});
```

- [ ] **Step 3: Add form submission behavior**

On submit, call `validatePositionInput`. If valid, call `createPosition`, append the result to portfolio state, and clear errors.

- [ ] **Step 4: Render dashboard sections**

Render top bar, form, summary strip, chart, recommendations, and holdings table in a responsive grid.

- [ ] **Step 5: Verify build**

Run: `npm run build`

Expected: exit code `0`.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/App.tsx src/components src/styles.css
git commit -m "feat: build trading dashboard UI"
```

### Task 8: Polish Theme, Empty States, and Responsive Design

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/PerformanceChart.tsx`
- Modify: `src/components/HoldingsTable.tsx`
- Modify: `src/components/Recommendations.tsx`

- [ ] **Step 1: Add design tokens**

Add CSS variables for dark and light themes: background, panel, text, muted text, border, green, red, amber, blue.

- [ ] **Step 2: Add professional empty states**

Holdings table should show a compact empty state when no positions exist. Chart should show benchmark lines and a neutral portfolio baseline until the user adds positions.

- [ ] **Step 3: Add responsive layout**

Desktop: chart and recommendations sit side-by-side. Mobile: sections stack vertically and table scrolls horizontally.

- [ ] **Step 4: Verify visual behavior**

Run: `npm run build`

Expected: exit code `0`.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/styles.css src/components
git commit -m "style: polish dashboard themes and responsive states"
```

### Task 9: Final Verification and Local Run

**Files:**
- No planned code changes unless verification reveals an issue.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: exit code `0`.

- [ ] **Step 3: Start dev server**

Run: `npm run dev`

Expected: Vite starts and prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 4: Browser smoke test**

Open the local URL in the in-app browser. Verify:

- Dashboard renders in dark mode.
- Theme toggle switches to light mode.
- Adding `AAPL` with buy price `150` adds a US position.
- Adding `PTT` with buy price `30` adds a Thai position.
- Adding `XYZ` with buy price `10` adds a custom position.
- Empty/invalid inputs show inline validation.
- Recommendations are visible.
- Benchmark chart is visible.

- [ ] **Step 5: Commit any verification fixes**

If fixes were needed, commit with a focused message:

```bash
git add src
git commit -m "fix: resolve dashboard verification issues"
```

## Self-Review Checklist

- Spec coverage: all approved requirements map to tasks.
- Marker scan: no unresolved markers or unspecified implementation work remains.
- Type consistency: `Market`, `MarketFilter`, `RiskLevel`, `StockProfile`, and `PortfolioPosition` are used consistently.
- TDD coverage: validation, scoring, portfolio, and benchmark helpers have failing-test-first steps.
- UI scope: frontend-only, mock data only, no login, no database, no real API.
