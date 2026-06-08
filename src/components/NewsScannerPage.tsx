import { ArrowUpRight, Newspaper, RefreshCw, Search, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MarketFilter } from "../types";
import {
  loadNewsScan,
  marketMatches,
  type NewsScanItem,
  type NewsScanResult,
  type NewsSignal,
} from "../lib/newsScanner";
import type { Language } from "../lib/scoreText";

interface NewsScannerPageProps {
  language: Language;
  marketFilter: MarketFilter;
}

type SignalFilter = "all" | NewsSignal;

const signalFilters: SignalFilter[] = ["all", "hot", "mixed", "watch"];

export function NewsScannerPage({ language, marketFilter }: NewsScannerPageProps) {
  const text = labels[language];
  const [newsResult, setNewsResult] = useState<NewsScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedSignal, setSelectedSignal] = useState<SignalFilter>("all");

  const refreshNews = async () => {
    setIsLoading(true);

    try {
      setNewsResult(await loadNewsScan(marketFilter));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    loadNewsScan(marketFilter)
      .then((result) => {
        if (isActive) {
          setNewsResult(result);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [marketFilter]);

  useEffect(() => {
    setSelectedSector("all");
  }, [marketFilter]);

  const marketItems = useMemo(
    () => (newsResult?.items ?? []).filter((item) => marketMatches(item, marketFilter)),
    [marketFilter, newsResult],
  );
  const sectorOptions = useMemo(() => buildSectorOptions(marketItems), [marketItems]);
  const filteredItems = useMemo(
    () =>
      marketItems.filter((item) => {
        const query = searchTerm.trim().toLowerCase();
        const matchesSignal = selectedSignal === "all" || item.signal === selectedSignal;
        const matchesSector =
          selectedSector === "all" || item.sectors.includes(selectedSector);
        const matchesSearch =
          !query ||
          [
            item.title[language],
            item.summary[language],
            item.source,
            ...item.sectors,
            ...item.symbols,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);

        return matchesSignal && matchesSector && matchesSearch;
      }),
    [language, marketItems, searchTerm, selectedSector, selectedSignal],
  );
  const radar = useMemo(() => buildRadar(marketItems), [marketItems]);
  const liveCount = marketItems.filter((item) => item.provider === "finnhub").length;
  const hotCount = marketItems.filter((item) => item.signal === "hot").length;

  return (
    <section className="news-scanner-page" aria-labelledby="news-scanner-title">
      <section className="news-scanner-hero">
        <div className="news-scanner-hero__copy">
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="news-scanner-title">{text.title}</h2>
          <p>{text.subtitle}</p>
          <div className="news-scanner-hero__badges" aria-label={text.status}>
            <span className={`news-status news-status--${newsResult?.status ?? "fallback"}`}>
              {newsResult?.status === "live" ? text.live : text.curated}
            </span>
            <span>{text.updated} {formatDate(newsResult?.fetchedAt, language)}</span>
          </div>
        </div>

        <div className="news-scanner-metrics" aria-label={text.snapshot}>
          <MetricTile label={text.signals} value={String(marketItems.length)} />
          <MetricTile label={text.hotSignals} value={String(hotCount)} tone="positive" />
          <MetricTile label={text.liveItems} value={String(liveCount)} />
        </div>
      </section>

      <section className="news-filter-panel" aria-label={text.filters}>
        <label className="news-search">
          <Search aria-hidden="true" size={16} />
          <input
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={text.searchPlaceholder}
            type="search"
            value={searchTerm}
          />
        </label>

        <div className="news-signal-tabs" role="tablist" aria-label={text.signalFilter}>
          {signalFilters.map((signal) => (
            <button
              aria-selected={selectedSignal === signal}
              key={signal}
              onClick={() => setSelectedSignal(signal)}
              role="tab"
              type="button"
            >
              {signalLabel(signal, language)}
            </button>
          ))}
        </div>

        <button
          className="secondary-button news-refresh-button"
          disabled={isLoading}
          onClick={() => void refreshNews()}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={15} />
          {isLoading ? text.refreshing : text.refresh}
        </button>
      </section>

      <div className="news-sector-strip" aria-label={text.sectorFilter}>
        <button
          aria-pressed={selectedSector === "all"}
          onClick={() => setSelectedSector("all")}
          type="button"
        >
          {text.allSectors}
        </button>
        {sectorOptions.map((sector) => (
          <button
            aria-pressed={selectedSector === sector}
            key={sector}
            onClick={() => setSelectedSector(sector)}
            type="button"
          >
            {sector}
          </button>
        ))}
      </div>

      <div className="news-scanner-layout">
        <section className="news-feed-panel" aria-labelledby="news-feed-title">
          <div className="section-heading section-heading--with-action">
            <div>
              <p className="eyebrow">{text.feedEyebrow}</p>
              <h2 id="news-feed-title">{text.feedTitle}</h2>
            </div>
            <span className="news-result-count">{filteredItems.length}</span>
          </div>

          <div className="news-card-grid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <NewsCard item={item} key={item.id} language={language} />
              ))
            ) : (
              <div className="empty-state empty-state--compact">
                <strong>{text.emptyTitle}</strong>
                <span>{text.emptyDescription}</span>
              </div>
            )}
          </div>
        </section>

        <aside className="news-radar-panel" aria-labelledby="news-radar-title">
          <div className="section-heading">
            <p className="eyebrow">{text.radarEyebrow}</p>
            <h2 id="news-radar-title">{text.radarTitle}</h2>
          </div>

          <div className="news-radar-list">
            {radar.topSectors.map((sector) => (
              <div className="news-radar-row" key={sector.name}>
                <span>{sector.name}</span>
                <strong>{sector.count}</strong>
              </div>
            ))}
          </div>

          <div className="news-symbol-cloud" aria-label={text.relatedStocks}>
            {radar.symbols.map((symbol) => (
              <span key={symbol}>{symbol}</span>
            ))}
          </div>

          <div className="news-radar-note">
            <Zap aria-hidden="true" size={16} />
            <span>{text.radarNote}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function NewsCard({
  item,
  language,
}: {
  item: NewsScanItem;
  language: Language;
}) {
  const text = labels[language];

  return (
    <article className={`news-card news-card--${item.signal}`}>
      <div className="news-card__topline">
        <span>{item.market}</span>
        <b>{signalLabel(item.signal, language)}</b>
        <em>{item.provider === "finnhub" ? text.live : text.curated}</em>
      </div>
      <h3>{item.title[language]}</h3>
      <p>{item.summary[language] || text.noSummary}</p>

      <div className="news-card__chips">
        <span>{item.impact[language]}</span>
        {item.sectors.slice(0, 4).map((sector) => (
          <span key={sector}>{sector}</span>
        ))}
      </div>

      <div className="news-card__symbols">
        <Newspaper aria-hidden="true" size={15} />
        {item.symbols.length > 0 ? (
          item.symbols.slice(0, 10).map((symbol) => <span key={symbol}>{symbol}</span>)
        ) : (
          <small>{text.noSymbols}</small>
        )}
      </div>

      <a className="news-card__source" href={item.sourceUrl} rel="noreferrer" target="_blank">
        <span>{item.source}</span>
        <time>{formatDate(item.publishedAt, language)}</time>
        <ArrowUpRight aria-hidden="true" size={15} />
      </a>
    </article>
  );
}

function MetricTile({
  label,
  tone = "neutral",
  value,
}: {
  label: string;
  tone?: "neutral" | "positive";
  value: string;
}) {
  return (
    <div className={`news-metric news-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildSectorOptions(items: NewsScanItem[]) {
  return Array.from(new Set(items.flatMap((item) => item.sectors))).slice(0, 14);
}

function buildRadar(items: NewsScanItem[]) {
  const sectorCounts = new Map<string, number>();
  const symbolCounts = new Map<string, number>();

  for (const item of items) {
    for (const sector of item.sectors) {
      sectorCounts.set(sector, (sectorCounts.get(sector) ?? 0) + 1);
    }

    for (const symbol of item.symbols) {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) ?? 0) + 1);
    }
  }

  return {
    symbols: [...symbolCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 20)
      .map(([symbol]) => symbol),
    topSectors: [...sectorCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([name, count]) => ({ count, name })),
  };
}

function signalLabel(signal: SignalFilter, language: Language) {
  const text = signalLabels[language];

  if (signal === "all") {
    return text.all;
  }

  return text[signal];
}

function formatDate(value: string | undefined, language: Language) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const signalLabels = {
  en: {
    all: "All",
    hot: "Hot",
    mixed: "Rotation",
    watch: "Watch",
  },
  th: {
    all: "ทั้งหมด",
    hot: "มาแรง",
    mixed: "หมุนกลุ่ม",
    watch: "เฝ้าระวัง",
  },
};

const labels = {
  en: {
    allSectors: "All sectors",
    curated: "Curated",
    emptyDescription: "Try another signal, sector, or search keyword.",
    emptyTitle: "No news matches this scan",
    eyebrow: "News Scanner",
    feedEyebrow: "Filtered tape",
    feedTitle: "News flow",
    filters: "News filters",
    hotSignals: "Hot",
    live: "Live",
    liveItems: "Live feed",
    noSummary: "Open the source for the full context.",
    noSymbols: "No direct ticker map",
    radarEyebrow: "Sector radar",
    radarNote: "Use this radar as a first research queue, then confirm with price, volume, and your own trade plan.",
    radarTitle: "What the news is pushing",
    refresh: "Refresh news",
    refreshing: "Refreshing",
    relatedStocks: "Related stocks",
    searchPlaceholder: "Search headline, ticker, sector",
    sectorFilter: "Sector filter",
    signalFilter: "Signal filter",
    signals: "Signals",
    snapshot: "News snapshot",
    status: "News data status",
    subtitle: "A filtered market tape that maps headlines into sectors and related stocks.",
    title: "News Scanner",
    updated: "Updated",
  },
  th: {
    allSectors: "ทุกกลุ่ม",
    curated: "คัดแล้ว",
    emptyDescription: "ลองเปลี่ยนสัญญาณ กลุ่มธุรกิจ หรือคำค้นหา",
    emptyTitle: "ยังไม่มีข่าวตรงเงื่อนไข",
    eyebrow: "สแกนข่าว",
    feedEyebrow: "ข่าวที่กรองแล้ว",
    feedTitle: "กระแสข่าว",
    filters: "ตัวกรองข่าว",
    hotSignals: "มาแรง",
    live: "สด",
    liveItems: "ข่าวสด",
    noSummary: "เปิดแหล่งข่าวเพื่ออ่านบริบทเต็ม",
    noSymbols: "ยังไม่มี ticker ตรง",
    radarEyebrow: "เรดาร์กลุ่มหุ้น",
    radarNote: "ใช้หน้านี้เป็นคิว research แรก แล้วค่อยยืนยันด้วยราคา volume และแผนเทรดของตัวเอง",
    radarTitle: "ข่าวกำลังดันกลุ่มไหน",
    refresh: "อัปเดตข่าว",
    refreshing: "กำลังอัปเดต",
    relatedStocks: "หุ้นที่เกี่ยวข้อง",
    searchPlaceholder: "ค้นหาหัวข่าว ticker หรือกลุ่มธุรกิจ",
    sectorFilter: "กรองกลุ่มธุรกิจ",
    signalFilter: "กรองสัญญาณ",
    signals: "สัญญาณ",
    snapshot: "ภาพรวมข่าว",
    status: "สถานะข้อมูลข่าว",
    subtitle: "เทปข่าวที่กรองแล้ว พร้อมจับคู่ข่าวเข้ากลุ่มธุรกิจและหุ้นที่เกี่ยวข้อง",
    title: "News Scanner",
    updated: "อัปเดต",
  },
};
