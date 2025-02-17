import { describe, it, expect, mock } from "bun:test";
import { AlpacaStockClient } from "../clients/AlpacaClient";
import { OhlcCache } from "./OhlcCache";
import type { Symphony, OHLCBar, TradingBotNode } from "../types/types";
import { IndicatorCache } from "./IndicatorCache";
import { Parser } from "./Parser";
import { Interpreter } from "./Interpreter";
import { PreCalcCache } from "./PreCalcCache";
import dayjs from "dayjs";

const parser = new Parser()
const alpacaStockClient = new AlpacaStockClient()
const ohlcCache = new OhlcCache(alpacaStockClient, [], 10, 10)
const indicatorCache = new IndicatorCache(ohlcCache, [])
const preCalcCache = new PreCalcCache(ohlcCache, indicatorCache, [], [], dayjs(), dayjs(), 100)

describe("Interpreter", () => {
  it("Evaluates a weight equal algorithm correctly", async () => {
    const algorithm: TradingBotNode = await import('../testData/tradingBots/weightEqual.json') as unknown as TradingBotNode;

    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(25)
    expect(allocations['QQQ']).toEqual(25)
    expect(allocations['DIA']).toEqual(50)
  });

  it("Evaluates a weight specified algorithm correctly", async () => {
    const algorithm: TradingBotNode = await import('../testData/tradingBots/weightSpecified.json') as unknown as TradingBotNode;

    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(30)
    expect(allocations['QQQ']).toEqual(45)
    expect(allocations['DIA']).toEqual(25)
  });

  it("Evaluates a cumulative return algorithm IF block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-cumulative-return-10': return 6
        case 'SPY-cumulative-return-20': return 5
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/cumulativeReturn.json') as unknown as TradingBotNode;

    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(100)
  });

  it("Evaluates a cumulative return algorithm ELSE block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-cumulative-return-10': return 5
        case 'SPY-cumulative-return-20': return 6
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/cumulativeReturn.json') as unknown as TradingBotNode;

    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['BIL']).toEqual(100)
  });

  it("Evaluates a exponentialMovingAverageOfPrice algorithm IF block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-exponential-moving-average-price-10': return 6
        case 'SPY-exponential-moving-average-price-20': return 5
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/exponentialMovingAverageOfPrice.json') as unknown as TradingBotNode;

    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(100)
  });

  it("Evaluates a exponentialMovingAverageOfPrice algorithm ELSE block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-exponential-moving-average-price-10': return 5
        case 'SPY-exponential-moving-average-price-20': return 6
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/exponentialMovingAverageOfPrice.json') as unknown as TradingBotNode;

    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['BIL']).toEqual(100)
  });

  it("Evaluates a maxDrawdown algorithm IF block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-max-drawdown-10': return 6
        case 'SPY-max-drawdown-20': return 5
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/maxDrawdown.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(100)
  });

  it("Evaluates a maxDrawdown algorithm ELSE block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-max-drawdown-10': return 5
        case 'SPY-max-drawdown-20': return 6
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/maxDrawdown.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['BIL']).toEqual(100)
  });

  it("Evaluates a movingAverageOfPrice algorithm IF block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-moving-average-price-10': return 6
        case 'SPY-moving-average-price-20': return 5
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/movingAverageOfPrice.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(100)
  });

  it("Evaluates a movingAverageOfPrice algorithm ELSE block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-moving-average-price-10': return 5
        case 'SPY-moving-average-price-20': return 6
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/movingAverageOfPrice.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['BIL']).toEqual(100)
  });

  it("Evaluates a movingAverageOfReturn algorithm IF block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-moving-average-return-10': return 6
        case 'SPY-moving-average-return-20': return 5
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/movingAverageOfReturn.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(100)
  });

  it("Evaluates a movingAverageOfReturn algorithm ELSE block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-moving-average-return-10': return 5
        case 'SPY-moving-average-return-20': return 6
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/movingAverageOfReturn.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['BIL']).toEqual(100)
  });

  it("Evaluates a relativeStrengthIndex algorithm IF block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-relative-strength-index-10': return 6
        case 'SPY-relative-strength-index-20': return 5
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/relativeStrengthIndex.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(100)
  });

  it("Evaluates a relativeStrengthIndex algorithm ELSE block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-relative-strength-index-10': return 5
        case 'SPY-relative-strength-index-20': return 6
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/relativeStrengthIndex.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['BIL']).toEqual(100)
  });

  it("Evaluates a standardDeviationOfPrice algorithm IF block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-standard-deviation-price-10': return 6
        case 'SPY-standard-deviation-price-20': return 5
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/standardDeviationOfPrice.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(100)
  });

  it("Evaluates a standardDeviationOfPrice algorithm ELSE block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-standard-deviation-price-10': return 5
        case 'SPY-standard-deviation-price-20': return 6
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/standardDeviationOfPrice.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['BIL']).toEqual(100)
  });

  it("Evaluates a standardDeviationOfReturn algorithm IF block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-standard-deviation-return-10': return 6
        case 'SPY-standard-deviation-return-20': return 5
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/standardDeviationOfReturn.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(100)
  });

  it("Evaluates a standardDeviationOfReturn algorithm ELSE block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-standard-deviation-return-10': return 5
        case 'SPY-standard-deviation-return-20': return 6
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/standardDeviationOfReturn.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['BIL']).toEqual(100)
  });

  it("Evaluates a fixedValueCompare algorithm IF block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-relative-strength-index-10': return 79
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/fixedValueCompare.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['SPY']).toEqual(100)
  });

  it("Evaluates a fixedValueCompare algorithm ELSE block correctly", async () => {
    indicatorCache.getIndicatorValue = mock((ticker: string, fn: string, params: Record<string, any> = {}): number => {
      const key = `${ticker}-${fn}-${params.window}`
      switch(key) {
        case 'SPY-relative-strength-index-10': return 81
        default: throw new Error(`No indicator stubbed for key: ${key}`)
      }
    });

    const algorithm: TradingBotNode = await import('../testData/tradingBots/fixedValueCompare.json') as unknown as TradingBotNode;
    const interpreter = new Interpreter(indicatorCache, preCalcCache, ['SPY', 'QQQ', 'DIA', 'BIL'])
    const allocations = interpreter.evaluate(algorithm, indicatorCache)

    expect(allocations['BIL']).toEqual(100)
  });
});