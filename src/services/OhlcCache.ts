import dayjs from "dayjs";
import type { Dayjs } from "dayjs"
import type { ClientInterface, OHLCBar } from "../types/types"
import { OhlcBarService } from "./OhlcBarService"

export class OhlcCache {
  private client: ClientInterface
  private ohlcBarService: OhlcBarService
  private tickers: string[]
  private cachedOhlcBars: Map<string, Map<string, OHLCBar>> = new Map<string, Map<string, OHLCBar>>()
  private loaded: boolean = false

  constructor(client: ClientInterface, tickers: string[]) {
    this.client = client
    this.tickers = tickers
    this.ohlcBarService = new OhlcBarService()
  }

  async load(fromDate: string, toDate: string): Promise<void> {
    const bars = await this.getTickerBars(fromDate, toDate)

    for (const [ticker, ohlcBars] of Object.entries(bars)) {
      this.cachedOhlcBars.set(ticker, this.indexByDate(ohlcBars))
    }

    this.loaded = true
  }

  private indexByDate(ohlcBars: OHLCBar[]): Map<string, OHLCBar> {
    const ohlcMap = new Map<string, OHLCBar>()
    
    ohlcBars.forEach(bar => {
      ohlcMap.set(bar.date, bar)
    });
  
    return ohlcMap;
  }

  isLoaded(): boolean {
    return this.loaded
  }

  hasBarsForDate(date: Dayjs): boolean {
    const formattedDate = date.format('YYYY-MM-DD')
    for (const bars of this.cachedOhlcBars.values()) {
      if (bars.has(formattedDate)) {
        return true
      }
    }
    return false
  }

  getBars(ticker: string, fromDate?: Dayjs, toDate?: Dayjs): OHLCBar[] {
    const barsMap = this.cachedOhlcBars.get(ticker)

    if (!barsMap) {
      throw new Error(`Unable to load OHLC bars for ticker: ${ticker}`)
    }

    let bars = Array.from(barsMap.values())

    if (fromDate && toDate) {
      bars = bars.filter(bar => {
        const barDate = dayjs(bar.date)
        return barDate >= fromDate && barDate <= toDate
      })
    }

    return bars
  }

  getBarForDate(ticker: string, date: string): OHLCBar | undefined {
    const bars = this.cachedOhlcBars.get(ticker)
    if (!bars) {
      throw new Error(`No bars available for ticker: ${ticker}`)
    }
    return bars.get(date)
  }

  getTickers(): string[] {
    return Array.from(this.cachedOhlcBars.keys())
  }

  private async getTickerBars(fromDate: string, toDate: string): Promise<{[key: string]: OHLCBar[]}> {
    const lastBarDates = await this.ohlcBarService.getLastBarDates(this.tickers)

    await Promise.all([
      this.backfillBars(lastBarDates),
      this.updateBars(lastBarDates)
    ])

    return this.ohlcBarService.getBarsForDateRange(this.tickers, fromDate, toDate)
  }

  private async backfillBars(lastBarDates: {[key: string]: string}): Promise<void> {
    const tickersToBackfill = this.tickers.filter(ticker => !lastBarDates[ticker])

    if (tickersToBackfill.length === 0) {
      return
    }

    const barsToSave = await this.client.getBarsForSymbols(tickersToBackfill)
    await this.ohlcBarService.saveBars(barsToSave)
  }

  private async updateBars(lastBarDates: {[key: string]: string}): Promise<void> {
    const today = dayjs()
    const tickersToUpdate = this.tickers.filter(ticker => dayjs(lastBarDates[ticker]).isBefore(today.subtract(1, 'day').startOf('day')))

    if (tickersToUpdate.length === 0) {
      return
    }

    const promises = tickersToUpdate.map(ticker => this.client.getBarsForSymbol(ticker, lastBarDates[ticker]))

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
    const tableData: {[key: string]: { [key: string]: number }} = {}
    for (const [ticker, barsMap] of this.cachedOhlcBars.entries()) {
      for (const [date, bar] of barsMap.entries()) {
        if (!tableData[date]) {
          tableData[date] = {}
        }
        tableData[date][ticker] = bar.close
      }
    }

    console.table(tableData) 
  }
}