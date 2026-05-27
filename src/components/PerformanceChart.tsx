import type { BenchmarkSeries } from "../types";

interface PerformanceChartProps {
  series: BenchmarkSeries[];
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export function PerformanceChart({ series }: PerformanceChartProps) {
  const allValues = series.flatMap((item) => item.values);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues);
  const range = Math.max(maxValue - minValue, 1);

  return (
    <section className="panel performance-panel" aria-labelledby="performance-title">
      <div className="section-heading">
        <p className="eyebrow">Performance</p>
        <h2 id="performance-title">Portfolio vs benchmarks</h2>
      </div>

      <div className="line-chart" role="img" aria-label="Twelve point performance comparison">
        {series.map((item) => (
          <div className="chart-row" key={item.symbol}>
            <div className="chart-row__label">
              <strong>{item.symbol}</strong>
              <span>{item.label}</span>
            </div>
            <div className="chart-row__track">
              {item.values.map((value, index) => (
                <span
                  className="chart-point"
                  key={`${item.symbol}-${index}`}
                  style={{ height: `${16 + ((value - minValue) / range) * 74}px` }}
                  title={`${item.label}: ${percentFormatter.format(value)}%`}
                />
              ))}
            </div>
            <strong className="chart-row__value">
              {percentFormatter.format(item.values.at(-1) ?? 0)}%
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
