import { type ZodError } from 'zod'
import { HttpError } from './errors'

export const validateSchema = (schema: any, payload: Request['body']) => {
    try {
        return schema.parse(payload)
    } catch (e) {
        const errors = (e as ZodError).flatten().fieldErrors
        throw new HttpError(400, 'Bad Request', errors)
    }
}