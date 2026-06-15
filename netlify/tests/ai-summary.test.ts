import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { _test } = require("../functions/ai-summary.cjs") as {
  _test: {
    buildSummaryPrompt: (payload: Record<string, unknown>) => string;
    extractOutputText: (payload: unknown) => string;
    normalizeMarketRegion: (region: unknown) => "Thai" | "US" | "Asia";
    normalizeModel: (model: unknown) => string;
    normalizeSummaryMode: (mode: unknown) => "market" | "stock";
    normalizeTimeframe: (timeframe: unknown) => "day" | "week" | "month";
  };
};

describe("ai summary helpers", () => {
  it("normalizes summary modes", () => {
    expect(_test.normalizeSummaryMode("stock")).toBe("stock");
    expect(_test.normalizeSummaryMode("bad")).toBe("market");
  });

  it("normalizes market regions and timeframes", () => {
    expect(_test.normalizeMarketRegion("Asia")).toBe("Asia");
    expect(_test.normalizeMarketRegion("bad")).toBe("Thai");
    expect(_test.normalizeTimeframe("month")).toBe("month");
    expect(_test.normalizeTimeframe("bad")).toBe("week");
  });

  it("builds a timeframe and region specific market prompt for the whole stock universe", () => {
    const prompt = _test.buildSummaryPrompt({
      baseCurrency: "THB",
      language: "th",
      marketRegion: "US",
      marketFilter: "Thai",
      mode: "market",
      positions: [
        {
          market: "Thai",
          name: "PTT Public Company Limited",
          quantity: 500,
          sector: "Energy",
          symbol: "PTT",
        },
      ],
      timeframe: "week",
    });

    expect(prompt).toContain("mode: market");
    expect(prompt).toContain("timeframe: week");
    expect(prompt).toContain("target market region: US");
    expect(prompt).toContain("coverage universe: all listed stocks");
    expect(prompt).toContain("Return a concise decision-ready summary");
    expect(prompt).toContain("Do not use Markdown headings");
    expect(prompt).toContain("large-cap and broad-market stock impact");
    expect(prompt).not.toContain("portfolio positions");
    expect(prompt).not.toContain("PTT");
    expect(prompt).not.toContain("Energy");
  });

  it("normalizes Gemini model presets", () => {
    expect(_test.normalizeModel("gemini-2.5-flash-lite")).toBe(
      "gemini-2.5-flash-lite",
    );
    expect(_test.normalizeModel("bad model")).toBe("gemini-3.5-flash");
  });

  it("extracts text from a Gemini generateContent payload", () => {
    expect(
      _test.extractOutputText({
        candidates: [
          {
            content: {
              parts: [{ text: "Summary text" }],
            },
          },
        ],
      }),
    ).toBe("Summary text");
  });
});
