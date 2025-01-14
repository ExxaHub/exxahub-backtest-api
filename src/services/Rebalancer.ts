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

const INITIAL_PORTFOLIO_VALUE = 10_000

export class Rebalancer {
    private ohlcCache: OhlcCache
    private initialPortfolioValue: number
    private portfolioValue: number
    private currentHoldings: Holdings = {}
    private balanceHistory: number[] = []

    constructor(ohlcCache: OhlcCache, portfolioValue?: number) {
        this.ohlcCache = ohlcCache
        this.initialPortfolioValue = portfolioValue ?? INITIAL_PORTFOLIO_VALUE
        this.portfolioValue = this.initialPortfolioValue
    }

    getCurrentHoldings(): Holdings {
        return this.currentHoldings
    }

    setCurrentHoldings(holdings: Holdings): void {
        this.currentHoldings = holdings
    }

    getBalance(): number {
        return parseFloat(this.portfolioValue.toFixed(2))
    }

    getBalanceHistory(): number[] {
        return this.balanceHistory
    }

    setPortfolioValue(value: number): void {
        this.portfolioValue = value
        this.balanceHistory.push(this.portfolioValue)
    }

    rebalance(date: string, newAllocations: Allocations): void {
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

    private updatePortfolioValue(date: string): void {
        if (Object.keys(this.currentHoldings).length === 0) {
            this.setPortfolioValue(this.initialPortfolioValue)
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

    private getTickerPriceOnDate(ticker: string, date: string): number {
        const bar = this.ohlcCache.getBarForDate(ticker, date)
        if (!bar) {
            throw new Error('No bar available to update holdings')
        }
        return bar.close
    }
}