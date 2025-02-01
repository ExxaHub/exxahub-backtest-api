import {type Request, type Response} from 'express'
import { workerPool } from '../workers/workerPool';
import { validateSchema } from '../utils';
import { createBacktestRequestSchema } from '../schemas/CreateBacktestRequest';

export default class BacktestController {
    async create(req: Request, res: Response) {
      validateSchema(createBacktestRequestSchema, req.body)
      workerPool.queue(req, res); 
    }
}