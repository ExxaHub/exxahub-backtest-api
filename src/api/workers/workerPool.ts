import os from 'os';
import {type Request, type Response} from 'express'

class WorkerPool {
    private maxWorkers: number;
    private workers: Worker[] = [];
    private taskQueue: { req: Request, res: Response }[] = [];

    private workerPath = './src/api/workers/backtester.ts'

    constructor() {
        this.maxWorkers = os.cpus().length ?? 1;   
    }

    init() {
        for (let i = 0; i < this.maxWorkers; i++) {
            const worker = new Worker(this.workerPath);
            this.workers.push(worker);
        }
        console.log('Worker pool initialized with', this.maxWorkers, 'workers');
    }

    queue(req: Request, res: Response) {
        this.taskQueue.push({ req, res });
        this.processNextTask();
    }

    private processNextTask() {
        if (this.taskQueue.length === 0) {
          return 
        }
      
        if (this.workers.length === 0) {
          return 
        }
      
        const task = this.taskQueue.shift(); // Get the next task
        
        console.log('Queue depth:', this.taskQueue.length);
      
        if (!task) {
          return
        }
      
        const { req, res } = task;
      
        const worker = this.workers.shift(); // Get an available worker
      
        if (!worker) {  
          throw new Error('No worker available');
        }
      
        worker.postMessage(req.body);
      
        worker.onmessage = (event: MessageEvent) => {
            this.workers.push(worker); // Return worker to the pool
      
            if (event.type === 'error') {
                res.status(500).send(event.data.message);
            } else {
                res.json(event.data); // Send response back to the client
            }
        
            this.processNextTask(); // Process the next task in the queue
        };
      
        worker.addEventListener('close', (event) => {
          if (event.code !== 0) console.error(`Worker stopped with exit code ${event.code}}`);
        });
    }
}

export const workerPool = new WorkerPool()