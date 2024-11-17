import type {OHLCBar} from "../types";
import dayjs from "dayjs";

type Params = { 
    window: number 
}

export const rsi = (ticker: string, params: Params, bars: OHLCBar[]): Record<string, number> => {
    const rsiLength = params.window
    const indicator: Record<string, number> = {}
    const closes: number[] = bars.map(bar => bar.close);
    const changes: number[] = [];
    for (let i = 1; i < closes.length; i++) {
        changes.push(closes[i] - closes[i - 1]);
    }

    const gains: number[] = [];
    const losses: number[] = [];
    for (let i = 0; i < changes.length; i++) {
        if (changes[i] > 0) {
            gains.push(changes[i]);
            losses.push(0);
        } else {
            gains.push(0);
            losses.push(-changes[i]);
        }
    }

    let avgGain = gains.slice(0, rsiLength).reduce((a, b) => a + b, 0) / rsiLength;
    let avgLoss = losses.slice(0, rsiLength).reduce((a, b) => a + b, 0) / rsiLength;

    for (let i = 0; i < closes.length - 1; i++) { // Start from rsiLength - 1 index
        avgGain = (avgGain * (rsiLength - 1) + gains[i]) / rsiLength;
        avgLoss = (avgLoss * (rsiLength - 1) + losses[i]) / rsiLength;

        const RS = avgGain / avgLoss;
        const RSI = 100 - (100 / (1 + RS));
        const date = dayjs(bars[i].date).add(1, 'day')

        indicator[date.format('YYYY-MM-DD')] = parseFloat(RSI.toFixed(2));
    }

    return indicator;
}