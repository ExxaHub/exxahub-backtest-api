import {type Request, type Response} from 'express'
import { workerPool } from '../workers/workerPool';

// const taskQueue: { req: Request, res: Response }[] = []; // Queue to hold pending requests
// const workers = workerPool.getWorkers(); // Get the worker pool

// // Function to process the next task in the queue
// function processNextTask() {
//   if (taskQueue.length === 0) {
//     return 
//   }

//   if (workers.length === 0) {
//     return 
//   }

//   const task = taskQueue.shift(); // Get the next task
  
//   console.log('Queue depth:', taskQueue.length);

//   if (!task) {
//     return
//   }

//   const { req, res } = task;

//   const worker = workers.shift(); // Get an available worker

//   if (!worker) {  
//     throw new Error('No worker available');
//   }

//   worker.postMessage(req.body);

//   worker.onmessage = (event: MessageEvent) => {
//     workers.push(worker); // Return worker to the pool

//     if (event.type === 'error') {
//       res.status(500).send(event.data.message);
//     } else {
//       res.json(event.data); // Send response back to the client
//     }

//     processNextTask(); // Process the next task in the queue
//   };

//   worker.addEventListener('close', (event) => {
//     if (event.code !== 0) console.error(`Worker stopped with exit code ${event.code}}`);
//   });
// }

export default class BacktestController {
    async create(req: Request, res: Response) {
      workerPool.queue(req, res); 
      // taskQueue.push({ req, res }); // Add the request to the queue
      // processNextTask(); // Attempt to process the task
    }
}