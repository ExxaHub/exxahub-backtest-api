import dayjs from "dayjs";
import type { Dayjs } from "dayjs"
import type { ClientInterface, OHLCBar } from "../types/types"
import { OhlcBarService } from "./OhlcBarService"
import { logPerformance } from "../decorators/performance";

export class OhlcCache {
  private client: ClientInterface
  private ohlcBarService: OhlcBarService
  private tickers: string[]
  private cachedOhlcBars: Map<string, OHLCBar[]> = new Map<string, OHLCBar[]>()
  private cachedOhlcBarDates: Set<string> = new Set<string>()
  private cachedOhlcBarsByDate: Map<string, Record<string, OHLCBar>> = new Map<string, Record<string, OHLCBar>>()
  private loaded: boolean = false

  constructor(client: ClientInterface, tickers: string[]) {
    this.client = client
    this.tickers = tickers
    this.ohlcBarService = new OhlcBarService()
  }

  @logPerformance()
  async load(fromDate: string, toDate: string): Promise<void> {
    const bars = await this.getTickerBars(fromDate, toDate)

    for (const [ticker, ohlcBars] of Object.entries(bars)) {
      this.cachedOhlcBars.set(ticker, ohlcBars)
      this.cachedOhlcBarsByDate.set(ticker, this.indexByDate(ohlcBars))
    }

    this.loaded = true
  }

  @logPerformance()
  private indexByDate(ohlcBars: OHLCBar[]): Record<string, OHLCBar> {
    const ohlcObject: Record<string, OHLCBar> = {};
    
    ohlcBars.forEach(bar => {
      ohlcObject[bar.date] = bar
      this.cachedOhlcBarDates.add(bar.date)
    });
  
    return ohlcObject;
  }

  isLoaded(): boolean {
    return this.loaded
  }

  hasBarsForDate(date: Dayjs): boolean {
    return this.cachedOhlcBarDates.has(date.format('YYYY-MM-DD'))
  }

  getBars(ticker: string, fromDate?: Dayjs, toDate?: Dayjs): OHLCBar[] {
    let bars = this.cachedOhlcBars.get(ticker)

    if (bars === undefined) {
      throw new Error(`Unable to load OHLC bars for ticker: ${ticker}`)
    }

    if (fromDate && toDate) {
      bars = bars.filter(bar => {
        const barDate = dayjs(bar.date)
        return barDate >= fromDate && barDate <= toDate
      })
    }

    return bars
  }

  getBarForDate(ticker: string, date: string): OHLCBar | undefined {
    const bars = this.cachedOhlcBarsByDate.get(ticker)
    if (!bars) {
      throw new Error(`No bars available for ticker: ${ticker}`)
    }
    return bars[date]
  }

  getTickers(): string[] {
    return Array.from(this.cachedOhlcBars.keys())
  }

  @logPerformance()
  private async getTickerBars(fromDate: string, toDate: string): Promise<{[key: string]: OHLCBar[]}> {
    // Get the last bar dates for each ticker
    const lastBarDates = await this.ohlcBarService.getLastBarDates(this.tickers)

    await Promise.all([
      this.backfillBars(lastBarDates),
      this.updateBars(lastBarDates)
    ])

    const bars = this.ohlcBarService.getBarsForDateRange(this.tickers, fromDate, toDate)
    
    return bars
  }

  private async backfillBars(lastBarDates: {[key: string]: string}): Promise<void> {
    // Determine which tickers need to be backfilled
    const tickersToBackfill: string[] = []
    for (const ticker of this.tickers) {
      if (lastBarDates[ticker] === undefined) {
        tickersToBackfill.push(ticker)
      }
    }

    if (tickersToBackfill.length === 0) {
      return
    }

    // Get the bars for the tickers that need to be updated
    const barsToSave = await this.client.getBarsForSymbols(tickersToBackfill)

    await this.ohlcBarService.saveBars(barsToSave)
  }

  private async updateBars(lastBarDates: {[key: string]: string}): Promise<void> {
    // Determine which tickers need to be updated
    const tickersToUpdate: {ticker: string, lastDate: string}[] = []
    const today = dayjs()
    const promises: Promise<{symbol: string, bars: OHLCBar[]}>[] = []

    for (const ticker of this.tickers) {
      if (dayjs(lastBarDates[ticker]).isBefore(today.subtract(1, 'day').startOf('day'))) {
        tickersToUpdate.push({ ticker: ticker, lastDate: lastBarDates[ticker] })
      }
    }

    if (tickersToUpdate.length === 0) {
      return
    }

    for (const ticker of tickersToUpdate) {
      promises.push(
        this.client.getBarsForSymbol(ticker.ticker, ticker.lastDate)
      )
    }

    // Get the bars for the tickers that need to be updated
    const results = await Promise.allSettled(promises)
    const bars: {[key: string]: OHLCBar[]} = {}
        
    for (const result of results) {
        if (result.status === 'rejected') {
            console.error(result)
            throw new Error('Unable to fetch data')
        }

        bars[result.value.symbol] = result.value.bars
    }

    
    await this.ohlcBarService.saveBars(bars)
  }

  printDebugTable() {
    const tickers = Array.from(this.cachedOhlcBars.keys())

    const tableData: {[key: string]: { [key: string]: number }} = {}
    for (const ticker of tickers) {
      const bars = this.cachedOhlcBars.get(ticker)
      
      if (!bars) {
        throw new Error(`Could not print bars for ticker: ${ticker}`)
      }

      for (const bar of bars) {
        if (!tableData[bar.date]) {
          tableData[bar.date] = {}
        }
        tableData[bar.date][ticker] = bar.close
      }
    }

    console.table(tableData) 
  }
}