import type { Currency, PortfolioPosition } from "../types";
import {
  convertCurrency,
  positionCurrency,
  positionExitPrice,
  positionStatus,
  unrealizedProfitLoss,
} from "./portfolio";

export interface AnalyticsBucket {
  key: string;
  value: number;
  weight: number;
}

export interface AnalyticsHolding {
  buyDate: string;
  cost: number;
  currency: Currency;
  market: PortfolioPosition["market"];
  name: string;
  profitLoss: number;
  profitLossPercent: number;
  score: number | null;
  sector: string;
  status: "open" | "sold";
  symbol: string;
  value: number;
  weight: number;
}

export interface MonthlyPerformance {
  bestTrade: AnalyticsHolding | null;
  key: string;
  openCount: number;
  profitLoss: number;
  profitLossPercent: number;
  soldCount: number;
  totalCost: number;
  totalValue: number;
  tradeCount: number;
  winRate: number;
  worstTrade: AnalyticsHolding | null;
}

export interface RiskSignal {
  label: string;
  tone: "danger" | "neutral" | "positive" | "warning";
  value: string;
}

export interface PortfolioAnalytics {
  currencyExposure: AnalyticsBucket[];
  dataQuality: AnalyticsBucket[];
  holdings: AnalyticsHolding[];
  marketExposure: AnalyticsBucket[];
  monthlyPerformance: MonthlyPerformance[];
  riskSignals: RiskSignal[];
  sectorExposure: AnalyticsBucket[];
  topContributors: AnalyticsHolding[];
  topHoldings: AnalyticsHolding[];
  totalCost: number;
  totalProfitLoss: number;
  totalValue: number;
}

interface AnalyticsOptions {
  baseCurrency: Currency;
  usdThbRate: number;
}

export function buildPortfolioAnalytics(
  positions: PortfolioPosition[],
  options: AnalyticsOptions,
): PortfolioAnalytics {
  const holdings = positions
    .map((position) => {
      const currency = positionCurrency(position);
      const cost = convertCurrency(
        position.buyPrice * position.quantity,
        currency,
        options.baseCurrency,
        options.usdThbRate,
      );
      const value = convertCurrency(
        positionExitPrice(position) * position.quantity,
        currency,
        options.baseCurrency,
        options.usdThbRate,
      );
      const profitLoss = value - cost;
      const originalProfitLoss = unrealizedProfitLoss(
        position.buyPrice,
        positionExitPrice(position),
        position.quantity,
      );

      return {
        buyDate: position.buyDate,
        cost,
        currency,
        market: position.market,
        name: position.name,
        profitLoss: roundTo(profitLoss, 2),
        profitLossPercent: originalProfitLoss.percent,
        score: position.score,
        sector: position.sector,
        status: positionStatus(position),
        symbol: position.symbol,
        value,
        weight: 0,
      };
    })
    .filter((holding) => holding.value > 0);
  const totalCost = roundTo(
    holdings.reduce((sum, holding) => sum + holding.cost, 0),
    2,
  );
  const totalValue = roundTo(
    holdings.reduce((sum, holding) => sum + holding.value, 0),
    2,
  );
  const weightedHoldings = holdings.map((holding) => ({
    ...holding,
    weight: totalValue === 0 ? 0 : roundTo((holding.value / totalValue) * 100, 2),
  }));
  const totalProfitLoss = roundTo(totalValue - totalCost, 2);

  return {
    currencyExposure: bucketBy(weightedHoldings, (holding) => holding.currency),
    dataQuality: bucketBy(
      positions.map((position) => ({
        key: position.dataQuality ?? "no-data",
        value: 1,
      })),
      (item) => item.key,
      (item) => item.value,
      positions.length,
    ),
    holdings: weightedHoldings,
    marketExposure: bucketBy(weightedHoldings, (holding) => holding.market),
    monthlyPerformance: buildMonthlyPerformance(weightedHoldings),
    riskSignals: buildRiskSignals(weightedHoldings),
    sectorExposure: bucketBy(weightedHoldings, (holding) => holding.sector),
    topContributors: [...weightedHoldings]
      .sort((left, right) => right.profitLoss - left.profitLoss)
      .slice(0, 5),
    topHoldings: [...weightedHoldings]
      .sort((left, right) => right.value - left.value)
      .slice(0, 5),
    totalCost,
    totalProfitLoss,
    totalValue,
  };
}

function buildMonthlyPerformance(holdings: AnalyticsHolding[]): MonthlyPerformance[] {
  const groups = new Map<string, AnalyticsHolding[]>();

  for (const holding of holdings) {
    const key = monthKeyFromDate(holding.buyDate);
    const group = groups.get(key) ?? [];

    group.push(holding);
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .map(([key, monthHoldings]) => {
      const totalCost = roundTo(
        monthHoldings.reduce((sum, holding) => sum + holding.cost, 0),
        2,
      );
      const totalValue = roundTo(
        monthHoldings.reduce((sum, holding) => sum + holding.value, 0),
        2,
      );
      const profitLoss = roundTo(totalValue - totalCost, 2);
      const sortedByProfitLoss = [...monthHoldings].sort(
        (left, right) => right.profitLoss - left.profitLoss,
      );
      const winCount = monthHoldings.filter((holding) => holding.profitLoss > 0).length;

      return {
        bestTrade: sortedByProfitLoss[0] ?? null,
        key,
        openCount: monthHoldings.filter((holding) => holding.status === "open").length,
        profitLoss,
        profitLossPercent:
          totalCost === 0 ? 0 : roundTo((profitLoss / totalCost) * 100, 2),
        soldCount: monthHoldings.filter((holding) => holding.status === "sold").length,
        totalCost,
        totalValue,
        tradeCount: monthHoldings.length,
        winRate:
          monthHoldings.length === 0
            ? 0
            : roundTo((winCount / monthHoldings.length) * 100, 2),
        worstTrade: sortedByProfitLoss.at(-1) ?? null,
      };
    })
    .sort((left, right) => right.key.localeCompare(left.key));
}

function buildRiskSignals(holdings: AnalyticsHolding[]): RiskSignal[] {
  const largestHolding = holdings[0];
  const sortedByWeight = [...holdings].sort((left, right) => right.weight - left.weight);
  const topHoldingWeight = sortedByWeight[0]?.weight ?? 0;
  const topThreeWeight = roundTo(
    sortedByWeight.slice(0, 3).reduce((sum, holding) => sum + holding.weight, 0),
    2,
  );
  const topSectorWeight = bucketBy(holdings, (holding) => holding.sector)[0]?.weight ?? 0;
  const usdWeight =
    bucketBy(holdings, (holding) => holding.currency).find(
      (bucket) => bucket.key === "USD",
    )?.weight ?? 0;

  return [
    {
      label: "Largest position",
      tone: topHoldingWeight > 35 ? "danger" : topHoldingWeight > 25 ? "warning" : "positive",
      value: largestHolding ? `${largestHolding.symbol} ${formatPercent(topHoldingWeight)}` : "N/A",
    },
    {
      label: "Top 3 concentration",
      tone: topThreeWeight > 75 ? "danger" : topThreeWeight > 55 ? "warning" : "positive",
      value: formatPercent(topThreeWeight),
    },
    {
      label: "Sector concentration",
      tone: topSectorWeight > 55 ? "danger" : topSectorWeight > 35 ? "warning" : "positive",
      value: formatPercent(topSectorWeight),
    },
    {
      label: "USD exposure",
      tone: usdWeight > 80 ? "warning" : "neutral",
      value: formatPercent(usdWeight),
    },
  ];
}

function bucketBy<T>(
  items: T[],
  keySelector: (item: T) => string,
  valueSelector: (item: T) => number = (item) =>
    "value" in (item as Record<string, unknown>)
      ? Number((item as Record<string, unknown>).value)
      : 0,
  totalOverride?: number,
): AnalyticsBucket[] {
  const totals = new Map<string, number>();

  for (const item of items) {
    const key = keySelector(item) || "Unknown";
    totals.set(key, (totals.get(key) ?? 0) + valueSelector(item));
  }

  const total =
    totalOverride ??
    Array.from(totals.values()).reduce((sum, value) => sum + value, 0);

  return Array.from(totals.entries())
    .map(([key, value]) => ({
      key,
      value: roundTo(value, 2),
      weight: total === 0 ? 0 : roundTo((value / total) * 100, 2),
    }))
    .sort((left, right) => right.value - left.value);
}

function monthKeyFromDate(value: string): string {
  return /^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : "Unknown";
}

function formatPercent(value: number): string {
  return `${roundTo(value, 1).toFixed(1)}%`;
}

function roundTo(value: number, decimals: number): number {
  const multiplier = 10 ** decimals;

  return Math.round(value * multiplier) / multiplier;
}
