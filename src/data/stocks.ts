import type { Market, StockProfile } from "../types";

type StockOverride = Partial<
  Pick<StockProfile, "name" | "sector" | "currentPrice"> & {
    momentum: number;
    valuation: number;
    volatility: number;
    dividend: number;
    risk: number;
  }
>;

const set100Symbols =
  "ADVANC AEONTS AMATA AOT AP AWC BA BANPU BBL BCH BCP BCPG BDMS BEM BGRIM BH BJC BLA BTG BTS CBG CENTEL CHG CK CKP COM7 CPALL CPF CPN CRC DELTA DOHOME EA EGCO ERW GLOBAL GPSC GULF GUNKUL HANA HMPRO INTUCH IRPC IVL JAS JMT KBANK KCE KKP KTB KTC LH M MBK MEGA MINT MTC OR OSP PLANB PRM PSL PTT PTTEP PTTGC RATCH RBF RCL SAWAD SCB SCC SCGP SIRI SPALI SPRC STA STEC STGT TIDLOR TISCO TKN TLI TOP TRUE TTB TU VGI WHA WHAUP AAV ACE ASK BAM BYD DITTO FORTH JMART SABUY SINGER THG TOA".split(
    " ",
  );

const sp500Symbols =
  "NVDA AAPL MSFT AMZN GOOGL GOOG AVGO META TSLA BRK.B WMT LLY JPM XOM JNJ V MA COST ORCL NFLX CVX MU ABBV PLTR BAC AMD PG CAT HD KO CSCO GE MRK AMAT LRCX MS RTX PM GS WFC UNH GEV TMUS LIN IBM INTC MCD PEP VZ AXP T C KLAC NEE AMGN TMO ABT TJX TXN CRM DIS GILD SCHW ISRG PFE BA ANET APH COP ADI DE BLK UBER UNP HON ETN LMT QCOM WELL APP DHR BKNG LOW PANW SPGI CB SYK PLD BMY ACN INTU NEM GLW PGR PH COF VRTX MDT NOW MO CME SO HCA DELL MCK SBUX DUK CMCSA CEG CRWD ADBE VRT NOC EQIX SNDK WDC GD BSX HWM WM TT CVS BX ICE STX WMB MAR FCX FDX PNC UPS MRSH PWR KKR BK ADP REGN USB JCI AMT SHW MCO CDNS SNPS CSX ORLY ABNB MMM CMI ECL SLB RCL ITW EOG EMR MDLZ KMI MSI VLO CI MNST CRH AEP PSX MPC HLT ROST AON NKE WBD CL CTAS GM RSG TDG DASH APO APD LHX NSC ELV HOOD SRE TRV OXY DLR TEL COR PCAR SPG FTNT BKR TFC O AFL CIEN CTVA OKE AJG AZO TGT MPWR D FANG TRGP ALL FAST LITE VST ETR GWW EA ADSK KEYS ZTS EXC NXPI XEL CAH AME FIX NDAQ TER PSA CARR COIN EW F IDXX URI MET COHR CVNA GRMN BDX KR DAL YUM WAB DDOG FITB HSY CMG PYPL ODFL EBAY ED PEG AIG ROK AMP CBRE DHI MSCI NUE EQT VTR PCG WEC HIG TTWO ROP XYZ CCL LYV LVS VMC KDP CCI STT MLM MCHP ADM AXON SATS ACGL SYY PRU WDAY EME RMD PAYX KVUE GEHC TPL A CPRT HBAN KMB HAL HPE IR MTB NRG IRM ATO DVN AEE DTE IBKR UAL OTIS FISV CTSH XYL VICI CBOE FE WAT DOW TPR PPL JBL IQV EXPE RJF EIX CNP TDY DOV EXR WTW BIIB CHTR STLD AWK KHC ROL VRSK DG HUBB EL ES STZ EXE CTRA NTRS CFG MTD FICO LYB ARES BG WRB Q ON CINF FIS DXCM TSCO CMS PPG SYF AVB ULTA VRSN DRI PHM RF NI TSN LH BRO EQR CHD EFX DGX DLTR LEN VLTO STE KEY L ALB OMC FSLR WSM RL HUM SW NTAP MRNA JBHT CHRW GIS TROW CPAY CF LDOS PFG IP DD EVRG BR SNA PKG EXPD INCY LUV GPN IFF LNT AMCR NVR SBAC WST ZBH WY HPQ LULU FTV PTC CSGP HOLX AKAM FFIV CNC LII BALL TKO VTRS CDW ESS TRMB TXT INVH KIM NDSN J HII PODD GPC TYL APA MAA DECK PNR IEX REG SMCI COO BBY MKC AVY HST EG ERIE HAS ALLE APTV CLX HRL BEN MAS ALGN BF.B DPZ PNW FOX FOXA GNRC DOC GEN JKHY SOLV IT SWK UDR GDDY UHS IVZ GL TTD AIZ WYNN DVA SJM ZBRA CPT PSKY AES RVTY MGM NWSA BLDR FRT AOS BAX NCLH CRL HSIC BXP TECH TAP FDS SWKS ARE MOS POOL CAG EPAM CPB NWS".split(
    " ",
  );

const nasdaq100Symbols =
  "NVDA AAPL MSFT AMZN GOOGL GOOG AVGO META TSLA WMT ASML COST NFLX MU PLTR AMD CSCO AMAT LRCX TMUS LIN INTC PEP KLAC AMGN TXN GILD ISRG ARM SHOP ADI PDD HON QCOM APP BKNG PANW INTU VRTX SBUX CMCSA CEG CRWD ADBE WDC STX MRVL MELI MAR ADP REGN CDNS SNPS CSX ORLY ABNB MDLZ MNST AEP ROST WBD CTAS DASH PCAR FTNT BKR MPWR FANG FAST EA ADSK EXC NXPI XEL FER IDXX ALNY MSTR DDOG PYPL ODFL CCEP TRI TTWO ROP KDP INSM MCHP AXON WDAY PAYX GEHC CPRT CTSH CHTR KHC VRSK DXCM ZS TEAM CSGP".split(
    " ",
  );

const thaiOverrides: Record<string, StockOverride> = {
  ADVANC: {
    name: "Advanced Info Service Public Company Limited",
    sector: "Telecommunications",
    currentPrice: 214,
    momentum: 59,
    valuation: 62,
    volatility: 32,
    dividend: 76,
    risk: 29,
  },
  AOT: {
    name: "Airports of Thailand Public Company Limited",
    sector: "Transportation",
    currentPrice: 64.75,
    momentum: 64,
    valuation: 43,
    volatility: 51,
    dividend: 12,
    risk: 48,
  },
  BDMS: {
    name: "Bangkok Dusit Medical Services Public Company Limited",
    sector: "Health Care",
    currentPrice: 28.75,
    momentum: 56,
    valuation: 55,
    volatility: 34,
    dividend: 27,
    risk: 33,
  },
  CPALL: {
    name: "CP ALL Public Company Limited",
    sector: "Consumer Staples",
    currentPrice: 59.5,
    momentum: 61,
    valuation: 49,
    volatility: 45,
    dividend: 31,
    risk: 40,
  },
  KBANK: {
    name: "Kasikornbank Public Company Limited",
    sector: "Financials",
    currentPrice: 132.5,
    momentum: 52,
    valuation: 74,
    volatility: 47,
    dividend: 63,
    risk: 45,
  },
  PTT: {
    name: "PTT Public Company Limited",
    sector: "Energy",
    currentPrice: 35.25,
    momentum: 46,
    valuation: 66,
    volatility: 39,
    dividend: 72,
    risk: 42,
  },
  PTTGC: {
    name: "PTT Global Chemical Public Company Limited",
    sector: "Petrochemicals",
    currentPrice: 23.4,
    momentum: 38,
    valuation: 57,
    volatility: 66,
    dividend: 28,
    risk: 68,
  },
};

const usOverrides: Record<string, StockOverride> = {
  AAPL: {
    name: "Apple Inc.",
    sector: "Technology",
    currentPrice: 189.72,
    momentum: 68,
    valuation: 54,
    volatility: 42,
    dividend: 18,
    risk: 38,
  },
  AMZN: {
    name: "Amazon.com, Inc.",
    sector: "Consumer Discretionary",
    currentPrice: 185.01,
    momentum: 74,
    valuation: 46,
    volatility: 48,
    dividend: 0,
    risk: 44,
  },
  ASML: {
    name: "ASML Holding",
    sector: "Semiconductors",
  },
  "BRK.B": {
    name: "Berkshire Hathaway Inc.",
    sector: "Financials",
  },
  GOOGL: {
    name: "Alphabet Inc.",
    sector: "Communication Services",
    currentPrice: 172.63,
    momentum: 70,
    valuation: 58,
    volatility: 41,
    dividend: 8,
    risk: 36,
  },
  MSFT: {
    name: "Microsoft Corporation",
    sector: "Technology",
    currentPrice: 424.31,
    momentum: 72,
    valuation: 50,
    volatility: 35,
    dividend: 22,
    risk: 31,
  },
  NVDA: {
    name: "NVIDIA Corporation",
    sector: "Semiconductors",
    currentPrice: 126.09,
    momentum: 91,
    valuation: 34,
    volatility: 73,
    dividend: 4,
    risk: 68,
  },
  TSLA: {
    name: "Tesla, Inc.",
    sector: "Automobiles",
    currentPrice: 182.58,
    momentum: 57,
    valuation: 28,
    volatility: 82,
    dividend: 0,
    risk: 79,
  },
};

export const stockUniverse: StockProfile[] = buildStockUniverse();

function buildStockUniverse(): StockProfile[] {
  const seen = new Set<string>();
  const stocks: StockProfile[] = [];

  for (const symbol of set100Symbols) {
    addStock(stocks, seen, symbol, "Thai", thaiOverrides);
  }

  for (const symbol of [...sp500Symbols, ...nasdaq100Symbols]) {
    addStock(stocks, seen, symbol, "US", usOverrides);
  }

  return stocks;
}

function addStock(
  stocks: StockProfile[],
  seen: Set<string>,
  symbol: string,
  market: Market,
  overrides: Record<string, StockOverride>,
) {
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol || seen.has(normalizedSymbol)) {
    return;
  }

  seen.add(normalizedSymbol);
  stocks.push(createStockProfile(normalizedSymbol, market, overrides[normalizedSymbol]));
}

function createStockProfile(
  symbol: string,
  market: Market,
  override: StockOverride = {},
): StockProfile {
  return {
    symbol,
    name: override.name ?? defaultName(symbol, market),
    market,
    sector: override.sector ?? "Unknown",
    sectorSource: override.sector ? "curated" : "unknown",
    currentPrice: override.currentPrice ?? 0,
    momentum: override.momentum ?? null,
    valuation: override.valuation ?? null,
    volatility: override.volatility ?? null,
    dividend: override.dividend ?? null,
    risk: override.risk ?? null,
  };
}

function defaultName(symbol: string, market: Market): string {
  return market === "Thai"
    ? `${symbol} Public Company Limited`
    : `${symbol} Corporation`;
}
