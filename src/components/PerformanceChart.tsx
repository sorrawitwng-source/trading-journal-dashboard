import type { CSSProperties } from "react";
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
  const zeroLinePosition = 100 - ((0 - minValue) / range) * 100;
  const portfolioSeries = series.find((item) => item.symbol === "PORTFOLIO");
  const isPortfolioBaseline =
    portfolioSeries?.values.every((value) => value === 0) ?? false;

  return (
    <section className="panel performance-panel" aria-labelledby="performance-title">
      <div className="section-heading">
        <p className="eyebrow">Performance</p>
        <h2 id="performance-title">Portfolio vs benchmarks</h2>
      </div>

      <div className="line-chart" role="img" aria-label="Twelve point performance comparison">
        {series.map((item) => {
          const isBaselineRow = item.symbol === "PORTFOLIO" && isPortfolioBaseline;

          return (
            <div
              className={`chart-row${isBaselineRow ? " chart-row--baseline" : ""}`}
              key={item.symbol}
            >
              <div className="chart-row__label">
                <strong>{item.symbol}</strong>
                <span>{item.label}</span>
              </div>
              <div
                className="chart-row__track"
                style={{ "--zero-line": `${zeroLinePosition}%` } as CSSProperties}
              >
                {item.values.map((value, index) => (
                  <span
                    className="chart-point"
                    key={`${item.symbol}-${index}`}
                    style={{
                      height: isBaselineRow
                        ? "2px"
                        : `${16 + ((value - minValue) / range) * 74}px`,
                    }}
                    title={`${item.label}: ${percentFormatter.format(value)}%`}
                  />
                ))}
              </div>
              <strong className="chart-row__value">
                {percentFormatter.format(item.values.at(-1) ?? 0)}%
              </strong>
            </div>
          );
        })}
      </div>
      {isPortfolioBaseline ? (
        <p className="chart-empty-note">
          Portfolio baseline is flat while no movement is recorded. Benchmarks remain visible
          for context.
        </p>
      ) : null}
    </section>
  );
}
