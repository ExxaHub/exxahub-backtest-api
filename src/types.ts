export interface AlgorithmNode {
    id: string;
    step: string;
    name?: string;
    ticker?: string;
    exchange?: string;
    'lhs-window-days'?: string;
    'lhs-fn-params'?: Record<string, any>;
    'lhs-fn'?: string;
    'lhs-val'?: string;
    'rhs-val'?: string;
    'rhs-fn'?: string;
    'rhs-fixed-value?'?: boolean;
    'rhs-window-days'?: string;
    'rhs-fn-params'?: Record<string, any>;
    comparator?: string;
    'is-else-condition'?: boolean;
    children?: AlgorithmNode[];
    weight?: { num: number; den: number };
    collapsed?: boolean;
  }


export interface Algorithm {
    description: string;
    name: string;
    id: string;
    step: "root";
    rebalance: string;
    assetClass?: string;
    assetClasses?: string[];
    children: AlgorithmNode[];
}

export type AllocationAsset = {
    ticker: string;
    name: string;
    exchange: string;
    percentage: number;
}

export type Indicator = {
    ticker: string,
    fn: string,
    params: {
      window?: number
    }
}

export interface ClientInterface {
    getBarsForSymbols(symbols: string[]): Promise<{[key: string]: OHLCBar[]}>
    getCurrentPriceForSymbol(symbol: string): Promise<Record<string, number>>
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