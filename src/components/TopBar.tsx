import { Moon, Sun } from "lucide-react";
import type { MarketFilter } from "../types";

export type AppView = "ideas" | "portfolio";

interface TopBarProps {
  activeView: AppView;
  marketFilter: MarketFilter;
  onViewChange: (view: AppView) => void;
  onMarketFilterChange: (marketFilter: MarketFilter) => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

const marketFilters: MarketFilter[] = ["All", "Thai", "US"];
const views: { label: string; value: AppView }[] = [
  { label: "Portfolio", value: "portfolio" },
  { label: "Stock Ideas", value: "ideas" },
];

export function TopBar({
  activeView,
  marketFilter,
  onViewChange,
  onMarketFilterChange,
  theme,
  onThemeToggle,
}: TopBarProps) {
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const nextThemeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">Trading Journal</p>
        <h1>{activeView === "portfolio" ? "Portfolio Dashboard" : "Stock Ideas"}</h1>
      </div>

      <div className="top-bar__controls" aria-label="Dashboard controls">
        <div className="segmented-control" aria-label="Page selector">
          {views.map((view) => (
            <button
              aria-pressed={activeView === view.value}
              className="segmented-control__button segmented-control__button--wide"
              key={view.value}
              onClick={() => onViewChange(view.value)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </div>

        <div className="segmented-control" aria-label="Market selector">
          {marketFilters.map((filter) => (
            <button
              aria-pressed={marketFilter === filter}
              className="segmented-control__button"
              key={filter}
              onClick={() => onMarketFilterChange(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        <button
          aria-label={nextThemeLabel}
          className="icon-button"
          onClick={onThemeToggle}
          title={nextThemeLabel}
          type="button"
        >
          <ThemeIcon aria-hidden="true" size={18} />
        </button>
      </div>
    </header>
  );
}
