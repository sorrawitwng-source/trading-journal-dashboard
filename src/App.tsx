import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AiSummaryPage } from "./components/AiSummaryPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { HoldingsTable, type HoldingRow } from "./components/HoldingsTable";
import { NewsScannerPage } from "./components/NewsScannerPage";
import { PerformanceChart } from "./components/PerformanceChart";
import { PositionForm } from "./components/PositionForm";
import { StockIdeasPage } from "./components/StockIdeasPage";
import { StockScanPage } from "./components/StockScanPage";
import { SummaryStrip } from "./components/SummaryStrip";
import { TopBar, type AppTheme, type AppView } from "./components/TopBar";
import { benchmarkSeries } from "./data/benchmarks";
import { stockUniverse } from "./data/stocks";
import { combinedChartSeries } from "./lib/benchmarks";
import {
  convertCurrency,
  createPosition,
  fallbackUsdThbRate,
  positionCurrency,
  positionExitPrice,
  summarizePortfolio,
  unrealizedProfitLoss,
  updatePosition,
} from "./lib/portfolio";
import {
  loadUsdThbRate,
  refreshPositionPrices,
  refreshUsdThbRate,
} from "./lib/marketData";
import { loadStoredPositions, saveStoredPositions } from "./lib/positionsStorage";
import {
  displayDateString,
  todayDateString,
  validatePositionInput,
} from "./lib/validation";
import type { Currency, MarketFilter, PortfolioPosition, PriceStatus } from "./types";

type Theme = AppTheme;
type Language = "en" | "th";
type EditDraft = {
  buyDate: string;
  buyPrice: string;
  errors: {
    buyDate?: string;
    symbol?: string;
    buyPrice?: string;
    quantity?: string;
    sellDate?: string;
    sellPrice?: string;
    stopLoss?: string;
    targetPrice?: string;
  };
  emotion: string;
  id: string;
  quantity: string;
  sellDate: string;
  sellPrice: string;
  stopLoss: string;
  strategyTag: string;
  symbol: string;
  targetPrice: string;
  tradeNote: string;
  tradeReason: string;
};

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");
  const [baseCurrency, setBaseCurrency] = useState<Currency>("THB");
  const [activeView, setActiveView] = useState<AppView>("portfolio");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("All");
  const [positions, setPositions] = useState<PortfolioPosition[]>(() =>
    loadStoredPositions(),
  );
  const [formErrors, setFormErrors] = useState<{
    buyDate?: string;
    symbol?: string;
    buyPrice?: string;
    quantity?: string;
    sellDate?: string;
    sellPrice?: string;
    stopLoss?: string;
    targetPrice?: string;
  }>({});
  const [symbol, setSymbol] = useState("");
  const [buyDate, setBuyDate] = useState(displayDateString(todayDateString()));
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [stopLoss, setStopLoss] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [strategyTag, setStrategyTag] = useState("");
  const [tradeReason, setTradeReason] = useState("");
  const [tradeNote, setTradeNote] = useState("");
  const [emotion, setEmotion] = useState("");
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<string | null>(null);
  const cachedExchangeRate = loadUsdThbRate();
  const [usdThbRate, setUsdThbRate] = useState(
    cachedExchangeRate?.rate ?? fallbackUsdThbRate,
  );
  const [fxStatus, setFxStatus] = useState<PriceStatus>(
    cachedExchangeRate?.status ?? "fallback",
  );
  const [fxUpdatedAt, setFxUpdatedAt] = useState<string | null>(
    cachedExchangeRate?.fetchedAt ?? null,
  );
  const [priceRefreshError, setPriceRefreshError] = useState<string | null>(null);

  useEffect(() => {
    saveStoredPositions(positions);
  }, [positions]);

  const portfolioSummary = useMemo(
    () => summarizePortfolio(positions, { baseCurrency, usdThbRate }),
    [baseCurrency, positions, usdThbRate],
  );
  const chartSeries = useMemo(
    () =>
      combinedChartSeries(positions, benchmarkSeries, {
        baseCurrency,
        usdThbRate,
      }),
    [baseCurrency, positions, usdThbRate],
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
          positionExitPrice(position),
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
          baseCost: convertCurrency(
            position.buyPrice * position.quantity,
            positionCurrency(position),
            baseCurrency,
            usdThbRate,
          ),
          baseCurrentValue: convertCurrency(
            positionExitPrice(position) * position.quantity,
            positionCurrency(position),
            baseCurrency,
            usdThbRate,
          ),
          baseProfitLossAmount: convertCurrency(
            profitLoss.amount,
            positionCurrency(position),
            baseCurrency,
            usdThbRate,
          ),
          cost: position.buyPrice * position.quantity,
          currentValue: positionExitPrice(position) * position.quantity,
          profitLossAmount: profitLoss.amount,
          profitLossPercent: profitLoss.percent,
          tone,
        };
      }),
    [baseCurrency, positions, usdThbRate],
  );

  useEffect(() => {
    void handleRefreshExchangeRate();
  }, []);

  useEffect(() => {
    if (!refreshablePositionKey) {
      return;
    }

    void handleRefreshPrices(positions);
  }, [refreshablePositionKey]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validatePositionInput(
      symbol,
      buyPrice,
      quantity,
      buyDate,
      "",
      "",
      stopLoss,
      targetPrice,
      strategyTag,
      tradeReason,
      tradeNote,
      emotion,
    );

    if (!result.valid) {
      setFormErrors(result.errors);
      return;
    }

    const position = createPosition(
      result.value.symbol,
      result.value.buyPrice,
      result.value.quantity,
      stockUniverse,
      {
        buyDate: result.value.buyDate,
        journal: {
          emotion: result.value.emotion,
          stopLoss: result.value.stopLoss,
          strategyTag: result.value.strategyTag,
          targetPrice: result.value.targetPrice,
          tradeNote: result.value.tradeNote,
          tradeReason: result.value.tradeReason,
        },
      },
    );

    setPositions((currentPositions) => [...currentPositions, position]);
    setFormErrors({});
    setSymbol("");
    setBuyDate(displayDateString(todayDateString()));
    setBuyPrice("");
    setQuantity("0");
    setStopLoss("");
    setTargetPrice("");
    setStrategyTag("");
    setTradeReason("");
    setTradeNote("");
    setEmotion("");
  }

  function handleEditStart(row: HoldingRow) {
    setEditDraft({
      buyDate: displayDateString(row.buyDate),
      buyPrice: String(row.buyPrice),
      emotion: row.emotion ?? "",
      errors: {},
      id: row.id,
      quantity: String(row.quantity),
      sellDate: row.sellDate ? displayDateString(row.sellDate) : "",
      sellPrice: row.sellPrice === undefined ? "" : String(row.sellPrice),
      stopLoss: row.stopLoss === undefined ? "" : String(row.stopLoss),
      strategyTag: row.strategyTag ?? "",
      symbol: row.symbol,
      targetPrice: row.targetPrice === undefined ? "" : String(row.targetPrice),
      tradeNote: row.tradeNote ?? "",
      tradeReason: row.tradeReason ?? "",
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

  function handleEditBuyDateChange(buyDateValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, buyDate: buyDateValue } : currentDraft,
    );
  }

  function handleEditQuantityChange(quantityValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft
        ? { ...currentDraft, quantity: quantityValue }
        : currentDraft,
    );
  }

  function handleEditSellPriceChange(sellPriceValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft
        ? { ...currentDraft, sellPrice: sellPriceValue }
        : currentDraft,
    );
  }

  function handleEditSellDateChange(sellDateValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, sellDate: sellDateValue } : currentDraft,
    );
  }

  function handleEditStopLossChange(stopLossValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, stopLoss: stopLossValue } : currentDraft,
    );
  }

  function handleEditTargetPriceChange(targetPriceValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, targetPrice: targetPriceValue } : currentDraft,
    );
  }

  function handleEditStrategyTagChange(strategyTagValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, strategyTag: strategyTagValue } : currentDraft,
    );
  }

  function handleEditTradeReasonChange(tradeReasonValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, tradeReason: tradeReasonValue } : currentDraft,
    );
  }

  function handleEditTradeNoteChange(tradeNoteValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, tradeNote: tradeNoteValue } : currentDraft,
    );
  }

  function handleEditEmotionChange(emotionValue: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, emotion: emotionValue } : currentDraft,
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
      editDraft.buyDate,
      editDraft.sellPrice,
      editDraft.sellDate,
      editDraft.stopLoss,
      editDraft.targetPrice,
      editDraft.strategyTag,
      editDraft.tradeReason,
      editDraft.tradeNote,
      editDraft.emotion,
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
              {
                buyDate: result.value.buyDate,
                journal: {
                  emotion: result.value.emotion,
                  stopLoss: result.value.stopLoss,
                  strategyTag: result.value.strategyTag,
                  targetPrice: result.value.targetPrice,
                  tradeNote: result.value.tradeNote,
                  tradeReason: result.value.tradeReason,
                },
                sellDate: result.value.sellDate,
                sellPrice: result.value.sellPrice,
              },
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
      const refreshedExchangeRate = await refreshUsdThbRate();

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
      setUsdThbRate(refreshedExchangeRate.rate);
      setFxStatus(refreshedExchangeRate.status);
      setFxUpdatedAt(refreshedExchangeRate.fetchedAt);
      setLastPriceUpdate(new Date().toISOString());
    } catch {
      setPriceRefreshError("Could not refresh prices right now.");
    } finally {
      setIsRefreshingPrices(false);
    }
  }

  async function handleRefreshExchangeRate() {
    const refreshedExchangeRate = await refreshUsdThbRate();

    setUsdThbRate(refreshedExchangeRate.rate);
    setFxStatus(refreshedExchangeRate.status);
    setFxUpdatedAt(refreshedExchangeRate.fetchedAt);
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <div className="dashboard">
        <TopBar
          activeView={activeView}
          baseCurrency={baseCurrency}
          language={language}
          marketFilter={marketFilter}
          onBaseCurrencyChange={setBaseCurrency}
          onLanguageToggle={() =>
            setLanguage((currentLanguage) =>
              currentLanguage === "en" ? "th" : "en",
            )
          }
          onMarketFilterChange={setMarketFilter}
          onThemeChange={setTheme}
          onViewChange={setActiveView}
          theme={theme}
        />

        {activeView === "portfolio" ? (
          <>
            <SummaryStrip
              averageScore={portfolioSummary.averageScore}
              baseCurrency={baseCurrency}
              fxStatus={fxStatus}
              fxUpdatedAt={fxUpdatedAt}
              language={language}
              totalCost={portfolioSummary.totalCost}
              totalProfitLoss={portfolioSummary.totalProfitLoss}
              totalProfitLossPercent={portfolioSummary.totalProfitLossPercent}
              totalValue={portfolioSummary.totalValue}
              usdThbRate={usdThbRate}
            />

            <div className="portfolio-workspace">
              <PositionForm
                buyDate={buyDate}
                buyPrice={buyPrice}
                errors={formErrors}
                language={language}
                onBuyDateChange={setBuyDate}
                onBuyPriceChange={setBuyPrice}
                onEmotionChange={setEmotion}
                onQuantityChange={setQuantity}
                onStopLossChange={setStopLoss}
                onStrategyTagChange={setStrategyTag}
                onSubmit={handleSubmit}
                onSymbolChange={setSymbol}
                onTargetPriceChange={setTargetPrice}
                onTradeNoteChange={setTradeNote}
                onTradeReasonChange={setTradeReason}
                quantity={quantity}
                emotion={emotion}
                stopLoss={stopLoss}
                strategyTag={strategyTag}
                symbol={symbol}
                targetPrice={targetPrice}
                tradeNote={tradeNote}
                tradeReason={tradeReason}
              />
              <div className="portfolio-main-column">
                <PerformanceChart series={chartSeries} />
                <HoldingsTable
                  baseCurrency={baseCurrency}
                  editDraft={editDraft}
                  isRefreshingPrices={isRefreshingPrices}
                  language={language}
                  lastPriceUpdate={lastPriceUpdate}
                  onEditBuyDateChange={handleEditBuyDateChange}
                  onEditBuyPriceChange={handleEditBuyPriceChange}
                  onEditCancel={handleEditCancel}
                  onEditQuantityChange={handleEditQuantityChange}
                  onEditSellDateChange={handleEditSellDateChange}
                  onEditSellPriceChange={handleEditSellPriceChange}
                  onEditSave={handleEditSave}
                  onEditStart={handleEditStart}
                  onEditStopLossChange={handleEditStopLossChange}
                  onEditStrategyTagChange={handleEditStrategyTagChange}
                  onEditSymbolChange={handleEditSymbolChange}
                  onEditTargetPriceChange={handleEditTargetPriceChange}
                  onEditTradeNoteChange={handleEditTradeNoteChange}
                  onEditTradeReasonChange={handleEditTradeReasonChange}
                  onEditEmotionChange={handleEditEmotionChange}
                  onDelete={handleDeletePosition}
                  onRefreshPrices={() => void handleRefreshPrices()}
                  priceRefreshError={priceRefreshError}
                  rows={holdingRows}
                />
              </div>
            </div>
          </>
        ) : activeView === "analytics" ? (
          <AnalyticsPage
            baseCurrency={baseCurrency}
            language={language}
            positions={positions}
            usdThbRate={usdThbRate}
          />
        ) : activeView === "ideas" ? (
          <StockIdeasPage language={language} marketFilter={marketFilter} />
        ) : activeView === "scan" ? (
          <StockScanPage language={language} marketFilter={marketFilter} />
        ) : activeView === "ai" ? (
          <AiSummaryPage
            baseCurrency={baseCurrency}
            language={language}
            marketFilter={marketFilter}
            positions={positions}
          />
        ) : (
          <NewsScannerPage language={language} marketFilter={marketFilter} />
        )}
      </div>
    </main>
  );
}

export default App;
