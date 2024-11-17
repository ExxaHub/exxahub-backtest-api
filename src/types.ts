export interface AlgorithmNode {
    id: string;
    step: string;
    name?: string;
    ticker?: string;
    exchange?: string;
    'lhs-fn-params'?: Record<string, any>;
    'rhs-fn'?: string;
    'lhs-fn'?: string;
    'lhs-val'?: string;
    'rhs-fn-params'?: Record<string, any>;
    comparator?: string;
    'rhs-val'?: string;
    'is-else-condition'?: boolean;
    children?: AlgorithmNode[];
    weight?: { num: number; den: number };
    collapsed?: boolean;
  }


export interface Algorithm {
    description: string;
    name: string;
    id: string;
    step: 'root';
    rebalance: string;
    assetClass: string;
    assetClasses: string[];
    children: AlgorithmNode[];
}

export type AllocationAsset = {
    ticker: string;
    name: string;
    exchange: string;
    percentage: number;
}