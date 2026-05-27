import { describe, expect, it } from "vitest";
import { stockUniverse } from "./stocks";

const bySymbol = (symbol: string) =>
  stockUniverse.find((stock) => stock.symbol === symbol);

describe("stockUniverse", () => {
  it("includes Thai SET100 names such as PTTGC", () => {
    expect(bySymbol("PTTGC")).toMatchObject({
      market: "Thai",
      name: "PTT Global Chemical Public Company Limited",
    });
  });

  it("includes S&P 500 and Nasdaq-100 symbols", () => {
    expect(bySymbol("BRK.B")).toMatchObject({ market: "US" });
    expect(bySymbol("ASML")).toMatchObject({ market: "US" });
  });

  it("expands beyond the original small mock list", () => {
    expect(stockUniverse.length).toBeGreaterThanOrEqual(600);
  });
});
