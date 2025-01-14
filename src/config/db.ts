type DatabaseCredentials = {
    DB_HOST: string,
    DB_PORT: number,
    DB_NAME: string,
    DB_USER: string,
    DB_PASS: string
}

export const getCredentials = (): DatabaseCredentials => {
    return {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: parseInt(process.env.DB_PORT),
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS
    }       
}