import { db, metadataSchema, migrationsDirectory, migrationsExtension, migrationsTableName } from "..";

console.log('Running migrations')

const res = await db.migrate.latest({
    schemaName: 'public',
    tableName: migrationsTableName,
    directory: migrationsDirectory,
    extension: migrationsExtension
})

console.log('Finished running migrations:', res)