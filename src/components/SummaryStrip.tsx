import type { Currency, PriceStatus } from "../types";

interface SummaryStripProps {
  averageScore: number | null;
  baseCurrency: Currency;
  fxStatus: PriceStatus;
  fxUpdatedAt: string | null;
  language: "en" | "th";
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  totalValue: number;
  usdThbRate: number;
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function SummaryStrip({
  averageScore,
  baseCurrency,
  fxStatus,
  fxUpdatedAt,
  language,
  totalCost,
  totalProfitLoss,
  totalProfitLossPercent,
  totalValue,
  usdThbRate,
}: SummaryStripProps) {
  const profitLossTone =
    totalProfitLoss > 0 ? "positive" : totalProfitLoss < 0 ? "negative" : "neutral";
  const text = labels[language];
  const currencyFormatter = currencyFormatterFor(baseCurrency);

  return (
    <div className="summary-area">
      <div className="currency-note">
        <span>
          {text.baseCurrency}: <strong>{baseCurrency}</strong>
        </span>
        <span>
          USD/THB {usdThbRate.toFixed(4)} · {statusLabel(fxStatus, language)}
          {fxUpdatedAt ? ` · ${formatUpdatedTime(fxUpdatedAt)}` : ""}
        </span>
      </div>
      <section className="summary-strip" aria-label="Portfolio summary">
        <SummaryItem
          accent="accent"
          label={text.totalCost}
          value={currencyFormatter.format(totalCost)}
        />
        <SummaryItem
          accent="blue"
          label={text.estimatedValue}
          value={currencyFormatter.format(totalValue)}
        />
        <SummaryItem
          accent={profitLossTone === "negative" ? "red" : "green"}
          label={text.totalProfitLoss}
          tone={profitLossTone}
          value={`${currencyFormatter.format(totalProfitLoss)} (${percentFormatter.format(
            totalProfitLossPercent,
          )}%)`}
        />
        <SummaryItem
          accent="violet"
          label={text.averageScore}
          value={averageScore === null ? "N/A" : averageScore.toFixed(2)}
        />
      </section>
    </div>
  );
}

const labels = {
  en: {
    averageScore: "Average score",
    baseCurrency: "Portfolio currency",
    estimatedValue: "Estimated value",
    totalCost: "Total cost",
    totalProfitLoss: "Total P/L",
  },
  th: {
    averageScore: "คะแนนเฉลี่ย",
    baseCurrency: "สกุลเงินพอร์ต",
    estimatedValue: "มูลค่าปัจจุบัน",
    totalCost: "ต้นทุนรวม",
    totalProfitLoss: "กำไร/ขาดทุนรวม",
  },
};

function SummaryItem({
  accent,
  label,
  tone = "neutral",
  value,
}: {
  accent: "accent" | "blue" | "green" | "red" | "violet";
  label: string;
  tone?: "negative" | "neutral" | "positive";
  value: string;
}) {
  return (
    <div className={`summary-item summary-item--${accent}`}>
      <span className="summary-item__marker" aria-hidden="true" />
      <div className="summary-item__body">
        <span>{label}</span>
        <strong className={`metric-value metric-value--${tone}`}>{value}</strong>
      </div>
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

function statusLabel(status: PriceStatus, language: "en" | "th"): string {
  if (status === "live") {
    return language === "th" ? "สด" : "Live";
  }

  if (status === "cached") {
    return language === "th" ? "แคช" : "Cached";
  }

  return language === "th" ? "สำรอง" : "Fallback";
}

function formatUpdatedTime(value: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
