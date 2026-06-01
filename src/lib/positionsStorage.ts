import type { PortfolioPosition } from "../types";
import { currencyForMarket } from "./portfolio";

export const storedPositionsKey = "trading-journal.positions.v1";

export function loadStoredPositions(
  storage: Storage = localStorage,
): PortfolioPosition[] {
  try {
    const rawValue = storage.getItem(storedPositionsKey);

    if (!rawValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    return Array.isArray(parsedValue)
      ? parsedValue.filter(isPortfolioPosition).map(withDefaultQuantity)
      : [];
  } catch {
    return [];
  }
}

export function saveStoredPositions(
  positions: PortfolioPosition[],
  storage: Storage = localStorage,
) {
  try {
    storage.setItem(storedPositionsKey, JSON.stringify(positions));
  } catch {
    // Storage can fail in private mode or when quota is full. The app should keep running.
  }
}

function isPortfolioPosition(value: unknown): value is PortfolioPosition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const position = value as Partial<PortfolioPosition>;

  return (
    typeof position.id === "string" &&
    typeof position.symbol === "string" &&
    typeof position.name === "string" &&
    (position.market === "Thai" ||
      position.market === "US" ||
      position.market === "Custom") &&
    (position.currency === undefined ||
      position.currency === "THB" ||
      position.currency === "USD") &&
    typeof position.sector === "string" &&
    (position.buyDate === undefined ||
      (typeof position.buyDate === "string" && isValidDateText(position.buyDate))) &&
    typeof position.buyPrice === "number" &&
    (position.quantity === undefined ||
      (typeof position.quantity === "number" && position.quantity >= 0)) &&
    typeof position.currentPrice === "number" &&
    (position.sellPrice === undefined ||
      (typeof position.sellPrice === "number" && position.sellPrice > 0)) &&
    (position.sellDate === undefined ||
      (typeof position.sellDate === "string" && isValidDateText(position.sellDate))) &&
    (position.stopLoss === undefined ||
      (typeof position.stopLoss === "number" && position.stopLoss > 0)) &&
    (position.targetPrice === undefined ||
      (typeof position.targetPrice === "number" && position.targetPrice > 0)) &&
    (position.strategyTag === undefined ||
      typeof position.strategyTag === "string") &&
    (position.tradeReason === undefined ||
      typeof position.tradeReason === "string") &&
    (position.tradeNote === undefined ||
      typeof position.tradeNote === "string") &&
    (position.emotion === undefined || typeof position.emotion === "string") &&
    (position.priceStatus === undefined ||
      position.priceStatus === "live" ||
      position.priceStatus === "cached" ||
      position.priceStatus === "fallback") &&
    (position.priceUpdatedAt === undefined ||
      typeof position.priceUpdatedAt === "string") &&
    (position.dataQuality === undefined ||
      position.dataQuality === "complete" ||
      position.dataQuality === "partial" ||
      position.dataQuality === "limited" ||
      position.dataQuality === "no-data") &&
    (typeof position.score === "number" || position.score === null) &&
    (position.riskLevel === "Low" ||
      position.riskLevel === "Medium" ||
      position.riskLevel === "High" ||
      position.riskLevel === "No data") &&
    (position.riskReason === undefined ||
      typeof position.riskReason === "string") &&
    typeof position.isCustom === "boolean"
  );
}

function withDefaultQuantity(position: PortfolioPosition): PortfolioPosition {
  return {
    ...position,
    buyDate: position.buyDate ?? todayDateString(),
    currency: position.currency ?? currencyForMarket(position.market),
    quantity: position.quantity ?? 0,
  };
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function isValidDateText(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
