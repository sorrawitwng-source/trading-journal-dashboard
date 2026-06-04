import type { Market, MarketFilter, StockProfile } from "../types";

export type DailyStockZone = "zone-1" | "zone-2" | "zone-3";

export interface DailyStockIdea {
  currentPrice: number;
  ema5: number;
  ema10: number;
  ema75: number;
  ema200: number;
  market: Market;
  name: string;
  sector: string;
  symbol: string;
  zone: DailyStockZone;
}

const ideasPerZone = 6;

export function scanDailyStocks(
  stocks: StockProfile[],
  marketFilter: MarketFilter = "All",
): DailyStockIdea[] {
  const ideas = stocks
    .filter((stock) => marketFilter === "All" || stock.market === marketFilter)
    .map(buildDailyStockIdea)
    .filter((idea): idea is DailyStockIdea => idea !== null)
    .sort(
      (left, right) =>
        rankZone(left.zone) - rankZone(right.zone) ||
        calculateEmaSpread(right) - calculateEmaSpread(left),
    );

  return (["zone-1", "zone-2", "zone-3"] as DailyStockZone[]).flatMap((zone) =>
    ideas.filter((idea) => idea.zone === zone).slice(0, ideasPerZone),
  );
}

export function classifyEmaZone({
  currentPrice,
  ema5,
  ema10,
  ema75,
  ema200,
}: Pick<DailyStockIdea, "currentPrice" | "ema5" | "ema10" | "ema75" | "ema200">): DailyStockZone | null {
  if (currentPrice > ema5 && ema5 > ema10 && ema10 > ema75 && ema75 > ema200) {
    return "zone-1";
  }

  if (currentPrice > ema10 && ema10 > ema75 && ema75 > ema200) {
    return "zone-2";
  }

  if (currentPrice > ema75 && ema75 > ema200) {
    return "zone-3";
  }

  return null;
}

function buildDailyStockIdea(stock: StockProfile): DailyStockIdea | null {
  if (
    stock.currentPrice <= 0 ||
    stock.momentum === null ||
    stock.risk === null ||
    stock.volatility === null ||
    stock.sector === "Unknown"
  ) {
    return null;
  }

  const trend = buildSyntheticEmaStack(stock);
  const zone = classifyEmaZone({
    currentPrice: stock.currentPrice,
    ...trend,
  });

  if (!zone) {
    return null;
  }

  return {
    currentPrice: stock.currentPrice,
    market: stock.market,
    name: stock.name,
    sector: stock.sector,
    symbol: stock.symbol,
    zone,
    ...trend,
  };
}

function buildSyntheticEmaStack(stock: StockProfile) {
  const momentum = stock.momentum ?? 50;
  const risk = stock.risk ?? 50;
  const volatility = stock.volatility ?? 50;
  const trendQuality = momentum - risk * 0.28 - volatility * 0.12;
  const longTrend = clamp((trendQuality - 24) / 120, -0.04, 0.32);
  const mediumTrend = clamp((momentum - 42) / 145, -0.025, 0.22);
  const fastTrend = clamp((momentum - 52) / 185, -0.018, 0.12);
  const ignition = clamp((momentum - 60) / 240, -0.015, 0.07);

  return {
    ema5: roundTo(stock.currentPrice / (1 + ignition), 2),
    ema10: roundTo(stock.currentPrice / (1 + fastTrend), 2),
    ema75: roundTo(stock.currentPrice / (1 + mediumTrend), 2),
    ema200: roundTo(stock.currentPrice / (1 + longTrend), 2),
  };
}

function rankZone(zone: DailyStockZone): number {
  if (zone === "zone-1") {
    return 1;
  }

  if (zone === "zone-2") {
    return 2;
  }

  return 3;
}

function calculateEmaSpread(idea: DailyStockIdea): number {
  return (idea.currentPrice - idea.ema200) / idea.ema200;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const multiplier = 10 ** decimals;

  return Math.round(value * multiplier) / multiplier;
}
