import dayjs from "dayjs";
import type { Dayjs } from "dayjs"
import type { CloseBar } from "../types/types"
import { OhlcBarService } from "./OhlcBarService"

export class OhlcCache {
  private ohlcBarService: OhlcBarService
  private tickers: string[]
  private largestIndicatorWindow: number
  private largestPreCalcWindow: number
  private cachedOhlcBars: Map<string, Map<string, CloseBar>> = new Map<string, Map<string, CloseBar>>()
  private loaded: boolean = false

  constructor(tickers: string[], largestIndicatorWindow: number, largestPreCalcWindow: number) {
    this.tickers = tickers
    this.largestIndicatorWindow = largestIndicatorWindow
    this.largestPreCalcWindow = largestPreCalcWindow
    this.ohlcBarService = new OhlcBarService()
  }

  async load(fromDate: Dayjs, toDate: Dayjs): Promise<Dayjs> {
    if (this.tickers.length === 0) {
      this.loaded = true
      return fromDate
    }

    const dateOffsetsFullWindow = await Promise.all(this.tickers.map(ticker => {
        return this.ohlcBarService.getDateOffset(ticker, fromDate.format('YYYY-MM-DD'), this.largestIndicatorWindow + this.largestPreCalcWindow)
    }))

    const ohlcBarsFromFullWindowDate = dateOffsetsFullWindow.reduce((max, current) =>
      dayjs(current).isAfter(dayjs(max)) ? current : max
    );

    const dateOffsetsPreCalcWindow = await Promise.all(this.tickers.map(
      ticker => this.ohlcBarService.getDateOffset(ticker, fromDate.format('YYYY-MM-DD'), this.largestPreCalcWindow))
    )

    const ohlcBarsFromPreCalcWindowDate = dateOffsetsPreCalcWindow.reduce((max, current) =>
      dayjs(current).isAfter(dayjs(max)) ? current : max
    );

    const bars = await this.getTickerBars(ohlcBarsFromFullWindowDate, toDate.format('YYYY-MM-DD'))

    for (const [ticker, ohlcBars] of Object.entries(bars)) {
      this.cachedOhlcBars.set(ticker, this.indexByDate(ohlcBars))
    }

    this.loaded = true

    return dayjs(ohlcBarsFromPreCalcWindowDate)
  }

  private indexByDate(ohlcBars: CloseBar[]): Map<string, CloseBar> {
    const ohlcMap = new Map<string, CloseBar>()
    
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

  getBars(ticker: string, fromDate?: Dayjs, toDate?: Dayjs): CloseBar[] {
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

  getBarForDate(ticker: string, date: string): CloseBar | undefined {
    const bars = this.cachedOhlcBars.get(ticker)
    if (!bars) {
      throw new Error(`No bars available for ticker: ${ticker}`)
    }
    return bars.get(date)
  }

  getTickers(): string[] {
    return Array.from(this.cachedOhlcBars.keys())
  }

  private async getTickerBars(fromDate: string, toDate: string): Promise<{[key: string]: CloseBar[]}> {
    return this.ohlcBarService.getBarsForDateRange(this.tickers, fromDate, toDate)
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