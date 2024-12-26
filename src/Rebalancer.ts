import { sha } from "bun";
import { type Allocations } from "./Interpreter"
import type { OhlcCache } from "./OhlcCache";
import type { Dayjs } from "dayjs"

type Holdings = {
    [key: string]: {
        percentage: number,
        shares: number,
        value: number,
    };
}

type Trade = {
    side: 'buy' | 'sell',
    ticker: string,
    sharesToTrade: number,
    newShares: number,
    newPercentage: number,
    newValue: number,
}

const DEFAULT_HOLDING = {
    percentage: 0,
    shares: 0,
    value: 0
}

const INITIAL_PORTFOLIO_VALUE = 100_000

export class Rebalancer {
    private ohlcCache: OhlcCache
    private portfolioValue: number
    private currentHoldings: Holdings = {}

    constructor(ohlcCache: OhlcCache, portfolioValue?: number) {
        this.ohlcCache = ohlcCache
        this.portfolioValue = portfolioValue ?? INITIAL_PORTFOLIO_VALUE
    }

    getCurrentHoldings(): Holdings {
        return this.currentHoldings
    }

    setCurrentHoldings(holdings: Holdings): void {
        this.currentHoldings = holdings
    }

    getPortfolioValue(): number {
        return this.portfolioValue
    }

    setPortfolioValue(value: number): void {
        this.portfolioValue = value
    }

    rebalance(date: Dayjs, newAllocations: Allocations): void {
        // update portfolio value based on current day's close
        this.updatePortfolioValue(date)
        
        // calculate new share counts based on current portfolio value
        const newHoldings = Object.fromEntries(
            Object.entries(newAllocations).map(([ticker, allocation]) => {
                const tickerPrice = this.getTickerPriceOnDate(ticker, date)
                const newTickerValue = allocation ? (allocation / 100) * this.portfolioValue : 0;
                const newShareCount = newTickerValue / tickerPrice
                return [ticker, {
                    percentage: allocation ?? 0,
                    shares: newShareCount,
                    value: newTickerValue
                }]
            })
        );

        // check new share counts against current share counts to determine if we need to sell or buy shares
        const trades: { buy: Trade[], sell: Trade[] } = {
            buy: [],
            sell: []
        }

        for (const ticker of Object.keys(newAllocations)) {
            const currentHoldingShares = this.currentHoldings[ticker]?.shares || 0

            if (newHoldings[ticker].shares > currentHoldingShares) {
                trades.buy.push({
                    side: 'buy',
                    ticker: ticker,
                    sharesToTrade: newHoldings[ticker].shares - currentHoldingShares,
                    newShares: newHoldings[ticker].shares,
                    newPercentage: newHoldings[ticker].percentage ?? 0,
                    newValue: newHoldings[ticker].value
                })
            } else if (newHoldings[ticker].shares < currentHoldingShares) {
                trades.sell.push({
                    side: 'sell',
                    ticker: ticker,
                    sharesToTrade: currentHoldingShares - newHoldings[ticker].shares,
                    newShares: newHoldings[ticker].shares,
                    newPercentage: newHoldings[ticker].percentage ?? 0,
                    newValue: newHoldings[ticker].value
                })
            }
        }

        let updatedHoldings: Holdings = Object.assign({}, this.currentHoldings)
        updatedHoldings = this.executeTrades(trades.sell, updatedHoldings)
        updatedHoldings = this.executeTrades(trades.buy, updatedHoldings)

        this.setCurrentHoldings(updatedHoldings)
    }

    executeTrades(trades: Trade[], newHoldings: Holdings): Holdings {
        for (const trade of trades) {
            if (!newHoldings[trade.ticker]) {
                newHoldings[trade.ticker] = Object.assign({}, DEFAULT_HOLDING)
            }

            // TODO: Submit trade order here

            newHoldings[trade.ticker].shares = trade.newShares
            newHoldings[trade.ticker].percentage = trade.newPercentage
            newHoldings[trade.ticker].value = trade.newValue
        }

        return newHoldings
    }

    // rebalance(date: Dayjs, newAllocations: Allocations) {
    //     // Update portfolio value based on current days close
    //     this.updatePortfolioValue(date)

    //     this.rebalance2(date, newAllocations)

    //     const buy: Allocations = {};
    //     const sell: Allocations = {};
      
    //     for (const ticker in newAllocations) {
    //       const current = this.currentHoldings[ticker] || DEFAULT_HOLDING;
    //       const updated = newAllocations[ticker];
      
    //       if (updated === null) {
    //         if (current.percentage > 0) {
    //             sell[ticker] = current.percentage;  
    //         }
    //       } else {
    //         if (updated > current.percentage) {
    //           buy[ticker] = updated - current.percentage;
    //         } else if (updated < current.percentage) {
    //           sell[ticker] = current.percentage - updated;
    //         }
    //       }
    //     }

    //     console.log({ buy, sell })

    //     // First, sell any assets
    //     for (const [ticker, percentToSell] of Object.entries(sell)) {
    //         if (!percentToSell) {
    //             throw new Error('Cannot calculate how many shares to sell.')
    //         }
            
    //         const newPercentage = (this.currentHoldings[ticker].percentage - percentToSell)

    //         let sharesToSell
    //         if (newPercentage === 0) {
    //             sharesToSell = this.currentHoldings[ticker].shares
    //         } else {
    //             sharesToSell = (percentToSell / 100) * this.currentHoldings[ticker].shares
    //         }
            
    //         const newShares = this.currentHoldings[ticker].shares - sharesToSell
    //         const newValue = newShares * this.getTickerPriceOnDate(ticker, date)

    //         this.currentHoldings[ticker] = {
    //             percentage: newPercentage,
    //             shares: newShares,
    //             value: newValue
    //         }

    //         console.log({
    //             trade: 'SELL',
    //             ticker,
    //             percentToSell: percentToSell,
    //             sharesToSell: sharesToSell,
    //             newPercentage: newPercentage,
    //             newShares: newShares,
    //             newValue: newValue
    //         })
    //     }

    //     // Then buy any new assets
    //     for (const [ticker, percentToBuy] of Object.entries(buy)) {
    //         if (!percentToBuy) {
    //             throw new Error('Cannot calculate how many shares to buy.')
    //         }

    //         if (this.currentHoldings[ticker] === undefined) {
    //             this.currentHoldings[ticker] = DEFAULT_HOLDING
    //         }

    //         const tickerPrice = this.getTickerPriceOnDate(ticker, date)
    //         const newPercentage = this.currentHoldings[ticker].percentage + percentToBuy

    //         let newShares
    //         if (this.currentHoldings[ticker].shares === 0) {
    //             newShares = (this.portfolioValue * (newPercentage / 100)) / tickerPrice
    //         } else {
    //             newShares = (1 + (percentToBuy / this.currentHoldings[ticker].percentage)) * this.currentHoldings[ticker].shares
    //         }
        
    //         const newValue = newShares * tickerPrice

    //         console.log({
    //             trade: 'BUY',
    //             ticker,
    //             percentage: newPercentage,
    //             shares: newShares,
    //             value: newValue
    //         })

    //         this.currentHoldings[ticker] = {
    //             percentage: newPercentage,
    //             shares: newShares,
    //             value: newValue
    //         }
    //     }
        
    //     // this.currentHoldings = this.updateHoldings(date, newAllocations)

    //     console.log({
    //         date: date.format('YYYY-MM-DD'),
    //         portfolioValue: this.portfolioValue,
    //         holdings: this.currentHoldings
    //     })
    // }

    private updatePortfolioValue(date: Dayjs): void {
        if (Object.keys(this.currentHoldings).length === 0) {
            this.setPortfolioValue(INITIAL_PORTFOLIO_VALUE)
            return 
        }

        let newValue = 0
        for (const [ticker, holding] of Object.entries(this.currentHoldings)) {
            const shares = holding.shares
            this.currentHoldings[ticker].value = shares * this.getTickerPriceOnDate(ticker, date)
            newValue = newValue + this.currentHoldings[ticker].value
        }
        this.setPortfolioValue(newValue)
    }

    private getTickerPriceOnDate(ticker: string, date: Dayjs): number {
        const bar = this.ohlcCache.getBarForDate(ticker, date)
        if (!bar) {
            throw new Error('No bar available to update holdings')
        }
        return bar.close
    }
}