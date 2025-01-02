import type { OHLCBar } from "../types";

type Params = { 
    window: number 
}

export const standardDeviationOfReturn = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    const { window } = params;

    if (window < 2) {
        throw new Error(`Not enough data to calculate standard deviation of return for a window of ${window}.`);
    }

    if (bars.length < window + 1) {
        throw new Error(`Not enough data to calculate standard deviation of return for a window of ${window}.`);
    }

    const indicator: Record<string, number> = {}

    for (let j = window; j <= bars.length; j++) {
        // Extract the most recent `window` bars
        const recentBars = bars.slice(j - window, j);

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

        indicator[recentBars[recentBars.length - 1].date] = standardDeviation
    }

    return indicator
}
