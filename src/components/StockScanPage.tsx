import { ArrowUpRight, RefreshCw, Search, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { dailySmallCapUniverse } from "../data/dailySmallCaps";
import { stockUniverse } from "../data/stocks";
import {
  loadNewsScan,
  type NewsScanItem,
  type NewsScanResult,
} from "../lib/newsScanner";
import type { Language } from "../lib/scoreText";
import {
  analyzeStockSentiment,
  normalizeScanSymbol,
  type StockSentimentFactor,
  type StockSentimentResult,
  type StockSentimentTone,
} from "../lib/stockSentiment";
import type { MarketFilter, StockProfile } from "../types";

interface StockScanPageProps {
  language: Language;
  marketFilter: MarketFilter;
}

const suggestedSymbols = ["AAPL", "NVDA", "PTT", "DELTA", "CPALL", "SKY"];

export function StockScanPage({ language, marketFilter }: StockScanPageProps) {
  const text = labels[language];
  const [scanInput, setScanInput] = useState("");
  const [newsResult, setNewsResult] = useState<NewsScanResult | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const profiles = useMemo(() => mergeProfiles([...stockUniverse, ...dailySmallCapUniverse]), []);
  const newsItems = newsResult?.items ?? [];
  const result = useMemo(
    () =>
      scanInput.trim()
        ? analyzeStockSentiment({
            marketFilter,
            newsItems,
            profiles,
            symbol: scanInput,
          })
        : null,
    [marketFilter, newsItems, profiles, scanInput],
  );
  const headlineNews = result ? [...result.directNews, ...result.sectorNews].slice(0, 5) : [];

  async function refreshNews() {
    setIsLoadingNews(true);

    try {
      setNewsResult(await loadNewsScan(marketFilter, "30d"));
    } finally {
      setIsLoadingNews(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    setIsLoadingNews(true);
    loadNewsScan(marketFilter, "30d")
      .then((nextResult) => {
        if (isActive) {
          setNewsResult(nextResult);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingNews(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [marketFilter]);

  return (
    <section className="stock-scan-page" aria-labelledby="stock-scan-title">
      <section className="stock-scan-hero">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="stock-scan-title">{text.title}</h2>
          <p>{text.subtitle}</p>
        </div>
        <div className="stock-scan-status">
          <span>{text.newsWindow}</span>
          <strong>{formatDate(newsResult?.fetchedAt, language)}</strong>
          <button
            className="secondary-button"
            disabled={isLoadingNews}
            onClick={() => void refreshNews()}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={15} />
            {isLoadingNews ? text.refreshing : text.refresh}
          </button>
        </div>
      </section>

      <section className="stock-scan-input-panel" aria-label={text.inputLabel}>
        <label className="stock-scan-input">
          <Search aria-hidden="true" size={18} />
          <input
            autoComplete="off"
            onChange={(event) => setScanInput(event.target.value)}
            placeholder={text.placeholder}
            value={scanInput}
          />
        </label>
        <div className="stock-scan-suggestions" aria-label={text.suggestions}>
          {suggestedSymbols.map((symbol) => (
            <button key={symbol} onClick={() => setScanInput(symbol)} type="button">
              {symbol}
            </button>
          ))}
        </div>
      </section>

      {result ? (
        <StockScanResult
          language={language}
          newsItems={headlineNews}
          result={result}
          symbol={normalizeScanSymbol(scanInput)}
        />
      ) : (
        <div className="stock-scan-empty">
          <strong>{text.emptyTitle}</strong>
          <span>{text.emptyDescription}</span>
        </div>
      )}
    </section>
  );
}

function StockScanResult({
  language,
  newsItems,
  result,
  symbol,
}: {
  language: Language;
  newsItems: NewsScanItem[];
  result: StockSentimentResult;
  symbol: string;
}) {
  const text = labels[language];
  const Icon = sentimentIcon(result.sentiment);

  return (
    <div className="stock-scan-result">
      <article className={`stock-scan-verdict stock-scan-verdict--${result.sentiment}`}>
        <div>
          <span>{result.matchedProfile?.market ?? text.unknownMarket}</span>
          <span>{result.confidence.toUpperCase()}</span>
        </div>
        <strong>{symbol}</strong>
        <h3>{result.matchedProfile?.name ?? text.unknownStock}</h3>
        <div className="stock-scan-scoreline">
          <Icon aria-hidden="true" size={22} />
          <b>{sentimentMark(result.sentiment)}</b>
          <span>{sentimentText(result.sentiment, language)}</span>
        </div>
        <p>{verdictSummary(result, language)}</p>
      </article>

      <section className="stock-scan-factors" aria-label={text.factorTitle}>
        <div className="section-heading">
          <p className="eyebrow">{text.factorEyebrow}</p>
          <h2>{text.factorTitle}</h2>
        </div>
        <div className="stock-scan-factor-grid">
          {result.factors.map((factor) => (
            <FactorCard factor={factor} key={`${factor.id}-${factor.score}`} language={language} />
          ))}
        </div>
      </section>

      <section className="stock-scan-news" aria-label={text.newsTitle}>
        <div className="section-heading section-heading--with-action">
          <div>
            <p className="eyebrow">{text.newsEyebrow}</p>
            <h2>{text.newsTitle}</h2>
          </div>
          <span className="news-result-count">{newsItems.length}</span>
        </div>
        {newsItems.length > 0 ? (
          <div className="stock-scan-news-list">
            {newsItems.map((item) => (
              <a href={item.sourceUrl} key={item.id} rel="noreferrer" target="_blank">
                <div>
                  <span>{item.source}</span>
                  <b>{sentimentText(signalTone(item.signal), language)}</b>
                </div>
                <strong>{item.title[language]}</strong>
                <small>{formatDate(item.publishedAt, language)}</small>
                <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--compact">
            <strong>{text.noNewsTitle}</strong>
            <span>{text.noNewsDescription}</span>
          </div>
        )}
      </section>
    </div>
  );
}

function FactorCard({
  factor,
  language,
}: {
  factor: StockSentimentFactor;
  language: Language;
}) {
  return (
    <article className={`stock-scan-factor stock-scan-factor--${factor.tone}`}>
      <span>{factorTitle(factor, language)}</span>
      <strong>{factorDetail(factor, language)}</strong>
      <small>{factor.sources?.join(" / ") ?? factorScoreText(factor.score)}</small>
    </article>
  );
}

function mergeProfiles(profiles: StockProfile[]): StockProfile[] {
  const seen = new Set<string>();
  const mergedProfiles: StockProfile[] = [];

  for (const profile of profiles) {
    const key = `${profile.market}:${profile.symbol}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    mergedProfiles.push(profile);
  }

  return mergedProfiles;
}

function signalTone(signal: NewsScanItem["signal"]): StockSentimentTone {
  if (signal === "hot") {
    return "positive";
  }

  if (signal === "watch") {
    return "negative";
  }

  return "neutral";
}

function sentimentIcon(sentiment: StockSentimentTone) {
  if (sentiment === "positive") {
    return TrendingUp;
  }

  if (sentiment === "negative") {
    return TrendingDown;
  }

  return ShieldAlert;
}

function sentimentMark(sentiment: StockSentimentTone) {
  if (sentiment === "positive") {
    return "+";
  }

  if (sentiment === "negative") {
    return "-";
  }

  return "0";
}

function sentimentText(sentiment: StockSentimentTone, language: Language) {
  const text = {
    negative: { en: "Negative", th: "ลบ" },
    neutral: { en: "Neutral", th: "กลาง" },
    positive: { en: "Positive", th: "บวก" },
    unknown: { en: "No signal", th: "ข้อมูลไม่พอ" },
  };

  return text[sentiment][language];
}

function verdictSummary(result: StockSentimentResult, language: Language) {
  if (result.sentiment === "unknown") {
    return language === "th"
      ? "ยังไม่มีข่าวหรือข้อมูลในระบบพอสำหรับสรุป sentiment ของหุ้นตัวนี้"
      : "There is not enough matched news or profile data to form a sentiment call yet.";
  }

  const newsCount = result.directNews.length + result.sectorNews.length;

  return language === "th"
    ? `คะแนนสุทธิ ${result.score.toFixed(2)} จากข่าว/ธีม ${newsCount} รายการ และข้อมูลพื้นฐานที่มีในระบบ`
    : `Net score ${result.score.toFixed(2)} from ${newsCount} news/theme matches and available profile data.`;
}

function factorTitle(factor: StockSentimentFactor, language: Language) {
  const labels = {
    "data-gap": { en: "Data gap", th: "ข้อมูลไม่พอ" },
    "direct-news": { en: "Direct news", th: "ข่าวตรงตัวหุ้น" },
    dividend: { en: "Dividend support", th: "แรงหนุนปันผล" },
    momentum: { en: "Momentum", th: "โมเมนตัม" },
    risk: { en: "Risk pressure", th: "แรงกดจากความเสี่ยง" },
    "sector-news": { en: "Sector theme", th: "ธีมกลุ่มธุรกิจ" },
    valuation: { en: "Valuation", th: "มูลค่า/valuation" },
  };

  return labels[factor.id][language];
}

function factorDetail(factor: StockSentimentFactor, language: Language) {
  if (factor.id === "direct-news" || factor.id === "sector-news") {
    return language === "th"
      ? `${factor.count ?? 0} รายการ ${factor.tone === "negative" ? "กด sentiment" : "หนุน sentiment"}`
      : `${factor.count ?? 0} item${factor.count === 1 ? "" : "s"} ${factor.tone === "negative" ? "weigh on sentiment" : "support sentiment"}`;
  }

  if (factor.id === "data-gap") {
    return language === "th" ? "ไม่พบข่าวตรงตัวหุ้นหรือข้อมูลใน universe" : "No matched news or profile data found.";
  }

  return language === "th"
    ? `ค่าในระบบ ${factor.value ?? "-"} / 100`
    : `Model value ${factor.value ?? "-"} / 100`;
}

function factorScoreText(score: number) {
  return `score ${score.toFixed(2)}`;
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

const labels = {
  en: {
    emptyDescription: "Start with a ticker such as AAPL, NVDA, PTT, DELTA, CPALL, or SKY.",
    emptyTitle: "Type a ticker to scan sentiment",
    eyebrow: "Stock Scan",
    factorEyebrow: "Explainable scan",
    factorTitle: "Why sentiment looks this way",
    inputLabel: "Stock symbol input",
    newsEyebrow: "Evidence",
    newsTitle: "Matched news and themes",
    newsWindow: "30D news window",
    noNewsDescription: "The result is currently driven by profile, sector, or technical factors.",
    noNewsTitle: "No matched headlines",
    placeholder: "Type stock symbol, e.g. AAPL or PTT",
    refresh: "Refresh news",
    refreshing: "Refreshing",
    subtitle: "Type a stock symbol and get a positive, negative, or neutral read with the factors behind it.",
    suggestions: "Suggested symbols",
    title: "Stock Sentiment Scanner",
    unknownMarket: "Unknown market",
    unknownStock: "Unknown stock",
  },
  th: {
    emptyDescription: "เริ่มจาก ticker เช่น AAPL, NVDA, PTT, DELTA, CPALL หรือ SKY",
    emptyTitle: "พิมพ์ชื่อหุ้นเพื่อสแกน sentiment",
    eyebrow: "สแกนหุ้น",
    factorEyebrow: "ผลลัพธ์ที่อธิบายได้",
    factorTitle: "ปัจจัยที่ทำให้ sentiment เป็นแบบนี้",
    inputLabel: "ช่องกรอกชื่อหุ้น",
    newsEyebrow: "หลักฐานจากข่าว",
    newsTitle: "ข่าวและธีมที่เกี่ยวข้อง",
    newsWindow: "กรอบข่าว 30 วัน",
    noNewsDescription: "ผลลัพธ์ตอนนี้อิงจากข้อมูลหุ้น กลุ่มธุรกิจ หรือสัญญาณเทคนิคในระบบ",
    noNewsTitle: "ยังไม่พบข่าวตรงตัว",
    placeholder: "พิมพ์ ticker เช่น AAPL หรือ PTT",
    refresh: "อัปเดตข่าว",
    refreshing: "กำลังอัปเดต",
    subtitle: "พิมพ์ชื่อหุ้น แล้วดูว่า sentiment ตอนนี้เป็นบวก ลบ หรือกลาง พร้อมปัจจัยที่ทำให้เป็นแบบนั้น",
    suggestions: "หุ้นตัวอย่าง",
    title: "สแกน Sentiment หุ้น",
    unknownMarket: "ไม่ทราบตลาด",
    unknownStock: "ไม่พบชื่อหุ้น",
  },
};

