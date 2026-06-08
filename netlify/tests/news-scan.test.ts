import { describe, expect, it } from "vitest";

const { _test } = require("../functions/news-scan.cjs") as {
  _test: {
    classifySectors: (text: string) => string[];
    classifySignal: (text: string) => "hot" | "mixed" | "watch";
    normalizeCategory: (category: string) => string;
    normalizeSymbols: (symbols: string) => string[];
    parseFinnhubNews: (payload: Record<string, unknown>) => {
      headline: string;
      market: string;
      relatedSymbols: string[];
      sectors: string[];
      signal: "hot" | "mixed" | "watch";
    } | null;
  };
};

describe("news scanner helpers", () => {
  it("classifies positive catalysts", () => {
    expect(_test.classifySignal("Company shares surge after strong contract win")).toBe(
      "hot",
    );
  });

  it("classifies risk headlines", () => {
    expect(_test.classifySignal("Stock falls after lawsuit warning")).toBe("watch");
  });

  it("normalizes category and symbols safely", () => {
    expect(_test.normalizeCategory("general")).toBe("general");
    expect(_test.normalizeCategory("invalid")).toBe("general");
    expect(_test.normalizeSymbols("AAPL, NVDA, bad symbol")).toEqual(["AAPL", "NVDA"]);
  });

  it("parses Finnhub news payloads into scanner items", () => {
    const item = _test.parseFinnhubNews({
      category: "company",
      datetime: 1770000000,
      headline: "Nvidia rally continues as AI data center demand grows",
      id: 123,
      related: "NVDA,MSFT",
      source: "Example",
      summary: "AI server and chip demand remains strong.",
      url: "https://example.com/news",
    });

    expect(item).toMatchObject({
      headline: "Nvidia rally continues as AI data center demand grows",
      market: "US",
      relatedSymbols: ["NVDA", "MSFT"],
      signal: "hot",
    });
    expect(item?.sectors).toContain("AI Infrastructure");
  });
});
