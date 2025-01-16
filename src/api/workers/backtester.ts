import { MarketDataClientProvider } from "../../services/MarketDataClientProvider";
import { Backtester } from '../../services/Backtester'

// prevents TS errors
declare var self: Worker;

const marketDataClientProvider = new MarketDataClientProvider()
const client = marketDataClientProvider.getClient()

self.onmessage = async (event: MessageEvent) => {
    const backtester = new Backtester(client)
    const results = await backtester.run(event.data)
    postMessage(results);
};