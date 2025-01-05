import { AlpacaStockClient, PolygonClient, TiingoClient } from "../../backtester";
import type { ClientInterface } from "../../backtester/types";
import { getMarketDataProvider } from "../config/marketData";
import { HttpError } from "../errors";

export enum MarketDataProvider {
    Alpaca = 'alpaca',
    Tiingo = 'tiingo',
    Polygon = 'polygon',
}

export class MarketDataClientProvider {
    getClient(): ClientInterface {
        const provider: MarketDataProvider = getMarketDataProvider()

        switch(provider) {
            case MarketDataProvider.Alpaca: 
                return new AlpacaStockClient()

            case MarketDataProvider.Tiingo: 
                return new TiingoClient()

            case MarketDataProvider.Polygon: 
                return new PolygonClient()

            default:
                throw new HttpError(500, `Unknown MarketDataProvider: ${provider}`)
        }
    }
}