import type { DailyReturn } from "../services/PreCalcCache";

export const standardDeviationOfReturn = (returns: DailyReturn[], params: { window: number }): Record<string, number> => {
    console.log('standardDeviationOfReturn', returns.length)
    const { window } = params;
    
    if (window < 2) {
        throw new Error(`Not enough data to calculate standard deviation of return for a window of ${window}.`);
    }
    
    if (returns.length < window + 1) {
        throw new Error(`Not enough data to calculate standard deviation of return for a window of ${window}.`);
    }
    
    const indicator: Record<string, number> = {};

    for (let j = window; j <= returns.length - 1; j++) {
        const recentReturns = returns.slice(j - window, j);
        const mean = recentReturns.reduce((sum, r) => sum + r.value, 0) / recentReturns.length;
        const variance = recentReturns.reduce((sum, r) => sum + Math.pow(r.value - mean, 2), 0) / recentReturns.length;
        const standardDeviation = Math.sqrt(variance);
        indicator[returns[j].date] = standardDeviation;
    }
    return indicator;

}