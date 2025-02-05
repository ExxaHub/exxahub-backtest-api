import { cumulativeReturn } from "../indicators/cumulativeReturn"
import { currentPrice } from "../indicators/currentPrice"
import { exponentialMovingAverageOfPrice } from "../indicators/exponentialMovingAverageOfPrice"
import { maxDrawdown } from "../indicators/maxDrawdown"
import { movingAverageOfPrice } from "../indicators/movingAverageOfPrice"
import { movingAverageOfReturn } from "../indicators/movingAverageOfReturn"
import { relativeStrengthIndex} from "../indicators/relativeStrengthIndex"
import { standardDeviationOfPrice } from "../indicators/standardDeviationOfPrice"
import { standardDeviationOfReturn } from "../indicators/standardDeviationOfReturn"
import type { OhlcCache } from "./OhlcCache"
import type { Indicator } from "../types/types"

export class IndicatorCache {
  private ohlcCache: OhlcCache
  private indicators: Indicator[]
  private cachedIndicators: Map<string, number[]> = new Map<string, number[]>()
  private loaded: boolean = false

  constructor(ohlcCache: OhlcCache, indicators: Indicator[]) {
    this.ohlcCache = ohlcCache
    this.indicators = indicators
  }

  async load(): Promise<void> {
    const loadPromises = this.indicators.map(async (indicator) => {
      const tickerBars = this.ohlcCache.getBars(indicator.ticker)
      const indicatorFn = this.getIndicatorFunction(indicator.fn)
      const key = `${indicator.ticker}-${indicator.fn}-${indicator.params.window}`
      const calculatedIndicatorValues = await indicatorFn(indicator.ticker, indicator.params, tickerBars)
      this.cachedIndicators.set(key, calculatedIndicatorValues)
    })

    await Promise.all(loadPromises)
    this.loaded = true
  }

  getKeys(): string[] {
    return Array.from(this.cachedIndicators.keys())
  }

  getByKey(key: string): number[] {
    return this.cachedIndicators.get(key) || []
  }

  getIndicatorValue(ticker: string, fn: string, params: Record<string, any> = {}, index?: number): number {
    const key = `${ticker}-${fn}-${params.window}`
    
    const cachedIndicator = this.cachedIndicators.get(key)
    
    if (cachedIndicator && index) {
        const value = cachedIndicator[index]

        if (!value) {
          throw new Error(`Could not calculate indicator value for key: ${key} at index: ${index}`)
        }

        return value
    }
    throw new Error(`Unable to get cached indicator: ${key}`)
  }

  getIndicatorValues(ticker: string, fn: string, params: Record<string, any> = {}): number[] | undefined {
    const key = `${ticker}-${fn}-${params.window}`
    return this.cachedIndicators.get(key)
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

  printDebugTable() {
    const indicators = Array.from(this.cachedIndicators.keys())

    const tableData: {[key: string]: { [key: string]: number }} = {}
    for (const indicator of indicators) {
      const values = this.cachedIndicators.get(indicator)
      
      if (!values) {
        throw new Error(`Could not print values for indicator: ${indicator}`)
      }

      for (const [date, value] of values.entries()) {
        if (!tableData[date]) {
          tableData[date] = {}
        }
        tableData[date][indicator] = value
      }
    }

    console.table(tableData) 
  }
}