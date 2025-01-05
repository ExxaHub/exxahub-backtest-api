import { HttpError } from "../api/errors";
import { 
  type Symphony, 
  type SymphonyNode, 
  type TradingBotNode, 
  type TradingBotNodeAsset, 
  type TradingBotNodeCondition, 
  type TradingBotNodeIfThenElse, 
  TradingBotNodeType 
} from "../types/types";
import { ulid } from "ulid";

export class SymphonyAdapter {
    adapt(algorithm: Symphony) {
        const nodes = this.parseNode(algorithm)    
        return nodes
    }

    private parseNode(node: SymphonyNode): TradingBotNode {
        switch (node.step) {
          case "root": {
            return {
                description: node.description!,
                name: node.name!,
                id: node.id,
                node_type: TradingBotNodeType.root,
                rebalance: node.rebalance!,
                version: 'v1',
                children: node.children!.flatMap(childNode => this.parseNode(childNode))
            }
          }
      
          case 'wt-cash-equal': {
            return {
                id: this.getId(),
                node_type: TradingBotNodeType.weight_cash_equal,
                children: node.children!.flatMap((child) => this.parseNode(child))
            }
          }
      
          case 'wt-cash-specified': {
            return {
                id: this.getId(),
                node_type: TradingBotNodeType.weight_cash_specified,
                children: node.children!.flatMap((child) => this.parseNode(child))
            }
          }
      
          case 'group': {
            return {
                weight: {
                    num: typeof node.weight?.num! === 'string' ? parseInt(node.weight?.num!) : node.weight?.num!,
                    den: typeof node.weight?.den! === 'string' ? parseInt(node.weight?.den!) : node.weight?.den!,
                },
                id: this.getId(),
                node_type: TradingBotNodeType.group,
                name: node.name!,
                children: node.children!.flatMap((child) => this.parseNode(child))
            }
          }
      
          case 'if': {
            return this.evaluateCondition(node)
          }
      
          case 'asset': {
            let newNode: TradingBotNodeAsset = {
              ticker: node.ticker!,
              name: node.ticker!,
              id: this.getId(),
              node_type: TradingBotNodeType.asset
            }

            if (node.weight) {
              newNode.weight = {
                num: typeof node.weight?.num! === 'string' ? parseInt(node.weight?.num!) : node.weight?.num!,
                den: typeof node.weight?.den! === 'string' ? parseInt(node.weight?.den!) : node.weight?.den!,
              }
            }

            return newNode
          }

          case 'filter': {
            throw new HttpError(400, `Cannot convert symphony to trading bot. Sorts/filters are not supported.`);
          }
      
          default:
            throw new HttpError(400, `Unknown step: ${node.step}`);
        }
    }

    private evaluateCondition(node: SymphonyNode, parentWeight: number = 100): TradingBotNodeIfThenElse {
        const ifBlock = node.children![0]
        const elseBlock = node.children![1]
    
        let condition: TradingBotNodeCondition = {
            id: this.getId(),
            node_type: TradingBotNodeType.condition,
            lhs_fn: ifBlock['lhs-fn']!,
            lhs_fn_params: ifBlock['lhs-window-days'] ? { window: parseInt(ifBlock['lhs-window-days']) } : ifBlock['lhs-fn-params']!,
            lhs_val: ifBlock['lhs-val']!,
            comparator: ifBlock['comparator']!
        }
    
        if (!ifBlock['rhs-fixed-value?']) {
          condition.rhs_fn = ifBlock['rhs-fn']
          condition.rhs_fn_params = ifBlock['rhs-window-days'] ? { window: parseInt(ifBlock['rhs-window-days']) } : ifBlock['rhs-fn-params']
          condition.rhs_val = ifBlock['rhs-val']
        } else {
          condition.rhs_val = ifBlock['rhs-val']
        }
    
        let thenChildren: TradingBotNode[] = []
        thenChildren = ifBlock.children!.flatMap((child) => this.parseNode(child));
    
        let elseChildren: TradingBotNode[] = []
        elseChildren = elseBlock.children!.flatMap((child) => this.parseNode(child));

        return {
            id: this.getId(),
            node_type: TradingBotNodeType.if_then_else,
            condition_type: "allOf",
            conditions: [condition],
            then_children: thenChildren,
            else_children: elseChildren,
        }
    }

    private getId(): string {
        return `node_${ulid().toLowerCase()}`
    }
}