import type { BenchmarkSeries } from "../types";

export const benchmarkSeries: BenchmarkSeries[] = [
  {
    symbol: "SPY",
    label: "S&P 500 ETF",
    values: [0, 1.4, 2.1, 1.8, 3.6, 4.9, 5.4, 6.8, 7.2, 8.1, 9.5, 10.3],
  },
  {
    symbol: "QQQ",
    label: "Nasdaq 100 ETF",
    values: [0, 2.2, 3.8, 3.1, 5.9, 7.4, 8.8, 10.6, 11.2, 13.5, 15.1, 16.8],
  },
  {
    symbol: "VTI",
    label: "Total US Market ETF",
    values: [0, 1.1, 1.9, 1.5, 3.2, 4.2, 4.9, 6.1, 6.7, 7.4, 8.6, 9.2],
  },
  {
    symbol: "SET50",
    label: "SET50 Index",
    values: [0, -0.8, 0.4, 1.2, 0.7, 2.1, 1.6, 3.3, 2.9, 4.1, 3.7, 5.0],
  },
];
