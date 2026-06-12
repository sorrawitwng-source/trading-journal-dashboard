import type { MarketFilter, StockProfile } from "../types";
import type { NewsScanItem, NewsSignal } from "./newsScanner";

export type StockSentimentTone = "negative" | "neutral" | "positive" | "unknown";
export type StockSentimentConfidence = "high" | "low" | "medium";
export type StockSentimentFactorId =
  | "data-gap"
  | "direct-news"
  | "dividend"
  | "momentum"
  | "risk"
  | "sector-news"
  | "valuation";

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

  const directNews = newsItems.filter((item) =>
    item.symbols.some((newsSymbol) => normalizeScanSymbol(newsSymbol) === normalizedSymbol),
  );
  const sectorNews =
    matchedProfile === null
      ? []
      : newsItems.filter(
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

  const profileScore = matchedProfile ? profileSentimentScore(matchedProfile, factors) : 0;
  const score = roundScore(directScore + sectorScore + profileScore);
  const evidenceScore = directNews.length * 2 + sectorNews.length + (matchedProfile ? 2 : 0);

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
    return 1.8;
  }

  if (signal === "watch") {
    return -1.8;
  }

  return 0.35;
}

function profileSentimentScore(
  profile: StockProfile,
  factors: StockSentimentFactor[],
): number {
  let score = 0;

  if (profile.momentum !== null) {
    const momentumScore = profile.momentum >= 70 ? 1.1 : profile.momentum >= 55 ? 0.55 : profile.momentum < 40 ? -0.75 : 0;
    score += momentumScore;
    factors.push({
      id: "momentum",
      score: momentumScore,
      tone: toneFromScore(momentumScore),
      value: profile.momentum,
    });
  }

  if (profile.valuation !== null) {
    const valuationScore = profile.valuation >= 62 ? 0.45 : profile.valuation <= 35 ? -0.45 : 0;
    score += valuationScore;
    factors.push({
      id: "valuation",
      score: valuationScore,
      tone: toneFromScore(valuationScore),
      value: profile.valuation,
    });
  }

  if (profile.dividend !== null && profile.dividend >= 60) {
    score += 0.35;
    factors.push({
      id: "dividend",
      score: 0.35,
      tone: "positive",
      value: profile.dividend,
    });
  }

  const riskPressure =
    (profile.risk !== null && profile.risk >= 68 ? -0.75 : 0) +
    (profile.volatility !== null && profile.volatility >= 76 ? -0.45 : 0);

  if (riskPressure !== 0 || profile.risk !== null || profile.volatility !== null) {
    score += riskPressure;
    factors.push({
      id: "risk",
      score: riskPressure,
      tone: toneFromScore(riskPressure),
      value: Math.max(profile.risk ?? 0, profile.volatility ?? 0),
    });
  }

  return score;
}

function sentimentFromScore(score: number): StockSentimentTone {
  if (score >= 1.2) {
    return "positive";
  }

  if (score <= -1) {
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

