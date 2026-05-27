interface SummaryStripProps {
  averageScore: number | null;
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
  totalCost,
  totalProfitLoss,
  totalProfitLossPercent,
  totalValue,
}: SummaryStripProps) {
  const profitLossTone =
    totalProfitLoss > 0 ? "positive" : totalProfitLoss < 0 ? "negative" : "neutral";

  return (
    <section className="summary-strip" aria-label="Portfolio summary">
      <SummaryItem label="Total cost" value={currencyFormatter.format(totalCost)} />
      <SummaryItem label="Estimated value" value={currencyFormatter.format(totalValue)} />
      <SummaryItem
        label="Total P/L"
        tone={profitLossTone}
        value={`${currencyFormatter.format(totalProfitLoss)} (${percentFormatter.format(
          totalProfitLossPercent,
        )}%)`}
      />
      <SummaryItem
        label="Average score"
        value={averageScore === null ? "N/A" : averageScore.toFixed(2)}
      />
    </section>
  );
}

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
