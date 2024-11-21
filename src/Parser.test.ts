import { describe, it, expect } from "bun:test";
import { Parser } from "./Parser";
import type { Algorithm } from "./types";

import cumulativeReturnJson from './testAlgorithms/cumulativeReturn.json'
import exponentialMovingAverageOfPriceJson from './testAlgorithms/exponentialMovingAverageOfPrice.json'
import maxDrawdownJson from './testAlgorithms/maxDrawdown.json'
import movingAverageOfPriceJson from './testAlgorithms/movingAverageOfPrice.json'
import movingAverageOfReturnJson from './testAlgorithms/movingAverageOfReturn.json'
import relativeStrengthIndexJson from './testAlgorithms/relativeStrengthIndex.json'
import standardDeviationOfPriceJson from './testAlgorithms/standardDeviationOfPrice.json'
import standardDeviationOfReturnJson from './testAlgorithms/standardDeviationOfReturn.json'

describe("Parser", () => {
  it("Parses cumulativeReturn RSI indicators correctly", () => {
    const algorithm: Algorithm = cumulativeReturnJson as unknown as Algorithm;
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
    const algorithm: Algorithm = exponentialMovingAverageOfPriceJson as unknown as Algorithm;
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
    const algorithm: Algorithm = maxDrawdownJson as unknown as Algorithm;
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
    const algorithm: Algorithm = movingAverageOfPriceJson as unknown as Algorithm;
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
    const algorithm: Algorithm = movingAverageOfReturnJson as unknown as Algorithm;
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
    const algorithm: Algorithm = relativeStrengthIndexJson as unknown as Algorithm;
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
    const algorithm: Algorithm = standardDeviationOfPriceJson as unknown as Algorithm;
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
    const algorithm: Algorithm = standardDeviationOfReturnJson as unknown as Algorithm;
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

  it("Parses all tickers from assets and indicators correctly", () => {
    const algorithm: Algorithm = JSON.parse('{"id":"new","step":"root","name":"Test Algorithm","description":"","rebalance":"daily","children":[{"id":"4c1dc281-bcc2-4ea3-a657-9b5789e9594c","step":"wt-cash-equal","suppress-incomplete-warnings?":true,"children":[{"weight":{"num":100,"den":100},"id":"dd84bb89-d0f2-455f-a7b3-5d57307beca7","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"99b685c5-5a88-4552-9baf-ddc01e0cf29b","step":"asset","suppress-incomplete-warnings?":true,"children-count":0}],"lhs-fn-params":{"window":10},"rhs-fn":"cumulative-return","is-else-condition?":false,"suppress-incomplete-warnings?":false,"lhs-fn":"cumulative-return","lhs-val":"QQQ","id":"146e8233-510c-4bba-b536-e977d0dab453","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"SPY","step":"if-child"},{"id":"4bc2df6e-7cc8-4b14-aee8-6576c63a9379","step":"if-child","suppress-incomplete-warnings?":true,"is-else-condition?":true,"children":[{"ticker":"UPRO","exchange":"ARCX","name":"ProShares UltraPro S&P500","id":"ee65f9d9-1298-4d04-9639-07b246900cec","step":"asset","suppress-incomplete-warnings?":true,"children-count":0}]}]}]}],"asset_class":"EQUITIES","asset_classes":["EQUITIES"]}')
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
