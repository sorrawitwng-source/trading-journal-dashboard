import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AiSummaryPage } from "./AiSummaryPage";

describe("AiSummaryPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves the OpenAI key locally and requests a region/timeframe stock summary", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({
      json: async () => ({
        fetchedAt: "2026-06-14T00:00:00.000Z",
        model: "gpt-5.2",
        provider: "openai",
        summary: "AAPL sentiment is positive but valuation risk is elevated.",
      }),
      ok: true,
    }));

    vi.stubGlobal(
      "fetch",
      fetchMock,
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
    fireEvent.click(screen.getByRole("button", { name: "Fast" }));
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    fireEvent.click(screen.getByRole("button", { name: "Asia" }));
    fireEvent.change(screen.getByLabelText("Stock symbol"), {
      target: { value: "AAPL" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze stock" }));

    expect(await screen.findByText(/AAPL sentiment is positive/)).toBeTruthy();
    expect(localStorage.getItem("trading-journal.openai-api-key.v1")).toBe(
      "sk-test-key",
    );
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      marketRegion: "Asia",
      model: "gpt-5.4-mini",
      mode: "stock",
      symbol: "AAPL",
      timeframe: "month",
    });
  });

  it("uses model preset buttons instead of a free text model field", () => {
    render(
      <AiSummaryPage
        baseCurrency="THB"
        language="en"
        marketFilter="US"
        positions={[]}
      />,
    );

    expect(screen.queryByRole("textbox", { name: "Model" })).toBeNull();
    expect(screen.getByRole("button", { name: "Best" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Balanced" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fast" })).toBeTruthy();
  });

  it("keeps timeframe and market selectors in the market analysis card", () => {
    render(
      <AiSummaryPage
        baseCurrency="THB"
        language="en"
        marketFilter="US"
        positions={[]}
      />,
    );

    const analyzeButton = screen.getByRole("button", { name: "Analyze market" });
    const marketCard = analyzeButton.closest("article");

    expect(marketCard).not.toBeNull();
    expect(within(marketCard as HTMLElement).getByRole("button", { name: "Month" })).toBeTruthy();
    expect(within(marketCard as HTMLElement).getByRole("button", { name: "Asia" })).toBeTruthy();
  });
});
