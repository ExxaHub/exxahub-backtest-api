import type {OHLCBar} from "../types";

type Params = {}

export const currentPrice = (ticker: string, params: Params, bars: OHLCBar[]): number => {
    // TODO: Pull current price from cache
    return 1.0
}
