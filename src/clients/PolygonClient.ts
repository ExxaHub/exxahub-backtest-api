import dayjs from "dayjs";
import { polygonApiToken } from "../config/marketDataProviders";
import type { ClientInterface, OHLCBar } from "../types/types";
import { logPerformance } from "../decorators/performance";

type PolygonOHLCBar = {
    c: number,
    h: number,
    l: number,
    n: number,
    o: number,
    t: number,
    v: number,
    vw: number
}

// https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksticker__range__multiplier___timespan___from___to
export type PolygonAggregateBarsResponse = {
    adjusted: boolean,
    next_url?: string,
    queryCount: number,
    request_id: string,
    results: PolygonOHLCBar[],
    resultsCount: number,
    status: string,
    ticker: string
}

// https://polygon.io/docs/stocks/get_v2_last_trade__stocksticker
export type PolygonLastTradeResponse = {
    request_id: string
    results: {
      T: string
      c: number[],
      f: number
      i: string
      p: number,
      q: number,
      r: number,
      s: number,
      t: number,
      x: number,
      y: number,
      z: number
    },
    status: string
  }

type ErrorResponse = {
    detail: string
}

export class PolygonClient implements ClientInterface {
    protected baseUrl = 'https://api.polygon.io'

    protected url(path: string): string {
        return `${this.baseUrl}${path}`
    }

    private async get<T>(endpoint: string, params: Record<string, string>): Promise<T> {
        const urlParams = new URLSearchParams(params)
        const response = await fetch(this.url(`${endpoint}?${urlParams.toString()}`), {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${polygonApiToken()}`
            },
        });

        if (response.status !== 200) {
            const json = await response.json() as ErrorResponse
            throw new Error(json.detail)
        }

        return await response.json() as T;
    }

    @logPerformance()
    async getBarsForSymbols(symbols: string[]): Promise<{[key: string]: OHLCBar[]}> {
        const promises: Promise<{symbol: string, bars: OHLCBar[]}>[] = []

        for (const symbol of symbols) {
            promises.push(this.getBarsForSymbol(symbol))
        }

        const results = await Promise.allSettled(promises)

        const bars: {[key: string]: OHLCBar[]} = {}
        
        for (const result of results) {
            if (result.status === 'rejected') {
                throw new Error(result.reason)
            }

            bars[result.value.symbol] = result.value.bars
        }

        return bars
    }

    @logPerformance()
    async getBarsForSymbol(symbol: string): Promise<{symbol: string, bars: OHLCBar[]}> {
        let bars: OHLCBar[] = []
        let resp: PolygonAggregateBarsResponse

        const timespan = 'day'
        const timespanMultiplier = 1
        const from = '2023-12-24'
        const to = dayjs().format('YYYY-MM-DD')
    
        const queryParams = {
            adjusted: 'true',
            sort: 'asc'
        }

        resp = await this.get<PolygonAggregateBarsResponse>(`/v2/aggs/ticker/${symbol}/range/${timespanMultiplier}/${timespan}/${from}/${to}`, queryParams)

        const normalizedBars = this.normalizeBars({ [symbol]: resp.results })
        bars = normalizedBars[symbol]
        return { symbol, bars }
    }

    @logPerformance()
    async getCurrentPriceForSymbol(symbol: string): Promise<Record<string, number>> {
        const params = {}

        const resp = await this.get<PolygonLastTradeResponse>(`/v2/last/trade/${symbol}`, params)

        // Example nanosecond accuracy SIP Unix Timestamp
        const nanoTimestamp = resp.results.t

        // Convert nanoseconds to milliseconds
        const milliTimestamp = Math.floor(nanoTimestamp / 1e6);

        // Convert to dayjs date-time
        const dateTime = dayjs(milliTimestamp);
        
        return {
            [dateTime.format('YYYY-DD-MM')]: resp.results.p
        }
    }

    private normalizeBars(bars: {[key: string]: PolygonOHLCBar[]}): {[key: string]: OHLCBar[]} {
        const normalizedBars: {[key: string]: OHLCBar[]} = {}
        Object.keys(bars).forEach(symbol => {
            if (normalizedBars[symbol] === undefined) {
                normalizedBars[symbol] = []
            }

            normalizedBars[symbol] = bars[symbol].map(bar => {
                return {
                    close: bar.c,
                    high: bar.h,
                    low: bar.l,
                    open: bar.o,
                    date: dayjs(bar.t).format('YYYY-MM-DD'),
                    volume: bar.v,
                }
            })
        })

        return normalizedBars
    }
}