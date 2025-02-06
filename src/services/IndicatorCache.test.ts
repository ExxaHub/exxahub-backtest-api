import { describe, it, expect, mock } from "bun:test";
import { AlpacaStockClient } from "../clients/AlpacaClient";
import { OhlcCache } from "./OhlcCache";
import type { OHLCBar } from "../types/types";
import { IndicatorCache } from "./IndicatorCache";
import dayjs from "dayjs";

const indicatorStartDate = dayjs("2024-01-01").unix()
const tradeableStartDate = dayjs("2024-01-15").unix()
const tradeableEndDate = dayjs("2024-11-10").unix()
const tradeableAssets = ['SPY']
const indicatorAssets = ['QQQ']
const maxWindow = 10

const ohlcCache = new OhlcCache(
  indicatorStartDate,
  tradeableStartDate,
  tradeableEndDate,
  tradeableAssets,
  indicatorAssets,
  maxWindow
)

ohlcCache.getBars = mock((ticker: string): (number | null)[] => {
  switch(ticker) {
    case 'SPY': 
      return [
        100,
        105,
        102,
        108,
        110,
      ]

    case 'QQQ': 
      return [
        100,
        97,
        100,
        91,
        100,
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
    ], 10)
    await indicatorCache.load()

    expect(indicatorCache.getIndicatorValue('SPY', 'relative-strength-index', { window: 3 }, 11)).toEqual(89.0909)
    expect(indicatorCache.getIndicatorValue('QQQ', 'max-drawdown', { window: 3 }, 11)).toEqual(9)

    expect(
      () => indicatorCache.getIndicatorValue('QQQ', 'relative-strength-index', { window: 3 })
    ).toThrow('Unable to get cached indicator: QQQ-relative-strength-index-3')
  });
});