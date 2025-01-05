import { IndicatorCache } from '../../services/IndicatorCache'
import type { 
    Symphony,
  } from "../types";
import { AlpacaStockClient } from '../../clients/AlpacaClient';
import { TiingoClient } from '../../clients/TiingoClient';
import { OhlcCache } from '../../services/OhlcCache';

import { PolygonClient } from '../../clients/PolygonClient';
import { SymphonyAdapter } from '../adapters/SymphonyAdapter';
import { Parser } from '../../services/Parser';
import { Backtester } from '../../services/Backtester';

// const algorithmJson = `{"description":"","children":[{"id":"55b3d518-6d02-4b24-9ce2-460004134e5d","step":"wt-cash-equal","children":[{"id":"f698a43f-c753-4433-946e-bff0e369ed5e","step":"group","name":"Anansi Extended Frontrunner","children":[{"step":"wt-cash-equal","id":"43dd0a5f-01cc-41fa-b351-cb1926675143","children":[{"weight":{"num":100,"den":100},"id":"45009acb-010a-4771-8ac9-17f60ccafc43","step":"if","children":[{"children":[{"name":"ProShares Ultra VIX Short-Term Futures ETF","ticker":"UVXY","has_marketcap":false,"id":"36975804-76be-48b6-a2a4-e387b2786db5","exchange":"BATS","price":10.03,"step":"asset","dollar_volume":316257474.62}],"is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"relative-strength-index","lhs-window-days":"10","lhs-val":"QQQ","id":"763336cc-18e6-49db-9289-db4e3ccc1ee0","comparator":"gt","rhs-val":"79","step":"if-child"},{"id":"f0fa5c8c-0bb9-4a0c-b614-b0b41fc009c8","step":"if-child","is-else-condition?":true,"children":[{"id":"6bc9828f-ba0c-4ce0-971a-30f771d1a2f3","step":"wt-cash-equal","children":[{"id":"ac8e8ac0-0ea3-4434-ba57-dddbf1715830","step":"if","children":[{"children":[{"name":"ProShares Ultra VIX Short-Term Futures ETF","ticker":"UVXY","has_marketcap":false,"id":"10f4ae09-49c2-4484-becf-7e4068bcde51","exchange":"BATS","price":4.89,"step":"asset","dollar_volume":245260600.38}],"is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"relative-strength-index","lhs-window-days":"10","lhs-val":"VTV","id":"1727464d-e862-48e8-9934-4cbcfb73c587","comparator":"gt","rhs-val":"79","step":"if-child"},{"id":"7e3f4871-4de1-4af8-9bd0-d3bb8e131a63","step":"if-child","is-else-condition?":true,"children":[{"id":"c40f2058-b15c-4471-98ce-ab6a7eafc77d","step":"wt-cash-equal","children":[{"id":"4d72a72a-e258-4cd1-9ccc-6cca7f0fb881","step":"if","children":[{"children":[{"name":"ProShares Ultra VIX Short-Term Futures ETF","ticker":"UVXY","has_marketcap":false,"id":"fa2a2734-ef55-4d2d-b591-bdb02ce41026","exchange":"BATS","price":4.89,"step":"asset","dollar_volume":245260600.38}],"is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"relative-strength-index","lhs-window-days":"10","lhs-val":"VOX","id":"56f1f06c-1cff-43e2-bdc5-40584d31e669","comparator":"gt","rhs-val":"79","step":"if-child","collapsed?":false},{"id":"71bc48d2-ddc4-497c-9d51-b2de80bbc079","step":"if-child","is-else-condition?":true,"children":[{"id":"39778297-1d16-41e1-8b74-ce0b3da6b0cc","step":"wt-cash-equal","children":[{"weight":{"num":100,"den":100},"id":"61755e6d-f03c-4d65-9faa-eadd4fdb9ed8","step":"if","children":[{"children":[{"name":"ProShares Ultra VIX Short-Term Futures ETF","ticker":"UVXY","has_marketcap":false,"id":"a260d6e7-9be5-4deb-9422-2e8fbc98eb4b","exchange":"BATS","price":4.86,"step":"asset","dollar_volume":198340740.72}],"is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"relative-strength-index","lhs-window-days":"10","lhs-val":"TECL","id":"fc64fbc3-cdfd-4f68-804d-a0998c78deda","comparator":"gt","rhs-val":"79","step":"if-child"},{"id":"6f336b2a-f157-4477-848f-243449c8186c","step":"if-child","is-else-condition?":true,"children":[{"id":"a0477d7e-2164-4b5f-9f7a-941354cb7abf","step":"wt-cash-equal","children":[{"id":"c994302d-6d78-4743-a796-8c757f3e6863","step":"if","children":[{"children":[{"ticker":"UVXY","exchange":"BATS","name":"ProShares Ultra VIX Short-Term Futures ETF","id":"fa52db8c-c7d4-47c6-a177-4b7193efbc7a","step":"asset"}],"is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"relative-strength-index","lhs-window-days":"10","lhs-val":"TQQQ","id":"2fd19dec-2038-4115-920b-dc5492b9d77c","comparator":"gt","rhs-val":"79","step":"if-child","collapsed?":false},{"id":"8a4ce5bb-23d2-46cf-8176-96c3eefecdd4","step":"if-child","is-else-condition?":true,"children":[{"id":"153ef6f9-b5dc-4261-9820-d4d790b589b1","step":"wt-cash-equal","children":[{"weight":{"num":"0","den":100},"id":"569974f1-a946-4586-a346-ba54ffc50f0e","step":"if","children":[{"children":[{"name":"ProShares Ultra VIX Short-Term Futures ETF","ticker":"UVXY","has_marketcap":false,"id":"b9354a52-f7da-4420-824d-a04157cbb071","exchange":"BATS","price":4.86,"step":"asset","dollar_volume":198340740.72}],"rhs-fn":"relative-strength-index","is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"relative-strength-index","rhs-window-days":"10","lhs-window-days":"10","lhs-val":"XLY","id":"b706d51a-3d45-4366-b40c-759df1c18455","comparator":"gt","rhs-val":"80","step":"if-child","collapsed?":false},{"id":"7a5c3208-e58a-4523-b34a-f426e8b1241e","step":"if-child","is-else-condition?":true,"children":[{"id":"d55637ae-973d-4d5b-be49-6008b5114815","step":"wt-cash-equal","children":[{"weight":{"num":"100","den":100},"id":"87793082-10b5-4c15-ada0-664c7978cd36","step":"if","children":[{"children":[{"name":"ProShares Ultra VIX Short-Term Futures ETF","ticker":"UVXY","has_marketcap":false,"id":"a551faca-334c-4203-ae87-09f5cab3dc8d","exchange":"BATS","price":4.86,"step":"asset","dollar_volume":198340740.72}],"rhs-fn":"relative-strength-index","is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"relative-strength-index","rhs-window-days":"10","lhs-window-days":"10","lhs-val":"FAS","id":"2bf3de9b-d0e8-4ee0-bcde-35804fe55e7c","comparator":"gt","rhs-val":"80","step":"if-child","collapsed?":false},{"id":"1fe75864-51ff-4b18-9355-d10847988082","step":"if-child","is-else-condition?":true,"children":[{"id":"5c1146a7-a156-47e4-a876-aad826c9eb0d","step":"wt-cash-equal","children":[{"weight":{"num":"100","den":100},"id":"59bd7e0d-d097-4e7f-9798-802a7e9656ad","step":"if","children":[{"children":[{"name":"ProShares Ultra VIX Short-Term Futures ETF","ticker":"UVXY","has_marketcap":false,"id":"7ad7147c-ca68-4048-a9c5-a1fca0d539ba","exchange":"BATS","price":4.86,"step":"asset","dollar_volume":198340740.72}],"rhs-fn":"relative-strength-index","is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"relative-strength-index","rhs-window-days":"10","lhs-window-days":"10","lhs-val":"SPY","id":"e2171e28-fa24-415d-a23a-3d1bc64b9a50","comparator":"gt","rhs-val":"80","step":"if-child","collapsed?":false},{"id":"8eb70681-2762-45d4-97b0-3f865eb661f6","step":"if-child","is-else-condition?":true,"children":[{"id":"5c91d07e-d429-4df4-9e5e-7be7f7545422","step":"wt-cash-equal","children":[{"weight":{"num":"100","den":100},"id":"007451fa-1a4a-4831-8e93-a11a2859e018","step":"if","children":[{"children":[{"name":"ProShares Ultra VIX Short-Term Futures ETF","ticker":"UVXY","has_marketcap":false,"id":"16f0d13b-407e-4e73-8c1b-cedd8e27e7a1","exchange":"BATS","price":4.86,"step":"asset","dollar_volume":198340740.72}],"rhs-fn":"relative-strength-index","is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"relative-strength-index","rhs-window-days":"10","lhs-window-days":"10","lhs-val":"XLP","id":"bbda784e-7096-47df-aa7f-74f78debc8f8","comparator":"gt","rhs-val":"75","step":"if-child","collapsed?":false},{"id":"2424a641-ec3d-4563-af72-f4d3a70bedd5","step":"if-child","is-else-condition?":true,"children":[{"id":"3def1498-8d3a-4390-ae3a-ec016661866b","step":"wt-cash-equal","children":[{"id":"1fa557bb-9f4c-493a-971e-08aa283c55b2","step":"if","children":[{"children":[{"name":"ProShares Ultra VIX Short-Term Futures ETF","ticker":"UVXY","has_marketcap":false,"id":"39711c27-ca02-4ba5-9bce-b097619ba221","exchange":"BATS","price":4.89,"step":"asset","dollar_volume":245260600.38}],"is-else-condition?":false,"rhs-fixed-value?":true,"lhs-fn":"max-drawdown","lhs-window-days":"9","lhs-val":"SPY","id":"455297c8-a058-4350-8677-d71d6eff57f0","comparator":"lt","rhs-val":"0.1","step":"if-child"},{"id":"e5b98ec6-25e0-4b39-a34f-dcb7f9498e5a","step":"if-child","is-else-condition?":true,"children":[{"id":"931c856a-d425-43a5-8026-13a4219d690c","step":"wt-cash-equal","children":[{"id":"84db5c87-0b4a-4db8-816e-cd23dec3a3c8","step":"group","name":"CodeBreaker (KMLM Signals)","children":[{"step":"wt-cash-equal","id":"f50741e0-6611-41d4-9d73-af86b4ea92a5","children":[{"weight":{"num":100,"den":100},"id":"95136cc2-f31a-41a6-bc9d-7a74b80f9086","step":"group","name":"10d RSI FTEC > 10d RSI KMLM","children":[{"step":"wt-cash-equal","id":"84a691c6-83df-48a3-b1fc-97ea487af371","children":[{"id":"3147a0dd-c115-49cb-87e1-f8dad0604c17","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"dca41ecc-d91a-4578-a036-d27f7af35b31","step":"asset","collapsed?":true,"children":[]}],"lhs-fn-params":{"window":10},"rhs-fn":"relative-strength-index","is-else-condition?":false,"lhs-fn":"relative-strength-index","lhs-val":"FTEC","id":"2f7734ea-cc99-4bd1-9886-47fe8b6b58e5","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"KMLM","step":"if-child","collapsed?":true},{"id":"b83838a9-ca6f-490c-ad71-d112158e6256","step":"if-child","is-else-condition?":true,"children":[{"ticker":"SQQQ","exchange":"XNAS","name":"ProShares UltraPro Short QQQ","id":"bd6bb39e-9691-4c3d-a088-f1900031592b","step":"asset","collapsed?":true,"children":[]}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true},{"weight":{"num":100,"den":100},"id":"dea42e87-4f72-47bd-9606-bc7d09decf03","step":"group","name":"20d RSI SVOL > 10d RSI KMLM","children":[{"step":"wt-cash-equal","id":"69510afb-3dff-4535-a503-30f39d43223b","children":[{"id":"2a9e25e8-3c87-4993-aee4-e8c4691977d1","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"965034a7-4838-44ad-9587-4df76f8d65c1","step":"asset","collapsed?":true,"children":[]}],"lhs-fn-params":{"window":20},"rhs-fn":"relative-strength-index","is-else-condition?":false,"lhs-fn":"relative-strength-index","lhs-val":"SVOL","id":"3bf1ed52-4dc0-46d0-8420-c2619082216c","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"KMLM","step":"if-child","collapsed?":true},{"id":"30d91e35-083e-4b69-8e94-0247bf6b18a2","step":"if-child","is-else-condition?":true,"children":[{"ticker":"SQQQ","exchange":"XNAS","name":"ProShares UltraPro Short QQQ","id":"6500c758-fd2f-4b6d-9a13-e6c958d72c99","step":"asset","collapsed?":true,"children":[]}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true},{"weight":{"num":100,"den":100},"id":"4860eb3e-55f5-48a7-a714-1fd5ad25a29a","step":"group","name":"10d RSI XLK > 10d RSI KMLM","children":[{"step":"wt-cash-equal","id":"7f8956b8-4a2e-4396-b160-d2a244ef3d68","children":[{"id":"5b9699fb-6cfe-4138-a086-b6e25ee58702","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"774c0d69-5403-4df3-80e5-fdce4c9587ec","step":"asset","collapsed?":true,"children":[]}],"lhs-fn-params":{"window":10},"rhs-fn":"relative-strength-index","is-else-condition?":false,"lhs-fn":"relative-strength-index","lhs-val":"XLK","id":"e572f5f4-904a-4ad8-a03c-1b184d97854d","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"KMLM","step":"if-child","collapsed?":true},{"id":"22575263-5099-4a29-a4b2-78768102094b","step":"if-child","is-else-condition?":true,"children":[{"ticker":"SQQQ","exchange":"XNAS","name":"ProShares UltraPro Short QQQ","id":"376b8e73-e504-4a75-893c-f8e9e50f9997","step":"asset","collapsed?":true,"children":[]}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true},{"weight":{"num":100,"den":100},"id":"7a79b8a4-56f0-47bd-b457-3505b633d029","step":"group","name":"10d RSI SMH > 10d RSI KMLM","children":[{"step":"wt-cash-equal","id":"c9f4716a-9fa4-4b2d-9ff5-d5f26bff8a1a","children":[{"id":"ef8fbe08-fe6a-4146-b599-de11bf553650","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"63857a69-1447-4408-9cb5-97eabfe101ea","step":"asset","collapsed?":true,"children":[]}],"lhs-fn-params":{"window":10},"rhs-fn":"relative-strength-index","is-else-condition?":false,"lhs-fn":"relative-strength-index","lhs-val":"SMH","id":"58b89d53-9031-4ac2-825f-55cc894ffbb9","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"KMLM","step":"if-child","collapsed?":true},{"id":"5e8487f6-0110-449a-bead-33779c34a387","step":"if-child","is-else-condition?":true,"children":[{"ticker":"SQQQ","exchange":"XNAS","name":"ProShares UltraPro Short QQQ","id":"a594352f-7a03-4a01-9631-f46f58266cd8","step":"asset","collapsed?":true,"children":[]}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true},{"weight":{"num":100,"den":100},"id":"89d3fc07-d24a-40cc-86d8-37faabcd21d0","step":"group","name":"10d RSI USD > 10d RSI KMLM","children":[{"step":"wt-cash-equal","id":"41b176d5-b732-4a6b-acb4-92697bd1dea0","children":[{"id":"c36e6cbd-f219-4e33-bf71-ce428c6ab520","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"6a79b35b-4d7a-40f1-9d27-3354b518e410","step":"asset","collapsed?":true,"children":[]}],"lhs-fn-params":{"window":10},"rhs-fn":"relative-strength-index","is-else-condition?":false,"lhs-fn":"relative-strength-index","lhs-val":"USD","id":"622da094-6bb3-4c65-a243-263f96c88364","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"KMLM","step":"if-child","collapsed?":true},{"id":"e0824679-809b-4994-8296-cfb90a295d9c","step":"if-child","is-else-condition?":true,"children":[{"ticker":"SQQQ","exchange":"XNAS","name":"ProShares UltraPro Short QQQ","id":"fd6cabc4-efb5-488d-963b-06fe202ace67","step":"asset","collapsed?":true,"children":[]}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true},{"weight":{"num":100,"den":100},"id":"2ab3bb26-9bb6-413c-8e0e-af04bfcad67b","step":"group","name":"10d RSI HYD > 10d RSI KMLM","children":[{"step":"wt-cash-equal","id":"743a7f12-9a5e-4e75-b4c4-8e8144eff7c2","children":[{"id":"ced0096b-c282-4d15-808f-b5f9efffb2cd","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"e272bdce-50fa-4fd9-afcd-77142ab152c5","step":"asset","collapsed?":true,"children":[]}],"lhs-fn-params":{"window":10},"rhs-fn":"relative-strength-index","is-else-condition?":false,"lhs-fn":"relative-strength-index","lhs-val":"HYD","id":"2c9927d2-3b23-4469-8484-2d1ada824ed8","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"KMLM","step":"if-child","collapsed?":true},{"id":"76d77a40-0592-436f-9079-d888f4379371","step":"if-child","is-else-condition?":true,"children":[{"ticker":"SQQQ","exchange":"XNAS","name":"ProShares UltraPro Short QQQ","id":"a400c96d-bba3-48fd-8e50-d58855106828","step":"asset","collapsed?":true,"children":[]}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true},{"weight":{"num":100,"den":100},"id":"6d08ca08-13b8-4f35-b5ec-def04eedfa0e","step":"group","name":"10d RSI IXP > 10d RSI KMLM","children":[{"step":"wt-cash-equal","id":"7736e42a-679c-46ed-afef-f341b4e7c34b","children":[{"id":"0c27fffd-04bd-4a29-8357-3f9b158c1296","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"1f74bf7d-76a1-416a-9123-3972e097f45b","step":"asset","collapsed?":true,"children":[]}],"lhs-fn-params":{"window":10},"rhs-fn":"relative-strength-index","is-else-condition?":false,"lhs-fn":"relative-strength-index","lhs-val":"IXP","id":"82334fa4-ab28-42ac-ac60-df8335bb9451","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"KMLM","step":"if-child","collapsed?":true},{"id":"f254d86e-30ab-4e2f-8754-bb6a6b219e89","step":"if-child","is-else-condition?":true,"children":[{"ticker":"SQQQ","exchange":"XNAS","name":"ProShares UltraPro Short QQQ","id":"54eb492c-2f5a-476a-bdee-bb941405d95f","step":"asset","collapsed?":true,"children":[]}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true},{"weight":{"num":100,"den":100},"id":"38192fe9-24ab-4f3a-8cd0-b2e344b4ac58","step":"group","name":"10d RSI FTLS > 10d RSI KMLM","children":[{"step":"wt-cash-equal","id":"b22b0f7d-87bb-4cf0-9e39-69e34e95a252","children":[{"id":"e0b67bfe-20e6-42de-96eb-963e1ff9011c","step":"if","children":[{"children":[{"ticker":"TQQQ","exchange":"XNAS","name":"ProShares UltraPro QQQ","id":"f31cdc8e-84de-4ba9-afc8-7e9547ac6b1f","step":"asset","collapsed?":true,"children":[]}],"lhs-fn-params":{"window":10},"rhs-fn":"relative-strength-index","is-else-condition?":false,"lhs-fn":"relative-strength-index","lhs-val":"FTLS","id":"b9a1dbb0-cc49-422a-814b-4add2bd066e0","rhs-fn-params":{"window":10},"comparator":"gt","rhs-val":"KMLM","step":"if-child","collapsed?":true},{"id":"51d12815-261f-4955-a05b-82421bd79b65","step":"if-child","is-else-condition?":true,"children":[{"ticker":"SQQQ","exchange":"XNAS","name":"ProShares UltraPro Short QQQ","id":"3a579e72-90cc-43b2-9f72-620b2920ca0e","step":"asset","collapsed?":true,"children":[]}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true}],"collapsed?":true}],"collapsed?":false}],"collapsed?":false}]}]}]}]}],"collapsed?":false}]}]}],"collapsed?":false}]}]}],"collapsed?":false}]}]}],"collapsed?":false}]}]}],"collapsed?":false}]}]}]}]}]}]}]}]}]}]}]}]}]}]}],"collapsed?":false,"weight":{"num":40,"den":100}}]}],"name":"CodeBreaker (KMLM Signals)+ Extended Frontrunner","asset_class":"EQUITIES","rebalance":"daily","id":"FB2PyGsMX6RD3fTO2ePj","step":"root"}`;

const algorithmJson = `{"description":"","children":[{"id":"51159f41-2d35-4642-b425-29f63516ef63","step":"wt-cash-equal","suppress-incomplete-warnings?":true,"children":[{"weight":{"num":100,"den":100},"ticker":"COST","exchange":"XNAS","name":"Costco Wholesale Corp","id":"847e5f84-5422-4bed-a1fa-5027fa0cadf1","step":"asset","suppress-incomplete-warnings?":true}]}],"suppress-incomplete-warnings?":false,"name":"New Symphony","asset_class":"EQUITIES","rebalance":"daily","id":"new","step":"root","asset_classes":["EQUITIES"]}`

const client = new AlpacaStockClient()
// const client = new TiingoClient()
// const client = new PolygonClient()

const algorithm: Symphony = JSON.parse(algorithmJson);
const adapter = new SymphonyAdapter()

const tradingBot = adapter.adapt(algorithm)
const parser = new Parser()
const { assets, tradeableAssets, indicators } = parser.parse(tradingBot)

const ohlcCache = new OhlcCache(client, assets)
await ohlcCache.load()
// ohlcCache.printDebugTable()

const indicatorCache = new IndicatorCache(ohlcCache, indicators)
await indicatorCache.load()
// indicatorCache.printDebugTable()

const backtester = new Backtester(tradingBot, client, tradeableAssets)
await backtester.run('2023-12-26')