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

        // console.time("TradingBotParser");
        // const parser = new TradingBotParser()
        // const { assets, tradeableAssets, indicators } = parser.parse(backtestConfig.trading_bot as TradingBotNode)
        // console.timeEnd("TradingBotParser");

        // console.time("OhlcCache");
        // const ohlcCache = new OhlcCache(client, assets)
        // await ohlcCache.load()
        // console.timeEnd("OhlcCache");

        // console.time("IndicatorCache");
        // const indicatorCache = new IndicatorCache(ohlcCache, indicators)
        // await indicatorCache.load()
        // console.timeEnd("IndicatorCache");

        console.time("TradingBotBacktester");
        const backtester = new TradingBotBacktester(backtestConfig.trading_bot as TradingBotNode, client)
        const results = await backtester.run(backtestConfig.start_date, backtestConfig.end_date)
        console.timeEnd("TradingBotBacktester");

        return results
    }
}