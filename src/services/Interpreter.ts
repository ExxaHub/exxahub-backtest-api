import dayjs, { Dayjs } from "dayjs";
import type { IndicatorCache } from "./IndicatorCache";
import { 
  type AllocationAsset,
  type TradingBotNode,
  TradingBotNodeType,
  type TradingBotNodeIfThenElse,
  TradingBotNodeIfThenElseConditionType,
  type TradingBotNodeCondition,
  type TradingBotNodeWeightInverseVolatility,
  type TradingBotNodeAsset
} from "../types/types";
import type { PreCalcCache } from "./PreCalcCache";

enum WeightType {
  Equal = 'equal',
  Specified = 'specified'
}

export type Allocations = {
  [key: string]: number | null;
}

export class Interpreter {
  private indicatorCache: IndicatorCache
  private preCalcCache: PreCalcCache
  private date: string
  private tradeableAssets: string[]
  private indicatorValueCache: Map<string, number>

  constructor(indicatorCache: IndicatorCache, preCalcCache: PreCalcCache, tradeableAssets: string[]) {
    this.indicatorCache = indicatorCache
    this.preCalcCache = preCalcCache
    this.tradeableAssets = tradeableAssets
    this.date = dayjs().format('YYYY-MM-DD')
    this.indicatorValueCache = new Map()
  }

  evaluate(algorithm: TradingBotNode, indicatorCache: IndicatorCache, date?: Dayjs): Allocations {
    this.indicatorCache = indicatorCache
    this.date = date ? date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
    this.indicatorValueCache.clear()
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

      case TradingBotNodeType.weight_inverse_volatility: {
        const inverseVolatilities = node.children!.map(child => {
          const stdDev = this.preCalcCache.getPreCalcForNodeId(child.id).get(this.date)!;
          return 1 / stdDev;
        })
        const totalInverseVolatility = inverseVolatilities.reduce((acc, val) => acc + val, 0)

        return node.children!.flatMap((child) => {
          const stdDev = this.preCalcCache.getPreCalcForNodeId(child.id).get(this.date)!;
          const inverseVolatility = 1 / stdDev;
          const weight = (inverseVolatility / totalInverseVolatility) * 100
          console.log('weight', {
            date: this.date,
            stdDev,
            inverseVolatility,
            totalInverseVolatility,
            ticker: (child as TradingBotNodeAsset).ticker,
            weight
          })
          return this.evaluateNode(child, WeightType.Specified, weight)
        })
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
    const conditionResults = node.conditions.map(condition => this.evaluateCondition(condition))

    const allAreTrue = conditionResults.every(value => value === true);
    const anyAreTrue = conditionResults.some(value => value === true);

    if (node.condition_type === TradingBotNodeIfThenElseConditionType.AllOf) {
      if (allAreTrue) {
        return node.then_children.flatMap((child) =>
          this.evaluateNode(child, weightType, parentWeight)
        );
      } else {
        return node.else_children.flatMap((child) =>
          this.evaluateNode(child, weightType, parentWeight)
        );
      }
    } else if (node.condition_type === TradingBotNodeIfThenElseConditionType.AnyOf) {
      if (anyAreTrue) {
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
    const lhsValue = this.getIndicatorValue(condition.lhs_val, condition.lhs_fn, condition.lhs_fn_params);
    const rhsValue = condition.rhs_fn
      ? this.getIndicatorValue(condition.rhs_val!, condition.rhs_fn!, condition.rhs_fn_params)
      : parseInt(condition.rhs_val!) 
    const comparator = condition.comparator
  
    return this.compare(lhsValue, rhsValue, comparator);
  }
  
  private getIndicatorValue(ticker: string, fn: string, params: Record<string, any> = {}): number {
    const cacheKey = `${ticker}-${fn}-${JSON.stringify(params)}-${this.date}`
    if (this.indicatorValueCache.has(cacheKey)) {
      return this.indicatorValueCache.get(cacheKey)!
    }
    const value = this.indicatorCache.getIndicatorValue(ticker, fn, params, this.date)
    this.indicatorValueCache.set(cacheKey, value)
    return value
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