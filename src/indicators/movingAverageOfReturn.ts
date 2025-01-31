import type { OHLCBar } from "../types/types";

type Params = { 
    window: number; 
};

export const movingAverageOfReturn = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    const { window } = params;

    if (window < 2) {
        throw new Error(`Not enough data to calculate moving average of return for a window of ${window}.`);
    }

    // Ensure there are enough bars to calculate the moving average of returns
    if (bars.length < window + 1) {
        throw new Error(`Not enough data to calculate moving average of return for a window of ${window}.`);
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

        // Calculate the moving average of returns
        const movingAverage = returns.reduce((sum, r) => sum + r, 0) / returns.length;    

        indicator[recentBars[recentBars.length - 1].date] = movingAverage
    }

    return indicator
};
