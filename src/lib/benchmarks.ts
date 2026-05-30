import type { BenchmarkSeries, PortfolioPosition } from "../types";
import type { Currency } from "../types";
import {
  convertCurrency,
  fallbackUsdThbRate,
  positionCurrency,
  positionExitPrice,
} from "./portfolio";

const SERIES_POINTS = 12;

export function portfolioPerformanceSeries(
  positions: PortfolioPosition[],
  options: { baseCurrency: Currency; usdThbRate: number } = {
    baseCurrency: "USD",
    usdThbRate: fallbackUsdThbRate,
  },
): number[] {
  const totalCost = positions.reduce(
    (sum, position) =>
      sum +
      convertCurrency(
        position.buyPrice * position.quantity,
        positionCurrency(position),
        options.baseCurrency,
        options.usdThbRate,
      ),
    0,
  );

  if (positions.length === 0 || totalCost === 0) {
    return Array(SERIES_POINTS).fill(0);
  }

  const totalValue = positions.reduce(
    (sum, position) =>
      sum +
      convertCurrency(
        positionExitPrice(position) * position.quantity,
        positionCurrency(position),
        options.baseCurrency,
        options.usdThbRate,
      ),
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
  options?: { baseCurrency: Currency; usdThbRate: number },
): BenchmarkSeries[] {
  return [
    {
      symbol: "PORTFOLIO",
      label: "Portfolio",
      values: portfolioPerformanceSeries(positions, options),
    },
    ...benchmarks,
  ];
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}
