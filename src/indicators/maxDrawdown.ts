export type OHLCBar = {
    close: number;
    high: number;
    low: number;
    open: number;
    date: string;
    volume: number;
    [key: string]: unknown;
}

type Params = { 
    window: number 
}

export const maxDrawdown = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    const { window } = params;

    if (window < 1) {
        throw new Error('Window size must be greater than zero');
    }

    if (bars.length < window) {
        throw new Error(`Not enough data to calculate max drawdown for a window of ${window}.`);
    }

    // Extract the most recent `window` bars
    const recentBars = bars.slice(-window);

    const indicator: Record<string, number> = {}
    let peak = Number.NEGATIVE_INFINITY;
    let maxDrawdown = 0;

    for (const bar of recentBars) {
        // Update the peak if the current close price is higher
        if (bar.close > peak) {
            peak = bar.close;
        }

        // Calculate drawdown as a percentage
        const drawdown = ((peak - bar.close) / peak) * 100;

        // Update the max drawdown
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }

        indicator[bar.date] = maxDrawdown
    }

    return indicator
}