import { describe, expect, it } from "vitest";
import {
  convertCurrency,
  createPosition,
  summarizePortfolio,
  unrealizedProfitLoss,
  updatePosition,
} from "./portfolio";
import { stockUniverse } from "../data/stocks";

describe("createPosition", () => {
  it("creates an enriched position for a known stock", () => {
    const position = createPosition("AAPL", 150, 12, stockUniverse);

    expect(position).toMatchObject({
      symbol: "AAPL",
      name: "Apple Inc.",
      market: "US",
      currency: "USD",
      quantity: 12,
      isCustom: false,
    });
    expect(position.score).not.toBeNull();
  });

  it("creates a custom position for an unknown stock", () => {
    const position = createPosition("ZZZZ", 10, 0, stockUniverse);

    expect(position).toMatchObject({
      symbol: "ZZZZ",
      name: "ZZZZ",
      market: "Custom",
      currency: "USD",
      sector: "Unclassified",
      currentPrice: 10,
      quantity: 0,
      score: null,
      riskLevel: "No data",
      dataQuality: "no-data",
      isCustom: true,
    });
  });
});

describe("unrealizedProfitLoss", () => {
  it("calculates quantity-adjusted absolute and percentage P/L", () => {
    expect(unrealizedProfitLoss(100, 125, 10)).toEqual({
      amount: 250,
      percent: 25,
    });
  });
});

describe("updatePosition", () => {
  it("preserves the row id while enriching the edited symbol", () => {
    const original = createPosition("PTT", 30, 5, stockUniverse);
    const updated = updatePosition(original.id, "PTTGC", 36, 8, stockUniverse);

    expect(updated).toMatchObject({
      id: original.id,
      symbol: "PTTGC",
      name: "PTT Global Chemical Public Company Limited",
      market: "Thai",
      currency: "THB",
      sector: "Petrochemicals",
      buyPrice: 36,
      quantity: 8,
      isCustom: false,
    });
  });
});

describe("summarizePortfolio", () => {
  it("summarizes mixed-market totals in the selected base currency", () => {
    const positions = [
      createPosition("AAPL", 150, 2, stockUniverse),
      createPosition("PTT", 30, 3, stockUniverse),
    ];

    const summary = summarizePortfolio(positions, {
      baseCurrency: "THB",
      usdThbRate: 35,
    });

    expect(summary.baseCurrency).toBe("THB");
    expect(summary.totalCost).toBe(10590);
    expect(summary.totalValue).toBeGreaterThan(0);
    expect(summary.averageScore).not.toBeNull();
  });
});

describe("convertCurrency", () => {
  it("converts between USD and THB", () => {
    expect(convertCurrency(10, "USD", "THB", 35)).toBe(350);
    expect(convertCurrency(350, "THB", "USD", 35)).toBe(10);
  });
});
