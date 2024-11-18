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
    - [ ] Cumulative Return
        - [ ] Unit tests
    - [ ] Exponential Moving Average of Price
        - [ ] Unit tests
    - [ ] Max Drawdown
        - [ ] Unit tests
    - [x] Moving Average of Price
        - [ ] Unit tests
    - [ ] Moving Average of Return
        - [ ] Unit tests
    - [x] Relative Strength Index
        - [x] Unit tests
    - [ ] Standard Deviation of Price
        - [ ] Unit tests
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
