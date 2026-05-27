import { describe, expect, it } from "vitest";
import {
  createPosition,
  summarizePortfolio,
  unrealizedProfitLoss,
  updatePosition,
} from "./portfolio";
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
    const position = createPosition("ZZZZ", 10, stockUniverse);

    expect(position).toMatchObject({
      symbol: "ZZZZ",
      name: "ZZZZ",
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
    expect(unrealizedProfitLoss(100, 125)).toEqual({ amount: 25, percent: 25 });
  });
});

describe("updatePosition", () => {
  it("preserves the row id while enriching the edited symbol", () => {
    const original = createPosition("PTT", 30, stockUniverse);
    const updated = updatePosition(original.id, "PTTGC", 36, stockUniverse);

    expect(updated).toMatchObject({
      id: original.id,
      symbol: "PTTGC",
      name: "PTT Global Chemical Public Company Limited",
      market: "Thai",
      sector: "Petrochemicals",
      buyPrice: 36,
      isCustom: false,
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
