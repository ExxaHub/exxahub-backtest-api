import { schema } from '../db';
import { z } from "zod";

export const table = `${schema}.market_calendar`;

export const MarketCalendarModelSchema = z.object({
    date: z.string().date(),
    ts: z.number().int(),
    open: z.string().max(16),
    close: z.string().max(16),
    settlement_date: z.string().date(),
})
export type MarketCalendar = z.infer<typeof MarketCalendarModelSchema>