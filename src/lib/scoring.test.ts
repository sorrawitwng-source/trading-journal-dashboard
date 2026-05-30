import { describe, expect, it } from "vitest";
import {
  buildRecommendation,
  buildScoreBreakdown,
  dataQualityLabel,
  rankRecommendations,
  riskLabel,
  scoreComponentGuides,
  scoreStock,
} from "./scoring";
import type { StockProfile } from "../types";

const stock = (overrides: Partial<StockProfile>): StockProfile => ({
  symbol: "TEST",
  name: "Test Inc.",
  market: "US",
  sector: "Technology",
  sectorSource: "curated",
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
    const highScore = scoreStock(stock({ momentum: 90, risk: 10 }));
    const lowScore = scoreStock(stock({ momentum: 40, risk: 80 }));

    expect(highScore).not.toBeNull();
    expect(lowScore).not.toBeNull();
    expect(highScore as number).toBeGreaterThan(lowScore as number);
  });

  it("returns a rounded score from 0 to 100", () => {
    expect(scoreStock(stock({}))).toBeGreaterThan(60);
  });

  it("returns null when there is not enough real data", () => {
    expect(
      scoreStock(
        stock({
          dividend: null,
          momentum: null,
          risk: null,
          valuation: null,
          volatility: null,
        }),
      ),
    ).toBeNull();
  });
});

describe("riskLabel", () => {
  it("returns no data when risk inputs are missing", () => {
    expect(riskLabel(null, null)).toEqual({
      level: "No data",
      reason: "Risk needs volatility or risk metric data.",
    });
  });
});

describe("buildScoreBreakdown", () => {
  it("shows methodology and data confidence", () => {
    const breakdown = buildScoreBreakdown(stock({ momentum: null }));

    expect(breakdown.methodology).toContain("weighted");
    expect(breakdown.dataQuality).toBe("partial");
    expect(breakdown.items.map((item) => item.label)).toContain("Data confidence");
  });

  it("exposes component weights for explaining the score", () => {
    expect(scoreComponentGuides).toEqual([
      { key: "momentum", label: "Momentum", weight: 0.25 },
      { key: "valuation", label: "Valuation", weight: 0.2 },
      { key: "stability", label: "Stability", weight: 0.2 },
      { key: "dividend", label: "Dividend", weight: 0.1 },
      { key: "riskProfile", label: "Risk profile", weight: 0.15 },
      { key: "dataConfidence", label: "Data confidence", weight: 0.1 },
    ]);
  });
});

describe("buildRecommendation", () => {
  it("creates a short explanation from strongest metrics", () => {
    expect(buildRecommendation(stock({ momentum: 92, dividend: 75 })).reason).toContain(
      "momentum",
    );
  });

  it("marks no-data recommendations as not research-ready", () => {
    const recommendation = buildRecommendation(
      stock({
        dividend: null,
        momentum: null,
        risk: null,
        valuation: null,
        volatility: null,
      }),
    );

    expect(recommendation.score).toBeNull();
    expect(recommendation.dataQuality).toBe("no-data");
    expect(recommendation.reason).toContain("Not enough verified data");
  });
});

describe("rankRecommendations", () => {
  it("sorts highest score first and filters by market", () => {
    const ranked = rankRecommendations(
      [
        stock({ symbol: "LOW", market: "US", momentum: 20, risk: 90 }),
        stock({ symbol: "HIGH", market: "Thai", momentum: 95, risk: 15 }),
        stock({
          symbol: "NODATA",
          market: "Thai",
          dividend: null,
          momentum: null,
          risk: null,
          valuation: null,
          volatility: null,
        }),
      ],
      "Thai",
    );

    expect(ranked.map((item) => item.symbol)).toEqual(["HIGH"]);
  });
});

describe("dataQualityLabel", () => {
  it("explains partial quality in plain language", () => {
    expect(dataQualityLabel("partial")).toContain("Some inputs");
  });
});
