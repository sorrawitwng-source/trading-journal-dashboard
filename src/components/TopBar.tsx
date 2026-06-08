import { Moon, Sun } from "lucide-react";
import type { Currency, MarketFilter } from "../types";

export type AppView = "analytics" | "ideas" | "news" | "portfolio";

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
      <div className="top-bar__identity">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{text.titles[activeView]}</h1>
      </div>

      <div className="top-bar__controls" aria-label="Dashboard controls">
        <div className="top-bar__nav-row">
          <div className="segmented-control segmented-control--views" aria-label="Page selector">
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
        </div>

        <div className="top-bar__filter-row">
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
      </div>
    </header>
  );
}

const viewOptions: { value: AppView }[] = [
  { value: "portfolio" },
  { value: "analytics" },
  { value: "ideas" },
  { value: "news" },
];

const labels = {
  en: {
    eyebrow: "Trading Journal",
    languageToggle: "Switch language",
    baseCurrency: "Portfolio currency",
    switchToDark: "Switch to dark mode",
    switchToLight: "Switch to light mode",
    titles: {
      analytics: "Portfolio Analytics",
      ideas: "Stock Ideas",
      news: "News Scanner",
      portfolio: "Portfolio Dashboard",
    },
    views: {
      analytics: "Analytics",
      ideas: "Stock Ideas",
      news: "News",
      portfolio: "Portfolio",
    },
  },
  th: {
    eyebrow: "บันทึกการเทรด",
    languageToggle: "เปลี่ยนภาษา",
    baseCurrency: "สกุลเงินพอร์ต",
    switchToDark: "เปลี่ยนเป็นโหมดมืด",
    switchToLight: "เปลี่ยนเป็นโหมดสว่าง",
    titles: {
      analytics: "วิเคราะห์พอร์ต",
      ideas: "หุ้นน่าสนใจ",
      news: "สแกนข่าว",
      portfolio: "พอร์ตการลงทุน",
    },
    views: {
      analytics: "วิเคราะห์",
      ideas: "หุ้นน่าสนใจ",
      news: "ข่าว",
      portfolio: "พอร์ต",
    },
  },
};
