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

    async getMaxAndMinDateForTickers(tickers: string[]): Promise<{ minDate: string, maxDate: string }> {
        return this.tickerRepository.getMaxAndMinDateForTickers(tickers)
    }
}