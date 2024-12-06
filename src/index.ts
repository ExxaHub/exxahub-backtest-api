import { Interpreter } from './Interpreter'
import { Parser } from './Parser'
import { IndicatorCache } from './IndicatorCache'
import type { 
    Algorithm,
  } from "./types";
import { AlpacaStockClient } from './clients/AlpacaClient';
import { TiingoClient } from './clients/TiingoClient';
import { OhlcCache } from './OhlcCache';
import { Backtester } from './Backtester';

import testAlgorithmMovingAverageOfPrice from './testAlgorithms/movingAverageOfPrice.json'

// const algorithmJson = `{"description":"","children":[{"id":"42be7663-293b-4115-97bb-533254cb99cb","step":"wt-cash-equal","suppress-incomplete-warnings?":true,"children":[{"weight":{"num":100,"den":100},"id":"3c9c6063-d6e9-4ef8-ae81-300ee61006ee","step":"group","name":"10d RSI HYD > 10d RSI IYZ","children":[{"step":"wt-cash-equal","id":"25bb4e0e-ce35-409e-afa1-74eb4b14a9f8","children":[{"id":"b7afb20b-8ecc-491a-b9b5-8cbc7d49650b","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"1f12ab10-ad97-4da1-9d3d-ade1b2406df9","step":"asset","collapsed?":false,"children":[]}],"lhs-fn-params":{"window":10},"rhs-fn":"relative-strength-index","is-else-condition?":false,"lhs-fn":"relative-strength-index","lhs-val":"HYD","id":"cb0aaf80-fdd6-4f89-a2b1-4ca4a1243195","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"IYZ","step":"if-child","collapsed?":false},{"id":"27c27bb0-b16f-41f5-b877-e14e549c3776","step":"if-child","is-else-condition?":true,"children":[{"ticker":"PSQ","exchange":"ARCX","name":"ProShares Short QQQ","id":"10fb740d-327e-42a8-8864-cff328107aed","step":"asset","collapsed?":false,"children":[]}],"collapsed?":false}],"collapsed?":false}],"collapsed?":false}],"collapsed?":false}]}],"suppress-incomplete-warnings?":false,"name":"New Symphony","asset_class":"EQUITIES","rebalance":"daily","id":"new","step":"root","asset_classes":["EQUITIES"]}`;
// const algorithm: Algorithm = JSON.parse(algorithmJson);

const algorithm: Algorithm = JSON.parse(JSON.stringify(testAlgorithmMovingAverageOfPrice))
const parser = new Parser()

const { assets, indicators } = parser.parse(algorithm)

const client = new AlpacaStockClient()
// const client = new TiingoClient()

const ohlcCache = new OhlcCache(client, assets)
await ohlcCache.load()
// ohlcCache.printDebugTable()

const indicatorCache = new IndicatorCache(ohlcCache, indicators)
await indicatorCache.load()
// indicatorCache.printDebugTable()

const backtester = new Backtester(algorithm, client)
await backtester.run()