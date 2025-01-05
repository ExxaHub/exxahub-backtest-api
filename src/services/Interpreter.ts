import dayjs, { Dayjs } from "dayjs";
import type { IndicatorCache } from "./IndicatorCache";
import { 
  type AllocationAsset,
  type TradingBotNode,
  TradingBotNodeType,
  type TradingBotNodeIfThenElse,
  TradingBotNodeIfThenElseConditionType,
  type TradingBotNodeCondition
} from "../backtester/types";

enum WeightType {
  Equal = 'equal',
  Specified = 'specified'
}

export type Allocations = {
  [key: string]: number | null;
}

export class Interpreter {
  private indicatorCache: IndicatorCache
  private date: string
  private tradeableAssets: string[]

  constructor(indicatorCache: IndicatorCache, tradeableAssets: string[]) {
    this.indicatorCache = indicatorCache
    this.tradeableAssets = tradeableAssets
    this.date = dayjs().format('YYYY-MM-DD')
  }

  evaluate(algorithm: TradingBotNode, indicatorCache: IndicatorCache, date?: Dayjs): Allocations {
    this.indicatorCache = indicatorCache
    this.date = date ? date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
    const rawAllocations = this.evaluateNode(algorithm)
    return this.combineAllocationsByAsset(rawAllocations as AllocationAsset[])
  }

  private evaluateNode(
    node: TradingBotNode,
    weightType: WeightType = WeightType.Equal,
    parentWeight: number = 100
  ): unknown {
    if ('weight' in node && weightType === WeightType.Specified) {
      parentWeight = (node.weight!.num / node.weight!.den) * 100
    }

    switch (node.node_type) {
      case TradingBotNodeType.root: {
        return node.children!.flatMap(childNode => this.evaluateNode(childNode, weightType, parentWeight));
      }
  
      case TradingBotNodeType.weight_cash_equal: {
        const equalWeight = parentWeight / node.children!.length;
        return node.children!.flatMap((child) => this.evaluateNode(child, WeightType.Equal, equalWeight))
      }
  
      case TradingBotNodeType.weight_cash_specified: {
        return node.children!.flatMap((child) => this.evaluateNode(child, WeightType.Specified))
      }
  
      case TradingBotNodeType.group: {
        return node.children!.flatMap((child) =>
          this.evaluateNode(child, weightType, parentWeight)
        );
      }
  
      case TradingBotNodeType.if_then_else: {
        return this.evaluateConditions(node, weightType, parentWeight)
      }
  
      case TradingBotNodeType.asset: {
        return [
          {
            ticker: node.ticker,
            name: node.name,
            percentage: parentWeight,
          },
        ];
      }
  
      default:
        console.warn(`Unknown step: ${node.node_type}`);
    }
  
    return [];
  }

  private evaluateConditions(node: TradingBotNodeIfThenElse, weightType: WeightType, parentWeight: number = 100): unknown {
    const conditionResults: boolean[] = []
    for (const condition of node.conditions) {
      conditionResults.push(this.evaluateCondition(condition))
    }

    const allAreTrue = (values: boolean[]): boolean => {
      return values.every(value => value === true);
    }

    const anyAreTrue = (values: boolean[]): boolean => {
      return values.some(value => value === true);
    }

    if (node.condition_type === TradingBotNodeIfThenElseConditionType.AllOf) {
      if (allAreTrue(conditionResults)) {
        return node.then_children.flatMap((child) =>
          this.evaluateNode(child, weightType, parentWeight)
        );
      } else {
        return node.else_children.flatMap((child) =>
          this.evaluateNode(child, weightType, parentWeight)
        );
      }
    } else if (node.condition_type === TradingBotNodeIfThenElseConditionType.AnyOf) {
      if (anyAreTrue(conditionResults)) {
        return node.then_children.flatMap((child) =>
          this.evaluateNode(child, weightType, parentWeight)
        );
      } else {
        return node.else_children.flatMap((child) =>
          this.evaluateNode(child, weightType, parentWeight)
        );
      }
    }
  }

  private evaluateCondition(condition: TradingBotNodeCondition): boolean {
    const lhsParams = condition.lhs_fn_params
    const rhsParams = condition.rhs_fn_params

    const lhsValue = this.getIndicatorValue(condition.lhs_val, condition.lhs_fn, lhsParams);
    const rhsValue = condition.rhs_val
      ? parseInt(condition.rhs_val) 
      : this.getIndicatorValue(condition.rhs_val!, condition.rhs_fn!, rhsParams);
    const comparator = condition.comparator
  
    return this.compare(lhsValue, rhsValue, comparator);
  }
  
  private getIndicatorValue(ticker: string, fn: string, params: Record<string, any> = {}): number {
    return this.indicatorCache.getIndicatorValue(ticker, fn, params, this.date)
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

  private combineAllocationsByAsset(allocations: AllocationAsset[]): Allocations {
    const combinedAllocations = allocations.reduce((accumulator: Record<string, number>, allocation: AllocationAsset) => {
      if (accumulator[allocation.ticker] === undefined) {
        accumulator[allocation.ticker] = 0
      }
  
      accumulator[allocation.ticker] += allocation.percentage
      return accumulator
    }, {})

    const allAllocations: { [key: string]: number | null } = {}
    for (const tradeableAsset of this.tradeableAssets) {
      allAllocations[tradeableAsset] = combinedAllocations[tradeableAsset] ?? null
    }
    return allAllocations
  }
}