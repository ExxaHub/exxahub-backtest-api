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
      const calculatedIndicator = indicatorFn(indicator.ticker, indicator.params, tickerBars)
      this.cachedIndicators.set(key, calculatedIndicator)
    }

    console.log(this.cachedIndicators)
  }

  private getTickerList(): string[] {
    return this.indicators.map(ind => ind.ticker)
  }

  private async getTickerBars(): Promise<{[key: string]: OHLCBar[]}> {
    return this.client.getBars(this.getTickerList())
  }

  private calculateIndicators() {
    // TODO: Iterate over each indicator and calculate indicator values from the ticker bars
    // TODO: Store the indicator values in a structure with Ticker as key and the value is another object of date -> value
    
    /**
     * const indicators = {
     *   'SPY-RSI-5': {
     *     '2024-01-10': 50.0,
     *     '2024-01-09': 52.0,
     *     '2024-01-08': 55.0,
     *     '2024-01-07': 59.0,
     *     '2024-01-06': 52.0,
     *   }
     *   'TQQQ-RSI-10': {
     *     '2024-01-10': 50.0,
     *     '2024-01-09': 52.0,
     *     '2024-01-08': 55.0,
     *     '2024-01-07': 59.0,
     *     '2024-01-06': 52.0,
     *   }
     * }
     */
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