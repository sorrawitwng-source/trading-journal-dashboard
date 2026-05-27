import { useEffect, useMemo, useState } from "react";
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
import {
  createPosition,
  summarizePortfolio,
  unrealizedProfitLoss,
  updatePosition,
} from "./lib/portfolio";
import { refreshPositionPrices } from "./lib/marketData";
import { loadStoredPositions, saveStoredPositions } from "./lib/positionsStorage";
import { rankRecommendations } from "./lib/scoring";
import { validatePositionInput } from "./lib/validation";
import type { MarketFilter, PortfolioPosition } from "./types";

type Theme = "dark" | "light";
type EditDraft = {
  buyPrice: string;
  errors: { symbol?: string; buyPrice?: string };
  id: string;
  symbol: string;
};

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("All");
  const [positions, setPositions] = useState<PortfolioPosition[]>(() =>
    loadStoredPositions(),
  );
  const [formErrors, setFormErrors] = useState<{ symbol?: string; buyPrice?: string }>({});
  const [symbol, setSymbol] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<string | null>(null);
  const [priceRefreshError, setPriceRefreshError] = useState<string | null>(null);

  useEffect(() => {
    saveStoredPositions(positions);
  }, [positions]);

  const portfolioSummary = useMemo(() => summarizePortfolio(positions), [positions]);
  const recommendations = useMemo(
    () => rankRecommendations(stockUniverse, marketFilter).slice(0, 6),
    [marketFilter],
  );
  const chartSeries = useMemo(
    () => combinedChartSeries(positions, benchmarkSeries),
    [positions],
  );
  const refreshablePositionKey = useMemo(
    () =>
      positions
        .map((position) =>
          [
            position.id,
            position.symbol,
            position.market,
            position.isCustom ? "custom" : "listed",
          ].join(":"),
        )
        .join("|"),
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

  useEffect(() => {
    if (!refreshablePositionKey) {
      return;
    }

    void handleRefreshPrices(positions);
  }, [refreshablePositionKey]);

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

  function handleEditStart(row: HoldingRow) {
    setEditDraft({
      buyPrice: String(row.buyPrice),
      errors: {},
      id: row.id,
      symbol: row.symbol,
    });
  }

  function handleEditCancel() {
    setEditDraft(null);
  }

  function handleEditSymbolChange(symbolValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, symbol: symbolValue } : currentDraft,
    );
  }

  function handleEditBuyPriceChange(buyPriceValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft
        ? { ...currentDraft, buyPrice: buyPriceValue }
        : currentDraft,
    );
  }

  function handleEditSave() {
    if (!editDraft) {
      return;
    }

    const result = validatePositionInput(editDraft.symbol, editDraft.buyPrice);

    if (!result.valid) {
      setEditDraft({ ...editDraft, errors: result.errors });
      return;
    }

    setPositions((currentPositions) =>
      currentPositions.map((position) =>
        position.id === editDraft.id
          ? updatePosition(
              editDraft.id,
              result.value.symbol,
              result.value.buyPrice,
              stockUniverse,
            )
          : position,
      ),
    );
    setEditDraft(null);
  }

  async function handleRefreshPrices(positionSnapshot = positions) {
    if (positionSnapshot.length === 0 || isRefreshingPrices) {
      return;
    }

    setIsRefreshingPrices(true);
    setPriceRefreshError(null);

    try {
      const refreshedPositions = await refreshPositionPrices(positionSnapshot);

      setPositions((currentPositions) =>
        currentPositions.map((currentPosition) => {
          const refreshedPosition = refreshedPositions.find(
            (position) =>
              position.id === currentPosition.id &&
              position.symbol === currentPosition.symbol &&
              position.market === currentPosition.market,
          );

          return refreshedPosition ?? currentPosition;
        }),
      );
      setLastPriceUpdate(new Date().toISOString());
    } catch {
      setPriceRefreshError("Could not refresh prices right now.");
    } finally {
      setIsRefreshingPrices(false);
    }
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
          <HoldingsTable
            editDraft={editDraft}
            isRefreshingPrices={isRefreshingPrices}
            lastPriceUpdate={lastPriceUpdate}
            onEditBuyPriceChange={handleEditBuyPriceChange}
            onEditCancel={handleEditCancel}
            onEditSave={handleEditSave}
            onEditStart={handleEditStart}
            onEditSymbolChange={handleEditSymbolChange}
            onRefreshPrices={() => void handleRefreshPrices()}
            priceRefreshError={priceRefreshError}
            rows={holdingRows}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
