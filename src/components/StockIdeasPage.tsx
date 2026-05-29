import type { RecommendationCategory } from "../lib/recommendationCategories";

interface StockIdeasPageProps {
  categories: RecommendationCategory[];
  language: "en" | "th";
}

export function StockIdeasPage({ categories, language }: StockIdeasPageProps) {
  const featuredCategories = categories.slice(0, 4);
  const remainingCategories = categories.slice(4);
  const text = labels[language];

  return (
    <section className="ideas-page" aria-labelledby="ideas-title">
      <div className="ideas-hero">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="ideas-title">{text.title}</h2>
          <p>{text.description}</p>
        </div>
        <div className="ideas-hero__stats" aria-label="Idea category stats">
          <strong>{categories.length}</strong>
          <span>{text.categories}</span>
        </div>
      </div>

      <div className="ideas-feature-grid">
        {featuredCategories.map((category) => (
          <IdeaCategoryCard
            category={category}
            emptyText={text.empty}
            isFeatured
            key={category.id}
          />
        ))}
      </div>

      <div className="ideas-category-grid">
        {remainingCategories.map((category) => (
          <IdeaCategoryCard
            category={category}
            emptyText={text.empty}
            key={category.id}
          />
        ))}
      </div>
    </section>
  );
}

function IdeaCategoryCard({
  category,
  emptyText,
  isFeatured = false,
}: {
  category: RecommendationCategory;
  emptyText: string;
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
        <div className="idea-empty">{emptyText}</div>
      ) : (
        <div className="idea-list">
          {category.stocks.map((stock) => (
            <div className="idea-row" key={stock.symbol}>
              <div>
                <strong>{stock.symbol}</strong>
                <span>{stock.name}</span>
                <small>{stock.reason}</small>
              </div>
              <div className="idea-row__meta">
                <span>{stock.market}</span>
                <span>{stock.riskLevel}</span>
                <span>{stock.dataQuality}</span>
                <b>{stock.score ?? "N/A"}</b>
              </div>
              <details className="idea-research">
                <summary>Research notes</summary>
                <p>{stock.researchPrompt}</p>
                <p>{stock.keyRisk}</p>
                <div>
                  {stock.scoreBreakdown.items.map((item) => (
                    <span key={item.label}>
                      {item.label}: {item.available ? item.value?.toFixed(0) : "No data"}
                    </span>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

const labels = {
  en: {
    categories: "categories",
    description:
      "Browse Thai and US stocks by sector, income profile, growth signal, and risk quality.",
    empty: "No matching ideas for this market filter.",
    eyebrow: "Stock Ideas",
    title: "Ranked ideas by investment style",
  },
  th: {
    categories: "หมวดหมู่",
    description:
      "ค้นหาหุ้นไทยและหุ้นสหรัฐตามกลุ่มธุรกิจ ปันผล โมเมนตัม และระดับความเสี่ยง",
    empty: "ไม่มีหุ้นที่ตรงกับตัวกรองตลาดนี้",
    eyebrow: "หุ้นน่าสนใจ",
    title: "ไอเดียลงทุนแยกตามสไตล์",
  },
};
