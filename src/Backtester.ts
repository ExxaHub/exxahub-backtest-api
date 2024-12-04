import type { Algorithm, ClientInterface } from "./types";
import { OhlcCache } from './OhlcCache'
import { IndicatorCache } from './IndicatorCache'
import { Parser } from './Parser'
import dayjs from "dayjs";
import { Interpreter } from "./Interpreter";

const DEFAULT_BACKTEST_START_DATE = '1990-01-01'

export class Backtester {
    private algorithm: Algorithm
    private client: ClientInterface
    private ohlcCache?: OhlcCache
    private indicatorCache?: IndicatorCache

    private backtestStartDate: string
    private backtestEndDate: string

    private tickerStartDates: Record<string, string> = {}

    constructor(algorithm: Algorithm, client: ClientInterface) {
        this.algorithm = algorithm
        this.client = client

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
        let toDate = dayjs(this.backtestEndDate)
        
        const interpreter = new Interpreter(this.indicatorCache)
        
        console.log('>>>', {
            currentDate: currentDate.format('YYYY-MM-DD'),
            toDate: toDate.format('YYYY-MM-DD'),
        })

        while (currentDate < toDate) {
            // Calculate allocations for date
            const allocations = interpreter.evaluate(this.algorithm, this.indicatorCache, currentDate)
            
            console.log({
                date: currentDate.format('YYYY-MM-DD'),
                allocations
            })

            // Pass new allocations to Rebalancer
            // If Rebalancer has previous allocations, it calculates which assets need to be sold and which ones need to be bought
            // After rebalance, Rebalancer logs new portfolio value for date

            currentDate = currentDate.add(1, 'day')
        }
        console.log('>>>> 7')
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
            throw new Error('OHLC data has not been loaded yet.')
        }

        if (!this.indicatorCache) {
            throw new Error('Indicator data has not been loaded yet. 1')
        }

        if (!this.indicatorCache.isLoaded()) {
            throw new Error('Indicator data has not been loaded yet. 2')
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
}