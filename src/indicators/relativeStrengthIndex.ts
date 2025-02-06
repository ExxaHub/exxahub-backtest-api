type Params = { 
    window: number 
};

export const relativeStrengthIndex = (ticker: string, params: Params, closes: number[]): number[] => {
    const rsiLength = params.window;
    const rsiValues: number[] = [];

    if (rsiLength > closes.length) {
        throw new Error(`Not enough data for RSI calculation. Ticker: ${ticker}, RSI Length: ${rsiLength}, Closes: ${closes.length}`);
    }

    const gains: number[] = Array(closes.length).fill(0);
    const losses: number[] = Array(closes.length).fill(0);

    for (let i = 1; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1];
        if (change > 0) {
            gains[i] = change;
        } else {
            losses[i] = -change;
        }
    }

    let avgGain = gains.slice(1, rsiLength + 1).reduce((a, b) => a + b, 0) / rsiLength;
    let avgLoss = losses.slice(1, rsiLength + 1).reduce((a, b) => a + b, 0) / rsiLength;

    for (let i = rsiLength; i < closes.length; i++) {
        avgGain = (avgGain * (rsiLength - 1) + gains[i]) / rsiLength;
        avgLoss = (avgLoss * (rsiLength - 1) + losses[i]) / rsiLength;

        let RSI: number;
        if (avgLoss === 0) {
            RSI = 100;
        } else {
            const RS = avgGain / avgLoss;
            RSI = 100 - (100 / (1 + RS));
        }

        rsiValues.push(parseFloat(RSI.toFixed(4)));
    }

    return rsiValues;
};
