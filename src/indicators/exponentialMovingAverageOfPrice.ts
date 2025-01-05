import type {OHLCBar} from "../types";

type Params = { 
    window: number 
}

export const exponentialMovingAverageOfPrice = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    if (params.window <= 0) {
        throw new Error('Window size must be greater than zero')
    }

    if (params.window >= bars.length) {
        throw new Error('Not enough data to calculate for window size')
    }
    
    const indicator: Record<string, number> = {}
    const period = params.window

    const k = 2 / (period + 1);
    let ema: number[] = [];
    ema[0] = bars[0].close; // Start with the first price as the initial EMA

    for (let i = 1; i < bars.length; i++) {
        ema[i] = bars[i].close * k + ema[i - 1] * (1 - k);

        if (i < period) {
            continue
        }

        indicator[bars[i].date] = ema[i]
    }

    return indicator;
};