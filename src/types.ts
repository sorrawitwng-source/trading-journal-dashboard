export type Market = "Thai" | "US" | "Custom";
export type MarketFilter = "All" | "Thai" | "US";
export type Currency = "THB" | "USD";
export type DataQuality = "complete" | "limited" | "no-data" | "partial";
export type PriceStatus = "cached" | "fallback" | "live";
export type RiskLevel = "Low" | "Medium" | "High" | "No data";
export type SectorSource = "curated" | "provider" | "unknown";

export interface StockMetrics {
  momentum: number | null;
  valuation: number | null;
  volatility: number | null;
  dividend: number | null;
  risk: number | null;
}

export interface ScoreBreakdownItem {
  available: boolean;
  contribution: number;
  label: string;
  value: number | null;
  weight: number;
}

export interface ScoreBreakdown {
  dataQuality: DataQuality;
  items: ScoreBreakdownItem[];
  methodology: string;
}

export interface StockProfile extends StockMetrics {
  symbol: string;
  name: string;
  market: Market;
  sector: string;
  sectorSource: SectorSource;
  currentPrice: number;
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  market: Market;
  sector: string;
  sectorSource?: SectorSource;
  buyPrice: number;
  currency?: Currency;
  quantity: number;
  currentPrice: number;
  priceStatus?: PriceStatus;
  priceUpdatedAt?: string;
  dataQuality?: DataQuality;
  score: number | null;
  scoreBreakdown?: ScoreBreakdown;
  riskLevel: RiskLevel;
  riskReason?: string;
  isCustom: boolean;
}

export interface BenchmarkSeries {
  symbol: string;
  label: string;
  values: number[];
}
