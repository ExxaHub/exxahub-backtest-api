import SwaggerParser from "@apidevtools/swagger-parser";
import {type Request, type Response} from 'express'

export default class DocsController {
    async show(req: Request, res: Response) {
      const docs = await SwaggerParser.bundle('./src/api/docs/open-api.yml')
      return res.json(docs)
    }
}