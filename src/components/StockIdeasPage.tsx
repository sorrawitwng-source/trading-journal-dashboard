import type { RecommendationCategory } from "../lib/recommendationCategories";
import {
  dataQualityText,
  metricLabel,
  noDataText,
  recommendationReasonText,
  researchPromptText,
  riskLevelText,
  riskReasonText,
  strongestBreakdownItem,
  type Language,
} from "../lib/scoreText";

interface StockIdeasPageProps {
  categories: RecommendationCategory[];
  language: Language;
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
            language={language}
            researchNotesLabel={text.researchNotes}
          />
        ))}
      </div>

      <div className="ideas-category-grid">
        {remainingCategories.map((category) => (
          <IdeaCategoryCard
            category={category}
            emptyText={text.empty}
            key={category.id}
            language={language}
            researchNotesLabel={text.researchNotes}
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
  language,
  researchNotesLabel,
}: {
  category: RecommendationCategory;
  emptyText: string;
  isFeatured?: boolean;
  language: Language;
  researchNotesLabel: string;
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
          {category.stocks.map((stock) => {
            const strongest = strongestBreakdownItem(stock.scoreBreakdown.items);

            return (
              <div className="idea-row" key={stock.symbol}>
                <div>
                  <strong>{stock.symbol}</strong>
                  <span>{stock.name}</span>
                  <small>
                    {recommendationReasonText(
                      stock.score,
                      strongest?.label,
                      language,
                    )}
                  </small>
                </div>
                <div className="idea-row__meta">
                  <span>{stock.market}</span>
                  <span>{riskLevelText(stock.riskLevel, language)}</span>
                  <span>{dataQualityText(stock.dataQuality, language)}</span>
                  <b>{stock.score ?? "N/A"}</b>
                </div>
                <details className="idea-research">
                  <summary>{researchNotesLabel}</summary>
                  <p>
                    {researchPromptText(stock.score, strongest?.label, language)}
                  </p>
                  <p>{riskReasonText(stock.riskLevel, language)}</p>
                  <div>
                    {stock.scoreBreakdown.items.map((item) => (
                      <span key={item.label}>
                        {metricLabel(item.label, language)}:{" "}
                        {item.available
                          ? item.value?.toFixed(0)
                          : noDataText(language)}
                      </span>
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
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
    researchNotes: "Research notes",
    title: "Ranked ideas by investment style",
  },
  th: {
    categories: "หมวดหมู่",
    description:
      "ค้นหาหุ้นไทยและหุ้นสหรัฐตามกลุ่มธุรกิจ ปันผล โมเมนตัม และระดับความเสี่ยง",
    empty: "ไม่มีหุ้นที่ตรงกับตัวกรองตลาดนี้",
    eyebrow: "หุ้นน่าสนใจ",
    researchNotes: "บันทึกเพื่อวิจัยต่อ",
    title: "ไอเดียลงทุนแยกตามสไตล์",
  },
};
