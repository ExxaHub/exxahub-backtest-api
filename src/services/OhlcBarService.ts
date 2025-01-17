import dayjs from 'dayjs'
import { OhlcBarRepository } from '../repositories/OhlcBarRepository'
import { type OHLCBar } from '../types/types'
import { logPerformance } from '../decorators/performance'

export class OhlcBarService {
    private ohlcBarRepository: OhlcBarRepository

    constructor() { 
        this.ohlcBarRepository = new OhlcBarRepository()
    }

    @logPerformance()
    async getLastBarDates(tickers: string[]): Promise<{ [key: string]: string }> {
        return this.ohlcBarRepository.getLastBarDates(tickers)
    }

    async saveBars(bars: { [key: string]: OHLCBar[] }): Promise<void> {
        const promises: Promise<boolean>[] = []

        for (const ticker in bars) {
            promises.push(this.ohlcBarRepository.saveBars(ticker, bars[ticker]))
        }

        const results = await Promise.all(promises)
    }

    @logPerformance()
    async getBarsForDateRange(tickers: string[], fromDate: string, toDate: string): Promise<{ [key: string]: OHLCBar[] }> {
        return this.ohlcBarRepository.getBarsForDateRange(tickers, fromDate, toDate)
    }
}