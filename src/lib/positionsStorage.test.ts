import { beforeEach, describe, expect, it } from "vitest";
import { createPosition } from "./portfolio";
import {
  loadStoredPositions,
  saveStoredPositions,
  storedPositionsKey,
} from "./positionsStorage";
import { stockUniverse } from "../data/stocks";

describe("positionsStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads portfolio positions", () => {
    const positions = [
      createPosition("AAPL", 150, 2, stockUniverse),
      createPosition("PTTGC", 36, 4, stockUniverse),
    ];

    saveStoredPositions(positions);

    expect(loadStoredPositions()).toEqual(positions);
  });

  it("returns an empty list when storage is empty or invalid", () => {
    expect(loadStoredPositions()).toEqual([]);

    localStorage.setItem(storedPositionsKey, "{bad json");

    expect(loadStoredPositions()).toEqual([]);
  });

  it("defaults missing stored quantity, currency, and buy date for older saved positions", () => {
    localStorage.setItem(
      storedPositionsKey,
      JSON.stringify([
        {
          buyPrice: 150,
          currentPrice: 160,
          id: "AAPL-legacy",
          isCustom: false,
          market: "US",
          name: "Apple Inc.",
          riskLevel: "Low",
          score: 70,
          sector: "Technology",
          symbol: "AAPL",
        },
      ]),
    );

    expect(loadStoredPositions()[0]).toMatchObject({
      buyDate: expect.any(String),
      currency: "USD",
      quantity: 0,
    });
  });

  it("keeps optional trade journal and risk plan fields", () => {
    const position = createPosition("AAPL", 150, 2, stockUniverse, {
      journal: {
        emotion: "Patient",
        stopLoss: 140,
        strategyTag: "Pullback",
        targetPrice: 180,
        tradeNote: "Review after earnings",
        tradeReason: "Trend continuation",
      },
    });

    saveStoredPositions([position]);

    expect(loadStoredPositions()[0]).toMatchObject({
      emotion: "Patient",
      stopLoss: 140,
      strategyTag: "Pullback",
      targetPrice: 180,
      tradeNote: "Review after earnings",
      tradeReason: "Trend continuation",
    });
  });
});
