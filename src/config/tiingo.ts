

const tiingoApiToken = (): string => {
    return process.env.TIINGO_API_KEY
}

export {
    tiingoApiToken
}