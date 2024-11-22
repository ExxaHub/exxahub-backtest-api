import { cumulativeReturn } from "./indicators/cumulativeReturn"
import { currentPrice } from "./indicators/currentPrice"
import { exponentialMovingAverageOfPrice } from "./indicators/exponentialMovingAverageOfPrice"
import { maxDrawdown } from "./indicators/maxDrawdown"
import { movingAverageOfPrice } from "./indicators/movingAverageOfPrice"
import { movingAverageOfReturn } from "./indicators/movingAverageOfReturn"
import { relativeStrengthIndex} from "./indicators/relativeStrengthIndex"
import { standardDeviationOfPrice } from "./indicators/standardDeviationOfPrice"
import { standardDeviationOfReturn } from "./indicators/standardDeviationOfReturn"
import type { OhlcCache } from "./OhlcCache"
import type { Indicator } from "./types"

export class IndicatorCache {
  private ohlcCache: OhlcCache
  private indicators: Indicator[]
  private cachedIndicators: Map<string, { [key: string]: number }> = new Map<string, { [key: string]: number }>()

  constructor(ohlcCache: OhlcCache, indicators: Indicator[]) {
    this.ohlcCache = ohlcCache
    this.indicators = indicators
  }

  async load(): Promise<void> {
    for (const indicator of this.indicators) {
      const tickerBars = this.ohlcCache.getBars(indicator.ticker)
      const indicatorFn = this.getIndicatorFunction(indicator.fn)
      const key = `${indicator.ticker}-${indicator.fn}-${indicator.params.window}`
      const calculatedIndicator = await indicatorFn(indicator.ticker, indicator.params, tickerBars)
      this.cachedIndicators.set(key, calculatedIndicator)
    }
  }

  getIndicatorValue(ticker: string, fn: string, params: Record<string, any> = {}, date?: string): number {
    const key = `${ticker}-${fn}-${params.window}`

    console.log('KEY', key)
    
    const cachedIndicator = this.cachedIndicators.get(key)
    if (cachedIndicator) {
      if (date) {
        return cachedIndicator[date]
      } else {
        const keys = Object.keys(cachedIndicator)
        return cachedIndicator[keys[keys.length - 1]]
      }
    }
    throw new Error(`Unable for get cached indicator: ${key}`)
  }

  private getIndicatorFunction(fn: string): CallableFunction {
    switch(fn) {
      case 'relative-strength-index':
        return relativeStrengthIndex
      case 'moving-average-price':
        return movingAverageOfPrice
      case 'exponential-moving-average-price':
        return exponentialMovingAverageOfPrice
      case 'current-price':
        return currentPrice
      case 'cumulative-return':
        return cumulativeReturn
      case 'standard-deviation-price':
        return standardDeviationOfPrice
      case 'max-drawdown':
        return maxDrawdown
      case 'moving-average-return':
        return movingAverageOfReturn
      case 'standard-deviation-return':
        return standardDeviationOfReturn
      default:
        throw new Error(`Unknown indicator function: ${fn}`)
    }
  }
}