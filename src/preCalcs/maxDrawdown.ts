import type { DailyReturn } from "../services/PreCalcCache";

export const maxDrawdown = (returns: DailyReturn[], params: { window: number }): Record<string, number> => {
    const { window } = params;

    if (window < 2) {
        throw new Error(`Not enough data to calculate max drawdown for a window of ${window}.`);
    }

    if (returns.length < window + 1) {
        throw new Error(`Not enough data to calculate max drawdown for a window of ${window}.`);
    }

    const indicator: Record<string, number> = {};

    for (let j = window; j <= returns.length - 1; j++) {
        const recentReturns = returns.slice(j - window, j);
        let peak = -Infinity;
        let trough = Infinity;

        for (const r of recentReturns) {
            if (r.value > peak) {
                peak = r.value;
                trough = r.value;
            } else if (r.value < trough) {
                trough = r.value;
            }
        }

        const drawdown = (peak - trough) / peak;
        indicator[returns[j].date] = drawdown;
    }
    return indicator;
}