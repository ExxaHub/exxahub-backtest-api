import dayjs from "dayjs";
import type { IndicatorCache } from "./IndicatorCache";
import type { 
  Algorithm,
  AlgorithmNode,
  AllocationAsset
} from "./types";

enum WeightType {
  Equal = 'equal',
  Specified = 'specified'
}

export class Interpreter {
  private indicatorCache: IndicatorCache

  constructor(indicatorCache: IndicatorCache) {
    this.indicatorCache = indicatorCache
  }

  evaluate(algorithm: Algorithm) {
    const rawAllocations = this.evaluateNode(algorithm)
    return this.combineAllocationsByAsset(rawAllocations as AllocationAsset[])
  }

  private evaluateNode(
    node: AlgorithmNode,
    weightType: WeightType = WeightType.Equal,
    parentWeight: number = 100
  ): unknown {
    if (weightType === WeightType.Specified) {
      parentWeight = (node.weight!.num / node.weight!.den) * 100
    }

    switch (node.step) {
      case "root": {
        console.log("Evaluating node: root");
        return node.children!.flatMap(childNode => this.evaluateNode(childNode, weightType, parentWeight));
      }
  
      case 'wt-cash-equal': {
        console.log("Evaluating node: wt-cash-equal");
        const equalWeight = parentWeight / node.children!.length;
        return node.children!.flatMap((child) => this.evaluateNode(child, WeightType.Equal, equalWeight))
      }
  
      case 'wt-cash-specified': {
        console.log("Evaluating node: wt-cash-specified");
        return node.children!.flatMap((child) => this.evaluateNode(child, WeightType.Specified))
      }
  
      case 'group': {
        return node.children!.flatMap((child) =>
          this.evaluateNode(child, weightType, parentWeight)
        );
      }
  
      case 'if': {
        return this.evaluateCondition(node, weightType, parentWeight)
      }
  
      case 'asset': {
        console.log(`Evaluating node: asset - ${node.ticker}`)
        return [
          {
            ticker: node.ticker,
            name: node.name,
            exchange: node.exchange,
            percentage: parentWeight,
          },
        ];
      }
  
      default:
        console.warn(`Unknown step: ${node.step}`);
    }
  
    return [];
  }

  private evaluateCondition(node: AlgorithmNode, weightType: WeightType, parentWeight: number = 100): unknown {
    const ifBlock = node.children![0]
    const elseBlock = node.children![1]
  
    const lhsParams = ifBlock['lhs-window-days'] ? { window: parseInt(ifBlock['lhs-window-days']) } : ifBlock['lhs-fn-params']!
    const rhsParams = ifBlock['rhs-window-days'] ? { window: parseInt(ifBlock['rhs-window-days']) } : ifBlock['rhs-fn-params']!

    const lhsValue = this.getIndicatorValue(ifBlock['lhs-val'], ifBlock['lhs-fn'], lhsParams);
    const rhsValue = ifBlock['rhs-fixed-value?'] ? parseInt(ifBlock['rhs-val']!) : this.getIndicatorValue(ifBlock['rhs-val'], ifBlock['rhs-fn'], rhsParams);
    const comparator = ifBlock.comparator || "eq"
  
    const comparison = this.compare(lhsValue, rhsValue, comparator);

    console.log('IF', {
      lhs: `${ifBlock['lhs-val']} ${ifBlock['lhs-fn']} ${JSON.stringify(lhsParams)}`,
      lhs_value: lhsValue,
      comparator: comparator,
      rhs: `${ifBlock['rhs-val']} ${ifBlock['rhs-fn']} ${JSON.stringify(rhsParams)}`,
      rhs_value: rhsValue,
      result: comparison
    })

    if (comparison) {
      return ifBlock.children!.flatMap((child) =>
        this.evaluateNode(child, weightType, parentWeight)
      );
    } else {
      return elseBlock.children!.flatMap((child) =>
        this.evaluateNode(child, weightType, parentWeight)
      );
    }
  }
  
  private getIndicatorValue(ticker: string, fn: string, params: Record<string, any> = {}): number {
    console.log(`Fetching ${fn} for ${ticker} with params`, params);
    return this.indicatorCache.getIndicatorValue(ticker, fn, params)
  }
  
  private compare(lhs: number, rhs: number, comparator: string): boolean {
    switch (comparator) {
      case "gt":
        return lhs > rhs;
      case "lt":
        return lhs < rhs;
      case "eq":
        return lhs === rhs;
      default:
        throw new Error(`Unknown comparator: ${comparator}`);
    }
  }

  private combineAllocationsByAsset(allocations: AllocationAsset[]) {
    return allocations.reduce((accumulator: Record<string, number>, allocation: AllocationAsset) => {
      if (accumulator[allocation.ticker] === undefined) {
        accumulator[allocation.ticker] = 0
      }
  
      accumulator[allocation.ticker] += allocation.percentage
      return accumulator
    }, {})
  }
}