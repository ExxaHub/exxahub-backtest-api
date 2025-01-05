import type { MarketDataProvider } from "../services/MarketDataClientProvider"

const getMarketDataProvider = (): MarketDataProvider => {
    return process.env.MARKET_DATA_PROVIDER as MarketDataProvider
}

const alpacaApiKeyId = (): string => {
    return process.env.ALPACA_API_KEY_ID
}

const alpacaApiSecretKey = (): string => {
    return process.env.ALPACA_API_SECRET_KEY
}

const tiingoApiToken = (): string => {
    return process.env.TIINGO_API_KEY
}

const polygonApiToken = (): string => {
    return process.env.POLYGON_API_KEY
}

export {
    getMarketDataProvider,
    alpacaApiKeyId,
    alpacaApiSecretKey,
    tiingoApiToken,
    polygonApiToken
}