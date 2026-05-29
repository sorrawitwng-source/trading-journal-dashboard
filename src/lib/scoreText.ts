import type { DataQuality, RiskLevel, ScoreBreakdownItem } from "../types";

export type Language = "en" | "th";

const metricLabels: Record<string, Record<Language, string>> = {
  "Data confidence": { en: "Data confidence", th: "ความครบของข้อมูล" },
  Dividend: { en: "Dividend", th: "ปันผล" },
  Momentum: { en: "Momentum", th: "โมเมนตัม" },
  "Risk profile": { en: "Risk profile", th: "โปรไฟล์ความเสี่ยง" },
  Stability: { en: "Stability", th: "ความนิ่งของราคา" },
  Valuation: { en: "Valuation", th: "มูลค่าพื้นฐาน" },
};

export function scoreMethodologyText(language: Language): string {
  if (language === "th") {
    return "คะแนนเป็นการถ่วงน้ำหนักจากข้อมูลที่มี เช่น โมเมนตัม มูลค่าพื้นฐาน ความนิ่งของราคา ปันผล โปรไฟล์ความเสี่ยง และความครบของข้อมูล ถ้าข้อมูลหาย คะแนนความเชื่อมั่นจะลดลงแทนการเดาค่า";
  }

  return "Score is a weighted blend of available momentum, valuation, stability, dividend, risk profile, and data confidence inputs. Missing inputs reduce confidence instead of being guessed.";
}

export function metricLabel(label: string, language: Language): string {
  return metricLabels[label]?.[language] ?? label;
}

export function noDataText(language: Language): string {
  return language === "th" ? "ไม่มีข้อมูล" : "No data";
}

export function dataQualityText(
  dataQuality: DataQuality,
  language: Language,
): string {
  const labels: Record<DataQuality, Record<Language, string>> = {
    complete: { en: "complete", th: "ครบ" },
    limited: { en: "limited", th: "จำกัด" },
    "no-data": { en: "no data", th: "ไม่มีข้อมูล" },
    partial: { en: "partial", th: "บางส่วน" },
  };

  return labels[dataQuality][language];
}

export function riskLevelText(
  riskLevel: RiskLevel,
  language: Language,
): string {
  if (language === "en") {
    return riskLevel;
  }

  const labels: Record<RiskLevel, string> = {
    High: "สูง",
    Low: "ต่ำ",
    Medium: "กลาง",
    "No data": "ไม่มีข้อมูล",
  };

  return labels[riskLevel];
}

export function recommendationReasonText(
  score: number | null,
  strongestLabel: string | undefined,
  language: Language,
): string {
  if (score === null) {
    return language === "th"
      ? "ข้อมูลที่ตรวจสอบได้ยังไม่พอสำหรับจัดอันดับหุ้นตัวนี้"
      : "Not enough verified data to rank this stock yet.";
  }

  const metric = metricLabel(strongestLabel ?? "verified data", language);

  return language === "th"
    ? `${metric} เป็นปัจจัยบวกหลักของคะแนนนี้`
    : `Strong ${metric.toLowerCase()} is the main positive input in this score.`;
}

export function researchPromptText(
  score: number | null,
  strongestLabel: string | undefined,
  language: Language,
): string {
  if (score === null) {
    return language === "th"
      ? "ควรหาข้อมูลพื้นฐาน กลุ่มธุรกิจ ความผันผวน และปันผลที่ตรวจสอบได้ก่อนนำเข้ารายการวิจัย"
      : "Find verified fundamentals, sector, volatility, and dividend data before making this a candidate.";
  }

  const metric = metricLabel(strongestLabel ?? "verified data", language);

  return language === "th"
    ? `ตรวจต่อว่า ${metric} แนวโน้มกลุ่มธุรกิจ และมูลค่าพื้นฐานยังสนับสนุนคะแนนนี้อยู่หรือไม่`
    : `Research whether ${metric.toLowerCase()}, sector outlook, and valuation still support the score.`;
}

export function riskReasonText(
  riskLevel: RiskLevel,
  language: Language,
): string {
  if (language === "en") {
    if (riskLevel === "No data") {
      return "Risk is unavailable because volatility/risk inputs are missing.";
    }

    if (riskLevel === "Low") {
      return "Risk score is in the lower third of the 0-100 risk scale.";
    }

    if (riskLevel === "Medium") {
      return "Risk score sits in the middle third of the 0-100 risk scale.";
    }

    return "Risk score is in the upper third of the 0-100 risk scale.";
  }

  if (riskLevel === "No data") {
    return "ยังประเมินความเสี่ยงไม่ได้ เพราะไม่มีข้อมูลความผันผวนหรือค่าความเสี่ยง";
  }

  if (riskLevel === "Low") {
    return "ค่าความเสี่ยงอยู่ในช่วงต่ำของสเกล 0-100";
  }

  if (riskLevel === "Medium") {
    return "ค่าความเสี่ยงอยู่ในช่วงกลางของสเกล 0-100";
  }

  return "ค่าความเสี่ยงอยู่ในช่วงสูงของสเกล 0-100";
}

export function strongestBreakdownItem(
  items: ScoreBreakdownItem[],
): ScoreBreakdownItem | undefined {
  return items
    .filter((item) => item.available && item.label !== "Data confidence")
    .sort((left, right) => right.contribution - left.contribution)[0];
}
