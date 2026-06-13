import { describe, expect, it, vi } from "vitest";
import { requestAiSummary } from "./aiSummary";

describe("aiSummary client", () => {
  it("posts portfolio context and API key to the AI summary endpoint", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({
      json: async () => ({
        fetchedAt: "2026-06-14T00:00:00.000Z",
        model: "gpt-5.2",
        provider: "openai",
        summary: "Market breadth is improving.",
      }),
      ok: true,
      status: 200,
    }));

    const result = await requestAiSummary(
      {
        apiKey: "sk-test-key",
        baseCurrency: "THB",
        language: "en",
        marketFilter: "US",
        mode: "market",
        positions: [
          {
            currentPrice: 220,
            market: "US",
            name: "Apple Inc",
            quantity: 2,
            sector: "Technology",
            symbol: "AAPL",
          },
        ],
      },
      fetcher,
    );

    expect(result.summary).toBe("Market breadth is improving.");
    expect(fetcher).toHaveBeenCalledWith(
      "/api/ai-summary",
      expect.objectContaining({
        method: "POST",
      }),
    );
    const requestInit = fetcher.mock.calls[0]?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      apiKey: "sk-test-key",
      mode: "market",
      positions: [{ symbol: "AAPL" }],
    });
  });

  it("rejects requests without an API key before calling fetch", async () => {
    const fetcher = vi.fn();

    await expect(
      requestAiSummary(
        {
          apiKey: "",
          baseCurrency: "THB",
          language: "en",
          marketFilter: "All",
          mode: "market",
          positions: [],
        },
        fetcher,
      ),
    ).rejects.toThrow("OpenAI API key is required");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
