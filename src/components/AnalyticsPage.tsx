import type { ReactNode } from "react";
import type { Currency, PortfolioPosition } from "../types";
import {
  type AnalyticsBucket,
  type AnalyticsHolding,
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

      <section className="analytics-grid">
        <AnalyticsPanel title={text.sectorExposure}>
          <AllocationBars
            buckets={analytics.sectorExposure}
            formatter={(value) => moneyFormatter.format(value)}
          />
        </AnalyticsPanel>
        <AnalyticsPanel title={text.marketExposure}>
          <AllocationBars
            buckets={analytics.marketExposure}
            formatter={(value) => moneyFormatter.format(value)}
          />
        </AnalyticsPanel>
        <AnalyticsPanel title={text.currencyExposure}>
          <AllocationBars
            buckets={analytics.currencyExposure}
            formatter={(value) => moneyFormatter.format(value)}
          />
        </AnalyticsPanel>
        <AnalyticsPanel title={text.dataQuality}>
          <AllocationBars
            buckets={analytics.dataQuality}
            formatter={(value) => `${value.toFixed(0)} ${text.items}`}
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
}: {
  buckets: AnalyticsBucket[];
  formatter: (value: number) => string;
}) {
  if (buckets.length === 0) {
    return <p className="analytics-muted">No data</p>;
  }

  return (
    <div className="allocation-list">
      {buckets.slice(0, 6).map((bucket) => (
        <div className="allocation-row" key={bucket.key}>
          <div>
            <strong>{bucket.key}</strong>
            <span>{formatter(bucket.value)}</span>
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
