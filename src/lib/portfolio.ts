import type { PortfolioPosition, StockProfile } from "../types";
import { riskLabel, scoreStock } from "./scoring";

interface PortfolioSummary {
  totalCost: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  averageScore: number | null;
}

export function createPosition(
  symbol: string,
  buyPrice: number,
  universe: StockProfile[],
): PortfolioPosition {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const stock = universe.find(
    (item) => item.symbol.toUpperCase() === normalizedSymbol,
  );

  if (!stock) {
    return {
      id: createPositionId(normalizedSymbol),
      symbol: normalizedSymbol,
      name: normalizedSymbol,
      market: "Custom",
      sector: "Unclassified",
      buyPrice,
      currentPrice: buyPrice,
      priceStatus: "fallback",
      score: null,
      riskLevel: "Medium",
      isCustom: true,
    };
  }

  return {
    id: createPositionId(stock.symbol),
    symbol: stock.symbol,
    name: stock.name,
    market: stock.market,
    sector: stock.sector,
    buyPrice,
    currentPrice: stock.currentPrice,
    priceStatus: "fallback",
    score: scoreStock(stock),
    riskLevel: riskLabel(stock.risk),
    isCustom: false,
  };
}

export function updatePosition(
  id: string,
  symbol: string,
  buyPrice: number,
  universe: StockProfile[],
): PortfolioPosition {
  return {
    ...createPosition(symbol, buyPrice, universe),
    id,
  };
}

export function unrealizedProfitLoss(
  buyPrice: number,
  currentPrice: number,
): { amount: number; percent: number } {
  const amount = currentPrice - buyPrice;
  const percent = buyPrice === 0 ? 0 : (amount / buyPrice) * 100;

  return {
    amount: roundCurrency(amount),
    percent: roundPercent(percent),
  };
}

export function summarizePortfolio(
  positions: PortfolioPosition[],
): PortfolioSummary {
  const totalCost = roundCurrency(
    positions.reduce((sum, position) => sum + position.buyPrice, 0),
  );
  const totalValue = roundCurrency(
    positions.reduce((sum, position) => sum + position.currentPrice, 0),
  );
  const totalProfitLoss = roundCurrency(totalValue - totalCost);
  const totalProfitLossPercent =
    totalCost === 0 ? 0 : roundPercent((totalProfitLoss / totalCost) * 100);
  const scoredPositions = positions.filter(
    (position): position is PortfolioPosition & { score: number } =>
      position.score !== null,
  );
  const averageScore =
    scoredPositions.length === 0
      ? null
      : roundPercent(
          scoredPositions.reduce((sum, position) => sum + position.score, 0) /
            scoredPositions.length,
        );

  return {
    totalCost,
    totalValue,
    totalProfitLoss,
    totalProfitLossPercent,
    averageScore,
  };
}

function createPositionId(symbol: string): string {
  return `${symbol}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function roundCurrency(value: number): number {
  return roundTo(value, 2);
}

function roundPercent(value: number): number {
  return roundTo(value, 2);
}

function roundTo(value: number, decimals: number): number {
  const multiplier = 10 ** decimals;

  return Math.round(value * multiplier) / multiplier;
}
