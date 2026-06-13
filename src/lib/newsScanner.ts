import type { Market, MarketFilter } from "../types";
import type { Language } from "./scoreText";
import { weeklyThemeUpdatedAt, weeklyThemes } from "./weeklyThemes";

export type NewsSignal = "hot" | "mixed" | "watch";
export type NewsProviderStatus = "fallback" | "live";
export type NewsTimeframe = "latest" | "30d" | "90d" | "all";

export const newsTimeframeOptions: NewsTimeframe[] = ["latest", "30d", "90d", "all"];

export interface NewsScanItem {
  category: string;
  id: string;
  impact: Record<Language, string>;
  market: Market;
  publishedAt: string;
  provider: "curated" | "finnhub";
  sectors: string[];
  signal: NewsSignal;
  source: string;
  sourceUrl: string;
  summary: Record<Language, string>;
  symbols: string[];
  title: Record<Language, string>;
}

export interface NewsScanResult {
  fetchedAt: string;
  items: NewsScanItem[];
  provider: "curated" | "finnhub";
  status: NewsProviderStatus;
}

type Fetcher = typeof fetch;

interface RemoteNewsItem {
  category?: unknown;
  datetime?: unknown;
  headline?: unknown;
  id?: unknown;
  impact?: unknown;
  market?: unknown;
  relatedSymbols?: unknown;
  sectors?: unknown;
  signal?: unknown;
  source?: unknown;
  summary?: unknown;
  url?: unknown;
}

interface RemoteNewsResponse {
  fetchedAt?: unknown;
  items?: unknown;
  provider?: unknown;
  status?: unknown;
}

export async function loadNewsScan(
  marketFilter: MarketFilter,
  timeframe: NewsTimeframe = "latest",
  fetcher: Fetcher = fetch,
): Promise<NewsScanResult> {
  const endpoints = [
    `/.netlify/functions/news-scan?category=general&timeframe=${timeframe}`,
    `/api/news-scan?category=general&timeframe=${timeframe}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetcher(endpoint);

      if (!response.ok) {
        continue;
      }

      const remoteResult = parseRemoteNewsResponse(await response.json());

      return {
        ...remoteResult,
        items: filterNewsItemsByTimeframe(
          mergeNewsItems(remoteResult.items, curatedNewsItems(marketFilter, timeframe)),
          timeframe,
        ),
      };
    } catch {
      continue;
    }
  }

  return {
    fetchedAt: weeklyThemeUpdatedAt,
    items: curatedNewsItems(marketFilter, timeframe),
    provider: "curated",
    status: "fallback",
  };
}

export function curatedNewsItems(
  marketFilter: MarketFilter,
  timeframe: NewsTimeframe = "latest",
): NewsScanItem[] {
  return filterNewsItemsByTimeframe(weeklyThemes
    .filter((theme) => marketFilter === "All" || theme.market === marketFilter)
    .map((theme) => ({
      category: "weekly-theme",
      id: `curated-${theme.id}`,
      impact: {
        en: signalImpact(theme.signal, "en"),
        th: signalImpact(theme.signal, "th"),
      },
      market: theme.market,
      provider: "curated" as const,
      publishedAt: theme.publishedAt,
      sectors: theme.sectors,
      signal: theme.signal,
      source: theme.sourceLabel,
      sourceUrl: theme.sourceUrl,
      summary: theme.thesis,
      symbols: theme.symbols,
      title: theme.title,
    })), timeframe);
}

export function marketMatches(item: NewsScanItem, marketFilter: MarketFilter) {
  return marketFilter === "All" || item.market === marketFilter;
}

export function trustedResearchNewsItems(items: NewsScanItem[]): NewsScanItem[] {
  return items.filter(isTrustedResearchNewsItem);
}

export function isTrustedResearchNewsItem(item: NewsScanItem): boolean {
  if (item.provider === "finnhub") {
    return false;
  }

  const sourceText = `${item.source} ${item.sourceUrl}`.toLowerCase();

  return trustedResearchSourcePatterns.some((pattern) => pattern.test(sourceText));
}

const trustedResearchSourcePatterns = [
  /\bset\b/,
  /set\.or\.th/,
  /research/,
  /securities/,
  /broker/,
  /bualuang/,
  /innovestx/,
  /kasikorn/,
  /ks\s*research/,
  /kresearch/,
  /pi\s*research/,
  /yuanta/,
  /schwab/,
];

function parseRemoteNewsResponse(payload: RemoteNewsResponse): NewsScanResult {
  const items = Array.isArray(payload?.items)
    ? payload.items
        .map(parseRemoteNewsItem)
        .filter((item): item is NewsScanItem => item !== null)
    : [];

  return {
    fetchedAt: stringValue(payload?.fetchedAt) ?? new Date().toISOString(),
    items,
    provider: payload?.provider === "finnhub" ? "finnhub" : "curated",
    status: payload?.status === "live" ? "live" : "fallback",
  };
}

function parseRemoteNewsItem(payload: RemoteNewsItem): NewsScanItem | null {
  const headline = stringValue(payload?.headline);
  const sourceUrl = stringValue(payload?.url);

  if (!headline || !sourceUrl) {
    return null;
  }

  const signal = newsSignal(payload?.signal);
  const summary = stringValue(payload?.summary) ?? "";

  return {
    category: stringValue(payload?.category) ?? "general",
    id: stringValue(payload?.id) ?? sourceUrl,
    impact: {
      en: stringValue(payload?.impact) ?? signalImpact(signal, "en"),
      th: signalImpact(signal, "th"),
    },
    market: payload?.market === "Thai" ? "Thai" : "US",
    provider: "finnhub",
    publishedAt:
      typeof payload?.datetime === "number" && Number.isFinite(payload.datetime)
        ? new Date(payload.datetime * 1000).toISOString()
        : new Date().toISOString(),
    sectors: stringArray(payload?.sectors, ["Market breadth"]),
    signal,
    source: stringValue(payload?.source) ?? "Finnhub",
    sourceUrl,
    summary: {
      en: summary,
      th: summary,
    },
    symbols: stringArray(payload?.relatedSymbols, []),
    title: {
      en: headline,
      th: headline,
    },
  };
}

function mergeNewsItems(liveItems: NewsScanItem[], fallbackItems: NewsScanItem[]) {
  const seen = new Set<string>();
  const mergedItems: NewsScanItem[] = [];

  for (const item of [...liveItems, ...fallbackItems]) {
    const key = `${item.sourceUrl}|${item.title.en}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    mergedItems.push(item);
  }

  return sortNewsItemsByDate(mergedItems);
}

export function filterNewsItemsByTimeframe(
  items: NewsScanItem[],
  timeframe: NewsTimeframe,
): NewsScanItem[] {
  if (timeframe === "all") {
    return sortNewsItemsByDate(items);
  }

  const days = newsTimeframeDays(timeframe);
  const referenceDate = latestNewsDate(items);

  return sortNewsItemsByDate(
    items.filter((item) => isWithinNewsTimeframe(item.publishedAt, days, referenceDate)),
  );
}

export function newsTimeframeDays(timeframe: NewsTimeframe): number {
  if (timeframe === "30d") {
    return 30;
  }

  if (timeframe === "90d") {
    return 90;
  }

  return 7;
}

export function latestNewsDate(items: Pick<NewsScanItem, "publishedAt">[]): Date {
  const latestTime = items.reduce((latest, item) => {
    const time = Date.parse(item.publishedAt);

    return Number.isFinite(time) ? Math.max(latest, time) : latest;
  }, 0);

  return latestTime > 0 ? new Date(latestTime) : new Date();
}

export function isWithinNewsTimeframe(
  value: string,
  days: number,
  referenceDate: Date = new Date(),
): boolean {
  const time = Date.parse(value);

  if (!Number.isFinite(time)) {
    return false;
  }

  const cutoff = referenceDate.getTime() - days * 24 * 60 * 60 * 1000;

  return time >= cutoff && time <= referenceDate.getTime() + 24 * 60 * 60 * 1000;
}

function sortNewsItemsByDate(items: NewsScanItem[]): NewsScanItem[] {
  return [...items].sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

function signalImpact(signal: NewsSignal, language: Language) {
  if (signal === "hot") {
    return language === "th" ? "แรงหนุนเชิงบวก" : "Positive catalyst";
  }

  if (signal === "watch") {
    return language === "th" ? "ต้องระวังความเสี่ยง" : "Risk watch";
  }

  return language === "th" ? "จับตาการหมุนกลุ่ม" : "Rotation watch";
}

function newsSignal(value: unknown): NewsSignal {
  if (value === "hot" || value === "watch") {
    return value;
  }

  return "mixed";
}

function stringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const nextValue = value
    .map((item) => stringValue(item))
    .filter((item): item is string => Boolean(item));

  return nextValue.length > 0 ? nextValue : fallback;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
