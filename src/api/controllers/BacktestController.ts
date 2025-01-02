import {type Request, type Response} from 'express'
import { createBacktestRequestSchema } from '../schemas/CreateBacktestRequest'
import type { ZodError } from 'zod'
import { BacktestService } from '../services/BacktestService'

export default class BacktestController {
    backtestService: BacktestService

    constructor() {
      this.backtestService = new BacktestService()
    }

    async create(req: Request, res: Response) {
      let backtestConfig
      try {
        backtestConfig = createBacktestRequestSchema.parse(req.body)
      } catch (e) {
        return res.status(400).json({
          message: 'Bad Request',
          errors: (e as ZodError).issues
        })
      }

      console.log(req.body)
      console.log(backtestConfig)

      const results = await this.backtestService.run(backtestConfig)

      return res.json(results)
    }
}