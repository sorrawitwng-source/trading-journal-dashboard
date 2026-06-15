import { useState } from "react";
import type { Currency, MarketFilter, PortfolioPosition } from "../types";
import {
  type AiMarketRegion,
  type AiSummaryTimeframe,
  requestAiSummary,
} from "../lib/aiSummary";
import {
  clearStoredGeminiApiKey,
  loadStoredGeminiApiKey,
  saveStoredGeminiApiKey,
} from "../lib/geminiSettings";

interface AiSummaryPageProps {
  baseCurrency: Currency;
  language: "en" | "th";
  marketFilter: MarketFilter;
  positions: PortfolioPosition[];
}

const modelPresets = [
  {
    description: {
      en: "Gemini 3.5 Flash, best quality",
      th: "Gemini 3.5 Flash คุณภาพดีที่สุด",
    },
    label: {
      en: "Best",
      th: "ดีที่สุด",
    },
    value: "gemini-3.5-flash",
  },
  {
    description: {
      en: "Gemini 2.5 Flash, balanced",
      th: "Gemini 2.5 Flash สมดุล",
    },
    label: {
      en: "Balanced",
      th: "สมดุล",
    },
    value: "gemini-2.5-flash",
  },
  {
    description: {
      en: "Gemini 2.5 Flash-Lite, faster",
      th: "Gemini 2.5 Flash-Lite เร็วกว่า",
    },
    label: {
      en: "Fast",
      th: "เร็ว",
    },
    value: "gemini-2.5-flash-lite",
  },
] as const;

type AiModelPreset = (typeof modelPresets)[number]["value"];

const defaultModel: AiModelPreset = "gemini-3.5-flash";
const weeklyTimeframe: AiSummaryTimeframe = "week";

export function AiSummaryPage({
  baseCurrency,
  language,
  marketFilter,
}: AiSummaryPageProps) {
  const text = labels[language];
  const [apiKey, setApiKey] = useState(() => loadStoredGeminiApiKey());
  const [model, setModel] = useState<AiModelPreset>(defaultModel);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [marketSummary, setMarketSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const marketRegion = defaultMarketRegion(marketFilter);
  const hasStoredKey = apiKey.trim().length > 0;
  const modelOptions = getModelOptions(language);

  function handleSaveKey() {
    saveStoredGeminiApiKey(apiKey);
    setSavedMessage(text.saved);
    setErrorMessage("");
  }

  function handleClearKey() {
    clearStoredGeminiApiKey();
    setApiKey("");
    setSavedMessage(text.cleared);
    setErrorMessage("");
  }

  async function handleSummarize() {
    setSavedMessage("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await requestAiSummary({
        apiKey,
        baseCurrency,
        language,
        marketFilter,
        marketRegion,
        mode: "market",
        model,
        positions: [],
        timeframe: weeklyTimeframe,
      });

      setMarketSummary(result.summary);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : text.requestFailed);
    } finally {
      setIsLoading(false);
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
            <span>{text.universe}</span>
            <span>{text.weeklyOnly}</span>
            <span>{text.focus}: {text.marketRegionNames[marketRegion]}</span>
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
              placeholder="AIza..."
              type="password"
              value={apiKey}
            />
          </label>
          <OptionGroup
            label={text.model}
            options={modelOptions}
            value={model}
            onChange={setModel}
          />
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

      <section className="ai-summary-grid ai-summary-grid--single">
        <article className="panel ai-summary-card ai-summary-card--weekly">
          <div className="section-heading section-heading--with-action">
            <div>
              <p className="eyebrow">Gemini</p>
              <h2>{text.marketTitle}</h2>
            </div>
            <button
              className="primary-button"
              disabled={isLoading}
              onClick={() => void handleSummarize()}
              type="button"
            >
              {isLoading ? text.thinking : text.marketButton}
            </button>
          </div>

          <div className="ai-weekly-summary-note">
            <span>{text.weeklyScope}</span>
            <strong>{text.marketRegionNames[marketRegion]} / {text.timeframeNames.week}</strong>
            <p>{text.weeklyScopeCopy}</p>
          </div>

          <div className="ai-summary-result" aria-live="polite">
            <AiSummaryResult result={marketSummary} placeholder={text.waiting} />
          </div>
        </article>
      </section>
    </div>
  );
}

function AiSummaryResult({
  placeholder,
  result,
}: {
  placeholder: string;
  result: string;
}) {
  if (!result) {
    return <span className="ai-summary-placeholder">{placeholder}</span>;
  }

  const sections = parseSummarySections(result);

  return (
    <div className="ai-summary-output">
      {sections.map((section, sectionIndex) => (
        <section className="ai-summary-section" key={`${section.title}-${sectionIndex}`}>
          <h3>{section.title}</h3>
          {section.points.length > 0 && (
            <div className="ai-summary-prose">
              {section.points.map((point, pointIndex) => (
                <p key={`${point}-${pointIndex}`}>{point}</p>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

interface SummarySection {
  points: string[];
  title: string;
}

function parseSummarySections(summary: string): SummarySection[] {
  const fallbackTitle = /[\u0e00-\u0e7f]/.test(summary) ? "สรุป" : "Summary";
  const sections: SummarySection[] = [];
  let currentSection: SummarySection | null = null;

  for (const rawLine of summary.split(/\r?\n/)) {
    const trimmedLine = rawLine.trim();
    const cleanedLine = cleanSummaryLine(trimmedLine);

    if (!cleanedLine) {
      continue;
    }

    const markdownHeading = /^#{1,6}\s+/.test(trimmedLine);
    const labelledLine = cleanedLine.match(/^([^:：]{2,48})[:：]\s+(.+)$/);

    if (markdownHeading) {
      currentSection = { points: [], title: cleanedLine };
      sections.push(currentSection);
      continue;
    }

    if (labelledLine && isSummaryLabel(labelledLine[1])) {
      currentSection = {
        points: [labelledLine[2].trim()],
        title: labelledLine[1].trim(),
      };
      sections.push(currentSection);
      continue;
    }

    if (isStandaloneSummaryHeading(cleanedLine)) {
      currentSection = { points: [], title: cleanedLine };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      currentSection = { points: [], title: fallbackTitle };
      sections.push(currentSection);
    }

    currentSection.points.push(cleanedLine);
  }

  return sections.length > 0 ? sections : [{ points: [summary.trim()], title: fallbackTitle }];
}

function cleanSummaryLine(line: string) {
  const cleaned = line
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*+/g, "")
    .replace(/\)\s*:/g, ":")
    .replace(/\s+/g, " ")
    .trim();

  return /^[#*_–—-]+$/.test(cleaned) ? "" : cleaned;
}

function isSummaryLabel(label: string) {
  return /^(summary|market|regime|direction|sector|watchlist|risk|verify|check|sentiment|impact|สรุป|ภาพรวมตลาด|ตลาด|ทิศทาง|กลุ่ม|ความเสี่ยง|สิ่งที่ต้องติดตาม)/i.test(
    label.trim(),
  );
}

function isStandaloneSummaryHeading(line: string) {
  return (
    line.length <= 72 &&
    !/[.!?]$/.test(line) &&
    /^(summary|market|sector|watchlist|risk|verify|สรุป|ภาพรวมตลาด|ตลาด|กลุ่ม|ความเสี่ยง|สิ่งที่ต้องติดตาม)/i.test(
      line,
    )
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
  if (marketFilter === "US") {
    return "US";
  }

  if (marketFilter === "Thai") {
    return "Thai";
  }

  return "Asia";
}

function getModelOptions(language: "en" | "th") {
  return modelPresets.map((preset) => ({
    description: preset.description[language],
    label: preset.label[language],
    value: preset.value,
  }));
}

const labels = {
  en: {
    apiKey: "Gemini API key",
    clearKey: "Clear key",
    cleared: "API key cleared from this browser.",
    currency: "Currency",
    eyebrow: "AI Market Desk",
    focus: "Market",
    keyHint: "Stored only in this browser. For production, prefer server-side secrets.",
    keyPanel: "Gemini settings",
    keyReady: "Key is ready for this browser.",
    marketButton: "Summarize week",
    marketRegionNames: {
      Asia: "All markets",
      Thai: "Thai",
      US: "US",
    },
    marketTitle: "Weekly market picture",
    model: "Model",
    requestFailed: "AI weekly market summary is unavailable right now.",
    saveKey: "Save key",
    saved: "API key saved in this browser.",
    subtitle:
      "One click turns the current market tape into a weekly overview of sentiment, sector rotation, catalysts, risks, and what to watch next.",
    thinking: "Summarizing...",
    timeframeNames: {
      day: "Day",
      month: "Month",
      week: "Week",
    },
    title: "AI Weekly Market Summary",
    universe: "Coverage: all listed stocks",
    waiting: "Click Summarize week to generate the weekly market picture.",
    weeklyOnly: "Timeframe: weekly",
    weeklyScope: "Weekly market summary",
    weeklyScopeCopy:
      "No setup needed. Gemini will summarize the broad market, strongest sectors, weak spots, major drivers, and next-week watch points.",
  },
  th: {
    apiKey: "Gemini API key",
    clearKey: "ลบ key",
    cleared: "ลบ API key ออกจากเบราว์เซอร์นี้แล้ว",
    currency: "ค่าเงิน",
    eyebrow: "AI Market Desk",
    focus: "ตลาด",
    keyHint: "บันทึกไว้เฉพาะในเบราว์เซอร์นี้ หากใช้จริงบน production ควรเก็บ key ฝั่ง server",
    keyPanel: "ตั้งค่า Gemini",
    keyReady: "พร้อมใช้ key ในเบราว์เซอร์นี้",
    marketButton: "สรุปสัปดาห์นี้",
    marketRegionNames: {
      Asia: "ทุกตลาด",
      Thai: "ไทย",
      US: "สหรัฐฯ",
    },
    marketTitle: "ภาพรวมตลาดรายสัปดาห์",
    model: "โมเดล",
    requestFailed: "ตอนนี้ AI สรุปภาพตลาดรายสัปดาห์ยังใช้งานไม่ได้",
    saveKey: "บันทึก key",
    saved: "บันทึก API key ในเบราว์เซอร์นี้แล้ว",
    subtitle:
      "กดครั้งเดียวเพื่อให้ Gemini สรุปภาพตลาดรอบสัปดาห์ ทั้ง sentiment, sector rotation, ปัจจัยหนุน, ความเสี่ยง และสิ่งที่ต้องติดตามต่อ",
    thinking: "กำลังสรุป...",
    timeframeNames: {
      day: "วัน",
      month: "เดือน",
      week: "สัปดาห์",
    },
    title: "AI สรุปภาพตลาดรายสัปดาห์",
    universe: "ครอบคลุม: หุ้นทั้งตลาด",
    waiting: "กดสรุปสัปดาห์นี้เพื่อสร้างภาพรวมตลาดรายสัปดาห์",
    weeklyOnly: "กรอบเวลา: รายสัปดาห์",
    weeklyScope: "สรุปภาพตลาดประจำสัปดาห์",
    weeklyScopeCopy:
      "ไม่ต้องตั้งค่าเพิ่ม Gemini จะสรุปภาพตลาดรวม กลุ่มที่เด่น กลุ่มที่อ่อน ปัจจัยหลัก และจุดที่ควรติดตามในสัปดาห์ถัดไป",
  },
} as const;
