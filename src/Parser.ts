import type { Algorithm, AlgorithmNode } from "./types";
import { createHash } from "crypto";

type Indicator = {
  ticker: string,
  fn: string,
  params: {
    window?: number
  }
}

export class Parser {
  private indicators: Map<string, Indicator> = new Map()

  parseIndicators(algorithm: Algorithm) {
    this.parseNode(algorithm)
    return Array.from(this.indicators.values())
  }

  private parseNode(node: AlgorithmNode): void {
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
        break
      }
  
      default:
        console.warn(`Unknown step: ${node.step}`);
    }
  }

  private evaluateCondition(node: AlgorithmNode, parentWeight: number = 100): void {
    const ifBlock = node.children![0]
    const elseBlock = node.children![1]

    const lhs = {
      ticker: ifBlock['lhs-val'],
      fn: ifBlock['lhs-fn'],
      params: ifBlock['lhs-fn-params']
    }
    this.indicators.set(this.generateHash(lhs), lhs)

    const rhs = {
      ticker: ifBlock['rhs-val'],
      fn: ifBlock['rhs-fn'],
      params: ifBlock['rhs-fn-params']
    }
    this.indicators.set(this.generateHash(rhs), rhs)

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