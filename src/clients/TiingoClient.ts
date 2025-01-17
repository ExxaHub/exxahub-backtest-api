import { tiingoApiToken } from "../config/marketDataProviders";
import type { ClientInterface, OHLCBar } from "../types/types";

export type TiingoOHLCBar =    {
    date: string,
    close: number,
    high: number,
    low: number,
    open: number,
    volume: number,
    adjClose: number,
    adjHigh: number,
    adjLow: number,
    adjOpen: number,
    adjVolume: number,
    divCash: number,
    splitFactor: number
}

type TiingoDailyBarsRequest = {
    resampleFreq: 'daily',
    startDate: string,
    endDate?: string,
    format: 'json',
    sort: 'date'
}

export type TiingoLastPriceResponse = Array<{
    ticker: string,
    timestamp: string
    quoteTimestamp: string
    lastSaleTimeStamp: string
    last: number,
    lastSize: number,
    tngoLast: number,
    prevClose: number,
    open: number,
    high: number,
    low: number,
    mid: number,
    volume: number,
    bidSize: number,
    bidPrice: number,
    askSize: number,
    askPrice: number,
}>

type ErrorResponse = {
    detail: string
}

export class TiingoClient implements ClientInterface {
    protected baseUrl = 'https://api.tiingo.com/tiingo'

    protected url(path: string): string {
        return `${this.baseUrl}${path}`
    }

    private async get<T>(endpoint: string, params: Record<string, string>): Promise<T> {
        params['token'] = tiingoApiToken()
        const urlParams = new URLSearchParams(params)
        const response = await fetch(this.url(`${endpoint}?${urlParams.toString()}`), {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.status !== 200) {
            const json = await response.json() as ErrorResponse
            throw new Error(json.detail)
        }

        return await response.json() as T;
    }

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

    async getBarsForSymbol(symbol: string, startDate?: string, endDate?: string): Promise<{symbol: string, bars: OHLCBar[]}> {
        let bars: OHLCBar[] = []
        let resp: TiingoOHLCBar[]
        
        const params: TiingoDailyBarsRequest = {
            resampleFreq: 'daily',
            startDate: '1990-01-01',
            format: 'json',
            sort: 'date'
        }

        if (startDate) {
            params.startDate = startDate
        }

        if (endDate) {
            params.endDate = endDate
        }

        resp = await this.get<TiingoOHLCBar[]>(`/daily/${symbol}/prices`, params)

        const normalizedBars = this.normalizeTiingoBars({ [symbol]: resp })
        bars = normalizedBars[symbol]
        return { symbol, bars }
    }

    async getCurrentPriceForSymbol(symbol: string): Promise<Record<string, number>> {
        const params = {}

        const resp = await this.get<TiingoLastPriceResponse>(`/iex/${symbol}`, params)
        
        return {
            [resp[0].timestamp.split('T')[0]]: resp[0].last
        }
    }

    private normalizeTiingoBars(bars: {[key: string]: TiingoOHLCBar[]}): {[key: string]: OHLCBar[]} {
        const normalizedBars: {[key: string]: OHLCBar[]} = {}
        Object.keys(bars).forEach(symbol => {
            if (normalizedBars[symbol] === undefined) {
                normalizedBars[symbol] = []
            }

            normalizedBars[symbol] = bars[symbol].map(tiingoBar => {
                return {
                    close: tiingoBar.adjClose,
                    high: tiingoBar.adjHigh,
                    low: tiingoBar.adjLow,
                    open: tiingoBar.adjOpen,
                    date: tiingoBar.date.split('T')[0],
                    volume: tiingoBar.adjVolume,
                }
            })
        })

        return normalizedBars
    }
}