import { OhlcBarRepository } from '../repositories/OhlcBarRepository'
import { type OHLCBar } from '../types/types'

export class OhlcBarService {
    private ohlcBarRepository: OhlcBarRepository

    constructor() { 
        this.ohlcBarRepository = new OhlcBarRepository()
    }

    async saveBars(bars: { [key: string]: OHLCBar[] }): Promise<void> {
        const promises: Promise<boolean>[] = []

        for (const ticker in bars) {
            promises.push(this.ohlcBarRepository.saveBars(ticker, bars[ticker]))
        }

        await Promise.all(promises)
    }

    async bulkInsert(ticker: string, bars: OHLCBar[]): Promise<boolean> {
        return await this.ohlcBarRepository.bulkInsert(ticker, bars)
    }

    async getBarsForDateRange(tickers: string[], fromDate: number, toDate: number): Promise<{ [key: string]: number[] }> {
        return this.ohlcBarRepository.getBarsForDates(tickers, fromDate, toDate)
    }

    async getDates(ticker: string, fromDate: number, toDate: number): Promise<number[]> {
        return this.ohlcBarRepository.getDates(ticker, fromDate, toDate)
    }

    async findMissingBars(ticker: string, fromDate: string, toDate: string): Promise<string[]> {
        return this.ohlcBarRepository.findMissingBars(ticker, fromDate, toDate)
    }
}