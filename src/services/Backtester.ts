import type { ClientInterface, TradingBotNode } from "../types/types";
import { OhlcCache } from './OhlcCache'
import { IndicatorCache } from './IndicatorCache'
import dayjs, { type Dayjs } from "dayjs";
import { Rebalancer } from "./Rebalancer";
import { Interpreter } from "./Interpreter";
import { Parser } from "./Parser"
import type { BacktestConfig } from "../api/schemas/CreateBacktestRequest";
import { BacktestMetricsService, type BacktestMetrics } from "./BacktestMetricsService";
import { PreCalcCache } from "./PreCalcCache";

export type AllocationResult = { 
    date: string,
    value: number,
    tickers: {
        [key: string]: number | null
    }
}

export type BacktestResults = {
    date_from?: string,
    date_to?: string,
    starting_balance?: number
    ending_balance?: number,
    history?: AllocationResult[]
    ticker_start_dates?: { [key: string]: string }
    metrics?: BacktestMetrics
}

export class Backtester {
    private client: ClientInterface
    private ohlcCache?: OhlcCache
    private indicatorCache?: IndicatorCache
    private preCaclCache?: PreCalcCache

    private backtestMetricsService: BacktestMetricsService
    
    private allocationResults: AllocationResult[] = []
    private backtestResults: BacktestResults = {}

    private tickerStartDates: Record<string, string> = {}

    constructor(client: ClientInterface) {
        this.client = client
        this.backtestMetricsService = new BacktestMetricsService()
    }

    async run(backtestConfig: BacktestConfig): Promise<BacktestResults> {
        const parser = new Parser()

        const { 
            assets, 
            tradeableAssets, 
            indicators,
            preCalcs,
            largestWindow
        } = parser.parse(backtestConfig.trading_bot as TradingBotNode)

        console.log('largestWindow:', largestWindow)

        let fromDate = dayjs(backtestConfig.start_date)
        let toDate = dayjs(backtestConfig.end_date)
        let dates

        this.ohlcCache = new OhlcCache(this.client, assets, largestWindow)
        dates = await this.ohlcCache.load(fromDate, toDate)
        
        fromDate = this.getNextMarketDate(dates.fromDate)
        toDate = this.getLastMarketDate(dates.toDate)

        if (!this.ohlcCache.isLoaded()) {
            throw new Error('OHLC cache has not been initialized.')
        }

        this.indicatorCache = new IndicatorCache(this.ohlcCache, indicators)
        dates = await this.indicatorCache.load(fromDate, toDate)
        fromDate = dates.fromDate
        toDate = dates.toDate

        if (!this.indicatorCache.isLoaded()) {
            throw new Error('Indicator cache has not been initialized.')
        }

        this.preCaclCache = new PreCalcCache(
            this.ohlcCache, 
            this.indicatorCache, 
            tradeableAssets,
            preCalcs, 
            fromDate, 
            toDate, 
            backtestConfig.starting_balance
        )
        dates = await this.preCaclCache.load(fromDate, toDate)
        fromDate = dates.fromDate
        toDate = dates.toDate
        
        if (!this.preCaclCache.isLoaded()) {
            throw new Error('PreCalc cache has not been initialized.')
        }

        this.backtestResults.date_from = fromDate.format('YYYY-MM-DD')
        this.backtestResults.date_to = toDate.format('YYYY-MM-DD')
        this.backtestResults.ticker_start_dates = this.tickerStartDates
        
        const interpreter = new Interpreter(this.indicatorCache, this.preCaclCache, tradeableAssets)
        const rebalancer = new Rebalancer(this.ohlcCache, backtestConfig.starting_balance)

        let currentDate = fromDate.clone()

        while (currentDate <= toDate) {
            // Calculate allocations for date
            const allocations = interpreter.evaluate(
                backtestConfig.trading_bot as TradingBotNode, 
                this.indicatorCache, 
                currentDate
            )
            
            rebalancer.rebalance(currentDate.format('YYYY-MM-DD'), allocations)

            this.allocationResults.push({
                date: currentDate.format('YYYY-MM-DD'),
                tickers: allocations,
                value: rebalancer.getBalance()
            })

            if (currentDate.isSame(toDate)) {
                break
            }

            currentDate = this.getNextMarketDate(currentDate)
        }

        this.backtestResults.starting_balance = backtestConfig.starting_balance
        this.backtestResults.ending_balance = rebalancer.getBalance()
        this.backtestResults.metrics = this.backtestMetricsService.getMetrics(
            backtestConfig.starting_balance,
            rebalancer.getBalance(),
            this.allocationResults
        )

        if (backtestConfig.include.history) {
            this.backtestResults.history = this.allocationResults
        }

        return this.backtestResults
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