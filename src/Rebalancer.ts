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

const DEFAULT_HOLDING = {
    percentage: 0,
    shares: 0,
    value: 0
}

const INITIAL_PORTFOLIO_VALUE = 10000

export class Rebalancer {
    private ohlcCache: OhlcCache
    private portfolioValue: number
    private currentHoldings: Holdings = {}

    constructor(ohlcCache: OhlcCache, portfolioValue: number = 10000) {
        this.ohlcCache = ohlcCache
        this.portfolioValue = portfolioValue
    }

    setPortfolioValue(value: number): void {
        this.portfolioValue = value
        console.log('>>>>> set this.portfolioValue', value)
    }

    rebalance(date: Dayjs, newAllocations: Allocations) {
        // Update portfolio value based on current days close
        this.updatePortfolioValue(date)

        const buy: Allocations = {};
        const sell: Allocations = {};
      
        for (const ticker in newAllocations) {
          const current = this.currentHoldings[ticker] || DEFAULT_HOLDING;
          const updated = newAllocations[ticker];
      
          if (updated === null) {
            if (current.percentage > 0) {
                sell[ticker] = current.percentage;  
            }
          } else {
            if (updated > current.percentage) {
              buy[ticker] = updated - current.percentage;
            } else if (updated < current.percentage) {
              sell[ticker] = current.percentage - updated;
            }
          }
        }

        console.log({ buy, sell })

        // First, sell any assets
        for (const [ticker, percentToSell] of Object.entries(sell)) {
            console.log('>>>> 11111')
            if (!percentToSell) {
                throw new Error('Cannot calculate how many shares to sell.')
            }
            
            const newPercentage = (this.currentHoldings[ticker].percentage - percentToSell)

            let sharesToSell
            if (newPercentage === 0) {
                sharesToSell = this.currentHoldings[ticker].shares
            } else {
                sharesToSell = (percentToSell / 100) * this.currentHoldings[ticker].shares
            }
            
            const newShares = this.currentHoldings[ticker].shares - sharesToSell
            const newValue = newShares * this.getTickerPriceOnDate(ticker, date)

            this.currentHoldings[ticker] = {
                percentage: newPercentage,
                shares: newShares,
                value: newValue
            }

            console.log({
                ticker,
                percentage: newPercentage,
                shares: newShares,
                value: newValue
            })
        }

        // Then buy any new assets
        for (const [ticker, percentToBuy] of Object.entries(buy)) {
            if (!percentToBuy) {
                throw new Error('Cannot calculate how many shares to buy.')
            }

            if (this.currentHoldings[ticker] === undefined) {
                this.currentHoldings[ticker] = DEFAULT_HOLDING
            }

            const tickerPrice = this.getTickerPriceOnDate(ticker, date)
            const newPercentage = this.currentHoldings[ticker].percentage + percentToBuy

            let newShares
            if (this.currentHoldings[ticker].shares === 0) {
                newShares = (this.portfolioValue * (newPercentage / 100)) / tickerPrice
            } else {
                newShares = (1 + (percentToBuy / this.currentHoldings[ticker].percentage)) * this.currentHoldings[ticker].shares
            }
        
            const newValue = newShares * tickerPrice

            console.log({
                ticker,
                percentage: newPercentage,
                shares: newShares,
                value: newValue
            })

            this.currentHoldings[ticker] = {
                percentage: newPercentage,
                shares: newShares,
                value: newValue
            }
        }
        
        // this.currentHoldings = this.updateHoldings(date, newAllocations)

        console.log({
            date: date.format('YYYY-MM-DD'),
            portfolioValue: this.portfolioValue,
            holdings: this.currentHoldings
        })
    }

    private updatePortfolioValue(date: Dayjs): void {
        if (Object.keys(this.currentHoldings).length === 0) {
            this.setPortfolioValue(INITIAL_PORTFOLIO_VALUE)
            return 
        }

        let newValue = 0
        for (const [ticker, holding] of Object.entries(this.currentHoldings)) {
            const shares = this.currentHoldings[ticker].shares
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