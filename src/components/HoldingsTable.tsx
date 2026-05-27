import { Check, Pencil, X } from "lucide-react";
import type { PortfolioPosition } from "../types";

export interface HoldingRow extends PortfolioPosition {
  profitLossAmount: number;
  profitLossPercent: number;
  tone: "negative" | "neutral" | "positive";
}

interface HoldingsTableProps {
  editDraft: {
    buyPrice: string;
    errors: { symbol?: string; buyPrice?: string };
    id: string;
    symbol: string;
  } | null;
  onEditBuyPriceChange: (buyPrice: string) => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onEditStart: (row: HoldingRow) => void;
  onEditSymbolChange: (symbol: string) => void;
  rows: HoldingRow[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  style: "currency",
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export function HoldingsTable({
  editDraft,
  onEditBuyPriceChange,
  onEditCancel,
  onEditSave,
  onEditStart,
  onEditSymbolChange,
  rows,
}: HoldingsTableProps) {
  return (
    <section className="panel holdings-panel" aria-labelledby="holdings-title">
      <div className="section-heading">
        <p className="eyebrow">Portfolio</p>
        <h2 id="holdings-title">Holdings</h2>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <strong>No positions yet</strong>
          <span>Add a symbol and buy price to start tracking performance.</span>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Market</th>
                <th>Sector</th>
                <th>Buy price</th>
                <th>Current price</th>
                <th>Est. P/L</th>
                <th>Score</th>
                <th>Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isEditing = editDraft?.id === row.id;

                return (
                  <tr key={row.id}>
                    <td>
                      {isEditing ? (
                        <EditableCell
                          error={editDraft.errors.symbol}
                          label="Symbol"
                          onChange={onEditSymbolChange}
                          value={editDraft.symbol}
                        />
                      ) : (
                        <strong>{row.symbol}</strong>
                      )}
                    </td>
                    <td>{row.name}</td>
                    <td>{row.market}</td>
                    <td>{row.sector}</td>
                    <td>
                      {isEditing ? (
                        <EditableCell
                          error={editDraft.errors.buyPrice}
                          inputMode="decimal"
                          label="Buy price"
                          onChange={onEditBuyPriceChange}
                          value={editDraft.buyPrice}
                        />
                      ) : (
                        currencyFormatter.format(row.buyPrice)
                      )}
                    </td>
                    <td>{currencyFormatter.format(row.currentPrice)}</td>
                    <td>
                      <span className={`metric-value metric-value--${row.tone}`}>
                        {currencyFormatter.format(row.profitLossAmount)} (
                        {percentFormatter.format(row.profitLossPercent)}%)
                      </span>
                    </td>
                    <td>{row.score ?? "N/A"}</td>
                    <td>{row.riskLevel}</td>
                    <td>
                      {isEditing ? (
                        <div className="row-actions" aria-label={`Edit ${row.symbol}`}>
                          <button
                            aria-label={`Save ${row.symbol}`}
                            className="table-action table-action--primary"
                            onClick={onEditSave}
                            title="Save"
                            type="button"
                          >
                            <Check aria-hidden="true" size={16} />
                          </button>
                          <button
                            aria-label={`Cancel ${row.symbol}`}
                            className="table-action"
                            onClick={onEditCancel}
                            title="Cancel"
                            type="button"
                          >
                            <X aria-hidden="true" size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          aria-label={`Edit ${row.symbol}`}
                          className="table-action"
                          onClick={() => onEditStart(row)}
                          title="Edit"
                          type="button"
                        >
                          <Pencil aria-hidden="true" size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function EditableCell({
  error,
  inputMode,
  label,
  onChange,
  value,
}: {
  error?: string;
  inputMode?: "decimal";
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="table-edit-field">
      <span>{label}</span>
      <input
        aria-invalid={error ? "true" : "false"}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        onFocus={(event) => event.target.select()}
        type="text"
        value={value}
      />
      {error ? <em>{error}</em> : null}
    </label>
  );
}
