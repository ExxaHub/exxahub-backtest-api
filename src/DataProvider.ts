import { currentPrice } from "./indicators/currentPrice"
import { movingAverageOfPrice } from "./indicators/movingAverageOfPrice"
import { rsi } from "./indicators/rsi"
import type { Indicator, ClientInterface, OHLCBar } from "./types"

export class DataProvider {
  private client: ClientInterface
  private indicators: Indicator[]
  private cachedIndicators: Map<string, { [key: string]: number }> = new Map<string, { [key: string]: number }>()

  constructor(client: ClientInterface, indicators: Indicator[]) {
    this.client = client
    this.indicators = indicators
  }

  async load(): Promise<void> {
    const bars = await this.getTickerBars()
    console.log(this.indicators)
    for (const indicator of this.indicators) {
      const tickerBars = bars[indicator.ticker]
      const indicatorFn = this.getIndicatorFunction(indicator.fn)
      const key = `${indicator.ticker}-${indicator.fn}-${indicator.params.window}`
      const calculatedIndicator = await indicatorFn(indicator.ticker, indicator.params, tickerBars)
      this.cachedIndicators.set(key, calculatedIndicator)
    }

    console.log(this.cachedIndicators)
  }

  getIndicatorValue(ticker: string, fn: string, params: Record<string, any> = {}, date?: string): number {
    const key = `${ticker}-${fn}-${params.window}`
    console.log('KEY', {key: key})
    const cachedIndicator = this.cachedIndicators.get(key)
    if (cachedIndicator) {
      console.log('CACHE HIT', { cachedIndicator, date })
      if (date) {
        return cachedIndicator[date]
      } else {
        const keys = Object.keys(cachedIndicator)
        return cachedIndicator[keys[keys.length - 1]]
      }
    } else {
      console.log('CACHE MISS')
    }
    throw new Error(`Unable for get cached indicator: ${key}`)
  }

  private getTickerList(): string[] {
    return this.indicators.map(ind => ind.ticker)
  }

  private async getTickerBars(): Promise<{[key: string]: OHLCBar[]}> {
    return this.client.getBars(this.getTickerList())
  }

  private getIndicatorFunction(fn: string): CallableFunction {
    switch(fn) {
      case 'relative-strength-index':
        return rsi
      case 'moving-average-price':
        return movingAverageOfPrice
      case 'current-price':
        return currentPrice
      default:
        throw new Error(`Unknown indicator function: ${fn}`)
    }
  }
}