import type { TradingBotNode } from "../types/types";
import { OhlcCache } from './OhlcCache'
import { IndicatorCache } from './IndicatorCache'
import dayjs, { type Dayjs } from "dayjs";
import { Rebalancer } from "./Rebalancer";
import { Interpreter } from "./Interpreter";
import { Parser } from "./Parser"
import type { BacktestConfig } from "../api/schemas/CreateBacktestRequest";
import { BacktestMetricsService, type BacktestMetrics } from "./BacktestMetricsService";
import { PreCalcCache } from "./PreCalcCache";
import { BacktestDateService } from "./BacktestDateService";

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
    private backtestDateService: BacktestDateService
    private ohlcCache?: OhlcCache
    private indicatorCache?: IndicatorCache
    private preCaclCache?: PreCalcCache

    private backtestMetricsService: BacktestMetricsService
    
    private allocationResults: AllocationResult[] = []
    private backtestResults: BacktestResults = {}

    private tickerStartDates: Record<string, string> = {}

    constructor() {
        this.backtestDateService = new BacktestDateService()
        this.backtestMetricsService = new BacktestMetricsService()
    }

    async run(backtestConfig: BacktestConfig): Promise<BacktestResults> {
        const parser = new Parser()

        const { 
            assets, 
            tradeableAssets, 
            indicatorAssets,
            indicators,
            preCalcs,
            largestIndicatorWindow,
            largestPreCalcWindow
        } = parser.parse(backtestConfig.trading_bot as TradingBotNode)

        const { 
            indicatorStartDate, 
            tradeableStartDate, 
            tradeableEndDate 
        } = await this.backtestDateService.calculateBacktestDates(
            backtestConfig.start_date,
            backtestConfig.end_date,
            tradeableAssets,
            indicatorAssets,
            largestIndicatorWindow,
            largestPreCalcWindow
        )

        const startDate = dayjs.unix(tradeableStartDate)
        const endDate = dayjs.unix(tradeableEndDate)

        this.ohlcCache = new OhlcCache(
            indicatorStartDate,
            tradeableStartDate,
            tradeableEndDate,
            tradeableAssets, 
            indicatorAssets
        )
        await this.ohlcCache.load()

        if (!this.ohlcCache.isLoaded()) {
            throw new Error('OHLC cache has not been initialized.')
        }

        this.indicatorCache = new IndicatorCache(this.ohlcCache, indicators)
        await this.indicatorCache.load()

        this.preCaclCache = new PreCalcCache(
            this.ohlcCache, 
            this.indicatorCache, 
            tradeableAssets,
            preCalcs, 
            startDate,
            endDate, 
            backtestConfig.starting_balance
        )
        await this.preCaclCache.load()
        
        if (!this.preCaclCache.isLoaded()) {
            throw new Error('PreCalc cache has not been initialized.')
        }

        this.backtestResults.date_from = startDate.format('YYYY-MM-DD')
        this.backtestResults.date_to = endDate.format('YYYY-MM-DD')
        this.backtestResults.ticker_start_dates = this.tickerStartDates
        
        const interpreter = new Interpreter(this.indicatorCache, this.preCaclCache, tradeableAssets)
        const rebalancer = new Rebalancer(this.ohlcCache, backtestConfig.starting_balance)

        let currentDate = startDate.clone()

        while (currentDate <= endDate) {
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

            if (currentDate.isSame(endDate)) {
                break
            }

            currentDate = this.getNextMarketDate(currentDate, true)
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

    private getNextMarketDate(date: Dayjs, skipCurrentDate = false): Dayjs {
        if (!this.ohlcCache) {
            throw new Error('ohlcCache not loaded.')
        }

        if (skipCurrentDate) {
            date = date.add(1, 'day')
        }

        while (!this.ohlcCache.hasBarsForDate(date))  {
            date = date.add(1, 'day')
        } 

        return date
    }
}