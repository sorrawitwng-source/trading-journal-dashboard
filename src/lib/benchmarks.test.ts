import { describe, expect, test } from "vitest";

import type { BenchmarkSeries, PortfolioPosition } from "../types";
import { combinedChartSeries, portfolioPerformanceSeries } from "./benchmarks";

const basePosition: PortfolioPosition = {
  id: "position-1",
  symbol: "AAPL",
  name: "Apple",
  market: "US",
  sector: "Technology",
  buyDate: "2026-05-31",
  buyPrice: 100,
  currency: "USD",
  quantity: 3,
  currentPrice: 120,
  score: 82,
  riskLevel: "Medium",
  isCustom: false,
};

describe("portfolioPerformanceSeries", () => {
  test("returns a 12-point series that starts at 0 and increases when value is above cost", () => {
    const values = portfolioPerformanceSeries([basePosition]);

    expect(values).toHaveLength(12);
    expect(values[0]).toBe(0);
    expect(values.at(-1)).toBeGreaterThan(0);
  });

  test("uses quantity when calculating portfolio performance", () => {
    const values = portfolioPerformanceSeries([
      { ...basePosition, buyPrice: 100, currentPrice: 150, quantity: 2 },
    ]);

    expect(values.at(-1)).toBe(50);
  });

  test("normalizes mixed currency holdings before calculating performance", () => {
    const values = portfolioPerformanceSeries(
      [
        basePosition,
        {
          ...basePosition,
          id: "position-2",
          symbol: "PTTGC",
          market: "Thai",
          buyPrice: 30,
          currency: "THB",
          currentPrice: 33,
          quantity: 10,
        },
      ],
      { baseCurrency: "THB", usdThbRate: 35 },
    );

    expect(values.at(-1)).toBeCloseTo(19.72, 2);
  });
});

describe("combinedChartSeries", () => {
  test("includes the Portfolio series before the passed benchmark series", () => {
    const benchmarks: BenchmarkSeries[] = [
      {
        symbol: "SPY",
        label: "S&P 500 ETF",
        values: [0, 1, 2],
      },
    ];

    const series = combinedChartSeries([basePosition], benchmarks);

    expect(series).toHaveLength(2);
    expect(series[0]).toMatchObject({
      symbol: "PORTFOLIO",
      label: "Portfolio",
      values: portfolioPerformanceSeries([basePosition]),
    });
    expect(series[1]).toBe(benchmarks[0]);
  });
});
