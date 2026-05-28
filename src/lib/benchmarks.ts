import type { BenchmarkSeries, PortfolioPosition } from "../types";

const SERIES_POINTS = 12;

export function portfolioPerformanceSeries(
  positions: PortfolioPosition[],
): number[] {
  const totalCost = positions.reduce(
    (sum, position) => sum + position.buyPrice * position.quantity,
    0,
  );

  if (positions.length === 0 || totalCost === 0) {
    return Array(SERIES_POINTS).fill(0);
  }

  const totalValue = positions.reduce(
    (sum, position) => sum + position.currentPrice * position.quantity,
    0,
  );
  const finalPercent = ((totalValue - totalCost) / totalCost) * 100;

  return Array.from({ length: SERIES_POINTS }, (_, index) =>
    roundPercent((finalPercent * index) / (SERIES_POINTS - 1)),
  );
}

export function combinedChartSeries(
  positions: PortfolioPosition[],
  benchmarks: BenchmarkSeries[],
): BenchmarkSeries[] {
  return [
    {
      symbol: "PORTFOLIO",
      label: "Portfolio",
      values: portfolioPerformanceSeries(positions),
    },
    ...benchmarks,
  ];
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}
