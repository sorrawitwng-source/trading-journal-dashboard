import { describe, expect, it } from "vitest";
import { scanDailyStocks } from "../lib/dailyStockScanner";
import { dailySmallCapUniverse } from "./dailySmallCaps";

describe("dailySmallCapUniverse", () => {
  it("contains Thai and US small-cap momentum candidates", () => {
    expect(dailySmallCapUniverse.some((stock) => stock.market === "Thai")).toBe(true);
    expect(dailySmallCapUniverse.some((stock) => stock.market === "US")).toBe(true);
    expect(dailySmallCapUniverse.length).toBeGreaterThanOrEqual(20);
  });

  it("marks daily ideas with small-cap metadata", () => {
    const ideas = scanDailyStocks(dailySmallCapUniverse, "All");

    expect(ideas.length).toBeGreaterThan(0);
    expect(ideas.every((idea) => idea.dailyTheme)).toBe(true);
    expect(ideas.every((idea) => idea.liquidityRisk)).toBe(true);
    expect(
      ideas.every((idea) =>
        ["micro", "small", "mid"].includes(idea.sizeProfile ?? ""),
      ),
    ).toBe(true);
  });
});
