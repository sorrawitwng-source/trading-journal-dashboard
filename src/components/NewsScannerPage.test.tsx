import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsScannerPage } from "./NewsScannerPage";

describe("NewsScannerPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders live Finnhub news and filters by signal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          fetchedAt: "2026-06-08T00:00:00.000Z",
          items: [
            {
              category: "company",
              datetime: 1770000000,
              headline: "AI data center contract sends shares higher",
              id: "live-1",
              impact: "Positive catalyst",
              market: "US",
              relatedSymbols: ["NVDA", "VRT"],
              sectors: ["AI Infrastructure"],
              signal: "hot",
              source: "Finnhub",
              summary: "Demand for AI servers and data center power remains strong.",
              url: "https://example.com/ai-data-center",
            },
          ],
          provider: "finnhub",
          status: "live",
        }),
        ok: true,
      })),
    );

    render(<NewsScannerPage language="en" marketFilter="All" />);

    expect(await screen.findByText("AI data center contract sends shares higher")).toBeTruthy();
    expect(screen.getAllByText("Live").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: "Watch" }));

    expect(screen.queryByText("AI data center contract sends shares higher")).toBeNull();
  });

  it("falls back to curated weekly themes when live news is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));

    render(<NewsScannerPage language="en" marketFilter="Thai" />);

    expect(
      await screen.findByText(
        "Thai rotation favors laggards, healthcare, tourism, and dividends",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("Quality tech and energy lead this week's US filter")).toBeNull();
  });
});
