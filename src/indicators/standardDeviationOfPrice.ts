type Params = { 
    window: number 
};

export const standardDeviationOfPrice = (ticker: string, params: Params, closes: number[]): number[] => {
    if (params.window <= 0) {
        throw new Error('Window size must be greater than zero');
    }

    if (params.window >= closes.length) {
        throw new Error('Not enough data to calculate for window size');
    }
    
    const stdDevLength = params.window;
    const stdDevs: number[] = [];

    for (let i = stdDevLength - 1; i < closes.length; i++) {
        const slice = closes.slice(i - stdDevLength + 1, i + 1);
        const avg = slice.reduce((acc, val) => acc + val, 0) / stdDevLength;
        const squareDiffs = slice.map(val => Math.pow(val - avg, 2));
        const variance = squareDiffs.reduce((acc, val) => acc + val, 0) / stdDevLength;
        const stdDev = Math.sqrt(variance);
        stdDevs.push(parseFloat(stdDev.toFixed(2)));
    }

    return stdDevs;
};
