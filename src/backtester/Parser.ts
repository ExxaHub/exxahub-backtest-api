import type { Symphony, SymphonyNode, Indicator } from "./types";
import { createHash } from "crypto";

export type ParsedAssetsAndIndicators = {
  assets: string[],
  tradeableAssets: string[],
  indicators: Indicator[]
}

export class Parser {
  private indicators: Map<string, Indicator> = new Map()
  private assets: Set<string> = new Set<string>()
  private tradeableAssets: Set<string> = new Set<string>()

  parse(algorithm: Symphony): ParsedAssetsAndIndicators {
    this.parseNode(algorithm)
    
    return {
      assets: Array.from(this.assets),
      tradeableAssets: Array.from(this.tradeableAssets),
      indicators: Array.from(this.indicators.values())
    }
  }

  private parseNode(node: SymphonyNode): void {
    switch (node.step) {
      case "root": {
        node.children!.flatMap(childNode => this.parseNode(childNode));
        break
      }
  
      case 'wt-cash-equal': {
        node.children!.flatMap((child) => this.parseNode(child))
        break
      }
  
      case 'wt-cash-specified': {
        node.children!.flatMap((child) => this.parseNode(child))
        break
      }
  
      case 'group': {
        node.children!.flatMap((child) => this.parseNode(child));
        break
      }
  
      case 'if': {
        this.evaluateCondition(node)
        break
      }
  
      case 'asset': {
        this.assets.add(node.ticker!)
        this.tradeableAssets.add(node.ticker!)
        break
      }
  
      default:
        console.warn(`Unknown step: ${node.step}`);
    }
  }

  private evaluateCondition(node: SymphonyNode, parentWeight: number = 100): void {
    const ifBlock = node.children![0]
    const elseBlock = node.children![1]

    const lhs = {
      ticker: ifBlock['lhs-val']!,
      fn: ifBlock['lhs-fn']!,
      params: ifBlock['lhs-window-days'] ? { window: parseInt(ifBlock['lhs-window-days']) } : ifBlock['lhs-fn-params']!
    }
    this.assets.add(lhs.ticker)
    this.indicators.set(this.generateHash(lhs), lhs)

    if (!ifBlock['rhs-fixed-value?']) {
      const rhs = {
        ticker: ifBlock['rhs-val']!,
        fn: ifBlock['rhs-fn']!,
        params: ifBlock['rhs-window-days'] ? { window: parseInt(ifBlock['rhs-window-days']) } : ifBlock['rhs-fn-params']!
      }
      this.assets.add(rhs.ticker)
      this.indicators.set(this.generateHash(rhs), rhs)
    }

    ifBlock.children!.flatMap((child) =>
      this.parseNode(child)
    );

    elseBlock.children!.flatMap((child) =>
      this.parseNode(child)
    );
  }

  /**
   * Generates a hash for a given input to be used in a hashmap.
   * @param input - The input value (string or object) to hash.
   * @returns A fixed-length hash string.
   */
  generateHash(input: string | object): string {
    const hash = createHash("sha256");
    const data = typeof input === "string" ? input : JSON.stringify(input);
    hash.update(data);
    return hash.digest("hex");
  }
}