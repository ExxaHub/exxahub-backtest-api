import { AlpacaStockClient } from "../clients/AlpacaClient";
import { TiingoClient } from "../clients/TiingoClient";
import { PolygonClient } from "../clients/PolygonClient";
import type { ClientInterface } from "../types/types";
import { getMarketDataProvider } from "../config/marketDataProviders";
import { HttpError } from "../api/errors";

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