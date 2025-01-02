import { AlpacaStockClient, IndicatorCache, OhlcCache, SymphonyAdapter, TradingBotBacktester, TradingBotParser } from "../../backtester";
import type { TradingBotNode } from "../../backtester/types";
import type { BacktestConfig } from "../schemas/CreateBacktestRequest";

export class BacktestService {
    async run(backtestConfig: BacktestConfig): Promise<any> {
        const client = new AlpacaStockClient()
        // const client = new TiingoClient()
        // const client = new PolygonClient()

        // const adapter = new SymphonyAdapter()
        // const tradingBot = adapter.adapt(algorithm)

        const backtester = new TradingBotBacktester(client)
        const results = await backtester.run(backtestConfig)

        return results
    }
}