const yahooChartBaseUrl = "https://query1.finance.yahoo.com/v8/finance/chart";
const finnhubQuoteUrl = "https://finnhub.io/api/v1/quote";
const stooqQuoteUrl = "https://stooq.com/q/l/";

exports.handler = async (event) => {
  const symbol = event.queryStringParameters?.symbol;

  if (!symbol || typeof symbol !== "string") {
    return jsonResponse(400, { error: "Missing symbol" });
  }

  const safeSymbol = symbol.trim().toUpperCase();

  if (!/^[A-Z0-9.\-=^]+$/.test(safeSymbol)) {
    return jsonResponse(400, { error: "Invalid symbol" });
  }

  const quote = await fetchBestQuote(safeSymbol);

  if (!quote) {
    return jsonResponse(404, { error: "Quote unavailable" });
  }

  return jsonResponse(200, quote);
};

async function fetchBestQuote(symbol) {
  const providers = isUsSymbol(symbol)
    ? [fetchFinnhubQuote, fetchYahooQuote, fetchStooqQuote]
    : [fetchYahooQuote, fetchStooqQuote];

  for (const provider of providers) {
    try {
      const quote = await provider(symbol);

      if (quote) {
        return quote;
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchFinnhubQuote(symbol) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `${finnhubQuoteUrl}?symbol=${encodeURIComponent(toFinnhubSymbol(symbol))}`,
    {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 Netlify Function",
        "x-finnhub-token": apiKey,
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  return parseFinnhubQuote(await response.json(), toFinnhubSymbol(symbol));
}

async function fetchYahooQuote(symbol) {
  const yahooUrl = `${yahooChartBaseUrl}/${encodeURIComponent(
    symbol,
  )}?range=1d&interval=1m`;
  const response = await fetch(yahooUrl, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 Netlify Function",
    },
  });

  if (!response.ok) {
    return null;
  }

  return parseYahooChartQuote(await response.json(), symbol);
}

async function fetchStooqQuote(symbol) {
  const stooqSymbol = toStooqSymbol(symbol);
  const response = await fetch(
    `${stooqQuoteUrl}?s=${encodeURIComponent(
      stooqSymbol,
    )}&f=sd2t2ohlcv&h&e=csv`,
    {
      headers: {
        accept: "text/csv",
        "user-agent": "Mozilla/5.0 Netlify Function",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  return parseStooqCsvQuote(await response.text(), stooqSymbol);
}

function parseFinnhubQuote(payload, fallbackSymbol) {
  const price = finiteNumber(payload?.c);

  if (price === null || price <= 0) {
    return null;
  }

  return {
    currency: "USD",
    exchangeName: "Finnhub",
    price,
    providerSymbol: fallbackSymbol,
    source: "finnhub",
  };
}

function parseYahooChartQuote(payload, fallbackSymbol) {
  const result = payload?.chart?.result?.[0];
  const meta = result?.meta ?? {};
  const price =
    finiteNumber(meta.regularMarketPrice) ??
    finiteNumber(meta.previousClose) ??
    latestFiniteClose(result);

  if (price === null) {
    return null;
  }

  return {
    currency: stringValue(meta.currency),
    exchangeName: stringValue(meta.exchangeName),
    price,
    providerSymbol: stringValue(meta.symbol) ?? fallbackSymbol,
    source: "yahoo",
  };
}

function parseStooqCsvQuote(payload, fallbackSymbol) {
  const rows = payload
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  if (rows.length < 2) {
    return null;
  }

  const headers = splitCsvLine(rows[0]).map((header) => header.toLowerCase());
  const values = splitCsvLine(rows[1]);
  const closeIndex = headers.indexOf("close");
  const symbolIndex = headers.indexOf("symbol");
  const price = closeIndex >= 0 ? finiteNumber(Number(values[closeIndex])) : null;

  if (price === null || price <= 0) {
    return null;
  }

  return {
    currency: fallbackSymbol.endsWith(".th") ? "THB" : "USD",
    exchangeName: "Stooq",
    price,
    providerSymbol:
      symbolIndex >= 0 && values[symbolIndex] ? values[symbolIndex] : fallbackSymbol,
    source: "stooq",
  };
}

function toFinnhubSymbol(symbol) {
  return symbol.trim().toUpperCase().replace("-", ".");
}

function toStooqSymbol(symbol) {
  const normalizedSymbol = symbol.trim().toLowerCase();

  if (normalizedSymbol.endsWith(".bk")) {
    return `${normalizedSymbol.slice(0, -3)}.th`;
  }

  if (normalizedSymbol.endsWith(".th") || normalizedSymbol.endsWith(".us")) {
    return normalizedSymbol;
  }

  return `${normalizedSymbol}.us`;
}

function isUsSymbol(symbol) {
  const normalizedSymbol = symbol.trim().toUpperCase();

  return !normalizedSymbol.endsWith(".BK") && !normalizedSymbol.endsWith(".TH");
}

function splitCsvLine(line) {
  return line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
}

function latestFiniteClose(result) {
  const closes = result?.indicators?.quote?.[0]?.close;

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

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringValue(value) {
  return typeof value === "string" && value ? value : undefined;
}

function jsonResponse(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=30",
      "content-type": "application/json",
    },
    statusCode,
  };
}

exports._test = {
  parseFinnhubQuote,
  parseStooqCsvQuote,
  toFinnhubSymbol,
  toStooqSymbol,
};
