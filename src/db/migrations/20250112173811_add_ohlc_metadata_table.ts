import type { Knex } from "knex";
import { table } from "../../models/OhlcMetadata";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(table, function (table) {
        table.string('symbol', 5).notNullable();
        table.string('last_fetch_date').notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(table)
}

