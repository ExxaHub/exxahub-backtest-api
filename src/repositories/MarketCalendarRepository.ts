import { db } from '../db'
import { table, type MarketCalendar } from '../models/MarketCalendar'

export class MarketCalendarRepository {
    async insert(attributes: MarketCalendar): Promise<MarketCalendar> {
        try { 
            const result = await db<MarketCalendar>(table)
                .insert(attributes)
                .onConflict('date')
                .merge()
                .returning('*')
            return result[0]
        } catch (error) {
            console.error('Error saving trading day:', error)
            throw new Error('Error saving trading day')
        }
    }
}