import type { CSSProperties, ReactNode } from "react";
import type { Currency, PortfolioPosition } from "../types";
import {
  type AnalyticsBucket,
  type AnalyticsHolding,
  type MonthlyPerformance,
  type RiskSignal,
  buildPortfolioAnalytics,
} from "../lib/analytics";

interface AnalyticsPageProps {
  baseCurrency: Currency;
  language: "en" | "th";
  positions: PortfolioPosition[];
  usdThbRate: number;
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function AnalyticsPage({
  baseCurrency,
  language,
  positions,
  usdThbRate,
}: AnalyticsPageProps) {
  const text = labels[language];
  const monthText = monthlyLabels[language];
  const allocationText = allocationLabels[language];
  const analytics = buildPortfolioAnalytics(positions, {
    baseCurrency,
    usdThbRate,
  });
  const moneyFormatter = currencyFormatterFor(baseCurrency);
  const profitLossTone =
    analytics.totalProfitLoss > 0
      ? "positive"
      : analytics.totalProfitLoss < 0
        ? "negative"
        : "neutral";

  if (positions.length === 0) {
    return (
      <section className="panel analytics-empty">
        <p className="eyebrow">{text.eyebrow}</p>
        <h2>{text.emptyTitle}</h2>
        <p>{text.emptyDescription}</p>
      </section>
    );
  }

  return (
    <div className="analytics-page">
      <section className="analytics-hero" aria-labelledby="analytics-title">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="analytics-title">{text.title}</h2>
          <p>{text.description}</p>
        </div>
        <div className="analytics-hero__metrics">
          <MetricTile label={text.totalValue} value={moneyFormatter.format(analytics.totalValue)} />
          <MetricTile
            label={text.totalProfitLoss}
            tone={profitLossTone}
            value={moneyFormatter.format(analytics.totalProfitLoss)}
          />
          <MetricTile
            label={text.holdings}
            value={String(analytics.holdings.length)}
          />
        </div>
      </section>

      <section className="analytics-risk-grid" aria-label={text.riskSignals}>
        {analytics.riskSignals.map((signal) => (
          <RiskSignalCard key={signal.label} signal={signal} />
        ))}
      </section>

      <MonthlyPerformanceReport
        language={language}
        moneyFormatter={moneyFormatter}
        months={analytics.monthlyPerformance}
        text={monthText}
      />

      <section className="analytics-grid">
        <AnalyticsPanel title={text.sectorExposure}>
          <AllocationBars
            buckets={analytics.sectorExposure}
            formatter={(value) => moneyFormatter.format(value)}
            text={allocationText}
          />
        </AnalyticsPanel>
        <AnalyticsPanel title={text.marketExposure}>
          <AllocationBars
            buckets={analytics.marketExposure}
            formatter={(value) => moneyFormatter.format(value)}
            text={allocationText}
          />
        </AnalyticsPanel>
        <AnalyticsPanel title={text.currencyExposure}>
          <AllocationBars
            buckets={analytics.currencyExposure}
            formatter={(value) => moneyFormatter.format(value)}
            text={allocationText}
          />
        </AnalyticsPanel>
        <AnalyticsPanel title={text.dataQuality}>
          <AllocationBars
            buckets={analytics.dataQuality}
            formatter={(value) => `${value.toFixed(0)} ${text.items}`}
            text={allocationText}
          />
        </AnalyticsPanel>
      </section>

      <section className="analytics-grid analytics-grid--wide">
        <AnalyticsPanel title={text.topHoldings}>
          <HoldingList holdings={analytics.topHoldings} moneyFormatter={moneyFormatter} />
        </AnalyticsPanel>
        <AnalyticsPanel title={text.topContributors}>
          <HoldingList
            holdings={analytics.topContributors}
            moneyFormatter={moneyFormatter}
            showProfitLoss
          />
        </AnalyticsPanel>
      </section>
    </div>
  );
}

function MonthlyPerformanceReport({
  language,
  moneyFormatter,
  months,
  text,
}: {
  language: "en" | "th";
  moneyFormatter: Intl.NumberFormat;
  months: MonthlyPerformance[];
  text: (typeof monthlyLabels)["en"];
}) {
  return (
    <section className="panel monthly-report" aria-labelledby="monthly-report-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="monthly-report-title">{text.title}</h2>
        </div>
      </div>
      {months.length === 0 ? (
        <p className="analytics-muted">{text.empty}</p>
      ) : (
        <div className="monthly-report__list">
          {months.slice(0, 6).map((month) => (
            <MonthlyPerformanceCard
              key={month.key}
              language={language}
              moneyFormatter={moneyFormatter}
              month={month}
              text={text}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MonthlyPerformanceCard({
  language,
  moneyFormatter,
  month,
  text,
}: {
  language: "en" | "th";
  moneyFormatter: Intl.NumberFormat;
  month: MonthlyPerformance;
  text: (typeof monthlyLabels)["en"];
}) {
  const tone =
    month.profitLoss > 0 ? "positive" : month.profitLoss < 0 ? "negative" : "neutral";

  return (
    <article className="monthly-report-card">
      <div className="monthly-report-card__header">
        <div>
          <span>{formatMonthKey(month.key, language)}</span>
          <strong className={`metric-value metric-value--${tone}`}>
            {moneyFormatter.format(month.profitLoss)}
          </strong>
        </div>
        <b>{percentFormatter.format(month.profitLossPercent)}%</b>
      </div>

      <div className="monthly-report-card__metrics">
        <MetricPill label={text.trades} value={String(month.tradeCount)} />
        <MetricPill label={text.winRate} value={`${percentFormatter.format(month.winRate)}%`} />
        <MetricPill label={text.open} value={String(month.openCount)} />
        <MetricPill label={text.sold} value={String(month.soldCount)} />
      </div>

      <div className="monthly-report-card__extremes">
        <TradeSnapshot
          holding={month.bestTrade}
          label={text.bestTrade}
          moneyFormatter={moneyFormatter}
        />
        <TradeSnapshot
          holding={month.worstTrade}
          label={text.worstTrade}
          moneyFormatter={moneyFormatter}
        />
      </div>
    </article>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="monthly-report-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TradeSnapshot({
  holding,
  label,
  moneyFormatter,
}: {
  holding: AnalyticsHolding | null;
  label: string;
  moneyFormatter: Intl.NumberFormat;
}) {
  const tone =
    holding && holding.profitLoss > 0
      ? "positive"
      : holding && holding.profitLoss < 0
        ? "negative"
        : "neutral";

  return (
    <div className="monthly-report-trade">
      <span>{label}</span>
      {holding ? (
        <strong>
          {holding.symbol}
          <b className={`metric-value metric-value--${tone}`}>
            {moneyFormatter.format(holding.profitLoss)}
          </b>
        </strong>
      ) : (
        <strong>-</strong>
      )}
    </div>
  );
}

function MetricTile({
  label,
  tone = "neutral",
  value,
}: {
  label: string;
  tone?: "negative" | "neutral" | "positive";
  value: string;
}) {
  return (
    <div className="analytics-metric">
      <span>{label}</span>
      <strong className={`metric-value metric-value--${tone}`}>{value}</strong>
    </div>
  );
}

function RiskSignalCard({ signal }: { signal: RiskSignal }) {
  return (
    <article className={`risk-signal risk-signal--${signal.tone}`}>
      <span>{signal.label}</span>
      <strong>{signal.value}</strong>
    </article>
  );
}

function AnalyticsPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="panel analytics-panel">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AllocationBars({
  buckets,
  formatter,
  text,
}: {
  buckets: AnalyticsBucket[];
  formatter: (value: number) => string;
  text: (typeof allocationLabels)["en"];
}) {
  if (buckets.length === 0) {
    return <p className="analytics-muted">{text.noData}</p>;
  }

  const chartBuckets = compactAllocationBuckets(buckets, text.other);
  const primaryBucket = chartBuckets[0];
  const donutStyle = {
    "--allocation-gradient": buildAllocationGradient(chartBuckets),
  } as CSSProperties;

  return (
    <div className="allocation-list">
      <div className="allocation-donut-card">
        <div
          aria-label={`${primaryBucket.key} ${percentFormatter.format(primaryBucket.weight)}%`}
          className="allocation-donut"
          role="img"
          style={donutStyle}
        >
          <div className="allocation-donut__center">
            <span>{text.top}</span>
            <strong>{percentFormatter.format(primaryBucket.weight)}%</strong>
          </div>
        </div>
        <div className="allocation-donut__legend">
          {chartBuckets.slice(0, 4).map((bucket, index) => (
            <div
              className="allocation-donut__legend-item"
              key={bucket.key}
              style={{ "--allocation-color": allocationColors[index] } as CSSProperties}
            >
              <span aria-hidden="true" />
              <strong>{bucket.key}</strong>
              <b>{percentFormatter.format(bucket.weight)}%</b>
            </div>
          ))}
        </div>
      </div>

      {chartBuckets.map((bucket, index) => (
        <div
          className="allocation-row"
          key={bucket.key}
          style={{ "--allocation-color": allocationColors[index] } as CSSProperties}
        >
          <div className="allocation-row__label">
            <span className="allocation-row__swatch" aria-hidden="true" />
            <div>
              <strong>{bucket.key}</strong>
              <span>{formatter(bucket.value)}</span>
            </div>
          </div>
          <div className="allocation-bar" aria-hidden="true">
            <span style={{ width: `${Math.min(bucket.weight, 100)}%` }} />
          </div>
          <b>{percentFormatter.format(bucket.weight)}%</b>
        </div>
      ))}
    </div>
  );
}

const allocationColors = [
  "#22c7a7",
  "#60a5fa",
  "#f2b84b",
  "#9b8cff",
  "#e8799f",
  "#2fce7a",
];

const allocationLabels = {
  en: {
    noData: "No data",
    other: "Other",
    top: "Top",
  },
  th: {
    noData: "ไม่มีข้อมูล",
    other: "อื่นๆ",
    top: "สูงสุด",
  },
};

function compactAllocationBuckets(
  buckets: AnalyticsBucket[],
  otherLabel: string,
): AnalyticsBucket[] {
  if (buckets.length <= 6) {
    return buckets;
  }

  const visibleBuckets = buckets.slice(0, 5);
  const remainingBuckets = buckets.slice(5);
  return [
    ...visibleBuckets,
    {
      key: otherLabel,
      value: remainingBuckets.reduce((total, bucket) => total + bucket.value, 0),
      weight: remainingBuckets.reduce((total, bucket) => total + bucket.weight, 0),
    },
  ];
}

function buildAllocationGradient(buckets: AnalyticsBucket[]): string {
  const totalWeight = buckets.reduce(
    (total, bucket) => total + Math.max(bucket.weight, 0),
    0,
  );

  if (totalWeight <= 0) {
    return "conic-gradient(color-mix(in srgb, var(--border) 72%, transparent) 0% 100%)";
  }

  let cursor = 0;
  const segments = buckets.map((bucket, index) => {
    const size = (Math.max(bucket.weight, 0) / totalWeight) * 100;
    const start = cursor;
    const end = Math.min(100, cursor + size);
    cursor = end;
    return `${allocationColors[index]} ${start}% ${end}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function HoldingList({
  holdings,
  moneyFormatter,
  showProfitLoss = false,
}: {
  holdings: AnalyticsHolding[];
  moneyFormatter: Intl.NumberFormat;
  showProfitLoss?: boolean;
}) {
  return (
    <div className="analytics-holding-list">
      {holdings.map((holding) => {
        const tone =
          holding.profitLoss > 0
            ? "positive"
            : holding.profitLoss < 0
              ? "negative"
              : "neutral";

        return (
          <article className="analytics-holding-row" key={holding.symbol}>
            <div>
              <strong>{holding.symbol}</strong>
              <span>{holding.name}</span>
            </div>
            <div>
              <b>{percentFormatter.format(holding.weight)}%</b>
              <span
                className={`metric-value metric-value--${
                  showProfitLoss ? tone : "neutral"
                }`}
              >
                {moneyFormatter.format(showProfitLoss ? holding.profitLoss : holding.value)}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function currencyFormatterFor(currency: Currency): Intl.NumberFormat {
  return new Intl.NumberFormat(currency === "THB" ? "th-TH" : "en-US", {
    currency,
    maximumFractionDigits: 2,
    style: "currency",
  });
}

function formatMonthKey(key: string, language: "en" | "th"): string {
  if (!/^\d{4}-\d{2}$/.test(key)) {
    return key;
  }

  return new Intl.DateTimeFormat(language === "th" ? "th-TH-u-ca-gregory" : "en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${key}-01T00:00:00`));
}

const monthlyLabels = {
  en: {
    bestTrade: "Best",
    empty: "Monthly performance appears after you add dated holdings.",
    eyebrow: "Monthly report",
    open: "Open",
    sold: "Sold",
    title: "Performance by Trade Month",
    trades: "Trades",
    winRate: "Win rate",
    worstTrade: "Worst",
  },
  th: {
    bestTrade: "ดีที่สุด",
    empty: "รายงานรายเดือนจะแสดงหลังจากเพิ่มหุ้นพร้อมวันที่ซื้อ",
    eyebrow: "รายงานรายเดือน",
    open: "ถืออยู่",
    sold: "ขายแล้ว",
    title: "ผลลัพธ์ตามเดือนที่ซื้อ",
    trades: "รายการ",
    winRate: "Win rate",
    worstTrade: "แย่ที่สุด",
  },
};

const labels = {
  en: {
    currencyExposure: "Currency Exposure",
    dataQuality: "Data Quality",
    description:
      "A portfolio x-ray for concentration, exposure, data quality, and return drivers.",
    emptyDescription: "Add holdings first, then this page will map your portfolio exposure.",
    emptyTitle: "Analytics will appear after your first holding",
    eyebrow: "Analytics",
    holdings: "Holdings",
    items: "items",
    marketExposure: "Market Exposure",
    riskSignals: "Risk signals",
    sectorExposure: "Sector Exposure",
    title: "Portfolio X-Ray",
    topContributors: "Top Contributors",
    topHoldings: "Largest Positions",
    totalProfitLoss: "Total P/L",
    totalValue: "Portfolio Value",
  },
  th: {
    currencyExposure: "สัดส่วนค่าเงิน",
    dataQuality: "คุณภาพข้อมูล",
    description:
      "มองพอร์ตแบบ X-Ray เพื่อดูความกระจุกตัว ความเสี่ยง สัดส่วน และตัวที่ขับเคลื่อนผลตอบแทน",
    emptyDescription: "เพิ่มหุ้นในพอร์ตก่อน แล้วหน้านี้จะแสดงโครงสร้างพอร์ตให้ทันที",
    emptyTitle: "Analytics จะแสดงหลังมีรายการหุ้น",
    eyebrow: "วิเคราะห์พอร์ต",
    holdings: "จำนวนหุ้น",
    items: "รายการ",
    marketExposure: "สัดส่วนตลาด",
    riskSignals: "สัญญาณความเสี่ยง",
    sectorExposure: "สัดส่วนกลุ่มธุรกิจ",
    title: "Portfolio X-Ray",
    topContributors: "ตัวทำกำไรหลัก",
    topHoldings: "หุ้นที่มีน้ำหนักสูงสุด",
    totalProfitLoss: "กำไร/ขาดทุนรวม",
    totalValue: "มูลค่าพอร์ต",
  },
};
