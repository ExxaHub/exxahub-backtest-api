import type { DailyReturn } from "../services/PreCalcCache";

export const relativeStrengthIndex = (returns: DailyReturn[], params: { window: number }): Record<string, number> => {
    const { window } = params;

    if (window < 2) {
        throw new Error(`Not enough data to calculate relative strength index for a window of ${window}.`);
    }

    if (returns.length < window + 1) {
        throw new Error(`Not enough data to calculate relative strength index for a window of ${window}.`);
    }

    const indicator: Record<string, number> = {};

    for (let j = window; j <= returns.length - 1; j++) {
        const recentReturns = returns.slice(j - window, j);
        let gains = 0;
        let losses = 0;

        for (let i = 1; i < recentReturns.length; i++) {
            const change = recentReturns[i].value - recentReturns[i - 1].value;
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }

        const averageGain = gains / window;
        const averageLoss = losses / window;
        const rs = averageGain / averageLoss;
        const rsi = 100 - (100 / (1 + rs));

        indicator[returns[j].date] = rsi;
    }
    return indicator;
}