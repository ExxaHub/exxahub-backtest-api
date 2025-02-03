import {type Request, type Response} from 'express'
import { TickerService } from '../../services/TickerService'

export default class TickerController {
  private tickerService: TickerService
  
  constructor() {
    this.tickerService = new TickerService()
  }

  async list(req: Request, res: Response) {
    const tickers = await this.tickerService.getAll()
    return res.json({
      data: tickers
    })
  }
}