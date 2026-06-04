import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, Flame, Newspaper, Radar, RefreshCw } from "lucide-react";
import type { MarketFilter } from "../types";
import { stockUniverse } from "../data/stocks";
import {
  type DailyStockIdea,
  type DailyStockZone,
  scanDailyStocks,
} from "../lib/dailyStockScanner";
import {
  applyCachedStockQuotes,
  type PricedStockProfile,
  refreshStockProfilePrices,
} from "../lib/marketData";
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
  const [pricedStockUniverse, setPricedStockUniverse] = useState<PricedStockProfile[]>(
    () => applyCachedStockQuotes(stockUniverse),
  );
  const [dailyPriceError, setDailyPriceError] = useState<string | null>(null);
  const [isRefreshingDailyPrices, setIsRefreshingDailyPrices] = useState(false);
  const [lastDailyPriceUpdate, setLastDailyPriceUpdate] = useState<string | null>(null);
  const visibleThemes = weeklyThemes.filter(
    (theme) => marketFilter === "All" || theme.market === marketFilter,
  );
  const dailyRefreshTargets = useMemo(
    () =>
      scanDailyStocks(stockUniverse, marketFilter)
        .map((idea) =>
          stockUniverse.find(
            (stock) => stock.symbol === idea.symbol && stock.market === idea.market,
          ),
        )
        .filter((stock): stock is (typeof stockUniverse)[number] => stock !== undefined),
    [marketFilter],
  );
  const dailyIdeas = useMemo(
    () => scanDailyStocks(pricedStockUniverse, marketFilter),
    [marketFilter, pricedStockUniverse],
  );
  const symbolCount = new Set(visibleThemes.flatMap((theme) => theme.symbols)).size;
  const sectorCount = new Set(visibleThemes.flatMap((theme) => theme.sectors)).size;
  const signalCounts = {
    hot: visibleThemes.filter((theme) => theme.signal === "hot").length,
    mixed: visibleThemes.filter((theme) => theme.signal === "mixed").length,
    watch: visibleThemes.filter((theme) => theme.signal === "watch").length,
  };

  useEffect(() => {
    let isCurrent = true;

    async function refreshDailyPrices() {
      if (dailyRefreshTargets.length === 0) {
        return;
      }

      setIsRefreshingDailyPrices(true);
      setDailyPriceError(null);

      try {
        const refreshedStocks = await refreshStockProfilePrices(dailyRefreshTargets);

        if (!isCurrent) {
          return;
        }

        setPricedStockUniverse((currentStocks) =>
          mergePricedStocks(currentStocks, refreshedStocks),
        );
        setLastDailyPriceUpdate(new Date().toISOString());
      } catch {
        if (isCurrent) {
          setDailyPriceError(dailyText.priceError);
        }
      } finally {
        if (isCurrent) {
          setIsRefreshingDailyPrices(false);
        }
      }
    }

    setPricedStockUniverse(applyCachedStockQuotes(stockUniverse));
    void refreshDailyPrices();

    return () => {
      isCurrent = false;
    };
  }, [dailyRefreshTargets, dailyText.priceError]);

  async function handleRefreshDailyPrices() {
    if (dailyRefreshTargets.length === 0 || isRefreshingDailyPrices) {
      return;
    }

    setIsRefreshingDailyPrices(true);
    setDailyPriceError(null);

    try {
      const refreshedStocks = await refreshStockProfilePrices(dailyRefreshTargets);

      setPricedStockUniverse((currentStocks) =>
        mergePricedStocks(currentStocks, refreshedStocks),
      );
      setLastDailyPriceUpdate(new Date().toISOString());
    } catch {
      setDailyPriceError(dailyText.priceError);
    } finally {
      setIsRefreshingDailyPrices(false);
    }
  }

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
          <div className="daily-price-actions">
            <span>
              {dailyText.updated}:{" "}
              {lastDailyPriceUpdate
                ? formatUpdatedTime(lastDailyPriceUpdate)
                : formatDate(todayIsoDate(), language)}
            </span>
            <button
              className="secondary-button"
              disabled={isRefreshingDailyPrices || dailyRefreshTargets.length === 0}
              onClick={() => void handleRefreshDailyPrices()}
              type="button"
            >
              <RefreshCw aria-hidden="true" size={15} />
              {isRefreshingDailyPrices ? dailyText.refreshing : dailyText.refreshPrices}
            </button>
          </div>
        </div>
        {dailyPriceError ? <p className="daily-price-error">{dailyPriceError}</p> : null}

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
        <div className="daily-stock-card__visual">
          <MiniSparkline idea={idea} />
          <b>{idea.market}</b>
        </div>
      </div>
      <p>{idea.sector}</p>
      <div className="daily-stock-card__price">
        <strong>{text.price}: {formatNumber(idea.currentPrice)}</strong>
        <span
          className={`price-status price-status--${idea.priceStatus ?? "fallback"}`}
          title={idea.priceUpdatedAt ?? undefined}
        >
          {priceStatusLabel(idea.priceStatus, language)}
        </span>
      </div>
      <div className="daily-stock-card__ema">
        <span>EMA5 {formatNumber(idea.ema5)}</span>
        <span>EMA10 {formatNumber(idea.ema10)}</span>
        <span>EMA75 {formatNumber(idea.ema75)}</span>
        <span>EMA200 {formatNumber(idea.ema200)}</span>
      </div>
      <small>{dailyReason(idea.zone, language)}</small>
    </div>
  );
}

function MiniSparkline({ idea }: { idea: DailyStockIdea }) {
  const values = buildSparklineValues(idea);
  const width = 112;
  const height = 48;
  const padding = 4;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);
  const xForIndex = (index: number) =>
    padding + (index / (values.length - 1)) * (width - padding * 2);
  const yForValue = (value: number) =>
    height - padding - ((value - minValue) / range) * (height - padding * 2);
  const linePoints = values
    .map((value, index) => `${xForIndex(index).toFixed(2)},${yForValue(value).toFixed(2)}`)
    .join(" ");
  const areaPoints = `${padding},${height - padding} ${linePoints} ${
    width - padding
  },${height - padding}`;
  const color = sparklineColor(idea.zone);
  const gradientId = `daily-sparkline-fill-${idea.symbol.replace(/[^a-z0-9]/gi, "-")}`;

  return (
    <svg
      aria-label={`${idea.symbol} trend preview`}
      className="daily-sparkline"
      role="img"
      style={{ "--sparkline-color": color } as CSSProperties}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="daily-sparkline__grid" d="M4 16 H108 M4 32 H108" />
      <polygon fill={`url(#${gradientId})`} points={areaPoints} />
      <polyline className="daily-sparkline__line" points={linePoints} />
      <circle
        className="daily-sparkline__end"
        cx={xForIndex(values.length - 1)}
        cy={yForValue(values.at(-1) ?? idea.currentPrice)}
        r="2.4"
      />
    </svg>
  );
}

function buildSparklineValues(idea: DailyStockIdea): number[] {
  const anchors = [
    idea.ema200,
    blend(idea.ema200, idea.ema75, 0.62),
    idea.ema75,
    blend(idea.ema75, idea.ema10, 0.58),
    idea.ema10,
    blend(idea.ema10, idea.ema5, 0.7),
    idea.ema5,
    blend(idea.ema5, idea.currentPrice, 0.72),
    idea.currentPrice,
  ];
  const symbolSeed = hashSymbol(idea.symbol);
  const intensity = idea.zone === "zone-1" ? 0.018 : idea.zone === "zone-2" ? 0.012 : 0.02;
  const direction = idea.currentPrice >= idea.ema75 ? 1 : -1;
  const values = anchors.flatMap((anchor, index) => {
    if (index === anchors.length - 1) {
      return [idea.currentPrice];
    }

    const next = anchors[index + 1];
    const first = anchor + waveOffset(symbolSeed, index * 2, anchor, intensity, direction);
    const middle =
      blend(anchor, next, 0.54) +
      waveOffset(symbolSeed, index * 2 + 1, anchor, intensity, direction);

    return [first, middle];
  });

  return values.slice(0, -1).concat(idea.currentPrice);
}

function blend(left: number, right: number, ratio: number): number {
  return left + (right - left) * ratio;
}

function waveOffset(
  seed: number,
  index: number,
  baseValue: number,
  intensity: number,
  direction: number,
): number {
  const raw = Math.sin(seed * 0.37 + index * 1.7) * Math.cos(seed * 0.13 + index * 0.9);

  return raw * baseValue * intensity * direction;
}

function hashSymbol(symbol: string): number {
  return symbol.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function sparklineColor(zone: DailyStockZone): string {
  if (zone === "zone-1") {
    return "#23d6bd";
  }

  if (zone === "zone-2") {
    return "#4ea2ff";
  }

  return "#f5be4f";
}

function mergePricedStocks(
  currentStocks: PricedStockProfile[],
  refreshedStocks: PricedStockProfile[],
): PricedStockProfile[] {
  const refreshedByKey = new Map(
    refreshedStocks.map((stock) => [stockKey(stock.symbol, stock.market), stock]),
  );

  return currentStocks.map(
    (stock) => refreshedByKey.get(stockKey(stock.symbol, stock.market)) ?? stock,
  );
}

function stockKey(symbol: string, market: string): string {
  return `${market}:${symbol.trim().toUpperCase()}`;
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

function formatUpdatedTime(value: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function priceStatusLabel(
  status: DailyStockIdea["priceStatus"],
  language: Language,
): string {
  if (status === "live") {
    return language === "th" ? "สด" : "Live";
  }

  if (status === "cached") {
    return language === "th" ? "แคช" : "Cached";
  }

  return language === "th" ? "สำรอง" : "Fallback";
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
    priceError: "Could not refresh Stock Ideas prices right now.",
    refreshPrices: "Refresh prices",
    refreshing: "Refreshing",
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
    priceError: "ยังอัปเดตราคาหน้า Stock Ideas ไม่ได้ตอนนี้",
    refreshPrices: "อัปเดตราคา",
    refreshing: "กำลังอัปเดต",
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
