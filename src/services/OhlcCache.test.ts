import { describe, it, expect, mock } from "bun:test";
import { AlpacaStockClient } from "../clients/AlpacaClient";
import { OhlcCache } from "./OhlcCache";
import { OhlcBarRepository } from "../repositories/OhlcBarRepository";
import type { OHLCBar } from "../types/types";
import type { Dayjs } from "dayjs";

const alpacaStockClient = new AlpacaStockClient()
const ohlcBarRepository = new OhlcBarRepository()
const ohlcCache = new OhlcCache(alpacaStockClient, ['SPY', 'QQQ'])

alpacaStockClient.getBarsForSymbols = mock((symbols: string[]) => {
  return Promise.resolve({
    'SPY': [
      { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
      { date: "2024-11-11", open: 101, high: 106, low: 96, close: 102, volume: 10 },
      { date: "2024-11-12", open: 102, high: 107, low: 97, close: 104, volume: 10 },
      { date: "2024-11-13", open: 103, high: 108, low: 98, close: 106, volume: 10 },
      { date: "2024-11-14", open: 104, high: 109, low: 99, close: 108, volume: 10 },
    ],
    'QQQ': [
      { date: "2024-11-10", open: 200, high: 205, low: 195, close: 200, volume: 20 },
      { date: "2024-11-11", open: 201, high: 206, low: 196, close: 202, volume: 20 },
      { date: "2024-11-12", open: 202, high: 207, low: 197, close: 204, volume: 20 },
      { date: "2024-11-13", open: 203, high: 208, low: 198, close: 206, volume: 20 },
      { date: "2024-11-14", open: 204, high: 209, low: 199, close: 208, volume: 20 },
    ],
  })
});

ohlcBarRepository.getLastBarDates = mock((symbols: string[]) => {
  return Promise.resolve({
    'SPY': "2024-11-14",
    'QQQ': "2024-11-14",
  })
});

ohlcBarRepository.saveBars = mock((ticker: string, bars: OHLCBar[]) => {
  return Promise.resolve(true)
})

ohlcCache.getBars = mock((ticker: string, fromDate?: Dayjs, toDate?: Dayjs): OHLCBar[] => {
  switch (ticker) {
    case 'SPY':
      return [
        { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
        { date: "2024-11-11", open: 101, high: 106, low: 96, close: 102, volume: 10 },
        { date: "2024-11-12", open: 102, high: 107, low: 97, close: 104, volume: 10 },
        { date: "2024-11-13", open: 103, high: 108, low: 98, close: 106, volume: 10 },
        { date: "2024-11-14", open: 104, high: 109, low: 99, close: 108, volume: 10 },
      ]
    case 'QQQ':
      return [
        { date: "2024-11-10", open: 200, high: 205, low: 195, close: 200, volume: 20 },
        { date: "2024-11-11", open: 201, high: 206, low: 196, close: 202, volume: 20 },
        { date: "2024-11-12", open: 202, high: 207, low: 197, close: 204, volume: 20 },
        { date: "2024-11-13", open: 203, high: 208, low: 198, close: 206, volume: 20 },
        { date: "2024-11-14", open: 204, high: 209, low: 199, close: 208, volume: 20 },
      ]
    default:
      throw new Error(`Unable to load OHLC bars for ticker: ${ticker}`)
  }
})


describe("OhlcCache", () => {
  it("Loads OHLC bars from client", async () => {
    await ohlcCache.load("2024-11-10", "2024-11-14")

    expect(ohlcCache.getBars('SPY')).toEqual([
      { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
      { date: "2024-11-11", open: 101, high: 106, low: 96, close: 102, volume: 10 },
      { date: "2024-11-12", open: 102, high: 107, low: 97, close: 104, volume: 10 },
      { date: "2024-11-13", open: 103, high: 108, low: 98, close: 106, volume: 10 },
      { date: "2024-11-14", open: 104, high: 109, low: 99, close: 108, volume: 10 },
    ])

    expect(ohlcCache.getBars('QQQ')).toEqual([
      { date: "2024-11-10", open: 200, high: 205, low: 195, close: 200, volume: 20 },
      { date: "2024-11-11", open: 201, high: 206, low: 196, close: 202, volume: 20 },
      { date: "2024-11-12", open: 202, high: 207, low: 197, close: 204, volume: 20 },
      { date: "2024-11-13", open: 203, high: 208, low: 198, close: 206, volume: 20 },
      { date: "2024-11-14", open: 204, high: 209, low: 199, close: 208, volume: 20 },
    ])

    expect(() => ohlcCache.getBars('DIA')).toThrow('Unable to load OHLC bars for ticker: DIA')
  });
});