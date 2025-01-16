import { MarketDataClientProvider } from "../../services/MarketDataClientProvider";
import { Backtester } from '../../services/Backtester'
import { createBacktestRequestSchema } from '../schemas/CreateBacktestRequest'
import { validateSchema } from '../utils'

// prevents TS errors
declare var self: Worker;

const marketDataClientProvider = new MarketDataClientProvider()

self.onmessage = async (event: MessageEvent) => {
    const backtestConfig = validateSchema(createBacktestRequestSchema, event.data)
    const client = marketDataClientProvider.getClient()
    const backtester = new Backtester(client)
    const results = await backtester.run(backtestConfig)
    postMessage(results);
};