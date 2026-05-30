import type { DataQuality, RiskLevel, ScoreBreakdownItem } from "../types";

export type Language = "en" | "th";

const metricLabels: Record<string, Record<Language, string>> = {
  "Data confidence": { en: "Data confidence", th: "ความครบของข้อมูล" },
  Dividend: { en: "Dividend", th: "ปันผล" },
  Momentum: { en: "Momentum", th: "โมเมนตัม" },
  "Risk profile": { en: "Risk profile", th: "โปรไฟล์ความเสี่ยง" },
  Stability: { en: "Stability", th: "ความนิ่งของราคา" },
  Valuation: { en: "Valuation", th: "มูลค่าเทียบราคา" },
};

export function scoreMethodologyText(language: Language): string {
  if (language === "th") {
    return "คะแนนรวม 0-100 มาจากผลรวมของแต่ละปัจจัยแบบถ่วงน้ำหนัก: โมเมนตัม 25%, มูลค่าเทียบราคา 20%, ความนิ่งของราคา 20%, ปันผล 10%, โปรไฟล์ความเสี่ยง 15% และความครบของข้อมูล 10% ถ้าข้อมูลหาย ระบบจะไม่เดาค่า แต่ลดความมั่นใจแทน";
  }

  return "The 0-100 score is the weighted sum of available inputs: momentum 25%, valuation 20%, stability 20%, dividend 10%, risk profile 15%, and data confidence 10%. Missing inputs are not guessed; they reduce confidence.";
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
      ? "ข้อมูลที่ยืนยันได้ยังไม่พอสำหรับจัดอันดับหุ้นตัวนี้"
      : "Not enough verified data to rank this stock yet.";
  }

  const metric = metricLabel(strongestLabel ?? "verified data", language);

  return language === "th"
    ? `${metric} เป็นตัวขับเคลื่อนคะแนนหลักของไอเดียนี้`
    : `Strong ${metric.toLowerCase()} is the main positive input in this score.`;
}

export function researchPromptText(
  score: number | null,
  strongestLabel: string | undefined,
  language: Language,
): string {
  if (score === null) {
    return language === "th"
      ? "หาข้อมูลพื้นฐาน กลุ่มธุรกิจ ความผันผวน และปันผลที่ยืนยันได้ก่อนนำเข้ารายการวิจัย"
      : "Find verified fundamentals, sector, volatility, and dividend data before making this a candidate.";
  }

  const metric = metricLabel(strongestLabel ?? "verified data", language);

  return language === "th"
    ? `ตรวจว่า ${metric} ยังแข็งแรงจริงหรือไม่ แล้วเทียบกับแนวโน้มกลุ่มธุรกิจและมูลค่าเทียบราคา`
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
    return "ยังอ่านความเสี่ยงไม่ได้ เพราะไม่มีข้อมูลความผันผวนหรือค่าความเสี่ยง";
  }

  if (riskLevel === "Low") {
    return "ความเสี่ยงอยู่ในช่วงล่างของสเกล 0-100";
  }

  if (riskLevel === "Medium") {
    return "ความเสี่ยงอยู่ในช่วงกลางของสเกล 0-100";
  }

  return "ความเสี่ยงอยู่ในช่วงบนของสเกล 0-100";
}

export function strongestBreakdownItem(
  items: ScoreBreakdownItem[],
): ScoreBreakdownItem | undefined {
  return items
    .filter((item) => item.available && item.label !== "Data confidence")
    .sort((left, right) => right.contribution - left.contribution)[0];
}
