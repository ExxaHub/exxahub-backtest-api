import type { OHLCBar } from "../types/types";

type Params = { 
    window: number 
};

export const relativeStrengthIndex = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    const rsiLength = params.window;
    const indicator: Record<string, number> = {};

    if (rsiLength > bars.length) {
        throw new Error(`Not enough data for RSI calculation. Ticker: ${ticker}, RSI Length: ${rsiLength}, Bars: ${bars.length}`);
    }

    const closes = bars.map(bar => bar.close);
    const dates = bars.map(bar => bar.date);
    const gains: number[] = Array(closes.length).fill(0);
    const losses: number[] = Array(closes.length).fill(0);

    // Calculate gains and losses in a single pass
    for (let i = 1; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1];
        if (change > 0) {
            gains[i] = change;
        } else {
            losses[i] = -change;
        }
    }

    // Calculate initial averages
    let avgGain = gains.slice(1, rsiLength + 1).reduce((a, b) => a + b, 0) / rsiLength;
    let avgLoss = losses.slice(1, rsiLength + 1).reduce((a, b) => a + b, 0) / rsiLength;

    // Calculate RSI for each subsequent date
    for (let i = rsiLength; i < closes.length; i++) {
        avgGain = (avgGain * (rsiLength - 1) + gains[i]) / rsiLength;
        avgLoss = (avgLoss * (rsiLength - 1) + losses[i]) / rsiLength;

        let RSI: number;
        if (avgLoss === 0) {
            RSI = 100; // No losses in the period
        } else {
            const RS = avgGain / avgLoss;
            RSI = 100 - (100 / (1 + RS));
        }

        indicator[dates[i]] = parseFloat(RSI.toFixed(4));
    }

    console.log(ticker, indicator);

    return indicator;
};
