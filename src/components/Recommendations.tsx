import type { StockRecommendation } from "../lib/scoring";

interface RecommendationsProps {
  recommendations: StockRecommendation[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <section className="panel recommendations-panel" aria-labelledby="recommendations-title">
      <div className="section-heading">
        <p className="eyebrow">Ranked Ideas</p>
        <h2 id="recommendations-title">Recommendations</h2>
      </div>

      <div className="recommendation-list">
        {recommendations.map((stock) => (
          <article className="recommendation-card" key={stock.symbol}>
            <div className="recommendation-card__header">
              <div>
                <h3>{stock.symbol}</h3>
                <p>{stock.name}</p>
              </div>
              <strong>{stock.score}</strong>
            </div>
            <div className="tag-row">
              <span>{stock.market}</span>
              <span>{stock.sector}</span>
              <span>{stock.riskLevel} risk</span>
            </div>
            <p className="recommendation-reason">{stock.reason}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
