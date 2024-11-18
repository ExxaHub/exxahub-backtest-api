import dayjs from "dayjs";
import type { DataProvider } from "./DataProvider";
import type { 
  Algorithm,
  AlgorithmNode,
  AllocationAsset
} from "./types";

export class Interpreter {
  private dataProvider: DataProvider

  constructor(dataProvider: DataProvider) {
    this.dataProvider = dataProvider
  }

  evaluate(algorithm: Algorithm) {
    const rawAllocations = this.evaluateNode(algorithm)
    console.log('raw allocations', rawAllocations)
    return this.combineAllocationsByAsset(rawAllocations as AllocationAsset[])
  }

  private evaluateNode(
    node: AlgorithmNode,
    parentWeight: number = 100
  ): unknown {
    if (node.weight && node.weight.num !== 100) {
      parentWeight = (node.weight.num / node.weight.den) * 100
    }
  
    switch (node.step) {
      case "root": {
        console.log("Evaluating node: root");
        return node.children!.flatMap(childNode => this.evaluateNode(childNode, parentWeight));
      }
  
      case 'wt-cash-equal': {
        console.log("Evaluating node: wt-cash-equal");
        const equalWeight = parentWeight / node.children!.length;
        return node.children!.flatMap((child) => this.evaluateNode(child, equalWeight))
      }
  
      case 'wt-cash-specified': {
        console.log("Evaluating node: wt-cash-specified");
        return node.children!.flatMap((child) => this.evaluateNode(child, parentWeight))
      }
  
      case 'group': {
        return node.children!.flatMap((child) =>
          this.evaluateNode(child, parentWeight)
        );
      }
  
      case 'if': {
        return this.evaluateCondition(node, parentWeight)
      }
  
      case 'asset': {
        console.log('Evaluating node: asset')
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

  private evaluateCondition(node: AlgorithmNode, parentWeight: number = 100): unknown {
    const ifBlock = node.children![0]
    const elseBlock = node.children![1]
  
    const lhsValue = this.getIndicatorValue(ifBlock['lhs-val'], ifBlock['lhs-fn'], ifBlock['lhs-fn-params']);
    const rhsValue = this.getIndicatorValue(ifBlock['rhs-val'], ifBlock['rhs-fn'], ifBlock['rhs-fn-params']);
    const comparator = ifBlock.comparator || "eq"
  
    const comparison = this.compare(lhsValue, rhsValue, comparator);

    console.log('IF', {
      lhs: `${ifBlock['lhs-val']} ${ifBlock['lhs-fn']} ${JSON.stringify(ifBlock['lhs-fn-params'])}`,
      lhs_value: lhsValue,
      comparator: comparator,
      rhs: `${ifBlock['rhs-val']} ${ifBlock['rhs-fn']} ${JSON.stringify(ifBlock['rhs-fn-params'])}`,
      rhs_value: rhsValue,
      result: comparison
    })

    if (comparison) {
      return ifBlock.children!.flatMap((child) =>
        this.evaluateNode(child, parentWeight)
      );
    } else {
      return elseBlock.children!.flatMap((child) =>
        this.evaluateNode(child, parentWeight)
      );
    }
  }
  
  private getIndicatorValue(ticker: string, fn: string, params: Record<string, any> = {}): number {
    console.log(`Fetching ${fn} for ${ticker} with params`, params);
    return this.dataProvider.getIndicatorValue(ticker, fn, params)
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