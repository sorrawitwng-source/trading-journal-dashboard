import { describe, expect, it } from "vitest";
import { stockUniverse } from "../data/stocks";
import { createPosition } from "./portfolio";
import { buildPortfolioAnalytics } from "./analytics";

describe("buildPortfolioAnalytics", () => {
  it("builds exposure buckets in the selected base currency", () => {
    const analytics = buildPortfolioAnalytics(
      [
        createPosition("AAPL", 100, 2, stockUniverse),
        createPosition("PTTGC", 30, 10, stockUniverse),
      ],
      { baseCurrency: "THB", usdThbRate: 35 },
    );

    expect(analytics.totalCost).toBe(7300);
    expect(analytics.marketExposure.map((bucket) => bucket.key)).toContain("US");
    expect(analytics.marketExposure.map((bucket) => bucket.key)).toContain("Thai");
    expect(analytics.topHoldings[0]?.symbol).toBe("AAPL");
    expect(analytics.riskSignals).toHaveLength(4);
  });
});
