import { db } from '../db'
import { logPerformance } from '../decorators/performance'
import { table } from '../models/OhlcBarSummary'

export class OhlcBarSummaryRepository {
    async refreshMaterializedView(): Promise<void> {
        await db.raw(`
            REFRESH MATERIALIZED VIEW ${table}
        `)
    }

    @logPerformance()
        async getLastBarDates(tickers: string[]): Promise<{ [key: string]: string }> {
            try {
                const results = await db(table)
                    .select('*')
                    .whereIn('symbol', tickers)
    
                const lastDates: { [key: string]: string } = {}
                results.forEach(result => {
                    lastDates[result.symbol] = result.max_date
                })
                return lastDates
            } catch (error) {
                console.error('Error getting last bar dates:', error)
                return {}
            }
        }
}