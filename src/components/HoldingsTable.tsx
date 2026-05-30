import { Check, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import type { Currency, PortfolioPosition } from "../types";
import {
  metricLabel,
  noDataText,
  scoreMethodologyText,
  type Language,
} from "../lib/scoreText";

export interface HoldingRow extends PortfolioPosition {
  baseCost: number;
  baseCurrentValue: number;
  baseProfitLossAmount: number;
  cost: number;
  currentValue: number;
  profitLossAmount: number;
  profitLossPercent: number;
  tone: "negative" | "neutral" | "positive";
}

interface HoldingsTableProps {
  editDraft: {
    buyDate: string;
    buyPrice: string;
    errors: {
      buyDate?: string;
      symbol?: string;
      buyPrice?: string;
      quantity?: string;
      sellDate?: string;
      sellPrice?: string;
    };
    id: string;
    quantity: string;
    sellDate: string;
    sellPrice: string;
    symbol: string;
  } | null;
  isRefreshingPrices: boolean;
  baseCurrency: Currency;
  language: Language;
  lastPriceUpdate: string | null;
  onEditBuyDateChange: (buyDate: string) => void;
  onEditBuyPriceChange: (buyPrice: string) => void;
  onEditCancel: () => void;
  onEditQuantityChange: (quantity: string) => void;
  onEditSellDateChange: (sellDate: string) => void;
  onEditSellPriceChange: (sellPrice: string) => void;
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
  baseCurrency,
  language,
  lastPriceUpdate,
  onEditBuyDateChange,
  onEditBuyPriceChange,
  onEditCancel,
  onEditQuantityChange,
  onEditSellDateChange,
  onEditSellPriceChange,
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
                <th className="col-symbol">{text.symbol}</th>
                <th className="col-name">{text.name}</th>
                <th className="col-date">{text.month}</th>
                <th className="col-date">{text.buyDate}</th>
                <th className="col-status">{text.status}</th>
                <th className="col-market">{text.market}</th>
                <th className="col-sector">{text.sector}</th>
                <th className="col-money">{text.buyPrice}</th>
                <th className="col-quantity">{text.quantity}</th>
                <th className="col-money">{text.cost}</th>
                <th className="col-money">{text.currentPrice}</th>
                <th className="col-money">{text.sellPrice}</th>
                <th className="col-date">{text.sellDate}</th>
                <th className="col-money">{text.currentValue}</th>
                <th className="col-profit">{text.estimatedProfitLoss}</th>
                <th className="col-data">{text.data}</th>
                <th className="col-score">{text.score}</th>
                <th className="col-risk">{text.risk}</th>
                <th className="col-actions">{text.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isEditing = editDraft?.id === row.id;

                return (
                  <tr key={row.id}>
                    <td className="col-symbol">
                      {isEditing ? (
                        <EditableCell
                          error={editDraft.errors.symbol}
                          label="Symbol"
                          onChange={onEditSymbolChange}
                          value={editDraft.symbol}
                        />
                      ) : (
                        <strong className="symbol-cell">{row.symbol}</strong>
                      )}
                    </td>
                    <td className="col-name">
                      <span className="text-truncate" title={row.name}>
                        {row.name}
                      </span>
                    </td>
                    <td className="col-date">{formatMonth(row.buyDate)}</td>
                    <td className="col-date">
                      {isEditing ? (
                        <EditableCell
                          error={editDraft.errors.buyDate}
                          inputType="date"
                          label={text.buyDate}
                          onChange={onEditBuyDateChange}
                          value={editDraft.buyDate}
                        />
                      ) : (
                        formatDate(row.buyDate)
                      )}
                    </td>
                    <td className="col-status">
                      <span
                        className={`position-status position-status--${
                          row.sellPrice !== undefined && row.sellDate ? "sold" : "open"
                        }`}
                      >
                        {row.sellPrice !== undefined && row.sellDate
                          ? text.sold
                          : text.open}
                      </span>
                    </td>
                    <td className="col-market">{row.market}</td>
                    <td className="col-sector">
                      <div className="stacked-cell">
                        <span title={row.sector}>{row.sector}</span>
                        <span
                          className={`data-badge data-badge--${
                            row.sectorSource ?? "unknown"
                          }`}
                        >
                          {sectorSourceLabel(row.sectorSource)}
                        </span>
                      </div>
                    </td>
                    <td className="col-money">
                      {isEditing ? (
                        <EditableCell
                          error={editDraft.errors.buyPrice}
                          inputMode="decimal"
                          label={text.buyPrice}
                          onChange={onEditBuyPriceChange}
                          value={editDraft.buyPrice}
                        />
                      ) : (
                        formatPositionCurrency(row.buyPrice, row)
                      )}
                    </td>
                    <td className="col-quantity">
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
                    <td className="col-money">
                      <MoneyCell
                        primary={formatPositionCurrency(row.cost, row)}
                        secondary={formatConvertedCurrency(
                          row.baseCost,
                          baseCurrency,
                          row.currency,
                        )}
                      />
                    </td>
                    <td className="col-money">
                      <div className="current-price-cell">
                        <span>{formatPositionCurrency(row.currentPrice, row)}</span>
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
                    <td className="col-money">
                      {isEditing ? (
                        <EditableCell
                          error={editDraft.errors.sellPrice}
                          inputMode="decimal"
                          label={text.sellPrice}
                          onChange={onEditSellPriceChange}
                          value={editDraft.sellPrice}
                        />
                      ) : row.sellPrice !== undefined ? (
                        formatPositionCurrency(row.sellPrice, row)
                      ) : (
                        <span className="muted-cell">-</span>
                      )}
                    </td>
                    <td className="col-date">
                      {isEditing ? (
                        <EditableCell
                          error={editDraft.errors.sellDate}
                          inputType="date"
                          label={text.sellDate}
                          onChange={onEditSellDateChange}
                          value={editDraft.sellDate}
                        />
                      ) : row.sellDate ? (
                        formatDate(row.sellDate)
                      ) : (
                        <span className="muted-cell">-</span>
                      )}
                    </td>
                    <td className="col-money">
                      <MoneyCell
                        primary={formatPositionCurrency(row.currentValue, row)}
                        secondary={formatConvertedCurrency(
                          row.baseCurrentValue,
                          baseCurrency,
                          row.currency,
                        )}
                      />
                    </td>
                    <td className="col-profit">
                      <MoneyCell
                        primary={
                          <span className={`metric-value metric-value--${row.tone}`}>
                            {formatPositionCurrency(row.profitLossAmount, row)} (
                            {percentFormatter.format(row.profitLossPercent)}%)
                          </span>
                        }
                        secondary={formatConvertedCurrency(
                          row.baseProfitLossAmount,
                          baseCurrency,
                          row.currency,
                        )}
                      />
                    </td>
                    <td className="col-data">
                      <span
                        className={`data-badge data-badge--${
                          row.dataQuality ?? "no-data"
                        }`}
                      >
                        {dataQualityLabel(row.dataQuality)}
                      </span>
                    </td>
                    <td className="col-score">
                      {row.scoreBreakdown ? (
                        <details className="score-details">
                          <summary>{row.score ?? "N/A"}</summary>
                          <div>
                            <p>{scoreMethodologyText(language)}</p>
                            {row.scoreBreakdown.items.map((item) => (
                              <span key={item.label}>
                                {metricLabel(item.label, language)}:{" "}
                                {item.available
                                  ? item.value?.toFixed(0)
                                  : noDataText(language)}
                              </span>
                            ))}
                          </div>
                        </details>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="col-risk" title={row.riskReason ?? undefined}>
                      {row.riskLevel}
                    </td>
                    <td className="col-actions">
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

function formatPositionCurrency(
  value: number,
  position: Pick<PortfolioPosition, "currency" | "market">,
): string {
  const currency = position.currency ?? (position.market === "Thai" ? "THB" : "USD");

  return currencyFormatters[currency].format(value);
}

function formatConvertedCurrency(
  value: number,
  baseCurrency: Currency,
  rowCurrency?: Currency,
): string | null {
  if (rowCurrency === baseCurrency) {
    return null;
  }

  return `≈ ${currencyFormatters[baseCurrency].format(value)}`;
}

function dataQualityLabel(status: PortfolioPosition["dataQuality"]): string {
  if (status === "complete") {
    return "Complete";
  }

  if (status === "partial") {
    return "Partial";
  }

  if (status === "limited") {
    return "Limited";
  }

  return "No data";
}

function sectorSourceLabel(source: PortfolioPosition["sectorSource"]): string {
  if (source === "provider") {
    return "Provider";
  }

  if (source === "curated") {
    return "Curated";
  }

  return "Unknown";
}

const labels = {
  en: {
    actions: "Actions",
    buyDate: "Buy date",
    buyPrice: "Buy price",
    cost: "Cost",
    currentPrice: "Current price",
    currentValue: "Current value",
    data: "Data",
    emptyDescription: "Add a symbol, buy price, and quantity to start tracking performance.",
    emptyTitle: "No positions yet",
    eyebrow: "Portfolio",
    estimatedProfitLoss: "Est. P/L",
    market: "Market",
    month: "Month",
    name: "Name",
    open: "Open",
    quantity: "Quantity",
    refreshPrices: "Refresh prices",
    refreshing: "Refreshing",
    risk: "Risk",
    score: "Score",
    sector: "Sector",
    sellDate: "Sell date",
    sellPrice: "Sell price",
    sold: "Sold",
    status: "Status",
    symbol: "Symbol",
    title: "Holdings",
    updated: "Updated",
  },
  th: {
    actions: "จัดการ",
    buyDate: "วันที่ซื้อ",
    buyPrice: "ราคาซื้อ",
    cost: "ต้นทุน",
    currentPrice: "ราคาปัจจุบัน",
    currentValue: "มูลค่าปัจจุบัน",
    data: "ข้อมูล",
    emptyDescription: "เพิ่มชื่อหุ้น ราคาซื้อ และจำนวนหุ้นเพื่อเริ่มติดตามพอร์ต",
    emptyTitle: "ยังไม่มีรายการหุ้น",
    eyebrow: "พอร์ต",
    estimatedProfitLoss: "กำไร/ขาดทุน",
    market: "ตลาด",
    month: "เดือน",
    name: "ชื่อ",
    open: "ถืออยู่",
    quantity: "จำนวน",
    refreshPrices: "อัปเดตราคา",
    refreshing: "กำลังอัปเดต",
    risk: "ความเสี่ยง",
    score: "คะแนน",
    sector: "กลุ่มธุรกิจ",
    sellDate: "วันที่ขาย",
    sellPrice: "ราคาขาย",
    sold: "ขายแล้ว",
    status: "สถานะ",
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMonth(value: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function MoneyCell({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: string | null;
}) {
  return (
    <div className="money-cell">
      <span>{primary}</span>
      {secondary ? <small>{secondary}</small> : null}
    </div>
  );
}

function EditableCell({
  error,
  inputMode,
  inputType = "text",
  label,
  onChange,
  value,
}: {
  error?: string;
  inputMode?: "decimal";
  inputType?: "date" | "text";
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
        type={inputType}
        value={value}
      />
      {error ? <em>{error}</em> : null}
    </label>
  );
}
