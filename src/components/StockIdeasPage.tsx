import type { RecommendationCategory } from "../lib/recommendationCategories";

interface StockIdeasPageProps {
  categories: RecommendationCategory[];
}

export function StockIdeasPage({ categories }: StockIdeasPageProps) {
  const featuredCategories = categories.slice(0, 4);
  const remainingCategories = categories.slice(4);

  return (
    <section className="ideas-page" aria-labelledby="ideas-title">
      <div className="ideas-hero">
        <div>
          <p className="eyebrow">Stock Ideas</p>
          <h2 id="ideas-title">Ranked ideas by investment style</h2>
          <p>
            Browse Thai and US stocks by sector, income profile, growth signal,
            and risk quality.
          </p>
        </div>
        <div className="ideas-hero__stats" aria-label="Idea category stats">
          <strong>{categories.length}</strong>
          <span>categories</span>
        </div>
      </div>

      <div className="ideas-feature-grid">
        {featuredCategories.map((category) => (
          <IdeaCategoryCard category={category} isFeatured key={category.id} />
        ))}
      </div>

      <div className="ideas-category-grid">
        {remainingCategories.map((category) => (
          <IdeaCategoryCard category={category} key={category.id} />
        ))}
      </div>
    </section>
  );
}

function IdeaCategoryCard({
  category,
  isFeatured = false,
}: {
  category: RecommendationCategory;
  isFeatured?: boolean;
}) {
  return (
    <article
      className={`idea-category-card${
        isFeatured ? " idea-category-card--featured" : ""
      }`}
    >
      <div className="idea-category-card__heading">
        <div>
          <h3>{category.label}</h3>
          <p>{category.description}</p>
        </div>
        <strong>{category.stocks.length}</strong>
      </div>

      {category.stocks.length === 0 ? (
        <div className="idea-empty">No matching ideas for this market filter.</div>
      ) : (
        <div className="idea-list">
          {category.stocks.map((stock) => (
            <div className="idea-row" key={stock.symbol}>
              <div>
                <strong>{stock.symbol}</strong>
                <span>{stock.name}</span>
              </div>
              <div className="idea-row__meta">
                <span>{stock.market}</span>
                <span>{stock.riskLevel}</span>
                <b>{stock.score}</b>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
