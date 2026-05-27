export type Market = "Thai" | "US" | "Custom";
export type MarketFilter = "All" | "Thai" | "US";
export type PriceStatus = "cached" | "fallback" | "live";
export type RiskLevel = "Low" | "Medium" | "High";

export interface StockMetrics {
  momentum: number;
  valuation: number;
  volatility: number;
  dividend: number;
  risk: number;
}

export interface StockProfile extends StockMetrics {
  symbol: string;
  name: string;
  market: Market;
  sector: string;
  currentPrice: number;
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  market: Market;
  sector: string;
  buyPrice: number;
  currentPrice: number;
  priceStatus?: PriceStatus;
  priceUpdatedAt?: string;
  score: number | null;
  riskLevel: RiskLevel;
  isCustom: boolean;
}

export interface BenchmarkSeries {
  symbol: string;
  label: string;
  values: number[];
}
