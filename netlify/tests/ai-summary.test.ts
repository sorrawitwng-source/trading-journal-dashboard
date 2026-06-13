import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { _test } = require("../functions/ai-summary.cjs") as {
  _test: {
    buildSummaryPrompt: (payload: Record<string, unknown>) => string;
    extractOutputText: (payload: unknown) => string;
    normalizeSummaryMode: (mode: unknown) => "market" | "stock";
  };
};

describe("ai summary helpers", () => {
  it("normalizes summary modes", () => {
    expect(_test.normalizeSummaryMode("stock")).toBe("stock");
    expect(_test.normalizeSummaryMode("bad")).toBe("market");
  });

  it("builds a market prompt from portfolio context", () => {
    const prompt = _test.buildSummaryPrompt({
      baseCurrency: "THB",
      language: "th",
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
    });

    expect(prompt).toContain("mode: market");
    expect(prompt).toContain("PTT");
    expect(prompt).toContain("Energy");
  });

  it("extracts text from a Responses API payload", () => {
    expect(
      _test.extractOutputText({
        output: [
          {
            content: [
              {
                text: "Summary text",
                type: "output_text",
              },
            ],
            type: "message",
          },
        ],
      }),
    ).toBe("Summary text");
  });
});
