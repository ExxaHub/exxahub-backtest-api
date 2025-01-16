import { type Request, type Response, type NextFunction } from 'express'
import { HttpError } from './errors'
const os = require('os');

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<any>

const maxWorkers = os.cpus().length ?? 1; // Define the size of the worker pool
const workers: Worker[] = []; // Array to hold worker threads
const taskQueue: { req: Request, res: Response, controller: string, method: string }[] = []; // Queue to hold pending requests

// Initialize the worker pool
for (let i = 0; i < maxWorkers; i++) {
  const worker = new Worker('./src/api/worker.ts');
  workers.push(worker);
}

// Function to process the next task in the queue
function processNextTask() {
    console.log('>>> Process next task A')
    if (taskQueue.length === 0) {
      return 
    }
    console.log('>>> Process next task B')
    if (workers.length === 0) {
      return
    }
    console.log('>>> Process next task C')
    const task = taskQueue.shift(); // Get the next task
  
    console.log('>>> Process next task D')
    if (!task) {
      return
    }
  
    console.log('>>> Process next task E')
    const { req, res, controller, method } = task;
  
    console.log('>>> Process next task F')
    const worker = workers.shift(); // Get an available worker
  
    console.log('>>> Process next task G')
    if (!worker) {  
      throw new Error('No worker available');
    }
  
    console.log('>>> Process next task H', { controller, method, body: req.body })
    worker.postMessage({ controller, method, body: req.body });
  
    console.log('>>> Process next task I')
    worker.onmessage = (event: MessageEvent) => {
        console.log('????????')
      workers.push(worker); // Return worker to the pool
  
      if (event.type === 'error') {
        res.status(500).send(event.data.message);
      } else {
        res.json(event.data); // Send response back to the client
      }
  
      processNextTask(); // Process the next task in the queue
    };
  
    console.log('>>> Process next task J')
    worker.addEventListener('close', (event) => {
      if (event.code !== 0) console.error(`Worker stopped with exit code ${event.code}}`);
    });
    console.log('>>> Process next task K')
  }

export const handleRequest = (controller: string, method: string) => async (req: Request, res: Response, next: NextFunction) => {
    console.log('>>> D')
    try {
        console.log('>>> 1')
        taskQueue.push({ controller, method, req, res });
        processNextTask();
    } catch (e) {
        console.log('>>> 5')
        const error = (e as HttpError)
        console.error(error)
        res.status(error.statusCode).json({
            message: error.message,
            errors: error.errors
        })
    }

    console.log('>>> 6')
}