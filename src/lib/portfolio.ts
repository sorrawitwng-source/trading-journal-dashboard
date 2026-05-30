import type { Currency, Market, PortfolioPosition, StockProfile } from "../types";
import { buildScoreBreakdown, riskLabel, scoreStock } from "./scoring";

interface PortfolioSummary {
  baseCurrency: Currency;
  totalCost: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  averageScore: number | null;
}

interface PortfolioSummaryOptions {
  baseCurrency: Currency;
  usdThbRate: number;
}

export const fallbackUsdThbRate = 36.5;

export function createPosition(
  symbol: string,
  buyPrice: number,
  quantity: number,
  universe: StockProfile[],
  buyDate = todayDateString(),
  sellPrice?: number,
  sellDate?: string,
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
      sectorSource: "unknown",
      buyDate,
      buyPrice,
      currency: "USD",
      quantity,
      currentPrice: buyPrice,
      priceStatus: "fallback",
      dataQuality: "no-data",
      score: null,
      scoreBreakdown: buildScoreBreakdown({
        currentPrice: buyPrice,
        dividend: null,
        market: "Custom",
        momentum: null,
        name: normalizedSymbol,
        risk: null,
        sector: "Unclassified",
        sectorSource: "unknown",
        symbol: normalizedSymbol,
        valuation: null,
        volatility: null,
      }),
      riskLevel: "No data",
      riskReason: "Custom symbols need verified market data before risk can be assessed.",
      isCustom: true,
      ...(sellPrice !== undefined ? { sellPrice } : {}),
      ...(sellDate ? { sellDate } : {}),
    };
  }
  const scoreBreakdown = buildScoreBreakdown(stock);
  const risk = riskLabel(stock.risk, stock.volatility);

  return {
    id: createPositionId(stock.symbol),
    symbol: stock.symbol,
    name: stock.name,
    market: stock.market,
    sector: stock.sector,
    sectorSource: stock.sectorSource,
    buyDate,
    buyPrice,
    currency: currencyForMarket(stock.market),
    quantity,
    currentPrice: stock.currentPrice,
    priceStatus: "fallback",
    dataQuality: scoreBreakdown.dataQuality,
    score: scoreStock(stock),
    scoreBreakdown,
    riskLevel: risk.level,
    riskReason: risk.reason,
    isCustom: false,
    ...(sellPrice !== undefined ? { sellPrice } : {}),
    ...(sellDate ? { sellDate } : {}),
  };
}

export function updatePosition(
  id: string,
  symbol: string,
  buyPrice: number,
  quantity: number,
  universe: StockProfile[],
  buyDate = todayDateString(),
  sellPrice?: number,
  sellDate?: string,
): PortfolioPosition {
  return {
    ...createPosition(symbol, buyPrice, quantity, universe, buyDate, sellPrice, sellDate),
    id,
  };
}

export function unrealizedProfitLoss(
  buyPrice: number,
  currentPrice: number,
  quantity: number,
): { amount: number; percent: number } {
  const amount = (currentPrice - buyPrice) * quantity;
  const percent =
    buyPrice === 0 ? 0 : ((currentPrice - buyPrice) / buyPrice) * 100;

  return {
    amount: roundCurrency(amount),
    percent: roundPercent(percent),
  };
}

export function summarizePortfolio(
  positions: PortfolioPosition[],
  options: PortfolioSummaryOptions = {
    baseCurrency: "USD",
    usdThbRate: fallbackUsdThbRate,
  },
): PortfolioSummary {
  const totalCost = roundCurrency(
    positions.reduce(
      (sum, position) =>
        sum +
        convertCurrency(
          position.buyPrice * position.quantity,
          positionCurrency(position),
          options.baseCurrency,
          options.usdThbRate,
        ),
      0,
    ),
  );
  const totalValue = roundCurrency(
    positions.reduce(
      (sum, position) =>
        sum +
        convertCurrency(
          positionExitPrice(position) * position.quantity,
          positionCurrency(position),
          options.baseCurrency,
          options.usdThbRate,
        ),
      0,
    ),
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
    baseCurrency: options.baseCurrency,
    totalCost,
    totalValue,
    totalProfitLoss,
    totalProfitLossPercent,
    averageScore,
  };
}

export function positionExitPrice(position: PortfolioPosition): number {
  return position.sellPrice ?? position.currentPrice;
}

export function positionStatus(position: PortfolioPosition): "open" | "sold" {
  return position.sellPrice !== undefined && position.sellDate ? "sold" : "open";
}

export function convertCurrency(
  value: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  usdThbRate: number,
): number {
  if (fromCurrency === toCurrency) {
    return roundCurrency(value);
  }

  if (fromCurrency === "USD" && toCurrency === "THB") {
    return roundCurrency(value * usdThbRate);
  }

  return roundCurrency(value / usdThbRate);
}

export function currencyForMarket(market: Market): Currency {
  return market === "Thai" ? "THB" : "USD";
}

export function positionCurrency(position: PortfolioPosition): Currency {
  return position.currency ?? currencyForMarket(position.market);
}

function createPositionId(symbol: string): string {
  return `${symbol}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
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
