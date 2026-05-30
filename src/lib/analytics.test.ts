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

  it("summarizes performance by trade month", () => {
    const analytics = buildPortfolioAnalytics(
      [
        createPosition("AAPL", 100, 2, stockUniverse, "2026-05-30"),
        createPosition("MSFT", 400, 1, stockUniverse, "2026-05-12", 360, "2026-05-20"),
        createPosition("PTT", 30, 100, stockUniverse, "2026-04-09", 36, "2026-04-30"),
      ],
      { baseCurrency: "THB", usdThbRate: 35 },
    );

    expect(analytics.monthlyPerformance.map((month) => month.key)).toEqual([
      "2026-05",
      "2026-04",
    ]);

    expect(analytics.monthlyPerformance[0]).toMatchObject({
      key: "2026-05",
      openCount: 1,
      soldCount: 1,
      tradeCount: 2,
      winRate: 50,
    });
    expect(analytics.monthlyPerformance[0]?.bestTrade?.symbol).toBe("AAPL");
    expect(analytics.monthlyPerformance[0]?.worstTrade?.symbol).toBe("MSFT");

    expect(analytics.monthlyPerformance[1]).toMatchObject({
      key: "2026-04",
      openCount: 0,
      soldCount: 1,
      tradeCount: 1,
      winRate: 100,
    });
  });
});
