import { TickerRepository } from '../repositories/TickerRepository'
import type { Ticker } from '../models/Ticker'

export class TickerService {
    private tickerRepository: TickerRepository

    constructor() { 
        this.tickerRepository = new TickerRepository()
    }

    async insert(attributes: Ticker): Promise<Ticker> {
        return this.tickerRepository.insert(attributes)
    }

    async getAll(): Promise<Ticker[]> {
        return this.tickerRepository.getAll()
    }

    async getTicker(ticker: string): Promise<Ticker | undefined> {
        return this.tickerRepository.getTicker(ticker)
    }

    async getMaxAndMinDateForTickers(tickers: string[]): Promise<{ minDate: number, maxDate: number }> {
        return this.tickerRepository.getMaxAndMinDateForTickers(tickers)
    }

    async updateEndDate(ticker: string, endDate: string): Promise<Ticker> {
        return this.tickerRepository.updateEndDate(ticker, endDate)
    }
}