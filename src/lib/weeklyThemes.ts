import type { Market } from "../types";
import type { Language } from "./scoreText";

export interface WeeklyTheme {
  id: string;
  market: Market;
  signal: "hot" | "mixed" | "watch";
  sourceLabel: string;
  sourceUrl: string;
  symbols: string[];
  sectors: string[];
  thesis: Record<Language, string>;
  title: Record<Language, string>;
}

export const weeklyThemeUpdatedAt = "2026-05-31";

export const weeklyThemes: WeeklyTheme[] = [
  {
    id: "us-ai-software",
    market: "US",
    signal: "hot",
    sourceLabel: "Schwab Network, May 29 2026",
    sourceUrl:
      "https://schwabnetwork.com/articles/closing-bell-markets-set-records-as-software-heavyweights-rescue-the-dow",
    symbols: ["NVDA", "MSFT", "ORCL", "NOW"],
    sectors: ["Information Technology", "Software", "AI infrastructure"],
    title: {
      en: "AI software and infrastructure still lead US momentum",
      th: "AI software และโครงสร้างพื้นฐานยังเป็นธีมเด่นของสหรัฐ",
    },
    thesis: {
      en: "Weekly US market coverage points to information technology leadership, helped by enterprise AI software and server hardware demand.",
      th: "ข่าวตลาดสหรัฐรายสัปดาห์ยังชี้ว่า Information Technology นำตลาด โดยแรงหนุนมาจาก enterprise AI software และ demand ฝั่ง server hardware",
    },
  },
  {
    id: "us-broadening",
    market: "US",
    signal: "mixed",
    sourceLabel: "BWFA Weekly Economic Update, May 26 2026",
    sourceUrl: "https://bwfa.com/articles/weekly-economic-update-may-26-2026/",
    symbols: ["AMZN", "ISRG", "PLD", "NEE"],
    sectors: ["Consumer Discretionary", "Health Care", "Real Estate", "Utilities"],
    title: {
      en: "US rally broadened beyond mega-cap tech",
      th: "ตลาดสหรัฐเริ่มกระจายแรงซื้อออกนอก mega-cap tech",
    },
    thesis: {
      en: "The weekly update noted leadership from consumer discretionary, health care, real estate, and utilities after strong earnings helped stabilize the market.",
      th: "รายงานรายสัปดาห์ระบุว่ากลุ่ม consumer discretionary, health care, real estate และ utilities นำตลาด หลังผลประกอบการช่วยพยุง sentiment",
    },
  },
  {
    id: "thai-ai-electronics",
    market: "Thai",
    signal: "hot",
    sourceLabel: "KResearch, May 25 2026",
    sourceUrl:
      "https://www.kasikornresearch.com/en/analysis/k-econ/financial/Pages/MSMR25052026.aspx",
    symbols: ["DELTA", "HANA", "KCE"],
    sectors: ["Electronics", "AI supply chain", "Data center"],
    title: {
      en: "Thai electronics get an AI and data-center narrative",
      th: "หุ้นอิเล็กทรอนิกส์ไทยได้แรงเล่าจาก AI และ data center",
    },
    thesis: {
      en: "KResearch highlighted buying interest in electronic component manufacturers expected to benefit from AI and data-center trends.",
      th: "KResearch ระบุแรงซื้อในกลุ่มชิ้นส่วนอิเล็กทรอนิกส์ที่ถูกคาดหวังว่าจะได้ประโยชน์จากธีม AI และ data center",
    },
  },
  {
    id: "thai-tourism-rebound",
    market: "Thai",
    signal: "watch",
    sourceLabel: "Nation Thailand, May 27 2026",
    sourceUrl: "https://www.nationthailand.com/news/tourism/40066676",
    symbols: ["AOT", "CENTEL", "MINT", "ERW"],
    sectors: ["Tourism", "Transportation", "Hotels"],
    title: {
      en: "Tourism watchlist improves with weekly arrivals",
      th: "ธีมท่องเที่ยวน่าจับตาหลังนักท่องเที่ยวรายสัปดาห์ฟื้น",
    },
    thesis: {
      en: "Thailand reported a weekly rebound in foreign tourist arrivals, helped by holiday travel and stronger flight connectivity.",
      th: "ไทยรายงานนักท่องเที่ยวต่างชาติรายสัปดาห์ฟื้นตัว จากแรงหนุนวันหยุดและการเชื่อมต่อเที่ยวบินที่ดีขึ้น",
    },
  },
];
