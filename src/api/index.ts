import express from 'express'
import { handleRequest } from './utils'

const HealthController = () => import('./controllers/HealthController')
const BacktestController = () => import('./controllers/BacktestController')
const AdapterController = () => import('./controllers/AdapterController')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json());

app.get('/api/v1/health', handleRequest(HealthController, 'show'))

app.post('/api/v1/backtests', handleRequest(BacktestController, 'create'))

app.post('/api/v1/adapters/symphony', handleRequest(AdapterController, 'symphony'))

app.listen(port, () => {
  console.log(`Exxa Backtester listening on port ${port}`)
})