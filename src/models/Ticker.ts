import { schema } from '../db';
import { z } from "zod";

export const table = `${schema}.tickers`;

export const tickerModelSchema = z.object({
    ticker: z.string().max(5),
    name: z.string().max(255).optional(),
    exchange_code: z.string().max(16),
    asset_type: z.string().max(8),
    start_date: z.string().date(),
    start_ts: z.number().int(),
    end_date: z.string().date(),
    end_ts: z.number().int(),
})
export type Ticker = z.infer<typeof tickerModelSchema>