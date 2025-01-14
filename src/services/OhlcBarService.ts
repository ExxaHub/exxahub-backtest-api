import dayjs from 'dayjs'
import { OhlcBarRepository } from '../repositories/OhlcBarRepository'
import { type OHLCBar } from '../types/types'

export class OhlcBarService {
    private ohlcBarRepository: OhlcBarRepository

    constructor() { 
        this.ohlcBarRepository = new OhlcBarRepository()
    }

    async getLastBarDates(tickers: string[]): Promise<{ [key: string]: string }> {
        return this.ohlcBarRepository.getLastBarDates(tickers)
    }

    async getMinMaxBarDates(tickers: string[]): Promise<{ minDate: string, maxDate: string }> {
        const minMaxDatesPerTicker = await this.ohlcBarRepository.getMinMaxBarDates(tickers)

        let minDate = dayjs().add(7, 'day')
        let maxDate = dayjs().subtract(30, 'year')

        for (const ticker in minMaxDatesPerTicker) {
            minDate = dayjs(minMaxDatesPerTicker[ticker].minDate).isBefore(minDate) ? dayjs(minMaxDatesPerTicker[ticker].minDate) : minDate
            maxDate = dayjs(minMaxDatesPerTicker[ticker].maxDate).isAfter(maxDate) ? dayjs(minMaxDatesPerTicker[ticker].maxDate) : maxDate
        }

        return { minDate: minDate.format('YYYY-MM-DD'), maxDate: maxDate.format('YYYY-MM-DD') }
    }

    async saveBars(bars: { [key: string]: OHLCBar[] }): Promise<void> {
        const promises: Promise<boolean>[] = []

        for (const ticker in bars) {
            promises.push(this.ohlcBarRepository.saveBars(ticker, bars[ticker]))
        }

        const results = await Promise.all(promises)
    }

    async getBarsForDateRange(tickers: string[], fromDate: string, toDate: string): Promise<{ [key: string]: OHLCBar[] }> {
        return this.ohlcBarRepository.getBarsForDateRange(tickers, fromDate, toDate)
    }
}