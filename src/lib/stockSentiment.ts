import type { MarketFilter, StockProfile } from "../types";
import {
  trustedResearchNewsItems,
  type NewsScanItem,
  type NewsSignal,
} from "./newsScanner";

export type StockSentimentTone = "negative" | "neutral" | "positive" | "unknown";
export type StockSentimentConfidence = "high" | "low" | "medium";
export type StockSentimentFactorId =
  | "data-gap"
  | "direct-news"
  | "sector-news"
  | "source-coverage";

export interface StockSentimentFactor {
  count?: number;
  id: StockSentimentFactorId;
  score: number;
  sources?: string[];
  tone: StockSentimentTone;
  value?: number | null;
}

export interface StockSentimentResult {
  confidence: StockSentimentConfidence;
  directNews: NewsScanItem[];
  factors: StockSentimentFactor[];
  matchedProfile: StockProfile | null;
  normalizedSymbol: string;
  score: number;
  sectorNews: NewsScanItem[];
  sentiment: StockSentimentTone;
}

interface AnalyzeStockSentimentInput {
  marketFilter: MarketFilter;
  newsItems: NewsScanItem[];
  profiles: StockProfile[];
  symbol: string;
}

export function analyzeStockSentiment({
  marketFilter,
  newsItems,
  profiles,
  symbol,
}: AnalyzeStockSentimentInput): StockSentimentResult {
  const normalizedSymbol = normalizeScanSymbol(symbol);
  const matchedProfile = findStockProfile(normalizedSymbol, profiles, marketFilter);

  if (!normalizedSymbol) {
    return emptySentiment(normalizedSymbol, matchedProfile);
  }

  const trustedNewsItems = trustedResearchNewsItems(newsItems);
  const directNews = trustedNewsItems.filter((item) =>
    item.symbols.some((newsSymbol) => normalizeScanSymbol(newsSymbol) === normalizedSymbol),
  );
  const sectorNews =
    matchedProfile === null
      ? []
      : trustedNewsItems.filter(
          (item) =>
            item.market === matchedProfile.market &&
            !directNews.includes(item) &&
            item.sectors.some((sector) => sectorsOverlap(sector, matchedProfile.sector)),
        );

  const factors: StockSentimentFactor[] = [];
  const directScore = directNews.reduce(
    (total, item) => total + scoreNewsSignal(item.signal),
    0,
  );
  const sectorScore = clamp(
    sectorNews.reduce((total, item) => total + scoreNewsSignal(item.signal) * 0.45, 0),
    -2,
    2,
  );

  if (directNews.length > 0) {
    factors.push({
      count: directNews.length,
      id: "direct-news",
      score: directScore,
      sources: uniqueValues(directNews.map((item) => item.source)).slice(0, 4),
      tone: toneFromScore(directScore),
    });
  }

  if (sectorNews.length > 0) {
    factors.push({
      count: sectorNews.length,
      id: "sector-news",
      score: sectorScore,
      sources: uniqueValues(sectorNews.map((item) => item.source)).slice(0, 4),
      tone: toneFromScore(sectorScore),
    });
  }

  if (directNews.length + sectorNews.length > 0) {
    factors.push({
      count: uniqueValues([...directNews, ...sectorNews].map((item) => item.source)).length,
      id: "source-coverage",
      score: 0,
      sources: uniqueValues([...directNews, ...sectorNews].map((item) => item.source)).slice(0, 5),
      tone: "neutral",
    });
  }

  const score = roundScore(directScore + sectorScore);
  const evidenceScore = directNews.length * 2 + sectorNews.length;

  if (evidenceScore === 0) {
    return {
      confidence: "low",
      directNews,
      factors: [
        {
          id: "data-gap",
          score: 0,
          tone: "unknown",
        },
      ],
      matchedProfile,
      normalizedSymbol,
      score: 0,
      sectorNews,
      sentiment: "unknown",
    };
  }

  return {
    confidence: confidenceFromEvidence(evidenceScore),
    directNews,
    factors,
    matchedProfile,
    normalizedSymbol,
    score,
    sectorNews,
    sentiment: sentimentFromScore(score),
  };
}

export function normalizeScanSymbol(value: string): string {
  return value.trim().toUpperCase().replace(/\.BK$/, "");
}

function emptySentiment(
  normalizedSymbol: string,
  matchedProfile: StockProfile | null,
): StockSentimentResult {
  return {
    confidence: "low",
    directNews: [],
    factors: [],
    matchedProfile,
    normalizedSymbol,
    score: 0,
    sectorNews: [],
    sentiment: "unknown",
  };
}

function findStockProfile(
  normalizedSymbol: string,
  profiles: StockProfile[],
  marketFilter: MarketFilter,
): StockProfile | null {
  const matches = profiles.filter((profile) => profile.symbol === normalizedSymbol);

  if (matches.length === 0) {
    return null;
  }

  return (
    matches.find((profile) => marketFilter === "All" || profile.market === marketFilter) ??
    matches[0]
  );
}

function sectorsOverlap(left: string, right: string): boolean {
  const normalizedLeft = normalizeSector(left);
  const normalizedRight = normalizeSector(right);

  return (
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft) ||
    sectorAlias(normalizedLeft) === sectorAlias(normalizedRight)
  );
}

function normalizeSector(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function sectorAlias(value: string): string {
  if (value.includes("tech") || value.includes("software") || value.includes("semiconductor")) {
    return "technology";
  }

  if (value.includes("bank") || value.includes("finance") || value.includes("financial")) {
    return "financials";
  }

  if (value.includes("energy") || value.includes("oil") || value.includes("utilities")) {
    return "energy";
  }

  if (value.includes("health") || value.includes("hospital")) {
    return "health care";
  }

  if (value.includes("tourism") || value.includes("transport") || value.includes("air")) {
    return "travel";
  }

  return value;
}

function scoreNewsSignal(signal: NewsSignal): number {
  if (signal === "hot") {
    return 1;
  }

  if (signal === "watch") {
    return -1;
  }

  return 0;
}

function sentimentFromScore(score: number): StockSentimentTone {
  if (score >= 0.75) {
    return "positive";
  }

  if (score <= -0.75) {
    return "negative";
  }

  return "neutral";
}

function toneFromScore(score: number): StockSentimentTone {
  if (score > 0.2) {
    return "positive";
  }

  if (score < -0.2) {
    return "negative";
  }

  return "neutral";
}

function confidenceFromEvidence(evidenceScore: number): StockSentimentConfidence {
  if (evidenceScore >= 6) {
    return "high";
  }

  if (evidenceScore >= 3) {
    return "medium";
  }

  return "low";
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
