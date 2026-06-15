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

  it("saves the Gemini key locally and requests a weekly market summary without extra conditions", async () => {
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
    expect(screen.queryByLabelText("Market question")).toBeNull();
    expect(screen.queryByLabelText("Stock question")).toBeNull();
    expect(screen.queryByLabelText("Stock symbol")).toBeNull();
    expect(screen.queryByRole("button", { name: "Day" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Month" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Asia" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Summarize week" }));

    expect(await screen.findByText(/AAPL sentiment is positive/)).toBeTruthy();
    expect(localStorage.getItem("trading-journal.gemini-api-key.v1")).toBe(
      "gemini-test-key",
    );
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      marketRegion: "US",
      model: "gemini-2.5-flash-lite",
      mode: "market",
      positions: [],
      timeframe: "week",
    });
    expect(JSON.parse(String(requestInit.body))).not.toHaveProperty("question");
    expect(JSON.parse(String(requestInit.body))).not.toHaveProperty("symbol");
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

  it("requests weekly market analysis as an all-stock universe scan without portfolio holdings", async () => {
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
    fireEvent.click(screen.getByRole("button", { name: "Summarize week" }));

    expect(await screen.findByText(/Thai market breadth/)).toBeTruthy();
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      marketRegion: "Thai",
      mode: "market",
      positions: [],
      timeframe: "week",
    });
    expect(JSON.parse(String(requestInit.body))).not.toHaveProperty("question");
    expect(JSON.parse(String(requestInit.body))).not.toHaveProperty("symbol");
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
    fireEvent.click(screen.getByRole("button", { name: "Summarize week" }));

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
    fireEvent.click(screen.getByRole("button", { name: "Summarize week" }));

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

  it("keeps AI summary focused on one weekly market card", () => {
    render(
      <AiSummaryPage
        baseCurrency="THB"
        language="en"
        marketFilter="US"
        positions={[]}
      />,
    );

    expect(screen.getByRole("button", { name: "Summarize week" })).toBeTruthy();
    expect(screen.getByText("Weekly market picture")).toBeTruthy();
    expect(screen.queryByText("Single-stock impact")).toBeNull();
    expect(screen.queryByLabelText("AI market controls")).toBeNull();
  });
});
