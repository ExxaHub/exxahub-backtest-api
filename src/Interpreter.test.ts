import { describe, it, expect, mock } from "bun:test";
import { AlpacaStockClient } from "./clients/AlpacaClient";
import { OhlcCache } from "./OhlcCache";
import type { Algorithm, OHLCBar } from "./types";
import { IndicatorCache } from "./IndicatorCache";
import { Parser } from "./Parser";
import { Interpreter } from "./Interpreter";

const parser = new Parser()
const alpacaStockClient = new AlpacaStockClient()
const ohlcCache = new OhlcCache(alpacaStockClient, [])
const indicatorCache = new IndicatorCache(ohlcCache, [])

describe("Interpreter", () => {
  it("Evaluates a weight equal algorithm correctly", async () => {
    const algorithm: Algorithm = await import('./testAlgorithms/weightEqual.json') as unknown as Algorithm;

    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

    expect(allocations['SPY']).toEqual(25)
    expect(allocations['QQQ']).toEqual(25)
    expect(allocations['DIA']).toEqual(50)
  });

  it("Evaluates a weight specified algorithm correctly", async () => {
    const algorithm: Algorithm = await import('./testAlgorithms/weightSpecified.json') as unknown as Algorithm;

    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/cumulativeReturn.json') as unknown as Algorithm;

    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/cumulativeReturn.json') as unknown as Algorithm;

    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/exponentialMovingAverageOfPrice.json') as unknown as Algorithm;

    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/exponentialMovingAverageOfPrice.json') as unknown as Algorithm;

    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/maxDrawdown.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/maxDrawdown.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/movingAverageOfPrice.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/movingAverageOfPrice.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/movingAverageOfReturn.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/movingAverageOfReturn.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/relativeStrengthIndex.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/relativeStrengthIndex.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/standardDeviationOfPrice.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/standardDeviationOfPrice.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/standardDeviationOfReturn.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

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

    const algorithm: Algorithm = await import('./testAlgorithms/standardDeviationOfReturn.json') as unknown as Algorithm;
    const interpreter = new Interpreter(indicatorCache)
    const allocations = interpreter.evaluate(algorithm)

    expect(allocations['BIL']).toEqual(100)
  });
});