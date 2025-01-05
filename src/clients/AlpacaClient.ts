import {alpacaApiKeyId, alpacaApiSecretKey} from "../config/marketDataProviders";
import { type ClientInterface, type OHLCBar } from "../backtester/types";

export type AlpacaOHLCBar = {
    c: number;
    h: number;
    l: number;
    o: number;
    t: string;
    v: number;
}

export type AlpacaHistoricalBarsResponse =
    {
        "bars": {
            [key: string]: AlpacaOHLCBar[]
        },
        "next_page_token": string | null
    }

export type AlpacaLatestTradeResponse = {
    "symbol": string,
    "trade": {
      "t": string,
      "x": string,
      "p": number,
      "s": number,
      "c": string[],
      "i": number,
      "z": string
    }
  }    

export type ReverseSplit = {
    symbol: string,
    new_rate: number,
    old_rate: number,
    process_date: string,
    ex_date: string,
    record_date: string,
    payable_date: string,
}

export type AlpacaCorporateAction = {
    reverse_splits: ReverseSplit[],
    forward_splits: Array<{
        symbol: string,
        new_rate: number,
        old_rate: number,
        process_date: string,
        ex_date: string,
        record_date: string,
        payable_date: string,
    }>,
    stock_dividends: Array<{
        symbol: string,
        rate: number,
        process_date: string,
        ex_date: string,
        record_date: string,
        payable_date: string,
    }>,
    cash_dividends: Array<{
        symbol: string,
        rate: number,
        special: boolean,
        foreign: boolean,
        process_date: string,
        ex_date: string,
        record_date: string,
        payable_date: string,
        due_bill_on_date: string,
        due_bill_off_date: string
    }>
}

export type AlpacaCorporateActionsResponse =
    {
        "corporate_actions": AlpacaCorporateAction,
        "next_page_token": string
    }

export class AlpacaBaseClient {
    protected baseUrl = 'https://data.alpaca.markets'

    protected url(path: string): string {
        return `${this.baseUrl}${path}`
    }

    async get<T>(endpoint: string, params: Record<string, string>): Promise<T> {
        const urlParams = new URLSearchParams(params)
        const response = await fetch(this.url(`${endpoint}?${urlParams.toString()}`), {
            method: "GET",
            headers: {
                'APCA-API-KEY-ID': alpacaApiKeyId(),
                'APCA-API-SECRET-KEY': alpacaApiSecretKey(),
                'Accept': "application/json"
            },
        });
        return await response.json() as T;
    }
}

export class AlpacaStockClient extends AlpacaBaseClient implements ClientInterface {
    async getBarsForSymbols(symbols: string[]): Promise<{[key: string]: OHLCBar[]}> {
        const promises: Promise<{symbol: string, bars: OHLCBar[]}>[] = []

        for (const symbol of symbols) {
            promises.push(this.getBarsForSymbol(symbol))
        }

        const results = await Promise.allSettled(promises)

        const bars: {[key: string]: OHLCBar[]} = {}
        
        for (const result of results) {
            if (result.status === 'rejected') {
                console.error(result)
                throw new Error('Unable to fetch data')
            }

            bars[result.value.symbol] = result.value.bars
        }

        return bars
    }

    async getCurrentPriceForSymbol(symbol: string): Promise<Record<string, number>> {
        const params = {}

        const resp = await this.get<AlpacaLatestTradeResponse>(`/v2/stocks/${symbol}/trades/latest`, params)
        
        return {
            [resp.trade.t.split('T')[0]]: resp.trade.p
        }
    }

    private async getBarsForSymbol(symbol: string): Promise<{symbol: string, bars: OHLCBar[]}> {
        let bars: OHLCBar[] = []
        let resp: AlpacaHistoricalBarsResponse | undefined
        do {
            const params = {
                symbols: symbol,
                timeframe: '1Day',
                start: '1990-01-01',
                limit: '1000',
                adjustment: 'all',
                feed: 'sip',
                sort: 'asc'
            }

            if (resp && resp.next_page_token) {
                params.page_token = resp.next_page_token
            }

            resp = await this.get<AlpacaHistoricalBarsResponse>('/v2/stocks/bars', params)
            const normalizedBars = this.normalizeAlpacaBars(resp.bars)
            bars = [...bars, ...normalizedBars[symbol]]
        } while (resp.next_page_token)

        return { symbol, bars }
    }

    private normalizeAlpacaBars(bars: {[key: string]: AlpacaOHLCBar[]}): {[key: string]: OHLCBar[]} {
        const normalizedBars: {[key: string]: OHLCBar[]} = {}
        Object.keys(bars).forEach(symbol => {
            if (normalizedBars[symbol] === undefined) {
                normalizedBars[symbol] = []
            }

            normalizedBars[symbol] = bars[symbol].map(alpacaBar => {
                return {
                    close: alpacaBar.c,
                    high: alpacaBar.h,
                    low: alpacaBar.l,
                    open: alpacaBar.o,
                    date: alpacaBar.t.split('T')[0],
                    volume: alpacaBar.v,
                }
            })
        })

        return normalizedBars
    }
}