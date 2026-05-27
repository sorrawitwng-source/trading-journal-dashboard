import { describe, expect, test } from "vitest";

import type { BenchmarkSeries, PortfolioPosition } from "../types";
import { combinedChartSeries, portfolioPerformanceSeries } from "./benchmarks";

const basePosition: PortfolioPosition = {
  id: "position-1",
  symbol: "AAPL",
  name: "Apple",
  market: "US",
  sector: "Technology",
  buyPrice: 100,
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
