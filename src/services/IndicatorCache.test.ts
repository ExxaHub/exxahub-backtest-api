import { describe, it, expect, mock } from "bun:test";
import { AlpacaStockClient } from "../clients/AlpacaClient";
import { OhlcCache } from "./OhlcCache";
import type { OHLCBar } from "../backtester/types";
import { IndicatorCache } from "./IndicatorCache";

const alpacaStockClient = new AlpacaStockClient()
const ohlcCache = new OhlcCache(alpacaStockClient, ['SPY', 'QQQ'])

ohlcCache.getBars = mock((ticker: string): OHLCBar[] => {
  switch(ticker) {
    case 'SPY': 
      return [
        { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
        { date: "2024-11-11", open: 100, high: 110, low: 90, close: 105, volume: 10 },
        { date: "2024-11-12", open: 105, high: 115, low: 95, close: 102, volume: 10 },
        { date: "2024-11-13", open: 102, high: 112, low: 92, close: 108, volume: 10 },
        { date: "2024-11-14", open: 108, high: 118, low: 98, close: 110, volume: 10 },
      ]

    case 'QQQ': 
      return [
        { date: "2024-11-10", open: 102, high: 105, low: 95, close: 100, volume: 10 },
        { date: "2024-11-11", open: 101, high: 106, low: 96, close: 97, volume: 10 },
        { date: "2024-11-12", open: 99, high: 108, low: 94, close: 100, volume: 10 },
        { date: "2024-11-13", open: 103, high: 107, low: 93, close: 91, volume: 10 },
        { date: "2024-11-14", open: 104, high: 110, low: 92, close: 100, volume: 10 },
      ]

    default:
      throw new Error(`No bars available for ticker: ${ticker}`)
  }
});

describe("IndicatorCache", () => {
  it("Loads indicator values", async () => {
    const indicatorCache = new IndicatorCache(ohlcCache, [
      {
        fn: "relative-strength-index",
        params: {
          window: 3,
        },
        ticker: "SPY",
      },
      {
        fn: "max-drawdown",
        params: {
          window: 3,
        },
        ticker: "QQQ",
      },
    ])
    await indicatorCache.load()

    expect(indicatorCache.getIndicatorValue('SPY', 'relative-strength-index', { window: 3 })).toEqual(83.3689)
    expect(indicatorCache.getIndicatorValue('QQQ', 'max-drawdown', { window: 3 })).toEqual(9)

    expect(
      () => indicatorCache.getIndicatorValue('QQQ', 'relative-strength-index', { window: 3 })
    ).toThrow('Unable for get cached indicator: QQQ-relative-strength-index-3')
  });
});