import type { ClientInterface, OHLCBar } from "./types"

export class OhlcCache {
  private client: ClientInterface
  private tickers: string[]
  private cachedOhlcBars: Map<string, OHLCBar[]> = new Map<string, OHLCBar[]>()
  private loaded: boolean = false

  constructor(client: ClientInterface, tickers: string[]) {
    this.client = client
    this.tickers = tickers
  }

  async load(): Promise<void> {
    const bars = await this.getTickerBars()
    for (const [ticker, ohlcBars] of Object.entries(bars)) {
      this.cachedOhlcBars.set(ticker, ohlcBars)
    }
    this.loaded = true
  }

  isLoaded(): boolean {
    return this.loaded
  }

  getBars(ticker: string): OHLCBar[] {
    const bars = this.cachedOhlcBars.get(ticker)

    if (bars === undefined) {
      throw new Error(`Unable to load OHLC bars for ticker: ${ticker}`)
    }

    return bars
  }

  getTickers(): string[] {
    return Array.from(this.cachedOhlcBars.keys())
  }

  private async getTickerBars(): Promise<{[key: string]: OHLCBar[]}> {
    return this.client.getBars(this.tickers)
  }
}