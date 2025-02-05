type Params = { 
    window: number; 
};

export const movingAverageOfPrice = (ticker: string, params: Params, closes: number[]): number[] => {
    const { window } = params;

    if (window <= 0) {
        throw new Error('Window size must be greater than zero');
    }

    if (window > closes.length) {
        throw new Error('Not enough data to calculate for window size');
    }

    const movingAverages: number[] = [];

    for (let i = window - 1; i < closes.length; i++) {
        const sum = closes.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
        const sma = sum / window;
        movingAverages.push(parseFloat(sma.toFixed(2)));
    }

    return movingAverages;
};
