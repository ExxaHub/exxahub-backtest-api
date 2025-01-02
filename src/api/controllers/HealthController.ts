import {type Request, type Response} from 'express'

export default class HealthController {
    async show(req: Request, res: Response) {
      return res.json({
        status: 'healthy'
      })
    }
}