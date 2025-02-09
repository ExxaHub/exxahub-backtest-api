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
        function chunkArray(array: OHLCBar[], chunkSize: number) {
            let chunks = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }
            return chunks;
        }

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

            console.log('bulk inserting', barsToSave.length, 'bars for ticker', ticker)

            const chunks = chunkArray(barsToSave, 1000)

            for (const chunk of chunks) {
                await db(table)
                    .insert(chunk)
                    .onConflict(['symbol', 'ts'])
                    .merge();
            }
            
            return true
        } catch (error) {
            console.error('Error saving bars:', error)
            return false
        }
    }

    async getBarsForDates(tickers: string[], fromDate: number, toDate: number): Promise<{ [key: string]: number[] }> {
        console.log('getBarsForDates', tickers, dayjs.unix(fromDate).format('YYYY-MM-DD'), dayjs.unix(toDate).format('YYYY-MM-DD'))
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

    async debugBarsForDates(tickers: string[], fromDate: string, toDate: string): Promise<void> {
        try {
            const results = await db(table)
                .select(['symbol', 'date', 'close'])
                .whereIn('symbol', tickers)
                .where('ts', '>=', dayjs(fromDate).unix())
                .where('ts', '<=', dayjs(toDate).unix())
                .orderBy('ts', 'asc')

            const tableData: {[key: string]: { [key: string]: number | null }} = {}
            for (const result of results) {
                tableData[result.date] = tableData[result.date] || {}
                tableData[result.date][result.symbol] = result.close
            }

            console.table(tableData)
        } catch (error) {
            console.error('Error getting bars for date range:', error)
        }
    }
    
    async findMissingBars(ticker: string, fromDate: string, toDate: string): Promise<string[]> {
        const results = await db('exxahub.market_calendar as calendar')
            .select('calendar.*')
            .leftJoin('exxahub.ohlc_bars as bars', function () {
                this.on('calendar.ts', '=', 'bars.ts')
                    .andOn('bars.symbol', '=', db.raw('?', [ticker]));
            })
            .whereNull('bars.ts')
            .where('calendar.date', '>=', fromDate)
            .where('calendar.date', '<=', toDate)
            .orderBy('calendar.date', 'asc')
        return results.map(result => result.date)
    }

}