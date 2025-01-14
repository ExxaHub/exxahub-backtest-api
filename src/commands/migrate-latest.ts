import { db, migrationsDirectory, migrationsExtension, migrationsTableName } from "../db";

console.log('Running migrations')

const res = await db.migrate.latest({
    schemaName: 'public',
    tableName: migrationsTableName,
    directory: migrationsDirectory,
    extension: migrationsExtension
})

console.log('Finished running migrations:', res)