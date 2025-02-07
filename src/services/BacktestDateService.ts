import { TickerRepository } from '../repositories/TickerRepository'
import { MarketCalendarRepository } from '../repositories/MarketCalendarRepository'
import dayjs from 'dayjs'

export class BacktestDateService {
    private tickerRepository: TickerRepository
    private marketCalendarRepository: MarketCalendarRepository

    constructor() { 
        this.tickerRepository = new TickerRepository()
        this.marketCalendarRepository = new MarketCalendarRepository()
    }

    async calculateBacktestDates(
        btStartDate: string,
        btEndDate: string,
        tradeableAssets: string[], 
        indicatorAssets: string[], 
        largestIndicatorWindow: number, 
        largestPreCalcWindow: number
    ): Promise<{ indicatorStartDate: number, tradeableStartDate: number, tradeableEndDate: number, maxWindow: number }> {
        const today = dayjs()
        let backtestStartDate = dayjs(btStartDate)
        let backtestEndDate = dayjs(btEndDate)

        if (backtestEndDate.isAfter(today)) {
            backtestEndDate = today
        }

        // Adjust start date forward if it falls on a weekend
        if (backtestStartDate.day() === 0) {
            backtestStartDate = backtestStartDate.add(1, 'day') // Sunday
        } else if (backtestStartDate.day() === 6) {
            backtestStartDate = backtestStartDate.add(2, 'day') // Saturday
        }

        // Adjust end dates backward if they fall on a weekend
        if (backtestEndDate.day() === 0) {
            backtestEndDate = backtestEndDate.subtract(2, 'day') // Sunday
        } else if (backtestEndDate.day() === 6) {
            backtestEndDate = backtestEndDate.subtract(1, 'day') // Saturday
        }

        // Get start and end dates for tradeable tickers
        // This is the start of the bars you need to pull for the tradable assets
        const tradeabledates = await this.tickerRepository.getMaxAndMinDateForTickers(tradeableAssets)
        const minTradeableStartDate = tradeabledates.minDate
        const maxTradeableEndDate = tradeabledates.maxDate

        let minIndicatorStartDate = backtestStartDate.unix()
        let maxIndicatorEndDate = backtestEndDate.unix()

        if (indicatorAssets.length > 0) {
            // Get start and end dates for indicator tickers
            const indicatorDates = await this.tickerRepository.getMaxAndMinDateForTickers(indicatorAssets)
            minIndicatorStartDate = indicatorDates.minDate
            maxIndicatorEndDate = indicatorDates.maxDate
        }
        
        // Then take Max start date from both of those queries and the backtest start date
        const tradeableStartDate = Math.max(minTradeableStartDate, minIndicatorStartDate, backtestStartDate.unix())
        const tradeableEndDate = Math.min(maxTradeableEndDate, maxIndicatorEndDate, backtestEndDate.unix())

        const maxWindow = largestIndicatorWindow + largestPreCalcWindow

        // And find the date that we need to start calculating indicators ahead of the backtest start date
        const indicatorStartDate = await this.marketCalendarRepository.getMarketCalendarDateFromOffset(
            tradeableStartDate, 
            maxWindow
        )

        return {
            indicatorStartDate: Number(indicatorStartDate),
            tradeableStartDate: Number(tradeableStartDate),
            tradeableEndDate: Number(tradeableEndDate),
            maxWindow
        }
    }
}