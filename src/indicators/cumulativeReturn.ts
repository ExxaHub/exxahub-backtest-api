type Params = { 
    window: number 
}

export const cumulativeReturn = (ticker: string, params: Params, closes: number[]): number[] => {
    if (params.window <= 0) {
        throw new Error('Window size must be greater than zero');
    }

    if (params.window >= closes.length) {
        throw new Error('Not enough data to calculate for window size');
    }

    const returnLength = params.window;
    const returns: number[] = [];

    for (let i = returnLength; i < closes.length; i++) {
        const previousClose = closes[i - returnLength];
        const currentClose = closes[i];
        const returnPercentage = ((currentClose - previousClose) / previousClose) * 100;
        returns.push(parseFloat(returnPercentage.toFixed(2)));
    }

    return returns;
};
