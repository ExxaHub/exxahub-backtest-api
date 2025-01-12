import dayjs from "dayjs";
import type { Dayjs } from "dayjs"
import type { ClientInterface, OHLCBar } from "../types/types"

export class OhlcCache {
  private client: ClientInterface
  private tickers: string[]
  private cachedOhlcBars: Map<string, OHLCBar[]> = new Map<string, OHLCBar[]>()
  private cachedOhlcBarDates: Set<string> = new Set<string>()
  private cachedOhlcBarsByDate: Map<string, Record<string, OHLCBar>> = new Map<string, Record<string, OHLCBar>>()
  private loaded: boolean = false

  constructor(client: ClientInterface, tickers: string[]) {
    this.client = client
    this.tickers = tickers
  }

  async load(): Promise<void> {
    const bars = await this.getTickerBars()

    const indexByDate = (ohlcBars: OHLCBar[]): Record<string, OHLCBar> => {
      const ohlcObject: Record<string, OHLCBar> = {};
      
      ohlcBars.forEach(bar => {
        ohlcObject[bar.date] = bar
        this.cachedOhlcBarDates.add(bar.date)
      });
    
      return ohlcObject;
    }

    for (const [ticker, ohlcBars] of Object.entries(bars)) {
      this.cachedOhlcBars.set(ticker, ohlcBars)
      this.cachedOhlcBarsByDate.set(ticker, indexByDate(ohlcBars))
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

  private async getTickerBars(): Promise<{[key: string]: OHLCBar[]}> {
    return this.client.getBarsForSymbols(this.tickers)
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