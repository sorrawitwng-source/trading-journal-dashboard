import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StockScanPage } from "./StockScanPage";

describe("StockScanPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows positive sentiment and factors for a direct news match", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          fetchedAt: "2026-06-13T00:00:00.000Z",
          items: [
            {
              category: "company",
              datetime: 1781308800,
              headline: "Apple AI platform demand lifts sentiment",
              id: "aapl-news",
              impact: "Positive catalyst",
              market: "US",
              relatedSymbols: ["AAPL"],
              sectors: ["Technology"],
              signal: "hot",
              source: "Finnhub",
              summary: "AI platform demand remains constructive.",
              url: "https://example.com/aapl",
            },
          ],
          provider: "finnhub",
          status: "live",
        }),
        ok: true,
      })),
    );

    render(<StockScanPage language="en" marketFilter="All" />);

    fireEvent.change(screen.getByPlaceholderText("Type stock symbol, e.g. AAPL or PTT"), {
      target: { value: "AAPL" },
    });

    expect((await screen.findAllByText("Positive")).length).toBeGreaterThan(0);
    expect(screen.getByText("Direct news")).toBeTruthy();
    expect(screen.getByText("Apple AI platform demand lifts sentiment")).toBeTruthy();
  });

  it("shows an unknown state when no symbol evidence exists", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));

    render(<StockScanPage language="en" marketFilter="All" />);

    fireEvent.change(screen.getByPlaceholderText("Type stock symbol, e.g. AAPL or PTT"), {
      target: { value: "NOPE" },
    });

    expect(await screen.findByText("No signal")).toBeTruthy();
    expect(screen.getByText("Data gap")).toBeTruthy();
  });
});
