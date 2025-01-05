import type {OHLCBar} from "../types/types";

type Params = { 
    window: number 
}

export const movingAverageOfPrice = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    if (params.window <= 0) {
        throw new Error('Window size must be greater than zero')
    }

    if (params.window >= bars.length) {
        throw new Error('Not enough data to calculate for window size')
    }

    const indicator: Record<string, number> = {}
    const period = params.window

    const closes: number[] = bars.map(bar => bar.close);

    for (let i = period; i < closes.length; i++) {
        const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        const sma = sum / period;
        indicator[bars[i].date] = parseFloat(sma.toFixed(2))
    }

    return indicator;
}