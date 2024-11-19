import type {OHLCBar} from "../types";

type Params = { 
    window: number 
}

export const standardDeviationOfPrice = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    if (params.window <= 0) {
        throw new Error('Window size must be greater than zero')
    }

    if (params.window >= bars.length) {
        throw new Error('Not enough data to calculate for window size')
    }
    
    const indicator: Record<string, number> = {}
    const stdDevLength = params.window
    const closes: number[] = bars.map(bar => bar.close);
    const stdDevs: number[] = [];

    for (let i = stdDevLength - 1; i < closes.length; i++) {
        const slice = closes.slice(i - stdDevLength + 1, i + 1);
        const avg = slice.reduce((acc, val) => acc + val, 0) / stdDevLength;
        const squareDiffs = slice.map(val => Math.pow(val - avg, 2));
        const variance = squareDiffs.reduce((acc, val) => acc + val, 0) / stdDevLength;
        const stdDev = Math.sqrt(variance);
        stdDevs.push(stdDev);
    }

    for (let i = stdDevLength - 1; i < closes.length; i++) {
        indicator[bars[i].date] = parseFloat(stdDevs[i - stdDevLength + 1].toFixed(2))
    }

    return indicator;
}