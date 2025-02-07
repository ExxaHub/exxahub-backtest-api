import { OhlcBarService } from "./OhlcBarService"

export class OhlcCache {
  private ohlcBarService: OhlcBarService
  private indicatorStartDate: number
  private tradeableStartDate: number
  private tradeableEndDate: number
  private tradeableAssets: string[]
  private indicatorAssets: string[]
  private maxWindow: number
  protected cachedOhlcBars: Map<string, (number | null)[]> = new Map<string, (number | null)[]>()
  private dates: number[] | null = null
  private loaded: boolean = false
  private maxLength: number = 0

  constructor(
    indicatorStartDate: number,
    tradeableStartDate: number,
    tradeableEndDate: number,
    tradeableAssets: string[],
    indicatorAssets: string[],
    maxWindow: number
  ) {
    this.indicatorStartDate = indicatorStartDate
    this.tradeableStartDate = tradeableStartDate
    this.tradeableEndDate = tradeableEndDate
    this.tradeableAssets = tradeableAssets
    this.indicatorAssets = indicatorAssets
    this.maxWindow = maxWindow
    this.ohlcBarService = new OhlcBarService()
  }

  async load(): Promise<void> {
    // Remove any assets from tradeableAssets that are also in indicatorAssets so we don't load the bars twice
    this.tradeableAssets = this.removeDuplicates(this.indicatorAssets, this.tradeableAssets)

    const indicatorBars = await this.getTickerBars(this.indicatorAssets, this.indicatorStartDate, this.tradeableEndDate)
    const tradeableBars = await this.getTickerBars(this.tradeableAssets, this.tradeableStartDate, this.tradeableEndDate)
    
    this.dates = await this.ohlcBarService.getDates(
      this.indicatorAssets[0] ?? this.tradeableAssets[0], // If not indicators, fallback to tradable asset 
      this.indicatorStartDate, 
      this.tradeableEndDate
    )

    for (const [ticker, closeBars] of Object.entries(indicatorBars)) {
      this.cachedOhlcBars.set(ticker, closeBars)
      this.maxLength = Math.max(this.maxLength, closeBars.length)
    }

    const indicatorWindowBuffer: null[] = new Array(this.maxWindow).fill(null);

    for (const [ticker, closeBars] of Object.entries(tradeableBars)) {
      // If we already have the bars for this ticker, skip because we don't 
      // want to overwrite the existing bars from the indicator date windows
      if (!this.cachedOhlcBars.has(ticker)) {
        this.cachedOhlcBars.set(ticker, [...indicatorWindowBuffer, ...closeBars])
      }

      this.maxLength = Math.max(this.maxLength, closeBars.length)
    }

    this.loaded = true
  }

  isLoaded(): boolean {
    return this.loaded
  }

  getMaxLength(): number {
    return this.maxLength - 1
  }

  hasBarsForIndex(index: number): boolean {
    for (const bars of this.cachedOhlcBars.values()) {
      if (bars[index] !== undefined) {
        return true
      }
    }
    return false
  }

  getBars(ticker: string): (number | null)[] {
    const bars = this.cachedOhlcBars.get(ticker)

    if (!bars) {
      throw new Error(`Unable to load OHLC bars for ticker: ${ticker}`)
    }

    return bars
  }

  getDates(): number[] {  
    if (!this.dates) {
      throw new Error('Unable to load dates')
    }

    return this.dates
  }

  getBarForIndex(ticker: string, index: number): number | null {
    const bars = this.cachedOhlcBars.get(ticker)
    if (!bars) {
      throw new Error(`No bars available for ticker: ${ticker}`)
    }
    return bars[index]
  }

  getTickers(): string[] {
    return Array.from(this.cachedOhlcBars.keys())
  }

  private async getTickerBars(assets: string[], fromDate: number, toDate: number): Promise<{[key: string]: number[]}> {
    return this.ohlcBarService.getBarsForDateRange(assets, fromDate, toDate)
  }

  private removeDuplicates(arr1: string[], arr2: string[]): string[] {
    const arr1Set = new Set(arr1);
    return arr2.filter(item => !arr1Set.has(item));
  };
}