import { Backtester } from "../../backtester/Backtester";
import type { BacktestConfig } from "../schemas/CreateBacktestRequest";
import { MarketDataClientProvider } from "./MarketDataClientProvider";

export class BacktestService {
    private marketDataClientProvider: MarketDataClientProvider

    constructor() {
        this.marketDataClientProvider = new MarketDataClientProvider()
    }
    async run(backtestConfig: BacktestConfig): Promise<any> {
        const client = this.marketDataClientProvider.getClient()

        const backtester = new Backtester(client)
        const results = await backtester.run(backtestConfig)

        return results
    }
}