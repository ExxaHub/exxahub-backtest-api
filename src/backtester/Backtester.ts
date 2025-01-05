import type { Symphony, ClientInterface, TradingBotNode } from "./types";
import { OhlcCache } from './OhlcCache'
import { IndicatorCache } from './IndicatorCache'
import dayjs, { type Dayjs } from "dayjs";
import { Rebalancer } from "./Rebalancer";
import { toCurrency } from "./Utils";
import { Interpreter } from "./Interpreter";
import { Parser } from "./Parser"
import type { BacktestConfig } from "../api/schemas/CreateBacktestRequest";

type BacktestResults = {
    date_from?: string,
    date_to?: string,
    starting_balance?: number
    ending_balance?: number,
    allocation_history?: { [key: string]: string | number | null }[]
    balance_history?: number[]
    ticker_start_dates?: { [key: string]: string }
}

export class Backtester {
    private client: ClientInterface
    private ohlcCache?: OhlcCache
    private indicatorCache?: IndicatorCache
    private tradeableAssets?: string[]

    private defaultBacktestStartDate: string
    private defaultBacktestEndDate: string
    
    private allocationResults: { [key: string]: string | number | null }[] = []
    private backtestResults: BacktestResults = {}

    private tickerStartDates: Record<string, string> = {}

    private startingBalance = 10000

    constructor(client: ClientInterface) {
        this.client = client

        this.defaultBacktestStartDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD')
        this.defaultBacktestEndDate = dayjs().format('YYYY-MM-DD')
    }

    async run(backtestConfig: BacktestConfig): Promise<BacktestResults> {
        await this.loadData(backtestConfig)

        if (!this.indicatorCache) {
            throw new Error('Indicator cache has not been initialized.')
        }

        if (!this.ohlcCache) {
            throw new Error('OHLC cache has not been initialized.')
        }

        if (!this.tradeableAssets) {
            throw new Error('Tradable assets cache has not been initialized.')
        }
        
        // Iterate over each day starting from the backtest start date
        let fromDate = this.calculateBacktestStartDate(backtestConfig.start_date)
        let currentDate = fromDate.clone()
        let toDate = this.getLastMarketDate(backtestConfig.end_date ? dayjs(backtestConfig.end_date) : dayjs(this.defaultBacktestEndDate))

        this.backtestResults.date_from = fromDate.format('YYYY-MM-DD')
        this.backtestResults.date_to = toDate.format('YYYY-MM-DD')
        this.backtestResults.ticker_start_dates = this.tickerStartDates
        
        const interpreter = new Interpreter(this.indicatorCache, this.tradeableAssets)
        const rebalancer = new Rebalancer(this.ohlcCache, this.startingBalance)

        while (currentDate <= toDate) {
            // Calculate allocations for date
            const allocations = interpreter.evaluate(
                backtestConfig.trading_bot as TradingBotNode, 
                this.indicatorCache, 
                currentDate
            )
            
            this.allocationResults.push({
                date: currentDate.format('YYYY-MM-DD'),
                ...allocations
            })

            rebalancer.rebalance(currentDate, allocations)

            if (currentDate.isSame(toDate)) {
                break
            }

            currentDate = this.getNextMarketDate(currentDate)
        }

        this.backtestResults.starting_balance = this.startingBalance
        this.backtestResults.ending_balance = rebalancer.getBalance()
        this.backtestResults.balance_history = rebalancer.getBalanceHistory()
        this.backtestResults.allocation_history = this.allocationResults

        return this.backtestResults
    }

    async loadData(backtestConfig: BacktestConfig): Promise<void> {
        const parser = new Parser()

        const { assets, tradeableAssets, indicators } = parser.parse(backtestConfig.trading_bot as TradingBotNode)

        this.tradeableAssets = tradeableAssets

        this.ohlcCache = new OhlcCache(this.client, assets)
        await this.ohlcCache.load()

        this.indicatorCache = new IndicatorCache(this.ohlcCache, indicators)
        await this.indicatorCache.load()
    }

    private calculateBacktestStartDate(backtestConfigStartDate?: string): Dayjs {
        if (!this.ohlcCache || !this.ohlcCache.isLoaded()) {
            throw new Error('OHLC data has not been loaded.')
        }

        if (!this.indicatorCache || !this.indicatorCache.isLoaded()) {
            throw new Error('Indicator data has not been loaded.')
        }

        const tickers = this.ohlcCache.getTickers()

        let earlieststartDate = backtestConfigStartDate ? dayjs(backtestConfigStartDate) : dayjs(this.defaultBacktestStartDate)
        let earliestStartDateTicker = undefined
        let limitedByTicker = false

        for (const ticker of tickers) {
            const bars = this.ohlcCache.getBars(ticker)
            const tickerStartDate = dayjs(bars[0].date)
            
            this.tickerStartDates[ticker] = tickerStartDate.format('YYYY-MM-DD')

            if (tickerStartDate > earlieststartDate) {
                earlieststartDate = tickerStartDate
                earliestStartDateTicker = ticker
                limitedByTicker = true
            }    
        }

        if (limitedByTicker) {
            earlieststartDate = earlieststartDate.add(this.indicatorCache.getLargestWindow(), 'days')
        }

        let startDate = this.getNextMarketDate(earlieststartDate)

        return startDate
    }

    private getNextMarketDate(date: Dayjs): Dayjs {
        if (!this.ohlcCache) {
            throw new Error('ohlcCache not loaded.')
        }

        do {
            date = date.add(1, 'day')
        } while (!this.ohlcCache.hasBarsForDate(date))

        return date
    }

    private getLastMarketDate(date: Dayjs): Dayjs {
        if (!this.ohlcCache) {
            throw new Error('ohlcCache not loaded.')
        }

        do {
            date = date.subtract(1, 'day')
        } while (!this.ohlcCache.hasBarsForDate(date))

        return date
    }
}