import type { Knex } from "knex";
import { table } from "../../models/Ticker";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(table, function (table) {
            table.string('ticker', 5).notNullable().unique();
            table.string('name', 255).nullable();
            table.string('exchange_code', 16).notNullable();
            table.string('asset_type', 8).notNullable();
            table.date('start_date').notNullable();
            table.date('end_date').notNullable();
        })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(table)
}

