import {type Request, type Response} from 'express'
import { SymphonyAdapter } from '../../backtester'
import type { Symphony } from '../../backtester/types'

export default class BacktestController {
    async symphony(req: Request, res: Response) {
      const adapter = new SymphonyAdapter()
      const tradingBot = adapter.adapt(req.body as Symphony)
      return res.json(tradingBot)
    }
}