

const alpacaApiKeyId = (): string => {
    return process.env.ALPACA_API_KEY_ID
}

const alpacaApiSecretKey = (): string => {
    return process.env.ALPACA_API_SECRET_KEY
}

export {
    alpacaApiKeyId,
    alpacaApiSecretKey
}