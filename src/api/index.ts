import express, { type Request, type Response } from 'express'
import { handleRequest } from './utils'
import { workerPool } from './workers/workerPool'

const AdapterController = () => import('./controllers/AdapterController')
const BacktestController = () => import('./controllers/BacktestController')
const DocsController = () => import('./controllers/DocsController')
const HealthController = () => import('./controllers/HealthController')

workerPool.init()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json());

app.get('/api/v1/health', handleRequest(HealthController, 'show'))

app.get('/api/v1/docs', handleRequest(DocsController, 'show'))

app.post('/api/v1/backtests', handleRequest(BacktestController, 'create'))

app.post('/api/v1/adapters/symphony', handleRequest(AdapterController, 'symphony'))

app.listen(port, () => {
  console.log(`Exxa Backtester listening on port ${port}`)
})