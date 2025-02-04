import { type MarketCalendar } from '../models/MarketCalendar'
import { MarketCalendarRepository } from '../repositories/MarketCalendarRepository'

export class MarketCalendarService {
    private marketCalendarRepository: MarketCalendarRepository

    constructor() { 
        this.marketCalendarRepository = new MarketCalendarRepository()
    }

    async insert(attributes: MarketCalendar): Promise<MarketCalendar> {
        return this.marketCalendarRepository.insert(attributes)
    }
}