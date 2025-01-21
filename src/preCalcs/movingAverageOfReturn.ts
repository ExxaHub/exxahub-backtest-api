import type { DailyReturn } from "../services/PreCalcCache";

export const movingAverageOfReturn = (returns: DailyReturn[], params: { window: number }): Record<string, number> => {
    const { window } = params;

    if (window < 2) {
        throw new Error(`Not enough data to calculate moving average of return for a window of ${window}.`);
    }

    if (returns.length < window + 1) {
        throw new Error(`Not enough data to calculate moving average of return for a window of ${window}.`);
    }

    const indicator: Record<string, number> = {};

    for (let j = window; j <= returns.length - 1; j++) {
        const recentReturns = returns.slice(j - window, j);
        const movingAverage = recentReturns.reduce((sum, r) => sum + r.value, 0) / recentReturns.length;
        indicator[returns[j].date] = movingAverage;
    }
    return indicator;
}