import type { Knex } from "knex";
import { table } from "../../models/OhlcBar";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(table, function (table) {
        table.string('symbol', 5).notNullable();
        table.string('date').notNullable();
        table.bigInteger('ts').notNullable();
        table.decimal('open', 10, 2).notNullable();
        table.decimal('high', 10, 2).notNullable();
        table.decimal('low', 10, 2).notNullable();
        table.decimal('close', 10, 2).notNullable();
        table.decimal('volume', 12, 2).notNullable();

        table.unique(['symbol', 'ts'], { indexName: 'symbol_ts_unique_idx'});
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(table)
}

