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

  it("saves the Gemini key locally and requests a region/timeframe stock summary", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({
      json: async () => ({
        fetchedAt: "2026-06-14T00:00:00.000Z",
        model: "gemini-2.5-flash",
        provider: "gemini",
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

    fireEvent.change(screen.getByLabelText("Gemini API key"), {
      target: { value: "gemini-test-key" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save key" }));
    fireEvent.click(screen.getByRole("button", { name: "Fast" }));
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    fireEvent.click(screen.getByRole("button", { name: "Asia" }));
    fireEvent.change(screen.getByLabelText("Stock symbol"), {
      target: { value: "AAPL" },
    });
    fireEvent.change(screen.getByLabelText("Stock question"), {
      target: { value: "What is the current sentiment and key risk?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze stock" }));

    expect(await screen.findByText(/AAPL sentiment is positive/)).toBeTruthy();
    expect(localStorage.getItem("trading-journal.gemini-api-key.v1")).toBe(
      "gemini-test-key",
    );
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      marketRegion: "Asia",
      model: "gemini-2.5-flash-lite",
      mode: "stock",
      question: "What is the current sentiment and key risk?",
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

  it("requests market analysis as an all-stock universe scan without portfolio holdings", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({
      json: async () => ({
        fetchedAt: "2026-06-14T00:00:00.000Z",
        model: "gemini-2.5-flash",
        provider: "gemini",
        summary: "Thai market breadth is improving across domestic sectors.",
      }),
      ok: true,
    }));

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AiSummaryPage
        baseCurrency="THB"
        language="en"
        marketFilter="Thai"
        positions={[
          {
            buyDate: "2026-06-01",
            buyPrice: 30,
            currency: "THB",
            currentPrice: 36,
            dataQuality: "complete",
            id: "ptt",
            isCustom: false,
            market: "Thai",
            name: "PTT Public Company Limited",
            priceStatus: "live",
            quantity: 500,
            riskLevel: "Medium",
            score: 63,
            sector: "Energy",
            symbol: "PTT",
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Gemini API key"), {
      target: { value: "gemini-test-key" },
    });
    fireEvent.change(screen.getByLabelText("Market question"), {
      target: { value: "Which Thai sectors look strongest today?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze market" }));

    expect(await screen.findByText(/Thai market breadth/)).toBeTruthy();
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      mode: "market",
      positions: [],
      question: "Which Thai sectors look strongest today?",
    });
    expect(screen.queryByText("Portfolio risk check")).toBeNull();
    expect(screen.queryByText("Output focus")).toBeNull();
    expect(screen.queryByText("Market risks to watch")).toBeNull();
  });

  it("renders AI markdown responses as clean summary sections", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({
      json: async () => ({
        fetchedAt: "2026-06-14T00:00:00.000Z",
        model: "gemini-2.5-flash",
        provider: "gemini",
        summary:
          "### Market Regime: Thai Equity Market\n\nThe market is neutral-to-positive.\n\n- Banks and tourism have improving momentum.\n- Energy remains sensitive to oil prices.",
      }),
      ok: true,
    }));

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AiSummaryPage
        baseCurrency="THB"
        language="en"
        marketFilter="Thai"
        positions={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Gemini API key"), {
      target: { value: "gemini-test-key" },
    });
    fireEvent.change(screen.getByLabelText("Market question"), {
      target: { value: "Summarize the Thai market today." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze market" }));

    expect(await screen.findByRole("heading", { name: "Market Regime: Thai Equity Market" })).toBeTruthy();
    expect(screen.queryByText(/###/)).toBeNull();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getByText("The market is neutral-to-positive.")).toBeTruthy();
    expect(screen.getByText("Banks and tourism have improving momentum.")).toBeTruthy();
    expect(screen.getByText("Energy remains sensitive to oil prices.")).toBeTruthy();
  });

  it("turns malformed markdown fragments into explanatory prose", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({
      json: async () => ({
        fetchedAt: "2026-06-14T00:00:00.000Z",
        model: "gemini-2.5-flash",
        provider: "gemini",
        summary:
          "Summary\n\n- **Banks)*: Net Interest Margin trends, credit cost, and asset quality matter for big-cap banks.\n- *",
      }),
      ok: true,
    }));

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AiSummaryPage
        baseCurrency="THB"
        language="en"
        marketFilter="Thai"
        positions={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Gemini API key"), {
      target: { value: "gemini-test-key" },
    });
    fireEvent.change(screen.getByLabelText("Market question"), {
      target: { value: "Explain bank sector impact." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze market" }));

    expect(await screen.findByRole("heading", { name: "Summary" })).toBeTruthy();
    expect(
      screen.getByText(
        "Banks: Net Interest Margin trends, credit cost, and asset quality matter for big-cap banks.",
      ),
    ).toBeTruthy();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.queryByText("*")).toBeNull();
    expect(screen.queryByText(/Banks\)\*/)).toBeNull();
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
