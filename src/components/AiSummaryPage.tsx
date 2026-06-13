import { useMemo, useState, type ReactNode } from "react";
import type { Currency, MarketFilter, PortfolioPosition } from "../types";
import {
  type AiSummaryMode,
  requestAiSummary,
} from "../lib/aiSummary";
import {
  clearStoredOpenAiApiKey,
  loadStoredOpenAiApiKey,
  saveStoredOpenAiApiKey,
} from "../lib/openAiSettings";

interface AiSummaryPageProps {
  baseCurrency: Currency;
  language: "en" | "th";
  marketFilter: MarketFilter;
  positions: PortfolioPosition[];
}

const defaultModel = "gpt-5.2";

export function AiSummaryPage({
  baseCurrency,
  language,
  marketFilter,
  positions,
}: AiSummaryPageProps) {
  const text = labels[language];
  const [apiKey, setApiKey] = useState(() => loadStoredOpenAiApiKey());
  const [model, setModel] = useState(defaultModel);
  const [stockSymbol, setStockSymbol] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [marketSummary, setMarketSummary] = useState("");
  const [stockSummary, setStockSummary] = useState("");
  const [loadingMode, setLoadingMode] = useState<AiSummaryMode | null>(null);
  const aiPositions = useMemo(
    () =>
      positions.map((position) => ({
        currentPrice: position.currentPrice,
        market: position.market,
        name: position.name,
        quantity: position.quantity,
        sector: position.sector,
        symbol: position.symbol,
      })),
    [positions],
  );
  const hasStoredKey = apiKey.trim().length > 0;

  function handleSaveKey() {
    saveStoredOpenAiApiKey(apiKey);
    setSavedMessage(text.saved);
    setErrorMessage("");
  }

  function handleClearKey() {
    clearStoredOpenAiApiKey();
    setApiKey("");
    setSavedMessage(text.cleared);
    setErrorMessage("");
  }

  async function handleSummarize(mode: AiSummaryMode) {
    setSavedMessage("");
    setErrorMessage("");

    if (mode === "stock" && !stockSymbol.trim()) {
      setErrorMessage(text.symbolRequired);
      return;
    }

    setLoadingMode(mode);

    try {
      const result = await requestAiSummary({
        apiKey,
        baseCurrency,
        language,
        marketFilter,
        mode,
        model,
        positions: aiPositions,
        symbol: mode === "stock" ? stockSymbol : undefined,
      });

      if (mode === "stock") {
        setStockSummary(result.summary);
      } else {
        setMarketSummary(result.summary);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : text.requestFailed);
    } finally {
      setLoadingMode(null);
    }
  }

  return (
    <div className="ai-summary-page">
      <section className="ai-summary-hero" aria-labelledby="ai-summary-title">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="ai-summary-title">{text.title}</h2>
          <p>{text.subtitle}</p>
          <div className="ai-summary-meta">
            <span>{text.positions}: {positions.length}</span>
            <span>{text.market}: {marketFilter}</span>
            <span>{text.currency}: {baseCurrency}</span>
          </div>
        </div>

        <section className="ai-key-panel" aria-label={text.keyPanel}>
          <label>
            <span>{text.apiKey}</span>
            <input
              aria-label={text.apiKey}
              autoComplete="off"
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="sk-..."
              type="password"
              value={apiKey}
            />
          </label>
          <label>
            <span>{text.model}</span>
            <input
              aria-label={text.model}
              onChange={(event) => setModel(event.target.value)}
              placeholder={defaultModel}
              value={model}
            />
          </label>
          <div className="ai-key-actions">
            <button className="secondary-button" onClick={handleSaveKey} type="button">
              {text.saveKey}
            </button>
            <button className="secondary-button" onClick={handleClearKey} type="button">
              {text.clearKey}
            </button>
          </div>
          <small>{hasStoredKey ? text.keyReady : text.keyHint}</small>
        </section>
      </section>

      {(savedMessage || errorMessage) && (
        <div className={`ai-summary-status ${errorMessage ? "ai-summary-status--error" : ""}`}>
          {errorMessage || savedMessage}
        </div>
      )}

      <section className="ai-summary-grid">
        <SummaryWorkbench
          buttonLabel={text.marketButton}
          disabled={loadingMode !== null}
          isLoading={loadingMode === "market"}
          result={marketSummary}
          title={text.marketTitle}
          onRun={() => void handleSummarize("market")}
        >
          <p>{text.marketPrompt}</p>
        </SummaryWorkbench>

        <SummaryWorkbench
          buttonLabel={text.stockButton}
          disabled={loadingMode !== null}
          isLoading={loadingMode === "stock"}
          result={stockSummary}
          title={text.stockTitle}
          onRun={() => void handleSummarize("stock")}
        >
          <label className="ai-stock-field">
            <span>{text.stockSymbol}</span>
            <input
              aria-label={text.stockSymbol}
              onChange={(event) => setStockSymbol(event.target.value.toUpperCase())}
              placeholder="AAPL, PTT"
              value={stockSymbol}
            />
          </label>
        </SummaryWorkbench>
      </section>
    </div>
  );
}

function SummaryWorkbench({
  buttonLabel,
  children,
  disabled,
  isLoading,
  onRun,
  result,
  title,
}: {
  buttonLabel: string;
  children: ReactNode;
  disabled: boolean;
  isLoading: boolean;
  onRun: () => void;
  result: string;
  title: string;
}) {
  return (
    <article className="panel ai-summary-card">
      <div className="section-heading section-heading--with-action">
        <div>
          <p className="eyebrow">ChatGPT</p>
          <h2>{title}</h2>
        </div>
        <button
          className="primary-button"
          disabled={disabled}
          onClick={onRun}
          type="button"
        >
          {isLoading ? "Thinking..." : buttonLabel}
        </button>
      </div>
      <div className="ai-summary-card__controls">{children}</div>
      <div className="ai-summary-result" aria-live="polite">
        {result ? <p>{result}</p> : <span>Waiting for summary</span>}
      </div>
    </article>
  );
}

const labels = {
  en: {
    apiKey: "OpenAI API key",
    clearKey: "Clear key",
    cleared: "API key cleared from this browser.",
    currency: "Currency",
    eyebrow: "AI Research",
    keyHint: "Stored only in this browser. For production, prefer server-side secrets.",
    keyPanel: "OpenAI settings",
    keyReady: "Key is ready for this browser.",
    market: "Market",
    marketButton: "Summarize market",
    marketPrompt: "Summarizes portfolio exposure, market tone, sector drivers, and risks.",
    marketTitle: "Market desk brief",
    model: "Model",
    positions: "Positions",
    requestFailed: "AI summary is unavailable right now.",
    saveKey: "Save key",
    saved: "API key saved in this browser.",
    stockButton: "Summarize stock",
    stockSymbol: "Stock symbol",
    stockTitle: "Single-stock read",
    subtitle:
      "Use your OpenAI key to generate a clean market brief and stock-level research notes from your portfolio context.",
    symbolRequired: "Please enter a stock symbol first.",
    title: "ChatGPT Market Summary",
  },
  th: {
    apiKey: "OpenAI API key",
    clearKey: "ล้าง key",
    cleared: "ล้าง API key ออกจากเบราว์เซอร์นี้แล้ว",
    currency: "ค่าเงิน",
    eyebrow: "AI Research",
    keyHint: "เก็บเฉพาะในเบราว์เซอร์นี้ งานจริงควรใช้ server-side secret",
    keyPanel: "ตั้งค่า OpenAI",
    keyReady: "พร้อมใช้งานบนเบราว์เซอร์นี้",
    market: "ตลาด",
    marketButton: "สรุปตลาด",
    marketPrompt: "สรุปภาพพอร์ต โทนตลาด กลุ่มเด่น และความเสี่ยงจากข้อมูลที่มี",
    marketTitle: "สรุปภาพตลาด",
    model: "โมเดล",
    positions: "จำนวนหุ้น",
    requestFailed: "ตอนนี้ยังเรียก AI summary ไม่ได้",
    saveKey: "บันทึก key",
    saved: "บันทึก API key ในเบราว์เซอร์นี้แล้ว",
    stockButton: "สรุปหุ้นรายตัว",
    stockSymbol: "ชื่อหุ้น",
    stockTitle: "วิเคราะห์หุ้นรายตัว",
    subtitle:
      "ใช้ OpenAI key ของคุณเพื่อให้ ChatGPT สรุปภาพตลาดและหุ้นรายตัวจากบริบทพอร์ต",
    symbolRequired: "กรอกชื่อหุ้นก่อน",
    title: "สรุปตลาดด้วย ChatGPT",
  },
};
