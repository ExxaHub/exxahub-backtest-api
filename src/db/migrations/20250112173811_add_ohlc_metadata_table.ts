import type { Knex } from "knex";
import { schema } from "..";
import { table } from "../../models/OhlcMetadata";

const tableWithSchema = `${schema}.${table}`

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(tableWithSchema, function (table) {
        table.string('id').unique();
        table.string('symbol', 5).notNullable();
        table.date('last_fetch_date').notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(tableWithSchema)
}

