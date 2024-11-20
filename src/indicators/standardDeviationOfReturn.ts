import type { OHLCBar } from "../types";

type Params = { 
    window: number 
}

export const standardDeviationOfReturn = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    const { window } = params;

    if (window < 1) {
        throw new Error(`Not enough data to calculate standard deviation of return for a window of ${window}.`);
    }

    if (bars.length < window + 1) {
        throw new Error(`Not enough data to calculate standard deviation of return for a window of ${window}.`);
    }

    // Extract the most recent `window + 1` bars (to calculate `window` returns)
    const recentBars = bars.slice(-window - 1);

    // Calculate daily returns
    const returns = [];
    for (let i = 1; i < recentBars.length; i++) {
        const prevClose = recentBars[i - 1].close;
        const currClose = recentBars[i].close;

        const dailyReturn = (currClose - prevClose) / prevClose;
        returns.push(dailyReturn);
    }

    // Calculate the mean of the returns
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Calculate the variance
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    // Standard deviation is the square root of the variance
    const standardDeviation = Math.sqrt(variance);

    return {
        [recentBars[recentBars.length - 1].date]: standardDeviation
    };
}
