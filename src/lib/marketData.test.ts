import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PortfolioPosition } from "../types";
import {
  applyCachedQuotes,
  parseYahooChartQuote,
  refreshUsdThbRate,
  toYahooSymbol,
} from "./marketData";

beforeEach(() => {
  localStorage.clear();
});

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

describe("refreshUsdThbRate", () => {
  it("loads the USD/THB rate from the quote endpoint", async () => {
    const fetcher = vi.fn(async () => ({
      json: async () => ({
        price: 35.77,
        providerSymbol: "THB=X",
      }),
      ok: true,
    })) as unknown as typeof fetch;

    await expect(refreshUsdThbRate(localStorage, fetcher)).resolves.toMatchObject({
      rate: 35.77,
      status: "live",
    });
  });

  it("falls back to the Vercel quote endpoint when Netlify is unavailable", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ error: "Not found" }),
        ok: false,
      })
      .mockResolvedValueOnce({
        json: async () => ({
          price: 36.12,
          providerSymbol: "THB=X",
        }),
        ok: true,
      }) as unknown as typeof fetch;

    await expect(refreshUsdThbRate(localStorage, fetcher)).resolves.toMatchObject({
      rate: 36.12,
      status: "live",
    });
    expect(vi.mocked(fetcher).mock.calls[1]?.[0]).toContain("/api/quote");
  });
});

function basePosition(
  symbol: string,
  market: PortfolioPosition["market"],
  currentPrice: number,
): PortfolioPosition {
  return {
    buyDate: "2026-05-31",
    buyPrice: currentPrice,
    currentPrice,
    currency: market === "Thai" ? "THB" : "USD",
    id: symbol,
    isCustom: false,
    market,
    name: symbol,
    quantity: 0,
    riskLevel: "Medium",
    score: 50,
    sector: "Test",
    symbol,
  };
}
