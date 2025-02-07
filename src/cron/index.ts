import { FetchLatestBars } from './jobs/FetchLatestBars';

console.log('Running cron scheduler...');

const jobs = [
    new FetchLatestBars()
]

for (const job of jobs) {
    if (job.shouldExecute()) {
        console.log(`Running job: ${job.constructor.name}`)
        await job.run()
    }
}

