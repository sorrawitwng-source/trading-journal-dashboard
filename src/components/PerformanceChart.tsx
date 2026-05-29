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

const chartColors = ["#22c7a7", "#60a5fa", "#f2b84b", "#8b9cff", "#e8799f"];
const chartWidth = 760;
const chartHeight = 300;
const padding = {
  top: 22,
  right: 26,
  bottom: 34,
  left: 54,
};

export function PerformanceChart({ series }: PerformanceChartProps) {
  const allValues = series.flatMap((item) => item.values);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues);
  const range = Math.max(maxValue - minValue, 1);
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const portfolioSeries = series.find((item) => item.symbol === "PORTFOLIO");
  const isPortfolioBaseline =
    portfolioSeries?.values.every((value) => value === 0) ?? false;
  const yTicks = buildTicks(minValue, maxValue);
  const xLabels = [
    { label: "M1", pointIndex: 0 },
    { label: "M3", pointIndex: 2 },
    { label: "M6", pointIndex: 5 },
    { label: "M9", pointIndex: 8 },
    { label: "M12", pointIndex: 11 },
  ];

  const xForIndex = (index: number, pointCount: number) =>
    padding.left + (pointCount <= 1 ? 0 : (index / (pointCount - 1)) * plotWidth);
  const yForValue = (value: number) =>
    padding.top + ((maxValue - value) / range) * plotHeight;

  const zeroY = yForValue(0);

  return (
    <section className="panel performance-panel" aria-labelledby="performance-title">
      <div className="section-heading">
        <p className="eyebrow">Performance</p>
        <h2 id="performance-title">Portfolio vs benchmarks</h2>
      </div>

      <div className="performance-chart-card">
        <div
          className="performance-chart"
          role="img"
          aria-label="Twelve point portfolio performance compared with benchmarks"
        >
          <svg
            className="performance-chart__svg"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              {series.map((item, index) => (
                <linearGradient
                  id={`line-gradient-${item.symbol}`}
                  key={item.symbol}
                  x1="0"
                  x2="1"
                  y1="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor={chartColors[index % chartColors.length]} />
                  <stop
                    offset="100%"
                    stopColor={chartColors[index % chartColors.length]}
                    stopOpacity="0.68"
                  />
                </linearGradient>
              ))}
            </defs>

            <rect
              className="performance-chart__plot"
              height={plotHeight}
              rx="8"
              width={plotWidth}
              x={padding.left}
              y={padding.top}
            />

            {yTicks.map((tick) => {
              const y = yForValue(tick);

              return (
                <g key={tick}>
                  <line
                    className="performance-chart__grid"
                    x1={padding.left}
                    x2={chartWidth - padding.right}
                    y1={y}
                    y2={y}
                  />
                  <text
                    className="performance-chart__axis-label"
                    textAnchor="end"
                    x={padding.left - 12}
                    y={y + 4}
                  >
                    {percentFormatter.format(tick)}%
                  </text>
                </g>
              );
            })}

            <line
              className="performance-chart__zero-line"
              x1={padding.left}
              x2={chartWidth - padding.right}
              y1={zeroY}
              y2={zeroY}
            />

            {xLabels.map(({ label, pointIndex }) => {
              const x = xForIndex(pointIndex, 12);

              return (
                <text
                  className="performance-chart__axis-label"
                  key={label}
                  textAnchor="middle"
                  x={x}
                  y={chartHeight - 10}
                >
                  {label}
                </text>
              );
            })}

            {series.map((item, seriesIndex) => {
              const points = item.values
                .map((value, index) => `${xForIndex(index, item.values.length)},${yForValue(value)}`)
                .join(" ");
              const isBaselineLine =
                item.symbol === "PORTFOLIO" && isPortfolioBaseline;
              const firstX = xForIndex(0, item.values.length);
              const lastX = xForIndex(item.values.length - 1, item.values.length);

              return (
                <g className="performance-chart__series" key={item.symbol}>
                  {item.symbol === "PORTFOLIO" ? (
                    <polygon
                      className="performance-chart__area"
                      points={`${firstX},${zeroY} ${points} ${lastX},${zeroY}`}
                    />
                  ) : null}
                  <polyline
                    className={`performance-chart__line${
                      isBaselineLine ? " performance-chart__line--baseline" : ""
                    }`}
                    points={points}
                    stroke={`url(#line-gradient-${item.symbol})`}
                  />
                  {item.values.map((value, index) => (
                    <circle
                      className="performance-chart__point"
                      cx={xForIndex(index, item.values.length)}
                      cy={yForValue(value)}
                      fill={chartColors[seriesIndex % chartColors.length]}
                      key={`${item.symbol}-${index}`}
                      r={item.symbol === "PORTFOLIO" ? 3.8 : 3}
                    >
                      <title>{`${item.label}: ${percentFormatter.format(value)}%`}</title>
                    </circle>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="performance-legend" aria-label="Chart legend">
          {series.map((item, index) => {
            const finalValue = item.values.at(-1) ?? 0;
            const tone =
              finalValue > 0 ? "positive" : finalValue < 0 ? "negative" : "neutral";

            return (
              <div
                className="performance-legend__item"
                key={item.symbol}
                style={
                  {
                    "--legend-color": chartColors[index % chartColors.length],
                  } as CSSProperties
                }
              >
                <span
                  className="performance-legend__swatch"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />
                <div>
                  <strong>{item.symbol}</strong>
                  <span>{item.label}</span>
                </div>
                <b className={`metric-value metric-value--${tone}`}>
                  {percentFormatter.format(finalValue)}%
                </b>
              </div>
            );
          })}
        </div>
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

function buildTicks(minValue: number, maxValue: number): number[] {
  const low = Math.floor(Math.min(0, minValue) / 5) * 5;
  const high = Math.ceil(Math.max(0, maxValue) / 5) * 5;
  const step = Math.max(5, Math.ceil((high - low) / 4 / 5) * 5);
  const ticks: number[] = [];

  for (let value = low; value <= high; value += step) {
    ticks.push(value);
  }

  if (!ticks.includes(0)) {
    ticks.push(0);
  }

  return ticks.sort((left, right) => left - right);
}
