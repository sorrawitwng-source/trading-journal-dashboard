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
    expect(buildRecommendation(stock({ momentum: 92, dividend: 75 })).reason).toContain(
      "momentum",
    );
  });
});

describe("rankRecommendations", () => {
  it("sorts highest score first and filters by market", () => {
    const ranked = rankRecommendations(
      [
        stock({ symbol: "LOW", market: "US", momentum: 20, risk: 90 }),
        stock({ symbol: "HIGH", market: "Thai", momentum: 95, risk: 15 }),
      ],
      "Thai",
    );

    expect(ranked.map((item) => item.symbol)).toEqual(["HIGH"]);
  });
});
