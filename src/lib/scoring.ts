import type {
  DataQuality,
  MarketFilter,
  RiskLevel,
  ScoreBreakdown,
  ScoreBreakdownItem,
  StockProfile,
} from "../types";

export interface StockRecommendation {
  symbol: string;
  name: string;
  market: StockProfile["market"];
  sector: string;
  score: number | null;
  scoreBreakdown: ScoreBreakdown;
  dataQuality: DataQuality;
  riskLevel: RiskLevel;
  riskReason: string;
  reason: string;
  keyRisk: string;
  researchPrompt: string;
}

export interface ScoreComponentGuide {
  key: string;
  label: string;
  weight: number;
}

interface RiskAssessment {
  level: RiskLevel;
  reason: string;
}

const minimumScorableInputs = 3;
const scoreMethodology =
  "Score is a weighted blend of available momentum, valuation, stability, dividend, risk profile, and data confidence inputs. Missing inputs reduce confidence instead of being guessed.";
const scoringComponents = [
  {
    key: "momentum",
    label: "Momentum",
    metric: (stock: StockProfile) => stock.momentum,
    weight: 0.25,
  },
  {
    key: "valuation",
    label: "Valuation",
    metric: (stock: StockProfile) => stock.valuation,
    weight: 0.2,
  },
  {
    key: "stability",
    label: "Stability",
    metric: (stock: StockProfile) =>
      stock.volatility === null ? null : 100 - stock.volatility,
    weight: 0.2,
  },
  {
    key: "dividend",
    label: "Dividend",
    metric: (stock: StockProfile) => stock.dividend,
    weight: 0.1,
  },
  {
    key: "riskProfile",
    label: "Risk profile",
    metric: (stock: StockProfile) =>
      stock.risk === null ? null : 100 - stock.risk,
    weight: 0.15,
  },
] as const;

export const scoreComponentGuides: ScoreComponentGuide[] = [
  ...scoringComponents.map(({ key, label, weight }) => ({ key, label, weight })),
  { key: "dataConfidence", label: "Data confidence", weight: 0.1 },
];

const clampScore = (score: number): number => Math.min(100, Math.max(0, score));

export function scoreStock(stock: StockProfile): number | null {
  const breakdown = buildScoreBreakdown(stock);
  const availableCoreItems = breakdown.items.filter(
    (item) => item.label !== "Data confidence" && item.available,
  );

  if (availableCoreItems.length < minimumScorableInputs) {
    return null;
  }

  const rawScore = breakdown.items.reduce(
    (sum, item) => sum + item.contribution,
    0,
  );

  return clampScore(Math.round(rawScore));
}

export function buildScoreBreakdown(stock: StockProfile): ScoreBreakdown {
  const coreItems = scoringComponents.map((component) =>
    buildBreakdownItem(
      component.label,
      component.metric(stock),
      component.weight,
    ),
  );
  const availableCount = coreItems.filter((item) => item.available).length;
  const confidenceValue = (availableCount / scoringComponents.length) * 100;
  const confidenceItem = buildBreakdownItem(
    "Data confidence",
    confidenceValue,
    0.1,
  );

  return {
    dataQuality: dataQualityFromAvailableCount(availableCount),
    items: [...coreItems, confidenceItem],
    methodology: scoreMethodology,
  };
}

export function riskLabel(
  risk: number | null,
  volatility: number | null = null,
): RiskAssessment {
  const riskInput = risk ?? volatility;

  if (riskInput === null) {
    return {
      level: "No data",
      reason: "Risk needs volatility or risk metric data.",
    };
  }

  if (riskInput <= 33) {
    return {
      level: "Low",
      reason: "Risk score is in the lower third of the 0-100 risk scale.",
    };
  }

  if (riskInput <= 66) {
    return {
      level: "Medium",
      reason: "Risk score sits in the middle third of the 0-100 risk scale.",
    };
  }

  return {
    level: "High",
    reason: "Risk score is in the upper third of the 0-100 risk scale.",
  };
}

export function buildRecommendation(stock: StockProfile): StockRecommendation {
  const scoreBreakdown = buildScoreBreakdown(stock);
  const risk = riskLabel(stock.risk, stock.volatility);
  const score = scoreStock(stock);
  const strongest = strongestMetric(scoreBreakdown.items);

  return {
    symbol: stock.symbol,
    name: stock.name,
    market: stock.market,
    sector: stock.sector,
    score,
    scoreBreakdown,
    dataQuality: scoreBreakdown.dataQuality,
    riskLevel: risk.level,
    riskReason: risk.reason,
    reason:
      score === null
        ? "Not enough verified data to rank this stock yet."
        : `Strong ${strongest} is the main positive input in this score.`,
    keyRisk:
      risk.level === "No data"
        ? "Risk is unavailable because volatility/risk inputs are missing."
        : risk.reason,
    researchPrompt:
      score === null
        ? "Find verified fundamentals, sector, volatility, and dividend data before making this a candidate."
        : `Research whether ${strongest}, sector outlook, and valuation still support the score.`,
  };
}

export function rankRecommendations(
  stocks: StockProfile[],
  filter: MarketFilter,
): StockRecommendation[] {
  return stocks
    .filter((stock) => filter === "All" || stock.market === filter)
    .map(buildRecommendation)
    .filter((recommendation) => recommendation.score !== null)
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0));
}

export function dataQualityLabel(dataQuality: DataQuality): string {
  if (dataQuality === "complete") {
    return "All score inputs are available.";
  }

  if (dataQuality === "partial") {
    return "Some inputs are missing, so confidence is reduced.";
  }

  if (dataQuality === "limited") {
    return "Only limited inputs are available; treat this as a watchlist note.";
  }

  return "No verified score inputs are available.";
}

function buildBreakdownItem(
  label: string,
  value: number | null,
  weight: number,
): ScoreBreakdownItem {
  const available = value !== null;

  return {
    available,
    contribution: available ? (value * weight) : 0,
    label,
    value,
    weight,
  };
}

function dataQualityFromAvailableCount(availableCount: number): DataQuality {
  if (availableCount === scoringComponents.length) {
    return "complete";
  }

  if (availableCount >= 3) {
    return "partial";
  }

  if (availableCount >= 1) {
    return "limited";
  }

  return "no-data";
}

function strongestMetric(items: ScoreBreakdownItem[]): string {
  const availableItems = items.filter(
    (item) => item.available && item.label !== "Data confidence",
  );

  if (availableItems.length === 0) {
    return "verified data";
  }

  return availableItems.reduce((strongest, item) =>
    item.contribution > strongest.contribution ? item : strongest,
  ).label.toLowerCase();
}
