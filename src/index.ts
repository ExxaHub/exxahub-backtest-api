import { Interpreter } from './Interpreter'
import { Parser } from './Parser'
import { DataProvider } from './DataProvider'
import type { 
    Algorithm,
  } from "./types";
import { AlpacaStockClient } from './clients/AlpacaClient';

const algorithmJson = `{"id":"new","step":"root","name":"New Symphony","description":"","rebalance":"daily","children":[{"id":"fd03991e-a68f-46e0-9bde-9b019b5e0c59","step":"wt-cash-equal","suppress-incomplete-warnings?":true,"children":[{"weight":{"num":100,"den":100},"id":"d2ba22bc-ac09-4c8b-9863-ad2f14499e78","step":"if","children":[{"children":[{"ticker":"SPY","exchange":"ARCX","name":"SPDR S&P 500 ETF Trust","id":"ee684379-be8e-4b01-881d-deca29d7f0f3","step":"asset","suppress-incomplete-warnings?":true}],"lhs-fn-params":{"window":35},"rhs-fn":"max-drawdown","is-else-condition?":false,"rhs-fixed-value?":false,"suppress-incomplete-warnings?":false,"lhs-fn":"max-drawdown","lhs-val":"SPY","id":"ef540f42-b812-4f0a-9551-4d48bd6fdf79","rhs-fn-params":{"window":30},"comparator":"lt","rhs-val":"SPY","step":"if-child"},{"id":"cf05c300-c2f4-45a3-b3c1-cc3413990f68","step":"if-child","suppress-incomplete-warnings?":true,"is-else-condition?":true,"children":[{"ticker":"BIL","exchange":"ARCX","name":"SPDR Bloomberg 1-3 Month T-Bill ETF","id":"07af8fd0-02e6-411b-bbf3-fda3aa266648","step":"asset","suppress-incomplete-warnings?":true}]}]}]}],"asset_class":"EQUITIES","asset_classes":["EQUITIES"]}`;

const algorithm: Algorithm = JSON.parse(algorithmJson);
const parser = new Parser()

const indicators = parser.parseIndicators(algorithm)

const alpacaClient = new AlpacaStockClient()

const dataProvider = new DataProvider(alpacaClient, indicators)
await dataProvider.load()

const interpreter = new Interpreter(dataProvider)

const allocations = interpreter.evaluate(algorithm)

console.log(allocations);