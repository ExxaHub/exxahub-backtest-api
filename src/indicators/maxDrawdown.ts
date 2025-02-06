type Params = { 
    window: number; 
};

export const maxDrawdown = (ticker: string, params: Params, closes: number[]): number[] => {
    const { window } = params;

    if (window < 1) {
        throw new Error('Window size must be greater than zero');
    }

    if (closes.length < window) {
        throw new Error(`Not enough data to calculate max drawdown for a window of ${window}.`);
    }

    const drawdowns: number[] = [];
    let peak = Number.NEGATIVE_INFINITY;
    let maxDrawdown = 0;

    for (let i = 0; i < closes.length; i++) {
        if (closes[i] > peak) {
            peak = closes[i];
        }

        const drawdown = ((peak - closes[i]) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);

        if (i >= window - 1) {
            drawdowns.push(maxDrawdown);
        }
    }

    return drawdowns;
};
