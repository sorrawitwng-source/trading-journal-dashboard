import { describe, expect, it } from "vitest";
import { stockUniverse } from "../data/stocks";
import type { StockProfile } from "../types";
import { classifyEmaZone, scanDailyStocks } from "./dailyStockScanner";

describe("classifyEmaZone", () => {
  it("classifies zone 1 when price and EMAs are fully stacked", () => {
    expect(
      classifyEmaZone({
        currentPrice: 110,
        ema5: 106,
        ema10: 102,
        ema75: 94,
        ema200: 88,
      }),
    ).toBe("zone-1");
  });

  it("classifies zone 2 when the short trend is bullish but not fully stacked", () => {
    expect(
      classifyEmaZone({
        currentPrice: 110,
        ema5: 104,
        ema10: 106,
        ema75: 100,
        ema200: 95,
      }),
    ).toBe("zone-2");
  });

  it("classifies zone 3 when only the main trend base is bullish", () => {
    expect(
      classifyEmaZone({
        currentPrice: 100,
        ema5: 103,
        ema10: 102,
        ema75: 96,
        ema200: 90,
      }),
    ).toBe("zone-3");
  });
});

describe("scanDailyStocks", () => {
  it("returns only stocks with enough data and EMA zones", () => {
    const ideas = scanDailyStocks(stockUniverse, "All");

    expect(ideas.length).toBeGreaterThan(0);
    expect(ideas.every((idea) => idea.currentPrice > 0)).toBe(true);
    expect(ideas.every((idea) => idea.ema75 > idea.ema200)).toBe(true);
  });

  it("filters ideas by market", () => {
    expect(scanDailyStocks(stockUniverse, "Thai").every((idea) => idea.market === "Thai")).toBe(true);
    expect(scanDailyStocks(stockUniverse, "US").every((idea) => idea.market === "US")).toBe(true);
  });

  it("keeps the strongest six ideas inside each zone", () => {
    const stocks = Array.from({ length: 7 }, (_, index): StockProfile => {
      const momentum = 66 + index;

      return {
        currentPrice: 100,
        dividend: 40,
        market: "US",
        momentum,
        name: `Fast ${index}`,
        risk: 30,
        sector: "Technology",
        sectorSource: "curated",
        symbol: `FAST${index}`,
        valuation: 50,
        volatility: 20,
      };
    });

    const ideas = scanDailyStocks(stocks, "US");

    expect(ideas).toHaveLength(6);
    expect(ideas.every((idea) => idea.zone === "zone-1")).toBe(true);
    expect(ideas[0].symbol).toBe("FAST6");
  });
});
