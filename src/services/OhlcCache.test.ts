import { describe, it, expect, mock } from "bun:test";
import { AlpacaStockClient } from "../clients/AlpacaClient";
import { OhlcCache } from "./OhlcCache";
import type { OHLCBar } from "../types/types";
import dayjs from "dayjs";

const alpacaStockClient = new AlpacaStockClient()

mock.module("../repositories/OhlcBarRepository", () => {
  return {
    OhlcBarRepository: class {
      saveBars(ticker: string, bars: OHLCBar[]) {
        return Promise.resolve(true)
      }

      getDateOffset(symbol: string, date: string, offset: number) {
        return Promise.resolve(date)
      }

      getDates(ticker: string, fromDate: number, toDate: number) {
        return [
          dayjs("2024-01-01").unix(),
          dayjs("2024-01-02").unix(),
          dayjs("2024-01-03").unix(),
          dayjs("2024-01-04").unix(),
          dayjs("2024-01-05").unix()
        ]
      }

      getBarsForDates(tickers: string[], fromDate: string, toDate: string) {
        return Promise.resolve({
          'SPY': [100, 102, 104, 106, 108],
          'QQQ': [200, 202, 204, 206, 208],
        })
      }
    }
  };
});

describe("OhlcCache", () => {
  it("Loads OHLC bars from client", async () => {

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

    await ohlcCache.load()

    expect(ohlcCache.getBars('SPY')).toEqual([100, 102, 104, 106, 108])
    expect(ohlcCache.getBars('QQQ')).toEqual([200, 202, 204, 206, 208])

    try {
      expect(ohlcCache.getBars('DIA')).toThrow()
    } catch (e) {
      expect((e as Error).message).toEqual('Unable to load OHLC bars for ticker: DIA')
    }
  });
});