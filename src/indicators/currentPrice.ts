import type {OHLCBar} from "../types/types";
import { AlpacaStockClient } from "../clients/AlpacaClient";

type Params = {}

// TODO: Figure out a way to inject this client to use different data providers
const alpacaClient = new AlpacaStockClient()

export const currentPrice = async (ticker: string, params: Params, closes: number[]): Promise<number[]> => {
    // const result = await alpacaClient.getCurrentPriceForSymbol(ticker)
    // return [result[ticker]]

    return closes
}
