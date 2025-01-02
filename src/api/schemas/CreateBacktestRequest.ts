import { z } from 'zod'

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

const startingCapital = z.number()
    .int()
    .min(1000)

const startDate = z.string().date()

const endDate = z.string().date()

export const createBacktestRequestSchema = z.object({
    starting_balance: startingCapital,
    start_date: startDate,
    end_date: endDate,

    // JSON type - https://zod.dev/?id=json-type
    trading_bot: z.lazy(() =>
        z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
    ),
})

export type BacktestConfig = z.infer<typeof createBacktestRequestSchema>;