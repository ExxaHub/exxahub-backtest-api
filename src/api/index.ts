import express, { type Request, type Response } from 'express'

const maxWorkers = 4; // Define the size of the worker pool
const workers: Worker[] = []; // Array to hold worker threads
const taskQueue: { req: Request, res: Response }[] = []; // Queue to hold pending requests

// Initialize the worker pool
for (let i = 0; i < maxWorkers; i++) {
  const worker = new Worker('./src/api/worker.ts');
  workers.push(worker);
}

// Function to process the next task in the queue
function processNextTask() {
  if (taskQueue.length === 0) {
    return 
  }

  if (workers.length === 0) {
    return
  }

  const task = taskQueue.shift(); // Get the next task

  if (!task) {
    return
  }

  const { req, res } = task;

  const worker = workers.shift(); // Get an available worker

  if (!worker) {  
    throw new Error('No worker available');
  }

  worker.postMessage(req.body);

  worker.onmessage = (event: MessageEvent) => {
    workers.push(worker); // Return worker to the pool

    if (event.type === 'error') {
      res.status(500).send(event.data.message);
    } else {
      res.json(event.data); // Send response back to the client
    }

    processNextTask(); // Process the next task in the queue
  };

  worker.addEventListener('close', (event) => {
    if (event.code !== 0) console.error(`Worker stopped with exit code ${event.code}}`);
  });
}




import { handleRequest } from './utils'

const AdapterController = () => import('./controllers/AdapterController')
const BacktestController = () => import('./controllers/BacktestController')
const DocsController = () => import('./controllers/DocsController')
const HealthController = () => import('./controllers/HealthController')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json());

app.get('/api/v1/health', handleRequest(HealthController, 'show'))

app.get('/api/v1/docs', handleRequest(DocsController, 'show'))

app.post('/api/v1/backtests', handleRequest(BacktestController, 'create'))

app.post('/api/v1/backtests-worker', (req, res) => {
  taskQueue.push({ req, res }); // Add the request to the queue
  processNextTask(); // Attempt to process the task
});

app.post('/api/v1/adapters/symphony', handleRequest(AdapterController, 'symphony'))

app.listen(port, () => {
  console.log(`Exxa Backtester listening on port ${port}`)
})