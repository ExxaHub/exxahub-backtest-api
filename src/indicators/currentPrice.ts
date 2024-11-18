import type {OHLCBar} from "../types";
import { AlpacaStockClient } from "../clients/AlpacaClient";

type Params = {}

const alpacaClient = new AlpacaStockClient()

export const currentPrice = async (ticker: string, params: Params, bars: OHLCBar[]): Promise<Record<string, number>> => {
    return await alpacaClient.getCurrentPriceForSymbol(ticker)
}
