import { describe, expect, it } from "vitest";
import type { NewsScanItem } from "./newsScanner";
import { analyzeStockSentiment, normalizeScanSymbol } from "./stockSentiment";
import type { StockProfile } from "../types";

const profiles: StockProfile[] = [
  {
    currentPrice: 100,
    dividend: 10,
    market: "US",
    momentum: 78,
    name: "Apple Inc.",
    risk: 38,
    sector: "Technology",
    sectorSource: "curated",
    symbol: "AAPL",
    valuation: 55,
    volatility: 42,
  },
  {
    currentPrice: 35,
    dividend: 72,
    market: "Thai",
    momentum: 38,
    name: "PTT Public Company Limited",
    risk: 74,
    sector: "Energy",
    sectorSource: "curated",
    symbol: "PTT",
    valuation: 58,
    volatility: 66,
  },
];

const baseNews: Omit<NewsScanItem, "id" | "signal" | "symbols" | "title"> = {
  category: "company",
  impact: { en: "Positive catalyst", th: "Positive catalyst" },
  market: "US",
  provider: "finnhub",
  publishedAt: "2026-06-10",
  sectors: ["Technology"],
  source: "Finnhub",
  sourceUrl: "https://example.com",
  summary: { en: "summary", th: "summary" },
};

describe("stock sentiment", () => {
  it("normalizes Thai stock suffixes", () => {
    expect(normalizeScanSymbol(" ptt.bk ")).toBe("PTT");
  });

  it("marks direct positive news and momentum as positive", () => {
    const result = analyzeStockSentiment({
      marketFilter: "All",
      newsItems: [
        {
          ...baseNews,
          id: "aapl-hot",
          signal: "hot",
          symbols: ["AAPL"],
          title: { en: "Apple wins AI contract", th: "Apple wins AI contract" },
        },
      ],
      profiles,
      symbol: "AAPL",
    });

    expect(result.sentiment).toBe("positive");
    expect(result.directNews).toHaveLength(1);
    expect(result.factors.some((factor) => factor.id === "direct-news")).toBe(true);
  });

  it("marks direct risk news and weak technicals as negative", () => {
    const result = analyzeStockSentiment({
      marketFilter: "Thai",
      newsItems: [
        {
          ...baseNews,
          id: "ptt-watch",
          market: "Thai",
          sectors: ["Energy"],
          signal: "watch",
          symbols: ["PTT"],
          title: { en: "Energy margin risk rises", th: "Energy margin risk rises" },
        },
      ],
      profiles,
      symbol: "PTT.BK",
    });

    expect(result.sentiment).toBe("negative");
    expect(result.factors.some((factor) => factor.id === "risk")).toBe(true);
  });

  it("returns unknown when there is no evidence", () => {
    const result = analyzeStockSentiment({
      marketFilter: "All",
      newsItems: [],
      profiles: [],
      symbol: "NOPE",
    });

    expect(result.sentiment).toBe("unknown");
    expect(result.factors[0]?.id).toBe("data-gap");
  });
});

