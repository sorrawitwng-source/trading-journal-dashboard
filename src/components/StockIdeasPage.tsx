import type { ReactNode } from "react";
import { ArrowUpRight, Flame, Newspaper, Radar } from "lucide-react";
import type { MarketFilter } from "../types";
import { stockUniverse } from "../data/stocks";
import {
  type DailyStockIdea,
  type DailyStockZone,
  scanDailyStocks,
} from "../lib/dailyStockScanner";
import { weeklyThemeUpdatedAt, weeklyThemes } from "../lib/weeklyThemes";
import type { Language } from "../lib/scoreText";

interface StockIdeasPageProps {
  language: Language;
  marketFilter: MarketFilter;
}

export function StockIdeasPage({ language, marketFilter }: StockIdeasPageProps) {
  const text = labels[language];
  const uiText = ideaUiLabels[language];
  const dailyText = dailyStockLabels[language];
  const visibleThemes = weeklyThemes.filter(
    (theme) => marketFilter === "All" || theme.market === marketFilter,
  );
  const dailyIdeas = scanDailyStocks(stockUniverse, marketFilter);
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

      <section className="daily-stocks" aria-labelledby="daily-stocks-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{dailyText.eyebrow}</p>
            <h2 id="daily-stocks-title">{dailyText.title}</h2>
            <p>{dailyText.description}</p>
          </div>
          <span>{dailyText.updated}: {formatDate(todayIsoDate(), language)}</span>
        </div>

        <div className="daily-method-grid" aria-label={dailyText.method}>
          <MethodCard label="Zone 1" value={dailyText.zone1Method} />
          <MethodCard label="Zone 2" value={dailyText.zone2Method} />
          <MethodCard label="Zone 3" value={dailyText.zone3Method} />
        </div>

        <div className="daily-zone-grid">
          {(["zone-1", "zone-2", "zone-3"] as DailyStockZone[]).map((zone) => {
            const ideas = dailyIdeas.filter((idea) => idea.zone === zone).slice(0, 6);

            return (
              <article className={`daily-zone daily-zone--${zone}`} key={zone}>
                <div className="daily-zone__header">
                  <div>
                    <span>{zoneLabel(zone, language)}</span>
                    <strong>{zoneTitle(zone, language)}</strong>
                  </div>
                  <b>{ideas.length}</b>
                </div>
                <div className="daily-stock-list">
                  {ideas.length > 0 ? (
                    ideas.map((idea) => (
                      <DailyStockCard idea={idea} key={idea.symbol} language={language} />
                    ))
                  ) : (
                    <p className="daily-stock-empty">{dailyText.noIdeas}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

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

function MethodCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="daily-method-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DailyStockCard({
  idea,
  language,
}: {
  idea: DailyStockIdea;
  language: Language;
}) {
  const text = dailyStockLabels[language];

  return (
    <div className="daily-stock-card">
      <div className="daily-stock-card__head">
        <div>
          <strong>{idea.symbol}</strong>
          <span>{idea.name}</span>
        </div>
        <b>{idea.market}</b>
      </div>
      <p>{idea.sector}</p>
      <div className="daily-stock-card__ema">
        <span>{text.price}: {formatNumber(idea.currentPrice)}</span>
        <span>EMA5 {formatNumber(idea.ema5)}</span>
        <span>EMA10 {formatNumber(idea.ema10)}</span>
        <span>EMA75 {formatNumber(idea.ema75)}</span>
        <span>EMA200 {formatNumber(idea.ema200)}</span>
      </div>
      <small>{dailyReason(idea.zone, language)}</small>
    </div>
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

function zoneLabel(zone: DailyStockZone, language: Language): string {
  const labels = {
    "zone-1": { en: "Zone 1", th: "Zone 1" },
    "zone-2": { en: "Zone 2", th: "Zone 2" },
    "zone-3": { en: "Zone 3", th: "Zone 3" },
  };

  return labels[zone][language];
}

function zoneTitle(zone: DailyStockZone, language: Language): string {
  const labels = {
    "zone-1": { en: "Fast movers", th: "หุ้นซิ่งแรง" },
    "zone-2": { en: "Trend follow", th: "ตามเทรนด์" },
    "zone-3": { en: "Watch base", th: "เฝ้าดูฐาน" },
  };

  return labels[zone][language];
}

function dailyReason(zone: DailyStockZone, language: Language): string {
  const labels = {
    "zone-1": {
      en: "Price is above a full bullish EMA stack. Best for research when volume and news confirm.",
      th: "ราคาอยู่เหนือ EMA ครบชุด เหมาะสำหรับ research ต่อเมื่อ volume และข่าวยืนยัน",
    },
    "zone-2": {
      en: "Trend still holds above the main EMA stack, but short-term speed is less aggressive.",
      th: "เทรนด์ยังอยู่เหนือ EMA หลัก แต่แรงระยะสั้นยังไม่จัดเท่า Zone 1",
    },
    "zone-3": {
      en: "Main trend base is still positive, but momentum needs confirmation before chasing.",
      th: "ฐานเทรนด์หลักยังบวก แต่ momentum ต้องรอยืนยันก่อนตามราคา",
    },
  };

  return labels[zone][language];
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
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

const dailyStockLabels = {
  en: {
    description:
      "Daily momentum candidates from an EMA-zone model using available market data. Use this as a research shortlist, then confirm live chart, volume, and news before trading.",
    eyebrow: "Daily Stock",
    method: "Daily stock method",
    noIdeas: "No daily candidates match this market filter.",
    price: "Price",
    title: "Fast movers by EMA zones",
    updated: "Updated",
    zone1Method: "Price > EMA5 > EMA10 > EMA75 > EMA200",
    zone2Method: "Price > EMA10 > EMA75 > EMA200",
    zone3Method: "Price > EMA75 > EMA200",
  },
  th: {
    description:
      "หุ้นซิ่งรายวันจากโมเดล EMA Zone ตามข้อมูลที่มี ใช้เป็น shortlist สำหรับ research แล้วค่อยยืนยันกราฟจริง volume และข่าวก่อนเทรด",
    eyebrow: "Daily Stock",
    method: "วิธีคัดหุ้นซิ่ง",
    noIdeas: "ยังไม่มีตัวที่เข้าเงื่อนไขในตลาดนี้",
    price: "ราคา",
    title: "หุ้นซิ่งตาม EMA Zone",
    updated: "อัปเดต",
    zone1Method: "ราคา > EMA5 > EMA10 > EMA75 > EMA200",
    zone2Method: "ราคา > EMA10 > EMA75 > EMA200",
    zone3Method: "ราคา > EMA75 > EMA200",
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
