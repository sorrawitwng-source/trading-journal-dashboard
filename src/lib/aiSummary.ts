import type { Currency, Market, MarketFilter } from "../types";

export type AiSummaryMode = "market" | "stock";
export type AiSummaryTimeframe = "day" | "week" | "month";
export type AiMarketRegion = "Thai" | "US" | "Asia";

export interface AiSummaryPosition {
  currentPrice: number;
  market: Market;
  name: string;
  quantity: number;
  sector: string;
  symbol: string;
}

export interface AiSummaryRequest {
  apiKey: string;
  baseCurrency: Currency;
  language: "en" | "th";
  marketRegion: AiMarketRegion;
  marketFilter: MarketFilter;
  mode: AiSummaryMode;
  model?: string;
  positions: AiSummaryPosition[];
  question?: string;
  symbol?: string;
  timeframe: AiSummaryTimeframe;
}

export interface AiSummaryResult {
  fetchedAt: string;
  model: string;
  provider: "gemini";
  summary: string;
}

type SummaryFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Pick<Response, "json" | "ok" | "status">>;

interface AiSummaryErrorPayload {
  error?: unknown;
  message?: unknown;
}

export async function requestAiSummary(
  request: AiSummaryRequest,
  fetcher: SummaryFetcher = fetch,
): Promise<AiSummaryResult> {
  if (!request.apiKey.trim()) {
    throw new Error("Gemini API key is required");
  }

  const endpoints = ["/api/ai-summary", "/.netlify/functions/ai-summary"];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetcher(endpoint, {
        body: JSON.stringify({
          ...request,
          apiKey: request.apiKey.trim(),
          marketRegion: request.marketRegion,
          model: request.model?.trim() || undefined,
          question: request.question?.trim() || undefined,
          symbol: request.symbol?.trim().toUpperCase() || undefined,
          timeframe: request.timeframe,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        lastError = await parseAiSummaryError(response);
        if (response.status !== 404 && response.status !== 405) {
          break;
        }
        continue;
      }

      return parseAiSummaryResult(await response.json());
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("AI summary unavailable");
    }
  }

  throw lastError ?? new Error("AI summary unavailable");
}

async function parseAiSummaryError(
  response: Pick<Response, "json" | "status">,
): Promise<Error> {
  const payload = await response.json().catch(() => null);
  const message =
    payload && typeof payload === "object"
      ? stringValue((payload as AiSummaryErrorPayload).error) ??
        stringValue((payload as AiSummaryErrorPayload).message)
      : undefined;

  return new Error(message ?? `AI summary request failed (${response.status})`);
}

function parseAiSummaryResult(payload: unknown): AiSummaryResult {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid AI summary response");
  }

  const result = payload as Partial<AiSummaryResult>;

  if (typeof result.summary !== "string" || !result.summary.trim()) {
    throw new Error("AI summary response was empty");
  }

  return {
    fetchedAt:
      typeof result.fetchedAt === "string" ? result.fetchedAt : new Date().toISOString(),
    model: typeof result.model === "string" ? result.model : "gemini-3.5-flash",
    provider: "gemini",
    summary: result.summary.trim(),
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
