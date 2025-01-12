import type { Knex } from "knex";
import { schema } from "..";
import { table } from "../../models/OhlcBar";

const tableWithSchema = `${schema}.${table}`

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(tableWithSchema, function (table) {
        table.string('id').unique();
        table.string('symbol', 5).notNullable();
        table.date('date').notNullable();
        table.decimal('open', 10, 2).notNullable();
        table.decimal('high', 10, 2).notNullable();
        table.decimal('low', 10, 2).notNullable();
        table.decimal('close', 10, 2).notNullable();
        table.integer('volume').notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(tableWithSchema)
}

