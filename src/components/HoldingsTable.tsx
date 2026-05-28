import { Check, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import type { PortfolioPosition } from "../types";

export interface HoldingRow extends PortfolioPosition {
  cost: number;
  currentValue: number;
  profitLossAmount: number;
  profitLossPercent: number;
  tone: "negative" | "neutral" | "positive";
}

interface HoldingsTableProps {
  editDraft: {
    buyPrice: string;
    errors: { symbol?: string; buyPrice?: string; quantity?: string };
    id: string;
    quantity: string;
    symbol: string;
  } | null;
  isRefreshingPrices: boolean;
  language: "en" | "th";
  lastPriceUpdate: string | null;
  onEditBuyPriceChange: (buyPrice: string) => void;
  onEditCancel: () => void;
  onEditQuantityChange: (quantity: string) => void;
  onEditSave: () => void;
  onEditStart: (row: HoldingRow) => void;
  onEditSymbolChange: (symbol: string) => void;
  onDelete: (id: string) => void;
  onRefreshPrices: () => void;
  priceRefreshError: string | null;
  rows: HoldingRow[];
}

const currencyFormatters = {
  THB: new Intl.NumberFormat("th-TH", {
    currency: "THB",
    maximumFractionDigits: 2,
    style: "currency",
  }),
  USD: new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }),
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export function HoldingsTable({
  editDraft,
  isRefreshingPrices,
  language,
  lastPriceUpdate,
  onEditBuyPriceChange,
  onEditCancel,
  onEditQuantityChange,
  onEditSave,
  onEditStart,
  onEditSymbolChange,
  onDelete,
  onRefreshPrices,
  priceRefreshError,
  rows,
}: HoldingsTableProps) {
  const text = labels[language];

  return (
    <section className="panel holdings-panel" aria-labelledby="holdings-title">
      <div className="section-heading section-heading--with-action">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="holdings-title">{text.title}</h2>
          {lastPriceUpdate ? (
            <span className="price-refresh-note">
              {text.updated} {formatUpdatedTime(lastPriceUpdate)}
            </span>
          ) : null}
          {priceRefreshError ? (
            <span className="price-refresh-note price-refresh-note--error">
              {priceRefreshError}
            </span>
          ) : null}
        </div>
        <button
          className="secondary-button"
          disabled={isRefreshingPrices || rows.length === 0}
          onClick={onRefreshPrices}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={16} />
          {isRefreshingPrices ? text.refreshing : text.refreshPrices}
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <strong>{text.emptyTitle}</strong>
          <span>{text.emptyDescription}</span>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{text.symbol}</th>
                <th>{text.name}</th>
                <th>{text.market}</th>
                <th>{text.sector}</th>
                <th>{text.buyPrice}</th>
                <th>{text.quantity}</th>
                <th>{text.cost}</th>
                <th>{text.currentPrice}</th>
                <th>{text.currentValue}</th>
                <th>{text.estimatedProfitLoss}</th>
                <th>{text.score}</th>
                <th>{text.risk}</th>
                <th>{text.actions}</th>
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
                          label={text.buyPrice}
                          onChange={onEditBuyPriceChange}
                          value={editDraft.buyPrice}
                        />
                      ) : (
                        formatMarketCurrency(row.buyPrice, row.market)
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <EditableCell
                          error={editDraft.errors.quantity}
                          inputMode="decimal"
                          label={text.quantity}
                          onChange={onEditQuantityChange}
                          value={editDraft.quantity}
                        />
                      ) : (
                        formatQuantity(row.quantity)
                      )}
                    </td>
                    <td>{formatMarketCurrency(row.cost, row.market)}</td>
                    <td>
                      <div className="current-price-cell">
                        <span>{formatMarketCurrency(row.currentPrice, row.market)}</span>
                        <span
                          className={`price-status price-status--${
                            row.priceStatus ?? "fallback"
                          }`}
                          title={row.priceUpdatedAt ?? undefined}
                        >
                          {priceStatusLabel(row.priceStatus)}
                        </span>
                      </div>
                    </td>
                    <td>{formatMarketCurrency(row.currentValue, row.market)}</td>
                    <td>
                      <span className={`metric-value metric-value--${row.tone}`}>
                        {formatMarketCurrency(row.profitLossAmount, row.market)} (
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
                        <div className="row-actions" aria-label={`Actions for ${row.symbol}`}>
                          <button
                            aria-label={`Edit ${row.symbol}`}
                            className="table-action"
                            onClick={() => onEditStart(row)}
                            title="Edit"
                            type="button"
                          >
                            <Pencil aria-hidden="true" size={16} />
                          </button>
                          <button
                            aria-label={`Delete ${row.symbol}`}
                            className="table-action table-action--danger"
                            onClick={() => onDelete(row.id)}
                            title="Delete"
                            type="button"
                          >
                            <Trash2 aria-hidden="true" size={16} />
                          </button>
                        </div>
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

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(value);
}

function formatMarketCurrency(
  value: number,
  market: PortfolioPosition["market"],
): string {
  const currency = market === "Thai" ? "THB" : "USD";

  return currencyFormatters[currency].format(value);
}

const labels = {
  en: {
    actions: "Actions",
    buyPrice: "Buy price",
    cost: "Cost",
    currentPrice: "Current price",
    currentValue: "Current value",
    emptyDescription: "Add a symbol, buy price, and quantity to start tracking performance.",
    emptyTitle: "No positions yet",
    eyebrow: "Portfolio",
    estimatedProfitLoss: "Est. P/L",
    market: "Market",
    name: "Name",
    quantity: "Quantity",
    refreshPrices: "Refresh prices",
    refreshing: "Refreshing",
    risk: "Risk",
    score: "Score",
    sector: "Sector",
    symbol: "Symbol",
    title: "Holdings",
    updated: "Updated",
  },
  th: {
    actions: "จัดการ",
    buyPrice: "ราคาซื้อ",
    cost: "ต้นทุน",
    currentPrice: "ราคาปัจจุบัน",
    currentValue: "มูลค่าปัจจุบัน",
    emptyDescription: "เพิ่มชื่อหุ้น ราคาซื้อ และจำนวนหุ้นเพื่อเริ่มติดตามพอร์ต",
    emptyTitle: "ยังไม่มีรายการหุ้น",
    eyebrow: "พอร์ต",
    estimatedProfitLoss: "กำไร/ขาดทุน",
    market: "ตลาด",
    name: "ชื่อ",
    quantity: "จำนวน",
    refreshPrices: "อัปเดตราคา",
    refreshing: "กำลังอัปเดต",
    risk: "ความเสี่ยง",
    score: "คะแนน",
    sector: "กลุ่มธุรกิจ",
    symbol: "หุ้น",
    title: "รายการหุ้น",
    updated: "อัปเดต",
  },
};

function priceStatusLabel(status: PortfolioPosition["priceStatus"]): string {
  if (status === "live") {
    return "Live";
  }

  if (status === "cached") {
    return "Cached";
  }

  return "Fallback";
}

function formatUpdatedTime(value: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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
