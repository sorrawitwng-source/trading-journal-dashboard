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

export const weeklyThemeUpdatedAt = "2026-06-08";

export const weeklyThemes: WeeklyTheme[] = [
  {
    id: "us-quality-tech-energy",
    market: "US",
    signal: "hot",
    sourceLabel: "CI Markets Weekly Outlook, Jun 8 2026",
    sourceUrl: "https://completeintel.com/weekly-outlook-june-8-2026/",
    symbols: ["MSFT", "IBM", "CRM", "ORCL", "NOW", "NVDA", "AVGO", "VRT", "CEG", "XOM", "CVX"],
    sectors: ["Enterprise software", "AI infrastructure", "Data center power", "Energy", "Quality tech"],
    title: {
      en: "Quality tech and energy lead this week's US filter",
      th: "สหรัฐฯ สัปดาห์นี้เด่นที่ quality tech และพลังงาน",
    },
    thesis: {
      en: "The US tape is rotating away from speculative AI into proven software, AI infrastructure, data-center power, and energy names with clearer earnings support.",
      th: "ภาพตลาดสหรัฐฯ เริ่มหมุนจาก AI เชิงเก็งกำไรไปหาซอฟต์แวร์ที่พิสูจน์รายได้แล้ว โครงสร้างพื้นฐาน AI ไฟฟ้าดาต้าเซ็นเตอร์ และกลุ่มพลังงานที่มีแรงหนุนกำไรชัดกว่า",
    },
  },
  {
    id: "us-ai-dispersion",
    market: "US",
    signal: "mixed",
    sourceLabel: "INN Tech Weekly, Jun 5 2026",
    sourceUrl: "https://investingnews.com/top-tech-news/",
    symbols: ["NVDA", "AVGO", "AMD", "MRVL", "HPE", "GOOGL", "MSFT", "CRM", "CRWD", "PANW"],
    sectors: ["Semiconductors", "AI software", "Servers", "Cybersecurity"],
    title: {
      en: "AI remains active, but chip leadership is more selective",
      th: "AI ยังมีแรง แต่กลุ่มชิปเริ่มต้องเลือกตัวมากขึ้น",
    },
    thesis: {
      en: "AI software and server-linked names still attract flow, while semiconductor reactions are more divided after demanding expectations and sharp single-stock moves.",
      th: "หุ้นซอฟต์แวร์ AI และเซิร์ฟเวอร์ยังมีแรงเงินไหลเข้า แต่กลุ่ม semiconductor เริ่มแยกตัวชัดขึ้นเพราะความคาดหวังสูงและแรงเหวี่ยงรายตัว",
    },
  },
  {
    id: "thai-rotation-laggards",
    market: "Thai",
    signal: "hot",
    sourceLabel: "Pattaya Mail, Jun 4 2026",
    sourceUrl: "https://www.pattayamail.com/news/set-rally-builds-momentum-as-investors-eye-laggards-and-1620-breakout-target-552085",
    symbols: ["CPALL", "CRC", "BDMS", "BH", "BCH", "AOT", "CENTEL", "MINT", "KTB", "KBANK", "SCB", "RATCH", "EGCO"],
    sectors: ["Retail", "Health Care", "Utilities", "Tourism", "Bank dividends"],
    title: {
      en: "Thai rotation favors laggards, healthcare, tourism, and dividends",
      th: "ไทยเด่นที่ rotation เข้าหุ้น laggard สุขภาพ ท่องเที่ยว และปันผล",
    },
    thesis: {
      en: "Local strategy notes point to rotation into undervalued laggards across retail, healthcare, utilities, tourism, and high-dividend banks as the SET tests an upside breakout.",
      th: "กลยุทธ์ตลาดไทยชี้ว่ามีแรงหมุนเข้าหุ้น laggard ที่มูลค่ายังไม่แพงในกลุ่มค้าปลีก โรงพยาบาล สาธารณูปโภค ท่องเที่ยว และธนาคารปันผลสูง ขณะ SET ลุ้นผ่านแนวต้าน",
    },
  },
  {
    id: "thai-industry-expansion",
    market: "Thai",
    signal: "hot",
    sourceLabel: "Nation Thailand, Jun 6 2026",
    sourceUrl: "https://www.nationthailand.com/business/economy/40067057",
    symbols: ["DELTA", "HANA", "KCE", "SAPPE", "XO", "SNNP", "KISS", "EA", "NEX"],
    sectors: ["Electronics", "Food exports", "Cosmetics", "Electric vehicles", "Domestic demand"],
    title: {
      en: "Thai industry screen highlights electronics, food, beauty, and EVs",
      th: "อุตสาหกรรมไทยที่คัดแล้วเด่นใน electronics อาหาร beauty และ EV",
    },
    thesis: {
      en: "Industry outlook highlights expansion prospects in electronics, food, cosmetics, and electric vehicles, backed by exports, domestic demand, and policy support.",
      th: "ภาพอุตสาหกรรมไทยชี้ว่ากลุ่ม electronics อาหาร เครื่องสำอาง และ EV ยังมีแนวโน้มขยายตัวจากส่งออก อุปสงค์ในประเทศ และนโยบายรัฐ",
    },
  },
  {
    id: "thai-electronics-caution",
    market: "Thai",
    signal: "mixed",
    sourceLabel: "Money & Banking, Jun 5 2026",
    sourceUrl: "https://en.moneyandbanking.co.th/2026/248611/",
    symbols: ["DELTA", "HANA", "KCE", "CCET"],
    sectors: ["Electronics", "AI supply chain"],
    title: {
      en: "Thai electronics is still thematic, but short-term flow is choppy",
      th: "electronics ไทยยังเป็นธีมใหญ่ แต่ระยะสั้นผันผวน",
    },
    thesis: {
      en: "Electronics remains tied to the AI narrative, but the latest market action shows profit-taking pressure in large-cap leaders after a strong rebound.",
      th: "กลุ่ม electronics ยังโยงกับธีม AI แต่แรงซื้อระยะสั้นเริ่มผันผวนหลังมีแรงขายทำกำไรในหุ้นใหญ่ที่ขึ้นแรงมาก่อน",
    },
  },
  {
    id: "us-ai-software",
    market: "US",
    signal: "hot",
    sourceLabel: "Schwab Network, May 29 2026",
    sourceUrl:
      "https://schwabnetwork.com/articles/closing-bell-markets-set-records-as-software-heavyweights-rescue-the-dow",
    symbols: [
      "NVDA",
      "AVGO",
      "AMD",
      "ARM",
      "QCOM",
      "MU",
      "AMAT",
      "LRCX",
      "KLAC",
      "ASML",
      "INTC",
      "MRVL",
      "ANET",
      "VRT",
      "DELL",
      "HPE",
      "SMCI",
      "WDC",
      "STX",
      "MSFT",
      "ORCL",
      "NOW",
      "PLTR",
      "SNPS",
      "CDNS",
      "CRWD",
      "DDOG",
      "PANW",
    ],
    sectors: [
      "Semiconductors",
      "Memory",
      "Servers",
      "Data center infrastructure",
      "Enterprise software",
      "Cybersecurity",
    ],
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
    symbols: [
      "AMZN",
      "HD",
      "LOW",
      "TJX",
      "BKNG",
      "MAR",
      "SBUX",
      "ORLY",
      "LLY",
      "JNJ",
      "ABBV",
      "TMO",
      "ABT",
      "ISRG",
      "SYK",
      "VRTX",
      "GILD",
      "PFE",
      "PLD",
      "AMT",
      "EQIX",
      "WELL",
      "SPG",
      "DLR",
      "O",
      "NEE",
      "DUK",
      "SO",
      "AEP",
      "CEG",
      "EXC",
      "XEL",
    ],
    sectors: [
      "Consumer Discretionary",
      "Health Care",
      "Real Estate",
      "Utilities",
    ],
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
    symbols: ["DELTA", "CCET", "HANA", "KCE", "DITTO", "FORTH"],
    sectors: ["Electronics", "AI supply chain", "Data center", "Digital infrastructure"],
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
    id: "thai-gdp-banks-industrial-estate",
    market: "Thai",
    signal: "mixed",
    sourceLabel: "KResearch, May 25 2026",
    sourceUrl:
      "https://www.kasikornresearch.com/en/analysis/k-econ/financial/Pages/MSMR25052026.aspx",
    symbols: ["KBANK", "BBL", "KTB", "SCB", "KKP", "TISCO", "TTB", "AMATA", "WHA"],
    sectors: ["Banking", "Finance", "Industrial Estate"],
    title: {
      en: "GDP surprise supports banks and industrial estate names",
      th: "GDP ดีกว่าคาดหนุนธนาคารและนิคมอุตสาหกรรม",
    },
    thesis: {
      en: "KResearch cited buying interest in banking and industrial estate stocks after Thailand's 1Q-2026 GDP beat market expectations.",
      th: "KResearch ระบุแรงซื้อในหุ้นธนาคารและนิคมอุตสาหกรรม หลัง GDP ไตรมาส 1/2026 ของไทยออกมาดีกว่าตลาดคาด",
    },
  },
  {
    id: "thai-energy-dividend-finance",
    market: "Thai",
    signal: "watch",
    sourceLabel: "KResearch, May 25 2026",
    sourceUrl:
      "https://www.kasikornresearch.com/en/analysis/k-econ/financial/Pages/MSMR25052026.aspx",
    symbols: [
      "PTT",
      "PTTEP",
      "TOP",
      "BCP",
      "SPRC",
      "PTTGC",
      "OR",
      "RATCH",
      "EGCO",
      "GPSC",
      "GULF",
      "TISCO",
      "KKP",
      "KTC",
      "MTC",
      "SAWAD",
      "TIDLOR",
    ],
    sectors: ["Energy", "Utilities", "Finance", "Dividend"],
    title: {
      en: "Energy and dividend finance stay on the watchlist",
      th: "พลังงานและไฟแนนซ์ปันผลยังอยู่ใน watchlist",
    },
    thesis: {
      en: "The weekly note mentioned support from higher oil prices and finance names after a major operator announced a relatively high dividend payout.",
      th: "รายงานรายสัปดาห์พูดถึงแรงหนุนจากราคาน้ำมันโลก และหุ้นไฟแนนซ์หลังผู้ประกอบการรายใหญ่ประกาศปันผลค่อนข้างสูง",
    },
  },
  {
    id: "thai-tourism-rebound",
    market: "Thai",
    signal: "watch",
    sourceLabel: "Nation Thailand, May 27 2026",
    sourceUrl: "https://www.nationthailand.com/news/tourism/40066676",
    symbols: ["AOT", "AAV", "BA", "CENTEL", "MINT", "ERW", "AWC"],
    sectors: ["Tourism", "Transportation", "Airports", "Hotels"],
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
