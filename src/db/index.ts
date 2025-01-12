import knex from "knex";
import { getCredentials } from "../config/db";
import path from "path";

const credentials = getCredentials()

export const schema = 'exxahub'
export const metadataSchema = 'metadata'

export const migrationsDirectory = path.join(__dirname, '..', 'db', 'migrations')
export const migrationsExtension = 'ts'
export const migrationsTableName = 'migrations'

export const db = knex({
    client: 'pg',
    connection: {
      host: credentials.DB_HOST,
      port: credentials.DB_PORT,
      user: credentials.DB_USER,
      password: credentials.DB_PASS,
      database: credentials.DB_NAME,
    },
});