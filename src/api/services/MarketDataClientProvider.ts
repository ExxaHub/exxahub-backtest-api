import { AlpacaStockClient } from "../../backtester/clients/AlpacaClient";
import { TiingoClient } from "../../backtester/clients/TiingoClient";
import { PolygonClient } from "../../backtester/clients/PolygonClient";
import type { ClientInterface } from "../../backtester/types";
import { getMarketDataProvider } from "../../config/marketDataProviders";
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