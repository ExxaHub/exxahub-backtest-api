import { 
  type Indicator, 
  type TradingBotNode, 
  TradingBotNodeType, 
  type TradingBotNodeIfThenElse, 
  type TradingBotNodeCondition, 
  type PreCalc
} from "../types/types";

export type ParsedAssetsAndIndicators = {
  assets: string[],
  tradeableAssets: string[],
  indicators: Indicator[],
  preCalcs: PreCalc[],
  largestIndicatorWindow: number
  largestPreCalcWindow: number
}

export class Parser {
  private indicators: Map<string, Indicator> = new Map()
  private assets: Set<string> = new Set<string>()
  private tradeableAssets: Set<string> = new Set<string>()
  private preCalcs: Map<string, PreCalc> = new Map()
  private largestIndicatorWindow = 0
  private largestPreCalcWindow = 0
  private hasher = new Bun.CryptoHasher("sha256");

  parse(node: TradingBotNode): ParsedAssetsAndIndicators {
    this.parseNode(node)
    
    return {
      assets: Array.from(this.assets),
      tradeableAssets: Array.from(this.tradeableAssets),
      indicators: Array.from(this.indicators.values()),
      preCalcs: Array.from(this.preCalcs.values()),
      largestIndicatorWindow: this.largestIndicatorWindow,
      largestPreCalcWindow: this.largestPreCalcWindow
    }
  }

  private parseNode(node: TradingBotNode): void {
    switch (node.node_type) {
      case TradingBotNodeType.root:
      case TradingBotNodeType.weight_cash_equal:
      case TradingBotNodeType.weight_cash_specified:
      case TradingBotNodeType.group: {
        node.children!.forEach(childNode => this.parseNode(childNode));
        break
      }

      case TradingBotNodeType.weight_inverse_volatility: {
        node.children!.forEach(childNode => this.preCalcs.set(childNode.id, {
          node: childNode,
          fn: 'precalc-standard-deviation-return',
          params: {
            window: node.params.window
          }
        }))
        this.largestPreCalcWindow = Math.max(this.largestPreCalcWindow, node.params.window)
        node.children!.forEach(childNode => this.parseNode(childNode));
        break
      }
  
      case TradingBotNodeType.if_then_else: {
        this.evaluateConditions(node)
        break
      }
  
      case TradingBotNodeType.asset: {
        this.assets.add(node.ticker!)
        this.tradeableAssets.add(node.ticker!)
        break
      }
  
      default:
        console.warn(`Unknown step: ${node.node_type}`);
    }
  }

  private evaluateConditions(node: TradingBotNodeIfThenElse, parentWeight: number = 100): void {
    node.conditions.forEach(child => this.evaluateCondition(child));
    node.then_children.forEach(child => this.parseNode(child));
    node.else_children.forEach(child => this.parseNode(child));
  }

  private evaluateCondition(node: TradingBotNodeCondition): void {
    const lhs = {
      ticker: node.lhs_val,
      fn: node.lhs_fn,
      params: node.lhs_fn_params
    }
    
    if (!this.assets.has(lhs.ticker)) {
      this.assets.add(lhs.ticker)
    }
    
    const lhsHash = this.generateHash(lhs);
    
    if (!this.indicators.has(lhsHash)) {
      this.indicators.set(lhsHash, lhs)
    }
    
    if (node.rhs_fn) {
      const rhs = {
        ticker: node.rhs_val!,
        fn: node.rhs_fn,
        params: node.rhs_fn_params!
      }
      if (!this.assets.has(rhs.ticker)) {
        this.assets.add(rhs.ticker)
      }
      const rhsHash = this.generateHash(rhs);
      if (!this.indicators.has(rhsHash)) {
        this.indicators.set(rhsHash, rhs)
      }
    }

    this.largestIndicatorWindow = Math.max(this.largestIndicatorWindow, node.lhs_fn_params?.window ?? 0)
    this.largestIndicatorWindow = Math.max(this.largestIndicatorWindow, node.rhs_fn_params?.window ?? 0)
  }

  /**
   * Generates a hash for a given input to be used in a hashmap.
   * @param input - The input value (string or object) to hash.
   * @returns A fixed-length hash string.
   */
  generateHash(input: string | object): string {
    const data = typeof input === "string" ? input : JSON.stringify(input);
    this.hasher.update(data);
    return this.hasher.digest("hex");
  }
}