import { Interpreter } from './Interpreter'
import { Parser } from './Parser'
import { DataProvider } from './DataProvider'
import type { 
    Algorithm,
  } from "./types";
import { AlpacaStockClient } from './clients/AlpacaClient';

const algorithmJson = `{"id":"new","step":"root","name":"New Symphony","description":"","rebalance":"daily","children":[{"id":"56607df5-d696-46df-9178-49ea36925c79","step":"wt-cash-equal","suppress-incomplete-warnings?":true,"children":[{"weight":{"num":100,"den":100},"id":"beabf149-689a-46d8-9e19-efa95013205b","step":"if","children":[{"children":[{"ticker":"SPY","exchange":"ARCX","name":"SPDR S&P 500 ETF Trust","id":"15fb1bf0-4456-4683-88d1-5995b20ec6af","step":"asset","suppress-incomplete-warnings?":true}],"lhs-fn-params":{"window":20},"rhs-fn":"standard-deviation-return","is-else-condition?":false,"suppress-incomplete-warnings?":false,"lhs-fn":"standard-deviation-return","lhs-val":"SPY","id":"1d002b58-28b5-4af5-9cde-24a4b0664f7f","rhs-fn-params":{"window":12},"comparator":"gt","rhs-val":"SPY","step":"if-child"},{"id":"c6266b6d-74a7-4513-85b1-1888a8731a68","step":"if-child","suppress-incomplete-warnings?":true,"is-else-condition?":true,"children":[{"ticker":"BIL","exchange":"ARCX","name":"SPDR Bloomberg 1-3 Month T-Bill ETF","id":"51bd24ac-a614-4d25-9ece-97a60e646411","step":"asset","suppress-incomplete-warnings?":true}]}]}]}],"asset_class":"EQUITIES","asset_classes":["EQUITIES"]}`;

const algorithm: Algorithm = JSON.parse(algorithmJson);
const parser = new Parser()

const indicators = parser.parseIndicators(algorithm)

const alpacaClient = new AlpacaStockClient()

const dataProvider = new DataProvider(alpacaClient, indicators)
await dataProvider.load()

const interpreter = new Interpreter(dataProvider)

const allocations = interpreter.evaluate(algorithm)

console.log(allocations);