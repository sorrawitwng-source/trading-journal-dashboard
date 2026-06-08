import type { Language } from "./scoreText";

export interface ThaiNewsSource {
  id: string;
  label: string;
  type: Record<Language, string>;
  url: string;
}

export const thaiNewsSources: ThaiNewsSource[] = [
  {
    id: "set-news-alerts",
    label: "SET News & Market Alerts",
    type: {
      en: "Official filings",
      th: "ประกาศทางการ",
    },
    url: "https://www.set.or.th/en/market/news-and-alert/",
  },
  {
    id: "innovestx-daily-strategy",
    label: "InnovestX Daily Strategy",
    type: {
      en: "Broker strategy",
      th: "กลยุทธ์โบรกเกอร์",
    },
    url: "https://www.innovestx.co.th/cafeinvest/strategy-insight",
  },
  {
    id: "bualuang-research",
    label: "Bualuang Research",
    type: {
      en: "Broker research",
      th: "บทวิเคราะห์โบรกเกอร์",
    },
    url: "https://www.bualuang.co.th/en/tools-lists/tools/bls-research",
  },
  {
    id: "kasikorn-securities-research",
    label: "KS Research",
    type: {
      en: "Broker research",
      th: "บทวิเคราะห์โบรกเกอร์",
    },
    url: "https://www.kasikornsecurities.com/en/research/read_research",
  },
  {
    id: "yuanta-research",
    label: "Yuanta Research",
    type: {
      en: "Broker research",
      th: "บทวิเคราะห์โบรกเกอร์",
    },
    url: "https://www.yuanta.co.th/en/page/research/",
  },
  {
    id: "pi-research",
    label: "Pi Research",
    type: {
      en: "Broker strategy",
      th: "กลยุทธ์โบรกเกอร์",
    },
    url: "https://www.pi.financial/en/research",
  },
];

