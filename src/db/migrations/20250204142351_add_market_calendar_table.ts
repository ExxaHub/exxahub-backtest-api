import type { Knex } from "knex";
import { table } from '../../models/MarketCalendar'

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(table, function (table) {
        table.date('date').notNullable();
        table.bigInteger('ts').notNullable();
        table.string('open', 8).notNullable();
        table.string('close', 8).notNullable();
        table.string('settlement_date', 16).notNullable();

        table.unique(['date'], { indexName: 'date_unique_idx'});
        table.index(['ts'], 'ts_idx');
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(table)
}

