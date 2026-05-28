interface SummaryStripProps {
  averageScore: number | null;
  language: "en" | "th";
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  totalValue: number;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  style: "currency",
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function SummaryStrip({
  averageScore,
  language,
  totalCost,
  totalProfitLoss,
  totalProfitLossPercent,
  totalValue,
}: SummaryStripProps) {
  const profitLossTone =
    totalProfitLoss > 0 ? "positive" : totalProfitLoss < 0 ? "negative" : "neutral";
  const text = labels[language];

  return (
    <section className="summary-strip" aria-label="Portfolio summary">
      <SummaryItem label={text.totalCost} value={currencyFormatter.format(totalCost)} />
      <SummaryItem label={text.estimatedValue} value={currencyFormatter.format(totalValue)} />
      <SummaryItem
        label={text.totalProfitLoss}
        tone={profitLossTone}
        value={`${currencyFormatter.format(totalProfitLoss)} (${percentFormatter.format(
          totalProfitLossPercent,
        )}%)`}
      />
      <SummaryItem
        label={text.averageScore}
        value={averageScore === null ? "N/A" : averageScore.toFixed(2)}
      />
    </section>
  );
}

const labels = {
  en: {
    averageScore: "Average score",
    estimatedValue: "Estimated value",
    totalCost: "Total cost",
    totalProfitLoss: "Total P/L",
  },
  th: {
    averageScore: "คะแนนเฉลี่ย",
    estimatedValue: "มูลค่าปัจจุบัน",
    totalCost: "ต้นทุนรวม",
    totalProfitLoss: "กำไร/ขาดทุนรวม",
  },
};

function SummaryItem({
  label,
  tone = "neutral",
  value,
}: {
  label: string;
  tone?: "negative" | "neutral" | "positive";
  value: string;
}) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong className={`metric-value metric-value--${tone}`}>{value}</strong>
    </div>
  );
}
