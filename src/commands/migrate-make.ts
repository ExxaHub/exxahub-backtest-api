import { db, migrationsDirectory, migrationsExtension } from "../db";

const name = process.argv[2]

const res = await db.migrate.make(name, {
    directory: migrationsDirectory,
    extension: migrationsExtension
})

console.log('New migration created:', res)

process.exit(0);