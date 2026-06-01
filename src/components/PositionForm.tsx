import { Plus } from "lucide-react";
import type { FormEvent } from "react";

interface PositionFormProps {
  buyDate: string;
  buyPrice: string;
  errors: {
    buyDate?: string;
    symbol?: string;
    buyPrice?: string;
    quantity?: string;
    stopLoss?: string;
    targetPrice?: string;
  };
  emotion: string;
  language: "en" | "th";
  onBuyDateChange: (buyDate: string) => void;
  onBuyPriceChange: (buyPrice: string) => void;
  onEmotionChange: (emotion: string) => void;
  onQuantityChange: (quantity: string) => void;
  onStopLossChange: (stopLoss: string) => void;
  onStrategyTagChange: (strategyTag: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSymbolChange: (symbol: string) => void;
  onTargetPriceChange: (targetPrice: string) => void;
  onTradeNoteChange: (tradeNote: string) => void;
  onTradeReasonChange: (tradeReason: string) => void;
  quantity: string;
  stopLoss: string;
  strategyTag: string;
  symbol: string;
  targetPrice: string;
  tradeNote: string;
  tradeReason: string;
}

export function PositionForm({
  buyDate,
  buyPrice,
  emotion,
  errors,
  language,
  onBuyDateChange,
  onBuyPriceChange,
  onEmotionChange,
  onQuantityChange,
  onStopLossChange,
  onStrategyTagChange,
  onSubmit,
  onSymbolChange,
  onTargetPriceChange,
  onTradeNoteChange,
  onTradeReasonChange,
  quantity,
  stopLoss,
  strategyTag,
  symbol,
  targetPrice,
  tradeNote,
  tradeReason,
}: PositionFormProps) {
  const text = labels[language];
  const journalText = journalLabels[language];

  return (
    <section className="panel position-form-panel" aria-labelledby="position-form-title">
      <div className="section-heading">
        <p className="eyebrow">{text.eyebrow}</p>
        <h2 id="position-form-title">{text.title}</h2>
      </div>

      <form className="position-form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>{text.symbol}</span>
          <input
            aria-describedby={errors.symbol ? "symbol-error" : undefined}
            aria-invalid={errors.symbol ? "true" : "false"}
            autoComplete="off"
            onChange={(event) => onSymbolChange(event.target.value)}
            placeholder="AAPL"
            type="text"
            value={symbol}
          />
          {errors.symbol ? (
            <span className="field-error" id="symbol-error">
              {errors.symbol}
            </span>
          ) : null}
        </label>

        <label className="field">
          <span>{text.buyDate}</span>
          <input
            aria-describedby={errors.buyDate ? "buy-date-error" : undefined}
            aria-invalid={errors.buyDate ? "true" : "false"}
            inputMode="numeric"
            onChange={(event) => onBuyDateChange(event.target.value)}
            placeholder="31/05/2026"
            type="text"
            value={buyDate}
          />
          <small className="field-help">{text.monthHint}</small>
          {errors.buyDate ? (
            <span className="field-error" id="buy-date-error">
              {errors.buyDate}
            </span>
          ) : null}
        </label>

        <label className="field">
          <span>{text.buyPrice}</span>
          <input
            aria-describedby={errors.buyPrice ? "buy-price-error" : undefined}
            aria-invalid={errors.buyPrice ? "true" : "false"}
            inputMode="decimal"
            onChange={(event) => onBuyPriceChange(event.target.value)}
            placeholder="189.72"
            type="text"
            value={buyPrice}
          />
          <small className="field-help">{text.priceHint}</small>
          {errors.buyPrice ? (
            <span className="field-error" id="buy-price-error">
              {errors.buyPrice}
            </span>
          ) : null}
        </label>

        <label className="field">
          <span>{text.quantity}</span>
          <input
            aria-describedby={errors.quantity ? "quantity-error" : undefined}
            aria-invalid={errors.quantity ? "true" : "false"}
            inputMode="decimal"
            onChange={(event) => onQuantityChange(event.target.value)}
            placeholder="0"
            type="text"
            value={quantity}
          />
          {errors.quantity ? (
            <span className="field-error" id="quantity-error">
              {errors.quantity}
            </span>
          ) : null}
        </label>

        <div className="journal-fieldset">
          <div>
            <p className="eyebrow">{journalText.planEyebrow}</p>
            <strong>{journalText.planTitle}</strong>
          </div>
          <div className="field-grid field-grid--two">
            <label className="field">
              <span>{journalText.stopLoss}</span>
              <input
                aria-describedby={errors.stopLoss ? "stop-loss-error" : undefined}
                aria-invalid={errors.stopLoss ? "true" : "false"}
                inputMode="decimal"
                onChange={(event) => onStopLossChange(event.target.value)}
                placeholder="140"
                type="text"
                value={stopLoss}
              />
              {errors.stopLoss ? (
                <span className="field-error" id="stop-loss-error">
                  {errors.stopLoss}
                </span>
              ) : null}
            </label>

            <label className="field">
              <span>{journalText.targetPrice}</span>
              <input
                aria-describedby={errors.targetPrice ? "target-price-error" : undefined}
                aria-invalid={errors.targetPrice ? "true" : "false"}
                inputMode="decimal"
                onChange={(event) => onTargetPriceChange(event.target.value)}
                placeholder="220"
                type="text"
                value={targetPrice}
              />
              {errors.targetPrice ? (
                <span className="field-error" id="target-price-error">
                  {errors.targetPrice}
                </span>
              ) : null}
            </label>
          </div>

          <label className="field">
            <span>{journalText.strategyTag}</span>
            <input
              onChange={(event) => onStrategyTagChange(event.target.value)}
              placeholder="Breakout, Dividend, Swing"
              type="text"
              value={strategyTag}
            />
          </label>

          <label className="field">
            <span>{journalText.tradeReason}</span>
            <textarea
              onChange={(event) => onTradeReasonChange(event.target.value)}
              placeholder={journalText.tradeReasonPlaceholder}
              rows={3}
              value={tradeReason}
            />
          </label>

          <div className="field-grid field-grid--two">
            <label className="field">
              <span>{journalText.emotion}</span>
              <input
                onChange={(event) => onEmotionChange(event.target.value)}
                placeholder="Calm, FOMO, Patient"
                type="text"
                value={emotion}
              />
            </label>

            <label className="field">
              <span>{journalText.tradeNote}</span>
              <input
                onChange={(event) => onTradeNoteChange(event.target.value)}
                placeholder={journalText.tradeNotePlaceholder}
                type="text"
                value={tradeNote}
              />
            </label>
          </div>
        </div>

        <button className="primary-button" type="submit">
          <Plus aria-hidden="true" size={18} />
          {text.add}
        </button>
      </form>
    </section>
  );
}

const labels = {
  en: {
    add: "Add",
    buyDate: "Buy date",
    buyPrice: "Buy price",
    eyebrow: "Journal Entry",
    quantity: "Quantity",
    priceHint: "Thai stocks use THB. US stocks use USD.",
    monthHint: "This date is used for monthly journal grouping.",
    symbol: "Symbol",
    title: "Add position",
  },
  th: {
    add: "เพิ่ม",
    buyDate: "วันที่ซื้อ",
    buyPrice: "ราคาซื้อ",
    eyebrow: "บันทึกการเทรด",
    quantity: "จำนวนหุ้น",
    priceHint: "หุ้นไทยใช้เงินบาท หุ้น US ใช้ดอลลาร์",
    monthHint: "ระบบจะใช้วันที่นี้จัดกลุ่มรายเดือน",
    symbol: "ชื่อหุ้น",
    title: "เพิ่มรายการหุ้น",
  },
};

const journalLabels = {
  en: {
    emotion: "Emotion",
    planEyebrow: "Trade plan",
    planTitle: "Risk / reward and journal notes",
    stopLoss: "Stop loss",
    strategyTag: "Strategy tag",
    targetPrice: "Target price",
    tradeNote: "Note",
    tradeNotePlaceholder: "Catalyst, review date, or lesson",
    tradeReason: "Reason to buy",
    tradeReasonPlaceholder: "Why this trade deserves capital",
  },
  th: {
    emotion: "อารมณ์ตอนซื้อ",
    planEyebrow: "แผนเทรด",
    planTitle: "Risk / Reward และบันทึก",
    stopLoss: "Stop loss",
    strategyTag: "กลยุทธ์",
    targetPrice: "ราคาเป้าหมาย",
    tradeNote: "โน้ต",
    tradeNotePlaceholder: "Catalyst, วันทบทวน, หรือบทเรียน",
    tradeReason: "เหตุผลที่ซื้อ",
    tradeReasonPlaceholder: "ทำไม trade นี้ถึงควรใช้เงิน",
  },
};
