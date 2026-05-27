import { unrealizedProfitLoss } from "../lib/portfolio";
import type { PortfolioPosition } from "../types";

interface HoldingsTableProps {
  positions: PortfolioPosition[];
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

export function HoldingsTable({ positions }: HoldingsTableProps) {
  return (
    <section className="panel holdings-panel" aria-labelledby="holdings-title">
      <div className="section-heading">
        <p className="eyebrow">Portfolio</p>
        <h2 id="holdings-title">Holdings</h2>
      </div>

      {positions.length === 0 ? (
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
              {positions.map((position) => {
                const profitLoss = unrealizedProfitLoss(
                  position.buyPrice,
                  position.currentPrice,
                );
                const tone =
                  profitLoss.amount > 0
                    ? "positive"
                    : profitLoss.amount < 0
                      ? "negative"
                      : "neutral";

                return (
                  <tr key={position.id}>
                    <td>
                      <strong>{position.symbol}</strong>
                    </td>
                    <td>{position.name}</td>
                    <td>{position.market}</td>
                    <td>{position.sector}</td>
                    <td>{currencyFormatter.format(position.buyPrice)}</td>
                    <td>{currencyFormatter.format(position.currentPrice)}</td>
                    <td>
                      <span className={`metric-value metric-value--${tone}`}>
                        {currencyFormatter.format(profitLoss.amount)} (
                        {percentFormatter.format(profitLoss.percent)}%)
                      </span>
                    </td>
                    <td>{position.score ?? "N/A"}</td>
                    <td>{position.riskLevel}</td>
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
