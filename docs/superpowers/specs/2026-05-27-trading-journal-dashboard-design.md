# Trading Journal Dashboard Design

## Goal

Build a single-page trading journal web app for Thai and US stocks. The app lets a user enter only a stock symbol and buy price, then immediately shows the position in a clean, professional dashboard inspired by TradingView.

The first version uses mock data only. It should look and feel production-ready while keeping the implementation simple enough to replace mock data with real market APIs later.

## Scope

### Included

- Single-page dashboard UI.
- Stock entry form with symbol and buy price.
- Portfolio holdings table.
- Mock current prices and stock metrics for Thai and US stocks.
- Mock benchmark comparison against well-known funds or indexes.
- Recommendation panel with ranked investment ideas.
- Dark mode and light mode toggle in the top-right corner.
- Frontend-only state management.
- Validation and empty states.
- Focused tests for core portfolio and scoring logic.

### Not Included

- Login or user accounts.
- Database persistence.
- Real-time prices.
- Broker integration.
- Real financial advice.
- Paid data provider integration.

## UI Design

The product is a single-page professional trading dashboard.

### Top Bar

- App name.
- Market selector: `Thai`, `US`, `All`.
- Dark/light mode toggle in the top-right corner.

### Entry Area

- Symbol input.
- Buy price input.
- Add position button.
- Inline validation messages below the inputs.

### Main Content

- Performance chart comparing the portfolio with benchmarks.
- Portfolio summary metrics such as total cost, estimated value, total P/L, and average score.
- Recommendation panel on the right side with ranked stocks and short explanations.

### Holdings Table

Each row shows:

- Symbol.
- Company name or custom label.
- Market.
- Sector.
- Buy price.
- Mock current price.
- Estimated P/L.
- Recommendation score.
- Risk level.

### Visual Direction

The interface should feel like a cleaner, more premium version of TradingView:

- Dense enough for serious investors, but not cluttered.
- Sharp panels and restrained borders.
- Clear typography for numbers.
- Green/red P/L signals.
- Professional dark mode.
- Light mode that feels like a modern financial SaaS product.

## Data Model

### Stock Universe

Mock stocks include both Thai and US symbols. Each stock has:

- `symbol`
- `name`
- `market`
- `sector`
- `currentPrice`
- `momentum`
- `valuation`
- `volatility`
- `dividend`
- `risk`

### Portfolio Position

A portfolio position has:

- `id`
- `symbol`
- `name`
- `market`
- `sector`
- `buyPrice`
- `currentPrice`
- `score`
- `riskLevel`
- `isCustom`

### Benchmarks

The comparison chart uses mock series for:

- `SPY`
- `QQQ`
- `VTI`
- `SET50`

## User Flow

1. User opens the dashboard.
2. User enters a symbol such as `AAPL`, `NVDA`, `PTT`, or `CPALL`.
3. User enters a buy price.
4. App validates the input.
5. If the symbol is in the mock universe, the app enriches the position with mock market data.
6. If the symbol is unknown, the app adds it as a custom position with generic metadata: market `Custom`, sector `Unclassified`, current price equal to buy price, score `N/A`, and medium risk.
7. The holdings table, summary metrics, and chart update immediately.
8. Recommendations remain visible and can be filtered by selected market.

## Recommendation Logic

The app ranks stocks with a weighted score from five categories:

- Momentum.
- Valuation.
- Volatility.
- Dividend.
- Risk.

The recommendation panel shows:

- Overall score.
- Market.
- Sector.
- Risk label.
- One short explanation based on the strongest metrics.

The scoring system must be deterministic and testable. It is not financial advice; it is a mock decision-support model for the first version.

## Error Handling

- Empty symbol shows an inline validation error.
- Empty buy price shows an inline validation error.
- Non-numeric buy price shows an inline validation error.
- Buy price less than or equal to zero shows an inline validation error.
- Unknown symbols are allowed and labeled as custom positions.
- Empty portfolio shows polished empty states for the chart and table.

## Testing Strategy

Tests should cover the core logic before implementation:

- Form validation.
- Adding a known stock from the mock universe.
- Adding an unknown custom stock.
- P/L calculation.
- Recommendation score calculation.
- Recommendation sorting.
- Basic theme state behavior.

UI tests can stay light for the first version. The main risk is business logic correctness, so utility functions should be isolated and easy to test.

## Future Extension Points

- Replace mock prices with a market data API.
- Persist portfolio positions in local storage or a database.
- Add watchlists.
- Add position size and quantity.
- Add export to CSV.
- Add separate views for portfolio, benchmarks, and recommendations.
- Add real benchmark series from an API.
