const yahooChartBaseUrl = "https://query1.finance.yahoo.com/v8/finance/chart";

exports.handler = async (event) => {
  const symbol = event.queryStringParameters?.symbol;

  if (!symbol || typeof symbol !== "string") {
    return jsonResponse(400, { error: "Missing symbol" });
  }

  const safeSymbol = symbol.trim().toUpperCase();

  if (!/^[A-Z0-9.\-=^]+$/.test(safeSymbol)) {
    return jsonResponse(400, { error: "Invalid symbol" });
  }

  try {
    const yahooUrl = `${yahooChartBaseUrl}/${encodeURIComponent(
      safeSymbol,
    )}?range=1d&interval=1m`;
    const response = await fetch(yahooUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 Netlify Function",
      },
    });

    if (!response.ok) {
      return jsonResponse(response.status, { error: "Quote provider failed" });
    }

    const payload = await response.json();
    const quote = parseYahooChartQuote(payload, safeSymbol);

    if (!quote) {
      return jsonResponse(404, { error: "Quote unavailable" });
    }

    return jsonResponse(200, quote);
  } catch {
    return jsonResponse(502, { error: "Quote request failed" });
  }
};

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
  };
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
