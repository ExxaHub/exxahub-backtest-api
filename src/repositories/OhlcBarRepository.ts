import { db } from '../db'
import { table } from '../models/OhlcBar'
import { type OHLCBar } from '../types/types'

export class OhlcBarRepository {
    async getLastBarDates(tickers: string[]): Promise<{ [key: string]: string }> {
        try {
            const results = await db(table)
                .select('symbol')
                .max('date as last_date')
                .whereIn('symbol', tickers)
                .groupBy('symbol')

            const lastDates: { [key: string]: string } = {}
            results.forEach(result => {
                lastDates[result.symbol] = result.last_date
            })

            return lastDates
        } catch (error) {
            console.error('Error getting last bar dates:', error)
            return {}
        }
    }

    async saveBars(ticker: string, bars: OHLCBar[]): Promise<boolean> {
        try { 
            const barsToSave = bars.map(bar => {
                return {
                    symbol: ticker, 
                    date: bar.date, 
                    open: bar.open, 
                    high: bar.high, 
                    low: bar.low, 
                    close: bar.close, 
                    volume: bar.volume
                }
            })

            console.log('barsToSave:', barsToSave.length)
            
            await db(table)
                .insert(barsToSave)
                .onConflict(['symbol', 'date'])
                .merge()

            return true
        } catch (error) {
            console.error('Error saving bars:', error)
            return false
        }
    }

    async getBarsForDateRange(tickers: string[], fromDate: string, toDate: string): Promise<{ [key: string]: OHLCBar[] }> {
        console.log('querying bars for date range:', fromDate, toDate)
        try {
            const results = await db(table)
                .select('*')
                .whereIn('symbol', tickers)
                .where('date', '>=', fromDate)
                .where('date', '<=', toDate)

            const bars: { [key: string]: OHLCBar[] } = {}
            results.forEach(result => {
                if (bars[result.symbol] === undefined) {
                    bars[result.symbol] = []
                }

                bars[result.symbol].push({
                    close: result.close,
                    high: result.high,
                    low: result.low,
                    open: result.open,
                    date: result.date,
                    volume: result.volume
                })
            })

            return bars
        } catch (error) {
            console.error('Error getting bars for date range:', error)
            return {}
        }
    }
}