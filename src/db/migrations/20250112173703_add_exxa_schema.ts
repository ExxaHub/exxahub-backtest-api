import type { Knex } from "knex";
import { schema } from "..";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createSchema(schema)
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropSchemaIfExists(schema)
}

