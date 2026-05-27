import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { HoldingsTable, type HoldingRow } from "./components/HoldingsTable";
import { PerformanceChart } from "./components/PerformanceChart";
import { PositionForm } from "./components/PositionForm";
import { Recommendations } from "./components/Recommendations";
import { SummaryStrip } from "./components/SummaryStrip";
import { TopBar } from "./components/TopBar";
import { benchmarkSeries } from "./data/benchmarks";
import { stockUniverse } from "./data/stocks";
import { combinedChartSeries } from "./lib/benchmarks";
import { createPosition, summarizePortfolio, unrealizedProfitLoss } from "./lib/portfolio";
import { rankRecommendations } from "./lib/scoring";
import { validatePositionInput } from "./lib/validation";
import type { MarketFilter, PortfolioPosition } from "./types";

type Theme = "dark" | "light";

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("All");
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [formErrors, setFormErrors] = useState<{ symbol?: string; buyPrice?: string }>({});
  const [symbol, setSymbol] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  const portfolioSummary = useMemo(() => summarizePortfolio(positions), [positions]);
  const recommendations = useMemo(
    () => rankRecommendations(stockUniverse, marketFilter).slice(0, 6),
    [marketFilter],
  );
  const chartSeries = useMemo(
    () => combinedChartSeries(positions, benchmarkSeries),
    [positions],
  );
  const holdingRows = useMemo<HoldingRow[]>(
    () =>
      positions.map((position) => {
        const profitLoss = unrealizedProfitLoss(
          position.buyPrice,
          position.currentPrice,
        );
        const tone: HoldingRow["tone"] =
          profitLoss.amount > 0
            ? "positive"
            : profitLoss.amount < 0
              ? "negative"
              : "neutral";

        return {
          ...position,
          profitLossAmount: profitLoss.amount,
          profitLossPercent: profitLoss.percent,
          tone,
        };
      }),
    [positions],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validatePositionInput(symbol, buyPrice);

    if (!result.valid) {
      setFormErrors(result.errors);
      return;
    }

    const position = createPosition(
      result.value.symbol,
      result.value.buyPrice,
      stockUniverse,
    );

    setPositions((currentPositions) => [...currentPositions, position]);
    setFormErrors({});
    setSymbol("");
    setBuyPrice("");
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <div className="dashboard">
        <TopBar
          marketFilter={marketFilter}
          onMarketFilterChange={setMarketFilter}
          onThemeToggle={() =>
            setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
          }
          theme={theme}
        />

        <SummaryStrip
          averageScore={portfolioSummary.averageScore}
          totalCost={portfolioSummary.totalCost}
          totalProfitLoss={portfolioSummary.totalProfitLoss}
          totalProfitLossPercent={portfolioSummary.totalProfitLossPercent}
          totalValue={portfolioSummary.totalValue}
        />

        <div className="dashboard-grid">
          <PositionForm
            buyPrice={buyPrice}
            errors={formErrors}
            onBuyPriceChange={setBuyPrice}
            onSubmit={handleSubmit}
            onSymbolChange={setSymbol}
            symbol={symbol}
          />
          <PerformanceChart series={chartSeries} />
          <Recommendations recommendations={recommendations} />
          <HoldingsTable rows={holdingRows} />
        </div>
      </div>
    </main>
  );
}

export default App;
