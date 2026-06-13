import type { Currency, MarketFilter } from "../types";

export type AppView = "ai" | "analytics" | "ideas" | "news" | "portfolio" | "scan";
export type AppTheme = "dark" | "light";

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
const viewOptions: { value: AppView }[] = [
  { value: "portfolio" },
  { value: "analytics" },
  { value: "scan" },
  { value: "ideas" },
  { value: "ai" },
  { value: "news" },
];

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
  const marketLabel = text.markets[marketFilter];

  return (
    <header className="top-bar">
      <div className="top-bar__identity">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{text.titles[activeView]}</h1>
      </div>

      <div className="top-bar__context" aria-label={text.contextLabel}>
        <span>{text.descriptions[activeView]}</span>
        <div className="top-bar__context-pills">
          <b>{text.marketPrefix}: {marketLabel}</b>
          <b>{text.currencyPrefix}: {baseCurrency}</b>
        </div>
      </div>

      <div className="top-bar__controls" aria-label={text.dashboardControls}>
        <div className="top-bar__nav-row">
          <div className="segmented-control segmented-control--views" aria-label={text.pageSelector}>
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
          <div className="segmented-control" aria-label={text.marketSelector}>
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
                {text.themeLabels[themeOption]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

const labels = {
  en: {
    baseCurrency: "Portfolio currency",
    contextLabel: "Current workspace context",
    currencyPrefix: "Currency",
    dashboardControls: "Dashboard controls",
    descriptions: {
      ai: "ChatGPT market and stock summaries from your portfolio context.",
      analytics: "Portfolio exposure, concentration, and monthly trading quality.",
      ideas: "Sector ideas, daily momentum, and research queues.",
      news: "Filtered headlines mapped to sectors and related stocks.",
      portfolio: "Holdings, cost basis, P/L, and benchmark comparison.",
      scan: "SET and broker-sourced evidence for each stock.",
    },
    eyebrow: "Trading Journal",
    languageToggle: "Switch language",
    marketPrefix: "Market",
    marketSelector: "Market selector",
    markets: {
      All: "All markets",
      Thai: "Thai market",
      US: "US market",
    },
    pageSelector: "Page selector",
    themeLabels: {
      dark: "Dark",
      light: "Light",
    },
    themeMode: "Theme mode",
    titles: {
      ai: "ChatGPT Summary",
      analytics: "Portfolio Analytics",
      ideas: "Stock Ideas",
      news: "News Scanner",
      portfolio: "Portfolio Dashboard",
      scan: "Evidence Scan",
    },
    views: {
      ai: "AI Summary",
      analytics: "Analytics",
      ideas: "Stock Ideas",
      news: "News",
      portfolio: "Portfolio",
      scan: "Stock Scan",
    },
  },
  th: {
    baseCurrency: "สกุลเงินพอร์ต",
    contextLabel: "บริบทของหน้าปัจจุบัน",
    currencyPrefix: "ค่าเงิน",
    dashboardControls: "ตัวควบคุมแดชบอร์ด",
    descriptions: {
      ai: "สรุปตลาดและหุ้นรายตัวด้วย ChatGPT จากบริบทพอร์ตของคุณ",
      analytics: "ดูสัดส่วนพอร์ต ความกระจุกตัว คุณภาพข้อมูล และผลงานรายเดือน",
      ideas: "ไอเดียหุ้นตาม sector หุ้นซิ่งรายวัน และคิวสำหรับ research ต่อ",
      news: "ข่าวที่กรองแล้ว จับคู่กับ sector และหุ้นที่เกี่ยวข้อง",
      portfolio: "รายการหุ้น ต้นทุน กำไร/ขาดทุน และเทียบ benchmark",
      scan: "สแกนข่าวรายหุ้นจาก SET และบทวิเคราะห์โบรกเกอร์",
    },
    eyebrow: "บันทึกการเทรด",
    languageToggle: "เปลี่ยนภาษา",
    marketPrefix: "ตลาด",
    marketSelector: "เลือกตลาด",
    markets: {
      All: "ทุกตลาด",
      Thai: "ตลาดไทย",
      US: "ตลาดสหรัฐฯ",
    },
    pageSelector: "เลือกหน้า",
    themeLabels: {
      dark: "มืด",
      light: "สว่าง",
    },
    themeMode: "ธีมหน้าจอ",
    titles: {
      ai: "สรุปด้วย ChatGPT",
      analytics: "วิเคราะห์พอร์ต",
      ideas: "หุ้นน่าสนใจ",
      news: "สแกนข่าว",
      portfolio: "Portfolio Dashboard",
      scan: "สแกนหุ้นจาก SET/โบรกเกอร์",
    },
    views: {
      ai: "AI สรุป",
      analytics: "วิเคราะห์",
      ideas: "หุ้นน่าสนใจ",
      news: "ข่าว",
      portfolio: "พอร์ต",
      scan: "สแกนหุ้น",
    },
  },
} satisfies Record<
  "en" | "th",
  {
    baseCurrency: string;
    contextLabel: string;
    currencyPrefix: string;
    dashboardControls: string;
    descriptions: Record<AppView, string>;
    eyebrow: string;
    languageToggle: string;
    marketPrefix: string;
    marketSelector: string;
    markets: Record<MarketFilter, string>;
    pageSelector: string;
    themeLabels: Record<AppTheme, string>;
    themeMode: string;
    titles: Record<AppView, string>;
    views: Record<AppView, string>;
  }
>;
