const finnhubMarketNewsUrl = "https://finnhub.io/api/v1/news";
const finnhubCompanyNewsUrl = "https://finnhub.io/api/v1/company-news";

const defaultSymbols = ["AAPL", "NVDA", "MSFT", "AMZN", "TSLA", "AMD"];
const allowedCategories = new Set(["crypto", "forex", "general", "merger"]);

exports.handler = async (event) => {
  const apiKey = process.env.FINNHUB_API_KEY;
  const category = normalizeCategory(event.queryStringParameters?.category);
  const symbols = normalizeSymbols(event.queryStringParameters?.symbols);
  const timeframe = normalizeTimeframe(event.queryStringParameters?.timeframe);

  if (!apiKey) {
    return jsonResponse(200, {
      fetchedAt: new Date().toISOString(),
      items: [],
      provider: "curated",
      status: "fallback",
    });
  }

  try {
    const items = await fetchFinnhubNews({
      apiKey,
      category,
      symbols: symbols.length > 0 ? symbols : defaultSymbols,
      timeframe,
    });

    return jsonResponse(200, {
      fetchedAt: new Date().toISOString(),
      items,
      provider: "finnhub",
      status: items.length > 0 ? "live" : "fallback",
    });
  } catch {
    return jsonResponse(200, {
      fetchedAt: new Date().toISOString(),
      items: [],
      provider: "curated",
      status: "fallback",
    });
  }
};

async function fetchFinnhubNews({ apiKey, category, symbols, timeframe }) {
  const marketNews = await fetchMarketNews(apiKey, category);
  const companyNewsGroups = await Promise.all(
    symbols.slice(0, 6).map((symbol) => fetchCompanyNews(apiKey, symbol, timeframe)),
  );

  return dedupeNews([...marketNews, ...companyNewsGroups.flat()])
    .map(parseFinnhubNews)
    .filter(Boolean)
    .slice(0, 28);
}

async function fetchMarketNews(apiKey, category) {
  const url = new URL(finnhubMarketNewsUrl);
  url.searchParams.set("category", category);
  url.searchParams.set("token", apiKey);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 Netlify Function",
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

async function fetchCompanyNews(apiKey, symbol, timeframe) {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setUTCDate(today.getUTCDate() - timeframeToDays(timeframe));

  const url = new URL(finnhubCompanyNewsUrl);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("from", formatIsoDate(fromDate));
  url.searchParams.set("to", formatIsoDate(today));
  url.searchParams.set("token", apiKey);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 Netlify Function",
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

function parseFinnhubNews(payload) {
  const headline = stringValue(payload?.headline);
  const url = stringValue(payload?.url);

  if (!headline || !url) {
    return null;
  }

  const summary = stringValue(payload?.summary) ?? "";
  const relatedSymbols = parseRelatedSymbols(payload?.related);
  const signal = classifySignal(`${headline} ${summary}`);
  const sectors = classifySectors(`${headline} ${summary}`);

  return {
    category: stringValue(payload?.category) ?? "general",
    datetime: finiteNumber(payload?.datetime),
    headline,
    id: String(payload?.id ?? url),
    image: stringValue(payload?.image),
    impact: impactForSignal(signal),
    market: relatedSymbols.some((symbol) => symbol.endsWith(".BK")) ? "Thai" : "US",
    relatedSymbols,
    sectors,
    signal,
    source: stringValue(payload?.source) ?? "Finnhub",
    summary,
    url,
  };
}

function classifySignal(text) {
  const normalized = text.toLowerCase();
  const riskWords = [
    "cut",
    "delay",
    "downgrade",
    "fall",
    "falls",
    "lawsuit",
    "miss",
    "probe",
    "risk",
    "slump",
    "tariff",
    "warning",
  ];
  const hotWords = [
    "approval",
    "beat",
    "breakout",
    "contract",
    "expands",
    "growth",
    "launch",
    "record",
    "rally",
    "raises",
    "strong",
    "surge",
    "upgrade",
  ];

  if (riskWords.some((word) => normalized.includes(word))) {
    return "watch";
  }

  if (hotWords.some((word) => normalized.includes(word))) {
    return "hot";
  }

  return "mixed";
}

function classifySectors(text) {
  const normalized = text.toLowerCase();
  const sectorRules = [
    ["AI Infrastructure", [" ai ", "artificial intelligence", "data center", "server", "chip", "semiconductor"]],
    ["Technology", ["software", "cloud", "cyber", "digital", "platform"]],
    ["Energy", ["oil", "gas", "energy", "crude", "power", "electricity"]],
    ["Health Care", ["drug", "fda", "health", "hospital", "medical", "biotech"]],
    ["Financials", ["bank", "fed", "rate", "loan", "credit", "insurance"]],
    ["Consumer", ["retail", "consumer", "restaurant", "travel", "airline"]],
    ["Real Estate", ["reit", "property", "real estate", "housing"]],
    ["Industrials", ["industrial", "factory", "construction", "transport", "logistics"]],
  ];
  const sectors = sectorRules
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([sector]) => sector);

  return sectors.length > 0 ? sectors.slice(0, 3) : ["Market breadth"];
}

function impactForSignal(signal) {
  if (signal === "hot") {
    return "Positive catalyst";
  }

  if (signal === "watch") {
    return "Risk watch";
  }

  return "Rotation watch";
}

function dedupeNews(items) {
  const seen = new Set();
  const nextItems = [];

  for (const item of items) {
    const key = stringValue(item?.url) ?? stringValue(item?.headline) ?? String(item?.id ?? "");

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    nextItems.push(item);
  }

  return nextItems;
}

function normalizeCategory(category) {
  const normalized = typeof category === "string" ? category.trim().toLowerCase() : "general";
  return allowedCategories.has(normalized) ? normalized : "general";
}

function normalizeSymbols(symbols) {
  if (typeof symbols !== "string") {
    return [];
  }

  return symbols
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => /^[A-Z0-9.\-]{1,12}$/.test(symbol));
}

function normalizeTimeframe(timeframe) {
  const normalized = typeof timeframe === "string" ? timeframe.trim().toLowerCase() : "latest";

  if (normalized === "30d" || normalized === "90d" || normalized === "all") {
    return normalized;
  }

  return "latest";
}

function timeframeToDays(timeframe) {
  if (timeframe === "30d") {
    return 30;
  }

  if (timeframe === "90d" || timeframe === "all") {
    return 90;
  }

  return 7;
}

function parseRelatedSymbols(value) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => /^[A-Z0-9.\-]{1,12}$/.test(symbol))
    .slice(0, 10);
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function jsonResponse(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300",
      "content-type": "application/json",
    },
    statusCode,
  };
}

exports._test = {
  classifySectors,
  classifySignal,
  normalizeCategory,
  normalizeSymbols,
  normalizeTimeframe,
  parseFinnhubNews,
  timeframeToDays,
};
