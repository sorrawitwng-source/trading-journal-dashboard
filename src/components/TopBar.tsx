import { Moon, Sun } from "lucide-react";
import type { Currency, MarketFilter } from "../types";

export type AppView = "ideas" | "portfolio";

interface TopBarProps {
  activeView: AppView;
  baseCurrency: Currency;
  language: "en" | "th";
  marketFilter: MarketFilter;
  onBaseCurrencyChange: (currency: Currency) => void;
  onLanguageToggle: () => void;
  onViewChange: (view: AppView) => void;
  onMarketFilterChange: (marketFilter: MarketFilter) => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

const marketFilters: MarketFilter[] = ["All", "Thai", "US"];
const baseCurrencies: Currency[] = ["THB", "USD"];
export function TopBar({
  activeView,
  baseCurrency,
  language,
  marketFilter,
  onBaseCurrencyChange,
  onLanguageToggle,
  onViewChange,
  onMarketFilterChange,
  theme,
  onThemeToggle,
}: TopBarProps) {
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const text = labels[language];
  const nextThemeLabel =
    theme === "dark" ? text.switchToLight : text.switchToDark;

  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{activeView === "portfolio" ? text.portfolioTitle : text.ideasTitle}</h1>
      </div>

      <div className="top-bar__controls" aria-label="Dashboard controls">
        <div className="segmented-control" aria-label="Page selector">
          {viewOptions.map((view) => (
            <button
              aria-pressed={activeView === view.value}
              className="segmented-control__button segmented-control__button--wide"
              key={view.value}
              onClick={() => onViewChange(view.value)}
              type="button"
            >
              {text.views[view.value]}
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

        <div className="segmented-control" aria-label={text.baseCurrency}>
          {baseCurrencies.map((currency) => (
            <button
              aria-pressed={baseCurrency === currency}
              className="segmented-control__button"
              key={currency}
              onClick={() => onBaseCurrencyChange(currency)}
              type="button"
            >
              {currency}
            </button>
          ))}
        </div>

        <button
          aria-label={text.languageToggle}
          className="language-button"
          onClick={onLanguageToggle}
          title={text.languageToggle}
          type="button"
        >
          {language === "en" ? "TH" : "EN"}
        </button>

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

const viewOptions: { value: AppView }[] = [
  { value: "portfolio" },
  { value: "ideas" },
];

const labels = {
  en: {
    eyebrow: "Trading Journal",
    ideasTitle: "Stock Ideas",
    languageToggle: "Switch language",
    baseCurrency: "Portfolio currency",
    portfolioTitle: "Portfolio Dashboard",
    switchToDark: "Switch to dark mode",
    switchToLight: "Switch to light mode",
    views: {
      ideas: "Stock Ideas",
      portfolio: "Portfolio",
    },
  },
  th: {
    eyebrow: "บันทึกการเทรด",
    ideasTitle: "หุ้นน่าสนใจ",
    languageToggle: "เปลี่ยนภาษา",
    baseCurrency: "สกุลเงินพอร์ต",
    portfolioTitle: "พอร์ตการลงทุน",
    switchToDark: "เปลี่ยนเป็นโหมดมืด",
    switchToLight: "เปลี่ยนเป็นโหมดสว่าง",
    views: {
      ideas: "หุ้นน่าสนใจ",
      portfolio: "พอร์ต",
    },
  },
};
