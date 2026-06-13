import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StockScanPage } from "./StockScanPage";

describe("StockScanPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows broker and SET evidence for a direct trusted match", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));

    render(<StockScanPage language="en" marketFilter="All" />);

    fireEvent.change(screen.getByPlaceholderText("Type stock symbol, e.g. AAPL or PTT"), {
      target: { value: "PTT" },
    });

    expect(await screen.findByText("Neutral")).toBeTruthy();
    expect(screen.getAllByText("Negative").length).toBeGreaterThan(0);
    expect(screen.getByText("Direct SET/Broker evidence")).toBeTruthy();
    expect(screen.getAllByText("SET News & Market Alerts").length).toBeGreaterThan(0);
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
