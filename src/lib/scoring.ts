import type { MarketFilter, RiskLevel, StockProfile } from "../types";

export interface StockRecommendation {
  symbol: string;
  name: string;
  market: StockProfile["market"];
  sector: string;
  score: number;
  riskLevel: RiskLevel;
  reason: string;
}

const clampScore = (score: number): number => Math.min(100, Math.max(0, score));
const SCORE_CALIBRATION = 4;

export function scoreStock(stock: StockProfile): number {
  const score =
    stock.momentum * 0.3 +
    stock.valuation * 0.25 +
    (100 - stock.volatility) * 0.15 +
    stock.dividend * 0.1 +
    (100 - stock.risk) * 0.2;

  return clampScore(Math.round(score - SCORE_CALIBRATION));
}

export function riskLabel(risk: number): RiskLevel {
  if (risk <= 33) {
    return "Low";
  }

  if (risk <= 66) {
    return "Medium";
  }

  return "High";
}

export function buildRecommendation(stock: StockProfile): StockRecommendation {
  return {
    symbol: stock.symbol,
    name: stock.name,
    market: stock.market,
    sector: stock.sector,
    score: scoreStock(stock),
    riskLevel: riskLabel(stock.risk),
    reason: `Strong ${strongestMetric(stock)} supports this recommendation.`,
  };
}

export function rankRecommendations(
  stocks: StockProfile[],
  filter: MarketFilter,
): StockRecommendation[] {
  return stocks
    .filter((stock) => filter === "All" || stock.market === filter)
    .map(buildRecommendation)
    .sort((left, right) => right.score - left.score);
}

function strongestMetric(stock: StockProfile): string {
  const metrics = [
    { label: "momentum", value: stock.momentum },
    { label: "valuation", value: stock.valuation },
    { label: "low volatility", value: 100 - stock.volatility },
    { label: "dividend", value: stock.dividend },
    { label: "risk profile", value: 100 - stock.risk },
  ];

  return metrics.reduce((strongest, metric) =>
    metric.value > strongest.value ? metric : strongest,
  ).label;
}
