import { symbol } from 'zod'
import { db } from '../db'
import { table } from '../models/OhlcBar'
import { type CloseBar, type OHLCBar } from '../types/types'
import dayjs from 'dayjs'

export class OhlcBarRepository {
    async getLastBarDates(tickers: string[]): Promise<{ [key: string]: string }> {
        try {
            const results = await db(table)
                .select('symbol')
                .max('ts as last_date')
                .whereIn('symbol', tickers)
                .groupBy('symbol')

            const lastDates: { [key: string]: string } = {}
            results.forEach(result => {
                lastDates[result.symbol] = dayjs.unix(result.last_date).format('YYYY-MM-DD')
            })

            return lastDates
        } catch (error) {
            console.error('Error getting last bar dates:', error)
            return {}
        }
    }

    async getDateOffset(symbol: string, date: string, offset: number): Promise<string> {
        try {
            const result = await db(table)
                .select('*')
                .where('symbol', symbol)
                .where('ts', '<=', dayjs(date).startOf('day').unix())
                .orderBy('ts', 'desc')
                .offset(offset)
                .limit(1)

            return result[0].date
        } catch (error) {
            console.error('Error getting date offset:', error)
            return date
        }
    }

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

    async getBarsForDateRange(tickers: string[], fromDate: number, toDate: number): Promise<{ [key: string]: CloseBar[] }> {
        try {
            const results = await db(table)
                .select(['symbol', 'date', 'close'])
                .whereIn('symbol', tickers)
                .where('ts', '>=', fromDate)
                .where('ts', '<=', toDate)
                .orderBy('ts', 'asc')

            const bars: { [key: string]: CloseBar[] } = {}
            results.forEach(result => {
                if (bars[result.symbol] === undefined) {
                    bars[result.symbol] = []
                }
                bars[result.symbol].push({
                    close: result.close,
                    date: result.date,
                })
            })

            return bars
        } catch (error) {
            console.error('Error getting bars for date range:', error)
            return {}
        }
    }
}