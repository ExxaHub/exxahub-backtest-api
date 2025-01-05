import {type Request, type Response} from 'express'
import { createBacktestRequestSchema } from '../schemas/CreateBacktestRequest'
import { validateSchema } from '../utils'
import { MarketDataClientProvider } from '../../services/MarketDataClientProvider'
import { Backtester } from '../../services/Backtester'

export default class BacktestController {
    private marketDataClientProvider: MarketDataClientProvider

    constructor() {
      this.marketDataClientProvider = new MarketDataClientProvider()
    }

    async create(req: Request, res: Response) {
      const backtestConfig = validateSchema(createBacktestRequestSchema, req.body)

      const client = this.marketDataClientProvider.getClient()
      const backtester = new Backtester(client)
      const results = await backtester.run(backtestConfig)

      return res.json(results)
    }
}