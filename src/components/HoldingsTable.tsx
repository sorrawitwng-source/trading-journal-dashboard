import type { PortfolioPosition } from "../types";

export interface HoldingRow extends PortfolioPosition {
  profitLossAmount: number;
  profitLossPercent: number;
  tone: "negative" | "neutral" | "positive";
}

interface HoldingsTableProps {
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

export function HoldingsTable({ rows }: HoldingsTableProps) {
  return (
    <section className="panel holdings-panel" aria-labelledby="holdings-title">
      <div className="section-heading">
        <p className="eyebrow">Portfolio</p>
        <h2 id="holdings-title">Holdings</h2>
      </div>

      {rows.length === 0 ? (
        <p className="empty-state">No positions added yet.</p>
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
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.symbol}</strong>
                  </td>
                  <td>{row.name}</td>
                  <td>{row.market}</td>
                  <td>{row.sector}</td>
                  <td>{currencyFormatter.format(row.buyPrice)}</td>
                  <td>{currencyFormatter.format(row.currentPrice)}</td>
                  <td>
                    <span className={`metric-value metric-value--${row.tone}`}>
                      {currencyFormatter.format(row.profitLossAmount)} (
                      {percentFormatter.format(row.profitLossPercent)}%)
                    </span>
                  </td>
                  <td>{row.score ?? "N/A"}</td>
                  <td>{row.riskLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
