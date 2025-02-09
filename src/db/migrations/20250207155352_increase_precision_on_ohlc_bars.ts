import type { Knex } from "knex";
import { table } from "../../models/OhlcBar";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(table, (table) => {
        table.decimal('volume', 18, 2).alter();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(table, (table) => {
        table.decimal('volume', 12, 2).alter();
    });
}

