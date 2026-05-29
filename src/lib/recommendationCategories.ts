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
    description: "Higher income names with stronger dividend metrics.",
    matches: (stock) => stock.dividend !== null && stock.dividend >= 55,
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
    description: "Stocks with strong momentum and above-average score potential.",
    matches: (stock) => stock.momentum !== null && stock.momentum >= 68,
  },
  {
    id: "low-risk",
    label: "Low Risk",
    description: "Lower-risk names with steadier volatility profiles.",
    matches: (stock) =>
      (stock.risk !== null && stock.risk <= 35) ||
      (stock.volatility !== null && stock.volatility <= 32),
  },
  {
    id: "thai",
    label: "Thai Stocks",
    description: "SET100-focused Thai ideas for local-market tracking.",
    matches: (stock) => stock.market === "Thai",
  },
  {
    id: "us",
    label: "US Stocks",
    description: "S&P 500 and Nasdaq 100 ideas for global exposure.",
    matches: (stock) => stock.market === "US",
  },
];

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
      .sort((left, right) => right.score - left.score)
      .slice(0, 6),
  }));
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
