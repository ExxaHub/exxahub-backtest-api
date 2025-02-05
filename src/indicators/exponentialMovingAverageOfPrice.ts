type Params = { 
    window: number 
}

export const exponentialMovingAverageOfPrice = (ticker: string, params: Params, closes: number[]): number[] => {
    if (params.window <= 0) {
        throw new Error('Window size must be greater than zero');
    }

    if (params.window >= closes.length) {
        throw new Error('Not enough data to calculate for window size');
    }
    
    const period = params.window;
    const k = 2 / (period + 1);
    let ema: number[] = [];
    ema[0] = closes[0]; // Start with the first price as the initial EMA

    for (let i = 1; i < closes.length; i++) {
        ema[i] = closes[i] * k + ema[i - 1] * (1 - k);

        if (i < period) {
            continue;
        }
    }

    return ema.slice(period - 1); // Return the EMA values after the initial period
};
