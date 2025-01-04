import express, {type Request, type Response, type NextFunction} from 'express'
import type { HttpError } from './errors'

const HealthController = () => import('./controllers/HealthController')
const BacktestController = () => import('./controllers/BacktestController')
const AdapterController = () => import('./controllers/AdapterController')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json());

const handle = (moduleLoader: any, method: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const module = await moduleLoader();
        const ControllerClass = module.default;
        const controllerInstance = new ControllerClass();
        if (typeof controllerInstance[method] === 'function') {
            return await controllerInstance[method](req, res, next);
        } else {
            throw new Error(`Method "${method}" not found in controller`);
        }
    } catch (e) {
        const error = (e as HttpError)
        return res.status(error.statusCode).json({
            error: error.message
        })
    }
};

app.get('/api/v1/health', handle(HealthController, 'show'))

app.post('/api/v1/backtests', handle(BacktestController, 'create'))

app.post('/api/v1/adapters/symphony', handle(AdapterController, 'symphony'))

app.listen(port, () => {
  console.log(`Exxa Backtester listening on port ${port}`)
})