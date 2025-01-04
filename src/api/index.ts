import express, {type Request, type Response, type NextFunction} from 'express'

const HealthController = () => import('./controllers/HealthController')
const BacktestController = () => import('./controllers/BacktestController')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json());

const handle = (moduleLoader: any, method: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const module = await moduleLoader();
        const ControllerClass = module.default;
        const controllerInstance = new ControllerClass();
        if (typeof controllerInstance[method] === 'function') {
            return controllerInstance[method](req, res, next);
        } else {
            throw new Error(`Method "${method}" not found in controller`);
        }
    } catch (error) {
        next(error);
    }
};

app.get('/api/v1/health', handle(HealthController, 'show'))

app.post('/api/v1/backtest', handle(BacktestController, 'create'))

app.listen(port, () => {
  console.log(`Exxa Backtester listening on port ${port}`)
})