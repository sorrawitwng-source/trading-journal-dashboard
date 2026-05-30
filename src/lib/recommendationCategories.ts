import type { MarketFilter, StockProfile } from "../types";
import { buildRecommendation, type StockRecommendation } from "./scoring";

export interface RecommendationCategory {
  description: string;
  id: string;
  label: string;
  stocks: StockRecommendation[];
}

interface CategoryDefinition {
  description: string;
  id: string;
  label: string;
  matches: (stock: StockProfile) => boolean;
}

const categoryDefinitions: CategoryDefinition[] = [
  sectorCategory("tech", "Tech", "Semiconductors, software, and platform leaders.", [
    "technology",
    "semiconductors",
    "telecommunications",
    "communication services",
  ]),
  {
    id: "dividend",
    label: "Dividend",
    description: "Income names with visible yield support or defensive cash-return traits.",
    matches: (stock) => stock.dividend !== null && stock.dividend >= 45,
  },
  sectorCategory("real-estate", "Real Estate", "Property developers, REIT-like names, and land-linked businesses.", [
    "property",
    "real estate",
  ]),
  sectorCategory("food", "Food", "Food, beverage, staples, and restaurant-related companies.", [
    "food",
    "beverage",
    "consumer staples",
  ]),
  sectorCategory("banking-finance", "Banking / Finance", "Banks, insurers, credit, and capital-market names.", [
    "banking",
    "financials",
    "finance",
  ]),
  sectorCategory("energy", "Energy", "Oil, gas, utilities-linked energy, and petrochemicals.", [
    "energy",
    "petrochemicals",
    "materials",
  ]),
  sectorCategory("healthcare", "Healthcare", "Hospitals, healthcare services, and medical businesses.", [
    "health",
  ]),
  sectorCategory("consumer", "Consumer", "Commerce, retail, auto, discretionary, and household demand.", [
    "commerce",
    "consumer",
    "automobiles",
  ]),
  sectorCategory("industrial", "Industrial", "Manufacturing, industrial services, and infrastructure suppliers.", [
    "industrial",
    "industrials",
  ]),
  sectorCategory("utilities", "Utilities", "Power, regulated utilities, and defensive infrastructure.", [
    "utilities",
  ]),
  sectorCategory("transportation-tourism", "Transportation / Tourism", "Airports, travel, hotels, logistics, and mobility.", [
    "transportation",
    "tourism",
    "hotels",
  ]),
  {
    id: "growth",
    label: "Growth / Momentum",
    description: "Stocks with improving momentum, trend strength, or active research interest.",
    matches: (stock) => stock.momentum !== null && stock.momentum >= 55,
  },
  {
    id: "low-risk",
    label: "Low Risk",
    description: "Lower-volatility candidates and steadier names for watchlist building.",
    matches: (stock) =>
      (stock.risk !== null && stock.risk <= 45) ||
      (stock.volatility !== null && stock.volatility <= 42),
  },
  {
    id: "thai",
    label: "Thai Stocks",
    description: "SET100-focused Thai watchlist for local-market tracking.",
    matches: (stock) => stock.market === "Thai",
  },
  {
    id: "us",
    label: "US Stocks",
    description: "S&P 500 and Nasdaq 100 watchlist for global exposure.",
    matches: (stock) => stock.market === "US",
  },
];

const ideasPerCategory = 10;

export function buildRecommendationCategories(
  stocks: StockProfile[],
  filter: MarketFilter,
): RecommendationCategory[] {
  const filteredStocks = stocks.filter(
    (stock) => filter === "All" || stock.market === filter,
  );

  return categoryDefinitions.map((category) => ({
    description: category.description,
    id: category.id,
    label: category.label,
    stocks: filteredStocks
      .filter(category.matches)
      .map(buildRecommendation)
      .filter(
        (stock): stock is StockRecommendation & { score: number } =>
          stock.score !== null,
      )
      .sort(compareRecommendations)
      .slice(0, ideasPerCategory),
  }));
}

function compareRecommendations(
  left: StockRecommendation,
  right: StockRecommendation,
): number {
  const leftScore = left.score ?? -1;
  const rightScore = right.score ?? -1;

  if (rightScore !== leftScore) {
    return rightScore - leftScore;
  }

  const qualityRank = dataQualityRank(right.dataQuality) - dataQualityRank(left.dataQuality);

  if (qualityRank !== 0) {
    return qualityRank;
  }

  return left.symbol.localeCompare(right.symbol);
}

function dataQualityRank(dataQuality: StockRecommendation["dataQuality"]): number {
  if (dataQuality === "complete") {
    return 3;
  }

  if (dataQuality === "partial") {
    return 2;
  }

  if (dataQuality === "limited") {
    return 1;
  }

  return 0;
}

function sectorCategory(
  id: string,
  label: string,
  description: string,
  sectorKeywords: string[],
): CategoryDefinition {
  return {
    description,
    id,
    label,
    matches: (stock) => {
      const sector = stock.sector.toLowerCase();

      return sectorKeywords.some((keyword) => sector.includes(keyword));
    },
  };
}
