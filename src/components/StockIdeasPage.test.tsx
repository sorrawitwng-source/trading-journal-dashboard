import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StockIdeasPage } from "./StockIdeasPage";

describe("StockIdeasPage daily ideas", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders daily zone tabs and filters to a selected zone", () => {
    render(<StockIdeasPage language="en" marketFilter="All" />);

    const allTab = screen.getByRole("tab", { name: /All/i });
    const zoneOneTab = screen.getByRole("tab", { name: /Zone 1/i });

    expect(allTab.getAttribute("aria-selected")).toBe("true");

    fireEvent.click(zoneOneTab);

    expect(zoneOneTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Fast movers")).toBeTruthy();
    expect(screen.queryByText("Trend follow")).toBeNull();
    expect(screen.queryByText("Watch base")).toBeNull();
  });

  it("collapses and expands a daily zone", () => {
    render(<StockIdeasPage language="en" marketFilter="All" />);

    const fastMovers = screen.getByText("Fast movers");
    const fastMoversZone = fastMovers.closest("article");

    expect(fastMoversZone).not.toBeNull();
    expect(
      within(fastMoversZone as HTMLElement).getAllByText(/EMA stack/i).length,
    ).toBeGreaterThan(0);

    const collapseButton = within(fastMoversZone as HTMLElement).getByRole("button", {
      name: "Collapse",
    });
    fireEvent.click(collapseButton);

    expect(collapseButton.getAttribute("aria-expanded")).toBe("false");
    expect(
      within(fastMoversZone as HTMLElement).queryAllByText(/EMA stack/i),
    ).toHaveLength(0);

    fireEvent.click(collapseButton);

    expect(collapseButton.getAttribute("aria-expanded")).toBe("true");
    expect(
      within(fastMoversZone as HTMLElement).getAllByText(/EMA stack/i).length,
    ).toBeGreaterThan(0);
  });
});
