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
    - [ ] Moving Average of Return
        - [ ] Unit tests
    - [x] Relative Strength Index
        - [x] Unit tests
    - [x] Standard Deviation of Price
        - [x] Unit tests
    - [ ] Standard Deviation of Return
        - [ ] Unit tests
- Backtesting
- Set start date dynamically from ETF when fetching alpaca data
- Better error description when algo fails
- Better handling of dates on weekends
- Better handling of dates when market is closed
- Calculate metrics
    - [ ] Cumulative Return
    - [ ] Annualized Return
    - [ ] Tailing 1 Month Return
    - [ ] Tailing 3 Month Return
    - [ ] Sharpe Ratio
    - [ ] Calmer Ratio
    - [ ] Standard Deviation
    - [ ] Max Drawdown
