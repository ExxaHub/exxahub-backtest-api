import dayjs from 'dayjs'
import { db } from '../db'
import { table, type Ticker } from '../models/Ticker'

export class TickerRepository {
    async insert(attributes: Ticker): Promise<Ticker> {
        try { 
            const result = await db<Ticker>(table)
                .insert(attributes)
                .onConflict('ticker')
                .merge()
                .returning('*')
            return result[0]
        } catch (error) {
            console.error('Error saving ticker:', error)
            throw new Error('Error saving ticker')
        }
    }

    async getAll(): Promise<Ticker[]> {
        return db<Ticker>(table).select('*')
    }

    async getMaxAndMinDateForTickers(tickers: string[]): Promise<{ minDate: number, maxDate: number }> {
        const results = await db(table)
            .select(db.raw('max(start_ts) as min'))
            .select(db.raw('min(end_ts) as max'))
            .whereIn('ticker', tickers)
        return {
            minDate: results[0].min,
            maxDate: results[0].max
        }
    }

    async updateEndDate(ticker: string, endDate: string): Promise<Ticker> {
        const result = await db<Ticker>(table)
            .where('ticker', ticker)
            .update({ end_date: endDate })
            .returning('*')
        return result[0]
    }
}