import os from 'os';

class WorkerPool {
    private maxWorkers: number;
    private workers: Worker[] = []; // Array to hold worker threads

    constructor() {
        this.maxWorkers = os.cpus().length ?? 1;   
    }

    init(workerPath: string) {
        // Initialize the worker pool
        for (let i = 0; i < this.maxWorkers; i++) {
            const worker = new Worker(workerPath);
            this.workers.push(worker);
        }
    }

    getWorkers() {
        return this.workers;
    }
}

export const workerPool = new WorkerPool()