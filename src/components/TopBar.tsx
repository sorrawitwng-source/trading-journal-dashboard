import type { Currency, MarketFilter } from "../types";

export type AppView = "analytics" | "ideas" | "news" | "portfolio" | "scan";
export type AppTheme = "dark" | "light";
type ExistingAppView = Exclude<AppView, "scan">;

interface TopBarProps {
  activeView: AppView;
  baseCurrency: Currency;
  language: "en" | "th";
  marketFilter: MarketFilter;
  onBaseCurrencyChange: (currency: Currency) => void;
  onLanguageToggle: () => void;
  onViewChange: (view: AppView) => void;
  onMarketFilterChange: (marketFilter: MarketFilter) => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

const marketFilters: MarketFilter[] = ["All", "Thai", "US"];
const baseCurrencies: Currency[] = ["THB", "USD"];
const themeOptions: AppTheme[] = ["dark", "light"];

const themeLabels: Record<"en" | "th", Record<AppTheme, string>> = {
  en: {
    dark: "Dark",
    light: "Light",
  },
  th: {
    dark: "มืด",
    light: "สว่าง",
  },
};

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
  onThemeChange,
}: TopBarProps) {
  const text = labels[language];
  const contextText = viewDescription(activeView, language);
  const marketLabel = marketLabels[language][marketFilter];

  return (
    <header className="top-bar">
      <div className="top-bar__identity">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{viewTitle(activeView, language, text)}</h1>
      </div>

      <div className="top-bar__context" aria-label={contextLabels[language]}>
        <span>{contextText}</span>
        <div className="top-bar__context-pills">
          <b>{marketPrefixes[language]}: {marketLabel}</b>
          <b>{currencyPrefixes[language]}: {baseCurrency}</b>
        </div>
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
                {viewLabel(view.value, language, text)}
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

          <div className="segmented-control theme-control" aria-label={text.themeMode}>
            {themeOptions.map((themeOption) => (
              <button
                aria-pressed={theme === themeOption}
                className="segmented-control__button theme-control__button"
                key={themeOption}
                onClick={() => onThemeChange(themeOption)}
                type="button"
              >
                {themeLabels[language][themeOption]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

const viewOptions: { value: AppView }[] = [
  { value: "portfolio" },
  { value: "analytics" },
  { value: "scan" },
  { value: "ideas" },
  { value: "news" },
];

const contextLabels = {
  en: "Current workspace context",
  th: "บริบทหน้าปัจจุบัน",
};

const currencyPrefixes = {
  en: "Currency",
  th: "ค่าเงิน",
};

const marketPrefixes = {
  en: "Market",
  th: "ตลาด",
};

const marketLabels: Record<"en" | "th", Record<MarketFilter, string>> = {
  en: {
    All: "All markets",
    Thai: "Thai market",
    US: "US market",
  },
  th: {
    All: "ทุกตลาด",
    Thai: "ตลาดไทย",
    US: "ตลาดสหรัฐ",
  },
};

const viewDescriptions: Record<"en" | "th", Record<ExistingAppView, string>> = {
  en: {
    analytics: "Portfolio exposure, concentration, and monthly trading quality.",
    ideas: "Sector ideas, daily momentum, and research queues.",
    news: "Filtered headlines mapped to sectors and related stocks.",
    portfolio: "Holdings, cost basis, P/L, and benchmark comparison.",
  },
  th: {
    analytics: "ดูสัดส่วนพอร์ต ความกระจุกตัว และคุณภาพการเทรดรายเดือน",
    ideas: "ไอเดียตามกลุ่ม หุ้นซิ่งรายวัน และคิวสำหรับ research ต่อ",
    news: "กรองข่าวสำคัญ จับคู่เข้ากลุ่มธุรกิจและหุ้นที่เกี่ยวข้อง",
    portfolio: "รายการถือครอง ต้นทุน กำไรขาดทุน และเทียบ benchmark",
  },
};

function viewDescription(view: AppView, language: "en" | "th"): string {
  if (view === "scan") {
    return scanViewText[language].description;
  }

  return viewDescriptions[language][view];
}

function viewTitle(
  view: AppView,
  language: "en" | "th",
  text: (typeof labels)["en"],
): string {
  if (view === "scan") {
    return scanViewText[language].title;
  }

  return text.titles[view];
}

function viewLabel(
  view: AppView,
  language: "en" | "th",
  text: (typeof labels)["en"],
): string {
  if (view === "scan") {
    return scanViewText[language].label;
  }

  return text.views[view];
}

const scanViewText = {
  en: {
    description: "Ticker-level sentiment from news, themes, and profile factors.",
    label: "Stock Scan",
    title: "Stock Scan",
  },
  th: {
    description: "สแกน sentiment รายหุ้นจากข่าว ธีม และปัจจัยในระบบ",
    label: "สแกนหุ้น",
    title: "สแกนหุ้น",
  },
};

const labels = {
  en: {
    eyebrow: "Trading Journal",
    languageToggle: "Switch language",
    baseCurrency: "Portfolio currency",
    themeMode: "Theme mode",
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
    themeMode: "ธีมหน้าจอ",
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
