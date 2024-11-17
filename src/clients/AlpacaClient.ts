import {alpacaApiKeyId, alpacaApiSecretKey} from "../config/alpaca";

export type AlpacaOHLCBar = {
    c: number;
    h: number;
    l: number;
    o: number;
    t: string;
    v: number;
}

export type OHLCBar = {
    close: number;
    high: number;
    low: number;
    open: number;
    date: string;
    volume: number;
    [key: string]: unknown;
}

export type AlpacaHistoricalBarsResponse =
    {
        "bars": {
            [key: string]: AlpacaOHLCBar[]
        },
        "next_page_token": string
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

export class AlpacaStockClient extends AlpacaBaseClient {
    async getBars(symbols: string[]): Promise<{[key: string]: OHLCBar[]}> {
        const params = {
            symbols: symbols.join(','),
            timeframe: '1Day',
            start: '2023-01-03',
            limit: '1000',
            adjustment: 'raw',
            feed: 'sip',
            sort: 'asc'
        }
        const resp = await this.get<AlpacaHistoricalBarsResponse>('/v2/stocks/bars', params)
        return this.normalizeAlpacaBars(resp.bars)
    }

    async getCorporateActions(symbols: string[]): Promise<AlpacaCorporateActionsResponse> {
        const params = {
            symbols: symbols.join(','),
            types: 'reverse_split,forward_split,cash_dividend,stock_dividend',
            start: '2022-01-03',
        }
        const resp = await this.get<AlpacaCorporateActionsResponse>('/v1beta1/corporate-actions', params)
        return resp
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