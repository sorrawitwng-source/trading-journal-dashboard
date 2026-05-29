import type { PortfolioPosition } from "../types";

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
    typeof position.sector === "string" &&
    typeof position.buyPrice === "number" &&
    (position.quantity === undefined ||
      (typeof position.quantity === "number" && position.quantity >= 0)) &&
    typeof position.currentPrice === "number" &&
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
    quantity: position.quantity ?? 0,
  };
}
