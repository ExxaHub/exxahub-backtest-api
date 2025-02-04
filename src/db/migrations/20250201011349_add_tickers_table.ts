import type { Knex } from "knex";
import { table } from "../../models/Ticker";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(table, function (table) {
            table.string('ticker', 5).notNullable().unique();
            table.string('name', 255).nullable();
            table.string('exchange_code', 16).notNullable();
            table.string('asset_type', 8).notNullable();
            table.date('start_date').notNullable();
            table.bigInteger('start_ts').notNullable();
            table.date('end_date').notNullable();
            table.bigInteger('end_ts').notNullable();

            table.unique(['ticker'], { indexName: 'ticker_unique_idx'});
            table.index(['ticker', 'start_ts'], 'ticker_start_ts_idx');
            table.index(['ticker', 'end_ts'], 'ticker_end_ts_idx');
        })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(table)
}

