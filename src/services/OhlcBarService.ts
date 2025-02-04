import { OhlcBarRepository } from '../repositories/OhlcBarRepository'
import { type CloseBar, type OHLCBar } from '../types/types'

export class OhlcBarService {
    private ohlcBarRepository: OhlcBarRepository

    constructor() { 
        this.ohlcBarRepository = new OhlcBarRepository()
    }

    async getDateOffset(symbol: string, date: string, offset: number): Promise<string> {
        return this.ohlcBarRepository.getDateOffset(symbol, date, offset)
    }

    async saveBars(bars: { [key: string]: OHLCBar[] }): Promise<void> {
        const promises: Promise<boolean>[] = []

        for (const ticker in bars) {
            promises.push(this.ohlcBarRepository.saveBars(ticker, bars[ticker]))
        }

        const results = await Promise.all(promises)
    }

    async bulkInsert(ticker: string, bars: OHLCBar[]): Promise<boolean> {
        return await this.ohlcBarRepository.bulkInsert(ticker, bars)
    }

    async getBarsForDateRange(tickers: string[], fromDate: string, toDate: string): Promise<{ [key: string]: CloseBar[] }> {
        return this.ohlcBarRepository.getBarsForDateRange(tickers, fromDate, toDate)
    }
}