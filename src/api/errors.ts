export class HttpError extends Error {
    readonly statusCode: number
    readonly errors: any

    constructor(statusCode: number, message: string, errors: any = undefined) {
        super(message)
        this.statusCode = statusCode
        this.errors = errors
    }
}