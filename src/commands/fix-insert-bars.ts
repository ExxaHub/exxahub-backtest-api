import { OhlcBarService } from '../services/OhlcBarService';

const ohlcBarService = new OhlcBarService();

const run = async () => {
    await ohlcBarService.bulkInsert('AACG', [
        {
            date: '2021-06-18',
            open: 2.9700,
            high: 3.1400,
            low: 2.9300,
            close: 2.9900,
            volume: 102900
        },
        {
            date: '2021-06-21',
            open: 3.0700,
            high: 3.0900,
            low: 2.9100,
            close: 3.0200,
            volume: 69700
        },
        {
            date: '2021-06-22',
            open: 2.9200,
            high: 3.0100,
            low: 2.8000,
            close: 2.8300,
            volume: 70800
        },
        {
            date: '2021-06-23',
            open: 2.8700,
            high: 3.0400,
            low: 2.8300,
            close: 2.9700,
            volume: 94600
        }
    ]);

    console.log(`Done.`)
}
  
await run()

process.exit(0);