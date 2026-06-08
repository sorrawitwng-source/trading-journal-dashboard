import type { Market, MarketFilter } from "../types";
import type { Language } from "./scoreText";
import { weeklyThemeUpdatedAt, weeklyThemes } from "./weeklyThemes";

export type NewsSignal = "hot" | "mixed" | "watch";
export type NewsProviderStatus = "fallback" | "live";

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
  fetcher: Fetcher = fetch,
): Promise<NewsScanResult> {
  const endpoints = [
    "/.netlify/functions/news-scan?category=general",
    "/api/news-scan?category=general",
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
        items: mergeNewsItems(remoteResult.items, curatedNewsItems(marketFilter)),
      };
    } catch {
      continue;
    }
  }

  return {
    fetchedAt: weeklyThemeUpdatedAt,
    items: curatedNewsItems(marketFilter),
    provider: "curated",
    status: "fallback",
  };
}

export function curatedNewsItems(marketFilter: MarketFilter): NewsScanItem[] {
  return weeklyThemes
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
      publishedAt: weeklyThemeUpdatedAt,
      sectors: theme.sectors,
      signal: theme.signal,
      source: theme.sourceLabel,
      sourceUrl: theme.sourceUrl,
      summary: theme.thesis,
      symbols: theme.symbols,
      title: theme.title,
    }));
}

export function marketMatches(item: NewsScanItem, marketFilter: MarketFilter) {
  return marketFilter === "All" || item.market === marketFilter;
}

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

  return mergedItems;
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
