import { Plus } from "lucide-react";
import type { FormEvent } from "react";

interface PositionFormProps {
  buyPrice: string;
  errors: {
    symbol?: string;
    buyPrice?: string;
    quantity?: string;
  };
  language: "en" | "th";
  onBuyPriceChange: (buyPrice: string) => void;
  onQuantityChange: (quantity: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSymbolChange: (symbol: string) => void;
  quantity: string;
  symbol: string;
}

export function PositionForm({
  buyPrice,
  errors,
  language,
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
    buyPrice: "Buy price",
    eyebrow: "Journal Entry",
    quantity: "Quantity",
    symbol: "Symbol",
    title: "Add position",
  },
  th: {
    add: "เพิ่ม",
    buyPrice: "ราคาซื้อ",
    eyebrow: "บันทึกการเทรด",
    quantity: "จำนวนหุ้น",
    symbol: "ชื่อหุ้น",
    title: "เพิ่มรายการหุ้น",
  },
};
