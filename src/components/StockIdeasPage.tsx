import type { ReactNode } from "react";
import { ArrowUpRight, Flame, Newspaper, Radar } from "lucide-react";
import type { MarketFilter } from "../types";
import { weeklyThemeUpdatedAt, weeklyThemes } from "../lib/weeklyThemes";
import type { Language } from "../lib/scoreText";

interface StockIdeasPageProps {
  language: Language;
  marketFilter: MarketFilter;
}

export function StockIdeasPage({ language, marketFilter }: StockIdeasPageProps) {
  const text = labels[language];
  const uiText = ideaUiLabels[language];
  const visibleThemes = weeklyThemes.filter(
    (theme) => marketFilter === "All" || theme.market === marketFilter,
  );
  const symbolCount = new Set(visibleThemes.flatMap((theme) => theme.symbols)).size;
  const sectorCount = new Set(visibleThemes.flatMap((theme) => theme.sectors)).size;
  const signalCounts = {
    hot: visibleThemes.filter((theme) => theme.signal === "hot").length,
    mixed: visibleThemes.filter((theme) => theme.signal === "mixed").length,
    watch: visibleThemes.filter((theme) => theme.signal === "watch").length,
  };

  return (
    <section className="ideas-page weekly-ideas-page" aria-labelledby="ideas-title">
      <div className="ideas-hero">
        <div className="ideas-hero__copy">
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="ideas-title">{text.title}</h2>
          <p>{text.description}</p>
          <div className="ideas-hero__pulse" aria-label={uiText.marketPulse}>
            <PulsePill
              icon={<Flame size={14} />}
              label={signalText("hot", language)}
              value={signalCounts.hot}
              variant="hot"
            />
            <PulsePill
              icon={<Radar size={14} />}
              label={signalText("mixed", language)}
              value={signalCounts.mixed}
              variant="mixed"
            />
            <PulsePill
              icon={<Newspaper size={14} />}
              label={signalText("watch", language)}
              value={signalCounts.watch}
              variant="watch"
            />
          </div>
        </div>
        <div className="ideas-hero__stat-stack">
          <div className="ideas-hero__stats">
            <strong>{visibleThemes.length}</strong>
            <span>{text.themeCount}</span>
          </div>
          <div className="ideas-hero__stats ideas-hero__stats--quiet">
            <strong>{symbolCount}</strong>
            <span>{text.stockCount}</span>
          </div>
          <div className="ideas-hero__stats ideas-hero__stats--quiet">
            <strong>{sectorCount}</strong>
            <span>{text.sectorCount}</span>
          </div>
          <div className="ideas-hero__updated">
            <span>{uiText.updated}</span>
            <strong>{formatDate(weeklyThemeUpdatedAt, language)}</strong>
          </div>
        </div>
      </div>

      <section className="weekly-themes weekly-themes--full" aria-labelledby="weekly-themes-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text.weeklyEyebrow}</p>
            <h2 id="weekly-themes-title">{text.weeklyTitle}</h2>
            <p>{text.weeklyDescription}</p>
          </div>
          <span>{formatDate(weeklyThemeUpdatedAt, language)}</span>
        </div>

        <div className="weekly-theme-grid weekly-theme-grid--full">
          {visibleThemes.map((theme, index) => (
            <article className={`weekly-theme weekly-theme--${theme.signal}`} key={theme.id}>
              <div className="weekly-theme__glow" aria-hidden="true" />
              <div className="weekly-theme__header">
                <div>
                  <span>{theme.market}</span>
                  <b>{signalText(theme.signal, language)}</b>
                </div>
                <em>{String(index + 1).padStart(2, "0")}</em>
              </div>
              <div className="weekly-theme__title">
                <h3>{theme.title[language]}</h3>
                <div>
                  <span>{theme.symbols.length} {text.stockCount}</span>
                  <span>{theme.sectors.length} {text.sectorCount}</span>
                </div>
              </div>
              <p className="weekly-theme__thesis">{theme.thesis[language]}</p>

              <div className="weekly-theme__section weekly-theme__section--sectors">
                <strong>{text.benefitingSectors}</strong>
                <div className="weekly-theme__chips">
                  {theme.sectors.map((sector) => (
                    <span key={sector}>{sector}</span>
                  ))}
                </div>
              </div>

              <div className="weekly-theme__section">
                <strong>{text.relatedStocks}</strong>
                <div className="weekly-theme__symbols">
                  {theme.symbols.map((symbol) => (
                    <span key={symbol}>{symbol}</span>
                  ))}
                </div>
              </div>

              <a className="weekly-theme__source" href={theme.sourceUrl} rel="noreferrer" target="_blank">
                <span>{text.source}: {theme.sourceLabel}</span>
                <ArrowUpRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function PulsePill({
  icon,
  label,
  value,
  variant,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  variant: "hot" | "mixed" | "watch";
}) {
  return (
    <span className={`ideas-pulse ideas-pulse--${variant}`}>
      {icon}
      <b>{value}</b>
      {label}
    </span>
  );
}

function signalText(signal: "hot" | "mixed" | "watch", language: Language): string {
  const labels = {
    hot: { en: "Hot", th: "เด่น" },
    mixed: { en: "Mixed", th: "เริ่มกระจาย" },
    watch: { en: "Watch", th: "จับตา" },
  };

  return labels[signal][language];
}

const ideaUiLabels = {
  en: {
    marketPulse: "Market pulse",
    updated: "Updated",
  },
  th: {
    marketPulse: "ภาพรวมตลาด",
    updated: "อัปเดต",
  },
};

function formatDate(value: string, language: Language): string {
  return new Intl.DateTimeFormat(language === "th" ? "th-TH-u-ca-gregory" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

const labels = {
  en: {
    benefitingSectors: "Benefiting sectors",
    description:
      "A weekly news-driven watchlist grouped by sectors that are getting fresh market support. Scores are removed from this page.",
    eyebrow: "Weekly Stock Ideas",
    relatedStocks: "Related stocks",
    sectorCount: "sectors",
    source: "Source",
    stockCount: "stocks",
    themeCount: "themes",
    title: "This Week's Sector Ideas",
    weeklyDescription:
      "Use this as a research map for what is moving this week, then verify price action, earnings, and valuation before adding anything to your journal.",
    weeklyEyebrow: "News lens",
    weeklyTitle: "Themes and beneficiaries",
  },
  th: {
    benefitingSectors: "Sector ที่ได้ประโยชน์",
    description:
      "Watchlist จากข่าวรายสัปดาห์ แยกตาม sector ที่มีแรงหนุนใหม่ ตัดระบบคะแนนออกจากหน้านี้แล้ว",
    eyebrow: "ไอเดียหุ้นรายสัปดาห์",
    relatedStocks: "หุ้นที่เกี่ยวข้อง",
    sectorCount: "sector",
    source: "แหล่งข่าว",
    stockCount: "หุ้น",
    themeCount: "ธีม",
    title: "ไอเดียตาม sector ประจำสัปดาห์",
    weeklyDescription:
      "ใช้เป็นแผนที่สำหรับ research ว่าช่วงนี้กลุ่มไหนกำลังขยับ แล้วค่อยตรวจราคา งบ และ valuation ก่อนบันทึกเข้าพอร์ต",
    weeklyEyebrow: "มุมมองจากข่าว",
    weeklyTitle: "ธีมและหุ้นที่ได้ประโยชน์",
  },
};
