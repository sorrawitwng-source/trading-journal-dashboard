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
  };
  language: "en" | "th";
  onBuyDateChange: (buyDate: string) => void;
  onBuyPriceChange: (buyPrice: string) => void;
  onQuantityChange: (quantity: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSymbolChange: (symbol: string) => void;
  quantity: string;
  symbol: string;
}

export function PositionForm({
  buyDate,
  buyPrice,
  errors,
  language,
  onBuyDateChange,
  onBuyPriceChange,
  onQuantityChange,
  onSubmit,
  onSymbolChange,
  quantity,
  symbol,
}: PositionFormProps) {
  const text = labels[language];

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
            onChange={(event) => onBuyDateChange(event.target.value)}
            type="date"
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
