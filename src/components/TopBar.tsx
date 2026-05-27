import { Moon, Sun } from "lucide-react";
import type { MarketFilter } from "../types";

interface TopBarProps {
  marketFilter: MarketFilter;
  onMarketFilterChange: (marketFilter: MarketFilter) => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

const marketFilters: MarketFilter[] = ["All", "Thai", "US"];

export function TopBar({
  marketFilter,
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
        <h1>Portfolio Dashboard</h1>
      </div>

      <div className="top-bar__controls" aria-label="Dashboard controls">
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
