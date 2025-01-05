import { 
  type Indicator, 
  type TradingBotNode, 
  TradingBotNodeType, 
  type TradingBotNodeIfThenElse, 
  type TradingBotNodeCondition 
} from "./types";

export type ParsedAssetsAndIndicators = {
  assets: string[],
  tradeableAssets: string[],
  indicators: Indicator[]
}

export class Parser {
  private indicators: Map<string, Indicator> = new Map()
  private assets: Set<string> = new Set<string>()
  private tradeableAssets: Set<string> = new Set<string>()

  parse(node: TradingBotNode): ParsedAssetsAndIndicators {
    this.parseNode(node)
    
    return {
      assets: Array.from(this.assets),
      tradeableAssets: Array.from(this.tradeableAssets),
      indicators: Array.from(this.indicators.values())
    }
  }

  private parseNode(node: TradingBotNode): void {
    switch (node.node_type) {
      case TradingBotNodeType.root: {
        node.children!.flatMap(childNode => this.parseNode(childNode));
        break
      }
  
      case TradingBotNodeType.weight_cash_equal: {
        node.children!.flatMap((child) => this.parseNode(child))
        break
      }
  
      case TradingBotNodeType.weight_cash_specified: {
        node.children!.flatMap((child) => this.parseNode(child))
        break
      }
  
      case TradingBotNodeType.group: {
        node.children!.flatMap((child) => this.parseNode(child));
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
    node.conditions.flatMap(child => this.evaluateCondition(child));
    node.then_children.flatMap(child => this.parseNode(child));
    node.else_children.flatMap(child => this.parseNode(child));
  }

  private evaluateCondition(node: TradingBotNodeCondition): void {
    const lhs = {
      ticker: node.lhs_val,
      fn: node.lhs_fn,
      params: node.lhs_fn_params
    }
    this.assets.add(lhs.ticker)
    this.indicators.set(this.generateHash(lhs), lhs)
    
    if (node.lhs_fn) {
      const rhs = {
        ticker: node.rhs_val!,
        fn: node.rhs_fn!,
        params: node.rhs_fn_params!
      }
      this.assets.add(rhs.ticker)
      this.indicators.set(this.generateHash(rhs), rhs)
    }
  }

  /**
   * Generates a hash for a given input to be used in a hashmap.
   * @param input - The input value (string or object) to hash.
   * @returns A fixed-length hash string.
   */
  generateHash(input: string | object): string {
    const hasher = new Bun.CryptoHasher("sha256");
    // const hash = createHash("sha256");
    const data = typeof input === "string" ? input : JSON.stringify(input);
    hasher.update(data);
    return hasher.digest("hex");
  }
}