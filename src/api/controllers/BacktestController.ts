import {type Request, type Response} from 'express'
import { createBacktestRequestSchema } from '../schemas/CreateBacktestRequest'
import { BacktestService } from '../services/BacktestService'
import { validateSchema } from '../utils'

export default class BacktestController {
    backtestService: BacktestService

    constructor() {
      this.backtestService = new BacktestService()
    }

    async create(req: Request, res: Response) {
      const backtestConfig = validateSchema(createBacktestRequestSchema, req.body)
      const results = await this.backtestService.run(backtestConfig)
      return res.json(results)
    }
}