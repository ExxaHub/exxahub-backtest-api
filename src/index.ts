import { Interpreter } from './Interpreter'
import { Parser } from './Parser'
import { DataProvider } from './DataProvider'
import type { 
    Algorithm,
  } from "./types";
import { AlpacaStockClient } from './clients/AlpacaClient';

const algorithmJson = `{"id":"new","step":"root","name":"New Symphony","description":"","rebalance":"daily","children":[{"id":"90a40f75-d288-43a8-9b71-3e7792b49013","step":"wt-cash-equal","suppress-incomplete-warnings?":true,"children":[{"weight":{"num":100,"den":100},"id":"22f9aa4e-137c-42bc-a431-1136789f3591","step":"if","children":[{"children":[{"ticker":"SPY","exchange":"ARCX","name":"SPDR S&P 500 ETF Trust","id":"f57c1111-d410-4622-9bf8-04831cddb214","step":"asset","suppress-incomplete-warnings?":true}],"lhs-fn-params":{"window":200},"rhs-fn":"moving-average-return","is-else-condition?":false,"suppress-incomplete-warnings?":false,"lhs-fn":"moving-average-return","lhs-val":"SPY","id":"6d9394ba-9ca2-4d10-8f84-fda36771f320","rhs-fn-params":{"window":50},"comparator":"gt","rhs-val":"SPY","step":"if-child"},{"id":"bb90d461-0ea7-4d8f-a49d-5082be7fe6ba","step":"if-child","suppress-incomplete-warnings?":true,"is-else-condition?":true,"children":[{"ticker":"BIL","exchange":"ARCX","name":"SPDR Bloomberg 1-3 Month T-Bill ETF","id":"641f4a18-94de-4c35-a9ba-f0a1f7124c9d","step":"asset","suppress-incomplete-warnings?":true}]}]}]}],"asset_class":"EQUITIES","asset_classes":["EQUITIES"]}`;

const algorithm: Algorithm = JSON.parse(algorithmJson);
const parser = new Parser()

const indicators = parser.parseIndicators(algorithm)

const alpacaClient = new AlpacaStockClient()

const dataProvider = new DataProvider(alpacaClient, indicators)
await dataProvider.load()

const interpreter = new Interpreter(dataProvider)

const allocations = interpreter.evaluate(algorithm)

console.log(allocations);