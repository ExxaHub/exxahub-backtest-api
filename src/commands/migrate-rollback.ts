import { db, migrationsDirectory, migrationsExtension, migrationsTableName } from "../db";

console.log('Running migrations')

const res = await db.migrate.rollback({
    schemaName: 'public',
    tableName: migrationsTableName,
    directory: migrationsDirectory,
    extension: migrationsExtension
})

console.log('Finished rolling back migrations:', res)

process.exit(0);