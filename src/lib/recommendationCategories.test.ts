import { describe, expect, it } from "vitest";
import type { StockProfile } from "../types";
import { buildRecommendationCategories } from "./recommendationCategories";

describe("buildRecommendationCategories", () => {
  it("returns a complete set of stock idea categories", () => {
    const categories = buildRecommendationCategories(sampleStocks, "All");

    expect(categories.map((category) => category.id)).toEqual([
      "tech",
      "dividend",
      "real-estate",
      "food",
      "banking-finance",
      "energy",
      "healthcare",
      "consumer",
      "industrial",
      "utilities",
      "transportation-tourism",
      "growth",
      "low-risk",
      "thai",
      "us",
    ]);
  });

  it("filters ideas by market before grouping", () => {
    const categories = buildRecommendationCategories(sampleStocks, "Thai");
    const usCategory = categories.find((category) => category.id === "us");
    const thaiCategory = categories.find((category) => category.id === "thai");

    expect(usCategory?.stocks).toHaveLength(0);
    expect(thaiCategory?.stocks.map((stock) => stock.symbol)).toContain("ADVANC");
    expect(
      categories.every((category) =>
        category.stocks.every((stock) => stock.market === "Thai"),
      ),
    ).toBe(true);
  });

  it("keeps watchlist candidates when score data is incomplete", () => {
    const categories = buildRecommendationCategories(
      [
        ...sampleStocks,
        stock("ASML", "US", "Semiconductors", {
          dividend: null,
          momentum: null,
          risk: null,
          valuation: null,
          volatility: null,
        }),
      ],
      "US",
    );
    const techCategory = categories.find((category) => category.id === "tech");

    expect(techCategory?.stocks.map((stock) => stock.symbol)).toContain("ASML");
    expect(techCategory?.stocks.at(-1)?.symbol).toBe("ASML");
    expect(techCategory?.stocks.at(-1)?.score).toBeNull();
  });
});

const sampleStocks: StockProfile[] = [
  stock("ADVANC", "Thai", "Telecommunications", {
    dividend: 80,
    momentum: 68,
    risk: 22,
    valuation: 70,
    volatility: 24,
  }),
  stock("AAPL", "US", "Technology", {
    dividend: 12,
    momentum: 82,
    risk: 34,
    valuation: 58,
    volatility: 42,
  }),
  stock("PTT", "Thai", "Energy", {
    dividend: 75,
    momentum: 45,
    risk: 42,
    valuation: 66,
    volatility: 39,
  }),
  stock("CPALL", "Thai", "Food & Beverage", {
    dividend: 35,
    momentum: 62,
    risk: 40,
    valuation: 55,
    volatility: 45,
  }),
];

function stock(
  symbol: string,
  market: StockProfile["market"],
  sector: string,
  metrics: Pick<
    StockProfile,
    "dividend" | "momentum" | "risk" | "valuation" | "volatility"
  >,
): StockProfile {
  return {
    ...metrics,
    currentPrice: 100,
    market,
    name: `${symbol} Public Company Limited`,
    sector,
    sectorSource: "curated",
    symbol,
  };
}
