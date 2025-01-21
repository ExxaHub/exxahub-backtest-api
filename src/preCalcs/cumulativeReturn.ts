import type { DailyReturn } from "../services/PreCalcCache";

export const cumulativeReturn = (returns: DailyReturn[], params: { window: number }): Record<string, number> => {
    const { window } = params;

    if (window < 2) {
        throw new Error(`Not enough data to calculate cumulative return for a window of ${window}.`);
    }

    if (returns.length < window + 1) {
        throw new Error(`Not enough data to calculate cumulative return for a window of ${window}.`);
    }

    const indicator: Record<string, number> = {};

    for (let j = window; j <= returns.length - 1; j++) {
        const recentReturns = returns.slice(j - window, j);
        const cumulativeReturn = recentReturns.reduce((product, r) => product * (1 + r.value), 1) - 1;
        indicator[returns[j].date] = cumulativeReturn;
    }
    return indicator;
}