import dayjs from "dayjs";
import type { Dayjs } from "dayjs"
import type { CloseBar } from "../types/types"
import { OhlcBarService } from "./OhlcBarService"

export class OhlcCache {
  private ohlcBarService: OhlcBarService
  private indicatorStartDate: number
  private tradeableStartDate: number
  private tradeableEndDate: number
  private tradeableAssets: string[]
  private indicatorAssets: string[]
  private cachedOhlcBars: Map<string, Map<string, CloseBar>> = new Map<string, Map<string, CloseBar>>()
  private loaded: boolean = false

  constructor(
    indicatorStartDate: number,
    tradeableStartDate: number,
    tradeableEndDate: number,
    tradeableAssets: string[],
    indicatorAssets: string[]
  ) {
    this.indicatorStartDate = indicatorStartDate
    this.tradeableStartDate = tradeableStartDate
    this.tradeableEndDate = tradeableEndDate
    this.tradeableAssets = tradeableAssets
    this.indicatorAssets = indicatorAssets
    this.ohlcBarService = new OhlcBarService()
  }

  async load(): Promise<void> {
    const indicatorBars = await this.getTickerBars(this.indicatorAssets, this.indicatorStartDate, this.tradeableEndDate)

    const tradeableBars = await this.getTickerBars(this.tradeableAssets, this.tradeableStartDate, this.tradeableEndDate)

    for (const [ticker, ohlcBars] of Object.entries(indicatorBars)) {
      this.cachedOhlcBars.set(ticker, this.indexByDate(ohlcBars))
    }

    for (const [ticker, ohlcBars] of Object.entries(tradeableBars)) {
      // If we already have the bars for this ticker, skip because we don't 
      // want to overwrite the existing bars from the indicator date windows
      if (!this.cachedOhlcBars.has(ticker)) {
        this.cachedOhlcBars.set(ticker, this.indexByDate(ohlcBars))
      }
    }

    this.loaded = true
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

  private async getTickerBars(assets: string[], fromDate: number, toDate: number): Promise<{[key: string]: CloseBar[]}> {
    return this.ohlcBarService.getBarsForDateRange(assets, fromDate, toDate)
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