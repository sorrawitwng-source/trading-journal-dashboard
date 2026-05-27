import { describe, expect, it } from "vitest";
import type { PortfolioPosition } from "../types";
import {
  applyCachedQuotes,
  parseYahooChartQuote,
  toYahooSymbol,
} from "./marketData";

describe("toYahooSymbol", () => {
  it("maps Thai stocks to the Bangkok exchange suffix", () => {
    expect(toYahooSymbol("pttgc", "Thai")).toBe("PTTGC.BK");
  });

  it("maps US dot class symbols to Yahoo dash symbols", () => {
    expect(toYahooSymbol("BRK.B", "US")).toBe("BRK-B");
  });
});

describe("parseYahooChartQuote", () => {
  it("extracts a regular market price from Yahoo chart payloads", () => {
    const payload = {
      chart: {
        result: [
          {
            meta: {
              currency: "USD",
              exchangeName: "NMS",
              regularMarketPrice: 261.74,
              symbol: "AAPL",
            },
          },
        ],
      },
    };

    expect(parseYahooChartQuote(payload, "AAPL")).toEqual({
      currency: "USD",
      exchangeName: "NMS",
      price: 261.74,
      providerSymbol: "AAPL",
    });
  });

  it("falls back to the latest finite close price", () => {
    const payload = {
      chart: {
        result: [
          {
            indicators: {
              quote: [{ close: [null, 23.2, Number.NaN, 23.4] }],
            },
            meta: { symbol: "PTTGC.BK" },
          },
        ],
      },
    };

    expect(parseYahooChartQuote(payload, "PTTGC.BK")?.price).toBe(23.4);
  });
});

describe("applyCachedQuotes", () => {
  it("updates matching positions and marks cache misses as fallback", () => {
    const positions: PortfolioPosition[] = [
      basePosition("AAPL", "US", 150),
      basePosition("PTTGC", "Thai", 36),
    ];

    const updated = applyCachedQuotes(positions, {
      AAPL: {
        currency: "USD",
        exchangeName: "NMS",
        fetchedAt: "2026-05-27T10:00:00.000Z",
        price: 261.74,
        providerSymbol: "AAPL",
      },
    });

    expect(updated[0]).toMatchObject({
      currentPrice: 261.74,
      priceStatus: "cached",
      priceUpdatedAt: "2026-05-27T10:00:00.000Z",
    });
    expect(updated[1]).toMatchObject({
      currentPrice: 36,
      priceStatus: "fallback",
    });
  });
});

function basePosition(
  symbol: string,
  market: PortfolioPosition["market"],
  currentPrice: number,
): PortfolioPosition {
  return {
    buyPrice: currentPrice,
    currentPrice,
    id: symbol,
    isCustom: false,
    market,
    name: symbol,
    riskLevel: "Medium",
    score: 50,
    sector: "Test",
    symbol,
  };
}
