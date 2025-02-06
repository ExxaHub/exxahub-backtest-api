import { db } from '../db'
import { table } from '../models/OhlcBar'
import { type OHLCBar } from '../types/types'
import dayjs from 'dayjs'

export class OhlcBarRepository {
    async saveBars(ticker: string, bars: OHLCBar[]): Promise<boolean> {
        try { 
            const barsToSave = bars.map(bar => {
                return {
                    symbol: ticker, 
                    date: bar.date, 
                    ts: dayjs(bar.date).startOf('day').unix(),  
                    open: bar.open, 
                    high: bar.high, 
                    low: bar.low, 
                    close: bar.close, 
                    volume: bar.volume
                }
            })
            
            await db(table)
                .insert(barsToSave)
                .onConflict(['symbol', 'ts'])
                .merge()

            return true
        } catch (error) {
            console.error('Error saving bars:', error)
            return false
        }
    }

    async bulkInsert(ticker: string, bars: OHLCBar[]): Promise<boolean> {
        try { 
            const barsToSave = bars.map(bar => {
                return {
                    symbol: ticker, 
                    date: bar.date, 
                    ts: dayjs(bar.date).startOf('day').unix(),  
                    open: bar.open, 
                    high: bar.high, 
                    low: bar.low, 
                    close: bar.close, 
                    volume: bar.volume
                }
            })

            console.log('bulk inserting', barsToSave.length, 'bars')
            
            await db.batchInsert(table, barsToSave, 1000)

            return true
        } catch (error) {
            console.error('Error saving bars:', error)
            return false
        }
    }

    async getBarsForDates(tickers: string[], fromDate: number, toDate: number): Promise<{ [key: string]: number[] }> {
        try {
            const results = await db(table)
                .select('symbol', db.raw('ARRAY_AGG(close ORDER BY ts) AS close_prices'))
                .whereIn('symbol', tickers)
                .where('ts', '>=', fromDate)
                .where('ts', '<=', toDate)
                .groupBy('symbol')
            
            const bars: { [key: string]: number[] } = {}
            results.forEach(result => {
                bars[result.symbol] = result.close_prices
            })
            return bars
        } catch (error) {
            console.error('Error getting bars for date range:', error)
            return {}
        }
    }

    async getDates(ticker: string, fromDate: number, toDate: number): Promise<number[]> {
        try {
            const results = await db(table)
                .select(db.raw('ARRAY_AGG(ts ORDER BY ts) AS timestamps'))
                .where('symbol', ticker)
                .where('ts', '>=', fromDate)
                .where('ts', '<=', toDate)
            
            return results[0].timestamps
        } catch (error) {
            console.error('Error getting bars for date range:', error)
            return []
        }
    }
}