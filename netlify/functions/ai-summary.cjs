const geminiModelsUrl = "https://generativelanguage.googleapis.com/v1beta/models";
const defaultModel = "gemini-3.5-flash";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, {});
  }

  if (event.httpMethod && event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const payload = parseJsonBody(event.body);
  const apiKey = stringValue(payload?.apiKey);

  if (!apiKey) {
    return jsonResponse(400, { error: "Gemini API key is required" });
  }

  const model = normalizeModel(payload?.model);

  try {
    const geminiResponse = await fetch(`${geminiModelsUrl}/${model}:generateContent`, {
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildSummaryPrompt(payload) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 900,
        },
        system_instruction: {
          parts: [{ text: buildInstructions(payload?.language) }],
        },
      }),
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      method: "POST",
    });
    const responsePayload = await geminiResponse.json().catch(() => ({}));

    if (!geminiResponse.ok) {
      return jsonResponse(502, {
        error: geminiErrorMessage(responsePayload) ?? "Gemini request failed",
      });
    }

    const summary = extractOutputText(responsePayload);

    if (!summary) {
      return jsonResponse(502, { error: "Gemini returned an empty summary" });
    }

    return jsonResponse(200, {
      fetchedAt: new Date().toISOString(),
      model,
      provider: "gemini",
      summary,
    });
  } catch {
    return jsonResponse(502, { error: "AI summary service unavailable" });
  }
};

function buildInstructions(language) {
  const outputLanguage = language === "th" ? "Thai" : "English";

  return [
    `You are a neutral institutional market strategist. Respond in ${outputLanguage}.`,
    "Use only the portfolio and market context supplied by the user.",
    "Do not invent live prices, news, analyst ratings, or financial facts.",
    "Frame the answer around the selected timeframe and market region.",
    "Clearly separate market direction, sector impact, large-cap and broad-market stock impact, risks, and what to verify next.",
    "This is research support, not financial advice.",
  ].join(" ");
}

function buildSummaryPrompt(payload) {
  const mode = normalizeSummaryMode(payload?.mode);
  const language = payload?.language === "th" ? "th" : "en";
  const marketRegion = normalizeMarketRegion(payload?.marketRegion);
  const timeframe = normalizeTimeframe(payload?.timeframe);
  const positions = Array.isArray(payload?.positions) ? payload.positions : [];
  const symbol = stringValue(payload?.symbol)?.toUpperCase() ?? "";
  const filteredPositions =
    mode === "stock" && symbol
      ? positions.filter((position) =>
          stringValue(position?.symbol)?.toUpperCase() === symbol,
        )
      : positions;
  const positionLines = filteredPositions
    .slice(0, 24)
    .map(formatPositionLine)
    .filter(Boolean)
    .join("\n");

  return [
    `mode: ${mode}`,
    `language: ${language}`,
    `timeframe: ${timeframe}`,
    `target market region: ${marketRegion}`,
    `market filter: ${stringValue(payload?.marketFilter) ?? "All"}`,
    `base currency: ${stringValue(payload?.baseCurrency) ?? "THB"}`,
    symbol ? `stock symbol: ${symbol}` : "",
    "portfolio positions:",
    positionLines || "No positions supplied.",
    "",
    mode === "stock"
      ? [
          "Write a single-stock research brief for the selected timeframe and region.",
          "Include: current sentiment (+/neutral/-), factors that support the view, factors that weaken the view, sector/macro read-through, and what data to verify next.",
          "Explain how the selected market region could affect this stock and its sector.",
        ].join(" ")
      : [
          "Write a market-impact brief for the selected timeframe and target market region, not a generic portfolio recap.",
          "Include: market regime, key macro/sector drivers, sectors likely to benefit, sectors under pressure, large-cap and broad-market stock impact, portfolio implications, and what data to verify next.",
          "Be direct and practical: explain how the region can affect index leaders, mega-cap stocks, cyclicals, defensives, exporters, banks, energy, technology, and liquidity-sensitive names where relevant.",
        ].join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatPositionLine(position) {
  const symbol = stringValue(position?.symbol);

  if (!symbol) {
    return "";
  }

  return [
    `- ${symbol}`,
    stringValue(position?.name) ? `name=${stringValue(position.name)}` : "",
    stringValue(position?.market) ? `market=${stringValue(position.market)}` : "",
    stringValue(position?.sector) ? `sector=${stringValue(position.sector)}` : "",
    finiteNumber(position?.quantity) !== null ? `qty=${finiteNumber(position.quantity)}` : "",
    finiteNumber(position?.currentPrice) !== null
      ? `current=${finiteNumber(position.currentPrice)}`
      : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function extractOutputText(payload) {
  if (!Array.isArray(payload?.candidates)) {
    return "";
  }

  return payload.candidates
    .flatMap((candidate) =>
      Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [],
    )
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

function normalizeSummaryMode(mode) {
  return mode === "stock" ? "stock" : "market";
}

function normalizeMarketRegion(region) {
  return region === "US" || region === "Asia" ? region : "Thai";
}

function normalizeTimeframe(timeframe) {
  return timeframe === "day" || timeframe === "month" ? timeframe : "week";
}

function normalizeModel(model) {
  const normalized = stringValue(model);

  if (normalized && /^[a-zA-Z0-9._:-]{2,64}$/.test(normalized)) {
    return normalized;
  }

  return defaultModel;
}

function geminiErrorMessage(payload) {
  return stringValue(payload?.error?.message) ?? stringValue(payload?.message);
}

function parseJsonBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body !== "string") {
    return typeof body === "object" ? body : {};
  }

  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function jsonResponse(statusCode, body) {
  return {
    body: statusCode === 204 ? "" : JSON.stringify(body),
    headers: {
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-origin": "*",
      "cache-control": "no-store",
      "content-type": "application/json",
    },
    statusCode,
  };
}

exports._test = {
  buildSummaryPrompt,
  extractOutputText,
  normalizeMarketRegion,
  normalizeModel,
  normalizeSummaryMode,
  normalizeTimeframe,
};
