import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { HoldingsTable, type HoldingRow } from "./components/HoldingsTable";
import { PerformanceChart } from "./components/PerformanceChart";
import { PositionForm } from "./components/PositionForm";
import { StockIdeasPage } from "./components/StockIdeasPage";
import { SummaryStrip } from "./components/SummaryStrip";
import { TopBar, type AppView } from "./components/TopBar";
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
import { buildRecommendationCategories } from "./lib/recommendationCategories";
import { validatePositionInput } from "./lib/validation";
import type { MarketFilter, PortfolioPosition } from "./types";

type Theme = "dark" | "light";
type Language = "en" | "th";
type EditDraft = {
  buyPrice: string;
  errors: { symbol?: string; buyPrice?: string; quantity?: string };
  id: string;
  quantity: string;
  symbol: string;
};

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");
  const [activeView, setActiveView] = useState<AppView>("portfolio");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("All");
  const [positions, setPositions] = useState<PortfolioPosition[]>(() =>
    loadStoredPositions(),
  );
  const [formErrors, setFormErrors] = useState<{
    symbol?: string;
    buyPrice?: string;
    quantity?: string;
  }>({});
  const [symbol, setSymbol] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<string | null>(null);
  const [priceRefreshError, setPriceRefreshError] = useState<string | null>(null);

  useEffect(() => {
    saveStoredPositions(positions);
  }, [positions]);

  const portfolioSummary = useMemo(() => summarizePortfolio(positions), [positions]);
  const recommendationCategories = useMemo(
    () => buildRecommendationCategories(stockUniverse, marketFilter),
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
          position.quantity,
        );
        const tone: HoldingRow["tone"] =
          profitLoss.amount > 0
            ? "positive"
            : profitLoss.amount < 0
              ? "negative"
              : "neutral";

        return {
          ...position,
          cost: position.buyPrice * position.quantity,
          currentValue: position.currentPrice * position.quantity,
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

    const result = validatePositionInput(symbol, buyPrice, quantity);

    if (!result.valid) {
      setFormErrors(result.errors);
      return;
    }

    const position = createPosition(
      result.value.symbol,
      result.value.buyPrice,
      result.value.quantity,
      stockUniverse,
    );

    setPositions((currentPositions) => [...currentPositions, position]);
    setFormErrors({});
    setSymbol("");
    setBuyPrice("");
    setQuantity("0");
  }

  function handleEditStart(row: HoldingRow) {
    setEditDraft({
      buyPrice: String(row.buyPrice),
      errors: {},
      id: row.id,
      quantity: String(row.quantity),
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

  function handleEditQuantityChange(quantityValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft
        ? { ...currentDraft, quantity: quantityValue }
        : currentDraft,
    );
  }

  function handleEditSave() {
    if (!editDraft) {
      return;
    }

    const result = validatePositionInput(
      editDraft.symbol,
      editDraft.buyPrice,
      editDraft.quantity,
    );

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
              result.value.quantity,
              stockUniverse,
            )
          : position,
      ),
    );
    setEditDraft(null);
  }

  function handleDeletePosition(id: string) {
    setPositions((currentPositions) =>
      currentPositions.filter((position) => position.id !== id),
    );
    setEditDraft((currentDraft) =>
      currentDraft?.id === id ? null : currentDraft,
    );
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
          activeView={activeView}
          language={language}
          marketFilter={marketFilter}
          onLanguageToggle={() =>
            setLanguage((currentLanguage) =>
              currentLanguage === "en" ? "th" : "en",
            )
          }
          onMarketFilterChange={setMarketFilter}
          onThemeToggle={() =>
            setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
          }
          onViewChange={setActiveView}
          theme={theme}
        />

        {activeView === "portfolio" ? (
          <>
            <SummaryStrip
              averageScore={portfolioSummary.averageScore}
              language={language}
              totalCost={portfolioSummary.totalCost}
              totalProfitLoss={portfolioSummary.totalProfitLoss}
              totalProfitLossPercent={portfolioSummary.totalProfitLossPercent}
              totalValue={portfolioSummary.totalValue}
            />

            <div className="portfolio-workspace">
              <PositionForm
                buyPrice={buyPrice}
                errors={formErrors}
                language={language}
                onBuyPriceChange={setBuyPrice}
                onQuantityChange={setQuantity}
                onSubmit={handleSubmit}
                onSymbolChange={setSymbol}
                quantity={quantity}
                symbol={symbol}
              />
              <PerformanceChart series={chartSeries} />
            </div>

            <HoldingsTable
              editDraft={editDraft}
              isRefreshingPrices={isRefreshingPrices}
              language={language}
              lastPriceUpdate={lastPriceUpdate}
              onEditBuyPriceChange={handleEditBuyPriceChange}
              onEditCancel={handleEditCancel}
              onEditQuantityChange={handleEditQuantityChange}
              onEditSave={handleEditSave}
              onEditStart={handleEditStart}
              onEditSymbolChange={handleEditSymbolChange}
              onDelete={handleDeletePosition}
              onRefreshPrices={() => void handleRefreshPrices()}
              priceRefreshError={priceRefreshError}
              rows={holdingRows}
            />
          </>
        ) : (
          <StockIdeasPage categories={recommendationCategories} language={language} />
        )}
      </div>
    </main>
  );
}

export default App;
