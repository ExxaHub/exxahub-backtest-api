export interface SymphonyNode {
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
    'window-days'?: string;
    children?: SymphonyNode[];
    weight?: { num: number | string; den: number | string };
    collapsed?: boolean;
    rebalance?: string;
    description?: string;
    'select-fn'?: string;
    'select-n'?: string;
    'sort-by-fn'?: string;
    'sort-by-fn-params'?: Record<string, any>;
}

export interface Symphony {
    description: string;
    name: string;
    id: string;
    step: "root";
    rebalance: string;
    assetClass?: string;
    assetClasses?: string[];
    children: SymphonyNode[];
}

export enum TradingBotNodeType {
    root = 'root',
    group = 'group',
    weight_cash_equal = 'wt-cash-equal',
    weight_cash_specified = 'wt-cash-specified',
    weight_inverse_volatility = 'wt-inverse-volatility',
    filter = 'filter',
    if_then_else = 'if-then-else',
    condition = 'condition',
    asset = 'asset'
}

export enum TradingBotRebalanceType {
    Daily = 'daily'
}

export enum TradingBotVersion {
    V1 = 'v1'
}

export interface TradingBotNodeRoot {
    description: string;
    name: string;
    id: string;
    node_type: TradingBotNodeType.root;
    rebalance: TradingBotRebalanceType;
    version: TradingBotVersion;
    children: TradingBotNode[];
}

export type TradingBotNodeGroup = {
    weight?: {
        num: number,
        den: number
    },
    id: string,
    node_type: TradingBotNodeType.group,
    name: string,
    children: TradingBotNode[]
}

export type TradingBotNodeWeightCashEqual = {
    id: string,
    node_type: TradingBotNodeType.weight_cash_equal,
    children: TradingBotNode[]
}

export type TradingBotNodeWeightCashSpecified = {
    id: string,
    weight?: {
        num: number,
        den: number
    },
    node_type: TradingBotNodeType.weight_cash_specified,
    children: TradingBotNode[]
}

export type TradingBotNodeWeightInverseVolatility = {
    id: string,
    node_type: TradingBotNodeType.weight_inverse_volatility,
    params: {
        window: number
    },
    children: TradingBotNode[]
}

export type TradingBotNodeFilter = {
    id: string,
    node_type: TradingBotNodeType.filter,
    sort: {
        fn: string,
        params: {
            window: number
        }
    },
    select: {
        fn: string,
        num: number,
    },
    children: TradingBotNode[]
}

export enum TradingBotNodeIfThenElseConditionType {
    AllOf = 'allOf',
    AnyOf = 'anyOf',
}

export type TradingBotNodeIfThenElse = {
    weight?: {
        num: number,
        den: number
    },
    id: string,
    node_type: TradingBotNodeType.if_then_else
    condition_type: "allOf" | "anyOf",
    conditions: TradingBotNodeCondition[],
    then_children: TradingBotNode[],
    else_children: TradingBotNode[]
}

export type TradingBotNodeCondition = {
    id: string,
    node_type: TradingBotNodeType.condition,
    lhs_fn: string,
    lhs_fn_params: {
        window?: number
    },
    lhs_val: string,
    rhs_fn?: string,
    rhs_fn_params?: {
        window?: number
    },
    rhs_fixed_val: boolean,
    rhs_val?: string,
    comparator: string
}

export type TradingBotNodeAsset = {
    weight?: {
        num: number,
        den: number
    },
    ticker: string,
    name: string,
    id: string,
    node_type: TradingBotNodeType.asset
}

export type TradingBotNode = 
    | TradingBotNodeRoot
    | TradingBotNodeGroup 
    | TradingBotNodeWeightCashEqual 
    | TradingBotNodeWeightCashSpecified
    | TradingBotNodeWeightInverseVolatility
    | TradingBotNodeFilter
    | TradingBotNodeIfThenElse
    | TradingBotNodeCondition
    | TradingBotNodeAsset 

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

export type PreCalc = {
    fn: string,
    params: { window: number }
    node: TradingBotNode
}

export interface ClientInterface {
    getBarsForSymbols(symbols: string[]): Promise<{[key: string]: OHLCBar[]}>
    getBarsForSymbol(symbol: string, dateStart: string, dateEnd?: string): Promise<{symbol: string, bars: OHLCBar[]}>
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

export type CloseBar = {
    close: number;
    date: string;
}