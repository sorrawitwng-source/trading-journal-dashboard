import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("renders the trading workspace navigation", () => {
    const onViewChange = vi.fn();

    render(
      <TopBar
        activeView="portfolio"
        baseCurrency="THB"
        language="en"
        marketFilter="All"
        onBaseCurrencyChange={vi.fn()}
        onLanguageToggle={vi.fn()}
        onMarketFilterChange={vi.fn()}
        onThemeChange={vi.fn()}
        onViewChange={onViewChange}
        theme="dark"
      />,
    );

    expect(within(screen.getByLabelText("Page selector")).getAllByRole("button")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Portfolio" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Analytics" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Stock Scan" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Stock Ideas" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "News" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "News" }));

    expect(onViewChange).toHaveBeenCalledWith("news");
  });
});





