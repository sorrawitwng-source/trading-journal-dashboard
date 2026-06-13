import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AiSummaryPage } from "./AiSummaryPage";

describe("AiSummaryPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves the OpenAI key locally and requests a stock summary", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          fetchedAt: "2026-06-14T00:00:00.000Z",
          model: "gpt-5.2",
          provider: "openai",
          summary: "AAPL sentiment is positive but valuation risk is elevated.",
        }),
        ok: true,
      })),
    );

    render(
      <AiSummaryPage
        baseCurrency="THB"
        language="en"
        marketFilter="US"
        positions={[
          {
            buyDate: "2026-06-01",
            buyPrice: 100,
            currency: "USD",
            currentPrice: 220,
            dataQuality: "complete",
            id: "aapl",
            isCustom: false,
            market: "US",
            name: "Apple Inc",
            priceStatus: "live",
            quantity: 2,
            riskLevel: "Medium",
            score: 61,
            sector: "Technology",
            symbol: "AAPL",
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("OpenAI API key"), {
      target: { value: "sk-test-key" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save key" }));
    fireEvent.change(screen.getByLabelText("Stock symbol"), {
      target: { value: "AAPL" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Summarize stock" }));

    expect(await screen.findByText(/AAPL sentiment is positive/)).toBeTruthy();
    expect(localStorage.getItem("trading-journal.openai-api-key.v1")).toBe(
      "sk-test-key",
    );
  });
});
