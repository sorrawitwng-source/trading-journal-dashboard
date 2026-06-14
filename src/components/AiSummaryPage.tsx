import { useMemo, useState, type ReactNode } from "react";
import type { Currency, MarketFilter, PortfolioPosition } from "../types";
import {
  type AiMarketRegion,
  type AiSummaryMode,
  type AiSummaryTimeframe,
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
  const [timeframe, setTimeframe] = useState<AiSummaryTimeframe>("week");
  const [marketRegion, setMarketRegion] = useState<AiMarketRegion>(() =>
    defaultMarketRegion(marketFilter),
  );
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
  const timeframeOptions = getTimeframeOptions(text);
  const marketOptions = getMarketRegionOptions(text);

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
        marketRegion,
        mode,
        model,
        positions: aiPositions,
        symbol: mode === "stock" ? stockSymbol : undefined,
        timeframe,
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
        <div className="ai-summary-hero__copy">
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="ai-summary-title">{text.title}</h2>
          <p>{text.subtitle}</p>
          <div className="ai-summary-meta">
            <span>{text.positions}: {positions.length}</span>
            <span>{text.focus}: {text.marketRegionNames[marketRegion]}</span>
            <span>{text.timeframe}: {text.timeframeNames[timeframe]}</span>
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
          loadingLabel={text.thinking}
          placeholder={text.waiting}
          result={marketSummary}
          title={text.marketTitle}
          onRun={() => void handleSummarize("market")}
        >
          <AnalysisSetup
            marketOptions={marketOptions}
            marketRegion={marketRegion}
            onMarketRegionChange={setMarketRegion}
            onTimeframeChange={setTimeframe}
            text={text}
            timeframe={timeframe}
            timeframeOptions={timeframeOptions}
          />
          <div className="ai-summary-checklist">
            <b>{text.outputShape}</b>
            {text.marketBriefPoints.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>
        </SummaryWorkbench>

        <SummaryWorkbench
          buttonLabel={text.stockButton}
          disabled={loadingMode !== null}
          isLoading={loadingMode === "stock"}
          loadingLabel={text.thinking}
          placeholder={text.waiting}
          result={stockSummary}
          title={text.stockTitle}
          onRun={() => void handleSummarize("stock")}
        >
          <label className="ai-stock-field">
            <span>{text.stockSymbol}</span>
            <input
              aria-label={text.stockSymbol}
              onChange={(event) => setStockSymbol(event.target.value.toUpperCase())}
              placeholder="AAPL, PTT, KBANK"
              value={stockSymbol}
            />
          </label>
          <div className="ai-summary-checklist ai-summary-checklist--compact">
            {text.stockBriefPoints.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>
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
  loadingLabel,
  onRun,
  placeholder,
  result,
  title,
}: {
  buttonLabel: string;
  children: ReactNode;
  disabled: boolean;
  isLoading: boolean;
  loadingLabel: string;
  onRun: () => void;
  placeholder: string;
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
          {isLoading ? loadingLabel : buttonLabel}
        </button>
      </div>
      <div className="ai-summary-card__controls">{children}</div>
      <div className="ai-summary-result" aria-live="polite">
        {result ? <p>{result}</p> : <span>{placeholder}</span>}
      </div>
    </article>
  );
}

function AnalysisSetup({
  marketOptions,
  marketRegion,
  onMarketRegionChange,
  onTimeframeChange,
  text,
  timeframe,
  timeframeOptions,
}: {
  marketOptions: Array<{ description: string; label: string; value: AiMarketRegion }>;
  marketRegion: AiMarketRegion;
  onMarketRegionChange: (value: AiMarketRegion) => void;
  onTimeframeChange: (value: AiSummaryTimeframe) => void;
  text: UiLabels;
  timeframe: AiSummaryTimeframe;
  timeframeOptions: Array<{ description: string; label: string; value: AiSummaryTimeframe }>;
}) {
  return (
    <div className="ai-summary-setup" aria-label={text.controlsPanel}>
      <OptionGroup
        label={text.timeframe}
        options={timeframeOptions}
        value={timeframe}
        onChange={onTimeframeChange}
      />
      <OptionGroup
        label={text.focus}
        options={marketOptions}
        value={marketRegion}
        onChange={onMarketRegionChange}
      />
      <div className="ai-impact-map">
        <span>{text.outputShape}</span>
        <strong>{text.marketRegionNames[marketRegion]} / {text.timeframeNames[timeframe]}</strong>
        <p>{text.impactMapCopy}</p>
      </div>
    </div>
  );
}

function OptionGroup<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<{ description: string; label: string; value: TValue }>;
  value: TValue;
}) {
  return (
    <fieldset className="ai-option-group">
      <legend>{label}</legend>
      <div className="ai-option-group__buttons">
        {options.map((option) => (
          <button
            aria-label={option.label}
            aria-pressed={option.value === value}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function defaultMarketRegion(marketFilter: MarketFilter): AiMarketRegion {
  return marketFilter === "US" ? "US" : "Thai";
}

function getTimeframeOptions(text: UiLabels) {
  return [
    {
      description: text.dayHint,
      label: text.timeframeNames.day,
      value: "day" as const,
    },
    {
      description: text.weekHint,
      label: text.timeframeNames.week,
      value: "week" as const,
    },
    {
      description: text.monthHint,
      label: text.timeframeNames.month,
      value: "month" as const,
    },
  ];
}

function getMarketRegionOptions(text: UiLabels) {
  return [
    {
      description: text.thaiHint,
      label: text.marketRegionNames.Thai,
      value: "Thai" as const,
    },
    {
      description: text.usHint,
      label: text.marketRegionNames.US,
      value: "US" as const,
    },
    {
      description: text.asiaHint,
      label: text.marketRegionNames.Asia,
      value: "Asia" as const,
    },
  ];
}

const labels = {
  en: {
    apiKey: "OpenAI API key",
    asiaHint: "Asia flows, China/Japan/Korea, regional risk-on/off",
    clearKey: "Clear key",
    cleared: "API key cleared from this browser.",
    controlsPanel: "AI market controls",
    currency: "Currency",
    dayHint: "Intraday tone and immediate catalysts",
    eyebrow: "AI Market Desk",
    focus: "Market",
    impactMapCopy:
      "The answer will focus on market direction, sector rotation, broad index leaders, and what could pressure the next move.",
    keyHint: "Stored only in this browser. For production, prefer server-side secrets.",
    keyPanel: "OpenAI settings",
    keyReady: "Key is ready for this browser.",
    marketBriefPoints: [
      "Market regime",
      "Sector winners and losers",
      "Large-cap and index impact",
      "Portfolio risk check",
      "What to verify next",
    ],
    marketButton: "Analyze market",
    marketRegionNames: {
      Asia: "Asia",
      Thai: "Thai",
      US: "US",
    },
    marketTitle: "Market impact brief",
    model: "Model",
    monthHint: "Positioning, macro trend, and monthly regime",
    outputShape: "Output focus",
    positions: "Positions",
    requestFailed: "AI market analysis is unavailable right now.",
    saveKey: "Save key",
    saved: "API key saved in this browser.",
    stockBriefPoints: [
      "Sentiment now",
      "Positive and negative factors",
      "Market read-through",
      "Follow-up research checklist",
    ],
    stockButton: "Analyze stock",
    stockSymbol: "Stock symbol",
    stockTitle: "Single-stock impact",
    subtitle:
      "Choose timeframe and market region, then let ChatGPT explain how the market could affect sectors, index leaders, and your portfolio.",
    symbolRequired: "Please enter a stock symbol first.",
    thaiHint: "SET, Thai economy, banks, energy, tourism, domestic demand",
    thinking: "Analyzing...",
    timeframe: "Timeframe",
    timeframeNames: {
      day: "Day",
      month: "Month",
      week: "Week",
    },
    title: "AI Market Impact",
    usHint: "S&P 500, Nasdaq, Fed, mega-cap tech, US liquidity",
    waiting: "Choose the setup and run the analysis.",
    weekHint: "Weekly sector rotation and headline pressure",
  },
  th: {
    apiKey: "OpenAI API key",
    asiaHint: "ฟันด์โฟลว์เอเชีย จีน ญี่ปุ่น เกาหลี และภาวะ risk-on/risk-off",
    clearKey: "ล้าง key",
    cleared: "ล้าง API key ออกจากเบราว์เซอร์นี้แล้ว",
    controlsPanel: "ตัวควบคุม AI วิเคราะห์ตลาด",
    currency: "ค่าเงิน",
    dayHint: "โทนรายวันและปัจจัยเร่งระยะสั้น",
    eyebrow: "AI Market Desk",
    focus: "ตลาด",
    impactMapCopy:
      "คำตอบจะเน้นทิศทางตลาด sector rotation หุ้นใหญ่ที่ขับเคลื่อนดัชนี และแรงกดดันที่ควรระวัง",
    keyHint: "บันทึกเฉพาะในเบราว์เซอร์นี้ ถ้าใช้จริงแบบ public ควรใช้ server-side secret",
    keyPanel: "ตั้งค่า OpenAI",
    keyReady: "มี key พร้อมใช้งานในเบราว์เซอร์นี้",
    marketBriefPoints: [
      "ภาวะตลาดตอนนี้",
      "กลุ่มที่ได้ประโยชน์และเสียประโยชน์",
      "ผลต่อหุ้นใหญ่และดัชนี",
      "ความเสี่ยงของพอร์ต",
      "ข้อมูลที่ควรเช็คต่อ",
    ],
    marketButton: "วิเคราะห์ตลาด",
    marketRegionNames: {
      Asia: "เอเชีย",
      Thai: "ไทย",
      US: "เมกา",
    },
    marketTitle: "สรุปผลกระทบตลาด",
    model: "โมเดล",
    monthHint: "ภาพรายเดือน แนวโน้ม macro และ positioning",
    outputShape: "โฟกัสคำตอบ",
    positions: "จำนวนหุ้น",
    requestFailed: "ตอนนี้ยังเรียก AI วิเคราะห์ตลาดไม่ได้",
    saveKey: "บันทึก key",
    saved: "บันทึก API key ในเบราว์เซอร์นี้แล้ว",
    stockBriefPoints: [
      "sentiment ตอนนี้",
      "ปัจจัยบวกและปัจจัยลบ",
      "ผลกระทบจากตลาดที่เลือก",
      "เช็กลิสต์สำหรับ research ต่อ",
    ],
    stockButton: "วิเคราะห์หุ้น",
    stockSymbol: "ชื่อหุ้น",
    stockTitle: "วิเคราะห์หุ้นรายตัว",
    subtitle:
      "เลือกกรอบเวลาและตลาด แล้วให้ ChatGPT วิเคราะห์ว่าภาพตลาดส่งผลต่อ sector หุ้นใหญ่ ดัชนี และพอร์ตของคุณอย่างไร",
    symbolRequired: "กรุณาใส่ชื่อหุ้นก่อน",
    thaiHint: "SET เศรษฐกิจไทย ธนาคาร พลังงาน ท่องเที่ยว และกำลังซื้อในประเทศ",
    thinking: "กำลังวิเคราะห์...",
    timeframe: "กรอบเวลา",
    timeframeNames: {
      day: "วัน",
      month: "เดือน",
      week: "สัปดาห์",
    },
    title: "AI วิเคราะห์ผลกระทบตลาด",
    usHint: "S&P 500, Nasdaq, Fed, mega-cap tech และสภาพคล่องสหรัฐฯ",
    waiting: "เลือกเงื่อนไขแล้วกดวิเคราะห์",
    weekHint: "ภาพรายสัปดาห์ sector rotation และแรงกดดันจากข่าว",
  },
} as const;

type UiLabels = (typeof labels)[keyof typeof labels];
