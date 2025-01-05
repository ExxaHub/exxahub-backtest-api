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
    children?: SymphonyNode[];
    weight?: { num: number; den: number };
    collapsed?: boolean;
    rebalance?: string;
    description?: string;
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
    if_then_else = 'if-then-else',
    condition = 'condition',
    asset = 'asset'
}

export interface TradingBotNodeRoot {
    description: string;
    name: string;
    id: string;
    node_type: TradingBotNodeType.root;
    rebalance: string;
    version: 'v1';
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