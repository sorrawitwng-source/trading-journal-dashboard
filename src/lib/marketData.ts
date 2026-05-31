import type {
  Market,
  PortfolioPosition,
  PriceStatus,
  SectorSource,
} from "../types";
import { fallbackUsdThbRate } from "./portfolio";

export interface MarketQuote {
  currency?: string;
  exchangeName?: string;
  fetchedAt?: string;
  name?: string;
  price: number;
  providerSymbol: string;
  sector?: string;
  sectorSource?: SectorSource;
  source?: string;
}

export interface CachedQuote extends MarketQuote {
  fetchedAt: string;
}

export interface ExchangeRateQuote {
  fetchedAt: string;
  rate: number;
  status: PriceStatus;
}

type QuoteCache = Record<string, CachedQuote>;
type Fetcher = typeof fetch;

export const storedQuoteCacheKey = "trading-journal.quotes.v1";
export const storedExchangeRateKey = "trading-journal.usd-thb-rate.v1";

export function toYahooSymbol(symbol: string, market: Market): string {
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (market === "Thai" && !normalizedSymbol.endsWith(".BK")) {
    return `${normalizedSymbol}.BK`;
  }

  if (market === "US") {
    return normalizedSymbol.replace(".", "-");
  }

  return normalizedSymbol;
}

export function parseYahooChartQuote(
  payload: unknown,
  fallbackSymbol: string,
): MarketQuote | null {
  const flatQuote = parseFlatQuote(payload, fallbackSymbol);

  if (flatQuote) {
    return flatQuote;
  }

  const chart = asRecord(payload)?.chart;
  const resultItems = asRecord(chart)?.result;
  const firstResult = asRecord(
    Array.isArray(resultItems) ? resultItems[0] : undefined,
  );
  const meta = asRecord(firstResult?.meta);
  const price =
    finiteNumber(meta?.regularMarketPrice) ??
    finiteNumber(meta?.previousClose) ??
    latestFiniteClose(firstResult);

  if (price === null) {
    return null;
  }

  return {
    currency: stringValue(meta?.currency),
    exchangeName: stringValue(meta?.exchangeName),
    price,
    providerSymbol: stringValue(meta?.symbol) ?? fallbackSymbol,
  };
}

export function applyCachedQuotes(
  positions: PortfolioPosition[],
  quoteCache: QuoteCache,
): PortfolioPosition[] {
  return positions.map((position) => {
    const cachedQuote =
      quoteCache[quoteCacheKey(position.symbol, position.market)] ??
      quoteCache[position.symbol];

    if (!cachedQuote || position.isCustom || position.market === "Custom") {
      return markPriceStatus(position, "fallback");
    }

    return applyQuote(position, cachedQuote, "cached");
  });
}

export async function refreshPositionPrices(
  positions: PortfolioPosition[],
  storage: Storage = localStorage,
  fetcher: Fetcher = fetch,
): Promise<PortfolioPosition[]> {
  const quoteCache = loadQuoteCache(storage);
  const nextQuoteCache = { ...quoteCache };

  const updatedPositions = await Promise.all(
    positions.map(async (position) => {
      if (position.isCustom || position.market === "Custom") {
        return markPriceStatus(position, "fallback");
      }

      const cacheKey = quoteCacheKey(position.symbol, position.market);

      try {
        const quote = await fetchMarketQuote(position, fetcher);
        const cachedQuote = {
          ...quote,
          fetchedAt: new Date().toISOString(),
        };

        nextQuoteCache[cacheKey] = cachedQuote;

        return applyQuote(position, cachedQuote, "live");
      } catch {
        const cachedQuote = quoteCache[cacheKey];

        if (cachedQuote) {
          return applyQuote(position, cachedQuote, "cached");
        }

        return markPriceStatus(position, "fallback");
      }
    }),
  );

  saveQuoteCache(nextQuoteCache, storage);

  return updatedPositions;
}

export function loadQuoteCache(storage: Storage = localStorage): QuoteCache {
  try {
    const rawValue = storage.getItem(storedQuoteCacheKey);

    if (!rawValue) {
      return {};
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter(
        (entry): entry is [string, CachedQuote] => isCachedQuote(entry[1]),
      ),
    );
  } catch {
    return {};
  }
}

export function saveQuoteCache(
  quoteCache: QuoteCache,
  storage: Storage = localStorage,
) {
  try {
    storage.setItem(storedQuoteCacheKey, JSON.stringify(quoteCache));
  } catch {
    // Cache writes are optional; portfolio tracking should continue without them.
  }
}

export function loadUsdThbRate(
  storage: Storage = localStorage,
): ExchangeRateQuote | null {
  try {
    const rawValue = storage.getItem(storedExchangeRateKey);

    if (!rawValue) {
      return null;
    }

    const parsedValue = asRecord(JSON.parse(rawValue));
    const rate = finiteNumber(parsedValue?.rate);
    const fetchedAt = stringValue(parsedValue?.fetchedAt);
    const status = priceStatusValue(parsedValue?.status);

    if (rate === null || !fetchedAt || !status) {
      return null;
    }

    return { fetchedAt, rate, status };
  } catch {
    return null;
  }
}

export async function refreshUsdThbRate(
  storage: Storage = localStorage,
  fetcher: Fetcher = fetch,
): Promise<ExchangeRateQuote> {
  const cachedRate = loadUsdThbRate(storage);

  try {
    const quote = await fetchUsdThbQuote(fetcher);
    const nextRate = {
      fetchedAt: new Date().toISOString(),
      rate: roundTo(quote.price, 4),
      status: "live" as PriceStatus,
    };

    saveUsdThbRate(nextRate, storage);

    return nextRate;
  } catch {
    if (cachedRate) {
      return { ...cachedRate, status: "cached" };
    }

    return {
      fetchedAt: new Date().toISOString(),
      rate: fallbackUsdThbRate,
      status: "fallback",
    };
  }
}

function quoteCacheKey(symbol: string, market: Market): string {
  return `${market}:${symbol.trim().toUpperCase()}`;
}

async function fetchMarketQuote(
  position: PortfolioPosition,
  fetcher: Fetcher,
): Promise<MarketQuote> {
  const providerSymbol = toYahooSymbol(position.symbol, position.market);
  const endpoints = [
    `/.netlify/functions/quote?symbol=${encodeURIComponent(providerSymbol)}`,
    `/api/quote?symbol=${encodeURIComponent(providerSymbol)}`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      providerSymbol,
    )}?range=1d&interval=1m`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetcher(endpoint);

      if (!response.ok) {
        continue;
      }

      const payload: unknown = await response.json();
      const quote = parseYahooChartQuote(payload, providerSymbol);

      if (quote) {
        return quote;
      }
    } catch {
      continue;
    }
  }

  throw new Error(`No quote available for ${providerSymbol}`);
}

async function fetchUsdThbQuote(fetcher: Fetcher): Promise<MarketQuote> {
  const providerSymbol = "THB=X";
  const endpoints = [
    `/.netlify/functions/quote?symbol=${encodeURIComponent(providerSymbol)}`,
    `/api/quote?symbol=${encodeURIComponent(providerSymbol)}`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      providerSymbol,
    )}?range=1d&interval=1m`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetcher(endpoint);

      if (!response.ok) {
        continue;
      }

      const quote = parseYahooChartQuote(await response.json(), providerSymbol);

      if (quote && quote.price > 0) {
        return quote;
      }
    } catch {
      continue;
    }
  }

  throw new Error("USD/THB rate unavailable");
}

function saveUsdThbRate(rate: ExchangeRateQuote, storage: Storage = localStorage) {
  try {
    storage.setItem(storedExchangeRateKey, JSON.stringify(rate));
  } catch {
    // FX caching is optional; the app can continue with the fallback rate.
  }
}

function applyQuote(
  position: PortfolioPosition,
  quote: CachedQuote,
  priceStatus: PriceStatus,
): PortfolioPosition {
  return {
    ...position,
    currentPrice: roundTo(quote.price, 2),
    currency: currencyValue(quote.currency) ?? position.currency,
    name: quote.name ?? position.name,
    priceStatus,
    priceUpdatedAt: quote.fetchedAt,
    sector: quote.sector ?? position.sector,
    sectorSource: quote.sectorSource ?? position.sectorSource,
  };
}

function markPriceStatus(
  position: PortfolioPosition,
  priceStatus: PriceStatus,
): PortfolioPosition {
  return {
    ...position,
    priceStatus,
  };
}

function parseFlatQuote(
  payload: unknown,
  fallbackSymbol: string,
): MarketQuote | null {
  const record = asRecord(payload);
  const price = finiteNumber(record?.price);

  if (price === null) {
    return null;
  }

  return {
    currency: stringValue(record?.currency),
    exchangeName: stringValue(record?.exchangeName),
    name: stringValue(record?.name),
    price,
    providerSymbol: stringValue(record?.providerSymbol) ?? fallbackSymbol,
    sector: stringValue(record?.sector),
    sectorSource: sectorSourceValue(record?.sectorSource),
    source: stringValue(record?.source),
  };
}

function latestFiniteClose(result: Record<string, unknown> | undefined): number | null {
  const indicators = asRecord(result?.indicators);
  const quoteItems = asRecord(indicators)?.quote;
  const firstQuote = Array.isArray(quoteItems) ? asRecord(quoteItems[0]) : undefined;
  const closes = firstQuote?.close;

  if (!Array.isArray(closes)) {
    return null;
  }

  for (let index = closes.length - 1; index >= 0; index -= 1) {
    const value = finiteNumber(closes[index]);

    if (value !== null) {
      return value;
    }
  }

  return null;
}

function isCachedQuote(value: unknown): value is CachedQuote {
  const quote = asRecord(value);

  return (
    finiteNumber(quote?.price) !== null &&
    typeof quote?.providerSymbol === "string" &&
    typeof quote?.fetchedAt === "string"
  );
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function sectorSourceValue(value: unknown): SectorSource | undefined {
  return value === "curated" || value === "provider" || value === "unknown"
    ? value
    : undefined;
}

function priceStatusValue(value: unknown): PriceStatus | undefined {
  return value === "live" || value === "cached" || value === "fallback"
    ? value
    : undefined;
}

function currencyValue(value: unknown): PortfolioPosition["currency"] | undefined {
  return value === "THB" || value === "USD" ? value : undefined;
}

function roundTo(value: number, decimals: number): number {
  const multiplier = 10 ** decimals;

  return Math.round(value * multiplier) / multiplier;
}
