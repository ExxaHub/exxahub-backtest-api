import type {OHLCBar} from "../types/types";

type Params = { 
    window: number 
}

export const cumulativeReturn = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    if (params.window <= 0) {
        throw new Error('Window size must be greater than zero')
    }

    if (params.window >= bars.length) {
        throw new Error('Not enough data to calculate for window size')
    }

    const indicator: Record<string, number> = {}
    const returnLength = params.window

    for (let i = returnLength; i < bars.length; i++) {
        const previousClose = bars[i - returnLength].close;
        const currentClose = bars[i].close;
        const returnPercentage = ((currentClose - previousClose) / previousClose) * 100;
        indicator[bars[i].date] = parseFloat(returnPercentage.toFixed(2))
    }

    return indicator;
}