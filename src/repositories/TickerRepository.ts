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
        return db<Ticker>(table).select(['ticker', 'name', 'asset_type'])
    }
}