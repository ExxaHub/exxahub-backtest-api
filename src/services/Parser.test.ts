import { describe, it, expect } from "bun:test";
import { Parser } from "./Parser";
import { TradingBotNodeType, type Symphony, type TradingBotNode } from "../types/types";

import cumulativeReturnJson from '../testData/tradingBots/cumulativeReturn.json'
import exponentialMovingAverageOfPriceJson from '../testData/tradingBots/exponentialMovingAverageOfPrice.json'
import maxDrawdownJson from '../testData/tradingBots/maxDrawdown.json'
import movingAverageOfPriceJson from '../testData/tradingBots/movingAverageOfPrice.json'
import movingAverageOfReturnJson from '../testData/tradingBots/movingAverageOfReturn.json'
import relativeStrengthIndexJson from '../testData/tradingBots/relativeStrengthIndex.json'
import standardDeviationOfPriceJson from '../testData/tradingBots/standardDeviationOfPrice.json'
import standardDeviationOfReturnJson from '../testData/tradingBots/standardDeviationOfReturn.json'
import weightInversVolatilityJson from '../testData/tradingBots/weightInverseVolatility.json'

describe("Parser", () => {
  it("Parses cumulativeReturn RSI indicators correctly", () => {
    const algorithm: TradingBotNode = cumulativeReturnJson as unknown as TradingBotNode;
    const parser = new Parser
    const { assets, indicators } = parser.parse(algorithm)

    expect(assets).toEqual(['SPY', 'BIL']);
    expect(indicators).toEqual([
      {
        fn: "cumulative-return",
        params: {
          window: 10,
        },
        ticker: "SPY",
      },
      {
        fn: "cumulative-return",
        params: {
          window: 20,
        },
        ticker: "SPY",
      }
    ]);
  });

  it("Parses exponentialMovingAverageOfPrice indicators correctly", () => {
    const algorithm: TradingBotNode = exponentialMovingAverageOfPriceJson as unknown as TradingBotNode;
    const parser = new Parser
    const { assets, indicators } = parser.parse(algorithm)

    expect(assets).toEqual(['SPY', 'BIL']);
    expect(indicators).toEqual([
      {
        fn: "exponential-moving-average-price",
        params: {
          window: 10,
        },
        ticker: "SPY",
      },
      {
        fn: "exponential-moving-average-price",
        params: {
          window: 20,
        },
        ticker: "SPY",
      }
    ]);
  });

  it("Parses maxDrawdown indicators correctly", () => {
    const algorithm: TradingBotNode = maxDrawdownJson as unknown as TradingBotNode;
    const parser = new Parser
    const { assets, indicators } = parser.parse(algorithm)

    expect(assets).toEqual(['SPY', 'BIL']);
    expect(indicators).toEqual([
      {
        fn: "max-drawdown",
        params: {
          window: 10,
        },
        ticker: "SPY",
      },
      {
        fn: "max-drawdown",
        params: {
          window: 20,
        },
        ticker: "SPY",
      }
    ]);
  });

  it("Parses movingAverageOfPrice indicators correctly", () => {
    const algorithm: TradingBotNode = movingAverageOfPriceJson as unknown as TradingBotNode;
    const parser = new Parser
    const { assets, indicators } = parser.parse(algorithm)

    expect(assets).toEqual(['SPY', 'BIL']);
    expect(indicators).toEqual([
      {
        fn: "moving-average-price",
        params: {
          window: 10,
        },
        ticker: "SPY",
      },
      {
        fn: "moving-average-price",
        params: {
          window: 20,
        },
        ticker: "SPY",
      }
    ]);
  });

  it("Parses movingAverageOfReturn indicators correctly", () => {
    const algorithm: TradingBotNode = movingAverageOfReturnJson as unknown as TradingBotNode;
    const parser = new Parser
    const { assets, indicators } = parser.parse(algorithm)

    expect(assets).toEqual(['SPY', 'BIL']);
    expect(indicators).toEqual([
      {
        fn: "moving-average-return",
        params: {
          window: 10,
        },
        ticker: "SPY",
      },
      {
        fn: "moving-average-return",
        params: {
          window: 20,
        },
        ticker: "SPY",
      }
    ]);
  });

  it("Parses relativeStrengthIndex indicators correctly", () => {
    const algorithm: TradingBotNode = relativeStrengthIndexJson as unknown as TradingBotNode;
    const parser = new Parser
    const { assets, indicators } = parser.parse(algorithm)

    expect(assets).toEqual(['SPY', 'BIL']);
    expect(indicators).toEqual([
      {
        fn: "relative-strength-index",
        params: {
          window: 10,
        },
        ticker: "SPY",
      },
      {
        fn: "relative-strength-index",
        params: {
          window: 20,
        },
        ticker: "SPY",
      }
    ]);
  });

  it("Parses standardDeviationOfPrice indicators correctly", () => {
    const algorithm: TradingBotNode = standardDeviationOfPriceJson as unknown as TradingBotNode;
    const parser = new Parser
    const { assets, indicators } = parser.parse(algorithm)

    expect(assets).toEqual(['SPY', 'BIL']);
    expect(indicators).toEqual([
      {
        fn: "standard-deviation-price",
        params: {
          window: 10,
        },
        ticker: "SPY",
      },
      {
        fn: "standard-deviation-price",
        params: {
          window: 20,
        },
        ticker: "SPY",
      }
    ]);
  });

  it("Parses standardDeviationOfReturn indicators correctly", () => {
    const algorithm: TradingBotNode = standardDeviationOfReturnJson as unknown as TradingBotNode;
    const parser = new Parser
    const { assets, indicators } = parser.parse(algorithm)

    expect(assets).toEqual(['SPY', 'BIL']);
    expect(indicators).toEqual([
      {
        fn: "standard-deviation-return",
        params: {
          window: 10,
        },
        ticker: "SPY",
      },
      {
        fn: "standard-deviation-return",
        params: {
          window: 20,
        },
        ticker: "SPY",
      }
    ]);
  });

  it("Parses weightInverseVolatility preCalcs correctly", () => {
    const algorithm: TradingBotNode = weightInversVolatilityJson as unknown as TradingBotNode;
    const parser = new Parser
    const { assets, preCalcs } = parser.parse(algorithm)

    expect(assets).toEqual(['SPY', 'BIL']);
    expect(preCalcs).toEqual([
      {
        fn: 'precalc-standard-deviation',
        params: {
          frequency: 10,
          interval: 'day'
        },
        node: {
          condition_type: "allOf",
          conditions: [
            {
              comparator: "gt",
              id: "node_01jgvw35hhwq41wdr6s8d6txy4",
              lhs_fn: "standard-deviation-return",
              lhs_fn_params: {
                window: 10,
              },
              lhs_val: "SPY",
              node_type: TradingBotNodeType.condition,
              rhs_fn: "standard-deviation-return",
              rhs_fn_params: {
                window: 20,
              },
              rhs_val: "SPY",
            }
          ],
          else_children: [
            {
              id: "node_01jgvw35hh9a5vbqcn7bgc35rd",
              name: "BIL",
              node_type: TradingBotNodeType.asset,
              ticker: "BIL",
            }
          ],
          id: "node_01jgvw35hhp1fmvefxx9sqq1ef",
          node_type: TradingBotNodeType.if_then_else,
          then_children: [
            {
              id: "node_01jgvw35hhn5hwffah1p1hhh4r",
              name: "SPY",
              node_type: TradingBotNodeType.asset,
              ticker: "SPY",
            }
          ],
        }
      },
      {
        fn: "precalc-standard-deviation",
        node: {
          condition_type: "allOf",
          conditions: [
            {
              comparator: "gt",
              id: "node_01jgvw27z0hy2q2q1es89ztvgt",
              lhs_fn: "relative-strength-index",
              lhs_fn_params: {
                window: 10,
              },
              lhs_val: "SPY",
              node_type: TradingBotNodeType.condition,
              rhs_fn: "relative-strength-index",
              rhs_fn_params: {
                window: 20,
              },
              rhs_val: "SPY",
            }
          ],
          else_children: [
            {
              id: "node_01jgvw27z0827jkxbsva3g1pew",
              name: "BIL",
              node_type: TradingBotNodeType.asset,
              ticker: "BIL",
            }
          ],
          id: "node_01jgvw27z1trbsxcnxeyqvj9v8",
          node_type: TradingBotNodeType.if_then_else,
          then_children: [
            {
              id: "node_01jgvw27z0xnamkvze3sbaaaba",
              name: "SPY",
              node_type: TradingBotNodeType.asset,
              ticker: "SPY",
            }
          ],
        },
        params: {
          frequency: 10,
          interval: "day",
        },
      }
    ]);
  });

  it("Parses all tickers from assets and indicators correctly", () => {
    const algorithm: TradingBotNode = JSON.parse('{"description": "","name": "Test Symphony","id": "new","node_type": "root","rebalance": "daily","version": "v1","children": [{"id": "node_01jgvsdw2vk4eh341457fp9ddt","node_type": "wt-cash-equal","children": [{"id": "node_01jgvsdw2xephe0fp4qg6exh6z","node_type": "if-then-else","condition_type": "allOf","conditions": [{"id": "node_01jgvsdw2wee2anph24jqsymah","node_type": "condition","lhs_fn": "cumulative-return","lhs_fn_params": {"window": 10},"lhs_val": "QQQ","comparator": "gt","rhs_fn": "cumulative-return","rhs_fn_params": {"window": 10},"rhs_val": "SPY"}],"then_children": [{"ticker": "TQQQ","name": "TQQQ","id": "node_01jgvsdw2w47vqffvgdfvjn8je","node_type": "asset"}],"else_children": [{"ticker": "UPRO","name": "UPRO","id": "node_01jgvsdw2xxh9g9jh9gqd798cn","node_type": "asset"}]}]}]}')
    const parser = new Parser
    const { assets, indicators } = parser.parse(algorithm)

    expect(assets).toEqual(['QQQ', 'SPY', 'TQQQ', 'UPRO']);
    expect(indicators).toEqual([
      {
        fn: "cumulative-return",
        params: {
          window: 10,
        },
        ticker: "QQQ",
      },
      {
        fn: "cumulative-return",
        params: {
          window: 10,
        },
        ticker: "SPY",
      }
    ]);
  });
});
