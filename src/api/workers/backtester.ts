import { MarketDataClientProvider } from "../../services/MarketDataClientProvider";
import { Backtester } from '../../services/Backtester'

// prevents TS errors
declare var self: Worker;

const marketDataClientProvider = new MarketDataClientProvider()
const client = marketDataClientProvider.getClient()

self.onmessage = async (event: MessageEvent) => {
    try {
        const backtester = new Backtester(client)
        const results = await backtester.run(event.data)
        postMessage(results);
    } catch (error) {
        console.error(error);
        postMessage({ error: (error as Error).message });
    }
};