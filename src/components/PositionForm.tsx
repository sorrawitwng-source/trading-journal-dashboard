import { Plus } from "lucide-react";
import type { FormEvent } from "react";

interface PositionFormProps {
  buyPrice: string;
  errors: {
    symbol?: string;
    buyPrice?: string;
  };
  onBuyPriceChange: (buyPrice: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSymbolChange: (symbol: string) => void;
  symbol: string;
}

export function PositionForm({
  buyPrice,
  errors,
  onBuyPriceChange,
  onSubmit,
  onSymbolChange,
  symbol,
}: PositionFormProps) {
  return (
    <section className="panel position-form-panel" aria-labelledby="position-form-title">
      <div className="section-heading">
        <p className="eyebrow">Journal Entry</p>
        <h2 id="position-form-title">Add position</h2>
      </div>

      <form className="position-form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>Symbol</span>
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
          <span>Buy price</span>
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

        <button className="primary-button" type="submit">
          <Plus aria-hidden="true" size={18} />
          Add
        </button>
      </form>
    </section>
  );
}
