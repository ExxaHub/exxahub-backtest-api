import { type Request, type Response, type NextFunction } from 'express'
import { type ZodError } from 'zod'
import { HttpError } from './errors'

export const handleRequest = (moduleLoader: any, method: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const module = await moduleLoader();
        const ControllerClass = module.default;
        const controllerInstance = new ControllerClass();
        if (typeof controllerInstance[method] === 'function') {
            return await controllerInstance[method](req, res, next);
        } else {
            throw new Error(`Method "${method}" not found in controller`);
        }
    } catch (e) {
        const error = (e as HttpError)
        console.error(error)
        return res.status(error.statusCode).json({
            message: error.message,
            errors: error.errors
        })
    }
}

export const validateSchema = (schema: any, payload: Request['body']) => {
    try {
        return schema.parse(payload)
    } catch (e) {
        const errors = (e as ZodError).flatten().fieldErrors
        throw new HttpError(400, 'Bad Request', errors)
    }
}