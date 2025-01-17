import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE MATERIALIZED VIEW exxahub.ohlc_bars_summary AS
        SELECT symbol, MIN(date) AS min_date, MAX(date) AS max_date
        FROM exxahub.ohlc_bars
        GROUP BY symbol;
    `);

    await knex.raw(`
        CREATE UNIQUE INDEX ohlc_bars_summary_symbol_idx
        ON exxahub.ohlc_bars_summary (symbol);
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP MATERIALIZED VIEW IF EXISTS exxahub.ohlc_bars_summary;
    `);
}

