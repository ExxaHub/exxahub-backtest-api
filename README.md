# mainsail

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Roadmap

- Supported Data providers
    - [x] Alpaca
    - [x] Tiingo
    - [x] Polygon.io
    - [ ] AlphaVantage
- Supported indicators
    - [x] Current Price
        - [ ] Unit tests
    - [x] Cumulative Return
        - [x] Unit tests
    - [x] Exponential Moving Average of Price
        - [x] Unit tests
    - [x] Max Drawdown
        - [x] Unit tests
    - [x] Moving Average of Price
        - [x] Unit tests
    - [x] Moving Average of Return
        - [x] Unit tests
    - [x] Relative Strength Index
        - [x] Unit tests
    - [x] Standard Deviation of Price
        - [x] Unit tests
    - [x] Standard Deviation of Return
        - [x] Unit tests
    - [x] Fixed values
        - [x] Unit tests
- General Improvements
    - [ ] Convert composer JSON to standardized trading bot JSON
    - [ ] Include branching history
    - [ ] Include detailed log from each daily rebalance that shows which conditions fired and what their values were at the time of trading
- Backtesting
    - Calculate metrics
        - [ ] Cumulative Return
        - [ ] Annualized Return
        - [ ] Tailing 1 Month Return
        - [ ] Tailing 3 Month Return
        - [ ] Sharpe Ratio
        - [ ] Calmer Ratio
        - [ ] Standard Deviation
        - [ ] Max Drawdown
- Better error description when algo fails
- Backend
    - Algo management
    - Asset management
    - OHLC management
    - Market hours
    - Account management
- UI
    - Account management
    - Portfolio page
    - Algo editor
    - Algo correlation
