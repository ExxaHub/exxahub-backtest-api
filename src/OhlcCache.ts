import dayjs from "dayjs";
import type { Dayjs } from "dayjs"
import type { ClientInterface, OHLCBar } from "./types"

export class OhlcCache {
  private client: ClientInterface
  private tickers: string[]
  private cachedOhlcBars: Map<string, OHLCBar[]> = new Map<string, OHLCBar[]>()
  private cachedOhlcBarDates: Set<string> = new Set<string>()
  private loaded: boolean = false

  constructor(client: ClientInterface, tickers: string[]) {
    this.client = client
    this.tickers = tickers
  }

  async load(): Promise<void> {
    const bars = await this.getTickerBars()
    for (const [ticker, ohlcBars] of Object.entries(bars)) {
      this.cachedOhlcBars.set(ticker, ohlcBars)

      for (const ohlcBar of ohlcBars) {
        this.cachedOhlcBarDates.add(ohlcBar.date)
      }
    }
    
    this.loaded = true
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

  getTickers(): string[] {
    return Array.from(this.cachedOhlcBars.keys())
  }

  private async getTickerBars(): Promise<{[key: string]: OHLCBar[]}> {
    return this.client.getBars(this.tickers)
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