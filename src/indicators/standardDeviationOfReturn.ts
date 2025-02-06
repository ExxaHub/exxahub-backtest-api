type Params = { 
    window: number 
};

export const standardDeviationOfReturn = (ticker: string, params: Params, closes: number[]): number[] => {
    const { window } = params;

    if (window < 2) {
        throw new Error(`Not enough data to calculate standard deviation of return for a window of ${window}.`);
    }

    if (closes.length < window + 1) {
        throw new Error(`Not enough data to calculate standard deviation of return for a window of ${window}.`);
    }

    const stdDevs: number[] = [];

    for (let j = window; j <= closes.length; j++) {
        const recentCloses = closes.slice(j - window, j);
        const returns = [];

        for (let i = 1; i < recentCloses.length; i++) {
            const prevClose = recentCloses[i - 1];
            const currClose = recentCloses[i];
            const dailyReturn = (currClose - prevClose) / prevClose;
            returns.push(dailyReturn);
        }

        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const standardDeviation = Math.sqrt(variance);

        stdDevs.push(standardDeviation);
    }

    return stdDevs;
};
