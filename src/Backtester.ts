import type { Algorithm, ClientInterface } from "./types";
import { OhlcCache } from './OhlcCache'
import { IndicatorCache } from './IndicatorCache'
import { Parser } from './Parser'
import dayjs, { type Dayjs } from "dayjs";
import { Interpreter } from "./Interpreter";
import { Rebalancer } from "./Rebalancer";

const DEFAULT_BACKTEST_START_DATE = '1990-01-01'

export class Backtester {
    private algorithm: Algorithm
    private client: ClientInterface
    private ohlcCache?: OhlcCache
    private indicatorCache?: IndicatorCache
    private tradeableAssets: string[]

    private backtestStartDate: string
    private backtestEndDate: string
    private backtestResults: { [key: string]: string | number | null }[] = []

    private tickerStartDates: Record<string, string> = {}

    constructor(algorithm: Algorithm, client: ClientInterface, tradeableAssets: string[]) {
        this.algorithm = algorithm
        this.client = client
        this.tradeableAssets = tradeableAssets

        this.backtestStartDate = DEFAULT_BACKTEST_START_DATE
        this.backtestEndDate = dayjs().format('YYYY-MM-DD')
    }

    async run(): Promise<void> {
        await this.loadData()

        if (!this.indicatorCache) {
            throw new Error('Indicator cache has not been initialized.')
        }
        
        // TODO: Calculate minimum number of bars needed for the indicators, then move up the start date by that amount
        this.calculateBacktestStartDate()

        // Iterate over each day starting from the backtest start date
        let fromDate = dayjs(this.backtestStartDate)
        let currentDate = fromDate.clone()
        let toDate = this.getLastMarketDate(dayjs(this.backtestEndDate))
        
        const interpreter = new Interpreter(this.indicatorCache, this.tradeableAssets)
        const rebalancer = new Rebalancer()

        while (currentDate <= toDate) {
            // Calculate allocations for date
            const allocations = interpreter.evaluate(this.algorithm, this.indicatorCache, currentDate)
            
            this.backtestResults.push({
                date: currentDate.format('YYYY-MM-DD'),
                ...allocations
            })

            // Pass new allocations to Rebalancer
            rebalancer.rebalance(allocations)

            // If Rebalancer has previous allocations, it calculates which assets need to be sold and which ones need to be bought
            // After rebalance, Rebalancer logs new portfolio value for date

            if (currentDate.isSame(toDate)) {
                break
            }

            currentDate = this.getNextMarketDate(currentDate)
        }

        console.table(this.backtestResults)
    }

    async loadData(): Promise<void> {
        const parser = new Parser()

        const { assets, indicators } = parser.parse(this.algorithm)

        console.log(`Fetching bars for ${assets.length} tickers`)

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

        this.backtestStartDate = earlieststartDate
            // TODO: Figure out better way to account for weekends other than multiplying by 2
            .add(this.indicatorCache.getLargestWindow() * 2, 'days')
            .format('YYYY-MM-DD')

        console.log(`Earliest Start Date is ${this.backtestStartDate} for ticker ${earliestStartDateTicker}`)
        console.log(`Ticker start dates`, this.tickerStartDates)
    }

    getNextMarketDate(date: Dayjs): Dayjs {
        if (!this.ohlcCache) {
            throw new Error('ohlcCache not loaded.')
        }

        do {
            date = date.add(1, 'day')
        } while (!this.ohlcCache.hasBarsForDate(date))

        return date
    }

    getLastMarketDate(date: Dayjs): Dayjs {
        if (!this.ohlcCache) {
            throw new Error('ohlcCache not loaded.')
        }

        do {
            date = date.subtract(1, 'day')
        } while (!this.ohlcCache.hasBarsForDate(date))

        return date
    }
}