import { type Request, type Response } from 'express'
import { SymphonyAdapter } from '../../adapters/SymphonyAdapter'
import type { Symphony } from '../../types/types'

export default class AdapterController {
    async symphony(req: Request, res: Response) {
      const adapter = new SymphonyAdapter()
      const tradingBot = adapter.adapt(req.body as Symphony)
      return res.json(tradingBot)
    }
}