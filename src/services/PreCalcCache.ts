import type { OhlcCache } from "./OhlcCache"
import type { IndicatorCache } from "./IndicatorCache"
import type { Dayjs } from "dayjs"
import type { PreCalc, TradingBotNode } from "../types/types"
import { Interpreter } from "./Interpreter"
import { Rebalancer } from "./Rebalancer"
import type { AllocationResult } from "./Backtester"
import { standardDeviationOfReturn } from "../preCalcs/standardDeviationOfReturn"

export type DailyReturn = {
  date: string,
  value: number
}

export class PreCalcCache {
  private ohlcCache: OhlcCache
  private indicatorCache: IndicatorCache
  private tradeableAssets: string[]
  private preCalcs: PreCalc[]
  private fromDate: Dayjs
  private toDate: Dayjs
  private startingBalance: number
  private loaded: boolean = false

  private cachedPreCalcs: Map<string, Map<string, number>> = new Map<string, Map<string, number>>()

  constructor(
    ohlcCache: OhlcCache, 
    indicatorCache: IndicatorCache, 
    tradeableAssets: string[],
    preCalcs: PreCalc[],
    fromDate: Dayjs,
    toDate: Dayjs,
    startingBalance: number
  ) {
    this.ohlcCache = ohlcCache
    this.indicatorCache = indicatorCache
    this.tradeableAssets = tradeableAssets
    this.preCalcs = preCalcs
    this.fromDate = fromDate
    this.toDate = toDate
    this.startingBalance = startingBalance
  }

  async load(): Promise<void> {
    const loadPromises = this.preCalcs.map(async (preCalc) => {
      const dailyReturns = this.calculateReturns(preCalc.node)
      const preCalcFn = this.getPreCalcFunction(preCalc.fn)
      const calculatedPreCalc = await preCalcFn(dailyReturns, preCalc.params)
      this.cachedPreCalcs.set(preCalc.node.id, new Map(Object.entries(calculatedPreCalc)))
    })

    await Promise.all(loadPromises)

    this.loaded = true
  }

  isLoaded(): boolean {
    return this.loaded
  }

  getPreCalcForNodeId(nodeId: string): Map<string, number> {
    const preCalc = this.cachedPreCalcs.get(nodeId)

    if (!preCalc) {
      throw new Error(`PreCalc not found for node ID: ${nodeId}`)
    }

    return preCalc
  }

  private calculateReturns(node: TradingBotNode): DailyReturn[] {
    const interpreter = new Interpreter(this.indicatorCache, this, this.tradeableAssets)
    const rebalancer = new Rebalancer(this.ohlcCache, this.startingBalance)

    let currentDate = this.fromDate.clone()
    const allocationResults: AllocationResult[] = []

    while (currentDate <= this.toDate) {
        // Calculate allocations for date
        const allocations = interpreter.evaluate(
            node as TradingBotNode, 
            this.indicatorCache, 
            currentDate
        )
        
        rebalancer.rebalance(currentDate.format('YYYY-MM-DD'), allocations)

        allocationResults.push({
            date: currentDate.format('YYYY-MM-DD'),
            tickers: allocations,
            value: rebalancer.getBalance()
        })

        if (currentDate.isSame(this.toDate)) {
            break
        }

        currentDate = this.getNextMarketDate(currentDate)
    }

    return this.calculateDailyReturns(allocationResults);
  }

  private getPreCalcFunction(fn: string): CallableFunction {
    switch(fn) {
      case 'precalc-standard-deviation-return':
        return standardDeviationOfReturn
      default:
        throw new Error(`Unknown preCalc function: ${fn}`)
    }
  }

  private getNextMarketDate(date: Dayjs): Dayjs {
    if (!this.ohlcCache) {
        throw new Error('ohlcCache not loaded.')
    }

    do {
        date = date.add(1, 'day')
    } while (!this.ohlcCache.hasBarsForDate(date))

    return date
  }

  private calculateDailyReturns(allocationResults: AllocationResult[]): DailyReturn[] {
    console.log('allocationResults', allocationResults); 
    if (allocationResults.length < 2) {
        throw new Error("At least two balances are required to calculate returns.");
    }

    const returns: DailyReturn[] = [];
    
    for (let i = 1; i < allocationResults.length; i++) {
        const dailyReturn = (allocationResults[i].value - allocationResults[i - 1].value) / allocationResults[i - 1].value;
        returns.push({ date: allocationResults[i].date, value: dailyReturn });
    }

    console.log('daily returns', returns)

    return returns;
  }
}