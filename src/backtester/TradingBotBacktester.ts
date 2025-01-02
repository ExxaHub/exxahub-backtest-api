import type { Symphony, ClientInterface, TradingBotNode } from "./types";
import { OhlcCache } from './OhlcCache'
import { IndicatorCache } from './IndicatorCache'
import { Parser } from './Parser'
import dayjs, { type Dayjs } from "dayjs";
import { Rebalancer } from "./Rebalancer";
import { toCurrency } from "./Utils";
import { TradingBotInterpreter } from "./TradingBotInterpreter";
import { TradingBotParser } from "./TradingBotParser";

const DEFAULT_BACKTEST_START_DATE = '1990-01-01'

type BacktestResults = {
    date_from?: string,
    date_to?: string,
    starting_balance?: number
    ending_balance?: number,
    allocation_history?: { [key: string]: string | number | null }[]
    ticker_start_dates?: { [key: string]: string }
}

export class TradingBotBacktester {
    private algorithm: TradingBotNode
    private client: ClientInterface
    private ohlcCache?: OhlcCache
    private indicatorCache?: IndicatorCache
    private tradeableAssets?: string[]

    private backtestStartDate: string
    private backtestEndDate: string
    
    private allocationResults: { [key: string]: string | number | null }[] = []
    private backtestResults: BacktestResults = {}

    private tickerStartDates: Record<string, string> = {}

    private startingBalance = 10000

    constructor(algorithm: TradingBotNode, client: ClientInterface) {
        this.algorithm = algorithm
        this.client = client

        this.backtestStartDate = DEFAULT_BACKTEST_START_DATE
        this.backtestEndDate = dayjs().format('YYYY-MM-DD')
    }

    async run(from?: string, to?: string): Promise<BacktestResults> {
        console.time("TradingBotBacktester - loadData");
        await this.loadData()
        console.timeEnd("TradingBotBacktester - loadData");

        if (!this.indicatorCache) {
            throw new Error('Indicator cache has not been initialized.')
        }

        if (!this.ohlcCache) {
            throw new Error('OHLC cache has not been initialized.')
        }

        if (!this.tradeableAssets) {
            throw new Error('Tradable assets cache has not been initialized.')
        }
        
        console.time("TradingBotBacktester - calculateBacktestStartDate");
        // TODO: Calculate minimum number of bars needed for the indicators, then move up the start date by that amount
        this.calculateBacktestStartDate()
        console.timeEnd("TradingBotBacktester - calculateBacktestStartDate");

        // Iterate over each day starting from the backtest start date
        let fromDate = from ? dayjs(from) : dayjs(this.backtestStartDate)
        let currentDate = fromDate.clone()
        let toDate = this.getLastMarketDate(to ? dayjs(to) : dayjs(this.backtestEndDate))

        this.backtestResults.date_from = fromDate.format('YYYY-MM-DD')
        this.backtestResults.date_to = toDate.format('YYYY-MM-DD')
        this.backtestResults.ticker_start_dates = this.tickerStartDates
        
        const interpreter = new TradingBotInterpreter(this.indicatorCache, this.tradeableAssets)
        const rebalancer = new Rebalancer(this.ohlcCache, this.startingBalance)

        console.time("TradingBotBacktester - while loop");
        while (currentDate <= toDate) {
            // Calculate allocations for date
            const allocations = interpreter.evaluate(this.algorithm, this.indicatorCache, currentDate)
            
            this.allocationResults.push({
                date: currentDate.format('YYYY-MM-DD'),
                ...allocations
            })

            // Pass new allocations to Rebalancer
            // If Rebalancer has previous allocations, it calculates which assets need to be sold and which ones need to be bought
            // After rebalance, Rebalancer logs new portfolio value for date
            rebalancer.rebalance(currentDate, allocations)

            if (currentDate.isSame(toDate)) {
                break
            }

            currentDate = this.getNextMarketDate(currentDate)
        }
        console.timeEnd("TradingBotBacktester - while loop");

        console.table(this.allocationResults)
        this.backtestResults.allocation_history = this.allocationResults

        console.log('Portfolio value: ', toCurrency(rebalancer.getPortfolioValue()))

        this.backtestResults.starting_balance = this.startingBalance
        this.backtestResults.ending_balance = rebalancer.getPortfolioValue()

        return this.backtestResults
    }

    async loadData(): Promise<void> {
        const parser = new TradingBotParser()

        const { assets, tradeableAssets, indicators } = parser.parse(this.algorithm)

        this.tradeableAssets = tradeableAssets

        this.ohlcCache = new OhlcCache(this.client, assets)
        await this.ohlcCache.load()

        this.indicatorCache = new IndicatorCache(this.ohlcCache, indicators)
        await this.indicatorCache.load()
    }

    private calculateBacktestStartDate(): void {
        if (!this.ohlcCache || !this.ohlcCache.isLoaded()) {
            throw new Error('OHLC data has not been loaded.')
        }

        if (!this.indicatorCache || !this.indicatorCache.isLoaded()) {
            throw new Error('Indicator data has not been loaded.')
        }

        const tickers = this.ohlcCache.getTickers()

        let earlieststartDate = dayjs(this.backtestStartDate)
        let earliestStartDateTicker = undefined

        for (const ticker of tickers) {
            const bars = this.ohlcCache.getBars(ticker)
            const tickerStartDate = dayjs(bars[0].date)
            
            this.tickerStartDates[ticker] = tickerStartDate.format('YYYY-MM-DD')

            if (tickerStartDate > earlieststartDate) {
                earlieststartDate = tickerStartDate
                earliestStartDateTicker = ticker
            }    
        }

        this.backtestStartDate = this.getNextMarketDate(
            earlieststartDate.add(this.indicatorCache.getLargestWindow(), 'days')
        ).format('YYYY-MM-DD')

        console.log(`Earliest Start Date is ${this.backtestStartDate} for ticker ${earliestStartDateTicker}`)
        console.log(`Ticker start dates`, this.tickerStartDates)
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