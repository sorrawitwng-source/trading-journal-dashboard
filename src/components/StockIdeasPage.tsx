import type { RecommendationCategory } from "../lib/recommendationCategories";
import { scoreComponentGuides } from "../lib/scoring";
import {
  dataQualityText,
  metricLabel,
  noDataText,
  recommendationReasonText,
  researchPromptText,
  riskLevelText,
  riskReasonText,
  scoreMethodologyText,
  strongestBreakdownItem,
  type Language,
} from "../lib/scoreText";
import type { ScoreBreakdownItem } from "../types";

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
        <div className="ideas-hero__insight" aria-label={text.scoreModel}>
          <div className="ideas-hero__stats">
            <strong>{categories.length}</strong>
            <span>{text.categories}</span>
          </div>
          <div className="score-model-card">
            <span>{text.scoreModel}</span>
            <strong>100 {text.points}</strong>
            <p>{text.scoreModelDescription}</p>
            <div className="score-weight-list">
              {scoreComponentGuides.map((component) => (
                <span key={component.key}>
                  {metricLabel(component.label, language)}
                  <b>{formatWeight(component.weight)}</b>
                </span>
              ))}
            </div>
          </div>
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
  const text = labels[language];

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
            const keyFactors = stock.scoreBreakdown.items
              .filter((item) => item.available)
              .sort((left, right) => right.contribution - left.contribution)
              .slice(0, 3);
            const tone = scoreTone(stock.score);

            return (
              <div className={`idea-row idea-row--${tone}`} key={stock.symbol}>
                <div className="idea-row__main">
                  <div className="idea-row__title">
                    <div>
                      <strong>{stock.symbol}</strong>
                      <span>{stock.name}</span>
                    </div>
                    <div className="idea-score-card">
                      <span>{text.score}</span>
                      <b>{stock.score ?? "N/A"}</b>
                      <small>{scoreBandText(stock.score, language)}</small>
                    </div>
                  </div>
                  <p className="idea-thesis">
                    {recommendationReasonText(
                      stock.score,
                      strongest?.label,
                      language,
                    )}
                  </p>
                  <div className="idea-factor-strip" aria-label={text.keyDrivers}>
                    {keyFactors.map((item) => (
                      <FactorChip item={item} key={item.label} language={language} />
                    ))}
                  </div>
                </div>

                <div className="idea-row__meta">
                  <span>{stock.market}</span>
                  <span>{riskLevelText(stock.riskLevel, language)}</span>
                  <span>{dataQualityText(stock.dataQuality, language)}</span>
                </div>

                <details className="idea-research">
                  <summary>{researchNotesLabel}</summary>
                  <div className="idea-research__brief">
                    <p>
                      <strong>{text.researchFocus}</strong>
                      {researchPromptText(stock.score, strongest?.label, language)}
                    </p>
                    <p>
                      <strong>{text.riskRead}</strong>
                      {riskReasonText(stock.riskLevel, language)}
                    </p>
                  </div>
                  <p className="idea-score-method">{scoreMethodologyText(language)}</p>
                  <div className="idea-score-breakdown">
                    {stock.scoreBreakdown.items.map((item) => (
                      <ScoreFactorRow item={item} key={item.label} language={language} />
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

function FactorChip({
  item,
  language,
}: {
  item: ScoreBreakdownItem;
  language: Language;
}) {
  return (
    <span className="idea-factor-chip">
      {metricLabel(item.label, language)}
      <b>{item.contribution.toFixed(1)}</b>
    </span>
  );
}

function ScoreFactorRow({
  item,
  language,
}: {
  item: ScoreBreakdownItem;
  language: Language;
}) {
  const contribution = item.available ? item.contribution : 0;

  return (
    <div className="idea-score-factor">
      <div>
        <span>{metricLabel(item.label, language)}</span>
        <strong>
          {item.available
            ? `${item.value?.toFixed(0)} × ${formatWeight(item.weight)} = ${contribution.toFixed(1)}`
            : noDataText(language)}
        </strong>
      </div>
      <div className="idea-score-factor__bar" aria-hidden="true">
        <span style={{ width: `${Math.min(contribution, 30) * (100 / 30)}%` }} />
      </div>
    </div>
  );
}

function formatWeight(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}

function scoreTone(score: number | null): "balanced" | "strong" | "watch" {
  if (score === null || score < 60) {
    return "watch";
  }

  return score >= 75 ? "strong" : "balanced";
}

function scoreBandText(score: number | null, language: Language): string {
  if (score === null) {
    return language === "th" ? "ข้อมูลไม่พอ" : "Needs data";
  }

  if (score >= 75) {
    return language === "th" ? "เด่น" : "Strong";
  }

  if (score >= 60) {
    return language === "th" ? "น่าศึกษา" : "Research";
  }

  return language === "th" ? "เฝ้าดู" : "Watch";
}

const labels = {
  en: {
    categories: "categories",
    description:
      "Browse Thai and US stocks by sector, income profile, growth signal, and risk quality.",
    empty: "No matching ideas for this market filter.",
    eyebrow: "Stock Ideas",
    keyDrivers: "Key score drivers",
    points: "pts",
    researchFocus: "Research focus: ",
    researchNotes: "Research notes",
    riskRead: "Risk read: ",
    score: "Score",
    scoreModel: "Score model",
    scoreModelDescription:
      "The rank is a screen, not a buy signal. It blends factor strength with data confidence.",
    title: "Ranked ideas by investment style",
  },
  th: {
    categories: "หมวดหมู่",
    description:
      "ค้นหาไอเดียหุ้นไทยและหุ้นสหรัฐตามกลุ่มธุรกิจ สไตล์รายได้ โมเมนตัม และระดับความเสี่ยง",
    empty: "ไม่มีไอเดียที่ตรงกับตัวกรองตลาดนี้",
    eyebrow: "หุ้นน่าสนใจ",
    keyDrivers: "ตัวขับเคลื่อนคะแนนหลัก",
    points: "คะแนน",
    researchFocus: "ควรวิจัยต่อ: ",
    researchNotes: "บันทึกเพื่อวิจัยต่อ",
    riskRead: "อ่านความเสี่ยง: ",
    score: "คะแนน",
    scoreModel: "โมเดลคะแนน",
    scoreModelDescription:
      "คะแนนเป็นตัวช่วยคัดกรอง ไม่ใช่สัญญาณซื้อ โดยรวมความแข็งแรงของปัจจัยกับความครบของข้อมูล",
    title: "ไอเดียลงทุนแยกตามสไตล์",
  },
};
