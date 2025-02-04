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

      getBarsForDateRange(tickers: string[], fromDate: string, toDate: string) {
        return Promise.resolve({
          'SPY': [
            { date: "2024-11-10", close: 100 },
            { date: "2024-11-11", close: 102 },
            { date: "2024-11-12", close: 104 },
            { date: "2024-11-13", close: 106 },
            { date: "2024-11-14", close: 108 },
          ],
          'QQQ': [
            { date: "2024-11-10", close: 200 },
            { date: "2024-11-11", close: 202 },
            { date: "2024-11-12", close: 204 },
            { date: "2024-11-13", close: 206 },
            { date: "2024-11-14", close: 208 },
          ],
        })
      }
    }
  };
});

mock.module("../repositories/OhlcBarSummaryRepository", () => {
  return {
    OhlcBarSummaryRepository: class {
      getLastBarDates(symbols: string[]) {
        return Promise.resolve({
          'SPY': "2024-11-14",
          'QQQ': "2024-11-14",
        })
      }

      refreshMaterializedView() {
        return Promise.resolve()
      }
    }
  }
})

describe("OhlcCache", () => {
  it("Loads OHLC bars from client", async () => {
    const ohlcCache = new OhlcCache(['SPY', 'QQQ'], 10, 10)

    await ohlcCache.load(dayjs("2024-11-10"), dayjs("2024-11-14"))

    expect(ohlcCache.getBars('SPY')).toEqual([
      { date: "2024-11-10", close: 100 },
      { date: "2024-11-11", close: 102 },
      { date: "2024-11-12", close: 104 },
      { date: "2024-11-13", close: 106 },
      { date: "2024-11-14", close: 108 },
    ])

    expect(ohlcCache.getBars('QQQ')).toEqual([
      { date: "2024-11-10", close: 200 },
      { date: "2024-11-11", close: 202 },
      { date: "2024-11-12", close: 204 },
      { date: "2024-11-13", close: 206 },
      { date: "2024-11-14", close: 208 },
    ])

    expect(() => ohlcCache.getBars('DIA')).toThrow('Unable to load OHLC bars for ticker: DIA')
  });
});